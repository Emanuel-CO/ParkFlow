-- liquibase formatted sql

-- =========================================================================
-- PARKFLOW 2099 - MASTER CHANGELOG EN FORMATO SQL
-- Permite ejecutar migraciones directamente con liquibase CLI, Maven o clientes SQL
-- =========================================================================

-- changeset parkflow-dev:v1.0.0-01-create-tables
-- comment: Creacion de tablas maestras del sistema (cells, tariffs, movements, transactions, settings, users)
CREATE TABLE IF NOT EXISTS `cells` (
    `id` VARCHAR(10) NOT NULL PRIMARY KEY,
    `zone` VARCHAR(20) NOT NULL,
    `category` VARCHAR(30) NOT NULL DEFAULT 'Carro',
    `status` ENUM('free', 'occupied', 'blocked') NOT NULL DEFAULT 'free',
    `plate` VARCHAR(20) NULL,
    `entry_time` VARCHAR(20) NULL,
    `entry_timestamp` BIGINT NULL,
    `duration` VARCHAR(30) NULL,
    `current_total` DECIMAL(10,2) NULL DEFAULT 0.00,
    `rate_per_hour` DECIMAL(10,2) NOT NULL DEFAULT 4500.00,
    `maintenance_reason` TEXT NULL,
    `notes` TEXT NULL,
    `ticket_id` VARCHAR(50) NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tariffs` (
    `category` VARCHAR(30) NOT NULL PRIMARY KEY,
    `rate_per_hour` DECIMAL(10,2) NOT NULL,
    `min_fraction` DECIMAL(10,2) NOT NULL,
    `capacity` INT NOT NULL DEFAULT 30,
    `snapshot_version` VARCHAR(20) NOT NULL DEFAULT 'v3.2',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `movements` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `ticket_id` VARCHAR(50) NOT NULL,
    `plate` VARCHAR(20) NOT NULL,
    `vehicle_type` VARCHAR(30) NOT NULL,
    `cell_id` VARCHAR(10) NOT NULL,
    `type` ENUM('Entrada', 'Salida') NOT NULL,
    `time` VARCHAR(20) NOT NULL,
    `timestamp` BIGINT NOT NULL,
    `amount` DECIMAL(10,2) NULL DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `plate` VARCHAR(20) NOT NULL,
    `vehicle_type` VARCHAR(30) NOT NULL,
    `cell_id` VARCHAR(10) NOT NULL,
    `entry_time` VARCHAR(30) NOT NULL,
    `entry_timestamp` BIGINT NOT NULL,
    `exit_time` VARCHAR(30) NULL,
    `exit_timestamp` BIGINT NULL,
    `duration` VARCHAR(30) NOT NULL DEFAULT 'En Curso',
    `snapshot_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `payment_method` VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
    `operator` VARCHAR(50) NOT NULL DEFAULT 'Admin',
    `status` ENUM('Completado', 'En Curso', 'Anulado') NOT NULL DEFAULT 'En Curso',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
    `setting_key` VARCHAR(50) NOT NULL PRIMARY KEY,
    `setting_value` TEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `identification` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(50) NOT NULL UNIQUE,
    `plate` VARCHAR(20) NULL,
    `role` ENUM('cliente', 'operador', 'administrador') NOT NULL DEFAULT 'cliente',
    `password_hash` VARCHAR(255) NOT NULL,
    `password_signature` VARCHAR(64) NOT NULL,
    `badge` VARCHAR(50) NULL,
    `shift` VARCHAR(50) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- rollback DROP TABLE IF EXISTS `users`, `settings`, `transactions`, `movements`, `tariffs`, `cells`;

-- changeset parkflow-dev:v1.0.0-02-seed-tariffs-and-settings
-- comment: Carga inicial de tarifas operativas y configuracion de sistema
INSERT INTO `tariffs` (`category`, `rate_per_hour`, `min_fraction`, `capacity`, `snapshot_version`)
VALUES 
    ('Carro', 4500.00, 2500.00, 30, 'v3.2'),
    ('Moto', 2200.00, 1200.00, 20, 'v3.2'),
    ('Camioneta / SUV', 6000.00, 3500.00, 15, 'v3.2'),
    ('Bicicleta', 1000.00, 500.00, 10, 'v3.2')
ON DUPLICATE KEY UPDATE `rate_per_hour`=VALUES(`rate_per_hour`);

INSERT INTO `settings` (`setting_key`, `setting_value`)
VALUES 
    ('system_name', 'ParkFlow 2099 - AI Quantum Parking'),
    ('grace_period_mins', '15'),
    ('anti_passback', 'strict'),
    ('currency', 'COP')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);
