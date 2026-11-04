@echo off
title ParkFlow - Rollback de Liquibase
color 0C
cd /D "%~dp0"

echo ==============================================================================
echo           PARKFLOW 2099 - REVERSIÓN (ROLLBACK) LIQUIBASE
echo ==============================================================================
echo.
set /p COUNT="Numero de ChangeSets que desea revertir [por defecto 1]: "
if "%COUNT%"=="" set COUNT=1

echo [*] Revirtiendo %COUNT% ChangeSet(s)...

where mvn >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    mvn liquibase:rollback -Dliquibase.rollbackCount=%COUNT%
) else (
    where liquibase >nul 2>&1
    if "%ERRORLEVEL%"=="0" (
        liquibase rollbackCount %COUNT%
    ) else (
        echo [ERROR] Se requiere Maven o Liquibase CLI instalado para rollback automatico.
    )
)

echo.
pause
