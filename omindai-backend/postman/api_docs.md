# 📖 API Documentation – OmindAI Call Analytics

Base URL:

```
http://localhost:5000
```

All protected routes require a **JWT token** in the header:

```
Authorization: Bearer <your_token>
```

---

## 🔑 Authentication

### 📝 Signup

**Endpoint:**

```
POST /api/signup
```

**Body (JSON):**

```json
{
  "username": "alice",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "userId": "..."
}
```

---

### 🔐 Login

**Endpoint:**

```
POST /api/login
```

**Body (JSON):**

```json
{
  "username": "alice",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "<jwt_token>"
}
```

---

### 👤 Profile

**Endpoint:**

```
GET /api/profile
```

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "username": "alice",
  "createdAt": "2025-08-31T..."
}
```

---

## 🎙️ Audio Upload & Analysis

### 📤 Upload Audio(s)

**Endpoint:**

```
POST /api/upload
```

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body (form-data):**

```
audios: <file(s)>   // supports up to 5 files
```

**Response:**

```json
{
  "audios": [
    {
      "id": "68b3134b4f3d153e3c8c1832",
      "fileName": "call1.mp3",
      "transcript": "Hello, thanks for calling...",
      "status": "transcribed"
    }
  ]
}
```

---

### 📊 Analyze Transcript

**Endpoint:**

```
POST /api/analyze/:audioId
```

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Body (form-data or raw JSON not required here unless additional inputs).**

**Example URL:**

```
/api/analyze/68b3134b4f3d153e3c8c1832
```

**Response:**

```json
{
  "analysis": {
    "sentiment": "positive",
    "clarity": 8,
    "csat": 7,
    "recommendations": "Improve greeting tone."
  }
}
```

---

### 📚 Get All Audio Analyses

**Endpoint:**

```
GET /api/all
```

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "audios": [
    {
      "id": "68b3134b4f3d153e3c8c1832",
      "fileName": "call1.mp3",
      "transcript": "...",
      "analysis": { "sentiment": "positive", "csat": 7 }
    },
    {
      "id": "78c9aaf5d4e233e3c9d12345",
      "fileName": "call2.mp3",
      "transcript": "...",
      "analysis": { "sentiment": "negative", "csat": 4 }
    }
  ]
}
```

---

