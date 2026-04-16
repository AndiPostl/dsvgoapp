# dsvgoapp

Web app for documenting **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30 GDPR / DSGVO): one **controller** (Verantwortliche/r, lit. a) with many **processing activities** (lit. b–g). Data is stored as JSON under `data/verzeichnis.json` (local dev) or `/app/data` in Docker.

This is an **assistance tool**, not legal advice.

## Requirements

- Node.js 20+ (local development)
- Docker / Docker Compose (container deployment)

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker image (version 0.1)

The image is built from this repo using the multi-stage `Dockerfile` (Next.js **standalone** output).

### Build the image

```bash
docker build -t dsvgoapp:0.1 .
```

### Run on another machine (Docker)

Persist the GDPR register on the host so data survives container restarts:

```bash
mkdir -p ./dsvgoapp-data

docker run --rm \
  -p 3000:3000 \
  -v "$(pwd)/dsvgoapp-data:/app/data" \
  dsvgoapp:0.1
```

Then open **http://localhost:3000** (or `http://<server-ip>:3000` from another host).

Notes:

- The app listens on **port 3000** inside the container (`PORT` can be overridden; map host ports as needed, e.g. `-p 8080:3000`).
- Ensure the mounted directory is **writable** by the container user (UID **1001** / `nextjs`). If you see permission errors:

  ```bash
  sudo chown -R 1001:1001 ./dsvgoapp-data
  ```

### Run with Docker Compose

From the repository root:

```bash
docker compose up --build -d
```

Data is stored in the named volume `dsvgoapp-data`. List volumes: `docker volume ls`.

### Push to your Docker registry (tag 0.1)

Replace `REGISTRY` and any path prefix your registry requires (examples below).

1. Log in:

   ```bash
   docker login REGISTRY
   ```

2. Tag and push:

   ```bash
   docker tag dsvgoapp:0.1 REGISTRY/dsvgoapp:0.1
   docker push REGISTRY/dsvgoapp:0.1
   ```

Or use the helper script (same steps, requires `docker login` first):

```bash
chmod +x scripts/docker-push.sh   # once
REGISTRY=ghcr.io/youruser ./scripts/docker-push.sh
```

Examples:

| Registry type | Example `REGISTRY` / image |
|---------------|----------------------------|
| Docker Hub    | `docker.io/youruser` → `docker tag dsvgoapp:0.1 youruser/dsvgoapp:0.1` then `docker push youruser/dsvgoapp:0.1` |
| GitHub GHCR   | `ghcr.io/youruser` → `docker tag dsvgoapp:0.1 ghcr.io/youruser/dsvgoapp:0.1` then `docker push ghcr.io/youruser/dsvgoapp:0.1` |
| Private       | `registry.example.com/project` → match your org’s naming rules |

### Pull and run from a registry

```bash
docker pull REGISTRY/dsvgoapp:0.1

mkdir -p ./dsvgoapp-data
docker run --rm -p 3000:3000 -v "$(pwd)/dsvgoapp-data:/app/data" REGISTRY/dsvgoapp:0.1
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
