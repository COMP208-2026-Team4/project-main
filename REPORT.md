TLDR: Due to the decentralised nature of the app, and the pain of individually setting up each project, and also the intricacies of cross-platform deployment, we ultimately chose Docker to handle all this.

---

TODO: Condense this:

# Deployment Report – Microservices Project

## Overview

This project consists of multiple microservices:

* Frontend (React + Vite)
* APIs (users, sessions, rest)
* Git agent (Rust)
* Documentation (Docusaurus)
* Database (MariaDB)

While development was straightforward using local tooling (`npm run dev`, `cargo run`), deployment introduced significant complexity due to environment differences, networking, and system reproducibility.

---

## Key Challenges and Resolutions

### 1. Environment Inconsistency (Node / Dependencies)

**Problem:**
Local development relied on system-installed dependencies (`node_modules`, Node versions), which frequently broke when moving environments.

**Solution:**
Adopted Docker Compose to standardise environments across all services.

**Outcome:**

* Eliminated dependency inconsistencies
* Enabled reproducible builds across machines

---

### 2. Managing Multiple Services

**Problem:**
Running 5–10 services required multiple terminals, making development and monitoring difficult.

**Solution:**
Introduced process management and later Docker orchestration.

**Outcome:**

* Single command (`docker-compose up`) runs entire system
* Centralised logs and lifecycle management

---

### 3. Git Submodule Failures

**Problem:**
Project used Git submodules for each service. Deployment failed due to missing commit references:

```
fatal: not our ref ...
```

**Cause:**
Main repository referenced submodule commits that were not present in remote repositories (e.g. force-push or unpushed commits).

**Solution:**

* Re-synchronised submodules to valid commits
* Migrated architecture to a monorepo

**Outcome:**

* Removed fragile commit pointer system
* Simplified cloning and deployment

---

### 4. Missing Docker Configuration

**Problem:**
Initial deployment failed due to missing Dockerfiles:

```
failed to read dockerfile: no such file or directory
```

**Solution:**
Created Dockerfiles for each service:

* Node services
* Frontend (Vite with `--host`)
* Rust service (`cargo run`)

**Outcome:**

* Services could be built and run in containers
* Unified deployment workflow

---

### 5. Service Communication Failure (Critical Bug)

**Problem:**
Repository creation failed with:

* HTTP 502 errors
* Browser reporting CORS errors

**Root Cause:**
The `rest-api` attempted to call the `git-agent` using:

```
http://localhost:6025
```

In Docker, `localhost` refers to the container itself, not other services.

**Solution:**

* Replaced `localhost` with Docker service name:

  ```
  http://git-agent:6025
  ```
* Ensured Rust service bound to:

  ```
  0.0.0.0:6025
  ```

**Outcome:**

* Inter-service communication restored
* Repository creation functionality fixed

---

### 6. Misleading CORS Errors

**Problem:**
Frontend showed:

```
CORS Missing Allow Origin
```

**Cause:**
Backend returned `502 Bad Gateway`, so no CORS headers were included.

**Solution:**

* Fixed backend communication first
* Then verified CORS configuration

**Outcome:**

* Identified CORS as a secondary symptom, not root cause

---

### 7. Production vs Development Differences

#### Development Environment

* Direct execution (`npm run dev`, `cargo run`)
* Uses `localhost` for all services
* Hot reloading enabled
* Minimal networking complexity

#### Production Environment

* Containerised using Docker
* Services communicate via internal network (service names)
* Requires explicit port exposure
* No hot reload
* Requires reverse proxy (e.g. NGINX)

**Key Difference:**

> Development hides complexity; production exposes it.

---

## Lessons Learned

1. **Docker is essential for consistency**
   Prevents environment-specific failures.

2. **Service discovery matters**
   `localhost` cannot be used between containers.

3. **Submodules introduce fragility**
   Monorepos are simpler for tightly coupled systems.

4. **Errors can be misleading**
   CORS issues may indicate deeper backend failures.

5. **Deployment is inherently harder than development**
   Due to networking, orchestration, and system integration.

---

## Time Investment

* Development: relatively fast and iterative
* Deployment: ~10+ hours due to:

  * debugging environment issues
  * fixing networking problems
  * restructuring repository

---

## Final Outcome

* Fully containerised system using Docker Compose
* All services run via a single command
* Stable and reproducible deployment
* Working end-to-end functionality including repository creation

---

## Conclusion

Although development was straightforward, deployment required significant effort due to hidden complexities in system integration. The transition to containerisation and a monorepo architecture ultimately resulted in a more robust and maintainable system.
