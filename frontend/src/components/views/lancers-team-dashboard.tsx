"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  User, 
  CheckCircle, 
  XCircle, 
  Loader, 
  File, 
  Code, 
  ChevronDown, 
  ChevronRight, 
  Send,
  Clock,
  AlertCircle,
  MapPin,
  Search,
  Plane,
  Hotel,
  Globe,
  Calendar,
  Users,
  Star,
  Wifi,
  Car,
  Utensils,
  Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { lingoAPI, type TaskStatus, type TeamTask, type TeamMessage } from '@/lib/lingo-api';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'agent';
  sender?: string;
  timestamp: Date;
}

const TaskItem = ({ task }: { task: TeamTask }) => {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-primary animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-muted-foreground" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Special handling for travel planning tasks
  const isTravelTask = task.content.toLowerCase().includes('travel') || 
                      task.content.toLowerCase().includes('trip') || 
                      task.content.toLowerCase().includes('itinerary');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-3 bg-card rounded-lg border"
    >
      <div className="flex items-center gap-3">
        {isTravelTask ? <MapPin className="w-5 h-5 text-primary" /> : 
         task.content.startsWith('view') ? <File className="w-5 h-5 text-muted-foreground" /> : 
         <Code className="w-5 h-5 text-muted-foreground" />}
        <span className="font-mono text-sm">{task.content}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground capitalize">{task.status}</span>
        {getStatusIcon()}
      </div>
    </motion.div>
  );
};

