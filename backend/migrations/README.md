# Database Migrations

This directory contains SQL migrations for the Blog Writing Team feature.

## Prerequisites

- PostgreSQL database
- Python 3.x with psycopg2-binary installed
- DATABASE_URL environment variable set

## Migration Files

1. `001_create_user_integrations.sql` - User platform integrations table
2. `002_create_workflow_state.sql` - Workflow execution state table
3. `003_create_draft_articles.sql` - Draft articles table

## Running Migrations

### Option 1: Using Python Script (Recommended)

```bash
cd backend/migrations
python run_migrations.py
```

### Option 2: Using psql

```bash
psql $DATABASE_URL -f 001_create_user_integrations.sql
psql $DATABASE_URL -f 002_create_workflow_state.sql
psql $DATABASE_URL -f 003_create_draft_articles.sql
```

### Option 3: Using SQLAlchemy (from Python code)

```python
from blog_team.models import init_db

# This will create all tables defined in ORM models
init_db()
```

## Rolling Back

To drop all tables and start fresh:

```bash
psql $DATABASE_URL -f rollback.sql
```

## Environment Variables

Set your database connection string:

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/blog_writing_team"
```

Or add to your `.env` file:

```
DATABASE_URL=postgresql://username:password@localhost:5432/blog_writing_team
```

## Table Descriptions

### user_integrations
Stores encrypted credentials for publishing platforms (WordPress, Shopify, Facebook, Twitter).

**Key Features:**
- Encrypted credentials using Fernet
- Platform-specific metadata (JSONB)
- Connection status tracking
- Last sync timestamp

### workflow_state
Tracks blog writing workflow execution and agent results.

**Key Features:**
- Workflow progress tracking
- Agent results storage (JSONB)
- Iteration count (max 3)
- Error handling

### draft_articles
Stores saved/declined articles for later editing.

**Key Features:**
- Full article content (JSONB)
- Links to workflow_state
- Full-text search on title
- Automatic timestamps

## Indexes

All tables include optimized indexes for:
- User lookups
- Status filtering
- Date-based queries
- Full-text search (draft titles)

## Constraints

- Platform validation (wordpress, shopify, facebook, twitter)
- Status validation (connected, disconnected, error)
- Iteration count limits (0-3)
- Unique user-platform combinations
