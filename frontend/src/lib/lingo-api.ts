/**
 * Lingo Master API Service
 * Handles communication with the Lingo Master Agent backend using Microsoft Agent Framework
 * Integrated with Agent Framework Teams Service for navigation and workflow coordination
 */

import { geminiService } from './gemini-service';
import { autogenTeamsService } from './autogen-teams-service';

export interface TaskRequest {
  user_id: string;
  request: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  voice_input?: string;
}

export interface TaskResponse {
  task_id: string;
  status: string;
  estimated_completion?: string;
}

export interface TaskStatus {
  task_id: string;
  user_id: string;
  original_request: string;
  voice_input?: string;
  status: 'pending' | 'routing' | 'processing' | 'completed' | 'failed' | 'checkpointed';
  assigned_team?: string;
  priority: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  result?: {
    status: string;
    data: string | null;
    full_result: any;
    timestamp: string | null;
  };
  error?: string;
}

export interface SystemStatus {
  system: string;
  status: string;
  timestamp: string;
  master_agent: string;
  specialist_teams: number;
  available_domains: string[];
  tasks: {
    total: number;
    completed: number;
    failed: number;
    by_team: Record<string, number>;
  };
  users: number;
  voice_capability: boolean;
  intelligent_routing: boolean;
}

export interface TeamInfo {
  domain: string;
  name: string;
  description: string;
  capabilities: string[];
}

export interface VoiceRequest {
  user_id: string;
  audio_data: string; // Base64 encoded
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface VoiceResponse {
  task_id: string;
  transcription: string;
  status: string;
}

export interface LingoResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Add new interfaces for team dashboard
export interface TeamTask {
  task_id: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'thought' | 'task';
  result?: string;
  error?: string;
}

export interface TeamMessage {
  message_id: string;
  content: string;
  sender: string;
  timestamp: string;
  type: 'user' | 'agent';
}

export interface TeamDashboardData {
  team_id: string;
  team_name: string;
  tasks: TeamTask[];
  status: string;
  members: string[];
}

export interface TeamInstructionRequest {
  task_id: string;
  instruction: string;
  user_id: string;
}

export class LingoMasterAPI {
  private baseUrl: string;
  private defaultUserId: string;
  private navigationCallback?: (route: string, tab?: string) => void;

  constructor(baseUrl?: string, userId: string = 'user-001') {
    // Use provided URL or get from environment
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8004';
    this.defaultUserId = userId;

    console.log('🤖 Lingo Master API initialized with Agent Framework Teams integration');
    console.log('📡 API Base URL:', this.baseUrl); // Add this for debugging
  }