const ChatMessage = ({ message }: { message: Message }) => {
  // Special handling for travel-related messages
  const isTravelMessage = message.content.toLowerCase().includes('travel') || 
                         message.content.toLowerCase().includes('trip') || 
                         message.content.toLowerCase().includes('itinerary') ||
                         message.content.toLowerCase().includes('destination');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
        {message.type === 'agent' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {isTravelMessage ? <MapPin className="w-5 h-5 text-primary" /> : <Bot className="w-5 h-5 text-primary" />}
          </div>
        )}
        <div className={`max-w-xs rounded-lg p-3 text-sm ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
          {message.content}
        </div>
        {message.type === 'user' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
      {message.sender && message.type === 'agent' && (
        <div className="text-xs text-muted-foreground mt-1 ml-11">
          {message.sender}
        </div>
      )}
    </motion.div>
  );
};

// Enhanced component to display travel plan details
const TravelPlanDisplay = ({ planData }: { planData: any }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    plan: true,
    research: true,
    currentInfo: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Parse accommodation info
  const parseAccommodationInfo = (info: string) => {
    if (!info) return [];
    const lines = info.split('\n');
    const hotels = [];
    let currentHotel: any = null;
    
    for (const line of lines) {
      if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || 
          line.startsWith('4.') || line.startsWith('5.')) {
        if (currentHotel) hotels.push(currentHotel);
        const parts = line.split(' - ');
        currentHotel = {
          name: parts[0].substring(3).trim(),
          price: parts[1],
          rating: parts[2],
          amenities: parts.slice(3).join(', ')
        };
      } else if (currentHotel && line.trim() !== '') {
        currentHotel.amenities += ', ' + line.trim();
      }
    }
    
    if (currentHotel) hotels.push(currentHotel);
    return hotels;
  };

  // Parse flight info
  const parseFlightInfo = (info: string) => {
    if (!info) return [];
    const lines = info.split('\n');
    const flights = [];
    let currentFlight: any = null;
    
    for (const line of lines) {
      if (line.startsWith('Option 1:') || line.startsWith('Option 2:') || line.startsWith('Option 3:')) {
        if (currentFlight) flights.push(currentFlight);
        currentFlight = {
          title: line,
          details: []
        };
      } else if (currentFlight && line.trim() !== '') {
        currentFlight.details.push(line);
      }
    }
    
    if (currentFlight) flights.push(currentFlight);
    return flights;
  };

  const accommodationHotels = parseAccommodationInfo(planData?.research?.accommodation_info);
  const flightOptions = parseFlightInfo(planData?.research?.transportation_info);

  return (
    <div className="space-y-4">
      {/* Travel Plan Section */}
      <Card>
        <CardContent className="p-4">
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('plan')}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Travel Plan
            </h3>
            {expandedSections.plan ? 
              <ChevronDown className="w-5 h-5" /> : 
              <ChevronRight className="w-5 h-5" />
            }
          </button>
          
          <AnimatePresence>
            {expandedSections.plan && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2"
              >
                <div className="space-y-2 text-sm">
                  <p><strong>Destinations:</strong> {planData?.plan?.destinations || 'Not specified'}</p>
                  <p><strong>Itinerary:</strong> {planData?.plan?.itinerary || 'Custom itinerary will be created'}</p>
                  <p><strong>Travel Tips:</strong> {planData?.plan?.travel_tips || 'Travel tips will be provided'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Research Section */}
      <Card>
        <CardContent className="p-4">
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('research')}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Research Insights
            </h3>
            {expandedSections.research ? 
              <ChevronDown className="w-5 h-5" /> : 
              <ChevronRight className="w-5 h-5" />
            }
          </button>
          
          <AnimatePresence>
            {expandedSections.research && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2 space-y-4"
              >
                {/* Accommodation Info */}
                {accommodationHotels.length > 0 ? (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Hotel className="w-4 h-4" />
                      Accommodation Options
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {accommodationHotels.map((hotel, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{hotel.name}</h5>
                              <p className="text-sm text-muted-foreground">{hotel.price}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{hotel.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs mt-2 text-muted-foreground">{hotel.amenities}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Hotel className="w-4 h-4" />
                      Accommodation Information
                    </h4>
                    <p className="text-sm">{planData?.research?.accommodation_info || 'No accommodation information available'}</p>
                  </div>
                )}

                {/* Transportation Info */}
                {flightOptions.length > 0 ? (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Plane className="w-4 h-4" />
                      Flight Options
                    </h4>
                    <div className="space-y-3">
                      {flightOptions.map((flight, index) => (
                        <Card key={index} className="p-3">
                          <h5 className="font-medium">{flight.title}</h5>
                          <div className="text-sm mt-1 space-y-1">
                            {flight.details.map((detail: string, idx: number) => (
                              <p key={idx} className="text-muted-foreground">{detail}</p>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Plane className="w-4 h-4" />
                      Transportation Information
                    </h4>
                    <p className="text-sm">{planData?.research?.transportation_info || 'No transportation information available'}</p>
                  </div>
                )}

                {/* Local Insights */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Landmark className="w-4 h-4" />
                    Local Insights
                  </h4>
                  <p className="text-sm">{planData?.research?.local_insights || 'No local insights available'}</p>
                </div>

                {/* Cultural Information */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    Cultural Information
                  </h4>
                  <p className="text-sm">{planData?.research?.cultural_information || 'No cultural information available'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Current Information Section */}
      <Card>
        <CardContent className="p-4">
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('currentInfo')}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Current Information
            </h3>
            {expandedSections.currentInfo ? 
              <ChevronDown className="w-5 h-5" /> : 
              <ChevronRight className="w-5 h-5" />
            }
          </button>
          
          <AnimatePresence>
            {expandedSections.currentInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2 space-y-3"
              >
                {planData?.current_info?.current_info && Array.isArray(planData.current_info.current_info) ? (
                  planData.current_info.current_info.map((item: any, index: number) => (
                    <Card key={index} className="p-3">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-2 inline-block"
                      >
                        Read more
                      </a>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm">
                    {planData?.current_info ? 
                      JSON.stringify(planData.current_info) : 
                      'No current information available'}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default function LancersTeamDashboard({ 
  teamName, 
  taskId,
  onBack 
}: { 
  teamName: string;
  taskId: string;
  onBack: () => void;
}) {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useTaskMessages, setUseTaskMessages] = useState(true);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(0);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [agentProgress, setAgentProgress] = useState<Record<string, any>>({});
  const [travelPlanData, setTravelPlanData] = useState<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const taskContainerRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);
  const lastTaskStatusRef = useRef<TaskStatus | null>(null);
  const lastTasksRef = useRef<TeamTask[]>([]);
  const processedTaskResults = useRef<Set<string>>(new Set());

  // Initialize with proper team ID based on team name
  useEffect(() => {
    const teamIdMap: Record<string, string> = {
      'TRAVEL PLANNING': 'travel_planning',
      'WEB DESIGN': 'web_design',
      'WEB DEVELOPMENT': 'web_development',
      'ECOMMERCE': 'ecommerce',
      'SOCIAL MEDIA': 'social_media',
      'BLOG WRITING': 'blog_writing',
      'RESEARCH': 'research',
      'FINANCE ADVISOR': 'finance_advisor',
      'MARKETING AGENCY': 'marketing_agency'
    };
    
    const normalizedTeamName = teamName.toUpperCase();
    setTeamId(teamIdMap[normalizedTeamName] || `team_${taskId.split('-')[1] || 'default'}`);
  }, [teamName, taskId]);

  // Poll for task status updates
  useEffect(() => {
    if (taskId && !useTaskMessages) {
      setUseTaskMessages(true);
    }
    
    const fetchTaskStatus = async () => {
      try {
        const result = await lingoAPI.getTaskStatus(taskId);
        if (result.success && result.data) {
          // Only update state if the data has actually changed
          if (JSON.stringify(result.data) !== JSON.stringify(lastTaskStatusRef.current)) {
            lastTaskStatusRef.current = result.data;
            setTaskStatus(result.data);
            setIsLoading(false);
            
            // Add user request message only once
            if (result.data.original_request && messages.length === 0) {
              const uniqueId = `msg-task-${taskId}`;
              setMessages(prev => {
                const messageExists = prev.some(msg => msg.id === uniqueId);
                if (messageExists) return prev;
                
                return [
                  ...prev,
                  {
                    id: uniqueId,
                    content: result.data!.original_request,
                    type: 'user',
                    timestamp: new Date(result.data!.created_at)
                  }
                ];
              });
            }
            
            // Handle task completion
            if (result.data.status === 'completed' || result.data.status === 'failed') {
              if (pollingInterval) clearInterval(pollingInterval);
              setPollingInterval(null);
              
              // Handle final result only once
              if (result.data.status === 'completed' && result.data.result && !processedTaskResults.current.has(taskId)) {
                processedTaskResults.current.add(taskId);
                handleTaskResult(result.data.result);
              }
              
              return;
            }
            
            // Handle progress updates for processing tasks
            if (result.data.status === 'processing' && result.data.result) {
              handleProgressUpdate(result.data.result);
            }
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Status check error:', error);
        setIsLoading(false);
        const errorMessageId = `error-${taskId}-${Date.now()}`;
        setMessages(prev => {
          const errorExists = prev.some(msg => msg.id === errorMessageId);
          if (errorExists) return prev;
          
          return [
            ...prev,
            {
              id: errorMessageId,
              content: `Error checking task status: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
              type: 'agent',
              sender: 'System',
              timestamp: new Date()
            }
          ];
        });
      }
    };

    if (taskId) {
      fetchTaskStatus();
      if (!pollingInterval) {
        const newInterval = setInterval(fetchTaskStatus, 3000);
        setPollingInterval(newInterval);
      }
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [taskId, messages.length, lastProgressUpdate, pollingInterval, useTaskMessages, taskId]);

  // Handle task result
  const handleTaskResult = (result: any) => {
    try {
      console.log('Handling task result:', result);
      
      // The result structure from the backend is:
      // {
      //   status: "completed",
      //   data: string (JSON string),
      //   full_result: object (actual result),
      //   timestamp: string
      // }
      
      let parsedResult = null;
      
      // First try to use full_result if it exists and is an object
      if (result.full_result && typeof result.full_result === 'object') {
        parsedResult = result.full_result;
      } 
      // If full_result is a string, try to parse it
      else if (result.full_result && typeof result.full_result === 'string') {
        try {
          parsedResult = JSON.parse(result.full_result);
        } catch (e) {
          console.warn('Could not parse full_result as JSON:', result.full_result);
        }
      }
      // If no full_result, try to parse data
      else if (result.data) {
        if (typeof result.data === 'string') {
          try {
            parsedResult = JSON.parse(result.data);
          } catch (e) {
            console.warn('Could not parse data as JSON:', result.data);
            parsedResult = result.data;
          }
        } else {
          parsedResult = result.data;
        }
      }
      
      console.log('Parsed result:', parsedResult);
      
      // Handle travel planning team results specifically
      if (teamId === 'travel_planning' && parsedResult && parsedResult.success) {
        const travelResult = parsedResult.result || parsedResult;
        setTravelPlanData(travelResult);
        formatTravelResult(travelResult);
      } else if (teamId === 'travel_planning' && parsedResult && parsedResult.research) {
        // Handle case where parsedResult is already the travel result object
        setTravelPlanData(parsedResult);
        formatTravelResult(parsedResult);
      } else {
        // Generic result handling
        const resultContent = formatGenericResult(parsedResult);
        addAgentMessage(resultContent, 'Task Result');
      }
    } catch (error) {
      console.error('Error handling task result:', error);
      addAgentMessage('Task completed successfully!', 'Task Result');
    }
  };

  // Format travel planning results with enhanced formatting for SERP API results
  const formatTravelResult = (travelResult: any) => {
    console.log('Formatting travel result:', travelResult);
    
    let formattedResult = `🌍 ${travelResult.team || 'Travel Planning Team'}\n\n`;
    
    if (travelResult.request) {
      formattedResult += `📋 Request: ${travelResult.request}\n\n`;
    }
    
    // Add plan information
    if (travelResult.plan && typeof travelResult.plan === 'object') {
      formattedResult += `✈️ Travel Plan:\n`;
      if (travelResult.plan.destinations) {
        formattedResult += `  • Destinations: ${travelResult.plan.destinations}\n`;
      }
      if (travelResult.plan.itinerary) {
        formattedResult += `  • Itinerary: ${travelResult.plan.itinerary}\n`;
      }
      if (travelResult.plan.travel_tips) {
        formattedResult += `  • Travel Tips: ${travelResult.plan.travel_tips}\n`;
      }
      formattedResult += `\n`;
    }
    
    // Add research information with enhanced formatting for SERP API results
    if (travelResult.research && typeof travelResult.research === 'object') {
      formattedResult += `📚 Research Insights:\n`;
      Object.entries(travelResult.research).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() !== '') {
          const formattedKey = key.replace(/_/g, ' ');
          formattedResult += `\n--- ${formattedKey.toUpperCase()} ---\n${value}\n`;
        }
      });
      formattedResult += `\n`;
    } else if (travelResult.accommodation_info || travelResult.transportation_info) {
      // Handle case where research info is at the top level
      formattedResult += `📚 Research Insights:\n`;
      if (travelResult.accommodation_info) {
        formattedResult += `\n--- ACCOMMODATION INFO ---\n${travelResult.accommodation_info}\n`;
      }
      if (travelResult.transportation_info) {
        formattedResult += `\n--- TRANSPORTATION INFO ---\n${travelResult.transportation_info}\n`;
      }
      if (travelResult.local_insights) {
        formattedResult += `\n--- LOCAL INSIGHTS ---\n${travelResult.local_insights}\n`;
      }
      if (travelResult.cultural_information) {
        formattedResult += `\n--- CULTURAL INFORMATION ---\n${travelResult.cultural_information}\n`;
      }
      formattedResult += `\n`;
    }
    
    // Add current information from Tavily search
    if (travelResult.current_info && typeof travelResult.current_info === 'object') {
      formattedResult += `🌐 Current Information (Real-time):\n`;
      if (Array.isArray(travelResult.current_info.current_info)) {
        travelResult.current_info.current_info.slice(0, 3).forEach((info: any, index: number) => {
          if (info && typeof info === 'object') {
            formattedResult += `  ${index + 1}. ${info.title || 'No title'}\n`;
            if (info.url) {
              formattedResult += `     URL: ${info.url}\n`;
            }
            if (info.content) {
              const content = info.content.length > 200 ? 
                info.content.substring(0, 200) + '...' : info.content;
              formattedResult += `     Preview: ${content}\n`;
            }
            formattedResult += `\n`;
          }
        });
      } else if (typeof travelResult.current_info.current_info === 'string') {
        formattedResult += `  ${travelResult.current_info.current_info}\n\n`;
      }
    }
    
    addAgentMessage(formattedResult.trim(), 'Travel Planning Team');
  };

  // Format generic results
  const formatGenericResult = (result: any): string => {
    if (typeof result === 'string') {
      return result;
    }
    
    if (typeof result === 'object' && result !== null) {
      if (result.message) return result.message;
      if (result.response) return result.response;
      if (result.content) return result.content;
      if (result.text) return result.text;
      
      // Try to stringify the object
      try {
        return JSON.stringify(result, null, 2);
      } catch (e) {
        return 'Task completed successfully!';
      }
    }
    
    return 'Task completed successfully!';
  };

  // Handle progress updates
  const handleProgressUpdate = (progress: any) => {
    try {
      console.log('Handling progress update:', progress);
      
      let parsedProgress = progress.data;
      
      // Try to parse JSON if it's a string
      if (typeof parsedProgress === 'string') {
        try {
          parsedProgress = JSON.parse(parsedProgress);
        } catch (e) {
          // If parsing fails, use as is
          console.warn('Could not parse progress data as JSON:', parsedProgress);
        }
      }
      
      // Rate limiting: only allow progress updates every 2 seconds
      const now = Date.now();
      if (now - lastProgressUpdate < 2000) {
        return;
      }
      setLastProgressUpdate(now);
      
      // Handle travel planning progress specifically
      if (teamId === 'travel_planning' && parsedProgress && typeof parsedProgress === 'object') {
        handleTravelProgress(parsedProgress);
      } else {
        // Generic progress handling
        const progressContent = formatGenericResult(parsedProgress);
        if (progressContent && progressContent.trim() !== '') {
          // Check if the last message is identical to avoid duplicates
          const lastMessage = messages[messages.length - 1];
          if (!lastMessage || lastMessage.type !== 'agent' || lastMessage.content !== progressContent) {
            addAgentMessage(progressContent, 'Progress Update');
          }
        }
      }
    } catch (error) {
      console.error('Error handling progress update:', error);
    }
  };

  // Handle travel planning progress
  const handleTravelProgress = (progress: any) => {
    console.log('Handling travel progress:', progress);
    
    // Extract agent-specific progress
    if (progress.agent) {
      const agentName = progress.agent;
      const agentId = agentName.toLowerCase().replace(/\s+/g, '_');
      
      // Update agent progress state
      setAgentProgress(prev => ({
        ...prev,
        [agentId]: progress
      }));
      
      // Create progress message
      let progressMessage = `${agentName} is working...\n`;
      
      if (progress.result && typeof progress.result === 'object') {
        if (agentId === 'travel_specialist') {
          progressMessage += `• Creating travel plan\n`;
          if (progress.result.destinations) {
            progressMessage += `• Destinations: ${progress.result.destinations}\n`;
          }
        } else if (agentId === 'research_assistant') {
          progressMessage += `• Gathering detailed information\n`;
          // Check if we have real accommodation info (not the default "No accommodation" message)
          if (progress.result.accommodation_info && 
              !progress.result.accommodation_info.includes('No accommodation') &&
              !progress.result.accommodation_info.includes('Task already processed')) {
            progressMessage += `• Found accommodation options\n`;
          }
          // Check if we have real transportation info (not the default "No transportation" message)
          if (progress.result.transportation_info && 
              !progress.result.transportation_info.includes('No transportation') &&
              !progress.result.transportation_info.includes('Task already processed') &&
              !progress.result.transportation_info.includes('No flight results found')) {
            progressMessage += `• Found transportation options\n`;
          }
        } else if (agentId === 'tavily_search') {
          progressMessage += `• Performing real-time search\n`;
          if (progress.result.current_info && progress.result.current_info !== 'No search results available') {
            progressMessage += `• Found current information\n`;
          }
        }
      }
      
      // Add progress message if not duplicate
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.type !== 'agent' || lastMessage.content !== progressMessage) {
        addAgentMessage(progressMessage, agentName);
      }
    }
  };

  // Add agent message helper
  const addAgentMessage = (content: string, sender: string) => {
    const messageId = `agent-${sender}-${Date.now()}-${messageIdCounter.current++}`;
    setMessages(prev => [
      ...prev,
      {
        id: messageId,
        content,
        type: 'agent',
        sender,
        timestamp: new Date()
      }
    ]);
  };

  // Fetch team dashboard data
  useEffect(() => {
    const fetchTeamDashboard = async () => {
      if (!teamId) return;
      
      try {
        const result = await lingoAPI.getTeamDashboard(teamId);
        if (result.success && result.data) {
          if (JSON.stringify(result.data.tasks) !== JSON.stringify(lastTasksRef.current)) {
            lastTasksRef.current = result.data.tasks;
            setTasks(result.data.tasks);
            setError(null);
          }
        } else {
          if (tasks.length === 0) {
            const mockTasks = getMockTasksForTeam(teamId);
            if (JSON.stringify(mockTasks) !== JSON.stringify(lastTasksRef.current)) {
              lastTasksRef.current = mockTasks;
              setTasks(mockTasks);
              setError("Using mock data - backend not available");
            }
          }
        }
      } catch (error) {
        console.error('Team dashboard fetch error:', error);
        if (tasks.length === 0) {
          const mockTasks = getMockTasksForTeam(teamId);
          if (JSON.stringify(mockTasks) !== JSON.stringify(lastTasksRef.current)) {
            lastTasksRef.current = mockTasks;
            setTasks(mockTasks);
            setError("Using mock data - backend not available");
          }
        }
      }
    };

    fetchTeamDashboard();
    const intervalId = setInterval(fetchTeamDashboard, 5000);
    
    return () => clearInterval(intervalId);
  }, [teamId, tasks.length]);

  // Fetch team messages
  useEffect(() => {
    const fetchTeamMessages = async () => {
      if (!teamId || (taskId && useTaskMessages)) {
        return;
      }
      
      try {
        const result = await lingoAPI.getTeamMessages(teamId);
        if (result.success && result.data) {
          const formattedMessages: Message[] = result.data.map((msg, index) => ({
            id: `msg-${teamId}-${msg.message_id}-${index}`,
            content: msg.content,
            type: msg.type as 'user' | 'agent',
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(formattedMessages);
          setError(null);
        } else {
          const mockMessages = getMockMessagesForTeam(teamId, teamName);
          setMessages(mockMessages);
          setError("Using mock data - backend not available");
        }
      } catch (error) {
        console.error('Team messages fetch error:', error);
        const mockMessages = getMockMessagesForTeam(teamId, teamName);
        setMessages(mockMessages);
        setError("Using mock data - backend not available");
      }
    };

    fetchTeamMessages();
    const intervalId = setInterval(fetchTeamMessages, 5000);
    
    return () => clearInterval(intervalId);
  }, [teamId, teamName, taskId, useTaskMessages]);

  // Helper function to get mock tasks based on team type
  const getMockTasksForTeam = (teamId: string): TeamTask[] => {
    if (teamId === 'travel_planning') {
      return [
        {
          task_id: "task_1",
          content: "Analyzing travel destination and user preferences",
          status: "completed",
          type: "thought",
          result: "Identified key attractions and activities for the destination"
        },
        {
          task_id: "task_2",
          content: "Researching accommodations and transportation options",
          status: "processing",
          type: "task",
          result: undefined
        },
        {
          task_id: "task_3",
          content: "Creating detailed day-by-day itinerary",
          status: "pending",
          type: "task",
          result: undefined
        }
      ];
    }
    
    return [
      {
        task_id: "task_1",
        content: "Analyzing user request and determining approach",
        status: "completed",
        type: "thought",
        result: "Determined that this is a content creation task"
      },
      {
        task_id: "task_2",
        content: "Researching relevant topics and gathering information",
        status: "processing",
        type: "task",
        result: undefined
      },
      {
        task_id: "task_3",
        content: "Creating initial draft content",
        status: "pending",
        type: "task",
        result: undefined
      }
    ];
  };

  // Helper function to get mock messages based on team type
  const getMockMessagesForTeam = (teamId: string, teamName: string): Message[] => {
    const baseId = `mock-${teamId}`;
    
    if (teamId === 'travel_planning') {
      return [
        {
          id: `${baseId}-1`,
          content: `Hello! I'm the TravelSpecialist agent for the ${teamName} team. I'll help create an amazing travel plan for you.`,
          type: "agent",
          sender: "TravelSpecialist",
          timestamp: new Date()
        },
        {
          id: `${baseId}-2`,
          content: `I'm the ResearchAssistant for the ${teamName} team. I'll gather relevant information about your destination.`,
          type: "agent",
          sender: "ResearchAssistant",
          timestamp: new Date()
        },
        {
          id: `${baseId}-3`,
          content: `I'm the TavilySearchAgent for the ${teamName} team. I can perform real-time searches for current travel information.`,
          type: "agent",
          sender: "TavilySearchAgent",
          timestamp: new Date()
        }
      ];
    }
    
    return [
      {
        id: `${baseId}-1`,
        content: `Hello! I'm an agent for the ${teamName} team. I'm here to help with your request.`,
        type: "agent",
        sender: "SpecialistAgent",
        timestamp: new Date()
      },
      {
        id: `${baseId}-2`,
        content: `I'm analyzing your request and preparing to help.`,
        type: "agent",
        sender: "AnalysisAgent",
        timestamp: new Date()
      },
      {
        id: `${baseId}-3`,
        content: `I can assist with various tasks. Please let me know what you need!`,
        type: "agent",
        sender: "SupportAgent",
        timestamp: new Date()
      }
    ];
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-scroll tasks to bottom
  useEffect(() => {
    if (taskContainerRef.current) {
      taskContainerRef.current.scrollTop = taskContainerRef.current.scrollHeight;
    }
  }, [tasks]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || !teamId) return;

    const uniqueId = `msg-${Date.now()}-${messageIdCounter.current++}`;
    
    // Add user message to chat
    const userMessage: Message = {
      id: uniqueId,
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const instructionRequest = {
        task_id: taskId,
        instruction: inputValue,
        user_id: 'user-001'
      };
      
      const result = await lingoAPI.sendTeamInstruction(teamId, instructionRequest);
      
      if (result.success) {
        setTimeout(() => {
          const agentMessageId = `msg-${Date.now()}-${messageIdCounter.current++}`;
          const agentMessage: Message = {
            id: agentMessageId,
            content: `I've received your instruction: "${inputValue}". I'm adjusting the workflow accordingly.`,
            type: 'agent',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, agentMessage]);
          setIsProcessing(false);
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessageId = `msg-${Date.now()}-${messageIdCounter.current++}`;
      const errorMessage: Message = {
        id: errorMessageId,
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        type: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Render agent progress for travel planning team
  const renderAgentProgress = () => {
    if (teamId !== 'travel_planning') return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Travel Specialist</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {agentProgress.travel_specialist ? 'Creating travel plan...' : 'Waiting to start...'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hotel className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Research Assistant</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {agentProgress.research_assistant ? 'Gathering information...' : 'Waiting to start...'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Final Result / Report</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {agentProgress.tavily_search ? 'Generating final report...' : 'Waiting to start...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{teamName} Team Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                {taskStatus && (
                  <>
                    <Badge className={getStatusColor(taskStatus.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(taskStatus.status)}
                        <span className="capitalize">{taskStatus.status}</span>
                      </div>
                    </Badge>
                    {taskStatus.assigned_team && (
                      <Badge variant="outline">
                        {taskStatus.assigned_team.replace('_', ' ')}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Bot className="w-4 h-4 mr-2" />
            Team Members
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 p-2 text-center text-sm text-yellow-600">
          {error}
        </div>
      )}

      {/* Agent Progress Visualization */}
      {renderAgentProgress()}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tasks List */}
        <div className="w-1/3 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Tasks</h2>
            <p className="text-sm text-muted-foreground">Current workflow progress</p>
          </div>
          <div 
            ref={taskContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            <AnimatePresence>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskItem key={task.task_id} task={task} />
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Loader className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>Waiting for tasks to be assigned...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Chat and Results */}
        <div className="w-2/3 flex flex-col">
          {/* Enhanced Travel Plan Display for Travel Planning Team */}
          {teamId === 'travel_planning' && travelPlanData && (
            <div className="border-b border-border p-4 bg-muted/50">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Travel Plan Results
              </h2>
              <TravelPlanDisplay planData={travelPlanData} />
            </div>
          )}

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-6"
          >
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>
            
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div className="bg-card rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Fixed Input Area */}
          <div className="border-t border-border p-4 bg-background">
            <div className="relative max-w-4xl mx-auto">
              <Textarea
                placeholder="Type your instruction to the team..."
                className="min-h-[100px] pr-12 resize-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isProcessing}
              />
              <Button
                size="icon"
                className="absolute right-2 bottom-2"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}