<?php
/**
 * ParkFlow - Endpoint Salida y Cobro (Checkout)
 * Liquida estancia de vehículo, registra pago en MySQL y libera la celda
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
$cellIdOrPlate = strtoupper(trim($input['cellIdOrPlate'] ?? ''));
$paymentMethod = trim($input['paymentMethod'] ?? 'Efectivo');
$amountPaidCustom = isset($input['amountPaid']) ? (float)$input['amountPaid'] : null;

if (empty($cellIdOrPlate)) {
    sendError("Ingrese número de celda o placa para liquidar");
}

try {
    $pdo->beginTransaction();

    // 1. Buscar celda ocupada por ID o Placa
    $findStmt = $pdo->prepare("
        SELECT * FROM `cells` 
        WHERE `status` = 'occupied' 
          AND (UPPER(`id`) = ? OR UPPER(`plate`) = ?)
        LIMIT 1
    ");
    $findStmt->execute([$cellIdOrPlate, $cellIdOrPlate]);
    $cell = $findStmt->fetch();

    if (!$cell) {
        $pdo->rollBack();
        sendError("No se encontró ningún vehículo activo con la celda o placa '{$cellIdOrPlate}'", 404);
    }

    $cellId = $cell['id'];
    $plate = $cell['plate'];
    $category = $cell['category'];
    $ticketId = $cell['ticket_id'] ?: ('#PF-' . date('Y') . '-' . mt_rand(10000, 99999));
    $ratePerHour = (float)$cell['rate_per_hour'];

    // 2. Obtener esquema de tarifa para calcular liquidación
    $tStmt = $pdo->prepare("SELECT * FROM `tariffs` WHERE `category` = ?");
    $tStmt->execute([$category]);
    $tariff = $tStmt->fetch();
    $minFraction = $tariff ? (float)$tariff['min_fraction'] : 2500.00;

    $now = new DateTime();
    $timeStr = $now->format('h:i A');
    $dateTimeStr = $now->format('d/m/Y H:i:s');
    $exitTimestamp = time() * 1000;
    $entryTimestamp = !empty($cell['entry_timestamp']) ? (int)$cell['entry_timestamp'] : ($exitTimestamp - 3600000);

    // Calcular duración y cobro
    $diffSec = max(0, ($exitTimestamp - $entryTimestamp) / 1000);
    $hours = floor($diffSec / 3600);
    $minutes = floor(($diffSec % 3600) / 60);
    $durationStr = "{$hours}h " . str_pad($minutes, 2, '0', STR_PAD_LEFT) . "m";

    $calculatedTotal = 0;
    if ($diffSec < 900 && $hours == 0 && $minutes <= 15) {
        // Periodo de gracia (15 min)
        $calculatedTotal = 0;
        $durationStr .= " (Gracia)";
    } elseif ($hours == 0) {
        $calculatedTotal = $minFraction;
    } else {
        $fractionPart = ($minutes > 0) ? ($minutes <= 30 ? $minFraction : $ratePerHour) : 0;
        $calculatedTotal = ($hours * $ratePerHour) + $fractionPart;
    }

    $finalTotal = ($amountPaidCustom !== null) ? $amountPaidCustom : $calculatedTotal;

    // 3. Actualizar transacción en MySQL (o crear si no existía)
    $txCheck = $pdo->prepare("SELECT `id` FROM `transactions` WHERE `id` = ? OR (`plate` = ? AND `status` = 'En Curso') LIMIT 1");
    $txCheck->execute([$ticketId, $plate]);
    $existingTx = $txCheck->fetch();

    if ($existingTx) {
        $updateTx = $pdo->prepare("
            UPDATE `transactions`
            SET `exit_time` = ?,
                `exit_timestamp` = ?,
                `duration` = ?,
                `total_paid` = ?,
                `payment_method` = ?,
                `status` = 'Completado'
            WHERE `id` = ?
        ");
        $updateTx->execute([
            $dateTimeStr,
            $exitTimestamp,
            $durationStr,
            $finalTotal,
            $paymentMethod,
            $existingTx['id']
        ]);
    } else {
        $insTx = $pdo->prepare("
            INSERT INTO `transactions` (`id`, `plate`, `vehicle_type`, `cell_id`, `entry_time`, `entry_timestamp`, `exit_time`, `exit_timestamp`, `duration`, `snapshot_rate`, `total_paid`, `payment_method`, `operator`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'T-01 (Admin)', 'Completado')
        ");
        $insTx->execute([
            $ticketId,
            $plate,
            $category,
            $cellId,
            $cell['entry_time'] ?: 'Anterior',
            $entryTimestamp,
            $dateTimeStr,
            $exitTimestamp,
            $durationStr,
            $ratePerHour,
            $finalTotal,
            $paymentMethod
        ]);
    }

    // 4. Insertar movimiento de Salida
    $movementId = 'mov-' . time() . '-' . mt_rand(100, 999);
    $insMov = $pdo->prepare("
        INSERT INTO `movements` (`id`, `ticket_id`, `plate`, `vehicle_type`, `cell_id`, `type`, `time`, `timestamp`, `amount`)
        VALUES (?, ?, ?, ?, ?, 'Salida', ?, ?, ?)
    ");
    $insMov->execute([
        $movementId,
        $ticketId,
        $plate,
        $category,
        $cellId,
        $timeStr,
        $exitTimestamp,
        $finalTotal
    ]);

    // 5. Liberar Celda
    $freeCell = $pdo->prepare("
        UPDATE `cells`
        SET `status` = 'free',
            `plate` = NULL,
            `entry_time` = NULL,
            `entry_timestamp` = NULL,
            `duration` = NULL,
            `current_total` = 0.00,
            `ticket_id` = NULL,
            `notes` = NULL
        WHERE `id` = ?
    ");
    $freeCell->execute([$cellId]);

    $pdo->commit();

    sendResponse([
        'success' => true,
        'message' => "¡Salida registrada con éxito! Celda {$cellId} liberada.",
        'cellId' => $cellId,
        'plate' => $plate,
        'ticketId' => $ticketId,
        'duration' => $durationStr,
        'total' => $finalTotal,
        'paymentMethod' => $paymentMethod,
        'exitTime' => $timeStr,
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendError("Error al procesar la salida: " . $e->getMessage(), 500);
}
