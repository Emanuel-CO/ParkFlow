@echo off
title ParkFlow 2099 - Visualizador del Frontend Futurista
color 0B

echo =======================================================
echo     PARKFLOW 2099 // SMART PARKING TELEMETRY OS
echo     Lanzador del Frontend Futurista en Navegador
echo =======================================================
echo.
echo [*] Abriendo interfaz futurista con Gateway de Identificación...
echo [*] URL XAMPP: http://localhost/parkflow-api/frontend.html
echo [*] Archivo Local: %~dp0preview.html

start "" "http://localhost/parkflow-api/frontend.html"

echo.
echo [OK] Si Apache esta activo en XAMPP, se cargara desde localhost.
echo [INFO] Tambien puedes abrir directamente: preview.html con doble clic.
echo.
echo Roles listos para probar con Autenticacion Segura:
echo   - CLIENTE (Registro primer ingreso con Cedula, Telefono y Contrasena unica, o Login seguro)
echo   - OPERADOR (Carnet OP-418, Clave/PIN de Taquilla, Turno y barreras autorizadas)
echo   - ADMINISTRADOR (Usuario admin.master, Llave Cuantica, Token 2FA OTP, Telemetria y Graficas)
echo.
echo Novedades de Seguridad:
echo   * Registro seguro de clientes con validacion de duplicados en Cedula, Telefono y Contrasena.
echo   * Contrasenas cifradas con BCRYPT y SHA-256 en MySQL (parkflow_db).
echo   * Control estricto de roles: Nadie puede entrar como Admin u Operador sin cuenta autorizada.
echo.
pause
