# Swipe Engine API Contract

Base URL: `http://localhost:8080/api/v1`

---

## 1. Register a Swipe

Records a swipe action (left or right) from either a Candidate or a Recruiter.

- **Endpoint:** `/swipes`
- **Method:** `POST`
- **Content-Type:** `application/json`

### Request Body

| Field         | Type   | Required | Description                                                  | Example     |
| ------------- | ------ | -------- | ------------------------------------------------------------ | ----------- |
| `candidateId` | string | Yes      | The unique ID of the candidate profile.                      | `"C100"`    |
| `jobId`       | string | Yes      | The unique ID of the job listing.                            | `"J200"`    |
| `recruiterId` | string | Optional | The unique ID of the recruiter (required if swiperRole = RECRUITER). | `"R100"`    |
| `swiperRole`  | string | Yes      | Defines who made the swipe. Must be `CANDIDATE` or `RECRUITER`. | `"CANDIDATE"` |
| `direction`   | string | Yes      | Defines the swipe action. Must be `LEFT` or `RIGHT`.         | `"RIGHT"`   |

#### Example Request
```json
{
  "candidateId": "C100",
  "jobId": "J200",
  "recruiterId": "R100",
  "swiperRole": "RECRUITER",
  "direction": "RIGHT"
}
```

### Responses

#### Success (200 OK)
Returns a plain text confirmation that the swipe was recorded and processed.
```text
Swipe recorded successfully
```

#### Failure (400 Bad Request)
Returned if the JSON payload is malformed or missing required enums.

---

## 2. Get Matches for a Candidate

Retrieves a list of all successful mutual matches for a specific Candidate.

- **Endpoint:** `/matches/candidate/{candidateId}`
- **Method:** `GET`

### Path Parameters

| Parameter     | Type   | Required | Description                          |
| ------------- | ------ | -------- | ------------------------------------ |
| `candidateId` | string | Yes      | The unique ID of the candidate.      |

### Responses

#### Success (200 OK)
Returns a JSON array of Match objects. If no matches exist, an empty array `[]` is returned.

```json
[
  {
    "id": "e4c8bc12-7b24-4a56-8201-90a6125028c7",
    "candidateId": "C100",
    "jobId": "J200",
    "matchedAt": "2026-03-07T14:30:00.000Z"
  },
  {
    "id": "1b34c892-80cf-4e78-9a2c-9a1c67d12f34",
    "candidateId": "C100",
    "jobId": "J789",
    "matchedAt": "2026-03-08T09:15:00.000Z"
  }
]
```

---

## 3. Get Matches for a Job

Retrieves a list of all successful mutual matches associated with a specific Job posting (used by Recruiters to see who matched their job).

- **Endpoint:** `/matches/job/{jobId}`
- **Method:** `GET`

### Path Parameters

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| `jobId`   | string | Yes      | The unique ID of the job listing.    |

### Responses

#### Success (200 OK)
Returns a JSON array of Match objects. If no matches exist, an empty array `[]` is returned.

```json
[
  {
    "id": "e4c8bc12-7b24-4a56-8201-90a6125028c7",
    "candidateId": "C100",
    "jobId": "J200",
    "recruiterId": "R100",
    "matchedAt": "2026-03-07T14:30:00.000Z"
  },
  {
    "id": "f5a9ba23-9c35-4f12-8e12-8b2d78e34a56",
    "candidateId": "C404",
    "jobId": "J200",
    "recruiterId": "R100",
    "matchedAt": "2026-03-07T16:45:00.000Z"
  }
]

---

## 4. Get Matches for a Recruiter

Retrieves a list of all successful mutual matches associated with a specific Recruiter, spanning across all of their jobs.

- **Endpoint:** `/matches/recruiter/{recruiterId}`
- **Method:** `GET`

### Path Parameters

| Parameter      | Type   | Required | Description                          |
| -------------- | ------ | -------- | ------------------------------------ |
| `recruiterId`  | string | Yes      | The unique ID of the recruiter.      |

### Responses

#### Success (200 OK)
Returns a JSON array of Match objects. If no matches exist, an empty array `[]` is returned.

```json
[
  {
    "id": "e4c8bc12-7b24-4a56-8201-90a6125028c7",
    "candidateId": "C100",
    "jobId": "J200",
    "recruiterId": "R100",
    "matchedAt": "2026-03-07T14:30:00.000Z"
  },
  {
    "id": "7b24bc12-e4c8-4a56-8201-90a6125028c7",
    "candidateId": "C200",
    "jobId": "J505",
    "recruiterId": "R100",
    "matchedAt": "2026-03-07T18:22:00.000Z"
  }
]
```
```
