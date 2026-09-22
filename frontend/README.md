# Expense Tracker Frontend

React + Vite frontend based on the visual/UX direction of the supplied reference project, rewritten to use the existing Spring Boot API.

## Run

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` if the backend is not running at `http://localhost:8080/api`.

## Connected Spring Boot APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/{id}`
- `DELETE /api/transactions/{id}`

The frontend stores the JWT returned by `/api/auth/login` and sends it as a Bearer token for protected requests.
