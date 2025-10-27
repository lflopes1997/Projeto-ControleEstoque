@echo off
title Projeto Controle de Estoque - START SERVICES
setlocal

REM garante que estamos na raiz do projeto (onde tem package.json e docker-compose.yml)
cd /d "%~dp0"

REM sobe DB + espera porta 5432 + inicia API(3000) e WEB(5173)
npm run dev:ready

endlocal