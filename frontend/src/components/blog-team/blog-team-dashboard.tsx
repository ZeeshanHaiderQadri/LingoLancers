"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { BlogCreationForm } from "./blog-creation-form";
import { EnhancedWorkflowProgress } from "./enhanced-workflow-progress";
import { ArticleReview } from "./article-review";
import { ArticleCardSkeletonGrid } from "./article-card-skeleton";
import {
  BlogRequest,
  DraftArticle,
  CompiledArticle,
  ReviewActionRequest,
} from "@/types/blog-team";

type ViewState = "dashboard" | "create" | "progress" | "review";

interface BlogTeamDashboardProps {
  className?: string;
}

export function BlogTeamDashboard({ className }: BlogTeamDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
    null
  );
  const [currentArticle, setCurrentArticle] = useState<CompiledArticle | null>(
    null
  );
  const [drafts, setDrafts] = useState<DraftArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_LINGO_API_URL || "http://localhost:8000";

  const handleCreateBlog = useCallback(
    async (request: BlogRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/blog/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setCurrentWorkflowId(result.workflow_id);
        
        // Immediately navigate to workflow progress page
        // This ensures users see the "magic" of agents working in real-time
        setCurrentView("progress");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create blog workflow"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  const handleWorkflowComplete = useCallback((article: CompiledArticle) => {
    setCurrentArticle(article);
    setCurrentView("review");
  }, []);

  const handleReviewAction = useCallback(
    async (action: ReviewActionRequest) => {
      if (!currentWorkflowId) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${apiUrl}/api/blog/${currentWorkflowId}/review`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(action),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (action.action === "approve") {
          setCurrentView("dashboard");
          setCurrentWorkflowId(null);
          setCurrentArticle(null);
          await fetchDrafts();
        } else if (action.action === "request_changes") {
          setCurrentView("progress");
          setCurrentArticle(null);
        } else if (action.action === "decline") {
          setCurrentView("dashboard");
          setCurrentWorkflowId(null);
          setCurrentArticle(null);
          await fetchDrafts();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process review action"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentWorkflowId, apiUrl]
  );

  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/blog/drafts`);
      if (response.ok) {
        const draftsData = await response.json();
        setDrafts(draftsData);
      }
    } catch (err) {
      console.error("Failed to fetch drafts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  const handleDeleteDraft = useCallback(
    async (draftId: number) => {
      try {
        const response = await fetch(`${apiUrl}/api/blog/drafts/${draftId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchDrafts();
        }
      } catch (err) {
        setError("Failed to delete draft");
      }
    },
    [apiUrl, fetchDrafts]
  );

  const refreshCurrentArticle = useCallback(async () => {
    if (!currentWorkflowId) {
      console.error("No current workflow ID to refresh");
      return;
    }

    try {
      console.log("Refreshing article data for workflow:", currentWorkflowId);

      // Fetch the latest draft data for this workflow
      const response = await fetch(`${apiUrl}/api/blog/drafts`);
      if (response.ok) {
        const draftsData = await response.json();
        const updatedDraft = draftsData.find(
          (draft: any) => draft.workflow_id === currentWorkflowId
        );

        if (updatedDraft) {
          // Convert draft to CompiledArticle format
          const article: CompiledArticle = {
            title: updatedDraft.title,
            meta_description: updatedDraft.meta_description || "",
            feature_image: {
              image_url: updatedDraft.feature_image_url || "",
              alt_text: updatedDraft.title,
              prompt_used: "",
              size: "1200x630",
            },
            content_html: updatedDraft.content_html || "",
            content_markdown: updatedDraft.content_markdown || "",
            word_count: updatedDraft.word_count || 0,
            seo_score: updatedDraft.seo_score || 0,
            readability_score: updatedDraft.readability_score || 0,
            quality_checks: updatedDraft.quality_checks || [],
            keyword_usage: updatedDraft.keyword_usage || {},
          };

          console.log("Updated article data:", article);
          setCurrentArticle(article);

          // Also refresh the drafts list
          setDrafts(draftsData);
        } else {
          console.error("Draft not found for workflow:", currentWorkflowId);
        }
      } else {
        console.error("Failed to fetch updated drafts");
      }
    } catch (err) {
      console.error("Failed to refresh article data:", err);
    }
  }, [currentWorkflowId, apiUrl]);

  const handleRewriteArticle = useCallback(
    async (topic: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Create a new blog request with the same topic
        const rewriteRequest: BlogRequest = {
          topic: topic,
          reference_urls: [],
          target_word_count: 1500,
          tone: "professional",
          additional_instructions:
            "Please rewrite this article with fresh content and improved quality.",
        };

        // Start a new workflow
        const response = await fetch(`${apiUrl}/api/blog/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rewriteRequest),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setCurrentWorkflowId(result.workflow_id);
        setCurrentView("progress");
        setCurrentArticle(null); // Clear the current article
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to start rewrite workflow"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  const goBack = useCallback(() => {
    if (currentView === "progress" || currentView === "review") {
      setCurrentView("dashboard");
      setCurrentWorkflowId(null);
      setCurrentArticle(null);
    } else if (currentView === "create") {
      setCurrentView("dashboard");
    }
  }, [currentView]);

  useEffect(() => {
    fetchDrafts();
    
    // Check if we should open directly to create form
    const viewParam = sessionStorage.getItem("blog_team_view");
    if (viewParam === "create") {
      console.log("🎯 Opening blog team in create view");
      setCurrentView("create");
      sessionStorage.removeItem("blog_team_view"); // Clear after using
    }
  }, [fetchDrafts]);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      approved: "default",
      declined: "destructive",
      published: "default",
    } as const;

    const colors = {
      draft: "bg-gray-100 text-gray-700",
      approved: "bg-green-100 text-green-700",
      declined: "bg-red-100 text-red-700",
      published: "bg-blue-100 text-blue-700",
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "secondary"}
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "create":
        return (
          <div className="animate-in fade-in duration-300">
            <BlogCreationForm
              onSubmit={handleCreateBlog}
              onCancel={goBack}
              isLoading={isLoading}
            />
          </div>
        );

      case "progress":
        return currentWorkflowId ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EnhancedWorkflowProgress
              workflowId={currentWorkflowId}
              onBack={goBack}
              onComplete={handleWorkflowComplete}
            />
          </div>
        ) : null;

      case "review":
        return currentArticle && currentWorkflowId ? (
          <div className="animate-in fade-in duration-300">
            <ArticleReview
              article={currentArticle}
              workflowId={currentWorkflowId}
              onReviewAction={handleReviewAction}
              onBack={goBack}
              onViewProgress={() => {
                // Navigate back to workflow progress
                setCurrentView("progress");
              }}
              onRewrite={(topic) => {
                // Handle rewrite by creating a new workflow with the same topic
                handleRewriteArticle(topic);
              }}
              onRefreshArticle={refreshCurrentArticle}
              isLoading={isLoading}
            />
          </div>
        ) : null;

      default:
        return (
          <div className="w-full max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      Blog Writing Team
                    </CardTitle>
                    <CardDescription>
                      Create AI-powered blog articles with research, SEO
                      optimization, and images
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setCurrentView("create")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Draft Articles</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchDrafts}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ArticleCardSkeletonGrid count={3} />
                ) : drafts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No drafts yet</p>
                    <p className="text-sm">
                      Create your first AI-powered blog article to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="flex items-start justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {draft.title}
                            </h3>
                            {getStatusBadge("draft")}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            Workflow ID: {draft.workflow_id}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Created{" "}
                              {new Date(draft.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {draft.word_count || 0} words
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Transform flat draft response to CompiledArticle structure
                              const article: CompiledArticle = {
                                title: draft.title,
                                meta_description: draft.meta_description || "",
                                feature_image: {
                                  image_url: draft.feature_image_url || "",
                                  alt_text: draft.title,
                                  prompt_used: "",
                                  size: "",
                                },
                                content_html: draft.content_html || "",
                                content_markdown: draft.content_markdown || "",
                                seo_score: draft.seo_score || 0,
                                readability_score: draft.readability_score || 0,
                                quality_checks: draft.quality_checks || [],
                                word_count: draft.word_count || 0,
                                keyword_usage: draft.keyword_usage || {},
                              };
                              setCurrentArticle(article);
                              setCurrentWorkflowId(draft.workflow_id);
                              setCurrentView("review");
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDraft(draft.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold text-lg">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Create Request</h4>
                    <p className="text-sm text-gray-600">
                      Provide a topic, tone, and length. Add reference URLs if
                      needed.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 font-bold text-lg">
                        2
                      </span>
                    </div>
                    <h4 className="font-semibold mb-2">AI Agents Work</h4>
                    <p className="text-sm text-gray-600">
                      6 specialized AI agents research, write, optimize, and add
                      images.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold text-lg">
                        3
                      </span>
                    </div>
                    <h4 className="font-semibold mb-2">Review & Publish</h4>
                    <p className="text-sm text-gray-600">
                      Review the article, request changes if needed, then
                      approve for publishing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return <div className={className}>{renderCurrentView()}</div>;
}

export default BlogTeamDashboard;
