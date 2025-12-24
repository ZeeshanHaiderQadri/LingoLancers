'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Search, 
  Target, 
  PenTool, 
  Image, 
  Images, 
  FileText,
  Wifi,
  WifiOff,
  ArrowLeft,
  Globe,
  ExternalLink,
  Eye,
  Lightbulb,
  Zap,
  Brain,
  Palette
} from 'lucide-react'
import { WorkflowProgress as WorkflowProgressType, AgentStatus } from '@/types/blog-team'

interface WorkflowProgressProps {
  workflowId: string
  onBack?: () => void
  onComplete?: (article: any) => void
}

interface AgentInfo {
  name: string
  displayName: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
  workDescription: string
}

const agentInfo: Record<string, AgentInfo> = {
  research: {
    name: 'research',
    displayName: 'Research Agent',
    icon: Search,
    description: 'Analyzing topic and gathering information',
    color: 'blue',
    workDescription: 'Searching the web for comprehensive information about your topic'
  },
  seo: {
    name: 'seo',
    displayName: 'SEO Agent',
    icon: Target,
    description: 'Optimizing for search engines',
    color: 'green',
    workDescription: 'Analyzing keywords and SEO opportunities for maximum visibility'
  },
  writer: {
    name: 'writer',
    displayName: 'Writer Agent',
    icon: PenTool,
    description: 'Creating engaging content',
    color: 'purple',
    workDescription: 'Crafting compelling, well-structured article content'
  },
  feature_image: {
    name: 'feature_image',
    displayName: 'Feature Image Agent',
    icon: Image,
    description: 'Generating feature image',
    color: 'orange',
    workDescription: 'Creating AI-powered feature image that captures your article essence'
  },
  image_finder: {
    name: 'image_finder',
    displayName: 'Image Finder Agent',
    icon: Images,
    description: 'Finding supporting images',
    color: 'pink',
    workDescription: 'Sourcing relevant, high-quality images to enhance your content'
  },
  compiler: {
    name: 'compiler',
    displayName: 'Compiler Agent',
    icon: FileText,
    description: 'Assembling final article',
    color: 'indigo',
    workDescription: 'Combining all elements into a polished, publication-ready article'
  }
}

interface AgentWork {
  type: 'search' | 'analysis' | 'generation' | 'processing' | 'compilation'
  title: string
  content: string
  url?: string
  progress?: number
  timestamp: string
  metadata?: any
}

interface LogEntry {
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  agent?: string
}

