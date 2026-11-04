@echo off
title ParkFlow - Montar Base de Datos con Liquibase
color 0A
setlocal

echo ==============================================================================
echo           PARKFLOW 2099 - INICIALIZADOR DE BASE DE DATOS
echo           Migraciones declarativas con Liquibase
echo ==============================================================================
echo.

cd /D "%~dp0liquibase"
call ejecutar_liquibase.bat

echo.
pause
