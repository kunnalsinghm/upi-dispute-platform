# UPI Dispute Resolution Automation Platform

> Auto-resolution engine for UPI disputes — built with Spring Boot, Kafka, PostgreSQL, Redis, React, and ML (RandomForest).

---

## The Problem

40+ crore UPI transactions happen daily in India. ~0.1% fail or get disputed — that's **4 lakh disputes/day**. Banks and PSPs resolve them manually via NPCI's dispute portal, taking **3–7 days per case**.

This platform automates that entire pipeline.

---

## What It Does

- **Auto-categorizes** disputes: Wrong Debit, Duplicate, Beneficiary Not Credited, Timeout, Technical Decline
- **Rule engine** auto-resolves ~74% of cases without human intervention
- **ML classifier** (RandomForest, 88% accuracy) scores each dispute before the rule engine runs
- **Kafka pipeline** processes disputes asynchronously at scale
- **NPCI mock API** simulates ARN generation, acknowledgements, and escalation flows
- **React dashboard** gives Bank/PSP ops teams a live view of the queue, SLA tracking, and charts

---

## Architecture

```
POST /api/disputes
       │
       ▼
ML Classifier (Python/Flask :5000)
       │  confidence score
       ▼
Rule Engine (Spring Boot)
  ├── WRONG_DEBIT < ₹50k     → AUTO_RESOLVED
  ├── DUPLICATE detected      → AUTO_RESOLVED
  ├── TIMEOUT > 48h           → AUTO_RESOLVED
  └── No match                → MANUAL_REVIEW
       │
       ▼
Kafka topics
  disputes.created → disputes.resolved
       │
       ▼
PostgreSQL (disputes table)
       │
       ▼
React Dashboard (auto-refresh 5s)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Spring Boot 3.5, Java 21 |
| Database | PostgreSQL 15 |
| Message Queue | Apache Kafka |
| Cache | Redis |
| ML Classifier | Python, Flask, scikit-learn (RandomForest) |
| Frontend | React, Recharts |
| Infrastructure | Docker Compose |
| Build Tool | Maven |

---

## Project Structure

```
upi-dispute-platform/
├── backend/                  ← Spring Boot (Java)
│   └── src/main/java/com/upi/dispute/
│       ├── Dispute.java               Entity + DB model
│       ├── DisputeController.java     REST API endpoints
│       ├── DisputeService.java        Business logic
│       ├── DisputeRuleEngine.java     Auto-resolution rules
│       ├── WrongDebitRule.java        Rule: wrong debit
│       ├── DuplicateTransactionRule.java
│       ├── TransactionTimeoutRule.java
│       ├── MlClassifierClient.java    Calls Python ML service
│       ├── DisputeProducer.java       Kafka producer
│       ├── DisputeConsumer.java       Kafka consumer
│       ├── NpciMockController.java    NPCI portal simulation
│       └── KafkaConfig.java           Topic definitions
├── ml-service/               ← Python ML classifier
│   ├── generate_data.py       Synthetic training data
│   ├── train_model.py         Model training (RandomForest)
│   └── app.py                 Flask API on :5000
├── frontend/                 ← React dashboard
│   └── dispute-dashboard/
├── infra/
│   └── docker/
│       └── docker-compose.yml
└── README.md
```

---

## API Reference

### Dispute API (port 8080)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/disputes` | Create and auto-resolve a dispute |
| GET | `/api/disputes` | List all disputes |
| GET | `/api/disputes/{id}` | Get dispute by ID |
| GET | `/actuator/health` | Health check |

**Create dispute request:**
```json
{
  "transactionId": "TXN-HDFC-8821",
  "raisedByUpiId": "user@gpay",
  "beneficiaryUpiId": "shop@hdfc",
  "amount": 4200.00,
  "disputeType": "WRONG_DEBIT",
  "bankCode": "HDFC",
  "description": "Wrong amount debited"
}
```

**Response:**
```json
{
  "id": "084af76a-3962-4ab0-9837-8a1e62dfcb71",
  "transactionId": "TXN-HDFC-8821",
  "status": "AUTO_RESOLVED",
  "mlConfidenceScore": 0.97,
  "resolvedAt": "2026-06-17T09:33:10"
}
```

### NPCI Mock API (port 8080)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/npci/api/v1/disputes/raise` | Register dispute, get ARN |
| GET | `/npci/api/v1/disputes/{arn}/status` | Check dispute status |
| POST | `/npci/api/v1/disputes/{arn}/escalate` | Escalate to Level 2 |
| GET | `/npci/api/v1/health` | NPCI mock health |

### ML Classifier API (port 5000)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/classify` | Classify dispute type |
| GET | `/health` | Model health + accuracy |

---

## Setup & Running

### Prerequisites

- Java 21
- Maven 3.9+
- Docker Desktop
- Python 3.11+
- Node.js 18+

### Step 1 — Start infrastructure

```powershell
cd infra/docker
docker compose up -d
```

Wait 15 seconds for Postgres, Kafka, Zookeeper, Redis to initialize.

### Step 2 — Train the ML model (first time only)

```powershell
cd ml-service
pip install flask scikit-learn pandas numpy
python generate_data.py
python train_model.py
```

### Step 3 — Start ML service

```powershell
cd ml-service
python app.py
```

### Step 4 — Start backend

```powershell
cd backend
mvn spring-boot:run
```

### Step 5 — Start dashboard

```powershell
cd frontend/dispute-dashboard
npm install
npm start
```

Open **http://localhost:3000**

---

## ML Model Performance

Trained on 10,000 synthetic UPI dispute records.

| Dispute Type | Precision | Recall |
|---|---|---|
| DUPLICATE_TRANSACTION | 100% | 100% |
| TECHNICAL_DECLINE | 97% | 100% |
| BENEFICIARY_NOT_CREDITED | 93% | 64% |
| TRANSACTION_TIMEOUT | 78% | 94% |
| WRONG_DEBIT | 77% | 84% |
| **Overall Accuracy** | **88.1%** | |

---

## Kafka Topics

| Topic | Purpose |
|---|---|
| `disputes.created` | New dispute ingested, triggers async processing |
| `disputes.resolved` | Rule engine decision published |

---

## Dispute Resolution Rules

| Rule | Condition | Outcome |
|---|---|---|
| Wrong Debit | Amount ≤ ₹50,000 | AUTO_RESOLVED (94% confidence) |
| Wrong Debit | Amount > ₹50,000 | MANUAL_REVIEW |
| Duplicate | Same TXN ID found in DB | AUTO_RESOLVED (99% confidence) |
| Timeout | Age > 48 hours | AUTO_RESOLVED (97% confidence) |
| No match | None of the above | MANUAL_REVIEW |

---

## Target Customers

This problem exists internally at NPCI, Razorpay, PhonePe, PayU, and every major Indian bank. The platform demonstrates deep UPI ecosystem knowledge and production-grade engineering.

---

## Git History

```
feat: ML classifier wired into live dispute flow
feat: NPCI mock API - ARN generation, status check, escalation
feat: React dashboard - live dispute queue, charts, form
feat: ML classifier - RandomForest 88% accuracy, Flask API
feat: Kafka pipeline - producer and consumer wired
feat: rule engine complete - auto-resolution working
feat: dispute CRUD API - POST/GET endpoints working
feat: Spring Boot setup + Dispute entity + DB connection
chore: project structure + docker infrastructure
```