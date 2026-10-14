<?php
/**
 * ParkFlow - Conexión a Base de Datos MySQL con XAMPP
 * Configuración PDO con cabeceras CORS
 */

// Cabeceras CORS para permitir peticiones desde el frontend (Vite / React en cualquier puerto)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de peticiones OPTIONS pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost';
$db_port = '3306';
$db_name = 'parkflow_db';
$db_user = 'root';
$db_pass = ''; // Contraseña por defecto en XAMPP

function getDbConnection($selectDatabase = true) {
    global $db_host, $db_port, $db_name, $db_user, $db_pass;
    
    try {
        $dsn = "mysql:host={$db_host};port={$db_port};charset=utf8mb4";
        if ($selectDatabase) {
            $dsn .= ";dbname={$db_name}";
        }
        
        $pdo = new PDO($dsn, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

function sendError($message, $statusCode = 400, $extra = []) {
    http_response_code($statusCode);
    $response = array_merge(['success' => false, 'error' => $message], $extra);
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}
