# Swipe Engine & Matching System Architecture

## Overview
The Swipe Engine & Matching System is a high-throughput Spring Boot microservice designed to handle real-time swipe interactions and mutual match detection between Candidates and Recruiters. The system is intentionally architected to minimize database bottlenecks by utilizing **Redis** as the primary data store for fast reads and writes.

## Tech Stack
- **Framework**: Java 17, Spring Boot 3.x
- **Data Store / Caching Layer**: Redis (Spring Data Redis)
- **Dependency Management**: Maven
- **Environment Orchestration**: Docker & Docker Compose (optional for local deployment)

## Core Domain Models

### 1. Swipe
Represents a singular action taken by a user on the platform.
- **Fields**:
  - `id`: Unique identifier (UUID).
  - `candidateId`: The ID of the candidate involved in the swipe.
  - `jobId`: The ID of the job listing involved in the swipe.
  - `recruiterId`: The ID of the recruiter (populated when a recruiter swipes).
  - `swiperRole`: Enum (`CANDIDATE` or `RECRUITER`) identifying who initiated the action.
  - `direction`: Enum (`LEFT` or `RIGHT`). Left means dislike/reject, Right means like/approve.
  - `timestamp`: The exact time the action was recorded.
- **Storage**: Stored in a Redis Hash. Fields are annotated with `@Indexed` to allow quick horizontal lookups by `candidateId`, `jobId`, and `recruiterId`.

### 2. Match
Represents a successful, mutual "Right Swipe" (Like) between a specific Candidate and a specific Recruiter's Job.
- **Fields**:
  - `id`: Unique identifier (UUID).
  - `candidateId`: The ID of the candidate.
  - `jobId`: The ID of the matched job.
  - `recruiterId`: The ID of the recruiter.
  - `matchedAt`: The timestamp when the mutual match was achieved.
- **Storage**: Stored in a Redis Hash. Indexed by `candidateId`, `jobId`, and `recruiterId` for quick profile population.

---

## Service Layer & Functionalities

### SwipeService
The `SwipeService` handles the initial data ingestion from the REST controllers.
- **Functionality**:
  1. Receives the `SwipeRequestDTO` from the API.
  2. Constructs a full `Swipe` entity, assigning a UUID and processing timestamp.
  3. Reaches out to the `SwipeRepository` to persist the swipe directly into Redis.
  4. Triggers the downstream `MatchDetectionService` to evaluate the business logic.
- **Design Consideration**: Separating ingestion from evaluation allows the ingestion pipeline to remain unblocked. In a future iteration with exceedingly high volume, the delegation to `MatchDetectionService` could easily be shifted to an asynchronous event broker (e.g., Kafka or RabbitMQ).

### MatchDetectionService
The `MatchDetectionService` is the central brain of the matching logic. 
- **Functionality**:
  1. **Filtering**: It immediately ignores any incoming `LEFT` swipes. Matches are only formed by mutual `RIGHT` swipes.
  2. **Historical Lookup**: Queries the `SwipeRepository` for all previous swipes regarding the specific `candidateId` and `jobId` pairing.
  3. **Verification**: Scans the historical swipes to see if the *counterparty* (the opposite role of the current swiper) has already swiped `RIGHT` on this pair. 
  4. **Persistence**: If a mutual `RIGHT` swipe is identified, it generates a `Match` entity and saves it to the `MatchRepository`.

---

## Data Layer (Repositories)

### SwipeRepository
- Extends Spring Data's `CrudRepository<Swipe, String>`.
- Provides dynamic query methods like `findByCandidateIdAndJobId(candidateId, jobId)` which allows the `MatchDetectionService` to efficiently isolate relevant swipe history using Redis secondary indexes.

### MatchRepository
- Extends Spring Data's `CrudRepository<Match, String>`.
- Exposes `findByCandidateId(candidateId)` and `findByJobId(jobId)` methods to rapidly populate match lists bridging the frontend UI for Candidates and Recruiters.

---

## Future Extensibility Points
- **Message Queues**: The synchronous call between `SwipeService` and `MatchDetectionService` can be abstracted behind a Kafka topic (e.g., `swipe-events`).
- **Chat Interoperability**: When `MatchDetectionService` registers a Match, it can emit an event (`match-created`) that a disparate Chat Microservice listens to so a live chat room is automatically provisioned for the Candidate and Recruiter.
