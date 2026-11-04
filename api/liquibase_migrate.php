<?php
/**
 * ==============================================================================
 * PARKFLOW 2099 - API REST DE CONTROL DE MIGRACIONES LIQUIBASE
 * Endpoint: /parkflow-api/liquibase_migrate.php
 * Acciones:
 *   - GET ?action=status : Consulta el estado de migraciones y tablas DATABASECHANGELOG
 *   - POST / GET ?action=migrate : Ejecuta las migraciones pendientes con Liquibase
 * ==============================================================================
 */

require_once __DIR__ . '/config/db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';

if ($action === 'migrate') {
    // Reutilizar el motor de migraciones
    $runnerScript = dirname(__DIR__) . '/liquibase/run_migrations.php';
    if (!file_exists($runnerScript)) {
        sendError("No se encontró el script del motor de migraciones Liquibase.", 500);
    }
    ob_start();
    require $runnerScript;
    $output = ob_get_clean();
    
    // Si run_migrations ya emitió JSON, salir
    if (!empty($output)) {
        echo $output;
    }
    exit();
}

if ($action === 'status') {
    $pdo = getDbConnection(true);
    if (!$pdo) {
        sendError("No se pudo conectar a la base de datos `parkflow_db`. Verifica que MySQL esté corriendo en XAMPP.", 500);
    }

    try {
        // Verificar si existen tablas de Liquibase
        $hasChangelog = (bool)$pdo->query("SHOW TABLES LIKE 'DATABASECHANGELOG'")->fetchColumn();
        $hasLock = (bool)$pdo->query("SHOW TABLES LIKE 'DATABASECHANGELOGLOCK'")->fetchColumn();

        $executedChangesets = [];
        $isLocked = false;
        $lockedBy = null;

        if ($hasChangelog) {
            $stmt = $pdo->query("SELECT `ID`, `AUTHOR`, `FILENAME`, `DATEEXECUTED`, `ORDEREXECUTED`, `EXECTYPE`, `MD5SUM`, `COMMENTS`, `DEPLOYMENT_ID` FROM `DATABASECHANGELOG` ORDER BY `ORDEREXECUTED` ASC");
            $executedChangesets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($hasLock) {
            $lockRow = $pdo->query("SELECT `LOCKED`, `LOCKGRANTED`, `LOCKEDBY` FROM `DATABASECHANGELOGLOCK` WHERE `ID` = 1")->fetch(PDO::FETCH_ASSOC);
            if ($lockRow) {
                $isLocked = (bool)$lockRow['LOCKED'];
                $lockedBy = $lockRow['LOCKEDBY'];
            }
        }

        $tableCounts = [
            'cells' => (int)$pdo->query("SELECT COUNT(*) FROM `cells`")->fetchColumn(),
            'tariffs' => (int)$pdo->query("SELECT COUNT(*) FROM `tariffs`")->fetchColumn(),
            'movements' => (int)$pdo->query("SELECT COUNT(*) FROM `movements`")->fetchColumn(),
            'transactions' => (int)$pdo->query("SELECT COUNT(*) FROM `transactions`")->fetchColumn(),
            'users' => (int)$pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn(),
        ];

        sendResponse([
            'success' => true,
            'liquibase' => [
                'installed' => $hasChangelog && $hasLock,
                'changelog_table' => $hasChangelog,
                'lock_table' => $hasLock,
                'is_locked' => $isLocked,
                'locked_by' => $lockedBy,
                'executed_count' => count($executedChangesets),
                'history' => $executedChangesets
            ],
            'database' => 'parkflow_db',
            'tables' => $tableCounts
        ]);

    } catch (Exception $e) {
        sendError("Error consultando estado de Liquibase: " . $e->getMessage(), 500);
    }
}

sendError("Acción desconocida. Acciones válidas: 'status', 'migrate'.", 400);
