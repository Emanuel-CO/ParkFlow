<?php
/**
 * ParkFlow - Endpoint Historial de Transacciones / Auditoría
 * GET: Obtener transacciones registradas en MySQL
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);
if (!$pdo) {
    sendError("Sin conexión a la base de datos MySQL en XAMPP", 500);
}

try {
    $limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 100;
    $stmt = $pdo->prepare("SELECT * FROM `transactions` ORDER BY `entry_timestamp` DESC LIMIT ?");
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $rows = $stmt->fetchAll();
    $transactions = [];

    foreach ($rows as $r) {
        $transactions[] = [
            'id' => $r['id'],
            'plate' => $r['plate'],
            'vehicleType' => $r['vehicle_type'],
            'cellId' => $r['cell_id'],
            'entryTime' => $r['entry_time'],
            'entryTimestamp' => (int)$r['entry_timestamp'],
            'exitTime' => $r['exit_time'] ?? null,
            'exitTimestamp' => !empty($r['exit_timestamp']) ? (int)$r['exit_timestamp'] : null,
            'duration' => $r['duration'],
            'snapshotRate' => (float)$r['snapshot_rate'],
            'totalPaid' => (float)$r['total_paid'],
            'paymentMethod' => $r['payment_method'],
            'operator' => $r['operator'],
            'status' => $r['status'],
            'notes' => $r['notes'] ?? null,
        ];
    }

    sendResponse(['success' => true, 'data' => $transactions, 'count' => count($transactions)]);
} catch (Exception $e) {
    sendError("Error al consultar transacciones: " . $e->getMessage(), 500);
}
