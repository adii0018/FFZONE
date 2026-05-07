# FFZONE
hey gamers ❄️

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Git (optional)

### Running the Project

#### First Time Setup & Run
Double-click `run_project.bat` - यह automatically:
- Backend virtual environment बनाएगा
- सभी Python dependencies install करेगा
- Database migrations run करेगा
- Frontend dependencies install करेगा
- दोनों servers start करेगा

#### Quick Start (After First Setup)
Double-click `start_servers.bat` - यह सिर्फ servers start करेगा

#### Stop Servers
Double-click `stop_servers.bat` - यह सभी running servers को बंद कर देगा

### Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **Admin Panel**: http://127.0.0.1:8000/admin

### Manual Setup (Optional)

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure
- `backend/` - Django REST API
- `frontend/` - React + Vite frontend
- `run_project.bat` - Complete setup and run
- `start_servers.bat` - Quick server start
- `stop_servers.bat` - Stop all servers

## 🎮 Features
- Tournament Management
- User Authentication & Profiles
- Payment Integration (Razorpay)
- Leaderboards
- Team Finder
- Admin Dashboard

---
Made with ❤️ for gamers
