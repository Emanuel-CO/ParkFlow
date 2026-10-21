@echo off
title Subir ParkFlow a GitHub
color 0B

echo ========================================================
echo        PARKFLOW - ACTUALIZAR REPOSITORIO EN GITHUB
echo ========================================================
echo.
echo [*] Guardando configuracion de autor...
git config --local user.name "Emanuel-CO"
git config --local user.email "ECO34860223@soy.sena.edu.co"

echo.
echo [*] Preparando archivos para commit...
git add .

echo.
echo [*] Creando commit de cambios...
git commit -m "feat: telemetria en tiempo real de ocupacion de puestos y graficas de estadisticas de ventas diarias y mensuales" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] No habia cambios nuevos pendientes por commitear (ya estan en el commit local).
)

echo.
echo ========================================================
echo [*] Subiendo a GitHub (https://github.com/Emanuel-CO/ParkFlow.git)...
echo Si el sistema te pide autorizacion, se abrira tu navegador
echo o una ventana de GitHub para iniciar sesion.
echo ========================================================
echo.
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  [EXITO] Todos los archivos se han subido a GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo  [ATENCION] No se pudo completar el push.
    echo  Verifica que hayas iniciado sesion en GitHub.
    echo ========================================================
)
echo.
pause
