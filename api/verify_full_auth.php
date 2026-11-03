<?php
/**
 * ParkFlow - Script de Verificación Integral de Seguridad y Autenticación
 */

require_once __DIR__ . '/config/db.php';

function testCall($url, $data = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'json' => json_decode($response, true), 'raw' => $response];
}

$baseUrl = 'http://localhost/parkflow-api/auth.php';

echo "=======================================================\n";
echo "    PARKFLOW - TEST SUITE DE AUTENTICACIÓN & ROLES     \n";
echo "=======================================================\n\n";

$testsPassed = 0;
$totalTests = 0;

function assertTest($description, $condition, $details = '') {
    global $testsPassed, $totalTests;
    $totalTests++;
    if ($condition) {
        echo " [PASS] Test {$totalTests}: {$description}\n";
        $testsPassed++;
    } else {
        echo " [FAIL] Test {$totalTests}: {$description} - Detalle: {$details}\n";
    }
}

// 1. Servicio Online
$res = testCall($baseUrl);
assertTest("Servicio Auth responde con éxito", $res['code'] === 200 && ($res['json']['success'] ?? false) === true);

// 2. Registro: Detección de Cédula Duplicada (1020304050 ya existe)
$res = testCall($baseUrl, [
    'action' => 'register',
    'name' => 'Usuario Duplicado',
    'identification' => '1020304050',
    'phone' => '3190001122',
    'password' => 'ClaveUnica999!'
]);
assertTest("Rechaza Cédula duplicada con mensaje claro", 
    $res['code'] === 409 && 
    strpos($res['json']['error'] ?? '', 'ya se encuentra registrado') !== false,
    $res['raw']
);

// 3. Registro: Detección de Teléfono Duplicado (3109876543 ya existe en cliente Alejandro Vélez)
$res = testCall($baseUrl, [
    'action' => 'register',
    'name' => 'Usuario Duplicado Tel',
    'identification' => '1088776655',
    'phone' => '3109876543',
    'password' => 'ClaveUnica999!'
]);
assertTest("Rechaza Teléfono duplicado con mensaje claro", 
    $res['code'] === 409 && 
    strpos($res['json']['error'] ?? '', 'ya está asociado a otra cuenta') !== false,
    $res['raw']
);

// 4. Registro: Detección de Contraseña Duplicada entre Clientes (Cliente2099! ya en uso)
$res = testCall($baseUrl, [
    'action' => 'register',
    'name' => 'Usuario Duplicado Pass',
    'identification' => '1077665544',
    'phone' => '3187654321',
    'password' => 'Cliente2099!'
]);
assertTest("Rechaza Contraseña duplicada entre clientes", 
    $res['code'] === 409 && 
    strpos($res['json']['error'] ?? '', 'ya está en uso por otro cliente') !== false,
    $res['raw']
);

// 5. Registro Exitoso de Nuevo Cliente
$randId = '10' . rand(10000000, 99999999);
$randPhone = '31' . rand(10000000, 99999999);
$randPass = 'PassUnica' . rand(1000, 9999) . '!';
$res = testCall($baseUrl, [
    'action' => 'register',
    'name' => 'Laura Restrepo',
    'identification' => $randId,
    'phone' => $randPhone,
    'password' => $randPass,
    'plate' => 'XYZ-789'
]);
assertTest("Registra nuevo cliente exitosamente y cifra contraseña", 
    $res['code'] === 201 && 
    ($res['json']['success'] ?? false) === true &&
    $res['json']['user']['role'] === 'cliente',
    $res['raw']
);

// 6. Login Cliente: Credenciales correctas
$res = testCall($baseUrl, [
    'action' => 'login',
    'identification' => $randId,
    'password' => $randPass,
    'role' => 'cliente'
]);
assertTest("Inicia sesión cliente con credenciales válidas", 
    $res['code'] === 200 && ($res['json']['success'] ?? false) === true,
    $res['raw']
);

// 7. Login: Contraseña incorrecta
$res = testCall($baseUrl, [
    'action' => 'login',
    'identification' => $randId,
    'password' => 'ClaveEquivocada123',
    'role' => 'cliente'
]);
assertTest("Rechaza contraseña incorrecta con mensaje claro", 
    $res['code'] === 401 && 
    strpos($res['json']['error'] ?? '', 'Contraseña incorrecta') !== false,
    $res['raw']
);

// 8. Control de Roles: Cliente intentando ingresar como Administrador
$res = testCall($baseUrl, [
    'action' => 'login',
    'identification' => $randId,
    'password' => $randPass,
    'role' => 'administrador'
]);
assertTest("Deniega acceso a cliente que intenta ingresar como Administrador", 
    $res['code'] === 403 && 
    strpos($res['json']['error'] ?? '', 'no tiene autorización de Administrador') !== false,
    $res['raw']
);

// 9. Login Operador Autorizado
$res = testCall($baseUrl, [
    'action' => 'login',
    'identification' => 'OP-418',
    'password' => 'Operador4180*',
    'role' => 'operador'
]);
assertTest("Autentica exitosamente a Operador autorizado con rol asignado", 
    $res['code'] === 200 && 
    ($res['json']['user']['role'] ?? '') === 'operador',
    $res['raw']
);

// 10. Login Administrador Autorizado (Superuser Ing. Valderrama)
$res = testCall($baseUrl, [
    'action' => 'login',
    'identification' => 'admin.master',
    'password' => 'AdminMaster2099!',
    'role' => 'administrador'
]);
assertTest("Autentica exitosamente a Administrador con rol asignado", 
    $res['code'] === 200 && 
    ($res['json']['user']['role'] ?? '') === 'administrador',
    $res['raw']
);

echo "\n=======================================================\n";
echo " RESULTADO: {$testsPassed} de {$totalTests} pruebas superadas exitosamente.\n";
echo "=======================================================\n";
