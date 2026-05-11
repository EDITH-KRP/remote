# Remote Support & Service Desk Management Portal

## Overview
A modern, complete full-stack web application for handling support requests, assigning tickets to staff, and tracking resolution status.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts
- **Backend**: Python Flask, SQLAlchemy, Flask-JWT-Extended
- **Database**: PostgreSQL (Supabase / Neon)

## Features
- JWT Role-based Authentication (User, Support, Admin)
- Modern Glassmorphic UI with Parallax animations
- Support Ticket Management (Create, Update, Assign)
- Admin Dashboard with metrics and charts
- Responsive and Dark Mode support

## Setup Instructions

### 1. Database (Supabase)
1. Create a project on [Supabase](https://supabase.com).
2. Copy the Postgres connection URL.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Copy .env.example to .env and fill in variables
cp .env.example .env

# Run the app (will auto-create tables)
python run.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env from example
cp .env.example .env

# Start dev server
npm run dev
```

## Deployment Instructions

### Deploy Frontend to Vercel
1. Push your code to GitHub.
2. Go to Vercel and import the repository.
3. Set the Framework Preset to `Vite`.
4. Set the Environment Variable: `VITE_API_URL` to your backend URL.
5. Deploy.

### Deploy Backend to Railway
1. Go to [Railway](https://railway.app).
2. Create a new project from your GitHub repo (select the `/backend` directory).
3. Under Variables, add all the environment variables from your `.env` file (e.g., `DATABASE_URL`, `JWT_SECRET_KEY`).
4. Railway will automatically detect the Python environment and install `requirements.txt`.
5. Create a custom Start Command if needed: `gunicorn run:app`.

### Deploy Database to Supabase
You just use the connection URL provided by Supabase in your backend environment variables (`DATABASE_URL`).
