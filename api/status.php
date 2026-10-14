<?php
/**
 * ParkFlow - Endpoint Estado de Servidor y Conexión XAMPP MySQL
 * Permite al frontend validar conectividad, versión y métricas en vivo
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);

if (!$pdo) {
    sendResponse([
        'connected' => false,
        'message' => 'Desconectado de MySQL. Asegúrese de que MySQL esté activo en XAMPP Control Panel.',
        'php_version' => PHP_VERSION,
        'database' => $db_name,
        'host' => "{$db_host}:{$db_port}",
    ], 200); // 200 para que el frontend pueda leer el JSON sin lanzar excepción de red
}

try {
    $occupiedCount = (int)$pdo->query("SELECT COUNT(*) FROM `cells` WHERE `status` = 'occupied'")->fetchColumn();
    $freeCount = (int)$pdo->query("SELECT COUNT(*) FROM `cells` WHERE `status` = 'free'")->fetchColumn();
    $blockedCount = (int)$pdo->query("SELECT COUNT(*) FROM `cells` WHERE `status` = 'blocked'")->fetchColumn();
    $totalCells = $occupiedCount + $freeCount + $blockedCount;

    $todayRevenue = (float)$pdo->query("SELECT COALESCE(SUM(`total_paid`), 0) FROM `transactions` WHERE `status` = 'Completado'")->fetchColumn();
    $entriesCount = (int)$pdo->query("SELECT COUNT(*) FROM `movements` WHERE `type` = 'Entrada'")->fetchColumn();

    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    sendResponse([
        'connected' => true,
        'message' => 'Conexión exitosa con XAMPP MySQL',
        'database' => $db_name,
        'host' => "{$db_host}:{$db_port}",
        'php_version' => PHP_VERSION,
        'tables' => $tables,
        'metrics' => [
            'totalCells' => $totalCells,
            'occupiedCells' => $occupiedCount,
            'freeCells' => $freeCount,
            'blockedCells' => $blockedCount,
            'occupancyPercent' => $totalCells > 0 ? round(($occupiedCount / $totalCells) * 100) : 0,
            'todayRevenue' => $todayRevenue,
            'todayEntriesCount' => $entriesCount,
        ]
    ]);
} catch (Exception $e) {
    sendResponse([
        'connected' => false,
        'message' => 'Error al consultar métricas de MySQL: ' . $e->getMessage(),
        'database' => $db_name,
    ], 200);
}
