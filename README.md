# PaymentSystem

This project now exposes a simple ASP.NET Core card top-up API.

## Endpoint

POST /api/topup/card

### Example request body

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEifQ.signature",
  "userId": "user-1",
  "cardNumber": "4111111111111111",
  "cardHolderName": "Jane Doe",
  "expiryDate": "12/30",
  "cvv": "123",
  "amount": 250
}
```

### Example response

```json
{
  "success": true,
  "message": "Top-up completed successfully.",
  "reference": "TXN202607211230451234",
  "amount": 250,
  "userId": "user-1"
}
```

## Run locally

```bash
dotnet run
```

Then open Swagger at:

```text
https://localhost:5001/swagger
```
