# Lingo Upgrade Roadmap

**Status:** Proposed

**Product direction:** Voice-first Agentic Business Desk

**Primary user:** An export, ecommerce, or services SME owner who wants to turn a spoken business goal into a reviewed, evidence-backed launch plan and approved execution assets.

**Core outcome:** A user can say, “Launch my product in Dubai,” then review a transparent mission produced by a small team of Microsoft Agent Framework agents: market evidence, offer, creative brief, content plan, approval requests, and a measurable outcome record.

## 1. Why we are changing direction

Lingo already has valuable foundations: voice, conversational interaction, research, content, image generation, workflow interfaces, FastAPI, Next.js, WebSockets, and Azure service integrations. The product currently presents them as many separate tools and prototype teams.

The upgrade will make them one coherent product. We will optimize for a complete, trusted business mission instead of adding more isolated AI features.

## 2. Product scope

### First production mission: Market Launch

Input examples:

- “Research demand and prepare a launch plan for my skincare product in Dubai.”
- “Create a campaign for our logistics service for GCC importers.”
- “Turn this voice note into a launch brief and the first content assets.”

Required outputs:

1. A structured business brief with goal, audience, market, budget, deadline, and success measure.
2. Evidence-backed market findings with source links and confidence labels.
3. A proposed offer and claims requiring human approval.
4. A creative brief, image prompts or approved creative assets, and channel-specific copy.
5. An approval queue for publishing, spending, or any external action.
6. A mission record showing cost, timing, decisions, outputs, and next actions.

### Explicitly out of scope for phase one

- Autonomous publishing or advertising spend.
- A general-purpose agent marketplace.
- Migrating every existing prototype team.
- Removing existing features before the first production mission proves itself.
- Building a large always-on agent swarm.

## 3. Technical target

### Current state

The backend contains custom orchestration code labelled as Microsoft Agent Framework. It is not yet the official MAF Python SDK. The local `backend/src/agent_framework` directory would also conflict with the official SDK package name.

### Target state

```text
Next.js Mission Control
        │
        │ REST for commands, WebSocket for mission events
        ▼
FastAPI application
        │
        ├── Mission API and approval API
        ├── Mission state store and audit log
        ├── Microsoft Agent Framework workflow
        │     ├── Mission manager
        │     ├── Evidence agent
        │     ├── Offer and compliance agent
        │     ├── Creative and content agent
        │     └── Reviewer agent
        └── Tool adapters: search, asset generation, approved integrations
        │
        ▼
Microsoft Foundry models, Azure storage and observability
```

### Design principles

- Use the official MAF SDK and Foundry integration, not custom classes that only resemble MAF.
- Start with one manager and two or three specialists per mission. Add concurrency only when measurement shows it helps.
- Keep retrieval, persistence, approvals, and external actions deterministic.
- Every model claim shown to a user needs a source, a confidence label, or an explicit “assumption” label.
- Every external action requires a user approval record in phase one.
- Prefer managed identity and server-side credentials. Never expose keys to the frontend.

## 4. Milestones and implementation plan

## Phase 0: Establish a trustworthy baseline

**Duration:** Week 1

**Goal:** Make the repository safe to change and easy to validate.

### Work

- Initialize Git and create a protected `main` branch.
- Add a root `.gitignore` for `.env`, virtual environments, `.next`, logs, SQLite databases, Python caches, and local test artifacts.
- Remove generated and runtime artifacts from version control while preserving local copies outside the repository if required.
- Rotate any credentials that were stored in local `.env` files or Docker Compose.
- Move the PostgreSQL password out of `docker-compose.yml` into environment configuration.
- Restrict CORS to known frontend origins and add authentication design decisions.
- Fix the malformed backend dependency declaration and create one locked dependency strategy.
- Fix all current frontend TypeScript errors.
- Add CI checks: backend syntax/lint, frontend typecheck/lint, unit tests, secret scanning.
- Add a concise architecture README and make this roadmap the authoritative planning document.

### Exit criteria

- Clean clone can install and start the frontend and backend using documented commands.
- `npm run typecheck` passes.
- Backend code compiles and test command exists.
- No source-controlled secrets, databases, logs, virtual environments, or build output.
- Critical API endpoints do not use wildcard CORS with credentials.

## Phase 1: Make MAF real

**Duration:** Weeks 2 and 3

**Goal:** Replace the first custom workflow with an official MAF workflow connected to Foundry.

### Work

- Rename `backend/src/agent_framework` to `backend/src/legacy_orchestration` so it cannot shadow the official Python package.
- Introduce `agent-framework-foundry` using a pinned, tested version.
- Create a dedicated `backend/src/missions` domain package. Do not add more functionality to `maf_core`.
- Define mission data contracts: `Mission`, `MissionBrief`, `Evidence`, `Artifact`, `Approval`, `AgentRun`, and `MissionEvent`.
- Build one MAF workflow for structured mission intake and evidence research.
- Persist mission state and event history in PostgreSQL. Stop using local SQLite for the production path.
- Stream typed mission events over WebSocket: `mission.started`, `agent.status`, `evidence.added`, `artifact.ready`, `approval.requested`, `mission.completed`, and `mission.failed`.
- Add an integration test that runs a mocked mission end to end.

### Exit criteria

- A real MAF workflow can accept a text mission and emit a persisted brief and evidence set.
- The old custom MAF implementation is not used by the new mission route.
- Failed tool calls and model failures become visible mission events, not silent `except Exception` fallbacks.

## Phase 2: Build the Market Launch mission

**Duration:** Weeks 4 and 5

**Goal:** Deliver one narrow, valuable multi-agent workflow.

### Agent roles

