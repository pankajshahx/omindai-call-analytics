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




# 📊 OmindAI Call Analytics – Workflow

This project provides an **AI-powered call analytics system** with authentication, dashboards, and audio transcription.

---

## 🚀 User Workflow

### 🔑 1. Login / Signup

* Users can **register** for a new account or **log in** with existing credentials.
* JWT-based authentication is used for secure session handling.
* API keys (OpenAI / Gemini) are required for AI features.
<img width="1917" height="867" alt="login" src="https://github.com/user-attachments/assets/c5e9ac02-6c57-4145-a65a-56a040d1e868" />
<img width="1918" height="865" alt="Signup" src="https://github.com/user-attachments/assets/59a316b5-610b-471f-a0d8-dda785160d44" />

---

### 📂 2. Dashboard

* After login, users land on the **Dashboard**.
* Dashboard provides:

  * Overview of uploaded calls.
  * Key metrics (sentiment, CSAT, resolution quality, etc.).
  * Quick access to coaching plans and transcripts.
<img width="1917" height="872" alt="dashboard" src="https://github.com/user-attachments/assets/c20aae24-1c74-4324-addb-2fe6f817be27" />
<img width="1918" height="865" alt="dashboard2" src="https://github.com/user-attachments/assets/0bfdfcca-7a72-4c4f-9839-63e00056b1ba" />
<img width="1918" height="867" alt="dashboard3" src="https://github.com/user-attachments/assets/7f3619a8-5f48-46bb-9967-56fb92846553" />

---

### 🎙️ 3. Upload Call Recordings

* Users can upload an **audio file** (`.mp3`, `.wav`, etc.).
* The backend will attempt:

  1. **OpenAI Whisper API** (if `OPENAI_API_KEY` is present).
  2. If not available → fallback to **local Whisper server**.
* Transcript is then analyzed by **Gemini or OpenAI models** for call-quality scoring.
<img width="1918" height="868" alt="upload" src="https://github.com/user-attachments/assets/64b66b00-45f4-4edf-8004-8303daa075dd" />
<img width="1915" height="866" alt="uploadinprogress" src="https://github.com/user-attachments/assets/4a47242d-59b5-4d7d-9810-87020bbf12b1" />

---


---

## 📖 API Documentation

- 📄 [API Docs (`api.md`)](https://github.com/pankajshahx/omindai-call-analytics/blob/main/omindai-backend/postman/api_docs.md)
- 🔗 [Postman Collection](http://github.com/pankajshahx/omindai-call-analytics/blob/main/omindai-backend/postman/postman_collection.json)

---


## 🔄 Processing Flow

1. **Upload audio file**
2. **Transcription** → Whisper (OpenAI or local).
3. **Analysis** → Gemini / OpenAI model generates structured JSON with quality scores & coaching.
4. **Dashboard update** → View metrics, transcript snippets, and coaching recommendations.

---

✅ That’s the core workflow: **Login → Dashboard → Upload → AI Analysis → Insights**.

---

