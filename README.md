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

1. Log in to Docker Hub (use your **Docker Hub username** — the segment in `hub.docker.com/u/<username>`; password can be an [access token](https://hub.docker.com/settings/security)):

   ```bash
   podman login docker.io
   podman login --get-login docker.io   # should print the same user as in the image (e.g. andreaspostl)
   ```

   If `podman push` fails with **“requested access to the resource is denied”** while **checking / reusing a blob**, Docker Hub often still needs credentials on the **registry** host Podman talks to. Log in there too (same username and token/password):

   ```bash
   podman login registry-1.docker.io
   ```

   Other common causes: image namespace **does not match** your Hub user (e.g. you are logged in as `apostl` but the script pushes to `andreaspostl/dsvgoapp` — use `REGISTRY=docker.io/apostl ./scripts/docker-push.sh`), or you are not a **collaborator** on an organization namespace.

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

No `git pull` is required if you only run the **image** from Docker Hub; the engine pulls layers as needed.

#### macOS (Terminal) — one line

**Podman** (if you use it):

```bash
mkdir -p ./dsvgoapp-data && podman run --rm -p 3000:3000 -v "$(pwd)/dsvgoapp-data:/app/data" docker.io/andreaspostl/dsvgoapp:0.1
```

**Docker** — same command with `docker` instead of `podman`:

```bash
mkdir -p ./dsvgoapp-data && docker run --rm -p 3000:3000 -v "$(pwd)/dsvgoapp-data:/app/data" docker.io/andreaspostl/dsvgoapp:0.1
```

Then open **http://localhost:3000**.

#### Windows — one line

Use **Docker Desktop** (Linux containers) and **PowerShell**:

```powershell
New-Item -ItemType Directory -Force -Path dsvgoapp-data | Out-Null; docker run --rm -p 3000:3000 -v "${PWD}/dsvgoapp-data:/app/data" docker.io/andreaspostl/dsvgoapp:0.1
```

**Command Prompt (`cmd.exe`):**

```cmd
mkdir dsvgoapp-data 2>nul & docker run --rm -p 3000:3000 -v "%cd%\dsvgoapp-data:/app/data" docker.io/andreaspostl/dsvgoapp:0.1
```

**Git Bash on Windows** can use the same one-liner as macOS with `docker` (or `podman` if installed).

Then open **http://localhost:3000** in the browser.

## Demo-Daten (Deutsch)

Die Datei [`scripts/demo-verzeichnis-de.json`](scripts/demo-verzeichnis-de.json) enthält **6 fiktive Verantwortliche** und **20 realistische Verarbeitungstätigkeiten** (u. a. IT/Support & HR, Onlinehandel, Kanzlei, Arztpraxis, Sportverein, Logistik). Namen und Adressen sind **frei erfundene Demodaten**, keine Abbilder realer Personen oder Betriebe.

**Import (überschreibt die lokale Datenbank):** App / Container stoppen, dann:

```bash
# optional: Backup der bisherigen Datei
cp data/verzeichnis.json data/verzeichnis.json.bak 2>/dev/null || true

cp scripts/demo-verzeichnis-de.json data/verzeichnis.json
```

Danach `npm run dev` oder Container erneut starten. Im Docker-Setup muss die kopierte Datei im gemounteten Verzeichnis liegen (z. B. `./dsvgoapp-data/verzeichnis.json`).

## Source repository (Git)

Upstream: **https://github.com/AndiPostl/dsvgoapp**

Clone:

```bash
git clone https://github.com/AndiPostl/dsvgoapp.git
cd dsvgoapp
```

SSH clone: `git@github.com:AndiPostl/dsvgoapp.git`.

## Project layout (high level)

- `app/` — Next.js App Router (UI + API routes)
- `lib/` — types and JSON file store
- `data/` — runtime data directory (`verzeichnis.json`; not committed for real data)
- `Dockerfile` — production image
- `docker-compose.yml` — optional local stack with a volume

## Legal reference

EU GDPR text (EUR-Lex): [Regulation (EU) 2016/679](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=celex%3A32016R0679) — Art. 30.