| Agent | Responsibility | Output |
|---|---|---|
| Mission manager | Plans work, delegates, checks completeness | Mission plan and final handoff |
| Evidence agent | Finds and normalizes market sources | Cited findings and confidence |
| Offer reviewer | Tests positioning, claims, risks, assumptions | Approved draft offer and review notes |
| Creative agent | Produces asset brief and channel copy | Creative brief, prompts, copy variants |
| Human reviewer | Approves or requests revision | Durable approval decision |

### Work

- Add guided text intake and voice transcription intake.
- Implement a mission manager with bounded delegation and a maximum tool/model budget.
- Build search and source-normalization adapters. Store source URL, title, retrieved time, excerpt, and confidence.
- Add the offer review and creative/content stages.
- Add human approval gates for claims, generated image selection, publishing, and spend.
- Create evaluation fixtures for at least 20 representative SME launch prompts.
- Record quality, latency, tool failures, cost estimate, and approval outcomes for every mission.

### Exit criteria

- A user can complete a Market Launch mission without manual database intervention.
- Each material market claim has a source or is visibly marked as an assumption.
- No publishing or paid action proceeds without an approval record.
- A reviewer can understand why an agent produced an output from the mission timeline.

## Phase 3: Replace the dashboard with Mission Control

**Duration:** Weeks 5 through 7, overlapping Phase 2 when API contracts stabilize

**Goal:** Make agent work comprehensible, reviewable, and useful.

### Information architecture

- **Mission Control:** active missions, blockers, approval queue, recent outcomes.
- **Missions:** history, filters, mission detail, retry, export.
- **Evidence:** sources, assumptions, confidence, citations.
- **Assets:** generated briefs, images, copy, exports, revisions.
- **Operations:** agent health, integrations, budgets, audit log.
- **Labs:** existing travel, avatar, try-on, and experimental tools kept separate from the main flow.

### Mission detail screen

```text
Mission title, target market, success measure, owner
Progress timeline with live agent and tool events
Evidence panel with citations and confidence
Artifacts panel with draft and approved versions
Approval queue with the exact decision and consequence
Cost, latency, next action, and audit history
```

### Work

- Replace the current mock workflow animation with live typed events.
- Simplify the main sidebar around the six product areas above.
- Establish a shared design system: semantic colors, typography, spacing, statuses, loading states, empty states, error states, and responsive behavior.
- Add accessible keyboard interaction and clear status labels.
- Add a first-mission onboarding flow with examples and a budget explanation.

### Exit criteria

- All workflow status shown in the dashboard comes from persisted backend events.
- A new user can create, review, and approve a mission without training.
- The dashboard works at desktop and mobile breakpoints.

## Phase 4: Evaluation, observability, and cost control

**Duration:** Weeks 8 through 10

**Goal:** Make quality and cost visible before expanding the product.

### Work

- Connect Foundry tracing and application telemetry to each mission and agent run.
- Create quality evaluators for brief completeness, grounded evidence, citation correctness, offer safety, and artifact usefulness.
- Establish release gates for quality, latency, and per-mission cost.
- Add daily and monthly budget limits with graceful fallbacks.
- Run a private pilot with five to ten target users and collect structured feedback.
- Decide whether the second mission should be Campaign Optimisation, Lead Qualification, or Supplier Discovery based on pilot demand.

### Exit criteria

- Every production mission has a trace ID, cost estimate, latency, and outcome status.
- A regression dataset and repeatable evaluation command exist.
- The team has a documented go/no-go decision for the second mission.

## 5. Backlog order

### P0: Do before new capabilities

- Git, ignore rules, secret rotation, Docker secret cleanup.
- Fix frontend typecheck and dependency install.
- Rename the local `agent_framework` package.
- Add official MAF and a clean Foundry configuration path.
- Auth, tenant/user identity, CORS restrictions, approval audit log.
- One end-to-end Market Launch mission.

### P1: Do after the first mission works

- Mission Control dashboard.
- Voice mission intake.
- Evaluations, tracing, budgets, retry/resume.
- Asset versioning and exports.
- Role-based review and team collaboration.

### P2: Only after pilot evidence

- Publishing connectors.
- CRM, email, and ad-platform actions.
- Autonomous follow-ups.
- More industry-specific mission templates.
- Migration or retirement plan for experimental modules.

## 6. Azure credit guardrails

- Default to a manager plus two specialists. Do not run every agent for every request.
- Use a lower-cost model for classification, extraction, source normalization, and draft routing.
- Reserve stronger models for planning, synthesis, and final reviewed artifacts.
- Cap iterations, tool calls, tokens, image generations, and total mission cost before execution begins.
- Cache research results with source timestamps.
- Require approval before expensive image generation batches or any external paid action.
- Track cost by mission, user, agent role, model, and tool.

## 7. Definition of done for the first release

A release candidate is ready only when all conditions are true:

- A user can submit a text or voice Market Launch mission.
- The system produces a brief, cited evidence, draft offer, creative brief, and content plan.
- The user can inspect the exact agent/tool timeline and source evidence.
- High-impact actions require explicit approval.
- The mission can be retried or resumed safely after failure.
- Typecheck, backend checks, tests, and security scans pass in CI.
- Cost, latency, quality evaluation, and errors are recorded for every mission.

## 8. First implementation session

Start with Phase 0 in this order:

1. Create Git and ignore rules.
2. Inventory and rotate credentials, then remove runtime artifacts from the repository.
3. Repair dependency manifests and frontend type errors.
4. Rename the conflicting custom `agent_framework` package.
5. Add a minimal MAF + Foundry proof of concept under `backend/src/missions`.
6. Define the mission event contract before beginning dashboard work.

Do not begin another feature module until steps 1 through 4 pass their exit criteria.
