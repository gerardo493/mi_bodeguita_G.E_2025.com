@echo off
echo Iniciando el sistema...
cd /d "%~dp0"
call .\venv\Scripts\activate
python app.py
pause 