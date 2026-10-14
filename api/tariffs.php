<?php
/**
 * ParkFlow - Endpoint Esquema de Tarifas
 * GET: Obtener lista de tarifas por categoría
 * POST: Actualizar valores de tarifa (Tarifa por hora y fracción)
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);
if (!$pdo) {
    sendError("Sin conexión a la base de datos MySQL en XAMPP", 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM `tariffs` ORDER BY `category` ASC");
        $tariffs = [];
        while ($row = $stmt->fetch()) {
            $tariffs[$row['category']] = [
                'category' => $row['category'],
                'ratePerHour' => (float)$row['rate_per_hour'],
                'minFraction' => (float)$row['min_fraction'],
                'capacity' => (int)$row['capacity'],
                'snapshotVersion' => $row['snapshot_version'] ?? 'v3.2',
            ];
        }
        sendResponse(['success' => true, 'data' => $tariffs]);
    } catch (Exception $e) {
        sendError("Error al consultar tarifas: " . $e->getMessage(), 500);
    }
}

if ($method === 'POST') {
    $input = getJsonInput();
    $category = trim($input['category'] ?? '');
    $newRate = isset($input['ratePerHour']) ? (float)$input['ratePerHour'] : null;
    $newMinFraction = isset($input['minFraction']) ? (float)$input['minFraction'] : null;

    if (empty($category) || $newRate === null || $newMinFraction === null) {
        sendError("Parámetros incompletos (category, ratePerHour, minFraction requeridos)");
    }

    try {
        $updateStmt = $pdo->prepare("
            UPDATE `tariffs`
            SET `rate_per_hour` = ?,
                `min_fraction` = ?
            WHERE `category` = ?
        ");
        $updateStmt->execute([$newRate, $newMinFraction, $category]);

        // Actualizar también la tarifa por hora en las celdas de esta categoría
        $updateCells = $pdo->prepare("UPDATE `cells` SET `rate_per_hour` = ? WHERE `category` = ? AND `status` != 'occupied'");
        $updateCells->execute([$newRate, $category]);

        sendResponse([
            'success' => true,
            'message' => "Tarifa para '{$category}' actualizada a \${$newRate}/h",
            'category' => $category,
            'ratePerHour' => $newRate,
            'minFraction' => $newMinFraction,
        ]);
    } catch (Exception $e) {
        sendError("Error al actualizar tarifas: " . $e->getMessage(), 500);
    }
}
