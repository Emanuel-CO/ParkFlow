-- ==============================================================
-- ParkFlow - Estructura de Base de Datos MySQL (XAMPP / MariaDB)
-- Base de Datos: parkflow_db
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `parkflow_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `parkflow_db`;

-- 1. Tabla de Celdas / Bahías de Estacionamiento
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

-- 2. Tabla de Esquema de Tarifas
CREATE TABLE IF NOT EXISTS `tariffs` (
    `category` VARCHAR(30) NOT NULL PRIMARY KEY,
    `rate_per_hour` DECIMAL(10,2) NOT NULL,
    `min_fraction` DECIMAL(10,2) NOT NULL,
    `capacity` INT NOT NULL DEFAULT 30,
    `snapshot_version` VARCHAR(20) NOT NULL DEFAULT 'v3.2',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Movimientos (Bitácora de Entradas y Salidas)
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

-- 4. Tabla de Transacciones y Tickets (Auditoría y Facturación)
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

-- 5. Tabla de Configuración de Sistema y Umbrales
CREATE TABLE IF NOT EXISTS `settings` (
    `setting_key` VARCHAR(50) NOT NULL PRIMARY KEY,
    `setting_value` TEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
