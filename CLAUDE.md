# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo contains three deployable components that together form a browser-based Python IDE (CLI + GUI) backed by Kubernetes-provisioned per-user workspaces:

- Root (`src/`, `index.html`, `vite.config.js`, `Dockerfile`, `nginx.conf`) — React + Vite frontend, served in prod by nginx.
- [fastapi/](fastapi/) — FastAPI orchestrator that talks to the Kubernetes API, MySQL, and the user pods.
- [vnc/](vnc/) — Dockerfile for the per-user workspace image (Ubuntu + TigerVNC + noVNC + Python). This is the image that FastAPI launches into a Deployment when a user creates a project.

`diagram.mmd` / `diagram.png` show the full request flow — worth a look when reasoning about routing between frontend, backend, K8s API, and per-user pods.

## Commands

Frontend (from repo root):
- `npm run dev` — Vite dev server (port 5173 by default).
- `npm run build` — production build to `dist/`.
- `npm run lint` — ESLint (flat config in `eslint.config.js`).
- `npm run preview` — serve the built bundle locally.

Backend (from [fastapi/](fastapi/)):
- `pip install -r requirements.txt`
- `uvicorn main:app --host 0.0.0.0 --port 8000` (also the container `CMD`).
- Backend requires a reachable Kubernetes cluster (`load_kube_config()` locally, `load_incluster_config()` when running in-cluster) and a MySQL reachable at `DATABASE_URL` (default `mysql+pymysql://root:jaewoo@localhost:3306/webide`).

Docker / Kubernetes (see [fastapi/readme.txt](fastapi/readme.txt) for the full list of commands actually used in this project):
- Frontend image: `docker build -t jaewoo2/webide-react:<tag> .` from repo root.
- Backend image: `docker build -t jaewoo2/ide-demo-fastapi:<tag> .` from `fastapi/`.
- Apply manifests: `kubectl apply -f fastapi/fastapi-all.yaml`, `fastapi/mysql-all.yaml`, `fastapi/react.yaml`, `fastapi/vnc.yaml` (all in namespace `webide-net`).
- Rollout restart after push: `kubectl rollout restart deployment/ide-fastapi -n webide-net` (or `webide-react`, `mysql`).

There is no test suite in this repo.

## Architecture

### Identity key

A single slugged key is the glue across frontend, backend, DB rows, pod labels, PVC names, and NodePort services:

```
key = f"{slug(username)}-{slug(project_name)}"
deploy_name = f"novnc-{key}"
pvc_name    = f"{deploy_name}-pvc"
svc_name    = f"{deploy_name}-svc"
```

Pods are found via the label selector `key=<key>` (see `get_any_running_pod_name` in [fastapi/utils/util_create_project.py](fastapi/utils/util_create_project.py)). Any new endpoint that targets a user workspace should resolve the pod the same way — never hardcode a pod name.

### Per-user workspace lifecycle

`POST /containers` (in [fastapi/main.py](fastapi/main.py)) provisions, idempotently:
1. a PVC (`ReadWriteOnce`, `local-path` storage class, default 10Gi),
2. a Deployment running the VNC image (default `jaewoo6257/vnc:1.0.0`), mounting the PVC at `/workspace` (`WORKSPACE_MOUNT_PATH`),
3. a `NodePort` Service on a free port from `ALLOWED_NOVNC_PORTS = 31000..31100` exposing internal noVNC port `6081`,
4. a `projects` row in MySQL via `projectRepository.create_project`.

`DELETE /containers?key=...` tears down the Service, Deployment, and PVC and hard-deletes the DB row. `GET /containers` lists the current user's projects. All of these are gated by `get_current_user` (JWT in an httpOnly cookie).

User files live under `WORKSPACE = "/opt/workspace"` inside the pod, on the PVC. The noVNC container internal port is `6081`; the nodePort on the host is what the browser iframes via `vncUrl`.

### Terminal (WebSocket) and /run

`/ws/terminal?key=...` in [fastapi/main.py](fastapi/main.py) does two critical things:
1. Ensures a user venv exists at `/tmp/user_venv`, then opens a long-lived `bash` exec stream into the pod with `tty=True, _preload_content=False` (the tty + non-preload combination is what keeps the stream alive).
2. Stashes that stream in the module-level `SESSION: Dict[pod_name, resp]`.

