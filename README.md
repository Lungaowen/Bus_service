# Bus Service — Complaint Module

REST API for submitting and managing bus service complaints with real-time updates via SignalR WebSockets.

## Tech Stack

- **.NET 10** Web API
- **PostgreSQL** (Neon DB)
- **Entity Framework Core** with Npgsql
- **JWT Bearer Authentication**
- **SignalR** for real-time WebSocket events
- **Docker** multi-stage build

---

## Quick Start

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- PostgreSQL instance (or Neon DB)
- Docker (optional)

### 1. Clone & Setup

```bash
git clone https://github.com/Lungaowen/Bus_service.git
cd Bus_service/ComplaintModule
```

### 2. Environment Variables

Create a `.env` file in `ComplaintModule/`:

```env
DATABASE_URL=Host=your-host;Database=your-db;Username=your-user;Password=your-pass;SSL Mode=Require;Trust Server Certificate=true
JWT_SECRET=your-secret-key-min-32-chars
```

### 3. Run

**Locally:**
```bash
dotnet run
# Swagger UI → http://localhost:5000/swagger
```

**With Docker:**
```bash
docker build -t complaint-module .
docker run -p 8080:8080 --env-file .env complaint-module
```

---

## API Endpoints

All endpoints are prefixed with `/api/complaints`.

### Submit a Complaint

Creates a new complaint and broadcasts a `ComplaintSubmitted` event to all connected SignalR clients.

```
POST /api/complaints
```

**Request Body:**
```json
{
  "userId": "4c7f7b6a-3d2e-4a8b-9c1f-5d6e7f8a9b0c",
  "subject": "Bus late",
  "description": "Bus 42 was 20 minutes late to campus"
}
```

**Response `200 OK`:**
```json
{
  "message": "Complaint submitted successfully.",
  "id": "1602100f-6fc0-4cce-be1f-0499b8b7ceab"
}
```

---

### List All Complaints

Returns all complaints ordered by most recent first.

```
GET /api/complaints
```

**Response `200 OK`:**
```json
[
  {
    "id": "1602100f-6fc0-4cce-be1f-0499b8b7ceab",
    "userId": "4c7f7b6a-3d2e-4a8b-9c1f-5d6e7f8a9b0c",
    "subject": "Bus late",
    "description": "Bus 42 was 20 minutes late to campus",
    "status": "Pending",
    "adminResponse": null,
    "dateSubmitted": "2026-07-22T19:45:57.121791Z"
  }
]
```

---

### Update Complaint Status

Updates the status and admin response for a complaint, then broadcasts a `ComplaintUpdated` event to all connected SignalR clients.

```
PUT /api/complaints/{id}
```

**Request Body:**
```json
{
  "status": "Resolved",
  "adminResponse": "Driver has been cautioned. Apologies for the delay."
}
```

**Response `200 OK`:**
```json
{
  "id": "1602100f-6fc0-4cce-be1f-0499b8b7ceab",
  "userId": "4c7f7b6a-3d2e-4a8b-9c1f-5d6e7f8a9b0c",
  "subject": "Bus late",
  "description": "Bus 42 was 20 minutes late to campus",
  "status": "Resolved",
  "adminResponse": "Driver has been cautioned. Apologies for the delay.",
  "dateSubmitted": "2026-07-22T19:45:57.121791Z"
}
```

**Response `404 Not Found`:**
```json
{
  "message": "Complaint not found."
}
```

---

## Real-Time WebSocket (SignalR)

Connect to the SignalR hub at `/hubs/complaints`.

### Events

| Event               | Payload                                     | Trigger               |
|----------------------|---------------------------------------------|------------------------|
| `ComplaintSubmitted` | `ComplaintRecord` object                    | `POST /api/complaints` |
| `ComplaintUpdated`   | `ComplaintRecord` object                    | `PUT /api/complaints/{id}` |

### Client Example (JavaScript)

```js
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/complaints")
  .build();

connection.on("ComplaintSubmitted", (complaint) => {
  console.log("New complaint:", complaint);
});

connection.on("ComplaintUpdated", (complaint) => {
  console.log("Complaint updated:", complaint);
});

connection.start();
```

### Authentication

If JWT is configured, pass the token as a query string for WebSocket connections:

```js
.withUrl("/hubs/complaints?access_token=" + token)
```

---

## Database Schema

```sql
CREATE TABLE "ComplaintRecords" (
    "Id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"          UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    "Subject"         VARCHAR(200) NOT NULL,
    "Description"     TEXT NOT NULL,
    "Status"          VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "AdminResponse"   TEXT NULL,
    "DateSubmitted"   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX "IX_ComplaintRecords_UserId" ON "ComplaintRecords" ("UserId");
```

The table is auto-created on application startup.

---

## Environment Variables

| Variable       | Required | Description                              |
|----------------|----------|------------------------------------------|
| `DATABASE_URL` | Yes      | PostgreSQL connection string             |
| `JWT_SECRET`   | Yes      | Secret key for signing JWT tokens        |

---

## Docker on Render

1. Push to GitHub
2. On Render, create **New Web Service** → connect repo
3. Runtime: **Docker**
4. Add environment variables in Render dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`

Render will auto-detect the `Dockerfile` and build/run the container.
