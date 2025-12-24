'use client'

import { useState } from 'react'
import { X, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EnhancedWorkflowProgress } from './blog-team/enhanced-workflow-progress'
import { ArticleReview } from './blog-team/article-review'
import { TravelWorkflowProgress } from './travel-team'
import EnhancedTeamDashboard from './enhanced-team-dashboard'

interface SplitScreenLayoutProps {
  chatContent: React.ReactNode
  workflowId?: string | null
  workflowType?: 'blog' | 'travel' | null
  onClose?: () => void
}

export function SplitScreenLayout({
  chatContent,
  workflowId,
  workflowType,
  onClose
}: SplitScreenLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [chatWidth, setChatWidth] = useState(35) // Default 35%
  const [showArticleReview, setShowArticleReview] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [showTravelReview, setShowTravelReview] = useState(false)
  const [travelPlan, setTravelPlan] = useState<any>(null)

  // If no workflow, show full-width chat
  if (!workflowId || !workflowType) {
    return <div className="w-full h-full">{chatContent}</div>
  }

  // If minimized, show chat with floating workflow indicator
  if (isMinimized) {
    return (
      <div className="relative w-full h-full">
        {chatContent}

        {/* Minimized workflow indicator - floating bottom right */}
        <div className="fixed bottom-20 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
              </div>
              <div>
                <p className="font-semibold text-sm">Workflow Running</p>
                <p className="text-xs text-blue-100">Agents are working...</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(false)}
                className="text-white hover:bg-white/20 ml-2"
              >
                Show
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If expanded, show full-width workflow
  if (isExpanded) {
    return (
      <div className="w-full h-full relative">
        {/* Controls - top right */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(false)}
            className="bg-background/95 backdrop-blur"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Split View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="bg-background/95 backdrop-blur"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Full-width workflow */}
        {workflowType === 'blog' && workflowId && (
          <EnhancedWorkflowProgress
            workflowId={workflowId}
            onBack={onClose}
            onComplete={() => { }}
          />
        )}
        {workflowType === 'travel' && workflowId && (
          <EnhancedTeamDashboard
            teamName="TRAVEL PLANNING"
            taskId={workflowId}
            onBack={onClose || (() => { })}
          />
        )}
      </div>
    )
  }

  // Default: Split screen view
  return (
    <div className="flex h-full w-full gap-0">
      {/* Chat Panel - Left Side */}
      <div
        className="flex flex-col bg-background border-r transition-all duration-300"
        style={{ width: `${chatWidth}%` }}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Chat with Lingo</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setChatWidth(Math.min(chatWidth + 5, 50))}
              title="Wider"
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setChatWidth(Math.max(chatWidth - 5, 25))}
              title="Narrower"
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          {chatContent}
        </div>
      </div>

      {/* Workflow Panel - Right Side */}
      <div
        className="flex flex-col bg-background animate-in slide-in-from-right duration-500"
        style={{ width: `${100 - chatWidth}%` }}
      >
        {/* Workflow Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            {!showArticleReview && (
              <div className="relative">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-base">
                {showArticleReview ? '📝 Article Review' :
                  showTravelReview ? '✈️ Travel Plan Review' :
                    'Workflow in Progress'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {showArticleReview ? 'Review and publish your article' :
                  showTravelReview ? 'Review your travel itinerary' :
                    'Watch your agents work their magic'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(true)}
              title="Minimize to corner"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(true)}
              title="Expand to full screen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              title="Close workflow panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Workflow Content */}
        <div className="flex-1 overflow-auto">
          {!showArticleReview && workflowType === 'blog' && workflowId && (
            <EnhancedWorkflowProgress
              workflowId={workflowId}
              onBack={onClose}
              onComplete={(completedArticle) => {
                // Show article review in split-screen instead of navigating
                console.log('✅ Showing article review in split-screen:', completedArticle);
                setArticle(completedArticle);
                setShowArticleReview(true);
                // DON'T navigate - stay in split-screen!
                // DON'T clear flag - keep split-screen active!
              }}
            />
          )}

          {showArticleReview && article && workflowType === 'blog' && (
            <ArticleReview
              article={article}
              workflowId={workflowId}
              onReviewAction={async (action) => {
                console.log('📝 Review action:', action);
                // Handle review actions (publish, edit, etc.)
                // The ArticleReview component handles the actual API calls
              }}
              onBack={() => {
                // Go back to workflow progress
                setShowArticleReview(false);
              }}
              onViewProgress={() => {
                // Go back to workflow progress
                setShowArticleReview(false);
              }}
              onRewrite={(topic) => {
                console.log('🔄 Rewrite requested:', topic);
                // Close split-screen and start new workflow
                if (onClose) onClose();
                // The chat will handle starting a new workflow
              }}
            />
          )}

          {!showTravelReview && workflowType === 'travel' && workflowId && (
            <TravelWorkflowProgress
              workflowId={workflowId}
              onBack={onClose}
              onComplete={(completedPlan) => {
                console.log('✅ Showing travel plan review in split-screen:', completedPlan);
                setTravelPlan(completedPlan);
                setShowTravelReview(true);
              }}
            />
          )}

          {showTravelReview && workflowType === 'travel' && (
            <div className="h-full overflow-auto">
              <EnhancedTeamDashboard
                teamName="TRAVEL PLANNING"
                taskId={workflowId!}
                onBack={() => {
                  setShowTravelReview(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
