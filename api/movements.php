<?php
/**
 * ParkFlow - Endpoint Historial de Movimientos
 * GET: Obtener los últimos movimientos de entrada y salida
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);
if (!$pdo) {
    sendError("Sin conexión a la base de datos MySQL en XAMPP", 500);
}

try {
    $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;
    $stmt = $pdo->prepare("SELECT * FROM `movements` ORDER BY `timestamp` DESC LIMIT ?");
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $rows = $stmt->fetchAll();
    $movements = [];

    foreach ($rows as $r) {
        $movements[] = [
            'id' => $r['id'],
            'ticketId' => $r['ticket_id'],
            'plate' => $r['plate'],
            'vehicleType' => $r['vehicle_type'],
            'cellId' => $r['cell_id'],
            'type' => $r['type'],
            'time' => $r['time'],
            'timestamp' => (int)$r['timestamp'],
            'amount' => !empty($r['amount']) ? (float)$r['amount'] : 0.00,
        ];
    }

    sendResponse(['success' => true, 'data' => $movements, 'count' => count($movements)]);
} catch (Exception $e) {
    sendError("Error al consultar movimientos: " . $e->getMessage(), 500);
}
