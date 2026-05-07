@echo off
echo ========================================
echo    FFZONE Project Launcher
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Python and Node.js found!
echo.

REM ========================================
REM Backend Setup
REM ========================================
echo ========================================
echo    Setting up Backend...
echo ========================================

cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created!
) else (
    echo [INFO] Virtual environment already exists.
)

REM Activate virtual environment and install dependencies
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

echo [INFO] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies!
    pause
    exit /b 1
)

echo [INFO] Running Django migrations...
python manage.py makemigrations
python manage.py migrate

echo [SUCCESS] Backend setup complete!
echo.

cd ..

REM ========================================
REM Frontend Setup
REM ========================================
echo ========================================
echo    Setting up Frontend...
echo ========================================

cd frontend

REM Install npm dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install npm dependencies!
        pause
        exit /b 1
    )
    echo [SUCCESS] npm dependencies installed!
) else (
    echo [INFO] node_modules already exists. Skipping npm install.
)

cd ..

REM ========================================
REM Start Servers
REM ========================================
echo.
echo ========================================
echo    Starting Servers...
echo ========================================
echo.
echo [INFO] Backend will run on: http://127.0.0.1:8000
echo [INFO] Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C in any window to stop the servers
echo.
timeout /t 3 >nul

REM Start backend server in new window
start "FFZONE Backend Server" cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver"

REM Wait a bit for backend to start
timeout /t 3 >nul

REM Start frontend server in new window
start "FFZONE Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    Servers Started Successfully!
echo ========================================
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Close this window or press any key to exit launcher...
pause >nul
