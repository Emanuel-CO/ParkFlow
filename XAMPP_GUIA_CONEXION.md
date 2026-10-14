# 🚗 ParkFlow - Conexión con XAMPP, PHP y MySQL

Este documento detalla la integración completa del sistema **ParkFlow** con **XAMPP**, utilizando **PHP** como lenguaje backend y **MySQL (MariaDB)** como motor de base de datos relacional.

---

## 📌 1. Arquitectura de la Solución

```
   ┌─────────────────────────────────────────────────────────────┐
   │            ParkFlow Frontend (React / Vite)                 │
   │  Panel Operativo • Entrada • Salida • Tarifas • Auditoría   │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ Peticiones HTTP / Fetch
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                Backend PHP (Apache en XAMPP)                │
   │               http://localhost/parkflow-api/                │
   │                                                             │
   │  • entry.php       (Registro de entradas & anti-passback)   │
   │  • checkout.php    (Liquidación, cobro & liberación celda)  │
   │  • cells.php       (Bahías y cálculo de tarifa en vivo)     │
   │  • tariffs.php     (Esquemas tarifarios y snapshots)        │
   │  • movements.php   (Bitácora de entradas y salidas)         │
   │  • transactions.php (Auditoría histórica de cobros)         │
   │  • setup_db.php    (Migración y semillas automáticas)       │
   │  • status.php      (Métricas y salud del servidor)          │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ PDO MySQL (localhost:3306)
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  Base de Datos MySQL (XAMPP)                │
   │                     `parkflow_db`                           │
   │                                                             │
   │  • cells        (50 bahías: 30 Carros + 20 Motos)           │
   │  • tariffs      (Tarifas horarias y fracciones)             │
   │  • movements    (Registro de flujo vehicular)               │
   │  • transactions (Tickets, pagos y métodos de pago)          │
   │  • settings     (Parámetros operativos y umbrales)          │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🔑 2. Parámetros de Conexión a MySQL

| Parámetro | Valor por Defecto en XAMPP |
|---|---|
| **Host** | `localhost` / `127.0.0.1` |
| **Puerto** | `3306` |
| **Nombre de Base de Datos** | `parkflow_db` |
| **Usuario** | `root` |
| **Contraseña** | *(vacío)* |
| **Codificación** | `utf8mb4` |

---

## ⚡ 3. Cómo Iniciar el Sistema con XAMPP

### Opción Rápida (1 Clic)
Ejecuta el archivo:
```bat
iniciar_servidores.bat
```
Este script verifica que MySQL y Apache estén corriendo y abre el panel en tu navegador.

### Opción Manual con XAMPP Control Panel
1. Abre **XAMPP Control Panel**.
2. Haz clic en **Start** junto a **Apache**.
3. Haz clic en **Start** junto a **MySQL**.
4. ¡Listo! Ambos módulos se iluminarán en verde.

---

## 🌐 4. Enlaces de Interés

- **Panel de Control & Consola de la API**:  
  👉 [http://localhost/parkflow-api/](http://localhost/parkflow-api/)
- **phpMyAdmin (Visualizar y Administrar Tablas en MySQL)**:  
  👉 [http://localhost/phpmyadmin/index.php?route=/database/structure&db=parkflow_db](http://localhost/phpmyadmin/index.php?route=/database/structure&db=parkflow_db)
- **Script de Inicialización / Reset de Tablas**:  
  👉 [http://localhost/parkflow-api/setup_db.php](http://localhost/parkflow-api/setup_db.php)

---

## 🗄️ 5. Tablas Creadas en MySQL (`parkflow_db`)

1. **`cells`**:
   - `id` (VARCHAR(10) PK, ej: `A-01`, `B-15`).
   - `zone` (VARCHAR(20), `Zona A` o `Zona B`).
   - `category` (VARCHAR(30), `Carro`, `Moto`, `Camioneta / SUV`, `Bicicleta`).
   - `status` (ENUM `free`, `occupied`, `blocked`).
   - `plate` (VARCHAR(20)).
   - `entry_time`, `entry_timestamp`, `duration`, `current_total`, `rate_per_hour`, `ticket_id`, `maintenance_reason`, `notes`.

2. **`tariffs`**:
   - `category` (PK): `Carro` ($4.500/h), `Moto` ($2.200/h), `Camioneta / SUV` ($6.000/h), `Bicicleta` ($1.000/h).
   - `rate_per_hour`, `min_fraction`, `capacity`, `snapshot_version`.

3. **`movements`**:
   - `id` (PK, ej: `mov-172890123`).
   - `ticket_id`, `plate`, `vehicle_type`, `cell_id`, `type` (`Entrada` o `Salida`), `time`, `timestamp`, `amount`.

4. **`transactions`**:
   - `id` (PK, ej: `#PF-2026-89421`).
   - `plate`, `vehicle_type`, `cell_id`, `entry_time`, `exit_time`, `duration`, `snapshot_rate`, `total_paid`, `payment_method`, `operator`, `status` (`Completado`, `En Curso`, `Anulado`).

5. **`settings`**:
   - Almacenamiento de umbrales de alerta y aforo crítico.

---

## 📡 6. Catálogo de Endpoints REST (PHP)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/status.php` | Devuelve estado de conexión, tablas y métricas en vivo. |
| `GET` | `/api/cells.php` | Devuelve las 50 celdas con cálculo de tiempo y cobro en vivo. |
| `POST` | `/api/cells.php` | Pone o quita una celda en mantenimiento (`blocked` / `free`). |
| `POST` | `/api/entry.php` | Registra ingreso, valida anti-passback y genera ticket en MySQL. |
| `POST` | `/api/checkout.php` | Liquida vehículo por celda o placa, cobra y libera la celda. |
| `GET` | `/api/tariffs.php` | Obtiene el esquema de tarifas por categoría. |
| `POST` | `/api/tariffs.php` | Actualiza la tarifa por hora y fracción mínima. |
| `GET` | `/api/movements.php` | Obtiene el historial de movimientos de entrada y salida. |
| `GET` | `/api/transactions.php`| Obtiene la auditoría de facturación y tickets. |
| `GET` | `/api/setup_db.php` | Crea la base de datos y carga las semillas iniciales. |
