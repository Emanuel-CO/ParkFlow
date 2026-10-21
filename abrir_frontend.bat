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
echo Roles listos para probar:
echo   - CLIENTE (Cedula, Placa, Seleccion de Puesto y Auto-Ticket Digital)
echo   - OPERADOR (Carnet OP-418, PIN, Turno taquilla y barreras)
echo   - ADMINISTRADOR (Mapa con Telemetria en Tiempo Real + Graficas de Ventas Hoy y Mes)
echo.
echo Novedades activas:
echo   * Telemetria en Vivo: Cuando el cliente ocupa un puesto, el Administrador
echo     lo ve reflejado al instante en el mapa digital con alerta sonica y badge NUEVO.
echo   * Graficas de Estadisticas: Curva de ingresos por hora de hoy y acumulado del mes.
echo.
pause
