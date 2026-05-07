@echo off
echo ========================================
echo    FFZONE - Quick Start
echo ========================================
echo.
echo Starting Backend and Frontend servers...
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C in server windows to stop
echo.

REM Start backend server
start "FFZONE Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver"

REM Wait for backend to initialize
timeout /t 3 >nul

REM Start frontend server
start "FFZONE Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Servers started! Close this window or press any key...
pause >nul
