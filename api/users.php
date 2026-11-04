<?php
/**
 * ParkFlow - Endpoint de Gestión de Usuarios y Operadores
 * Soporta listar, crear y eliminar operadores de turno (Solo Administrador)
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);
if (!$pdo) {
    sendError("Sin conexión a la base de datos MySQL.", 500);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$input = getJsonInput();
$action = $input['action'] ?? $_GET['action'] ?? null;

if (!$action) {
    if ($method === 'GET') {
        $action = 'list_operators';
    } elseif ($method === 'POST') {
        $action = 'create_operator';
    } elseif ($method === 'DELETE') {
        $action = 'delete_operator';
    }
}

// Reenviar a la lógica central de auth.php con el mismo contexto
require __DIR__ . '/auth.php';
