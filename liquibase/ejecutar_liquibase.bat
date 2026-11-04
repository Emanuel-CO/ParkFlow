@echo off
title ParkFlow - Ejecutor de Migraciones Liquibase
color 0B
setlocal enabledelayedexpansion

echo ==============================================================================
echo           PARKFLOW 2099 - GESTOR DE MIGRACIONES LIQUIBASE
echo           Control de Versiones y Montaje de Base de Datos
echo ==============================================================================
echo.

:: Cambiar al directorio del script
cd /D "%~dp0"

:: 1. Verificar si MySQL de XAMPP está activo
echo [*] Paso 1: Verificando servicio de base de datos MySQL (localhost:3306)...
netstat -ano | find "3306" | find "LISTENING" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL se encuentra activo en el puerto 3306.
) else (
    echo [!] MySQL no parece estar respondiendo en el puerto 3306.
    echo [*] Intentando iniciar MySQL de XAMPP automaticamente...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "" /D "C:\xampp" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 3 /nobreak >nul
    ) else (
        echo [ADVERTENCIA] Asegurate de que XAMPP MySQL este iniciado antes de continuar.
    )
)

echo.
echo [*] Paso 2: Buscando ejecutor de Liquibase disponible...

:: Metodo A: Maven + JDK (NetBeans o Sistema)
set "MVN_CMD="
if exist "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" (
    set "MVN_CMD=C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd"
    if exist "C:\Program Files\Apache NetBeans\jdk" (
        set "JAVA_HOME=C:\Program Files\Apache NetBeans\jdk"
    )
) else (
    where mvn >nul 2>&1
    if "%ERRORLEVEL%"=="0" set "MVN_CMD=mvn"
)

:: Metodo B: Liquibase CLI nativo
set "LIQUIBASE_CLI="
where liquibase >nul 2>&1
if "%ERRORLEVEL%"=="0" set "LIQUIBASE_CLI=liquibase"

:: Metodo C: PHP Runner de XAMPP
set "PHP_CMD="
if exist "C:\xampp\php\php.exe" (
    set "PHP_CMD=C:\xampp\php\php.exe"
) else (
    where php >nul 2>&1
    if "%ERRORLEVEL%"=="0" set "PHP_CMD=php"
)

:: Decision de ejecucion
if defined LIQUIBASE_CLI (
    echo [*] Ejecutando via Liquibase CLI Nativo...
    liquibase update
    goto FINISH
)

if defined PHP_CMD (
    echo [*] Ejecutando via Motor de Migraciones Liquibase PHP...
    "%PHP_CMD%" run_migrations.php
    goto FINISH
)

if defined MVN_CMD (
    echo [*] Ejecutando via Maven Liquibase Plugin...
    call "%MVN_CMD%" liquibase:update
    goto FINISH
)

echo [ERROR] No se encontro ni PHP ni Maven ni Liquibase CLI en el sistema.
pause
exit /b 1

:FINISH
echo.
echo ==============================================================================
echo [OK] Proceso de migraciones Liquibase completado!
echo Tablas auditadas en parkflow_db:
echo   - DATABASECHANGELOG (Historial auditable)
echo   - DATABASECHANGELOGLOCK (Control de concurrencia)
echo ==============================================================================
echo.
pause