export function EnhancedWorkflowProgress({ workflowId, onBack, onComplete }: WorkflowProgressProps) {
  // Initialize progress with all agents in pending state
  const [progress, setProgress] = useState<WorkflowProgressType[]>(() => 
    Object.keys(agentInfo).map(agentName => ({
      agent_name: agentName,
      status: 'pending',
      progress_percentage: 0,
      message: 'Waiting to start...'
    }))
  )
  const [connected, setConnected] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const [agentWork, setAgentWork] = useState<AgentWork[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<string>('running')
  const [completedArticle, setCompletedArticle] = useState<any>(null)

  const addLog = (type: LogEntry['type'], message: string, agent?: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      agent
    }
    setLogs(prev => [...prev, newLog])
  }

  const addAgentWork = (work: Omit<AgentWork, 'timestamp'>) => {
    const newWork: AgentWork = {
      ...work,
      timestamp: new Date().toLocaleTimeString()
    }
    setAgentWork(prev => [newWork, ...prev])
  }

  const getAgentStatus = (agentName: string): AgentStatus => {
    const agentProgress = progress.find(p => p.agent_name === agentName)
    return agentProgress?.status || 'pending'
  }

  const getAgentMessage = (agentName: string): string => {
    const agentProgress = progress.find(p => p.agent_name === agentName)
    return agentProgress?.message || ''
  }

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: AgentStatus) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-600',
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      skipped: 'bg-gray-100 text-gray-600'
    }

    return (
      <Badge className={`${colors[status]} text-xs px-2 py-1`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const renderAgentWorkItem = (work: AgentWork, index: number) => {
    const getWorkIcon = () => {
      switch (work.type) {
        case 'search':
          return <Globe className="h-4 w-4 text-blue-500" />
        case 'analysis':
          return <Brain className="h-4 w-4 text-purple-500" />
        case 'generation':
          return <Zap className="h-4 w-4 text-yellow-500" />
        case 'processing':
          return <Lightbulb className="h-4 w-4 text-orange-500" />
        case 'compilation':
          return <FileText className="h-4 w-4 text-green-500" />
        default:
          return <Eye className="h-4 w-4 text-gray-500" />
      }
    }

    const getWorkColor = () => {
      switch (work.type) {
        case 'search':
          return 'border-blue-200 bg-blue-50'
        case 'analysis':
          return 'border-purple-200 bg-purple-50'
        case 'generation':
          return 'border-yellow-200 bg-yellow-50'
        case 'processing':
          return 'border-orange-200 bg-orange-50'
        case 'compilation':
          return 'border-green-200 bg-green-50'
        default:
          return 'border-gray-200 bg-gray-50'
      }
    }

    return (
      <div key={index} className={`p-4 rounded-lg border ${getWorkColor()} mb-3`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getWorkIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-gray-900">{work.title}</h4>
              <span className="text-xs text-gray-500">{work.timestamp}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{work.content}</p>
            
            {work.url && (
              <a 
                href={work.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                View Source
              </a>
            )}
            
            {work.progress !== undefined && (
              <div className="mt-2">
                <Progress value={work.progress} className="h-2" />
              </div>
            )}
            
            {work.metadata && (
              <div className="mt-2 space-y-2">
                {/* Show source links if available */}
                {work.metadata.sources && Array.isArray(work.metadata.sources) && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Sources Found:</p>
                    <div className="space-y-1">
                      {work.metadata.sources.slice(0, 5).map((source: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Globe className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 truncate flex-1"
                            title={source.title || source.url}
                          >
                            {source.title || source.url}
                          </a>
                        </div>
                      ))}
                      {work.metadata.sources.length > 5 && (
                        <p className="text-xs text-gray-500">
                          +{work.metadata.sources.length - 5} more sources
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Show other metadata */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  {Object.entries(work.metadata).map(([key, value]) => {
                    if (key === 'sources') return null; // Already handled above
                    return (
                      <span key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> {String(value)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Load completed workflow state and real progress history
  useEffect(() => {
    const loadWorkflowHistory = async () => {
      if (!workflowId || workflowId === 'pending') return
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8000'
        
        // First, try to fetch the actual workflow progress history
        const progressResponse = await fetch(`${apiUrl}/api/blog/${workflowId}/progress`)
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          
          if (progressData.progress_entries && progressData.progress_entries.length > 0) {
            // Load real progress history
            console.log('Loading real workflow progress history:', progressData)
            
            setWorkflowStatus('awaiting_review')
            setOverallProgress(100)
            
            // Mark all agents as completed
            setProgress(prev => 
              prev.map(p => ({
                ...p,
                status: 'completed',
                progress_percentage: 100,
                message: 'Completed'
              }))
            )
            
            // Load real agent work entries
            progressData.progress_entries.forEach((entry: any, index: number) => {
              setTimeout(() => {
                addAgentWork({
                  type: entry.progress_type,
                  title: entry.title,
                  content: entry.content,
                  metadata: entry.metadata,
                  url: entry.metadata?.url
                })
              }, index * 100) // Stagger for visual effect
            })
            
            addLog('success', 'Loaded real workflow progress history')
            
            // Also try to load the completed article
            const draftsResponse = await fetch(`${apiUrl}/api/blog/drafts`)
            if (draftsResponse.ok) {
              const drafts = await draftsResponse.json()
              const draft = drafts.find((d: any) => d.workflow_id === workflowId)
              
              if (draft) {
                const article = {
                  title: draft.title,
                  meta_description: draft.meta_description || '',
                  feature_image: {
                    image_url: draft.feature_image_url || null,
                    alt_text: draft.title,
                    prompt_used: 'Generated by AI',
                    size: ''
                  },
                  content_html: draft.content_html || '',
                  content_markdown: draft.content_markdown || '',
                  seo_score: draft.seo_score || 85,
                  readability_score: draft.readability_score || 90,
                  quality_checks: draft.quality_checks || [],
                  word_count: draft.word_count || 1500,
                  keyword_usage: draft.keyword_usage || {}
                }
                setCompletedArticle(article)
              }
            }
            
            return // Exit early if we found real progress
          }
        }
        
        // Fallback: Check if workflow exists but has no progress history
        const draftsResponse = await fetch(`${apiUrl}/api/blog/drafts`)
        if (draftsResponse.ok) {
          const drafts = await draftsResponse.json()
          const draft = drafts.find((d: any) => d.workflow_id === workflowId)
          
          if (draft) {
            // Workflow exists but no progress history - show completion state
            setWorkflowStatus('awaiting_review')
            setOverallProgress(100)
            
            setProgress(prev => 
              prev.map(p => ({
                ...p,
                status: 'completed',
                progress_percentage: 100,
                message: 'Completed'
              }))
            )
            
            const article = {
              title: draft.title,
              meta_description: draft.meta_description || '',
              feature_image: {
                image_url: draft.feature_image_url || null,
                alt_text: draft.title,
                prompt_used: 'Generated by AI',
                size: ''
              },
              content_html: draft.content_html || '',
              content_markdown: draft.content_markdown || '',
              seo_score: draft.seo_score || 85,
              readability_score: draft.readability_score || 90,
              quality_checks: draft.quality_checks || [],
              word_count: draft.word_count || 1500,
              keyword_usage: draft.keyword_usage || {}
            }
            setCompletedArticle(article)
            
            // Add a message about missing progress history
            addAgentWork({
              type: 'compilation',
              title: 'Workflow Completed',
              content: 'This workflow was completed successfully. Progress history is not available for workflows created before the progress tracking feature was implemented.',
              metadata: {
                note: 'Progress tracking was added in a recent update'
              }
            })
            
            addLog('info', 'Loaded completed workflow (no progress history available)')
          }
        }
        
      } catch (error) {
        console.error('Error loading workflow history:', error)
        addLog('error', 'Failed to load workflow history')
      }
    }
    
    loadWorkflowHistory()
  }, [workflowId])

  useEffect(() => {
    if (!workflowId || workflowId === 'pending') return

    const wsUrl = `${process.env.NEXT_PUBLIC_LINGO_API_URL?.replace('http', 'ws')}/ws/blog/${workflowId}`
    const websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      setConnected(true)
      addLog('success', 'Connected to workflow updates')
    }

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    websocket.onerror = () => {
      setConnected(false)
      addLog('error', 'WebSocket connection error')
    }

    websocket.onclose = () => {
      setConnected(false)
      addLog('warning', 'WebSocket connection closed')
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [workflowId])

  const handleWebSocketMessage = (data: any) => {
    console.log('WebSocket message:', data)

    switch (data.type) {
      case 'connected':
        addLog('success', data.message)
        break

      case 'agent_started':
        console.log(`🚀 Agent ${data.agent_name} started`)
        setCurrentAgent(data.agent_name)
        setProgress(prev => 
          prev.map(p => 
            p.agent_name === data.agent_name 
              ? { ...p, status: 'running', message: data.message || 'Running...', progress_percentage: 0 }
              : p
          )
        )
        
        // Add agent work entry
        const agent = agentInfo[data.agent_name]
        if (agent) {
          addAgentWork({
            type: 'processing',
            title: `${agent.displayName} Started`,
            content: agent.workDescription
          })
        }
        
        addLog('info', `${agentInfo[data.agent_name]?.displayName || data.agent_name} started`, data.agent_name)
        break

      case 'agent_progress':
        setProgress(prev => 
          prev.map(p => 
            p.agent_name === data.agent_name 
              ? { ...p, progress_percentage: data.progress_percentage, message: data.message }
              : p
          )
        )
        setOverallProgress(data.progress_percentage)
        
        // Add detailed work progress
        if (data.details) {
          addAgentWork({
            type: data.work_type || 'processing',
            title: data.details.title || data.message,
            content: data.details.content || data.message,
            url: data.details.url,
            progress: data.progress_percentage,
            metadata: data.details.metadata
          })
        }
        
        addLog('info', `${agentInfo[data.agent_name]?.displayName || data.agent_name}: ${data.message}`, data.agent_name)
        break

      case 'agent_search':
        // Research agent searching websites
        addAgentWork({
          type: 'search',
          title: `Searching: ${data.query || 'Web Research'}`,
          content: `Analyzing ${data.source || 'web sources'} for relevant information`,
          url: data.url,
          metadata: { 
            query: data.query,
            source_count: data.source_count 
          }
        })
        break

      case 'agent_analysis':
        // SEO agent analyzing keywords
        addAgentWork({
          type: 'analysis',
          title: `SEO Analysis: ${data.focus_keyword || 'Keywords'}`,
          content: `Analyzing search volume, competition, and optimization opportunities`,
          metadata: {
            keywords_found: data.keywords_count,
            difficulty: data.difficulty,
            search_volume: data.search_volume
          }
        })
        break

      case 'agent_generation':
        // Writer/Image agents generating content
        addAgentWork({
          type: 'generation',
          title: `Generating: ${data.content_type || 'Content'}`,
          content: data.description || 'Creating high-quality content based on research and requirements',
          progress: data.progress,
          metadata: {
            word_count: data.word_count,
            style: data.style
          }
        })
        break

      case 'agent_completed':
        console.log(`✅ Agent ${data.agent_name} completed`)
        setProgress(prev => 
          prev.map(p => 
            p.agent_name === data.agent_name 
              ? { ...p, status: 'completed', message: data.message || 'Completed', result: data.result, progress_percentage: 100 }
              : p
          )
        )
        
        // Add completion work entry
        addAgentWork({
          type: 'compilation',
          title: `${agentInfo[data.agent_name]?.displayName || data.agent_name} Completed`,
          content: data.message || 'Task completed successfully',
          metadata: data.result ? {
            output_size: typeof data.result === 'string' ? `${data.result.length} chars` : 'Complex object',
            quality_score: data.quality_score
          } : undefined
        })
        
        addLog('success', `${agentInfo[data.agent_name]?.displayName || data.agent_name} completed`, data.agent_name)
        break

      case 'agent_failed':
        setProgress(prev => 
          prev.map(p => 
            p.agent_name === data.agent_name 
              ? { ...p, status: 'failed', message: data.error }
              : p
          )
        )
        addLog('error', `${agentInfo[data.agent_name]?.displayName || data.agent_name} failed: ${data.error}`, data.agent_name)
        break

      case 'workflow_completed':
        console.log('🎉 Workflow completed! Article:', data.article)
        setWorkflowStatus(data.status)
        setOverallProgress(100)
        setCompletedArticle(data.article)
        
        // Mark all agents as completed
        setProgress(prev => 
          prev.map(p => ({
            ...p,
            status: 'completed',
            progress_percentage: 100,
            message: 'Completed'
          }))
        )
        
        addLog('success', data.message)
        // Don't auto-redirect - let user choose when to view article
        break

      case 'workflow_error':
        setWorkflowStatus('failed')
        addLog('error', `Workflow error: ${data.error}`)
        break
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
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
                  <FileText className="h-5 w-5" />
                  Blog Article Creation
                  {completedArticle && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 ml-2">
                      ✨ Ready!
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {completedArticle ? (
                    <span className="text-green-600 font-medium">
                      🎉 Your article is ready! Click "View Your Article" to review and publish.
                    </span>
                  ) : workflowStatus === 'awaiting_review' ? (
                    <span className="text-green-600 font-medium">
                      🎉 Article complete! Ready for review.
                    </span>
                  ) : (
                    `Workflow ID: ${workflowId}`
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(completedArticle || workflowStatus === 'awaiting_review') && (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={async () => {
                      console.log('View Article clicked!', completedArticle)
                      
                      // If no onComplete callback (split-screen mode), navigate to blog team
                      if (!onComplete) {
                        console.log('📍 No onComplete - navigating to blog team review page')
                        
                        // Clear the split-screen flag to allow navigation
                        (window as any).__splitScreenActive = false;
                        console.log('🔓 Clearing split-screen flag - allowing navigation');
                        
                        // Store the workflow ID for the blog team page
                        sessionStorage.setItem('current_workflow_id', workflowId)
                        if (completedArticle) {
                          sessionStorage.setItem('current_article', JSON.stringify(completedArticle))
                        }
                        
                        // Navigate to blog team review page
                        window.dispatchEvent(new CustomEvent('lingo-navigate', {
                          detail: { 
                            route: 'blog-team',
                            view: 'review',
                            workflowId
                          }
                        }))
                        return
                      }
                      
                      // Original logic when onComplete is provided
                      if (onComplete) {
                        // If we have the completed article from WebSocket, use it
                        if (completedArticle && completedArticle.content_html && completedArticle.content_html !== '<p>Article content will be loaded...</p>') {
                          onComplete(completedArticle)
                          return
                        }
                        
                        // Otherwise, fetch the draft from the backend
                        try {
                          const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8000'
                          const response = await fetch(`${apiUrl}/api/blog/drafts`)
                          if (response.ok) {
                            const drafts = await response.json()
                            // Find the draft for this workflow
                            const draft = drafts.find((d: any) => d.workflow_id === workflowId)
                            if (draft) {
                              // Transform to proper article structure
                              const article = {
                                title: draft.title,
                                meta_description: draft.meta_description || '',
                                feature_image: {
                                  image_url: draft.feature_image_url || '',
                                  alt_text: draft.title,
                                  prompt_used: '',
                                  size: ''
                                },
                                content_html: draft.content_html || '',
                                content_markdown: draft.content_markdown || '',
                                seo_score: draft.seo_score || 85,
                                readability_score: draft.readability_score || 90,
                                quality_checks: draft.quality_checks || [],
                                word_count: draft.word_count || 1500,
                                keyword_usage: draft.keyword_usage || {}
                              }
                              onComplete(article)
                              return
                            }
                          }
                        } catch (error) {
                          console.error('Error fetching draft:', error)
                        }
                        
                        // Fallback if fetch fails
                        const fallbackArticle = {
                          title: 'Generated Article',
                          meta_description: 'AI-generated article ready for review',
                          feature_image: {
                            image_url: null, // Use null instead of empty string
                            alt_text: 'Article feature image',
                            prompt_used: 'No prompt available',
                            size: ''
                          },
                          content_html: '<p>Article content is being loaded. Please try refreshing or navigate back to view from drafts.</p>',
                          content_markdown: 'Article content is being loaded...',
                          seo_score: 85,
                          readability_score: 90,
                          quality_checks: [],
                          word_count: 1500,
                          keyword_usage: {}
                        }
                        onComplete(fallbackArticle)
                      }
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    View Your Article
                  </Button>
                  <div className="text-2xl animate-bounce">🎉</div>
                </div>
              )}
              {!(completedArticle || workflowStatus === 'awaiting_review') && (
                <>
                  {connected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Wifi className="h-4 w-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <WifiOff className="h-4 w-4" />
                      <span className="text-sm font-medium">Disconnected</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            

          </div>
        </CardContent>
      </Card>

      {/* Main Content - 25% Agents, 75% Work */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Agents Progress - 25% */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">AI Agents</CardTitle>
              <CardDescription>Agent execution status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.values(agentInfo).map((agent) => {
                  const status = getAgentStatus(agent.name)
                  const message = getAgentMessage(agent.name)
                  const Icon = agent.icon
                  const isActive = currentAgent === agent.name

                  return (
                    <div 
                      key={agent.name} 
                      className={`p-3 rounded-lg border transition-all ${
                        isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded ${
                          status === 'completed' ? 'bg-green-100' :
                          status === 'running' ? 'bg-blue-100' :
                          status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            status === 'completed' ? 'text-green-600' :
                            status === 'running' ? 'text-blue-600' :
                            status === 'failed' ? 'text-red-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{agent.displayName}</h4>
                        </div>
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex justify-center">
                        {getStatusBadge(status)}
                      </div>
                      {message && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {message}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Work Display - 75% */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agent Work in Progress</CardTitle>
              <CardDescription>Real-time view of what your AI agents are doing</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-1">
                  {/* Completion Celebration */}
                  {(completedArticle || workflowStatus === 'awaiting_review') && (
                    <div className="mb-6 p-6 rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="text-center">
                        <div className="text-4xl mb-3">🎉✨🎊</div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">
                          Your Article is Ready!
                        </h3>
                        <p className="text-green-700 mb-4">
                          All AI agents have successfully completed their work. Your article has been researched, 
                          written, optimized for SEO, and enhanced with images.
                        </p>
                        <div className="flex justify-center gap-4 text-sm text-green-600">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Research Complete
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            SEO Optimized
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Images Added
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Ready to Publish
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {agentWork.length > 0 ? (
                    agentWork.map((work, index) => renderAgentWorkItem(work, index))
                  ) : !completedArticle && workflowStatus === 'running' ? (
                    <div className="text-center text-gray-500 py-12">
                      <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">Agents are getting ready...</h3>
                      <p className="text-sm">Your AI agents will start working shortly. You'll see their progress here in real-time.</p>
                    </div>
                  ) : agentWork.length === 0 && workflowStatus === 'awaiting_review' ? (
                    <div className="text-center text-gray-500 py-12">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                      <h3 className="font-medium mb-2">Loading completed workflow...</h3>
                      <p className="text-sm">Retrieving the agent work history for this completed workflow.</p>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EnhancedWorkflowProgress