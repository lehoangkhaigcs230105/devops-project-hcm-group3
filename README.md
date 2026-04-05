# DevOps Base Project

## Project Overview

This is a simple Todo application with:
- **Frontend**: React (port 3000)
- **Backend**: Node.js/Express (port 8080)
- **Database**: PostgreSQL (port 5432)
- When running with docker-compose, the backend listens on port 8080 within the container and is mapped to the host (e.g., 8080).

Your task is to build a complete CI/CD pipeline around this application.

## Known Issues (You Must Fix!)

The codebase contains **intentional bugs** that you need to identify and fix:

### Backend Issues:
1. **server.js** - Multiple bugs marked with comments (6 bugs total!)
2. **Tests failing** - 4 out of 7 tests will fail until you fix the code
3. **Missing functionality** - DELETE and PUT endpoints not implemented

### Docker Issues:
1. **Dockerfiles** - Need to be completed (only skeleton/comments provided)
2. **docker-compose.yml** - Incomplete, missing configurations
3. **Missing .dockerignore** - You need to create these files

### CI/CD:
1. **No workflow file** - You must create `.github/workflows/ci.yml` from scratch

## Your Tasks

### Task 1: Fix Backend Bugs (server.js)
- [ ] Bug #1: Wrong default password
- [ ] Bug #2: Missing validation for empty title
- [ ] Bug #3: Missing DELETE endpoint
- [ ] Bug #4: Missing PUT endpoint
- [ ] Bug #5: Server starts in test mode
- [ ] Bug #6: App not exported for tests

### Task 2: Complete Dockerfiles
- [ ] Complete `backend/Dockerfile` (multi-stage build)
- [ ] Complete `frontend/Dockerfile` (multi-stage build)
- [ ] Create `.dockerignore` files for both

### Task 3: Complete docker-compose.yml
- [ ] Add proper environment variables
- [ ] Add healthchecks for backend and postgres
- [ ] Add volume mounts for database persistence
- [ ] Mount init script for database
- [ ] Configure service dependencies with health conditions

### Task 4: Create CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml`
- [ ] Configure build-and-test job with PostgreSQL service
- [ ] Configure Docker build and push to Docker Hub
- [ ] Configure deploy job with SSH

### Task 5: GitHub Configuration
- [ ] Setup branch protection for main
- [ ] Add required secrets
- [ ] Configure PR review requirements

## Testing Locally

```bash
# Install dependencies
cd backend && npm ci

# Run tests (will fail until bugs are fixed!)
npm test

# Expected: 3 pass, 4 fail (until you fix the code)
```

## Demo Flow (Fail-to-Fix)

1. Create a branch with failing code
2. Open PR → Show CI failing (Red X)
3. Fix the code → Push again
4. Show CI passing (Green ✓)
5. Get approval → Merge to main
6. Show CD deploying automatically
7. Verify live application updated
//
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: tododb
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd="pg_isready -U postgres"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18

      # ===== BACKEND =====
      - name: Install backend deps
        run: |
          cd backend
          npm ci

      - name: Run backend tests
        run: |
          cd backend
          npm test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: tododb
          DB_USER: postgres
          DB_PASSWORD: postgres

      # ===== FRONTEND =====
      - name: Install frontend deps
        run: |
          cd frontend
          npm ci

      - name: Build frontend
        run: |
          cd frontend
          npm run build

      # ===== DOCKER BUILD =====
      - name: Build Docker images
        run: |
          docker build -t ${{ secrets.DOCKER_HUB_GR3 }}/todo-frontend ./frontend
          docker build -t ${{ secrets.DOCKER_HUB_GR3 }}/todo-backend ./backend

      # ===== LOGIN DOCKER HUB =====
      - name: Login Docker Hub
        run: echo "${{ secrets.DOCKER_HUB_KHAITUNGMINH }}" | docker login -u "${{ secrets.DOCKER_HUB_GR3 }}" --password-stdin

      # ===== PUSH DOCKER =====
      - name: Push images
        run: |
          docker push ${{ secrets.DOCKER_HUB_GR3 }}/todo-frontend
          docker push ${{ secrets.DOCKER_HUB_GR3 }}/todo-backend

  # =============================
  # 🚀 DEPLOY (CD)
  # =============================
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest

    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/devops-project-hcm-group3
            git pull origin main
            docker compose down
            docker compose pull
            docker compose up -d