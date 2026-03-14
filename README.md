# CYBERSHIELD – AI Powered Cyberbullying Detection System

Production-style full-stack app with React + Express + MongoDB + FastAPI ML inference.

## Project Structure

- `frontend/` – React + Vite + Tailwind + Framer Motion + Recharts
- `backend/` – Express API with MongoDB storage and analytics
- `ml_api/` – FastAPI inference service using `model.pkl` and `vectorizer.pkl`

## Environment Variables

Root `.env` is included with defaults:

- `PORT`
- `MONGODB_URI`
- `ML_API_URL`
- `VITE_API_URL`

You can also copy:

- `backend/.env.example`
- `frontend/.env.example`

## Run Locally

### 1) ML API

From `ml_api/`:

- Install dependencies from `requirements.txt`
- Run FastAPI with uvicorn on port `8000`

### 2) Backend API

From `backend/`:

- Install dependencies
- Start server on port `5000`

### 3) Frontend

From `frontend/`:

- Install dependencies
- Start Vite dev server on port `5173`

## API Endpoints

### Backend (`/api`)

- `POST /analyze`
- `POST /save`
- `GET /analytics`

### ML API

- `POST /predict`
- `GET /health`

## Notes on Pickle Integration

Uploaded files:

- `model (1).pkl`
- `vectorizer (1).pkl`

have been integrated into:

- `ml_api/model.pkl`
- `ml_api/vectorizer.pkl`

The FastAPI loader also supports both standard and `(1)` filenames.
