# Currency Converter

A mobile-first full-stack currency converter built with React, TypeScript,
Bootstrap 5, and NestJS. Currency data is loaded dynamically from
[freecurrencyapi](https://freecurrencyapi.com/), while the API key remains on
the server.

## Project structure

```text
backend/   NestJS API
frontend/  React + Vite web app
```

## Prerequisites

- Node.js 20 or newer
- A freecurrencyapi API key

## Setup

1. Install both applications:

   ```bash
   npm run install:all
   ```

2. Copy the environment examples:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

3. Put your key in `backend/.env`:

   ```env
   CURRENCY_API_KEY=your_real_key
   CURRENCY_API_BASE_URL=https://api.freecurrencyapi.com/v1
   PORT=3000
   ```

   The frontend defaults to `VITE_API_URL=http://localhost:3000`.

## Run locally

Open two terminals at the repository root:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Then open `http://localhost:5173`.

## API endpoints

- `GET /currency/list`
- `GET /currency/convert?from=USD&to=PKR&amount=100`
- `GET /currency/historical?from=USD&to=PKR&amount=100&date=2024-01-15`
- `GET /currency/status`

The backend sends the freecurrencyapi key in the `apikey` request header and
never exposes it to the browser. `.env` files are ignored by Git; only safe
`.env.example` templates are committed.

## Production builds

```bash
npm run build
```

## Netlify deployment

The repository includes `netlify.toml` and a Netlify Function adapter. A single
Netlify site serves both the Vite frontend and the NestJS currency endpoints.
Set these environment variables in Netlify before deploying:

```env
CURRENCY_API_KEY=your_real_key
CURRENCY_API_BASE_URL=https://api.freecurrencyapi.com/v1
```
