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
  MapPin,
  Hotel,
  Plane,
  DollarSign,
  Calendar,
  Wifi,
  WifiOff,
  ArrowLeft,
  List,
  FileText
} from 'lucide-react'

type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

interface TravelProgress {
  agent_name: string
  status: AgentStatus
  message: string
  progress: number
  timestamp: string
}

interface TravelWorkflowProgressProps {
  workflowId: string
  onBack?: () => void
  onComplete?: (travelPlan: any) => void
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
    description: 'Researching destination, attractions, and local information',
    color: 'blue'
  },
  itinerary: {
    name: 'itinerary',
    displayName: 'Itinerary Agent',
    icon: Calendar,
    description: 'Creating day-by-day travel schedule',
    color: 'purple'
  },
  accommodation: {
    name: 'accommodation',
    displayName: 'Accommodation Agent',
    icon: Hotel,
    description: 'Finding best hotels and lodging options',
    color: 'green'
  },
  flights: {
    name: 'flights',
    displayName: 'Flight Agent',
    icon: Plane,
    description: 'Searching for optimal flight options',
    color: 'orange'
  },
  budget: {
    name: 'budget',
    displayName: 'Budget Agent',
    icon: DollarSign,
    description: 'Calculating costs and creating budget breakdown',
    color: 'indigo'
  }
}

interface LogEntry {
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  agent?: string
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  details?: string;
}

export function TravelWorkflowProgress({ workflowId, onBack, onComplete }: TravelWorkflowProgressProps) {
  const [progress, setProgress] = useState<TravelProgress[]>([])
  const [connected, setConnected] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<string>('running')
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'initial_planning',
      title: 'Initial Planning',
      description: 'Creating travel plan with destinations and duration',
      status: 'pending'
    },
    {
      id: 'destination_research',
      title: 'Destination Research',
      description: 'Researching attractions and local information',
      status: 'pending'
    },
    {
      id: 'real_time_search',
      title: 'Real-time Search',
      description: 'Searching for flights and accommodations',
      status: 'pending'
    },
    {
      id: 'final_compilation',
      title: 'Final Compilation',
      description: 'Assembling complete travel itinerary',
      status: 'pending'
    }
  ])
  const [activeTab, setActiveTab] = useState<'agents' | 'steps' | 'logs'>('steps')

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
    const colors = {
      pending: 'bg-gray-100 text-gray-600',
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      skipped: 'bg-gray-100 text-gray-600'
    }

    return (
      <Badge className={colors[status]} variant="secondary">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const updateWorkflowStep = (stepId: string, status: 'pending' | 'in-progress' | 'completed', details?: string) => {
    setWorkflowSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status, details } : step
    ))
  }

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8001';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    // Connect to travel workflow WebSocket (using tasks endpoint)
    const websocket = new WebSocket(`${wsUrl}/api/tasks/${workflowId}`)

    websocket.onopen = () => {
      console.log('✅ Connected to travel workflow')
      setConnected(true)
      addLog('success', 'Connected to travel planning workflow')
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('📨 Travel workflow update:', data)

      if (data.type === 'progress') {
        setProgress(prev => {
          const existing = prev.find(p => p.agent_name === data.agent_name)
          if (existing) {
            return prev.map(p =>
              p.agent_name === data.agent_name ? { ...p, ...data } : p
            )
          }
          return [...prev, data]
        })

        if (data.status === 'running') {
          setCurrentAgent(data.agent_name)
          addLog('info', data.message, data.agent_name)
        } else if (data.status === 'completed') {
          addLog('success', `${agentInfo[data.agent_name]?.displayName || data.agent_name} completed`, data.agent_name)
        } else if (data.status === 'failed') {
          addLog('error', data.message, data.agent_name)
        }
      } else if (data.type === 'task_update') {
        // Handle progressive task updates
        if (data.result?.results) {
          Object.keys(data.result.results).forEach(stepId => {
            const stepData = data.result.results[stepId];
            if (stepData.status === 'completed') {
              updateWorkflowStep(stepId, 'completed', JSON.stringify(stepData.plan || stepData.research_data || stepData.search_results || 'Completed'));
            }
          });
        }
      } else if (data.type === 'complete') {
        setWorkflowStatus('completed')
        addLog('success', 'Travel plan completed successfully!')
        console.log('✅ Workflow complete, calling onComplete with:', data.result)
        if (onComplete) {
          // Pass the full result which contains travel_plan, research_data, search_results, etc.
          onComplete(data.result || data)
        }
      } else if (data.type === 'error') {
        setWorkflowStatus('failed')
        addLog('error', data.message)
      }
    }

    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      setConnected(false)
      addLog('error', 'Connection error occurred')
    }

    websocket.onclose = () => {
      console.log('🔌 Disconnected from travel workflow')
      setConnected(false)
      addLog('warning', 'Disconnected from workflow')
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [workflowId, onComplete])

  useEffect(() => {
    const completedAgents = progress.filter(p => p.status === 'completed').length
    const totalAgents = Object.keys(agentInfo).length
    const newProgress = (completedAgents / totalAgents) * 100
    setOverallProgress(newProgress)
  }, [progress])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="p-6 border-b bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold">Travel Planning in Progress</h2>
              <p className="text-sm text-muted-foreground">
                Our AI agents are creating your perfect travel plan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <Badge className="bg-green-100 text-green-700">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Agents Progress and Workflow Steps Tabs */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === 'agents' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('agents')}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  AI Agents
                </Button>
                <Button
                  variant={activeTab === 'steps' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('steps')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  Workflow Steps
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {activeTab === 'agents' ? (
                  <div className="space-y-4">
                    {Object.values(agentInfo).map((agent) => {
                      const status = getAgentStatus(agent.name)
                      const message = getAgentMessage(agent.name)
                      const Icon = agent.icon

                      return (
                        <Card
                          key={agent.name}
                          className={`transition-all ${status === 'running'
                              ? 'ring-2 ring-blue-500 shadow-lg'
                              : ''
                            }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-${agent.color}-100 dark:bg-${agent.color}-900/20`}>
                                <Icon className={`h-5 w-5 text-${agent.color}-600 dark:text-${agent.color}-400`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold">{agent.displayName}</h4>
                                  {getStatusIcon(status)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {message || agent.description}
                                </p>
                                {getStatusBadge(status)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflowSteps.map((step) => (
                      <Card
                        key={step.id}
                        className={`transition-all ${step.status === 'in-progress'
                            ? 'ring-2 ring-blue-500 shadow-lg'
                            : step.status === 'completed'
                              ? 'ring-1 ring-green-500'
                              : ''
                          }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${step.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                                step.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                  'bg-gray-100 dark:bg-gray-700'
                              }`}>
                              {step.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : step.status === 'in-progress' ? (
                                <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">{step.title}</h4>
                                <Badge
                                  variant="secondary"
                                  className={
                                    step.status === 'completed' ? 'bg-green-100 text-green-700' :
                                      step.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                  }
                                >
                                  {step.status === 'in-progress' ? 'In Progress' : step.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {step.description}
                              </p>
                              {step.details && (
                                <div className="text-xs bg-muted p-2 rounded mt-2">
                                  <FileText className="h-3 w-3 inline mr-1" />
                                  {step.details}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Real-time updates from the workflow</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${log.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                          log.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                            log.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                              'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs opacity-70 mt-0.5">{log.timestamp}</span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}