# CreditService

Standalone microservice for credit advances and smart top-ups. Works alongside the CardService — CardService handles card balances, CreditService manages borrowing and repayment.

## Architecture

```
Client → CreditService (:5250) → CardService (:5233)
```

The client calls **only** CreditService for top-ups and advances. CreditService orchestrates repayment, bonus advances, and forwards net amounts to CardService via HTTP. CardService is **never modified** — it operates the same as before.

## How It Works

### 1. Smart Top-Up (`POST /api/credits/top-up`)

When a user tops up, three things happen in order:

1. **Repay** — any outstanding advances are repaid oldest-first
2. **Credit balance** — remaining amount is forwarded to CardService
3. **Bonus advance** — if top-up > R100, 10% is granted as a new advance

#### Example Walkthrough

| Step | Action | Repaid | Bonus | Card Balance | Outstanding |
|---|---|---|---|---|---|
| 1 | Top-up R200 | R0 | +R20 | R220 | R20 |
| 2 | Top-up R10 | R10 | R0 | R220 | R10 |
| 3 | Top-up R150 | R10 | +R15 | R375 | R15 |

**Step 1** — Top-up R200
- 200 > 100 → bonus advance = 200 × 10% = R20
- No outstanding debt → nothing to repay
- Card gets: 200 + 20 = R220
- Owe: R20

**Step 2** — Top-up R10
- 10 < 100 → no bonus
- Outstanding debt: R20 → repay R10 (partial)
- Card gets: 10 − 10 = R0
- Owe: R20 − R10 = R10

**Step 3** — Top-up R150
- 150 > 100 → bonus = 150 × 10% = R15
- Outstanding debt: R10 → repay R10 (cleared)
- Card gets: 150 − 10 + 15 = R155
- Owe: R15

### 2. Manual Advance (`POST /api/credits/advances`)

Borrow a specific amount. Credit is added to the card immediately. Must be repaid via future top-ups.

- Default credit limit: R500
- Can be configured per user/card via `POST /api/credits/limits`

### 3. Credit Limit (`POST /api/credits/limits`)

Sets the maximum outstanding advance allowed for a user/card. Defaults to R500 if not set.

## The Math

### Top-Up Processing

```
topUpAmount  = user's deposit
totalOwed    = SUM(remaining_amount) of all outstanding advances

repayment    = MIN(topUpAmount, totalOwed)
creditToCard = topUpAmount − repayment

bonus        = topUpAmount > 100 ? topUpAmount × 0.1 : 0

netToCard    = creditToCard + bonus
newDebt      = totalOwed − repayment + bonus
```

### Advance Repayment Order

Advances are repaid **oldest-first** (FIFO). Each top-up reduces `remaining_amount` on the earliest advances until fully repaid.

### Credit Limit Check

```
available = creditLimit − SUM(outstandingAdvances)
```

A manual advance is rejected if it would exceed `creditLimit`. The bonus auto-advance on top-up is also capped by the remaining credit limit.

## API Reference

### `POST /api/credits/top-up`

Process a top-up with automatic repayment and bonus advance.

**Request:**
```json
{
  "cardId": 18,
  "amount": 200
}
```

**Response:**
```json
{
  "success": true,
  "message": "Top-up processed. R0 repaid, R20 bonus advance granted",
  "data": {
    "topUpAmount": 200,
    "repaidAmount": 0,
    "bonusAdvance": 20.0,
    "netCreditedToCard": 220.0,
    "newOutstanding": 20.00,
    "currency": "ZAR"
  }
}
```

### `POST /api/credits/advances`

Take a manual advance.

**Request:**
```json
{
  "cardId": 18,
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Advance of R100 granted",
  "data": {
    "id": 2,
    "cardId": 18,
    "amount": 100.0,
    "remainingAmount": 100.0,
    "currency": "ZAR",
    "status": "Outstanding",
    "createdAt": "2026-07-23T10:15:00Z",
    "repaidAt": null
  }
}
```

### `GET /api/credits/cards/{cardId}/status`

Get credit status for a card.

**Response:**
```json
{
  "success": true,
  "message": "Credit status retrieved",
  "data": {
    "totalOutstanding": 20.00,
    "creditLimit": 500,
    "availableCredit": 480.00,
    "activeAdvanceCount": 1,
    "currency": "ZAR"
  }
}
```

### `GET /api/credits/cards/{cardId}/advances`

List all advances for a card (most recent first).

### `POST /api/credits/limits`

Set or update a credit limit.

**Request:**
```json
{
  "cardId": 18,
  "maxAmount": 1000
}
```

## Database Schema

### `card_service.credit_advances`

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-increment |
| card_id | INTEGER NOT NULL | Card this advance belongs to |
| user_id | INTEGER NOT NULL | User who owns it |
| amount | DECIMAL(18,2) | Original borrowed amount |
| remaining_amount | DECIMAL(18,2) | Amount still owed |
| currency | VARCHAR(3) | Default 'ZAR' |
| status | VARCHAR(20) | 'Outstanding' or 'Repaid' |
| created_at | TIMESTAMP | When advance was taken |
| repaid_at | TIMESTAMP | When fully repaid (nullable) |

### `card_service.credit_limits`

| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-increment |
| card_id | INTEGER | Card-specific limit (nullable = applies to all) |
| user_id | INTEGER NOT NULL | User who owns it |
| max_advance_amount | DECIMAL(18,2) | Maximum outstanding allowed (default 500) |
| currency | VARCHAR(3) | Default 'ZAR' |
| created_at | TIMESTAMP | When limit was set |
| updated_at | TIMESTAMP | Last updated |

## Running

```bash
# Run SQL in Supabase editor first (see schema.sql)
# Then:
dotnet run --launch-profile http
```

Requires CardService running on the URL configured in `appsettings.json` → `CardService:BaseUrl` (default `http://localhost:5233`).
