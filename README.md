# JUMBLE 🔀

> A swipe-based job matching platform — like Tinder, but for jobs.

Candidates swipe on job postings, recruiters swipe on candidates, and when both sides match it's a **Mutual Match 🎉**. An ML engine ranks listings by semantic relevance so the best fits always surface first.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│              Vite + React  (port 5173)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌─────────────────────┐    ┌──────────────────────────┐
│  User-Job Service   │    │   Swipe-Match Service     │
│  Spring Boot :8081  │    │   Spring Boot :8080       │
│  MongoDB · JWT Auth │    │   Redis · MongoDB         │
└─────────────────────┘    └──────────────────────────┘
          │                             │
          └──────────────┬──────────────┘
                         ▼
               ┌──────────────────┐
               │   MongoDB Atlas  │
               │   (jumbledb)     │
               └──────────────────┘
                         │
               ┌──────────────────┐
               │  Python ML Worker│
               │  matcher.py      │
               │  (background)    │
               └──────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Vanilla CSS |
| User & Job Service | Spring Boot 3, Spring Security, JWT, MongoDB |
| Swipe & Match Service | Spring Boot 3, Redis (queues), MongoDB |
| ML Engine | Python 3, Sentence Transformers (`all-MiniLM-L6-v2`), PyTorch |
| Database | MongoDB Atlas |
| Cache / Queue | Redis (Docker) |

---

## Features

- 🔐 **JWT Authentication** — Secure login for Candidates and Recruiters
- 💼 **Recruiter Dashboard** — Post jobs, swipe on candidates, filter by country
- 👤 **Candidate Dashboard** — Swipe on ML-ranked job postings
- 🤝 **Mutual Matches** — See only confirmed two-way matches
- 📄 **Resume Viewer** — Inline PDF viewer with secure authenticated fetch
- 🔗 **LinkedIn Integration** — Candidate LinkedIn profiles on match cards
- 🤖 **ML Ranking** — Semantic similarity scores via `sentence-transformers`
- 🏢 **Company Name Display** — Company shown on all job cards

---

## Prerequisites

| Requirement | Version |
|---|---|
| Java (JDK) | 21 |
| Node.js | 18+ |
| Python | 3.9+ |
| Docker Desktop | Latest |
| Maven | Bundled via `mvnw` |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Shikha307/JUMBLE.git
cd JUMBLE
```

### 2. Start Redis (Docker)

```bash
cd swipe-match-service
docker compose up -d redis
```

### 3. Start the User-Job Service (port 8081)

```powershell
# From project root
$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"
.\mvnw.cmd spring-boot:run
```

### 4. Start the Swipe-Match Service (port 8080)

```powershell
# From /swipe-match-service
$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"
.\mvnw.cmd spring-boot:run
```

### 5. Start the ML Worker

```bash
cd ml
pip install pymongo sentence-transformers torch
python matcher.py
```

The worker runs continuously, polling MongoDB every 10 seconds and regenerating match score JSON files whenever new jobs or candidates are added.

### 6. Start the Frontend (port 5173)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment / Configuration

All configuration lives in:

| File | Purpose |
|---|---|
| `src/main/resources/application.yml` | User-Job service (port, MongoDB URI) |
| `swipe-match-service/src/main/resources/application.properties` | Swipe-Match service (port, Redis, MongoDB URI) |
| `ml/matcher.py` | MongoDB URI for the ML worker |

> **Note:** MongoDB Atlas credentials are embedded for local hackathon use. Rotate these before any public deployment.

---

## API Overview

### User-Job Service (`localhost:8081`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register candidate or recruiter |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/candidates/me` | Get own candidate profile |
| `PUT` | `/api/candidates/me/profile` | Update skills, resume, LinkedIn |
| `GET` | `/api/candidates/{id}/resume` | Download resume (auth required) |
| `GET` | `/api/recruiters/{id}` | Get recruiter + company info |
| `GET` | `/api/recruiters/{id}/jobs` | List jobs for a recruiter |
| `GET` | `/api/jobs/all` | List all job postings |

### Swipe-Match Service (`localhost:8080`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/swipes` | Record a swipe (RIGHT/LEFT) |
| `GET` | `/api/v1/swipes/candidates/{id}/unswiped-jobs` | Jobs a candidate hasn't swiped on |
| `GET` | `/api/v1/swipes/jobs/{id}/unswiped-candidates` | Candidates a recruiter hasn't swiped on |
| `GET` | `/api/v1/matches/recruiter/{id}` | All mutual matches for a recruiter |
| `GET` | `/api/v1/matches/candidate/{id}` | All mutual matches for a candidate |

---

## ML Matching

The Python worker (`ml/matcher.py`):
1. Loads `sentence-transformers/all-MiniLM-L6-v2` (uses GPU if available)
2. On startup, computes a full candidate × job similarity matrix
3. Every 10 seconds, checks for new documents and recalculates if any are found
4. Outputs ranked JSON files to:
   - `client/public/ml_outputs/jobs_prioritized/{candidateId}.json`
   - `client/public/ml_outputs/candidates_prioritized/{jobId}.json`

The frontend reads these static JSON files to sort cards by match score.

---

## Project Structure

```
JUMBLE/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── pages/            # Matches, RecruiterHome, AddJob...
│       ├── components/       # CandidateCard, Navbar...
│       └── public/ml_outputs # ML-generated match scores
│
├── src/                      # User-Job Service (Spring Boot)
│   └── main/java/com/jumble/userjob/
│       ├── auth/             # JWT auth
│       ├── candidate/        # Candidate + Recruiter controllers
│       └── job/              # Job CRUD
│
├── swipe-match-service/      # Swipe & Match Service (Spring Boot)
│   ├── docker-compose.yml    # Redis + service
│   └── src/main/java/com/jumble/swipematch/
│
└── ml/
    └── matcher.py            # Python ML worker
```

---

## Built at HackCU 🏆

JUMBLE was built during **HackCU** by a team passionate about making hiring fairer and faster through ML-powered matching.
