'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Eye, 
  Code, 
  BarChart3, 
  Image as ImageIcon,
  FileText,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Loader2,
  Copy,
  Check
} from 'lucide-react'
import { CompiledArticle, ReviewActionRequest } from '@/types/blog-team'
import { useSmartNotifications } from '@/hooks/use-smart-notifications'

interface ArticleReviewProps {
  article: CompiledArticle
  workflowId: string
  onReviewAction: (action: ReviewActionRequest) => Promise<void>
  onBack?: () => void
  onViewProgress?: () => void
  onRewrite?: (topic: string) => void
  onRefreshArticle?: () => Promise<void>
  isLoading?: boolean
}

export function ArticleReview({ 
  article, 
  workflowId, 
  onReviewAction, 
  onBack, 
  onViewProgress,
  onRewrite,
  onRefreshArticle,
  isLoading = false 
}: ArticleReviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'markdown'>('preview')
  const [feedback, setFeedback] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const notifications = useSmartNotifications()
  const [copiedStates, setCopiedStates] = useState({
    preview: false,
    html: false,
    markdown: false
  })

  const handleCopy = async (type: 'preview' | 'html' | 'markdown') => {
    let textToCopy = ''
    
    switch (type) {
      case 'preview':
        // For preview, copy plain text by stripping HTML tags
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = article.content_html
        textToCopy = tempDiv.textContent || tempDiv.innerText || ''
        break
      case 'html':
        textToCopy = article.content_html
        break
      case 'markdown':
        textToCopy = article.content_markdown
        break
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedStates(prev => ({ ...prev, [type]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleReviewAction = async (action: ReviewActionRequest['action']) => {
    if (action === 'request_changes' && !feedback.trim()) {
      notifications.showError('Feedback Required', 'Please provide feedback for the changes you want.')
      return
    }

    // For request_changes, first try smart targeted changes
    if (action === 'request_changes') {
      try {
        await handleSmartChanges(feedback)
        return
      } catch (error) {
        console.error('Smart changes failed, falling back to full workflow:', error)
        // Fall through to regular review action
      }
    }

    setActionLoading(action)
    try {
      await onReviewAction({
        action,
        feedback: action === 'request_changes' ? feedback : undefined,
        platforms: action === 'approve' ? ['wordpress'] : undefined
      })
    } finally {
      setActionLoading(null)
      if (action === 'request_changes') {
        setFeedback('')
      }
    }
  }

  const handleSmartChanges = async (userFeedback: string) => {
    setActionLoading('request_changes')
    
    try {
      // Step 1: Analyze the feedback
      notifications.showAnalysis('Analyzing your feedback with AI to detect smart changes...')
      
      console.log('Analyzing feedback for smart changes...', { workflowId, userFeedback })
      const analyzeResponse = await fetch(`/api/blog/${workflowId}/analyze-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: userFeedback })
      })

      console.log('Analyze response status:', analyzeResponse.status)

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text()
        console.error('Analyze feedback error:', errorText)
        throw new Error(`Failed to analyze feedback: ${analyzeResponse.status} - ${errorText}`)
      }

      const response = await analyzeResponse.json()
      console.log('Feedback analysis result:', response)
      
      // Extract analysis from response
      const analysis = response.analysis || response
      
      // Step 2: Check if it's a smart change (confidence >= 25%)
      const isSmartChange = analysis.confidence_score >= 0.25 && analysis.change_type !== 'full_rewrite'
      if (isSmartChange) {
        // Show smart change confirmation modal
        notifications.showConfirmation(
          'Smart Change Detected',
          `We detected a ${analysis.change_type.replace('_', ' ')} change that can be applied quickly instead of a full rewrite.`,
          {
            changeType: analysis.change_type,
            confidence: analysis.confidence_score,
            estimatedTime: analysis.estimated_time_seconds,
            target: analysis.specific_target
          },
          async () => {
            // Step 3: Execute smart change
            console.log('Executing smart change...')
            
            // Show progress notification
            notifications.showProgress(
              `Executing ${analysis.change_type.replace('_', ' ')} change. This will take approximately ${analysis.estimated_time_seconds} seconds.`,
              0
            )
            
            const executeResponse = await fetch(`/api/blog/${workflowId}/execute-smart-change`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                change_type: analysis.change_type,
                user_request: userFeedback
              })
            })

            if (!executeResponse.ok) {
              const errorText = await executeResponse.text()
              throw new Error(`Failed to execute smart change: ${executeResponse.status} - ${errorText}`)
            }

            const result = await executeResponse.json()
            console.log('Smart change result:', result)

            if (result.success) {
              // Show success notification
              notifications.showSuccess(
                'Smart Change Applied Successfully!',
                `${result.message} The article has been updated. You can see the changes below or in the workflow progress.`,
                {
                  changeType: result.change_type,
                  executionTime: result.execution_time || 0
                }
              )
              
              setFeedback('')
              
              // Refresh the article data to show the changes
              if (onRefreshArticle) {
                try {
                  await onRefreshArticle()
                  console.log('Article data refreshed successfully')
                } catch (refreshError) {
                  console.error('Failed to refresh article data:', refreshError)
                }
              }
              
              // Optional: Navigate to progress view after a delay
              setTimeout(() => {
                if (onViewProgress) {
                  // onViewProgress() // Commented out to keep user on review page to see changes
                }
              }, 3000)
              
              return
            } else {
              // Check if we should fallback to full workflow
              if (result.fallback_to_full_workflow) {
                notifications.showError(
                  'Smart Change Failed',
                  `${result.message} Falling back to full workflow rewrite.`
                )
                throw new Error('Smart change failed - using full workflow')
              } else {
                throw new Error(result.message || 'Smart change failed')
              }
            }
          },
          async () => {
            // User chose full rewrite, fall back to traditional workflow
            throw new Error('User chose full rewrite')
          }
        )
      } else {
        // Not a smart change, fall back to full workflow
        notifications.showError(
          'Smart Change Not Detected',
          `Confidence too low (${(analysis.confidence_score * 100).toFixed(1)}%). Falling back to full workflow rewrite.`
        )
        throw new Error('Low confidence - using full workflow')
      }

    } catch (error) {
      console.error('Smart changes error:', error)
      notifications.hideNotification() // Hide any open notifications
      throw error // Re-throw to trigger fallback
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewWorkflowProgress = () => {
    if (onViewProgress) {
      onViewProgress()
    } else if (onBack) {
      // Fallback to going back to dashboard
      onBack()
    }
  }

  const handleRewriteArticle = async () => {
    if (confirm('Are you sure you want to rewrite this article? This will start a new workflow with the same topic but generate fresh content.')) {
      try {
        // Extract the original topic from the article title or use the title itself
        const topic = article.title
        
        if (onRewrite) {
          onRewrite(topic)
        } else if (onBack) {
          onBack() // Go back to dashboard
          
          // After a short delay, we could trigger a new workflow
          setTimeout(() => {
            console.log('Triggering rewrite for topic:', topic)
          }, 100)
        }
      } catch (error) {
        console.error('Error triggering rewrite:', error)
        alert('Failed to start rewrite. Please try again.')
      }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />
    if (score >= 60) return <MessageSquare className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="outline" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Article Review
                </CardTitle>
                <CardDescription>Review and approve your AI-generated article</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Navigate back to workflow progress
                  handleViewWorkflowProgress()
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Workflow Progress
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Trigger rewrite workflow
                  handleRewriteArticle()
                }}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Rewrite Article
              </Button>
              <Badge variant="outline" className="text-sm">
                Workflow: {workflowId}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{article.title}</CardTitle>
              <CardDescription className="text-base">
                {article.meta_description}
              </CardDescription>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{article.word_count} words</span>
                <Separator orientation="vertical" className="h-4" />
                <span>SEO Score: {article.seo_score.toFixed(0)}/100</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Readability: {article.readability_score.toFixed(0)}/100</span>
              </div>
            </CardHeader>
          </Card>

          {article.feature_image && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Feature Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {article.feature_image.image_url && article.feature_image.image_url.trim() !== '' ? (
                    <img 
                      src={article.feature_image.image_url} 
                      alt={article.feature_image.alt_text}
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No feature image available</p>
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <p><strong>Alt Text:</strong> {article.feature_image.alt_text || 'Not specified'}</p>
                    <p><strong>Prompt:</strong> {article.feature_image.prompt_used || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Content
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={activeTab === 'preview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('preview')}
                    className={activeTab === 'preview' ? '' : 'hover:bg-gray-100 hover:border-gray-400 transition-colors'}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant={activeTab === 'html' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('html')}
                    className={activeTab === 'html' ? '' : 'hover:bg-gray-100 hover:border-gray-400 transition-colors'}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    HTML
                  </Button>
                  <Button
                    variant={activeTab === 'markdown' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('markdown')}
                    className={activeTab === 'markdown' ? '' : 'hover:bg-gray-100 hover:border-gray-400 transition-colors'}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Markdown
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[950px]">
                {activeTab === 'preview' && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy('preview')}
                      className="absolute top-2 right-2 z-10 bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500 transition-all shadow-lg"
                    >
                      {copiedStates.preview ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Text
                        </>
                      )}
                    </Button>
                    <div 
                      className="prose prose-lg max-w-none prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-a:text-blue-400 prose-li:text-gray-200 bg-gray-800 p-6 rounded-lg"
                      dangerouslySetInnerHTML={{ __html: article.content_html }}
                    />
                  </div>
                )}
                {activeTab === 'html' && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy('html')}
                      className="absolute top-2 right-2 z-10 bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500 transition-all shadow-lg"
                    >
                      {copiedStates.html ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy HTML
                        </>
                      )}
                    </Button>
                    <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code className="text-green-400">{article.content_html}</code>
                    </pre>
                  </div>
                )}
                {activeTab === 'markdown' && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy('markdown')}
                      className="absolute top-2 right-2 z-10 bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500 transition-all shadow-lg"
                    >
                      {copiedStates.markdown ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Markdown
                        </>
                      )}
                    </Button>
                    <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      <code className="text-blue-300">{article.content_markdown}</code>
                    </pre>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quality Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  {getScoreIcon(article.seo_score)}
                  <span className="font-medium">SEO Score</span>
                </div>
                <Badge className={getScoreColor(article.seo_score)}>
                  {article.seo_score.toFixed(0)}/100
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  {getScoreIcon(article.readability_score)}
                  <span className="font-medium">Readability</span>
                </div>
                <Badge className={getScoreColor(article.readability_score)}>
                  {article.readability_score.toFixed(0)}/100
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Word Count</span>
                </div>
                <Badge variant="outline">
                  {article.word_count} words
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {article.quality_checks.map((check, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    {check.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{check.check_name}</span>
                        <Badge 
                          variant={check.passed ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {check.score?.toFixed(0) || 0}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO Keywords</CardTitle>
              <CardDescription>
                Keywords used throughout the article
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(article.keyword_usage).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(article.keyword_usage)
                    .sort(([, a], [, b]) => b - a)
                    .map(([keyword, count]) => (
                      <div key={keyword} className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors">
                        <span className="text-sm font-semibold text-gray-800">{keyword}</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-semibold">
                          {count}x
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No keyword data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Actions</CardTitle>
              <CardDescription>
                Approve, request changes, or decline this article
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback for Changes</Label>
                <Textarea
                  id="feedback"
                  placeholder="Describe what changes you'd like to see..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleReviewAction('approve')}
                  disabled={isLoading || actionLoading !== null}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === 'approve' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ThumbsUp className="h-4 w-4 mr-2" />
                  )}
                  Approve Article
                </Button>

                <Button
                  onClick={() => handleReviewAction('request_changes')}
                  disabled={isLoading || actionLoading !== null || !feedback.trim()}
                  variant="outline"
                  className="w-full"
                >
                  {actionLoading === 'request_changes' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Request Changes (Smart Analysis)
                </Button>

                <Button
                  onClick={() => handleReviewAction('decline')}
                  disabled={isLoading || actionLoading !== null}
                  variant="destructive"
                  className="w-full"
                >
                  {actionLoading === 'decline' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ThumbsDown className="h-4 w-4 mr-2" />
                  )}
                  Decline Article
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Approve:</strong> Mark as ready for publishing</p>
                <p><strong>Request Changes:</strong> Smart analysis first (15-90s), falls back to full rewrite if needed</p>
                <p><strong>Decline:</strong> Save as draft and stop workflow</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ArticleReview
