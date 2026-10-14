<?php
/**
 * ParkFlow - Endpoint Registro de Entrada
 * Registra el ingreso de un vehículo, asigna celda y genera ticket y movimiento en MySQL
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);
if (!$pdo) {
    sendError("Sin conexión a la base de datos MySQL en XAMPP", 500);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Método no permitido. Utilice POST", 405);
}

$input = getJsonInput();
$plate = strtoupper(trim($input['plate'] ?? ''));
$category = trim($input['category'] ?? 'Carro');
$requestedCellId = trim($input['requestedCellId'] ?? '');
$notes = trim($input['notes'] ?? '');

if (empty($plate) || strlen($plate) < 3) {
    sendError("Ingrese una placa válida antes de continuar");
}

try {
    $pdo->beginTransaction();

    // 1. Anti-Passback: Comprobar si la placa ya se encuentra en patio
    $checkStmt = $pdo->prepare("SELECT `id`, `plate` FROM `cells` WHERE `status` = 'occupied' AND UPPER(`plate`) = ?");
    $checkStmt->execute([$plate]);
    $alreadyParked = $checkStmt->fetch();

    if ($alreadyParked) {
        $pdo->rollBack();
        sendError("ALERTA Anti-Passback: El vehículo {$plate} ya está registrado en la celda {$alreadyParked['id']}.", 409);
    }

    // 2. Obtener tarifa para esta categoría
    $tStmt = $pdo->prepare("SELECT * FROM `tariffs` WHERE `category` = ?");
    $tStmt->execute([$category]);
    $tariff = $tStmt->fetch();

    if (!$tariff) {
        // Fallback a Carro si no coincide
        $tStmt->execute(['Carro']);
        $tariff = $tStmt->fetch();
    }

    $ratePerHour = $tariff ? (float)$tariff['rate_per_hour'] : 4500.00;
    $minFraction = $tariff ? (float)$tariff['min_fraction'] : 2500.00;

    // 3. Determinar celda de destino
    $targetCell = null;
    if (!empty($requestedCellId)) {
        $cellStmt = $pdo->prepare("SELECT * FROM `cells` WHERE `id` = ? AND `status` = 'free'");
        $cellStmt->execute([$requestedCellId]);
        $targetCell = $cellStmt->fetch();
    }

    if (!$targetCell) {
        // Auto-asignación según categoría
        $targetZone = ($category === 'Moto' || $category === 'Bicicleta') ? 'Zona B' : 'Zona A';
        $cellStmt = $pdo->prepare("SELECT * FROM `cells` WHERE `zone` = ? AND `status` = 'free' ORDER BY `id` ASC LIMIT 1");
        $cellStmt->execute([$targetZone]);
        $targetCell = $cellStmt->fetch();
    }

    if (!$targetCell) {
        // Fallback: cualquier celda libre
        $cellStmt = $pdo->query("SELECT * FROM `cells` WHERE `status` = 'free' ORDER BY `id` ASC LIMIT 1");
        $targetCell = $cellStmt->fetch();
    }

    if (!$targetCell) {
        $pdo->rollBack();
        sendError("No hay celdas disponibles para esta categoría en este momento.", 409);
    }

    $cellId = $targetCell['id'];
    $now = new DateTime();
    $timeStr = $now->format('h:i A');
    $dateTimeStr = $now->format('d/m/Y H:i:s');
    $entryTimestamp = time() * 1000;
    $ticketId = '#PF-' . $now->format('Y') . '-' . mt_rand(10000, 99999);

    // 4. Actualizar celda a 'occupied'
    $updateCell = $pdo->prepare("
        UPDATE `cells` 
        SET `status` = 'occupied',
            `category` = ?,
            `plate` = ?,
            `entry_time` = ?,
            `entry_timestamp` = ?,
            `duration` = '0h 01m',
            `current_total` = ?,
            `rate_per_hour` = ?,
            `ticket_id` = ?,
            `notes` = ?
        WHERE `id` = ?
    ");
    $updateCell->execute([
        $category,
        $plate,
        $timeStr,
        $entryTimestamp,
        $minFraction,
        $ratePerHour,
        $ticketId,
        $notes,
        $cellId
    ]);

    // 5. Insertar movimiento de Entrada
    $movementId = 'mov-' . time() . '-' . mt_rand(100, 999);
    $insMov = $pdo->prepare("
        INSERT INTO `movements` (`id`, `ticket_id`, `plate`, `vehicle_type`, `cell_id`, `type`, `time`, `timestamp`, `amount`)
        VALUES (?, ?, ?, ?, ?, 'Entrada', ?, ?, 0.00)
    ");
    $insMov->execute([
        $movementId,
        $ticketId,
        $plate,
        $category,
        $cellId,
        $timeStr,
        $entryTimestamp
    ]);

    // 6. Insertar transacción preliminar
    $insTx = $pdo->prepare("
        INSERT INTO `transactions` (`id`, `plate`, `vehicle_type`, `cell_id`, `entry_time`, `entry_timestamp`, `duration`, `snapshot_rate`, `total_paid`, `payment_method`, `operator`, `status`, `notes`)
        VALUES (?, ?, ?, ?, ?, ?, 'En Curso', ?, 0.00, 'Pendiente', 'T-01 (Admin)', 'En Curso', ?)
    ");
    $insTx->execute([
        $ticketId,
        $plate,
        $category,
        $cellId,
        $dateTimeStr,
        $entryTimestamp,
        $ratePerHour,
        $notes
    ]);

    $pdo->commit();

    sendResponse([
        'success' => true,
        'message' => "¡Ingreso Registrado! Vehículo {$plate} asignado a celda {$cellId}",
        'ticketId' => $ticketId,
        'cellId' => $cellId,
        'plate' => $plate,
        'category' => $category,
        'entryTime' => $timeStr,
        'entryTimestamp' => $entryTimestamp,
        'ratePerHour' => $ratePerHour,
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendError("Error al registrar entrada: " . $e->getMessage(), 500);
}
