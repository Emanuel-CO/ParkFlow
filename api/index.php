<?php
/**
 * ParkFlow - Panel de Control & Documentación de API PHP + MySQL (XAMPP)
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);
$isDbConnected = ($pdo !== null);

$metrics = [
    'totalCells' => 0,
    'occupiedCells' => 0,
    'freeCells' => 0,
    'blockedCells' => 0,
    'revenue' => 0,
    'entries' => 0,
];

if ($isDbConnected) {
    try {
        $metrics['occupiedCells'] = (int)$pdo->query("SELECT COUNT(*) FROM `cells` WHERE `status` = 'occupied'")->fetchColumn();
        $metrics['freeCells'] = (int)$pdo->query("SELECT COUNT(*) FROM `cells` WHERE `status` = 'free'")->fetchColumn();
        $metrics['blockedCells'] = (int)$pdo->query("SELECT COUNT(*) FROM `cells` WHERE `status` = 'blocked'")->fetchColumn();
        $metrics['totalCells'] = $metrics['occupiedCells'] + $metrics['freeCells'] + $metrics['blockedCells'];
        $metrics['revenue'] = (float)$pdo->query("SELECT COALESCE(SUM(`total_paid`), 0) FROM `transactions` WHERE `status` = 'Completado'")->fetchColumn();
        $metrics['entries'] = (int)$pdo->query("SELECT COUNT(*) FROM `movements` WHERE `type` = 'Entrada'")->fetchColumn();
    } catch (Exception $e) {
        // error reading metrics
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ParkFlow API - Backend PHP & MySQL en XAMPP</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <!-- Top Navigation -->
  <nav class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
          PF
        </div>
        <div>
          <span class="font-bold text-lg text-white tracking-tight flex items-center gap-2">
            ParkFlow <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">PHP + MySQL</span>
          </span>
          <span class="text-xs text-slate-400 block -mt-0.5">Servidor XAMPP Apache</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <a href="http://localhost/phpmyadmin/index.php?route=/database/structure&db=parkflow_db" target="_blank" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
          <span class="material-symbols-outlined text-[16px] text-amber-400">database</span>
          <span>phpMyAdmin</span>
        </a>
        <a href="setup_db.php" target="_blank" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm">
          <span class="material-symbols-outlined text-[16px]">refresh</span>
          <span>Reinicializar DB</span>
        </a>
      </div>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto px-6 py-8 space-y-8">
    <!-- Header Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/40 p-8 shadow-2xl">
      <div class="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 <?php echo $isDbConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'; ?>">
            <span class="w-2 h-2 rounded-full <?php echo $isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'; ?>"></span>
            <span><?php echo $isDbConnected ? 'MySQL Conectado en XAMPP (localhost:3306)' : 'Desconectado de MySQL'; ?></span>
          </div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">API REST de ParkFlow & Base de Datos</h1>
          <p class="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Servicio backend desarrollado en PHP conectado a base de datos MySQL (<code class="text-indigo-300">parkflow_db</code>). Administra celdas, registro de entradas, liquidación de salidas, tarifas y auditoría con persistencia permanente.
          </p>
        </div>

        <div class="flex flex-col gap-2 shrink-0 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300">
          <div><span class="text-slate-500">PHP:</span> <?php echo PHP_VERSION; ?></div>
          <div><span class="text-slate-500">DB:</span> parkflow_db (MySQL)</div>
          <div><span class="text-slate-500">Host:</span> localhost:3306</div>
          <div><span class="text-slate-500">Base URL:</span> http://localhost/parkflow-api/</div>
        </div>
      </div>
    </div>

    <!-- Live KPI Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <span class="text-xs font-medium text-slate-400">Total Bahías en DB</span>
        <div class="text-2xl font-bold text-white mt-1"><?php echo $metrics['totalCells']; ?></div>
        <span class="text-[11px] text-slate-500 mt-0.5 block">30 Carros + 20 Motos</span>
      </div>

      <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <span class="text-xs font-medium text-slate-400">Bahías Ocupadas</span>
        <div class="text-2xl font-bold text-amber-400 mt-1"><?php echo $metrics['occupiedCells']; ?></div>
        <span class="text-[11px] text-emerald-400 mt-0.5 block"><?php echo $metrics['freeCells']; ?> bahías libres</span>
      </div>

      <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <span class="text-xs font-medium text-slate-400">Recaudo Registrado</span>
        <div class="text-2xl font-bold text-emerald-400 mt-1">$<?php echo number_format($metrics['revenue'], 0, ',', '.'); ?> COP</div>
        <span class="text-[11px] text-slate-500 mt-0.5 block">Pagos completados</span>
      </div>

      <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <span class="text-xs font-medium text-slate-400">Entradas Registradas</span>
        <div class="text-2xl font-bold text-indigo-400 mt-1"><?php echo $metrics['entries']; ?></div>
        <span class="text-[11px] text-slate-500 mt-0.5 block">Movimientos históricos</span>
      </div>
    </div>

    <!-- Endpoints Catalog -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-400">api</span>
          Catálogo de Endpoints REST
        </h2>
        <span class="text-xs text-slate-400">Formato de respuesta: JSON (utf-8)</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Endpoint 1 -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">GET</span>
              <a href="cells.php" target="_blank" class="font-mono text-sm font-semibold text-white hover:text-indigo-400 underline decoration-slate-700">/cells.php</a>
            </div>
            <a href="cells.php" target="_blank" class="text-xs text-indigo-400 hover:underline">Probar &rarr;</a>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Obtiene todas las celdas de las Zonas A y B con cálculo automático en vivo de tiempo transcurrido y tarifa acumulada.
          </p>
        </div>

        <!-- Endpoint 2 -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">POST</span>
              <span class="font-mono text-sm font-semibold text-white">/entry.php</span>
            </div>
            <span class="text-xs text-slate-500">Entrada Vehículo</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Registra ingreso de vehículo: valida regla Anti-Passback, asigna bahía libre, genera ticket y guarda movimiento y transacción en MySQL.
          </p>
        </div>

        <!-- Endpoint 3 -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">POST</span>
              <span class="font-mono text-sm font-semibold text-white">/checkout.php</span>
            </div>
            <span class="text-xs text-slate-500">Salida y Cobro</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Liquida estancia por placa o número de bahía, aplica periodo de gracia o tarifa horaria + fracción, registra pago y libera la bahía.
          </p>
        </div>

        <!-- Endpoint 4 -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">GET</span>
              <a href="tariffs.php" target="_blank" class="font-mono text-sm font-semibold text-white hover:text-indigo-400 underline decoration-slate-700">/tariffs.php</a>
            </div>
            <a href="tariffs.php" target="_blank" class="text-xs text-indigo-400 hover:underline">Probar &rarr;</a>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Consulta y actualiza el esquema tarifario por categoría (Carro, Moto, Camioneta, Bicicleta).
          </p>
        </div>

        <!-- Endpoint 5 -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">GET</span>
              <a href="movements.php" target="_blank" class="font-mono text-sm font-semibold text-white hover:text-indigo-400 underline decoration-slate-700">/movements.php</a>
            </div>
            <a href="movements.php" target="_blank" class="text-xs text-indigo-400 hover:underline">Probar &rarr;</a>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Bitácora en tiempo real de entradas y salidas registradas en la base de datos MySQL.
          </p>
        </div>

        <!-- Endpoint 6 -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">GET</span>
              <a href="status.php" target="_blank" class="font-mono text-sm font-semibold text-white hover:text-indigo-400 underline decoration-slate-700">/status.php</a>
            </div>
            <a href="status.php" target="_blank" class="text-xs text-indigo-400 hover:underline">Probar &rarr;</a>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Endpoint de salud y métricas para verificar conectividad con Apache, PHP y MySQL.
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Test Console -->
    <div class="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
      <h3 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
        <span class="material-symbols-outlined text-amber-400">terminal</span>
        Consola Rápida de Prueba (Interactúa directamente con MySQL)
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Test Entry Form -->
        <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <span class="text-xs font-bold text-indigo-300 block">Probar Registro de Entrada</span>
          <div class="grid grid-cols-2 gap-2">
            <input id="test-plate" type="text" placeholder="Placa (ej: XYZ-789)" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500">
            <select id="test-category" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
              <option value="Carro">Carro ($4.500/h)</option>
              <option value="Moto">Moto ($2.200/h)</option>
              <option value="Camioneta / SUV">Camioneta ($6.000/h)</option>
              <option value="Bicicleta">Bicicleta ($1.000/h)</option>
            </select>
          </div>
          <button onclick="handleTestEntry()" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition">
            Registrar Entrada en MySQL
          </button>
        </div>

        <!-- Test Checkout Form -->
        <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <span class="text-xs font-bold text-emerald-300 block">Probar Salida y Cobro</span>
          <div class="grid grid-cols-2 gap-2">
            <input id="test-checkout-input" type="text" placeholder="Celda o Placa (ej: A-01)" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-emerald-500">
            <select id="test-payment" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
              <option value="Efectivo">Efectivo</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="QR Nequi/Davi">QR Nequi/Davi</option>
              <option value="Datáfono">Datáfono</option>
            </select>
          </div>
          <button onclick="handleTestCheckout()" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition">
            Liquidar Salida en MySQL
          </button>
        </div>
      </div>

      <div id="result-box" class="hidden p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-auto"></div>
    </div>
  </main>

  <script>
    async function handleTestEntry() {
      const plate = document.getElementById('test-plate').value.trim();
      const category = document.getElementById('test-category').value;
      const resBox = document.getElementById('result-box');
      if (!plate) { alert('Ingrese una placa'); return; }

      try {
        const res = await fetch('entry.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plate, category })
        });
        const data = await res.json();
        resBox.classList.remove('hidden');
        resBox.textContent = JSON.stringify(data, null, 2);
        if (data.success) {
          alert('¡Entrada guardada en MySQL! Ticket: ' + data.ticketId + ' | Celda: ' + data.cellId);
          setTimeout(() => location.reload(), 1500);
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        alert('Error al conectar: ' + err.message);
      }
    }

    async function handleTestCheckout() {
      const cellIdOrPlate = document.getElementById('test-checkout-input').value.trim();
      const paymentMethod = document.getElementById('test-payment').value;
      const resBox = document.getElementById('result-box');
      if (!cellIdOrPlate) { alert('Ingrese placa o celda'); return; }

      try {
        const res = await fetch('checkout.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cellIdOrPlate, paymentMethod })
        });
        const data = await res.json();
        resBox.classList.remove('hidden');
        resBox.textContent = JSON.stringify(data, null, 2);
        if (data.success) {
          alert('¡Salida liquidada en MySQL! Celda ' + data.cellId + ' liberada. Total: $' + data.total);
          setTimeout(() => location.reload(), 1500);
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        alert('Error al conectar: ' + err.message);
      }
    }
  </script>
</body>
</html>
