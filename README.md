# NoteSense – AI Study Notes & Doubt-Solving Assistant

![NoteSense Architecture](https://img.shields.io/badge/Architecture-MERN%20%2B%20FastAPI-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB.svg)
![Node](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933.svg)
![Python](https://img.shields.io/badge/AI_Pipeline-Python%20%7C%20FastAPI-3776AB.svg)
![AI/ML](https://img.shields.io/badge/ML-TrOCR%20%7C%20SentenceTransformers-FF9900.svg)

NoteSense is a dual-stack web application designed to solve two core problems for students: **disorganized notes** and **unanswered doubts**. It ingests study notes (typed or handwritten/scanned images), automatically clusters them by topic, and provides a RAG (Retrieval-Augmented Generation) assistant that strictly cites the student's own material.

## Features

- **MERN Stack Web App**: 
  - Note uploads (images/text) and a beautiful subject/topic dashboard.
  - Custom spaced-repetition (SM-2) flashcard reviewer.
  - Complete user authentication via JWT-protected routes.
- **Python/FastAPI AI Microservice**:
  - **Deep Learning OCR**: Uses Tesseract for fast extraction, and seamlessly falls back to a Transformer-based Deep Learning OCR (Microsoft TrOCR) for hard-to-read handwritten notes.
  - **Semantic Search & Clustering**: Uses `sentence-transformers` and FAISS for fast vector search. `KMeans` clustering automatically groups uploaded notes by semantic topics.
  - **RAG Doubt-Solver**: An AI assistant that answers questions by searching ONLY through your uploaded notes, providing exact citations and snippets.
  - **Generative AI**: Auto-generates spaced-repetition flashcards and quizzes per topic to aid active recall.

## Architecture

```text
React Client (Vite)  <--->  Node.js/Express API  <--->  Python/FastAPI Microservice
     (Frontend)           (Auth, DB, Orchestration)        (OCR, FAISS, RAG, GenAI)
```
- **Database**: MongoDB (Mongoose)
- **Vector Store**: FAISS `IndexFlatIP`
- **Inter-service Auth**: Secure internal API keys

## Quick Start

### 1. Backend (Express API)
```bash
cd server
npm install
# Ensure MongoDB is running locally
node index.js
```

### 2. AI Microservice (FastAPI)
```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set LLM_API_KEY in .env
uvicorn main:app --reload
```

### 3. Frontend (React)
```bash
cd client
npm install
npm run dev
```
