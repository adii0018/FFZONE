@echo off
echo ========================================
echo    Stopping FFZONE Servers...
echo ========================================
echo.

REM Kill Python processes (Django backend)
taskkill /F /FI "WINDOWTITLE eq FFZONE Backend*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq *manage.py*" >nul 2>&1

REM Kill Node processes (Vite frontend)
taskkill /F /FI "WINDOWTITLE eq FFZONE Frontend*" >nul 2>&1

echo [SUCCESS] All servers stopped!
echo.
pause