-- rollback DELETE FROM `tariffs` WHERE `category` IN ('Carro', 'Moto', 'Camioneta / SUV', 'Bicicleta'); DELETE FROM `settings` WHERE `setting_key` IN ('system_name', 'grace_period_mins', 'anti_passback', 'currency');

-- changeset parkflow-dev:v1.0.0-03-seed-cells
-- comment: Carga de 50 celdas activas (Zona A: 30 celdas, Zona B: 20 celdas)
INSERT INTO `cells` (`id`, `zone`, `category`, `status`, `plate`, `entry_time`, `entry_timestamp`, `duration`, `current_total`, `rate_per_hour`, `maintenance_reason`, `ticket_id`) VALUES
('A-01', 'Zona A', 'Carro', 'occupied', 'KLO-892', '11:15 AM', 1700000000000, '2h 17m', 13500.00, 4500.00, NULL, '#TK-89101'),
('A-02', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-03', 'Zona A', 'Carro', 'occupied', 'NVY-402', '12:40 PM', 1700000000000, '0h 52m', 4500.00, 4500.00, NULL, '#TK-89103'),
('A-04', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-05', 'Zona A', 'Carro', 'blocked', NULL, NULL, NULL, NULL, 0.00, 4500.00, 'CALIBRACIÓN DE SENSOR', NULL),
('A-06', 'Zona A', 'Carro', 'occupied', 'TRK-219', '09:05 AM', 1700000000000, '4h 27m', 22500.00, 4500.00, NULL, '#TK-89106'),
('A-07', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-08', 'Zona A', 'Carro', 'occupied', 'GHI-913', '13:10 PM', 1700000000000, '0h 22m', 4500.00, 4500.00, NULL, '#TK-89108'),
('A-09', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-10', 'Zona A', 'Carro', 'occupied', 'MKZ-771', '10:30 AM', 1700000000000, '3h 02m', 18000.00, 4500.00, NULL, '#TK-89110'),
('A-11', 'Zona A', 'Carro', 'occupied', 'ABC-123', '11:20 AM', 1700000000000, '2h 45m', 13500.00, 4500.00, NULL, '#TK-89111'),
('A-12', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-13', 'Zona A', 'Carro', 'occupied', 'URB-419', '09:00 AM', 1700000000000, '4h 30m', 22500.00, 4500.00, NULL, '#TK-89113'),
('A-14', 'Zona A', 'Carro', 'occupied', 'FGH-456', '12:15 PM', 1700000000000, '1h 17m', 9000.00, 4500.00, NULL, '#TK-89114'),
('A-15', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-16', 'Zona A', 'Carro', 'occupied', 'JHG-789', '11:50 AM', 1700000000000, '1h 42m', 9000.00, 4500.00, NULL, '#TK-89116'),
('A-17', 'Zona A', 'Carro', 'occupied', 'WER-234', '13:00 PM', 1700000000000, '0h 32m', 4500.00, 4500.00, NULL, '#TK-89117'),
('A-18', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-19', 'Zona A', 'Carro', 'occupied', 'TYU-567', '10:15 AM', 1700000000000, '3h 17m', 18000.00, 4500.00, NULL, '#TK-89119'),
('A-20', 'Zona A', 'Carro', 'occupied', 'BNM-890', '12:30 PM', 1700000000000, '1h 02m', 9000.00, 4500.00, NULL, '#TK-89120'),
('A-21', 'Zona A', 'Carro', 'occupied', 'QAZ-112', '11:40 AM', 1700000000000, '1h 52m', 9000.00, 4500.00, NULL, '#TK-89121'),
('A-22', 'Zona A', 'Carro', 'occupied', 'WSX-334', '08:50 AM', 1700000000000, '4h 42m', 22500.00, 4500.00, NULL, '#TK-89122'),
('A-23', 'Zona A', 'Carro', 'occupied', 'EDC-556', '12:20 PM', 1700000000000, '1h 12m', 9000.00, 4500.00, NULL, '#TK-89123'),
('A-24', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-25', 'Zona A', 'Carro', 'occupied', 'RFV-778', '10:45 AM', 1700000000000, '2h 47m', 13500.00, 4500.00, NULL, '#TK-89125'),
('A-26', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-27', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-28', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-29', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('A-30', 'Zona A', 'Carro', 'free', NULL, NULL, NULL, NULL, 0.00, 4500.00, NULL, NULL),
('B-01', 'Zona B', 'Moto', 'occupied', 'WZF-12D', '12:00 PM', 1700000000000, '1h 32m', 4400.00, 2200.00, NULL, '#TK-89201'),
('B-02', 'Zona B', 'Moto', 'free', NULL, NULL, NULL, NULL, 0.00, 2200.00, NULL, NULL),
('B-03', 'Zona B', 'Moto', 'occupied', 'XTR-45A', '11:10 AM', 1700000000000, '2h 22m', 6600.00, 2200.00, NULL, '#TK-89203'),
('B-04', 'Zona B', 'Moto', 'occupied', 'MNB-78C', '10:00 AM', 1700000000000, '3h 32m', 8800.00, 2200.00, NULL, '#TK-89204'),
('B-05', 'Zona B', 'Moto', 'blocked', NULL, NULL, NULL, NULL, 0.00, 2200.00, 'LIMPIEZA DE PISO', NULL),
('B-06', 'Zona B', 'Moto', 'occupied', 'MTO-89F', '12:45 PM', 1700000000000, '1h 30m', 4400.00, 2200.00, NULL, '#TK-89206'),
('B-07', 'Zona B', 'Moto', 'occupied', 'KJH-23B', '11:30 AM', 1700000000000, '2h 02m', 6600.00, 2200.00, NULL, '#TK-89207'),
('B-08', 'Zona B', 'Moto', 'free', NULL, NULL, NULL, NULL, 0.00, 2200.00, NULL, NULL),
('B-09', 'Zona B', 'Moto', 'occupied', 'BKN-032', '13:00 PM', 1700000000000, '0h 32m', 2200.00, 2200.00, NULL, '#TK-89209'),
('B-10', 'Zona B', 'Moto', 'occupied', 'PLM-45C', '10:20 AM', 1700000000000, '3h 12m', 8800.00, 2200.00, NULL, '#TK-89210'),
('B-11', 'Zona B', 'Moto', 'occupied', 'QWE-67D', '12:15 PM', 1700000000000, '1h 17m', 4400.00, 2200.00, NULL, '#TK-89211'),
('B-12', 'Zona B', 'Moto', 'free', NULL, NULL, NULL, NULL, 0.00, 2200.00, NULL, NULL),
('B-13', 'Zona B', 'Moto', 'occupied', 'ASD-89E', '11:45 AM', 1700000000000, '1h 47m', 4400.00, 2200.00, NULL, '#TK-89213'),
('B-14', 'Zona B', 'Moto', 'occupied', 'ZXC-01F', '13:10 PM', 1700000000000, '0h 22m', 2200.00, 2200.00, NULL, '#TK-89214'),
('B-15', 'Zona B', 'Moto', 'free', NULL, NULL, NULL, NULL, 0.00, 2200.00, NULL, NULL),
('B-16', 'Zona B', 'Moto', 'occupied', 'RTY-23G', '09:40 AM', 1700000000000, '3h 52m', 8800.00, 2200.00, NULL, '#TK-89216'),
('B-17', 'Zona B', 'Moto', 'occupied', 'FGH-45H', '12:35 PM', 1700000000000, '0h 57m', 2200.00, 2200.00, NULL, '#TK-89217'),
('B-18', 'Zona B', 'Moto', 'free', NULL, NULL, NULL, NULL, 0.00, 2200.00, NULL, NULL),
('B-19', 'Zona B', 'Moto', 'occupied', 'VBN-67J', '10:50 AM', 1700000000000, '2h 42m', 6600.00, 2200.00, NULL, '#TK-89219'),
('B-20', 'Zona B', 'Moto', 'free', NULL, NULL, NULL, NULL, 0.00, 2200.00, NULL, NULL)
ON DUPLICATE KEY UPDATE `zone`=VALUES(`zone`);
-- rollback DELETE FROM `cells` WHERE `id` LIKE 'A-%' OR `id` LIKE 'B-%';

-- changeset parkflow-dev:v1.0.0-04-seed-users
-- comment: Carga inicial de usuarios autorizados con BCRYPT y SHA-256
INSERT INTO `users` (`identification`, `name`, `phone`, `plate`, `role`, `password_hash`, `password_signature`, `badge`, `shift`) VALUES
('admin.master', 'Ing. Valderrama (Admin Root)', '3001234567', 'ADM-001', 'administrador', '$2y$10$vO8wQkPqFw5mI.RjH936yeG2z7z9kE6jX/uJb5J9/e0a0j7s/aLme', '0b9c3f15db8b0ea17a3a31c50e20600f682d338f0e0dc2c9cbe8b776a3e5e4bb', 'ROOT-01', 'Turno Maestro 24/7'),
('OP-418', 'Carlos Rojas', '3105554180', 'OPR-418', 'operador', '$2y$10$tZ2cK.m9xR3p5zQ1w4aE0uO9f7j2l8k1m5n9p3q7r1s5t9u3v7w1x', 'cf997193b22cfca78e7de85e68b5a0e9ec19d659adfa5c3a373b9e4a3b8fa3ce', 'OP-418', 'Turno Mañana [06:00 - 14:00]'),
('OP-722', 'Diana Morales', '3157778901', 'OPR-722', 'operador', '$2y$10$bY3dM.p8wS2o4yR0v3bF9tN8g6k1k7j0l4m8o2p6q0r4s8t2u6v0w', '1e4e5cf4867990141f92e59103c80bf73bc2a4e4d58855cefb9a572a15f01e6a', 'OP-722', 'Turno Tarde [14:00 - 22:00]'),
('1020304050', 'Alejandro Vélez', '3109876543', 'KLO-892', 'cliente', '$2y$10$sX1aJ.l8wQ2o4yP0v3aD9tN8e6i1k7j0l4m8p2q6r0s4t8u2v6w0x', 'ea9f864fa93d05e2694b92b67f4c5e317c2a7e78044737e41b9d40b4cbb19ad7', 'CLI-1020', NULL)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
-- rollback DELETE FROM `users` WHERE `identification` IN ('admin.master', 'OP-418', 'OP-722', '1020304050');

-- changeset parkflow-dev:v1.0.0-05-seed-movements-and-transactions
-- comment: Carga inicial de bitacora de auditoria y transacciones
INSERT INTO `movements` (`id`, `ticket_id`, `plate`, `vehicle_type`, `cell_id`, `type`, `time`, `timestamp`, `amount`) VALUES
('mov-1', '#TK-89421', 'KLO-892', 'Carro', 'A-01', 'Entrada', '11:15 AM', 1700000000000, 0.00),
('mov-2', '#TK-89415', 'PLZ-550', 'Carro', 'A-12', 'Salida', '11:42 AM', 1700000000000, 9000.00),
('mov-3', '#TK-89420', 'WZF-12D', 'Moto', 'B-01', 'Entrada', '12:00 PM', 1700000000000, 0.00),
('mov-4', '#TK-89422', 'NVY-402', 'Carro', 'A-03', 'Entrada', '12:40 PM', 1700000000000, 0.00),
('mov-5', '#TK-89416', 'BKN-032', 'Moto', 'B-08', 'Salida', '13:00 PM', 1700000000000, 4400.00)
ON DUPLICATE KEY UPDATE `amount`=VALUES(`amount`);

INSERT INTO `transactions` (`id`, `plate`, `vehicle_type`, `cell_id`, `entry_time`, `entry_timestamp`, `exit_time`, `exit_timestamp`, `duration`, `snapshot_rate`, `total_paid`, `payment_method`, `operator`, `status`, `notes`) VALUES
('#TK-89421', 'ABC-123', 'Carro', 'A-14', 'Hoy 11:20 AM', 1700000000000, 'Hoy 14:05 PM', 1700000000000, '2h 45m', 4500.00, 13500.00, 'Efectivo', 'Diana Morales', 'Completado', NULL),
('#TK-89420', 'MTO-89F', 'Moto', 'B-06', 'Hoy 12:45 PM', 1700000000000, 'Hoy 14:15 PM', 1700000000000, '1h 30m', 2200.00, 4400.00, 'Bancolombia', 'Carlos Rojas', 'Completado', NULL),
('#TK-89419', 'KLP-552', 'Camioneta / SUV', 'A-02', 'Hoy 13:00 PM', 1700000000000, NULL, NULL, '1h 32m', 6000.00, 0.00, 'Pendiente', 'Carlos Rojas', 'En Curso', NULL),
('#TK-89418', 'XTR-901', 'Carro', 'A-09', 'Hoy 10:15 AM', 1700000000000, 'Hoy 10:19 AM', 1700000000000, '4 min', 4500.00, 0.00, 'Exento / Gracia', 'Carlos Rojas', 'Anulado', 'Salida antes de gracia (15 min)'),
('#TK-89417', 'URB-419', 'Carro', 'A-03', 'Hoy 09:00 AM', 1700000000000, 'Hoy 13:30 PM', 1700000000000, '4h 30m', 4500.00, 22500.00, 'Datáfono', 'Carlos Rojas', 'Completado', NULL)
ON DUPLICATE KEY UPDATE `total_paid`=VALUES(`total_paid`);
-- rollback DELETE FROM `movements` WHERE `id` IN ('mov-1', 'mov-2', 'mov-3', 'mov-4', 'mov-5'); DELETE FROM `transactions` WHERE `id` IN ('#TK-89421', '#TK-89420', '#TK-89419', '#TK-89418', '#TK-89417');

-- changeset parkflow-dev:v1.0.0-06-create-indexes
-- comment: Creacion de indices de alto rendimiento para consultas concurrentes LPR y Anti-Passback
CREATE INDEX IF NOT EXISTS `idx_cells_plate` ON `cells` (`plate`);
CREATE INDEX IF NOT EXISTS `idx_cells_status` ON `cells` (`status`);
CREATE INDEX IF NOT EXISTS `idx_movements_plate` ON `movements` (`plate`);
CREATE INDEX IF NOT EXISTS `idx_movements_ticket` ON `movements` (`ticket_id`);
CREATE INDEX IF NOT EXISTS `idx_transactions_plate` ON `transactions` (`plate`);
CREATE INDEX IF NOT EXISTS `idx_users_role` ON `users` (`role`);
CREATE INDEX IF NOT EXISTS `idx_users_badge` ON `users` (`badge`);
-- rollback DROP INDEX `idx_cells_plate` ON `cells`; DROP INDEX `idx_cells_status` ON `cells`; DROP INDEX `idx_movements_plate` ON `movements`; DROP INDEX `idx_movements_ticket` ON `movements`; DROP INDEX `idx_transactions_plate` ON `transactions`; DROP INDEX `idx_users_role` ON `users`; DROP INDEX `idx_users_badge` ON `users`;

-- changeset parkflow-dev:v1.1.0-01-operator-shifts
-- comment: Soporte optimizado para gestion de turnos y operadores (Carlos Rojas, Diana Morales, etc.)
CREATE INDEX IF NOT EXISTS `idx_users_role_shift` ON `users` (`role`, `shift`);
-- rollback DROP INDEX `idx_users_role_shift` ON `users`;
