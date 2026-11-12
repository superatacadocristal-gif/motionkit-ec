@echo off
setlocal
cd /d "%~dp0"
echo Feche o EffectCraft antes de continuar.
echo Instalacao local MotionKit EC, com backup da versao anterior.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Instalar-MotionKit.ps1"
echo.
if errorlevel 1 (
  echo Falha na instalacao. Veja a mensagem acima.
) else (
  echo Instalacao concluida. Inicie o EffectCraft novamente.
)
pause
