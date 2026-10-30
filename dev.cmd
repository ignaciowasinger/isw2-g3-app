@echo off
REM Arranca Expo con Node 24.
REM Expo SDK 58 exige Node ^22.13.0 || ^24.3.0 || ^26.0.0 || >=27.0.0 y el Node del sistema es 20.
REM Si Node 24 esta en otra ruta, defini SABORES_NODE antes de ejecutar este archivo.
setlocal

if defined SABORES_NODE (
  set "PATH=%SABORES_NODE%;%PATH%"
) else if exist "C:\Users\Nacho\AppData\Local\Programs\nodejs-24\node.exe" (
  set "PATH=C:\Users\Nacho\AppData\Local\Programs\nodejs-24;%PATH%"
)

for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
echo Node %NODE_VERSION%

call npx.cmd expo start %*
