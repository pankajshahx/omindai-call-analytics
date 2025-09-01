# Intelligent Speech Analytics and Coaching Platform

## Overview

This is a scalable SaaS platform that enables users to upload large audio files, transcribe them using speech-to-text (STT) technology, analyze transcripts for quality metrics, and deliver actionable coaching insights through a real-time dashboard.

[[🔗 Link for more detailed design (Excalidrawhttp)]](https://excalidraw.com/#json=YcpfvEpCoJ5ugKvR3oIeb,b6LItCrzkL0NRJRvKi6s1g)

<img width="10495" height="3850" alt="Image" src="https://github.com/user-attachments/assets/28324ffd-714b-4927-b439-30fdcd9ddf62" />  

---

## Step-by-Step Process

### 1. Audio Upload

* Users upload audio files through a client interface.
* The client interacts with an **API Gateway** for authentication, routing, and rate limiting.
* Files are uploaded directly to **AWS S3** via pre-signed URLs for secure storage.
* Audio metadata (filename, timestamp, user details) is captured and stored in a **metadata database**.

---

### 2. Chunking (for Large Audio Files)

* For large audio files (up to 100 GB), a **Chunker Service** splits the file into 30–60 second chunks.
* Each chunk is stored individually in S3.
* Chunk metadata and processing status (`pending`, `processing`, `completed`) are tracked in the metadata database.
* This allows parallelism, fault tolerance, and resumable processing.

---

### 3. Dashboard (Pre-Processing View)

* The dashboard lists all uploaded audios with their metadata and status.
* Each record shows **actions**:

  * **Transcribe** → to trigger STT processing.
  * **Analyze** → to generate insights from transcripts (only enabled after transcription).

---

### 4. Speech-to-Text (STT) Processing

* When **Transcribe** is triggered:

  1. The service fetches audio (or chunks) from S3.
  2. Each chunk is processed sequentially/asynchronously by the STT engine.
  3. Transcriptions are stored back into S3 with `chunkId` and `timestamp` for fault tolerance.
  4. If processing fails midway, it resumes from the last processed chunk.
  5. After all chunks are processed, transcripts are **merged in order (by ID and timestamp)** into a complete transcript.

---

### 5. Transcript Analysis (LLM-Powered)

* Once a transcript is ready, users hit **Analyze** on the dashboard.
* The transcript is sent to an **LLM Analysis Service** which generates:

  * Sentiment analysis
  * Issue/objection capture
  * Coaching recommendations
  * Quiz generation for training
* Results are stored in the analysis database and reflected in the dashboard.

---

## Non-Functional Requirements

* **Strong consistency** for critical metadata (uploads, chunk status, transcripts).
* **High availability** for concurrent uploads and batch processing.
* **Partition tolerance** with retry mechanisms and eventual consistency.
* **Horizontal scalability** to handle very large audio files.
* **Fault tolerance & resumability** through chunked storage and checkpointing.

---

## Core Entities

* **Audio**
* **Audio Metadata**
* **Chunk**
* **Transcript**
* **User**

---

## APIs Overview

* **POST /upload** → Upload audio + metadata, initiate chunking if needed.
* **POST /transcribe/\:audioId** → Trigger STT transcription pipeline.
* **POST /analyze/\:audioId** → Run transcript analysis with LLM.
* **GET /all** → Retrieve all audio records with status for dashboard.

---

## Architecture Highlights

* **AWS S3** is the central storage for audio and transcripts.
* **Chunker Service** improves scalability and recovery.
* **STT + LLM services** provide transcription and insights in decoupled steps.
* **Dashboard-driven workflow** ensures user control and visibility of each stage.
* Designed for **scalability, resilience, and real-time insight delivery**.
