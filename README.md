# YourFlorist - Development Setup

## Quick Start

1. Install Node.js LTS (v18+ recommended)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment variables:
   - Copy `.env.example` to `.env` and adjust if needed
   ```bash
   # macOS/Linux
   cp .env.example .env
   # Windows PowerShell
   Copy-Item .env.example .env
   ```
4. Start the dev server:
   ```bash
   npm start
   ```
   The app runs at http://localhost:3000. If the port is busy, CRA will offer another port.

## API Base URL
- Default API base is set via `REACT_APP_API_URL` in `.env` (see `.env.example`).

## Line Endings (Windows/macOS/Linux)
This repo includes `.gitattributes` and `.editorconfig` to normalize to LF endings across OSes and editors. This prevents the "LF will be replaced by CRLF" warnings and avoids noisy diffs.

If you still see warnings locally, normalize once:
```bash
# From project root
git add --renormalize .
git commit -m "Normalize line endings"
```

## Troubleshooting
- Port already in use: stop other CRA apps or accept the prompt to run on a new port.
- API 401/403: ensure you have a valid token in localStorage or that the backend allows the endpoint without auth.
