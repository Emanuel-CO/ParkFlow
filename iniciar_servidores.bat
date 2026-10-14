@echo off
title ParkFlow - Iniciador de Servidores XAMPP (Apache & MySQL)
color 0A

echo =======================================================
echo          PARKFLOW - SISTEMA DE PARQUEADERO
echo          Conexion XAMPP (Apache, PHP, MySQL)
echo =======================================================
echo.

:: 1. Verificar directorio XAMPP
if not exist "C:\xampp" (
    echo [ERROR] No se encontro la carpeta C:\xampp en tu equipo.
    echo Asegurate de que XAMPP este instalado en C:\xampp.
    pause
    exit /b
)

:: 2. Crear enlace simbolico de la API si no existe
if not exist "C:\xampp\htdocs\parkflow-api" (
    echo [*] Creando enlace a C:\xampp\htdocs\parkflow-api ...
    mklink /J "C:\xampp\htdocs\parkflow-api" "%~dp0api"
)

:: 3. Iniciar MySQL si no esta corriendo
echo [*] Verificando servicio MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL ya se encuentra en ejecucion.
) else (
    echo [*] Iniciando MySQL de XAMPP...
    start "" /D "C:\xampp" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 2 /nobreak >nul
)

:: 4. Iniciar Apache si no esta corriendo
echo [*] Verificando servicio Apache...
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Apache ya se encuentra en ejecucion.
) else (
    echo [*] Iniciando Apache de XAMPP...
    start "" /D "C:\xampp\apache" "C:\xampp\apache\bin\httpd.exe"
    timeout /t 2 /nobreak >nul
)

echo.
echo =======================================================
echo  [OK] Servicios listos en XAMPP!
echo  - Base de Datos: MySQL (localhost:3306)
echo  - Nombre DB: parkflow_db
echo  - API PHP: http://localhost/parkflow-api/
echo  - phpMyAdmin: http://localhost/phpmyadmin/
echo =======================================================
echo.
echo Abriendo panel de control de la API en el navegador...
start http://localhost/parkflow-api/

pause
