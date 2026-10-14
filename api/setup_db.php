<?php
/**
 * ParkFlow - Inicializador Automático de Base de Datos MySQL
 * Ejecuta creación de tablas y datos semilla iniciales
 */

require_once __DIR__ . '/config/db.php';

// Conexión inicial sin seleccionar base de datos (para poder crearla si no existe)
$pdoRoot = getDbConnection(false);

if (!$pdoRoot) {
    sendError("No se pudo conectar al servidor MySQL de XAMPP. Verifica que el servicio MySQL esté iniciado en el XAMPP Control Panel en el puerto {$db_port}.", 500, [
        'host' => $db_host,
        'port' => $db_port,
        'user' => $db_user
    ]);
}

try {
    // 1. Crear base de datos si no existe
    $pdoRoot->exec("CREATE DATABASE IF NOT EXISTS `{$db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // 2. Conectar a la base de datos ya creada
    $pdo = getDbConnection(true);
    if (!$pdo) {
        sendError("Error al conectar con la base de datos `{$db_name}` recién creada.", 500);
    }

    // 3. Crear tablas
    $sqlSchema = file_get_contents(__DIR__ . '/database/schema.sql');
    $pdo->exec($sqlSchema);

    // 4. Semilla de Tarifas
    $tariffsCount = $pdo->query("SELECT COUNT(*) FROM `tariffs`")->fetchColumn();
    if ($tariffsCount == 0) {
        $stmtTariff = $pdo->prepare("INSERT INTO `tariffs` (`category`, `rate_per_hour`, `min_fraction`, `capacity`, `snapshot_version`) VALUES (?, ?, ?, ?, ?)");
        $defaultTariffs = [
            ['Carro', 4500.00, 2500.00, 30, 'v3.2'],
            ['Moto', 2200.00, 1200.00, 20, 'v3.2'],
            ['Camioneta / SUV', 6000.00, 3500.00, 15, 'v3.2'],
            ['Bicicleta', 1000.00, 500.00, 10, 'v3.2']
        ];
        foreach ($defaultTariffs as $t) {
            $stmtTariff->execute($t);
        }
    }

    // 5. Semilla de Celdas (Zona A: 30 celdas, Zona B: 20 celdas)
    $cellsCount = $pdo->query("SELECT COUNT(*) FROM `cells`")->fetchColumn();
    if ($cellsCount == 0) {
        $stmtCell = $pdo->prepare("INSERT INTO `cells` (`id`, `zone`, `category`, `status`, `plate`, `entry_time`, `entry_timestamp`, `duration`, `current_total`, `rate_per_hour`, `maintenance_reason`, `ticket_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $zoneAOccupied = [
            'A-01' => ['plate' => 'KLO-892', 'time' => '11:15 AM', 'duration' => '2h 17m', 'total' => 13500, 'mins' => 137],
            'A-03' => ['plate' => 'NVY-402', 'time' => '12:40 PM', 'duration' => '0h 52m', 'total' => 4500, 'mins' => 52],
            'A-06' => ['plate' => 'TRK-219', 'time' => '09:05 AM', 'duration' => '4h 27m', 'total' => 22500, 'mins' => 267],
            'A-08' => ['plate' => 'GHI-913', 'time' => '13:10 PM', 'duration' => '0h 22m', 'total' => 4500, 'mins' => 22],
            'A-10' => ['plate' => 'MKZ-771', 'time' => '10:30 AM', 'duration' => '3h 02m', 'total' => 18000, 'mins' => 182],
            'A-11' => ['plate' => 'ABC-123', 'time' => '11:20 AM', 'duration' => '2h 45m', 'total' => 13500, 'mins' => 165],
            'A-13' => ['plate' => 'URB-419', 'time' => '09:00 AM', 'duration' => '4h 30m', 'total' => 22500, 'mins' => 270],
            'A-14' => ['plate' => 'FGH-456', 'time' => '12:15 PM', 'duration' => '1h 17m', 'total' => 9000, 'mins' => 77],
            'A-16' => ['plate' => 'JHG-789', 'time' => '11:50 AM', 'duration' => '1h 42m', 'total' => 9000, 'mins' => 102],
            'A-17' => ['plate' => 'WER-234', 'time' => '13:00 PM', 'duration' => '0h 32m', 'total' => 4500, 'mins' => 32],
            'A-19' => ['plate' => 'TYU-567', 'time' => '10:15 AM', 'duration' => '3h 17m', 'total' => 18000, 'mins' => 197],
            'A-20' => ['plate' => 'BNM-890', 'time' => '12:30 PM', 'duration' => '1h 02m', 'total' => 9000, 'mins' => 62],
            'A-21' => ['plate' => 'QAZ-112', 'time' => '11:40 AM', 'duration' => '1h 52m', 'total' => 9000, 'mins' => 112],
            'A-22' => ['plate' => 'WSX-334', 'time' => '08:50 AM', 'duration' => '4h 42m', 'total' => 22500, 'mins' => 282],
            'A-23' => ['plate' => 'EDC-556', 'time' => '12:20 PM', 'duration' => '1h 12m', 'total' => 9000, 'mins' => 72],
            'A-25' => ['plate' => 'RFV-778', 'time' => '10:45 AM', 'duration' => '2h 47m', 'total' => 13500, 'mins' => 167],
        ];

        // Generar 30 celdas Zona A
        for ($i = 1; $i <= 30; $i++) {
            $id = 'A-' . str_pad($i, 2, '0', STR_PAD_LEFT);
            if ($id === 'A-05') {
                $stmtCell->execute([$id, 'Zona A', 'Carro', 'blocked', null, null, null, null, 0.00, 4500.00, 'CALIBRACIÓN DE SENSOR', null]);
            } elseif (isset($zoneAOccupied[$id])) {
                $occ = $zoneAOccupied[$id];
                $entryTs = (time() - ($occ['mins'] * 60)) * 1000;
                $stmtCell->execute([$id, 'Zona A', 'Carro', 'occupied', $occ['plate'], $occ['time'], $entryTs, $occ['duration'], $occ['total'], 4500.00, null, '#TK-89' . (100 + $i)]);
            } else {
                $stmtCell->execute([$id, 'Zona A', 'Carro', 'free', null, null, null, null, 0.00, 4500.00, null, null]);
            }
        }

        $zoneBOccupied = [
            'B-01' => ['plate' => 'WZF-12D', 'time' => '12:00 PM', 'duration' => '1h 32m', 'total' => 4400, 'mins' => 92],
            'B-03' => ['plate' => 'XTR-45A', 'time' => '11:10 AM', 'duration' => '2h 22m', 'total' => 6600, 'mins' => 142],
            'B-04' => ['plate' => 'MNB-78C', 'time' => '10:00 AM', 'duration' => '3h 32m', 'total' => 8800, 'mins' => 212],
            'B-06' => ['plate' => 'MTO-89F', 'time' => '12:45 PM', 'duration' => '1h 30m', 'total' => 4400, 'mins' => 90],
            'B-07' => ['plate' => 'KJH-23B', 'time' => '11:30 AM', 'duration' => '2h 02m', 'total' => 6600, 'mins' => 122],
            'B-09' => ['plate' => 'BKN-032', 'time' => '13:00 PM', 'duration' => '0h 32m', 'total' => 2200, 'mins' => 32],
            'B-10' => ['plate' => 'PLM-45C', 'time' => '10:20 AM', 'duration' => '3h 12m', 'total' => 8800, 'mins' => 192],
            'B-11' => ['plate' => 'QWE-67D', 'time' => '12:15 PM', 'duration' => '1h 17m', 'total' => 4400, 'mins' => 77],
            'B-13' => ['plate' => 'ASD-89E', 'time' => '11:45 AM', 'duration' => '1h 47m', 'total' => 4400, 'mins' => 107],
            'B-14' => ['plate' => 'ZXC-01F', 'time' => '13:10 PM', 'duration' => '0h 22m', 'total' => 2200, 'mins' => 22],
            'B-16' => ['plate' => 'RTY-23G', 'time' => '09:40 AM', 'duration' => '3h 52m', 'total' => 8800, 'mins' => 232],
            'B-17' => ['plate' => 'FGH-45H', 'time' => '12:35 PM', 'duration' => '0h 57m', 'total' => 2200, 'mins' => 57],
            'B-19' => ['plate' => 'VBN-67J', 'time' => '10:50 AM', 'duration' => '2h 42m', 'total' => 6600, 'mins' => 162],
        ];

        // Generar 20 celdas Zona B (Motos)
        for ($i = 1; $i <= 20; $i++) {
            $id = 'B-' . str_pad($i, 2, '0', STR_PAD_LEFT);
            if ($id === 'B-05') {
                $stmtCell->execute([$id, 'Zona B', 'Moto', 'blocked', null, null, null, null, 0.00, 2200.00, 'LIMPIEZA DE PISO', null]);
            } elseif (isset($zoneBOccupied[$id])) {
                $occ = $zoneBOccupied[$id];
                $entryTs = (time() - ($occ['mins'] * 60)) * 1000;
                $stmtCell->execute([$id, 'Zona B', 'Moto', 'occupied', $occ['plate'], $occ['time'], $entryTs, $occ['duration'], $occ['total'], 2200.00, null, '#TK-89' . (200 + $i)]);
            } else {
                $stmtCell->execute([$id, 'Zona B', 'Moto', 'free', null, null, null, null, 0.00, 2200.00, null, null]);
            }
        }
    }

    // 6. Semilla de Movimientos
    $movCount = $pdo->query("SELECT COUNT(*) FROM `movements`")->fetchColumn();
    if ($movCount == 0) {
        $stmtMov = $pdo->prepare("INSERT INTO `movements` (`id`, `ticket_id`, `plate`, `vehicle_type`, `cell_id`, `type`, `time`, `timestamp`, `amount`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $initialMovements = [
            ['mov-1', '#TK-89421', 'KLO-892', 'Carro', 'A-01', 'Entrada', '11:15 AM', (time() - 7200) * 1000, 0.00],
            ['mov-2', '#TK-89415', 'PLZ-550', 'Carro', 'A-12', 'Salida', '11:42 AM', (time() - 5400) * 1000, 9000.00],
            ['mov-3', '#TK-89420', 'WZF-12D', 'Moto', 'B-01', 'Entrada', '12:00 PM', (time() - 4800) * 1000, 0.00],
            ['mov-4', '#TK-89422', 'NVY-402', 'Carro', 'A-03', 'Entrada', '12:40 PM', (time() - 3200) * 1000, 0.00],
            ['mov-5', '#TK-89416', 'BKN-032', 'Moto', 'B-08', 'Salida', '13:00 PM', (time() - 2400) * 1000, 4400.00],
        ];
        foreach ($initialMovements as $m) {
            $stmtMov->execute($m);
        }
    }

    // 7. Semilla de Transacciones
    $txCount = $pdo->query("SELECT COUNT(*) FROM `transactions`")->fetchColumn();
    if ($txCount == 0) {
        $stmtTx = $pdo->prepare("INSERT INTO `transactions` (`id`, `plate`, `vehicle_type`, `cell_id`, `entry_time`, `entry_timestamp`, `exit_time`, `exit_timestamp`, `duration`, `snapshot_rate`, `total_paid`, `payment_method`, `operator`, `status`, `notes`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $initialTransactions = [
            ['#TK-89421', 'ABC-123', 'Carro', 'A-14', 'Hoy 11:20 AM', (time() - 10000) * 1000, 'Hoy 14:05 PM', (time() - 600) * 1000, '2h 45m', 4500.00, 13500.00, 'Efectivo', 'M. Gómez', 'Completado', null],
            ['#TK-89420', 'MTO-89F', 'Moto', 'B-06', 'Hoy 12:45 PM', (time() - 6000) * 1000, 'Hoy 14:15 PM', (time() - 300) * 1000, '1h 30m', 2200.00, 4400.00, 'Bancolombia', 'M. Gómez', 'Completado', null],
            ['#TK-89419', 'KLP-552', 'Camioneta / SUV', 'A-02', 'Hoy 13:00 PM', (time() - 5500) * 1000, null, null, '1h 32m', 6000.00, 0.00, 'Pendiente', 'M. Gómez', 'En Curso', null],
            ['#TK-89418', 'XTR-901', 'Carro', 'A-09', 'Hoy 10:15 AM', (time() - 15000) * 1000, 'Hoy 10:19 AM', (time() - 14760) * 1000, '4 min', 4500.00, 0.00, 'Exento / Gracia', 'C. Rojas', 'Anulado', 'Salida antes de gracia (15 min)'],
            ['#TK-89417', 'URB-419', 'Carro', 'A-03', 'Hoy 09:00 AM', (time() - 20000) * 1000, 'Hoy 13:30 PM', (time() - 3600) * 1000, '4h 30m', 4500.00, 22500.00, 'Datáfono', 'C. Rojas', 'Completado', null],
        ];
        foreach ($initialTransactions as $tx) {
            $stmtTx->execute($tx);
        }
    }

    sendResponse([
        'success' => true,
        'message' => '¡Base de datos `parkflow_db` configurada e inicializada exitosamente en MySQL (XAMPP)!',
        'database' => $db_name,
        'host' => "{$db_host}:{$db_port}",
        'counts' => [
            'cells' => (int)$pdo->query("SELECT COUNT(*) FROM `cells`")->fetchColumn(),
            'tariffs' => (int)$pdo->query("SELECT COUNT(*) FROM `tariffs`")->fetchColumn(),
            'movements' => (int)$pdo->query("SELECT COUNT(*) FROM `movements`")->fetchColumn(),
            'transactions' => (int)$pdo->query("SELECT COUNT(*) FROM `transactions`")->fetchColumn(),
        ]
    ]);

} catch (Exception $e) {
    sendError("Error al inicializar la base de datos: " . $e->getMessage(), 500);
}
