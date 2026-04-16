# dsvgoapp

Web app for documenting **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30 GDPR / DSGVO): one **controller** (Verantwortliche/r, lit. a) with many **processing activities** (lit. b–g). Data is stored as JSON under `data/verzeichnis.json` (local dev) or `/app/data` in Docker.

This is an **assistance tool**, not legal advice.

## Requirements

- Node.js 20+ (local development)
- **Podman** or Docker / Docker Compose (container deployment)

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker image (version 0.1)

The image is built from this repo using the multi-stage `Dockerfile` (Next.js **standalone** output).

### Build the image

With **Podman** (recommended here):

```bash
podman build -t dsvgoapp:0.1 .
```

Or with Docker:

```bash
docker build -t dsvgoapp:0.1 .
```

### Run on another machine (Podman or Docker)

Persist the GDPR register on the host so data survives container restarts:

```bash
mkdir -p ./dsvgoapp-data

podman run --rm \
  -p 3000:3000 \
  -v "$(pwd)/dsvgoapp-data:/app/data" \
  dsvgoapp:0.1
```

(`docker run …` works the same if you use Docker.)

Then open **http://localhost:3000** (or `http://<server-ip>:3000` from another host).

Notes:

- The app listens on **port 3000** inside the container (`PORT` can be overridden; map host ports as needed, e.g. `-p 8080:3000`).
- Ensure the mounted directory is **writable** by the container user (UID **1001** / `nextjs`). If you see permission errors:

  ```bash
  sudo chown -R 1001:1001 ./dsvgoapp-data
  ```

### Run with Docker Compose

From the repository root (Docker: `docker compose`; Podman 4+: often `podman compose`):

```bash
podman compose up --build -d
```

Data is stored in the named volume `dsvgoapp-data`. List volumes: `podman volume ls`.

### Push to Docker Hub ([andreaspostl](https://hub.docker.com/repositories/andreaspostl)) — Podman

Image name on Hub: **`andreaspostl/dsvgoapp:0.1`** (same as `docker.io/andreaspostl/dsvgoapp:0.1`).

1. Log in to Docker Hub (use your Hub username; password can be an [access token](https://hub.docker.com/settings/security)):

   ```bash
   podman login docker.io
   ```

2. Build, tag, and push (script uses **Podman** if installed, otherwise **Docker**):

   ```bash
   chmod +x scripts/docker-push.sh   # once
   ./scripts/docker-push.sh
   ```

   The default registry is **`docker.io/andreaspostl`**. To push under another user:

   ```bash
   REGISTRY=docker.io/otheruser ./scripts/docker-push.sh
   ```

3. Manual equivalent:

   ```bash
   podman build -t dsvgoapp:0.1 .
   podman tag dsvgoapp:0.1 docker.io/andreaspostl/dsvgoapp:0.1
   podman push docker.io/andreaspostl/dsvgoapp:0.1
   ```

### Pull and run from Docker Hub

```bash
podman pull docker.io/andreaspostl/dsvgoapp:0.1

mkdir -p ./dsvgoapp-data
podman run --rm -p 3000:3000 -v "$(pwd)/dsvgoapp-data:/app/data" docker.io/andreaspostl/dsvgoapp:0.1
```

## Source repository (Git)

Create an empty repository named **`dsvgoapp`** on your Git host (e.g. GitHub), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/dsvgoapp.git
git branch -M main
git push -u origin main
```

Use SSH if you prefer: `git@github.com:YOUR_USERNAME/dsvgoapp.git`.

## Project layout (high level)

- `app/` — Next.js App Router (UI + API routes)
- `lib/` — types and JSON file store
- `data/` — runtime data directory (`verzeichnis.json`; not committed for real data)
- `Dockerfile` — production image
- `docker-compose.yml` — optional local stack with a volume

## Legal reference

EU GDPR text (EUR-Lex): [Regulation (EU) 2016/679](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=celex%3A32016R0679) — Art. 30.
