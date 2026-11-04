@echo off
title ParkFlow - Estado de Liquibase
color 0E
cd /D "%~dp0"

echo ==============================================================================
echo           PARKFLOW 2099 - ESTADO DE MIGRACIONES LIQUIBASE
echo ==============================================================================
echo.

if exist "C:\xampp\php\php.exe" (
    "C:\xampp\php\php.exe" -r "require 'run_migrations.php';"
) else (
    where mvn >nul 2>&1
    if "%ERRORLEVEL%"=="0" (
        mvn liquibase:status
    ) else (
        echo [!] Inicie XAMPP o configure Maven/Liquibase para ver el estado.
    )
)

echo.
pause