  /**
   * Set navigation callback for opening nav menu tabs
   */
  setNavigationCallback(callback: (route: string, tab?: string) => void): void {
    this.navigationCallback = callback;
    autogenTeamsService.setNavigationCallback(callback);
    console.log('🧭 Navigation callback registered in Lingo Master API with Agent Framework');
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<LingoResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Health check failed: ${error}` };
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<LingoResponse<SystemStatus>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to get system status: ${error}` };
    }
  }

  /**
   * Get available teams
   */
  async getAvailableTeams(): Promise<LingoResponse<TeamInfo[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/teams`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to get teams: ${error}` };
    }
  }

  /**
   * Create a new task (text-based) - FIXED to properly connect to backend
   */
  async createTask(
    request: string,
    priority: TaskRequest['priority'] = 'normal',
    userId?: string
  ): Promise<LingoResponse<TaskResponse>> {
    try {
      const taskRequest: TaskRequest = {
        user_id: userId || this.defaultUserId,
        request,
        priority
      };

      console.log('📤 Sending task to backend:', taskRequest);
      console.log('🌐 Full URL:', `${this.baseUrl}/api/tasks`);

      const response = await fetch(`${this.baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskRequest),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Received response from backend:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Task creation error:', error);
      return { success: false, error: `Failed to create task: ${error}` };
    }
  }

  /**
   * Create a task with voice input
   */
  async createVoiceTask(
    voiceInput: string,
    request: string,
    priority: TaskRequest['priority'] = 'normal',
    userId?: string
  ): Promise<LingoResponse<TaskResponse>> {
    try {
      const taskRequest: TaskRequest = {
        user_id: userId || this.defaultUserId,
        request,
        priority,
        voice_input: voiceInput
      };

      const response = await fetch(`${this.baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to create voice task: ${error}` };
    }
  }

  /**
   * Process voice directly (base64 audio)
   */
  async processVoice(
    audioData: string,
    priority: VoiceRequest['priority'] = 'normal',
    userId?: string
  ): Promise<LingoResponse<VoiceResponse>> {
    try {
      const voiceRequest: VoiceRequest = {
        user_id: userId || this.defaultUserId,
        audio_data: audioData,
        priority
      };

      const response = await fetch(`${this.baseUrl}/api/voice/deepgram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voiceRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to process voice: ${error}` };
    }
  }

  /**
   * Get task status - FIXED to properly connect to backend
   */
  async getTaskStatus(taskId: string): Promise<LingoResponse<TaskStatus>> {
    try {
      console.log('🔍 Checking task status:', taskId);

      // Check if this is a travel task (starts with 'task_' or 'travel_')
      const isTravelTask = taskId.startsWith('task_') || taskId.startsWith('travel_');
      const endpoint = isTravelTask ? `/api/travel/tasks/${taskId}` : `/api/tasks/${taskId}`;

      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Task status response:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Task status error:', error);
      return { success: false, error: `Failed to get task status: ${error}` };
    }
  }

  /**
   * Create batch tasks
   */
  async createBatchTasks(
    requests: TaskRequest[]
  ): Promise<LingoResponse<{ batch_id: string; task_ids: string[]; total_tasks: number; status: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requests),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to create batch tasks: ${error}` };
    }
  }

  /**
   * Get analytics
   */
  async getAnalytics(): Promise<LingoResponse<{
    performance: {
      total_tasks: number;
      success_rate: string;
      active_teams: number;
      voice_capability: boolean;
    };
    team_performance: Record<string, number>;
    system_health: {
      intelligent_routing: boolean;
      voice_capability: boolean;
      uptime: string;
    };
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: `Failed to get analytics: ${error}` };
    }
  }

  /**
   * Poll task status until completion - FIXED to properly work with backend
   */
  async pollTaskStatus(
    taskId: string,
    onStatusUpdate?: (status: TaskStatus) => void,
    maxAttempts: number = 60,
    intervalMs: number = 2000
  ): Promise<LingoResponse<TaskStatus>> {
    let attempts = 0;

    return new Promise((resolve) => {
      const poll = async () => {
        attempts++;

        console.log(`🔁 Polling task status (attempt ${attempts}/${maxAttempts}):`, taskId);

        const result = await this.getTaskStatus(taskId);

        if (!result.success) {
          console.error('❌ Polling failed:', result.error);
          resolve(result);
          return;
        }

        const status = result.data!;
        console.log('📈 Task status update:', status.status);
        onStatusUpdate?.(status);

        // Check if task is complete
        if (status.status === 'completed' || status.status === 'failed') {
          console.log('✅ Task completed with status:', status.status);
          resolve(result);
          return;
        }

        // Check max attempts
        if (attempts >= maxAttempts) {
          resolve({
            success: false,
            error: `Task polling timeout after ${maxAttempts} attempts`
          });
          return;
        }

        // Continue polling
        console.log(`⏳ Waiting ${intervalMs}ms before next poll...`);
        setTimeout(poll, intervalMs);
      };

      poll();
    });
  }

  /**
   * Send a quick voice message to Lingo Master with Gemini Pro 2.5 brain and Agent Framework Teams coordination
   */
  async sendVoiceMessage(
    message: string,
    onResponse?: (response: string) => void,
    priority: TaskRequest['priority'] = 'high'
  ): Promise<LingoResponse<string>> {
    try {
      console.log('🤖 Processing with Agent Framework Teams + Gemini Pro 2.5:', message);

      // First, check if this is a team/navigation request
      const teamCommandResult = await autogenTeamsService.processVoiceCommand(message);

      if (teamCommandResult.success && teamCommandResult.data?.team) {
        console.log('🚀 Team launch detected:', teamCommandResult.data.team.name);
        const response = teamCommandResult.data.response;
        onResponse?.(response);
        return { success: true, data: response };
      }

      // If not a team command, proceed with intelligent response generation
      const gemini = geminiService.getInstance();
      if (gemini && gemini.isReady()) {
        try {
          console.log('🧠 Using Gemini Pro 2.5 brain for intelligent response...');

          onResponse?.('🧠 Thinking with Gemini Pro 2.5...');

          const geminiResponse = await gemini.generateResponse(message);

          if (geminiResponse.success && geminiResponse.response) {
            console.log('✅ Gemini Pro 2.5 response:', geminiResponse.response);
            onResponse?.(geminiResponse.response);
            return { success: true, data: geminiResponse.response };
          } else {
            console.warn('⚠️ Gemini failed, falling back to enhanced mock response');
            throw new Error(geminiResponse.error || 'Gemini response failed');
          }
        } catch (geminiError: any) {
          console.warn('⚠️ Gemini Pro 2.5 error:', geminiError.message);
          // Fall through to enhanced mock response
        }
      } else {
        console.warn('⚠️ Gemini Pro 2.5 not ready, using enhanced responses...');
      }

      // Enhanced mock response with team awareness
      const enhancedResponse = this.generateMockResponse(message);
      onResponse?.(enhancedResponse);
      return { success: true, data: enhancedResponse };

    } catch (error) {
      // Always provide enhanced responses on any error
      console.warn('⚠️ API error, using enhanced fallback response:', error);
      const enhancedResponse = this.generateMockResponse(message);
      onResponse?.(enhancedResponse);
      return { success: true, data: enhancedResponse };
    }
  }

  /**
   * Generate natural, concise responses with human-like emotions and team awareness (max 2-3 sentences)
   */
  private generateMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Check for team-specific requests first
    const team = autogenTeamsService.findTeamByKeywords(message);
    if (team) {
      // If team found, suggest navigation
      const teamResponses = [
        `*excited* Perfect! ${team.name} can definitely help with that using Agent Framework! Want me to open the ${team.navRoute} section for you?`,
        `*lights up* Oh, that's exactly what our ${team.name} specializes in with Agent Framework! I can launch them right now if you'd like.`,
        `*enthusiastic* Great choice with Agent Framework! The ${team.name} are experts at this. Say 'launch ${team.name}' and I'll get them started!`
      ];
      return teamResponses[Math.floor(Math.random() * teamResponses.length)];
    }

    // Short, punchy emotional responses
    const conciseResponses = {
      excited: [
        "*excited* Oh wow, that sounds fantastic with Agent Framework! Let's dive right into this!",
        "*lights up* This is going to be amazing with Agent Framework! I'm genuinely thrilled to help!",
        "*enthusiastic* YES! I love this kind of challenge with Agent Framework!"
      ],
      thoughtful: [
        "*pauses thoughtfully* That's really interesting with Agent Framework... Let me think about this.",
        "*contemplates* Hmm, that's quite fascinating with Agent Framework. Here's what comes to mind...",
        "*takes a breath* That's a deep question with Agent Framework. I appreciate you asking."
      ],
      friendly: [
        "*warm smile* Oh, I'm so glad you brought this up with Agent Framework! It's one of my favorites.",
        "*chuckles softly* You know what? I was just thinking about something similar with Agent Framework!",
        "*genuinely interested* That's such a great point with Agent Framework!"
      ],
      empathetic: [
        "*understanding tone* I completely get where you're coming from with Agent Framework. That sounds challenging.",
        "*nods knowingly* Oh, I hear you with Agent Framework. Let's figure this out together.",
        "*supportive* Hey, that's totally understandable with Agent Framework."
      ],
      curious: [
        "*perks up* Ooh, that's intriguing with Agent Framework! Tell me more about that.",
        "*leans in* Wait, that's fascinating with Agent Framework! Can you share more details?",
        "*eyes light up* Oh my, that sounds like quite a story with Agent Framework!"
      ],
      playful: [
        "*grins* Well, well... looks like we've got an interesting challenge here with Agent Framework!",
        "*laughs warmly* This is going to be more fun than I thought with Agent Framework!",
        "*playful tone* Alright, I see what you're up to with Agent Framework... and I like it!"
      ]
    };

    // Detect emotion and keep responses SHORT
    let selectedEmotion = 'friendly';

    if (lowerMessage.includes('amazing') || lowerMessage.includes('awesome') || lowerMessage.includes('great')) {
      selectedEmotion = 'excited';
    } else if (lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
      selectedEmotion = 'curious';
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('difficult')) {
      selectedEmotion = 'empathetic';
    } else if (lowerMessage.includes('fun') || lowerMessage.includes('creative') || lowerMessage.includes('idea')) {
      selectedEmotion = 'playful';
    } else if (lowerMessage.includes('think') || lowerMessage.includes('analyze') || lowerMessage.includes('complex')) {
      selectedEmotion = 'thoughtful';
    }

    // Get short emotional response
    const emotionalResponse = conciseResponses[selectedEmotion as keyof typeof conciseResponses][Math.floor(Math.random() * conciseResponses[selectedEmotion as keyof typeof conciseResponses].length)];

    // Team-specific SHORT responses with comprehensive coverage
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('overview')) {
      return `${emotionalResponse} I'll open the main dashboard where you can access all features! Ready to explore?`;
    }

    if (lowerMessage.includes('documents') || lowerMessage.includes('knowledge base') || lowerMessage.includes('files')) {
      return `${emotionalResponse} Perfect for document management! I'll open the documents section for you.`;
    }

    if (lowerMessage.includes('lancers') || lowerMessage.includes('teams') || lowerMessage.includes('workflow')) {
      return `${emotionalResponse} Great choice! I'll open the Lancers Teams section for workflow coordination.`;
    }

    if (lowerMessage.includes('smart bot') || lowerMessage.includes('chatbot') || lowerMessage.includes('chat bot')) {
      return `${emotionalResponse} I'll launch the Smart Bots workspace where you can create AI assistants!`;
    }

    if (lowerMessage.includes('voice bot') || lowerMessage.includes('voice assistant')) {
      return `${emotionalResponse} Perfect! I'll open the Voice Bots section for AI voice assistant creation.`;
    }

    if (lowerMessage.includes('social media') || lowerMessage.includes('social platforms') || lowerMessage.includes('post')) {
      return `${emotionalResponse} Great! I'll open the Social Media suite for platform management and content creation.`;
    }

    if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule')) {
      return `${emotionalResponse} I'll open the Social Calendar for content planning and scheduling!`;
    }

    if (lowerMessage.includes('campaign') || lowerMessage.includes('promote') || lowerMessage.includes('advertise')) {
      return `${emotionalResponse} Perfect for campaigns! I'll open the Marketing workspace for strategic promotions.`;
    }

    if (lowerMessage.includes('content') || lowerMessage.includes('write') || lowerMessage.includes('blog') || lowerMessage.includes('article')) {
      return `${emotionalResponse} I'll open the Content Creation workspace where you can write amazing content!`;
    }

    if (lowerMessage.includes('writer') || lowerMessage.includes('ai writer')) {
      return `${emotionalResponse} Perfect! I'll launch the AI Writer for professional content creation.`;
    }

    if (lowerMessage.includes('editor') || lowerMessage.includes('edit')) {
      return `${emotionalResponse} Great! I'll open the AI Editor for content refinement and enhancement.`;
    }

    if (lowerMessage.includes('seo') || lowerMessage.includes('keywords') || lowerMessage.includes('optimization')) {
      return `${emotionalResponse} Excellent! I'll open the SEO Keywords tool for optimization and research.`;
    }

    if (lowerMessage.includes('audio') || lowerMessage.includes('music') || lowerMessage.includes('sound')) {
      return `${emotionalResponse} I'll open the Audio Production studio for music and sound creation!`;
    }

    if (lowerMessage.includes('voiceover') || lowerMessage.includes('voice over') || lowerMessage.includes('narration')) {
      return `${emotionalResponse} Perfect! I'll launch the AI Voiceover workspace for professional narration.`;
    }

    if (lowerMessage.includes('voice clone') || lowerMessage.includes('clone voice')) {
      return `${emotionalResponse} Great! I'll open the Voice Clone studio for custom voice creation.`;
    }

    if (lowerMessage.includes('transcription') || lowerMessage.includes('speech to text')) {
      return `${emotionalResponse} I'll open the Speech to Text workspace for audio transcription services!`;
    }

    if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('developer')) {
      return `${emotionalResponse} I'll open the Code Development workspace for software creation and programming!`;
    }

    if (lowerMessage.includes('website') || lowerMessage.includes('web design') || lowerMessage.includes('app')) {
      return `${emotionalResponse} Perfect! I'll launch the Website Designer for creating amazing digital experiences.`;
    }

    if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('photo')) {
      return `${emotionalResponse} I'll open the AI Image Generation suite for creating stunning visuals!`;
    }

    if (lowerMessage.includes('logo') || lowerMessage.includes('design') || lowerMessage.includes('creative')) {
      return `${emotionalResponse} Great! I'll launch the Creative Suite for logo and design creation.`;
    }

    if (lowerMessage.includes('virtual try on') || lowerMessage.includes('try on') || lowerMessage.includes('fashion') || lowerMessage.includes('clothes')) {
      return `${emotionalResponse} Perfect! I'll open the Virtual Try-On studio for AI-powered fashion fitting!`;
    }

    if (lowerMessage.includes('video') || lowerMessage.includes('movie') || lowerMessage.includes('clip')) {
      return `${emotionalResponse} I'll open the Video Production workspace for creating amazing video content!`;
    }

    if (lowerMessage.includes('influencer') || lowerMessage.includes('viral') || lowerMessage.includes('social content')) {
      return `${emotionalResponse} Great! I'll open the AI Influencer suite for viral content creation and management.`;
    }

    if (lowerMessage.includes('avatar') || lowerMessage.includes('digital persona') || lowerMessage.includes('character')) {
      return `${emotionalResponse} Perfect! I'll launch the Avatar Studio for creating digital personas and characters.`;
    }

    if (lowerMessage.includes('chat') || lowerMessage.includes('conversation') || lowerMessage.includes('talk')) {
      return `${emotionalResponse} I'll open the AI Chat workspace for intelligent conversations and assistance!`;
    }

    if (lowerMessage.includes('voice chat') || lowerMessage.includes('voice conversation')) {
      return `${emotionalResponse} Great! I'll launch the Realtime Voice Chat for natural AI conversations.`;
    }

    if (lowerMessage.includes('admin') || lowerMessage.includes('administration') || lowerMessage.includes('management')) {
      return `${emotionalResponse} I'll open the Admin Panel where you can manage system settings and configurations!`;
    }

    if (lowerMessage.includes('integration') || lowerMessage.includes('api') || lowerMessage.includes('connect')) {
      return `${emotionalResponse} Perfect! I'll open the Integration section for API keys and service connections.`;
    }

    // SHORT general response with team suggestions
    return `${emotionalResponse} I can connect you with our specialist teams - we have experts in Virtual Try-On, Content Creation, Image Generation, Video Production, Social Media, Marketing, Audio, and Code Development. What interests you most?`;
  }

  /**
   * Launch a specific team for a task
   */
  async launchTeam(
    teamDomain: string,
    request: string,
    priority: TaskRequest['priority'] = 'normal'
  ): Promise<LingoResponse<TaskResponse>> {
    console.log('🚀 Launching team:', teamDomain, 'with request:', request);
    // Format request to specify team
    const teamRequest = `[TEAM: ${teamDomain}] ${request}`;
    console.log('📝 Formatted team request:', teamRequest);
    return this.createTask(teamRequest, priority);
  }

  /**
   * Get team performance metrics
   */
  async getTeamPerformance(): Promise<LingoResponse<Record<string, {
    total_tasks: number;
    success_rate: number;
    avg_completion_time: string;
    capabilities: string[];
  }>>> {
    try {
      const [statusResult, analyticsResult] = await Promise.all([
        this.getSystemStatus(),
        this.getAnalytics()
      ]);

      if (!statusResult.success || !analyticsResult.success) {
        return { success: false, error: 'Failed to get performance data' };
      }

      const teamData: Record<string, any> = {};
      const teams = analyticsResult.data!.team_performance;

      for (const [teamName, taskCount] of Object.entries(teams)) {
        teamData[teamName] = {
          total_tasks: taskCount,
          success_rate: 95, // Placeholder - would be calculated from actual data
          avg_completion_time: '2.3 minutes', // Placeholder
          capabilities: [] // Would be fetched from team info
        };
      }

      return { success: true, data: teamData };
    } catch (error) {
      return { success: false, error: `Failed to get team performance: ${error}` };
    }
  }

  /**
   * Get team dashboard data - FIXED to connect to backend
   */
  async getTeamDashboard(teamId: string): Promise<LingoResponse<TeamDashboardData>> {
    try {
      console.log('📊 Fetching team dashboard data for:', teamId);

      // Use the same base URL for all operations
      // Try to get from backend - use the correct endpoint
      const response = await fetch(`${this.baseUrl}/api/teams/${teamId}/dashboard`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Team dashboard error:', error);
      return { success: false, error: `Failed to get team dashboard: ${error}` };
    }
  }

  /**
   * Get team chat messages - FIXED to connect to backend
   */
  async getTeamMessages(teamId: string): Promise<LingoResponse<TeamMessage[]>> {
    try {
      console.log('💬 Fetching team messages for:', teamId);

      // Use the same base URL for all operations
      // Try to get from backend - use the correct endpoint
      const response = await fetch(`${this.baseUrl}/api/teams/${teamId}/messages`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Team messages error:', error);
      return { success: false, error: `Failed to get team messages: ${error}` };
    }
  }

  /**
   * Send instruction to team - FIXED to connect to backend
   */
  async sendTeamInstruction(
    teamId: string,
    instructionRequest: TeamInstructionRequest
  ): Promise<LingoResponse<{ status: string; message: string }>> {
    try {
      console.log('📤 Sending instruction to team:', teamId, instructionRequest);

      // Use the same base URL for all operations
      const response = await fetch(`${this.baseUrl}/api/teams/${teamId}/instruction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instructionRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Team instruction error:', error);
      return { success: false, error: `Failed to send team instruction: ${error}` };
    }
  }
}

// Utility functions
export function getTaskStatusColor(status: TaskStatus['status']): string {
  switch (status) {
    case 'pending': return '#6B7280'; // gray
    case 'routing': return '#F59E0B'; // yellow
    case 'processing': return '#3B82F6'; // blue
    case 'completed': return '#10B981'; // green
    case 'failed': return '#EF4444'; // red
    default: return '#6B7280';
  }
}

export function getTaskStatusIcon(status: TaskStatus['status']): string {
  switch (status) {
    case 'pending': return '⏳';
    case 'routing': return '🔄';
    case 'processing': return '⚡';
    case 'completed': return '✅';
    case 'failed': return '❌';
    default: return '❓';
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Create singleton instance
export const lingoAPI = new LingoMasterAPI();

export default LingoMasterAPI;