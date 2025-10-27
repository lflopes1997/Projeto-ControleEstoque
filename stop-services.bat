@echo off
title Projeto Controle de Estoque - STOP SERVICES
setlocal enabledelayedexpansion

REM === Caminho raiz do projeto (esta pasta) ===
cd /d "%~dp0"

echo [API] Encerrando servidor na porta 3000 (se estiver rodando)...
for /f "tokens=*" %%P in ('powershell -NoP -C "(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select -First 1).OwningProcess"') do (
  if NOT "%%P"=="" (
    echo   PID: %%P
    taskkill /PID %%P /F >nul 2>&1
  ) else (
    echo   Nao ha processo escutando a porta 3000.
  )
)

echo [WEB] Encerrando servidor Vite na porta 5173 (se estiver rodando)...
for /f "tokens=*" %%P in ('powershell -NoP -C "(Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select -First 1).OwningProcess"') do (
  if NOT "%%P"=="" (
    echo   PID: %%P
    taskkill /PID %%P /F >nul 2>&1
  ) else (
    echo   Nao ha processo escutando a porta 5173.
  )
)

echo [DB] Derrubando containers Docker...
docker compose down

REM --- Opcoes uteis: descomente se quiser ---
REM docker compose down --remove-orphans
REM docker compose down -v    ^(CUIDADO: apaga dados do banco^)
REM docker compose down --rmi local

echo [OK] Servicos parados.
endlocal
