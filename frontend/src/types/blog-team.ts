/**
 * Blog Writing Team Type Definitions
 */

export type ToneType = 'professional' | 'casual' | 'technical' | 'friendly';
export type LengthType = 'short' | 'medium' | 'long';
export type PlatformType = 'wordpress' | 'shopify' | 'facebook' | 'twitter';
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type WorkflowStatus = 'running' | 'completed' | 'failed' | 'awaiting_review';

export interface BlogRequest {
  topic: string;
  reference_urls: string[];
  target_word_count: number;
  tone: string;
  additional_instructions?: string;
  seo_keywords?: string[];
}

export interface AgentProgress {
  agent_name: string;
  status: AgentStatus;
  progress_percentage: number;
  message: string;
  result?: any;
  error?: string;
  started_at?: string;
  completed_at?: string;
}

export interface WorkflowProgress {
  agent_name: string;
  status: AgentStatus;
  progress_percentage: number;
  message: string;
  result?: any;
  error?: string;
}

export interface WorkflowState {
  workflowId: string;
  status: WorkflowStatus;
  agents: AgentProgress[];
  currentAgent?: string;
}

export interface PlatformIntegration {
  id: string;
  platform: PlatformType;
  name: string;
  description: string;
  connected: boolean;
  lastSync?: Date;
  metadata?: Record<string, any>;
}

export interface ConnectionForm {
  platform: string;
  credentials: Record<string, string>;
}

export interface ImageResult {
  url: string;
  type: 'feature' | 'supporting';
  alt_text: string;
  prompt?: string;
  photographer?: string;
  photographer_url?: string;
  unsplash_url?: string;
  section_id?: string;
}

export interface QualityCheck {
  check_name: string;
  passed: boolean;
  score?: number;
  message: string;
}

export interface CompiledArticle {
  title: string;
  meta_description: string;
  feature_image: {
    image_url: string;
    alt_text: string;
    prompt_used: string;
    size: string;
  };
  content_html: string;
  content_markdown: string;
  seo_score: number;
  readability_score: number;
  quality_checks: QualityCheck[];
  word_count: number;
  keyword_usage: Record<string, number>;
}

export interface ArticleReview {
  article: CompiledArticle;
  seoScore: number;
  readabilityScore: number;
  qualityChecks: QualityCheck[];
}

export interface ReviewActionRequest {
  action: 'approve' | 'request_changes' | 'decline';
  feedback?: string;
  platforms?: string[];
}

export interface ReviewActionResponse {
  workflow_id: string;
  status: string;
  message: string;
  iteration_count?: number;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  url?: string;
  post_id?: string;
  published_at: Date;
  error?: string;
}

export interface DraftArticle {
  id: number;
  workflow_id: string;
  title: string;
  content_html: string;
  content_markdown: string;
  meta_description: string;
  feature_image_url: string;
  seo_score: number;
  readability_score: number;
  word_count: number;
  keyword_usage: Record<string, number>;
  quality_checks: QualityCheck[];
  status: string;
  created_at: Date;
  updated_at: Date;
}
