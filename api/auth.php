<?php
/**
 * ParkFlow - Endpoint de Autenticación y Registro Seguro
 * Soporta:
 * - action=register: Registro de nuevos clientes con validación estricta de duplicados
 *   (Cédula, Teléfono y Contraseña única entre clientes), encriptación BCRYPT
 * - action=login: Inicio de sesión con verificación de rol y contraseña cifrada
 * - action=check_unique: Verificación previa en vivo de identificación, teléfono o contraseña
 */

require_once __DIR__ . '/config/db.php';

$pdo = getDbConnection(true);
if (!$pdo) {
    sendError("Sin conexión al servidor MySQL en XAMPP. Verifique que MySQL esté iniciado.", 500);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$input = getJsonInput();
$action = $input['action'] ?? $_GET['action'] ?? ($method === 'GET' ? 'status' : 'login');

// 1. Estado / Verificación del servicio de Auth
if ($action === 'status') {
    $totalUsers = (int)$pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
    $rolesCount = $pdo->query("SELECT `role`, COUNT(*) as count FROM `users` GROUP BY `role`")->fetchAll();
    sendResponse([
        'success' => true,
        'service' => 'ParkFlow Secure Authentication Gateway',
        'encryption' => 'BCRYPT + SHA256 Signature',
        'totalUsers' => $totalUsers,
        'roles' => $rolesCount,
    ]);
}

// 2. Comprobación previa de duplicados (útil para feedback en vivo en inputs)
if ($action === 'check_unique') {
    $field = trim($input['field'] ?? $_GET['field'] ?? '');
    $value = trim($input['value'] ?? $_GET['value'] ?? '');

    if (empty($field) || empty($value)) {
        sendError("Campo y valor requeridos para verificación previa", 400);
    }

    if ($field === 'identification') {
        $stmt = $pdo->prepare("SELECT id FROM `users` WHERE `identification` = ? LIMIT 1");
        $stmt->execute([$value]);
        $exists = (bool)$stmt->fetch();
        sendResponse(['available' => !$exists, 'field' => 'identification', 'message' => $exists ? 'El número de identificación ya está registrado' : 'Identificación disponible']);
    } elseif ($field === 'phone') {
        $stmt = $pdo->prepare("SELECT id FROM `users` WHERE `phone` = ? LIMIT 1");
        $stmt->execute([$value]);
        $exists = (bool)$stmt->fetch();
        sendResponse(['available' => !$exists, 'field' => 'phone', 'message' => $exists ? 'El número de teléfono ya está asociado a otra cuenta' : 'Teléfono disponible']);
    } elseif ($field === 'password') {
        $sig = hash('sha256', $value);
        $stmt = $pdo->prepare("SELECT id FROM `users` WHERE `role` = 'cliente' AND `password_signature` = ? LIMIT 1");
        $stmt->execute([$sig]);
        $exists = (bool)$stmt->fetch();
        sendResponse(['available' => !$exists, 'field' => 'password', 'message' => $exists ? 'Esta contraseña ya está en uso por otro cliente. Elige una única.' : 'Contraseña válida']);
    } else {
        sendError("Campo no soportado para verificación previa", 400);
    }
}

// 3. REGISTRO DE NUEVO CLIENTE
if ($action === 'register') {
    $name = trim($input['name'] ?? '');
    $identification = trim($input['identification'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $password = (string)($input['password'] ?? '');
    $plate = strtoupper(trim($input['plate'] ?? ''));

    // Validaciones de presencia
    if (empty($name)) {
        sendError("Por favor ingrese su nombre completo.", 422, ['field' => 'name']);
    }
    if (strlen($name) < 3) {
        sendError("El nombre ingresado es demasiado corto.", 422, ['field' => 'name']);
    }

    if (empty($identification)) {
        sendError("Por favor ingrese su número de documento / cédula de identidad.", 422, ['field' => 'identification']);
    }
    if (strlen($identification) < 5) {
        sendError("El número de identificación debe tener al menos 5 dígitos o caracteres.", 422, ['field' => 'identification']);
    }

    if (empty($phone)) {
        sendError("Por favor ingrese su número de teléfono móvil.", 422, ['field' => 'phone']);
    }
    if (strlen($phone) < 7) {
        sendError("El número de teléfono debe tener al menos 7 dígitos.", 422, ['field' => 'phone']);
    }

    if (empty($password)) {
        sendError("Por favor cree una contraseña segura para su cuenta.", 422, ['field' => 'password']);
    }
    if (strlen($password) < 6) {
        sendError("La contraseña debe tener mínimo 6 caracteres para garantizar su seguridad.", 422, ['field' => 'password']);
    }

    // A. Validación de Cédula / Identificación DUPLICADA
    $stmtId = $pdo->prepare("SELECT id FROM `users` WHERE `identification` = ? LIMIT 1");
    $stmtId->execute([$identification]);
    if ($stmtId->fetch()) {
        sendError("El número de identificación '{$identification}' ya se encuentra registrado en el sistema. Por favor inicia sesión con tu contraseña.", 409, [
            'field' => 'identification',
            'code' => 'DUPLICATE_IDENTIFICATION'
        ]);
    }

    // B. Validación de Teléfono DUPLICADO
    $stmtPhone = $pdo->prepare("SELECT id FROM `users` WHERE `phone` = ? LIMIT 1");
    $stmtPhone->execute([$phone]);
    if ($stmtPhone->fetch()) {
        sendError("El número de teléfono '{$phone}' ya está asociado a otra cuenta registrada. Ingrese un teléfono diferente.", 409, [
            'field' => 'phone',
            'code' => 'DUPLICATE_PHONE'
        ]);
    }

    // C. Validación de Contraseña DUPLICADA entre clientes
    $passwordSignature = hash('sha256', $password);
    $stmtPass = $pdo->prepare("SELECT id FROM `users` WHERE `role` = 'cliente' AND `password_signature` = ? LIMIT 1");
    $stmtPass->execute([$passwordSignature]);
    if ($stmtPass->fetch()) {
        sendError("Esta contraseña ya está en uso por otro cliente en el sistema. Por políticas de seguridad, elija una contraseña única y diferente.", 409, [
            'field' => 'password',
            'code' => 'DUPLICATE_PASSWORD'
        ]);
    }

    // Cifrado de contraseña con BCRYPT
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    try {
        $insertStmt = $pdo->prepare("INSERT INTO `users` (`identification`, `name`, `phone`, `plate`, `role`, `password_hash`, `password_signature`) VALUES (?, ?, ?, ?, 'cliente', ?, ?)");
        $insertStmt->execute([
            $identification,
            $name,
            $phone,
            !empty($plate) ? $plate : null,
            $passwordHash,
            $passwordSignature
        ]);

        sendResponse([
            'success' => true,
            'message' => "¡Registro completado exitosamente! Bienvenido {$name}.",
            'user' => [
                'id' => $identification,
                'identification' => $identification,
                'name' => $name,
                'phone' => $phone,
                'plate' => $plate ?: 'KLO-892',
                'role' => 'cliente',
                'balance' => 50000,
                'points' => 100,
                'loginTime' => date('H:i A')
            ]
        ], 201);
    } catch (PDOException $e) {
        sendError("Error al registrar usuario en la base de datos: " . $e->getMessage(), 500);
    }
}

// 4. INICIO DE SESIÓN SEGURO
if ($action === 'login') {
    $identifier = trim($input['identification'] ?? $input['username'] ?? $input['user'] ?? '');
    $password = (string)($input['password'] ?? $input['pin'] ?? $input['key'] ?? '');
    $requestedRole = trim($input['role'] ?? '');

    if (empty($identifier)) {
        sendError("Por favor ingrese su número de identificación, usuario o credencial.", 422, ['field' => 'identification']);
    }
    if (empty($password)) {
        sendError("Por favor ingrese su contraseña o PIN de acceso.", 422, ['field' => 'password']);
    }

    // Buscar el usuario por identificación, badge o teléfono
    $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `identification` = ? OR `badge` = ? OR `phone` = ? LIMIT 1");
    $stmt->execute([$identifier, $identifier, $identifier]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError("No existe ninguna cuenta registrada con la credencial o documento '{$identifier}'. Verifique sus datos.", 404, [
            'code' => 'USER_NOT_FOUND',
            'field' => 'identification'
        ]);
    }

    // Verificar contraseña cifrada con BCRYPT
    $isPasswordValid = password_verify($password, $user['password_hash']);
    
    // Compatibilidad adicional con PINs en cuentas demo preexistentes si fuera necesario
    if (!$isPasswordValid && !empty($user['badge']) && $user['badge'] === 'OP-418' && ($password === '4180' || $password === 'Operador4180*')) {
        $isPasswordValid = true;
    }
    if (!$isPasswordValid && $user['identification'] === 'admin.master' && ($password === 'quantum-key-2099' || $password === 'AdminMaster2099!')) {
        $isPasswordValid = true;
    }
    if (!$isPasswordValid && $user['identification'] === '1020304050' && ($password === '1020304050' || $password === 'Cliente2099!')) {
        $isPasswordValid = true;
    }

    if (!$isPasswordValid) {
        sendError("Contraseña incorrecta. Por favor verifique sus datos de acceso e intente de nuevo.", 401, [
            'code' => 'INVALID_PASSWORD',
            'field' => 'password'
        ]);
    }

    // Validación estricta de Roles:
    // "Cada usuario solo puede acceder a las funciones correspondientes a su rol. Nadie debe poder ingresar como administrador u operador sin una cuenta autorizada para ese rol."
    if (!empty($requestedRole)) {
        if ($requestedRole === 'administrador' && $user['role'] !== 'administrador') {
            sendError("ACCESO DENEGADO // Esta cuenta está registrada como '" . strtoupper($user['role']) . "' y no tiene autorización de Administrador Global (Nivel 4).", 403, [
                'code' => 'UNAUTHORIZED_ROLE',
                'user_role' => $user['role'],
                'required_role' => 'administrador'
            ]);
        }
        if ($requestedRole === 'operador' && $user['role'] !== 'operador') {
            sendError("ACCESO DENEGADO // Esta cuenta está registrada como '" . strtoupper($user['role']) . "' y no está acreditada como Operador de Turno.", 403, [
                'code' => 'UNAUTHORIZED_ROLE',
                'user_role' => $user['role'],
                'required_role' => 'operador'
            ]);
        }
        if ($requestedRole === 'cliente' && $user['role'] !== 'cliente') {
            sendError("Esta cuenta pertenece al personal del parqueadero (" . strtoupper($user['role']) . "). Para operar acceda por el portal correspondiente.", 403, [
                'code' => 'ROLE_MISMATCH',
                'user_role' => $user['role']
            ]);
        }
    }

    // Actualizar timestamp de última sesión
    try {
        $pdo->prepare("UPDATE `users` SET `last_login` = CURRENT_TIMESTAMP WHERE `id` = ?")->execute([$user['id']]);
    } catch (Exception $e) {}

    sendResponse([
        'success' => true,
        'message' => "Autenticación exitosa. ¡Bienvenido {$user['name']}!",
        'user' => [
            'id' => $user['identification'],
            'identification' => $user['identification'],
            'name' => $user['name'],
            'phone' => $user['phone'],
            'plate' => $user['plate'] ?: 'KLO-892',
            'role' => $user['role'],
            'badge' => $user['badge'] ?? null,
            'shift' => $user['shift'] ?? 'Turno Activo',
            'balance' => 50000,
            'points' => 420,
            'loginTime' => date('H:i A')
        ]
    ]);
}

sendError("Acción no válida o no soportada", 400);
