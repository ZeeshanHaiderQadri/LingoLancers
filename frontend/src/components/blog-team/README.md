# Blog Writing Team Frontend Components

React/Next.js components for the Blog Writing Team feature.

## Directory Structure

```
blog-team/
├── index.ts                    # Component exports
├── blog-request-form.tsx       # Blog creation form
├── workflow-progress.tsx       # Real-time agent progress display
├── article-review.tsx          # Article review interface
├── drafts-list.tsx            # Draft management
└── integration-management.tsx  # Platform connection management
```

## Components

### BlogRequestForm
Form for creating new blog articles with:
- Topic input
- Reference URLs
- Tone selection (professional, casual, technical, friendly)
- Length selection (short, medium, long)
- Platform selection

### WorkflowProgress
Real-time display of agent execution:
- Agent status cards
- Progress bars
- WebSocket updates
- Expandable result previews

### ArticleReview
Review interface with:
- Article preview
- SEO metrics
- Quality checks
- Approve/Decline/Request Changes actions

### DraftsList
Draft management with:
- List of saved drafts
- Resume editing
- Delete functionality

### IntegrationManagement
Platform connection management:
- WordPress connection
- Shopify connection
- Facebook OAuth
- Twitter OAuth

## Services

Located in `src/lib/blog-team/`:
- `blog-api-service.ts` - API client for blog endpoints
- `integration-service.ts` - Integration management
- `websocket-service.ts` - WebSocket connection handling

## Types

Located in `src/types/blog-team.ts`:
- Request/Response types
- Agent progress types
- Platform integration types
- Article data types

## Environment Variables

See `frontend/.env.example`:
- `NEXT_PUBLIC_BLOG_API_URL` - Backend API URL
- `NEXT_PUBLIC_BLOG_WS_URL` - WebSocket URL
- `NEXT_PUBLIC_ENABLE_BLOG_WRITING_TEAM` - Feature flag

## Usage

```tsx
import { BlogRequestForm, WorkflowProgress } from '@/components/blog-team';

export default function BlogPage() {
  return (
    <div>
      <BlogRequestForm onSubmit={handleSubmit} />
      <WorkflowProgress workflowId={workflowId} />
    </div>
  );
}
```
