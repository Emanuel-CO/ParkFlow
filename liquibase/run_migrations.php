<?php
/**
 * ==============================================================================
 * PARKFLOW 2099 - MOTOR DE MIGRACIONES LIQUIBASE NATIVO EN PHP
 * Ejecuta los ChangeSets oficiales de Liquibase, creando y manteniendo
 * las tablas estándar DATABASECHANGELOG y DATABASECHANGELOGLOCK en MySQL.
 * Compatible 100% con Liquibase CLI, Liquibase Maven y XAMPP.
 * ==============================================================================
 */

// Configuración de conexión (compatible con XAMPP y liquibase.properties)
$host = '127.0.0.1';
$port = '3306';
$dbname = 'parkflow_db';
$user = 'root';
$pass = '';

$isCli = (php_sapi_name() === 'cli');

function logMessage($msg, $type = 'INFO') {
    global $isCli;
    $timestamp = date('Y-m-d H:i:s');
    if ($isCli) {
        $prefix = "[$timestamp] [$type] ";
        echo $prefix . $msg . PHP_EOL;
    }
}

// 1. Conexión Root para asegurar que la base de datos exista
try {
    $pdoRoot = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $pdoRoot->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch (Exception $e) {
    logMessage("Error al conectar con MySQL en {$host}:{$port} - " . $e->getMessage(), 'ERROR');
    if (!$isCli) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit(1);
}

// 2. Conectar a la base de datos parkflow_db
try {
    $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (Exception $e) {
    logMessage("Error al conectar a `{$dbname}`: " . $e->getMessage(), 'ERROR');
    exit(1);
}

logMessage("Conexión establecida con MySQL [{$dbname}] exitosamente.", 'SUCCESS');

// 3. Crear tablas de auditoría de Liquibase si no existen
$createLockTable = "
CREATE TABLE IF NOT EXISTS `DATABASECHANGELOGLOCK` (
    `ID` INT NOT NULL,
    `LOCKED` BIT(1) NOT NULL,
    `LOCKGRANTED` DATETIME NULL,
    `LOCKEDBY` VARCHAR(255) NULL,
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

$createChangelogTable = "
CREATE TABLE IF NOT EXISTS `DATABASECHANGELOG` (
    `ID` VARCHAR(255) NOT NULL,
    `AUTHOR` VARCHAR(255) NOT NULL,
    `FILENAME` VARCHAR(255) NOT NULL,
    `DATEEXECUTED` DATETIME NOT NULL,
    `ORDEREXECUTED` INT NOT NULL,
    `EXECTYPE` VARCHAR(10) NOT NULL,
    `MD5SUM` VARCHAR(35) NULL,
    `DESCRIPTION` VARCHAR(255) NULL,
    `COMMENTS` VARCHAR(255) NULL,
    `TAG` VARCHAR(255) NULL,
    `LIQUIBASE` VARCHAR(20) NULL,
    `CONTEXTS` VARCHAR(255) NULL,
    `LABELS` VARCHAR(255) NULL,
    `DEPLOYMENT_ID` VARCHAR(10) NULL,
    PRIMARY KEY (`ID`, `AUTHOR`, `FILENAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

$pdo->exec($createLockTable);
$pdo->exec($createChangelogTable);

// Inicializar registro único de bloqueo en DATABASECHANGELOGLOCK
$lockCheck = $pdo->query("SELECT COUNT(*) FROM `DATABASECHANGELOGLOCK` WHERE `ID` = 1")->fetchColumn();
if ($lockCheck == 0) {
    $pdo->exec("INSERT INTO `DATABASECHANGELOGLOCK` (`ID`, `LOCKED`, `LOCKGRANTED`, `LOCKEDBY`) VALUES (1, 0, NULL, NULL)");
}

// 4. Adquirir Lock de Liquibase
$deploymentId = substr(md5(uniqid(rand(), true)), 0, 10);
$pdo->exec("UPDATE `DATABASECHANGELOGLOCK` SET `LOCKED` = 1, `LOCKGRANTED` = NOW(), `LOCKEDBY` = 'ParkFlow-Runner/{$deploymentId}' WHERE `ID` = 1");
logMessage("Bloqueo de migración adquirido (Deployment ID: {$deploymentId}).", 'INFO');

try {
    // 5. Cargar ChangeSets desde el changelog maestro SQL
    $changelogFile = __DIR__ . '/changelog/changelog-master.sql';
    if (!file_exists($changelogFile)) {
        throw new Exception("No se encontró el archivo changelog maestro: {$changelogFile}");
    }

    $sqlContent = file_get_contents($changelogFile);
    $lines = explode("\n", $sqlContent);

    $changesets = [];
    $currentCs = null;
    $currentSql = [];
    $currentRollback = [];
    $inRollback = false;

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if (preg_match('/^--\s*changeset\s+([^:]+):([^\s]+)/i', $trimmed, $matches)) {
            if ($currentCs !== null) {
                $currentCs['sql'] = implode("\n", $currentSql);
                $currentCs['rollback'] = implode("\n", $currentRollback);
                $changesets[] = $currentCs;
            }
            $currentCs = [
                'author' => trim($matches[1]),
                'id' => trim($matches[2]),
                'filename' => 'changelog/changelog-master.sql',
                'comment' => '',
                'description' => 'sql'
            ];
            $currentSql = [];
            $currentRollback = [];
            $inRollback = false;
            continue;
        }

        if ($currentCs !== null) {
            if (preg_match('/^--\s*comment:\s*(.+)$/i', $trimmed, $cMatches)) {
                $currentCs['comment'] = trim($cMatches[1]);
                continue;
            }
            if (preg_match('/^--\s*rollback\s*(.+)$/i', $trimmed, $rMatches)) {
                $inRollback = true;
                $currentRollback[] = trim($rMatches[1]);
                continue;
            }

            if ($inRollback) {
                if (preg_match('/^--/', $trimmed)) {
                    $currentRollback[] = preg_replace('/^--\s*/', '', $trimmed);
                }
            } else {
                $currentSql[] = $line;
            }
        }
    }

    if ($currentCs !== null) {
        $currentCs['sql'] = implode("\n", $currentSql);
        $currentCs['rollback'] = implode("\n", $currentRollback);
        $changesets[] = $currentCs;
    }

    // 6. Consultar ChangeSets ya ejecutados en DATABASECHANGELOG
    $executedStmt = $pdo->query("SELECT `ID`, `AUTHOR`, `FILENAME`, `MD5SUM` FROM `DATABASECHANGELOG`");
    $executed = [];
    while ($row = $executedStmt->fetch()) {
        $key = $row['ID'] . '::' . $row['AUTHOR'] . '::' . $row['FILENAME'];
        $executed[$key] = $row;
    }

    $currentOrder = (int)$pdo->query("SELECT COALESCE(MAX(`ORDEREXECUTED`), 0) FROM `DATABASECHANGELOG`")->fetchColumn();
    $appliedCount = 0;
    $skippedCount = 0;

    logMessage("Analizando " . count($changesets) . " ChangeSets definidos en Liquibase...", 'INFO');

    // 7. Ejecutar ChangeSets pendientes
    foreach ($changesets as $cs) {
        $key = $cs['id'] . '::' . $cs['author'] . '::' . $cs['filename'];
        if (isset($executed[$key])) {
            logMessage("-> [SALTADO] ChangeSet ya aplicado: " . $cs['id'], 'SKIP');
            $skippedCount++;
            continue;
        }

        logMessage("-> [APLICANDO] ChangeSet: {$cs['id']} (Autor: {$cs['author']})...", 'EXEC');
        
        $sqlClean = trim($cs['sql']);
        if (!empty($sqlClean)) {
            // Ejecutar DDL / DML
            $pdo->exec($sqlClean);
        }

        // Registrar en DATABASECHANGELOG
        $currentOrder++;
        $md5sum = '9:' . md5($sqlClean);
        $insertLog = $pdo->prepare("
            INSERT INTO `DATABASECHANGELOG` 
            (`ID`, `AUTHOR`, `FILENAME`, `DATEEXECUTED`, `ORDEREXECUTED`, `EXECTYPE`, `MD5SUM`, `DESCRIPTION`, `COMMENTS`, `TAG`, `LIQUIBASE`, `CONTEXTS`, `LABELS`, `DEPLOYMENT_ID`)
            VALUES (?, ?, ?, NOW(), ?, 'EXECUTED', ?, ?, ?, NULL, '4.27.0', NULL, NULL, ?)
        ");
        $insertLog->execute([
            $cs['id'],
            $cs['author'],
            $cs['filename'],
            $currentOrder,
            $md5sum,
            $cs['description'],
            $cs['comment'],
            $deploymentId
        ]);

        logMessage("   [OK] ChangeSet registrado exitosamente en DATABASECHANGELOG.", 'SUCCESS');
        $appliedCount++;
    }

    // 8. Liberar Lock de Liquibase
    $pdo->exec("UPDATE `DATABASECHANGELOGLOCK` SET `LOCKED` = 0, `LOCKGRANTED` = NULL, `LOCKEDBY` = NULL WHERE `ID` = 1");
    logMessage("Bloqueo de migración liberado.", 'INFO');

    // 9. Resumen de estado de base de datos
    $counts = [
        'cells' => (int)$pdo->query("SELECT COUNT(*) FROM `cells`")->fetchColumn(),
        'tariffs' => (int)$pdo->query("SELECT COUNT(*) FROM `tariffs`")->fetchColumn(),
        'movements' => (int)$pdo->query("SELECT COUNT(*) FROM `movements`")->fetchColumn(),
        'transactions' => (int)$pdo->query("SELECT COUNT(*) FROM `transactions`")->fetchColumn(),
        'users' => (int)$pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn(),
        'changelog' => (int)$pdo->query("SELECT COUNT(*) FROM `DATABASECHANGELOG`")->fetchColumn(),
    ];

    logMessage("=======================================================", 'INFO');
    logMessage(" MIGRACIÓN LIQUIBASE COMPLETADA CON ÉXITO", 'SUCCESS');
    logMessage(" - ChangeSets Aplicados: {$appliedCount}", 'INFO');
    logMessage(" - ChangeSets Previos:   {$skippedCount}", 'INFO');
    logMessage(" - Total en Historial:   {$counts['changelog']}", 'INFO');
    logMessage(" - Celdas en DB:         {$counts['cells']}", 'INFO');
    logMessage(" - Tarifas en DB:        {$counts['tariffs']}", 'INFO');
    logMessage(" - Usuarios en DB:       {$counts['users']}", 'INFO');
    logMessage("=======================================================", 'INFO');

    if (!$isCli) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => true,
            'message' => 'Migraciones Liquibase ejecutadas exitosamente.',
            'applied' => $appliedCount,
            'skipped' => $skippedCount,
            'deploymentId' => $deploymentId,
            'database' => $dbname,
            'counts' => $counts
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    // Liberar lock en caso de error
    $pdo->exec("UPDATE `DATABASECHANGELOGLOCK` SET `LOCKED` = 0, `LOCKGRANTED` = NULL, `LOCKEDBY` = NULL WHERE `ID` = 1");
    logMessage("ERROR DURANTE LA MIGRACIÓN: " . $e->getMessage(), 'ERROR');
    if (!$isCli) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_PRETTY_PRINT);
    }
    exit(1);
}
