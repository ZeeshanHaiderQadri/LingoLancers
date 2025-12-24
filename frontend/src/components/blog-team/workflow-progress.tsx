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
  ArrowLeft
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
}

const agentInfo: Record<string, AgentInfo> = {
  research: {
    name: 'research',
    displayName: 'Research Agent',
    icon: Search,
    description: 'Analyzing topic and gathering information from multiple sources',
    color: 'blue'
  },
  seo: {
    name: 'seo',
    displayName: 'SEO Agent',
    icon: Target,
    description: 'Identifying keywords and optimizing for search engines',
    color: 'green'
  },
  writer: {
    name: 'writer',
    displayName: 'Writer Agent',
    icon: PenTool,
    description: 'Creating engaging, well-structured content',
    color: 'purple'
  },
  feature_image: {
    name: 'feature_image',
    displayName: 'Feature Image Agent',
    icon: Image,
    description: 'Generating AI-powered feature image',
    color: 'orange'
  },
  image_finder: {
    name: 'image_finder',
    displayName: 'Image Finder Agent',
    icon: Images,
    description: 'Finding relevant supporting images',
    color: 'pink'
  },
  compiler: {
    name: 'compiler',
    displayName: 'Compiler Agent',
    icon: FileText,
    description: 'Assembling final article with quality checks',
    color: 'indigo'
  }
}

interface LogEntry {
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  agent?: string
}

export function WorkflowProgress({ workflowId, onBack, onComplete }: WorkflowProgressProps) {
  const [progress, setProgress] = useState<WorkflowProgressType[]>([])
  const [connected, setConnected] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<string>('running')

  const addLog = (type: LogEntry['type'], message: string, agent?: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      agent
    }
    setLogs(prev => [...prev, newLog])
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
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: AgentStatus) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'default',
      failed: 'destructive',
      skipped: 'secondary'
    } as const

    const colors = {
      pending: 'bg-gray-100 text-gray-600',
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      skipped: 'bg-gray-100 text-gray-600'
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

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
        setCurrentAgent(data.agent_name)
        setProgress(prev => {
          const existing = prev.find(p => p.agent_name === data.agent_name)
          if (existing) {
            return prev.map(p => 
              p.agent_name === data.agent_name 
                ? { ...p, status: 'running', message: data.message }
                : p
            )
          }
          return [...prev, {
            agent_name: data.agent_name,
            status: 'running',
            progress_percentage: 0,
            message: data.message
          }]
        })
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
        addLog('info', `${agentInfo[data.agent_name]?.displayName || data.agent_name}: ${data.message}`, data.agent_name)
        break

      case 'agent_completed':
        setProgress(prev => 
          prev.map(p => 
            p.agent_name === data.agent_name 
              ? { ...p, status: 'completed', message: data.message, result: data.result }
              : p
          )
        )
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
        setWorkflowStatus(data.status)
        setOverallProgress(100)
        addLog('success', data.message)
        if (onComplete && data.article) {
          onComplete(data.article)
        }
        break

      case 'workflow_error':
        setWorkflowStatus('failed')
        addLog('error', `Workflow error: ${data.error}`)
        break
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
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
                </CardTitle>
                <CardDescription>Workflow ID: {workflowId}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Agents Progress</CardTitle>
            <CardDescription>Track each agent's execution status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(agentInfo).map((agent) => {
                const status = getAgentStatus(agent.name)
                const message = getAgentMessage(agent.name)
                const Icon = agent.icon
                const isActive = currentAgent === agent.name

                return (
                  <div 
                    key={agent.name} 
                    className={`p-4 rounded-lg border transition-all ${
                      isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        status === 'completed' ? 'bg-green-100' :
                        status === 'running' ? 'bg-blue-100' :
                        status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          status === 'completed' ? 'text-green-600' :
                          status === 'running' ? 'text-blue-600' :
                          status === 'failed' ? 'text-red-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{agent.displayName}</h4>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                            {getStatusIcon(status)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{agent.description}</p>
                        {message && (
                          <p className="text-xs text-gray-800 bg-gray-50 p-2 rounded">
                            {message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>Real-time workflow events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {logs.map((log, index) => {
                  const bgColor = {
                    info: 'bg-blue-50 border-blue-200',
                    success: 'bg-green-50 border-green-200',
                    error: 'bg-red-50 border-red-200',
                    warning: 'bg-yellow-50 border-yellow-200'
                  }[log.type]

                  const textColor = {
                    info: 'text-blue-800',
                    success: 'text-green-800',
                    error: 'text-red-800',
                    warning: 'text-yellow-800'
                  }[log.type]

                  return (
                    <div key={index} className={`p-3 rounded-lg border ${bgColor}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm ${textColor}`}>{log.message}</p>
                          {log.agent && (
                            <p className="text-xs text-gray-500 mt-1">
                              Agent: {agentInfo[log.agent]?.displayName || log.agent}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {logs.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Waiting for workflow events...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WorkflowProgress
