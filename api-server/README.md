# Earth Betta Shop — API

This folder contains the Express API server for Earth Betta Shop. It includes authentication (Passport + JWT), Postgres + MongoDB helpers, Swagger UI, and Docker Compose wiring for a full local stack.

Quick start (development)

1. Start the stack (Postgres, Mongo, API, frontend):

```powershell
# from repository root
docker compose up -d --build api postgres mongo
# optional: start frontend (mapped to host:3001 to avoid conflict with local dev)
docker compose up -d --build frontend
```

2. Check health and docs:

```powershell
curl.exe http://localhost:4000/api/health
# open Swagger UI
start http://localhost:4000/api/docs/
```

Running tests

- Unit tests (fast, isolated):

```powershell
cd api-server
npm test
```

- Integration smoke tests (require the stack running):

```powershell
cd api-server
npm run test:integration
```

Troubleshooting

- Empty reply from server / missing native modules:
  - If you see `Error: Cannot find module 'bcryptjs'` or native `bcrypt` errors, rebuild the image and avoid host bind hiding node_modules:

```powershell
# rebuild with no cache and recreate api service
docker compose build --no-cache api
docker compose up -d --force-recreate api
```

- Port conflicts (Next.js dev on host 3000):
  - The compose frontend is configured to map host 3001 -> container 3000 to avoid colliding with a local dev server. Change this in `docker-compose.yml` if needed.

Notes

- `src/index.js` exports the Express `app` for tests. `src/server.js` starts the HTTP listener and is used in the Dockerfile.
- Swagger UI is available at `/api/docs/` and is generated from JSDoc comments in `src/routes/*.js`.
