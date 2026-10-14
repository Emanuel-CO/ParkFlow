<?php
/**
 * ParkFlow - Endpoint Celdas / Bahías
 * GET: Obtener todas las celdas con cálculo de tiempos y cobros en tiempo real
 * POST: Actualizar celda (Mantenimiento, desbloqueo, notas)
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);
if (!$pdo) {
    sendError("Sin conexión a la base de datos MySQL en XAMPP", 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM `cells` ORDER BY `zone` ASC, `id` ASC");
        $rawCells = $stmt->fetchAll();

        // Obtener tarifas para calcular totales en vivo
        $tariffs = [];
        $tStmt = $pdo->query("SELECT * FROM `tariffs`");
        while ($t = $tStmt->fetch()) {
            $tariffs[$t['category']] = $t;
        }

        $nowMs = time() * 1000;
        $cells = [];

        foreach ($rawCells as $c) {
            $cat = $c['category'];
            $rate = (float)$c['rate_per_hour'];
            $minFraction = isset($tariffs[$cat]) ? (float)$tariffs[$cat]['min_fraction'] : 2500;

            $entryTs = !empty($c['entry_timestamp']) ? (int)$c['entry_timestamp'] : null;
            $duration = $c['duration'];
            $currentTotal = !empty($c['current_total']) ? (float)$c['current_total'] : 0.00;

            if ($c['status'] === 'occupied' && $entryTs) {
                $diffSec = max(0, ($nowMs - $entryTs) / 1000);
                $hours = floor($diffSec / 3600);
                $minutes = floor(($diffSec % 3600) / 60);
                $duration = "{$hours}h " . str_pad($minutes, 2, '0', STR_PAD_LEFT) . "m";

                if ($hours == 0) {
                    $currentTotal = $minFraction;
                } else {
                    $fracPart = ($minutes > 0) ? ($minutes <= 30 ? $minFraction : $rate) : 0;
                    $currentTotal = ($hours * $rate) + $fracPart;
                }
            }

            $cells[] = [
                'id' => $c['id'],
                'zone' => $c['zone'],
                'category' => $c['category'],
                'status' => $c['status'],
                'plate' => $c['plate'] ?? null,
                'entryTime' => $c['entry_time'] ?? null,
                'entryTimestamp' => $entryTs,
                'duration' => $duration,
                'currentTotal' => $currentTotal,
                'ratePerHour' => $rate,
                'maintenanceReason' => $c['maintenance_reason'] ?? null,
                'notes' => $c['notes'] ?? null,
                'ticketId' => $c['ticket_id'] ?? null,
            ];
        }

        sendResponse(['success' => true, 'data' => $cells, 'count' => count($cells)]);
    } catch (Exception $e) {
        sendError("Error al consultar celdas: " . $e->getMessage(), 500);
    }
}

if ($method === 'POST') {
    $input = getJsonInput();
    $cellId = $input['cellId'] ?? null;
    $action = $input['action'] ?? 'maintenance'; // 'maintenance', 'update'

    if (!$cellId) {
        sendError("Identificador de celda requerido");
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM `cells` WHERE `id` = ?");
        $stmt->execute([$cellId]);
        $cell = $stmt->fetch();

        if (!$cell) {
            sendError("Celda no encontrada: {$cellId}", 404);
        }

        if ($action === 'maintenance') {
            $reason = trim($input['reason'] ?? 'MANTENIMIENTO PREVENTIVO');
            $newStatus = ($cell['status'] === 'blocked') ? 'free' : 'blocked';
            $maintenanceReason = ($newStatus === 'blocked') ? $reason : null;

            $updateStmt = $pdo->prepare("UPDATE `cells` SET `status` = ?, `maintenance_reason` = ? WHERE `id` = ?");
            $updateStmt->execute([$newStatus, $maintenanceReason, $cellId]);

            sendResponse([
                'success' => true,
                'message' => ($newStatus === 'blocked') ? "Celda {$cellId} puesta en mantenimiento" : "Celda {$cellId} habilitada para uso",
                'cellId' => $cellId,
                'status' => $newStatus,
                'maintenanceReason' => $maintenanceReason,
            ]);
        }

        sendError("Acción no soportada");
    } catch (Exception $e) {
        sendError("Error al actualizar celda: " . $e->getMessage(), 500);
    }
}
