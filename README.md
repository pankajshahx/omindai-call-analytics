# Omindai – Setup & Run

This project has three main parts:

- **Frontend** → React + Vite (Dockerized)
- **Backend** → Node + Express + Mongo (Dockerized)
- **Transcription** → By default uses **OpenAI Whisper API** (requires API key).

  > (I am personally using a local Whisper server, but it’s not part of this setup.)

---

## 1. Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/get-docker/) installed
- `.env` file (I will email/share it with you separately)

---

## 2. Setup

1. Place the `.env` file in the **project root** (same folder as `docker-compose.yml`).

   > ⚠️ Do not commit `.env` to git.

2. Build & start services (frontend, backend, mongo):

   ```bash
   docker-compose up --build -d
   ```

3. Check running containers:

   ```bash
   docker ps
   ```

---

## 3. Access the App

- **Frontend (React/Vite):** [http://localhost:5173](http://localhost:5173)
- **Backend (Node/Express):** [http://localhost:5000](http://localhost:5000)
- **MongoDB:** [mongodb://localhost:27017](mongodb://localhost:27017)
- **Transcription (via OpenAI Whisper API):** Uses your `OPENAI_API_KEY`

---

## 4. Stopping Services

```bash
docker-compose down
```
