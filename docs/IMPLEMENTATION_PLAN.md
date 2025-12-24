# Implementation Plan: NewLingo Master Agent & Orchestration

This document outlines the step-by-step plan to refactor, enhance, and deploy the NewLingo application.

## Phase 1: Foundation & Local Environment (Immediate Priority)
**Goal**: Get the application running smoothly locally using Docker with full backend/frontend integration.

1.  **Environment Configuration**:
    *   Consolidate all environment variables into a single `.env` file for Docker to use.
    *   Verify API keys for Azure OpenAI, Azure Speech, and other services.
2.  **Docker Optimization**:
    *   Verify `docker-compose.yml` network bridging.
    *   Ensure `frontend` container can communicate with `backend` container for server-side rendering (SSR).
    *   Ensure browser (client-side) can communicate with `backend` via mapped ports.
3.  **Validation**:
    *   Run `docker-compose up --build`.
    *   Verify the Dashboard loads.
    *   Verify a simple API call (e.g., Health Check) works from the frontend.

## Phase 2: Architecture Refactoring & Cleanup
**Goal**: Improve code quality, remove legacy debt, and standardize the architecture.

1.  **Backend Cleanup (`backend/src`)**:
    *   Remove or archive legacy team implementations in `main.py`.
    *   Standardize the "Microsoft Agent Framework" (MAF) implementation across all teams.
    *   Ensure `blog_team` and `travel_team` follow the exact same pattern for consistency.
2.  **Frontend Refactoring (`frontend/src`)**:
    *   Refactor `MainLayout.tsx`: Extract sidebar navigation and sub-menus into smaller components.
    *   Centralize API configuration: Ensure `NEXT_PUBLIC_LINGO_API_URL` is robustly handled.
    *   Standardize "Team Dashboards" to use a common layout wrapper.

## Phase 3: Master Lingo Agent & Voice Orchestration
**Goal**: Implement the "Brain" that controls the system via Voice/Chat.

1.  **Unified Chat Interface**:
    *   Enhance the existing "Floating Lingo Agent" or "Unified Chat" to be the primary command center.
    *   Ensure it persists across navigation.
2.  **Master Agent Logic (`backend/src/lingo_agent`)**:
    *   Review `master_lingo_agent.py` and `intelligent_orchestrator.py`.
    *   Implement "Intent Routing":
        *   User says "Plan a trip to Paris" -> Route to **Travel Team**.
        *   User says "Write a blog about AI" -> Route to **Blog Team**.
        *   User says "Change the theme to dark" -> Execute **UI Action**.
3.  **Voice Integration**:
    *   Verify Azure Speech-to-Text integration.
    *   Ensure voice commands are parsed correctly into text and fed into the Intent Router.

## Phase 4: Azure Deployment & Authentication
**Goal**: Production-ready deployment.

1.  **Authentication**:
    *   Implement User Authentication (e.g., using Auth0 or Azure AD B2C).
    *   Protect Backend Routes: Add `Depends(get_current_user)` to all critical endpoints.
    *   Frontend Auth Guard: Redirect unauthenticated users to Login.
2.  **Azure Infrastructure**:
    *   Create Azure Container Registry (ACR).
    *   Create Azure App Service (Web App for Containers) or Azure Container Apps.
    *   Set up PostgreSQL on Azure (Azure Database for PostgreSQL).
3.  **CI/CD Pipeline**:
    *   Create GitHub Actions workflow to build and push Docker images to ACR.
    *   Configure auto-deployment to App Service.

---

## Immediate Next Steps (Phase 1)

1.  Check your `.env` file to ensure all keys (Azure, OpenAI, etc.) are present.
2.  Run the Docker containers to validate the current state.
3.  Fix any immediate build errors.