`POST /run` **reuses** that same `SESSION[pod_name]` stream — it does not open a new exec. The flow is: save the whole project → `pkill -f '<WORKSPACE>'` to kill any prior user process → write `/bin/python3 '<entry>'\n` into the existing bash stdin → for up to ~1s poll `xwininfo -root -tree` to decide whether the program opened an X window (`gui` vs `cli`). Frontend routes GUI programs into the noVNC iframe; CLI output stays in the terminal.

Consequence: if the terminal WebSocket is not yet connected, `/run` will 400 with "터미널 연결 안됨". Expect callers to connect the WS first (the `IdePage` flow shows a "터미널 연결 중..." overlay until `setReady(true)`).

### File operations

All filesystem endpoints (`/save`, `/saveProject`, `/projects/{key}/files`, `/rename`, `/delete`, `/mkdir`, `/delete-folder`) operate inside the user pod via `exec_run` (wraps `kubectl exec`). They take `key` + a `relative_path` (or `name` + `path[]`) and always resolve through `_normalize_full_path` in [fastapi/utils/util_create_file.py](fastapi/utils/util_create_file.py), which rejects any path that escapes `base_path`. Preserve that check when adding new file endpoints.

Project loading (`GET /projects/{key}/files`) is done with two `find -print0` passes plus a batched `cat` separated by a sentinel `__FILE_BOUNDARY_9f3c2a1b__`, then reassembled into a `{tree, fileMap}` pair that the frontend stores in Redux. Very large projects will be slow — this is a known design trade-off.

### Frontend

React 19 + Vite + Tailwind + Redux Toolkit + React Router v7.
- Entry: [src/main.jsx](src/main.jsx) → [src/routes/router.jsx](src/routes/router.jsx) (`/` → `HomePage`, `/ide/:projectKey` → `IdePage`).
- Redux slices in [src/store/](src/store/): `auth`, `list` (project list), `project` (current project tree/fileMap), `openPage` (open tabs).
- API clients in [src/api/](src/api/) — one file per concern (`loginService`, `projectService`, `runService`, `saveService`). They all read the base URL from [src/config.js](src/config.js), which defaults to **relative** `/fastapi` and `ws://<host>/fastapi/ws/terminal` — i.e. it assumes an ingress rewrites `/fastapi/*` to the FastAPI Service. For local dev against a direct FastAPI, switch `config.js` to an absolute URL.
- Editor is CodeMirror 5 via `react-codemirror2`; terminal is `xterm` + `xterm-addon-fit`. The WS plumbing lives in [src/hooks/useTerminalWs.js](src/hooks/useTerminalWs.js) (data in → `ws.send`, `ws.onmessage` → `term.write`) and the mount lifecycle is in [src/hooks/useXtermMount.js](src/hooks/useXtermMount.js).

### Auth

JWT is minted in [fastapi/routers/auth.py](fastapi/routers/auth.py) on `/auth/login` and set as an httpOnly cookie `access_token` (HS256, 60 min, `samesite=lax`, `secure=False` — must be flipped to `True` under HTTPS). `get_current_user` in [fastapi/core/auth.py](fastapi/core/auth.py) reads that cookie; protected endpoints depend on it. Frontend requests use `withCredentials: true` so the cookie is sent.

CORS in [fastapi/main.py](fastapi/main.py) is an explicit allowlist of `http://210.117.181.234:5173` and `http://localhost:5173` — add any new origin there, or the browser will block credentialed requests.

### Database

SQLAlchemy 2.x declarative base in [fastapi/repository/db.py](fastapi/repository/db.py). Two tables: `users` and `projects` (see [fastapi/repository/models/](fastapi/repository/models/)). The `get_db` dependency commits on success and rolls back on exception — endpoints should not call `db.commit()` themselves unless they have a specific reason (signup does). `Base.metadata.create_all` runs at startup, so model edits apply on next boot; there is no migration tool configured.

## Conventions worth keeping

- Korean comments are used throughout the backend — they are load-bearing context, don't strip them when refactoring.
- When resolving a user pod, always go through `get_any_running_pod_name(v1, NAMESPACE, key)`; pod names rotate on restart.
- Anything writing into the pod filesystem must go through the `_normalize_full_path` guard.
- The terminal stream in `SESSION` is the single source of truth for "can we run code in this pod" — don't replace it with an ad-hoc `stream()` call in new endpoints; reuse it the way `/run` does.
