# 🤖 AI Knowledge Assistant - Backend

An AI-powered backend service for a private knowledge assistant that enables organizations to search, retrieve, and interact with their internal knowledge using Retrieval-Augmented Generation (RAG).

This project demonstrates how organizations can transform scattered documents into an intelligent knowledge base, allowing employees to instantly retrieve accurate information while maintaining privacy and security.

---

## ✨ Features

- 📄 Document upload and processing
- 🧩 Intelligent document chunking
- 🔍 Semantic search using vector embeddings
- 🤖 AI-powered question answering (RAG)
- 💬 Context-aware conversations based on internal company knowledge
- 📚 Source citation and document retrieval
- ⚡ Optimized document ingestion pipeline
- 🔒 Private AI designed for internal organizational knowledge

---

## 🛠 Tech Stack

- Node.js
- Express.js
- Supabase (Vector Database)
- OpenRouter API
- REST API
- JavaScript

---

## 🎯 Project Goal

The goal of this project is to reduce the time employees spend searching for internal knowledge such as:

- SOPs
- Internal documentation
- Company policies
- Onboarding materials
- Guidelines
- Knowledge base articles

Instead of replacing existing documentation, this system makes organizational knowledge instantly searchable through AI.

---

## 🏗 System Architecture

```text
Upload Documents
        │
        ▼
Document Processing
        │
        ▼
Chunking
        │
        ▼
Generate Embeddings
        │
        ▼
Store Vectors (Supabase)
        │
        ▼
Semantic Search
        │
        ▼
Retrieve Relevant Context
        │
        ▼
LLM Response Generation
```

---

## 🚀 Workflow

1. Upload internal documents
2. Process and clean document text
3. Split into semantic chunks
4. Generate vector embeddings
5. Store embeddings in Supabase
6. Perform semantic search
7. Retrieve relevant context
8. Generate grounded AI responses

---

## 📌 Status

> 🚧 Portfolio Project

This repository represents the backend implementation of an AI Knowledge Assistant and is continuously being improved.

---

## 👨‍💻 Author

**Rafli Noval Adrian**

AI & Full-Stack Developer

🌐 Portfolio: https://zenythx.com & https://demo.zenythx.com