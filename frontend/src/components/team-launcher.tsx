/**
 * Team Launcher Component
 * Provides interface for launching Lancers Teams with Autogen workflows
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Bot, 
  Users, 
  Loader2, 
  Rocket,
  CheckCircle,
  AlertCircle,
  Clock,
  Palette,
  Code2,
  ShoppingCart,
  Share2,
  PenSquare,
  Search,
  Briefcase,
  Music,
  ImageIcon,
  Film,
  Video,
  Eye,
  Shirt,
  User,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lingoAPI, type TaskStatus } from '@/lib/lingo-api';

// Team configurations matching backend
export const lancersTeams = [
  {
    domain: 'web_design',
    name: 'WEB DESIGN',
    icon: <Palette className="h-5 w-5" />,
    description: 'UI/UX design, wireframing, prototyping, responsive design.',
    agents: ['UI/UX Designer', 'Wireframe Artist', 'Prototyper', 'Responsive Design Expert'],
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    capabilities: ['UI/UX Design', 'Wireframing', 'Prototyping', 'Responsive Design']
  },
  {
    domain: 'web_development',
    name: 'WEB DEVELOPMENT',
    icon: <Code2 className="h-5 w-5" />,
    description: 'Frontend/backend development, API integration, deployment.',
    agents: ['Frontend Developer', 'Backend Developer', 'API Integrator', 'Deployment Specialist'],
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    capabilities: ['Frontend', 'Backend', 'APIs', 'Databases', 'Deployment']
  },
  {
    domain: 'ecommerce',
    name: 'ECOMMERCE',
    icon: <ShoppingCart className="h-5 w-5" />,
    description: 'Online store setup, product management, payment integration.',
    agents: ['Shopify Manager', 'Product Manager', 'Payment Gateway Integrator', 'Sales Funnel Optimizer'],
    color: 'bg-green-500/20 text-green-400 border-green-500/50',
    capabilities: ['Store Setup', 'Product Management', 'Payment Integration', 'Optimization']
  },
  {
    domain: 'social_media',
    name: 'SOCIAL MEDIA',
    icon: <Share2 className="h-5 w-5" />,
    description: 'Multi-platform content strategy, engagement, analytics.',
    agents: ['Content Strategist', 'Engagement Analyst', 'Platform Specialist (IG, TikTok, etc.)'],
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    capabilities: ['Content Strategy', 'Platform Management', 'Analytics', 'Engagement']
  },
  {
    domain: 'blog_writing',
    name: 'BLOG WRITING',
    icon: <PenSquare className="h-5 w-5" />,
    description: 'Long-form content, SEO optimization, storytelling.',
    agents: ['SEO Writer', 'Technical Writer', 'Storyteller', 'Content Planner'],
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    capabilities: ['Article Writing', 'SEO Optimization', 'Content Planning', 'Editing']
  },
  {
    domain: 'research',
    name: 'RESEARCH',
    icon: <Search className="h-5 w-5" />,
    description: 'Market analysis, data interpretation, trend forecasting.',
    agents: ['Market Analyst', 'Data Interpreter', 'Trend Forecaster', 'Competitive Analyst'],
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
    capabilities: ['Market Research', 'Data Analysis', 'Trend Analysis', 'Reporting']
  },
  {
    domain: 'finance_advisor',
    name: 'FINANCE ADVISOR',
    icon: <Briefcase className="h-5 w-5" />,
    description: 'Financial planning, investment strategy, risk assessment.',
    agents: ['Financial Planner', 'Investment Strategist', 'Risk Assessor', 'Tax Optimizer'],
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    capabilities: ['Financial Planning', 'Investment Strategy', 'Risk Assessment', 'Modeling']
  },
  {
    domain: 'marketing_agency',
    name: 'MARKETING AGENCY',
    icon: <Briefcase className="h-5 w-5" />,
    description: 'Campaign development, brand strategy, digital marketing.',
    agents: ['Campaign Developer', 'Brand Strategist', 'Digital Marketing Expert', 'Automation Specialist'],
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    capabilities: ['Campaign Development', 'Brand Strategy', 'Digital Marketing', 'ROI Tracking']
  },
  {
    domain: 'travel_planning',
    name: 'TRAVEL PLANNING',
    icon: <Briefcase className="h-5 w-5" />,
    description: 'Travel itineraries, accommodation recommendations, activity planning with real-time search capabilities.',
    agents: ['Travel Specialist', 'Research Assistant', 'Tavily Search Agent'],
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    capabilities: ['Itinerary Planning', 'Accommodation Booking', 'Activity Recommendations', 'Travel Tips', 'Real-time Search']
  }
];

interface TeamLauncherProps {
  onTeamLaunched?: (teamDomain: string, teamName: string) => void;
  compact?: boolean;
  onOpenTeamDashboard?: (teamName: string, taskId: string) => void;
}

interface LaunchingTeam {
  domain: string;
  name: string;
  status: 'launching' | 'success' | 'error';
  taskId?: string;
  message?: string;
}

interface LaunchedTeam {
  domain: string;
  name: string;
  taskId: string;
  launchedAt: Date;
}

export default function TeamLauncher({ onTeamLaunched, compact = false, onOpenTeamDashboard }: TeamLauncherProps) {
  const [launchingTeams, setLaunchingTeams] = useState<Record<string, LaunchingTeam>>({});
  const [launchedTeams, setLaunchedTeams] = useState<LaunchedTeam[]>([]);
  const [teamInputs, setTeamInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const launchTeam = useCallback(async (team: typeof lancersTeams[0]) => {
    const launchId = team.domain;
    
    // Get the user input for this team - MUST have user input before launching
    const userInput = teamInputs[team.domain];
    
    // Validate that user has provided input
    if (!userInput || userInput.trim().length === 0) {
      toast({
        title: '📝 Please provide your request',
        description: `Please describe what you'd like the ${team.name} team to help you with.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Set launching state
    setLaunchingTeams(prev => ({
      ...prev,
      [launchId]: {
        domain: team.domain,
        name: team.name,
        status: 'launching'
      }
    }));

    try {
      // Use the launchTeam method from lingoAPI which handles the team prefix properly
      const result = await lingoAPI.launchTeam(team.domain, userInput, 'high');
      
      if (result.success) {
        // Set success state
        setLaunchingTeams(prev => ({
          ...prev,
          [launchId]: {
            domain: team.domain,
            name: team.name,
            status: 'success',
            taskId: result.data?.task_id || '',
            message: 'Team launched successfully!'
          }
        }));

        // Add to launched teams
        if (result.data?.task_id) {
          setLaunchedTeams(prev => [
            ...prev,
            {
              domain: team.domain,
              name: team.name,
              taskId: result.data!.task_id,
              launchedAt: new Date()
            }
          ]);
        }

        toast({
          title: `🚀 ${team.name} Team Launched`,
          description: `All ${team.agents.length} specialists are now active and working on your request.`,
        });

        onTeamLaunched?.(team.domain, team.name);

        // Clear success state after 3 seconds
        setTimeout(() => {
          setLaunchingTeams(prev => {
            const updated = { ...prev };
            delete updated[launchId];
            return updated;
          });
        }, 3000);

        // Open team dashboard automatically
        if (result.data?.task_id) {
          onOpenTeamDashboard?.(team.name, result.data.task_id);
        }

      } else {
        throw new Error(result.error || 'Failed to launch team');
      }
    } catch (error: any) {
      console.error('Team launch error:', error);
      
      // Set error state
      setLaunchingTeams(prev => ({
        ...prev,
        [launchId]: {
          domain: team.domain,
          name: team.name,
          status: 'error',
          message: error.message || 'Failed to launch team'
        }
      }));

      toast({
        title: '❌ Team Launch Failed',
        description: `Failed to launch ${team.name} team: ${error.message}`,
        variant: 'destructive',
      });

      // Clear error state after 5 seconds
      setTimeout(() => {
        setLaunchingTeams(prev => {
          const updated = { ...prev };
          delete updated[launchId];
          return updated;
        });
      }, 5000);
    }
  }, [teamInputs, toast, onTeamLaunched, onOpenTeamDashboard]);

  const handleInputChange = (teamDomain: string, value: string) => {
    setTeamInputs(prev => ({
      ...prev,
      [teamDomain]: value
    }));
  };

  const getButtonContent = (team: typeof lancersTeams[0]) => {
    const launchState = launchingTeams[team.domain];
    
    if (!launchState) {
      return (
        <>
          <Rocket className="h-4 w-4" />
          Launch Team
        </>
      );
    }

    switch (launchState.status) {
      case 'launching':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Launching...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-4 w-4" />
            Launched!
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="h-4 w-4" />
            Retry
          </>
        );
      default:
        return (
          <>
            <Rocket className="h-4 w-4" />
            Launch Team
          </>
        );
    }
  };

  const getButtonVariant = (team: typeof lancersTeams[0]) => {
    const launchState = launchingTeams[team.domain];
    
    if (!launchState) return 'default';
    
    switch (launchState.status) {
      case 'launching':
        return 'outline';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Update this method to open the team dashboard
  const openTeamDashboard = (team: LaunchedTeam) => {
    onOpenTeamDashboard?.(team.name, team.taskId);
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {lancersTeams.slice(0, 4).map((team) => (
          <Button
            key={team.domain}
            variant={getButtonVariant(team)}
            size="sm"
            onClick={() => {
              // For compact view, we'll use a default prompt if no input is provided
              if (!teamInputs[team.domain]) {
                handleInputChange(team.domain, `Please help me with ${team.description.toLowerCase()}`);
              }
              launchTeam(team);
            }}
            disabled={launchingTeams[team.domain]?.status === 'launching'}
            className={`flex flex-col gap-1 h-auto py-2 ${team.color}`}
          >
            {team.icon}
            <span className="text-xs font-medium">{team.name}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Lancers Teams</h3>
        <p className="text-sm text-muted-foreground">
          Launch specialized teams powered by Microsoft Autogen workflows
        </p>
      </div>

      <div className="grid gap-4">
        {lancersTeams.map((team) => {
          const launchState = launchingTeams[team.domain];
          
          return (
            <Card key={team.domain} className="bg-card/50 hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${team.color}`}>
                      {team.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{team.name}</CardTitle>
                      <CardDescription className="text-xs">{team.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {team.agents.length} Agents
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {team.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Team Members:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {team.agents.map((agent) => (
                      <div key={agent} className="flex items-center gap-1 text-xs">
                        <Bot className="h-3 w-3 text-primary" />
                        <span>{agent}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User input field for team-specific requests */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    What would you like this team to help you with?
                  </label>
                  <Textarea
                    placeholder={`e.g., I need help with ${team.description.toLowerCase()}...`}
                    value={teamInputs[team.domain] || ''}
                    onChange={(e) => handleInputChange(team.domain, e.target.value)}
                    className="text-xs"
                    rows={3}
                  />
                </div>

                {launchState?.message && (
                  <div className={`text-xs p-2 rounded ${
                    launchState.status === 'success' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {launchState.message}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant={getButtonVariant(team)}
                    size="sm"
                    onClick={() => launchTeam(team)}
                    disabled={launchState?.status === 'launching'}
                    className="flex-1"
                  >
                    {getButtonContent(team)}
                  </Button>
                  
                  {/* Show Open Dashboard button for launched teams */}
                  {launchedTeams.some(t => t.domain === team.domain) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTeamDashboard(launchedTeams.find(t => t.domain === team.domain)!)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Show launched teams section */}
      {launchedTeams.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Active Teams</CardTitle>
            <CardDescription className="text-xs">
              Teams currently working on tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {launchedTeams.map((team) => (
              <div 
                key={team.taskId} 
                className="flex items-center justify-between p-2 bg-card rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{team.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Launched {team.launchedAt.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openTeamDashboard(team)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold">Custom Team Builder</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Create your own specialized team with custom agents and workflows
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Bot className="h-4 w-4 mr-2" />
            Build Custom Team
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Team Launcher for integration into other components
export function QuickTeamLauncher({ onTeamSelect }: { onTeamSelect?: (team: any) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {lancersTeams.slice(0, 6).map((team) => (
        <Button
          key={team.domain}
          variant="outline"
          size="sm"
          onClick={() => onTeamSelect?.(team)}
          className={`flex flex-col gap-1 h-16 ${team.color}`}
        >
          {team.icon}
          <span className="text-xs font-medium">{team.name.split(' ')[0]}</span>
        </Button>
      ))}
    </div>
  );
}

// Team Status Display
export function TeamStatusDisplay({ taskId }: { taskId: string }) {
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const result = await lingoAPI.getTaskStatus(taskId);
        if (result.success && result.data) {
          setStatus(result.data);
          
          // Stop polling if task is complete
          if (result.data.status === 'completed' || result.data.status === 'failed') {
            setLoading(false);
            if (interval) clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
        setLoading(false);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [taskId]);

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading status...
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'routing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-card/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize">{status.status}</span>
          {status.assigned_team && (
            <Badge variant="outline" className="text-xs">
              {status.assigned_team.replace('_', ' ')}
            </Badge>
          )}
        </div>
        
        {status.result && (
          <div className="text-sm text-muted-foreground">
            <strong>Result:</strong> {status.result.summary}
          </div>
        )}
        
        {status.error && (
          <div className="text-sm text-red-500">
            <strong>Error:</strong> {status.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}