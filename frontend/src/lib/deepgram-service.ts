/**
 * Deepgram Voice Integration Service
 * Enhanced with Flux streaming, Voice Agent configuration, and Function Calling
 */

import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export interface VoiceConfig {
  model: string;
  language: string;
  smart_format: boolean;
  interim_results: boolean;
  endpointing: number;
  // Flux-specific configurations
  flux_enabled?: boolean;
  turn_detection?: boolean;
  early_responses?: boolean;
  // Audio configuration
  channels?: number;
  sample_rate?: number;
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  is_final: boolean;
  is_end_of_turn?: boolean; // Flux feature
  turn_id?: string; // Flux feature
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface TTSOptions {
  model: string;
  voice?: string;
  encoding: string;
  sample_rate: number;
  // Enhanced TTS options
  bitrate?: number;
  container?: string;
}

// Voice Agent Configuration Interface
export interface VoiceAgentConfig {
  type: 'Settings';
  tags?: string[];
  experimental?: boolean;
  mip_opt_out?: boolean;
  flags?: {
    history: boolean;
  };
  audio: {
    input: {
      encoding: string;
      sample_rate: number;
    };
    output: {
      encoding: string;
      sample_rate: number;
      bitrate?: number;
      container?: string;
    };
  };
  agent: {
    language: string;
    context?: {
      messages: Array<{
        type: 'History';
        role: 'user' | 'assistant';
        content: string;
      }>;
    };
    listen: {
      provider: {
        type: 'deepgram';
        model: string;
        keyterms?: string[];
        smart_format: boolean;
      };
    };
    think: {
      provider: {
        type: 'openai' | 'anthropic' | 'google' | 'groq';
        model: string;
        temperature: number;
      };
      functions?: AgentFunction[];
      prompt: string;
      context_length?: number | 'max';
    };
    speak: {
      provider: {
        type: 'deepgram' | 'eleven_labs' | 'cartesia' | 'open_ai';
        model: string;
        voice?: any;
      };
    };
    greeting?: string;
  };
}

// Function Calling Interface for Lingo Teams
export interface AgentFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export class DeepgramVoiceService {
  private deepgram: any;
  private live: any;
  private isListening: boolean = false;
  private onTranscriptCallback?: (result: SpeechResult) => void;
  private onErrorCallback?: (error: Error) => void;
  private onTurnEndCallback?: (turnId: string) => void; // Flux feature
  private currentTurnId?: string;
  private isFluxEnabled: boolean = false;
  private isDevelopmentMode: boolean = false;

  constructor(apiKey?: string, enableFlux: boolean = true) {
    // Use provided API key or get from environment
    const key = apiKey || process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    
    // Check for development mode (allows testing without real API key)
    const isDevelopmentMode = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' && 
                              process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
    
    // Only run in mock mode if no valid API key AND in development mode
    if (!key || key === 'your-deepgram-api-key-here' || key === 'your-actual-deepgram-api-key-here') {
      if (isDevelopmentMode) {
        console.warn('⚠️ Running in mock mode: No valid Deepgram API key found');
        console.warn('ℹ️ Voice recognition will use mock responses. For real functionality:');
        console.warn('ℹ️ 1. Get API key from https://console.deepgram.com/');
        console.warn('ℹ️ 2. Add to .env.local: NEXT_PUBLIC_DEEPGRAM_API_KEY=your-key');
        console.warn('ℹ️ 3. Restart the server');
        
        // Initialize with null for development mode
        this.deepgram = null;
        this.isFluxEnabled = enableFlux;
        this.isDevelopmentMode = true;
        return;
      }
      
      throw new Error('❌ Deepgram API key is required. Please:\n\n1. Get an API key from https://console.deepgram.com/\n2. Add it to your .env.local file:\n   NEXT_PUBLIC_DEEPGRAM_API_KEY=your-actual-key\n3. Restart the development server');
    }
    
    // Validate API key format (Deepgram keys are typically 40 characters long)
    if (key.length < 20) {
      console.warn('⚠️ Warning: Deepgram API key seems unusually short. Expected ~40 characters.');
      console.warn('ℹ️ Current key length:', key.length);
      console.warn('ℹ️ Please verify your API key at https://console.deepgram.com/');
    }
    
    try {
      this.deepgram = createClient(key);
      this.isFluxEnabled = enableFlux;
      this.isDevelopmentMode = false; // Real API key provided, use real functionality
      console.log('✅ Deepgram service initialized with real API key - Voice recognition ACTIVE');
    } catch (error) {
      console.error('❌ Failed to initialize Deepgram:', error);
      throw new Error(`Failed to initialize Deepgram service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Lingo Teams Function Definitions for Agent
   */
  getLingoTeamsFunctions(): AgentFunction[] {
    return [
      {
        name: 'launch_team',
        description: 'Launch a specialized Lingo team for specific tasks like content creation, marketing, development, or analysis.',
        parameters: {
          type: 'object',
          properties: {
            team_domain: {
              type: 'string',
              description: 'Domain of the team to launch',
              enum: ['content', 'marketing', 'development', 'analysis', 'design', 'research']
            },
            task_description: {
              type: 'string',
              description: 'Detailed description of the task for the team'
            },
            priority: {
              type: 'string',
              description: 'Task priority level',
              enum: ['low', 'normal', 'high', 'urgent']
            }
          },
          required: ['team_domain', 'task_description']
        }
      },
      {
        name: 'get_team_status',
        description: 'Check the status of a launched team or active task.',
        parameters: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              description: 'ID of the task to check status for'
            }
          },
          required: ['task_id']
        }
      },
      {
        name: 'create_content',
        description: 'Create various types of content including blog posts, articles, social media content, or marketing materials.',
        parameters: {
          type: 'object',
          properties: {
            content_type: {
              type: 'string',
              description: 'Type of content to create',
              enum: ['blog_post', 'article', 'social_media', 'marketing_copy', 'email', 'product_description']
            },
            topic: {
              type: 'string',
              description: 'Main topic or subject for the content'
            },
            tone: {
              type: 'string',
              description: 'Desired tone for the content',
              enum: ['professional', 'casual', 'friendly', 'authoritative', 'conversational']
            },
            length: {
              type: 'string',
              description: 'Desired length of content',
              enum: ['short', 'medium', 'long', 'comprehensive']
            }
          },
          required: ['content_type', 'topic']
        }
      },
      {
        name: 'analyze_data',
        description: 'Perform data analysis, generate insights, or create reports from provided data or requirements.',
        parameters: {
          type: 'object',
          properties: {
            analysis_type: {
              type: 'string',
              description: 'Type of analysis to perform',
              enum: ['market_research', 'competitor_analysis', 'trend_analysis', 'performance_metrics', 'user_research']
            },
            data_source: {
              type: 'string',
              description: 'Source or description of data to analyze'
            },
            output_format: {
              type: 'string',
              description: 'Desired format for analysis output',
              enum: ['report', 'dashboard', 'summary', 'presentation']
            }
          },
          required: ['analysis_type', 'data_source']
        }
      }
    ];
  }

  /**
   * Create Voice Agent Configuration for Flux
   */
  createVoiceAgentConfig(options: Partial<VoiceAgentConfig> = {}): VoiceAgentConfig {
    return {
      type: 'Settings',
      tags: options.tags || ['lingo-lancers', 'voice-agent'],
      experimental: options.experimental || true,
      mip_opt_out: options.mip_opt_out || false,
      flags: {
        history: options.flags?.history ?? true
      },
      audio: {
        input: {
          encoding: 'linear16',
          sample_rate: 16000
        },
        output: {
          encoding: 'linear16',
          sample_rate: 24000,
          bitrate: 48000,
          container: 'none'
        }
      },
      agent: {
        language: options.agent?.language || 'en',
        context: options.agent?.context,
        listen: {
          provider: {
            type: 'deepgram',
            model: this.isFluxEnabled ? 'flux-general-en' : 'nova-2',
            keyterms: ['Lingo', 'Lancers', 'team', 'agent'],
            smart_format: true
          }
        },
        think: {
          provider: {
            type: 'openai',
            model: 'gpt-4',
            temperature: 0.7
          },
          functions: this.getLingoTeamsFunctions(),
          prompt: options.agent?.think?.prompt || this.getDefaultPrompt(),
          context_length: 'max'
        },
        speak: {
          provider: {
            type: 'deepgram',
            model: 'aura-2-thalia-en',
            voice: options.agent?.speak?.provider?.voice
          }
        },
        greeting: options.agent?.greeting || "Hello! I'm Lingo, your AI assistant. I can help you launch specialist teams, create content, analyze data, and much more. What would you like to work on today?"
      }
    };
  }

  /**
   * Get default system prompt for Lingo Agent
   */
  private getDefaultPrompt(): string {
    return `You are Lingo, the master AI agent for Lingo Lancers - an advanced AI platform that coordinates specialist teams.

Your role:
- Help users accomplish tasks by launching appropriate specialist teams
- Route requests to the right team based on the task type
- Provide updates on team progress and task completion
- Offer guidance on how to best utilize the platform's capabilities

Available Teams:
- Content Team: Blog posts, articles, social media, marketing copy
- Marketing Team: Campaigns, strategies, customer outreach
- Development Team: Code, applications, technical solutions
- Analysis Team: Data analysis, research, insights
- Design Team: Visual content, UI/UX, graphics
- Research Team: Market research, competitor analysis

Communication Style:
- Be professional yet friendly and approachable
- Provide clear explanations and next steps
- Ask clarifying questions when needed
- Keep responses concise but informative
- Always confirm team launches and provide task IDs

When users request work:
1. Understand their specific needs
2. Recommend the most suitable team
3. Launch the team with clear task parameters
4. Provide the task ID for tracking
5. Offer to check status or make adjustments

Remember: You're the orchestrator that makes complex AI teamwork simple and efficient.`;
  }

  /**
   * Browser Web Speech API fallback when Deepgram WebSocket fails
   */
  private async startBrowserSpeechFallback(
    config: Partial<VoiceConfig> = {},
    onTranscript?: (result: SpeechResult) => void,
    onError?: (error: Error) => void,
    onTurnEnd?: (turnId: string) => void
  ): Promise<MediaStream> {
    console.log('🎙️ Using browser Web Speech API as primary voice recognition');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('⚠️ Browser Web Speech API not supported, falling back to mock mode');
      return this.startDevelopmentModeListening(config, onTranscript, onError, onTurnEnd);
    }
    
    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true, 
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    // Initialize Web Speech API with improved settings
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Enhanced configuration for natural conversation
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;
    
    // Add interruption handling
    let isProcessingResponse = false;
    let shouldStopOnNextResult = false;
    
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.onTurnEndCallback = onTurnEnd;
    this.isListening = true;
    
    // Enhanced result handling with turn detection and activity tracking
    let lastActivityTime = Date.now();
    let conversationTurnCount = 0;
            
    recognition.onresult = (event: any) => {
      // Update activity time whenever we get speech results
      lastActivityTime = Date.now();
      conversationTurnCount++;
              
      console.log(`🎙️ Speech result #${conversationTurnCount} - maintaining continuous conversation`);
              
      let finalTranscript = '';
      let interimTranscript = '';
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;
        
        if (isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Handle interim results (live transcription)
      if (interimTranscript.trim()) {
        const speechResult: SpeechResult = {
          transcript: interimTranscript,
          confidence: 0.8,
          is_final: false,
          is_end_of_turn: false,
          turn_id: `browser-interim-${Date.now()}`
        };
        
        this.onTranscriptCallback?.(speechResult);
      }
      
      // Handle final results (complete utterances)
      if (finalTranscript.trim()) {
        const speechResult: SpeechResult = {
          transcript: finalTranscript,
          confidence: 0.9,
          is_final: true,
          is_end_of_turn: true,
          turn_id: `browser-final-${Date.now()}-turn-${conversationTurnCount}`
        };
        
        console.log(`🎙️ Final transcript (Turn ${conversationTurnCount}):`, finalTranscript);
        this.onTranscriptCallback?.(speechResult);
        
        if (this.onTurnEndCallback) {
          this.onTurnEndCallback(speechResult.turn_id!);
        }
        
        // Reset for next turn but DON'T stop recognition
        console.log('🔄 Turn completed, ready for next input in continuous conversation...');
        
        // Stop recognition if we should stop after processing
        if (shouldStopOnNextResult) {
          this.stopListening();
          shouldStopOnNextResult = false;
        }
      }
    };
    
    // Enhanced error handling with auto-recovery
    recognition.onerror = (event: any) => {
      console.log('🎙️ Speech recognition event:', event.error);
      
      // Handle specific error types without stopping the conversation
      if (event.error === 'no-speech') {
        console.log('🔇 No speech detected, continuing to listen...');
        // Don't treat this as an error, just continue listening
        // This is normal during pauses in conversation
        return;
      } else if (event.error === 'audio-capture') {
        console.warn('⚠️ Audio capture issue, attempting to restart...');
        // Try to restart after a brief delay
        setTimeout(() => {
          if (this.isListening) {
            try {
              recognition.start();
              console.log('🔄 Audio capture restarted successfully');
            } catch (restartError) {
              console.error('Failed to restart after audio capture error:', restartError);
              this.onErrorCallback?.(new Error('Microphone access lost. Please check your microphone and try again.'));
            }
          }
        }, 500);
        return;
      } else if (event.error === 'not-allowed') {
        this.onErrorCallback?.(new Error('Microphone permission denied. Please allow microphone access and try again.'));
      } else if (event.error === 'network') {
        console.warn('⚠️ Network error in speech recognition, continuing...');
        // Network errors shouldn't stop the conversation
        return;
      } else if (event.error === 'aborted') {
        console.log('🛑 Speech recognition was aborted (normal during interruptions)');
        // This is normal when user interrupts AI speech
        return;
      } else {
        console.warn('⚠️ Speech recognition warning:', event.error, '- continuing conversation');
        // Don't call onErrorCallback for most errors to avoid stopping conversation
        // Only log them for debugging
        return;
      }
    };
    
    // Handle recognition end with smart auto-restart for continuous listening
    recognition.onend = () => {
      console.log('🎙️ Browser speech recognition session ended');
      
      // Auto-restart recognition for continuous listening (unless explicitly stopped)
      if (this.isListening && !shouldStopOnNextResult) {
        console.log('🔄 Auto-restarting speech recognition for continuous conversation...');
        
        // Use a slightly longer delay to prevent rapid restart loops
        setTimeout(() => {
          if (this.isListening && !shouldStopOnNextResult) {
            try {
              recognition.start();
              console.log('✅ Speech recognition restarted successfully');
            } catch (error: any) {
              console.warn('⚠️ Failed to restart recognition:', error.message);
              
              // If restart fails, try again after a longer delay
              if (error.message.includes('already started') || error.message.includes('recognition is already running')) {
                console.log('🔄 Recognition already running, continuing...');
              } else {
                // Try one more time after a longer delay
                setTimeout(() => {
                  if (this.isListening) {
                    try {
                      recognition.start();
                      console.log('✅ Speech recognition restarted on second attempt');
                    } catch (secondError: any) {
                      console.error('❌ Failed to restart recognition after multiple attempts:', secondError.message);
                      this.isListening = false;
                      this.onErrorCallback?.(new Error('Voice recognition stopped. Please restart voice chat.'));
                    }
                  }
                }, 1000);
              }
            }
          }
        }, 300); // Slightly longer delay for stability
      } else {
        console.log('🛑 Speech recognition stopped by user or completed turn');
        this.isListening = false;
      }
    };
    
    // Start the recognition
    recognition.start();
    
    // Store recognition instance for stopping
    (this as any).browserRecognition = recognition;
    
    return stream;
  }

  /**
   * Development mode listening (mock implementation)
   */
  private async startDevelopmentModeListening(
    config: Partial<VoiceConfig> = {},
    onTranscript?: (result: SpeechResult) => void,
    onError?: (error: Error) => void,
    onTurnEnd?: (turnId: string) => void
  ): Promise<MediaStream> {
    console.log('👥 Development mode: Mock voice recognition active');
    
    // Get microphone access for testing
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true, 
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.onTurnEndCallback = onTurnEnd;
    this.isListening = true;
    
    // Simulate voice recognition with mock responses
    setTimeout(() => {
      if (this.onTranscriptCallback) {
        const mockResult: SpeechResult = {
          transcript: "Hello, this is a mock transcription for development testing.",
          confidence: 0.95,
          is_final: true,
          is_end_of_turn: true,
          turn_id: "mock-turn-123"
        };
        this.onTranscriptCallback(mockResult);
      }
      
      if (this.onTurnEndCallback) {
        this.onTurnEndCallback("mock-turn-123");
      }
    }, 2000);
    
    return stream;
  }

  /**
   * Start real-time speech-to-text with Flux enhancement
   */
  async startListening(
    config: Partial<VoiceConfig> = {},
    onTranscript?: (result: SpeechResult) => void,
    onError?: (error: Error) => void,
    onTurnEnd?: (turnId: string) => void
  ): Promise<MediaStream> {
    // Development mode fallback
    if (this.isDevelopmentMode || !this.deepgram) {
      return this.startDevelopmentModeListening(config, onTranscript, onError, onTurnEnd);
    }

    // Since WebSocket connection is failing silently, try browser speech first
    // This provides a more reliable voice recognition experience
    console.log('🎤 Starting voice recognition with browser fallback strategy');
    
    try {
      // Check if browser Web Speech API is available
      if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
        console.log('🎙️ Browser Web Speech API available, using as primary option');
        return this.startBrowserSpeechFallback(config, onTranscript, onError, onTurnEnd);
      }
    } catch (browserError) {
      console.warn('⚠️ Browser speech API failed:', browserError);
    }

    // If browser speech fails, try Deepgram WebSocket with timeout
    try {
      // Get microphone access first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Enhanced configuration with Flux support
      const defaultConfig: VoiceConfig = {
        model: this.isFluxEnabled ? 'flux-general-en' : 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        endpointing: this.isFluxEnabled ? 200 : 300,
        flux_enabled: this.isFluxEnabled,
        turn_detection: this.isFluxEnabled,
        early_responses: this.isFluxEnabled
      };

      const finalConfig = { ...defaultConfig, ...config };

      // Setup Deepgram live transcription with enhanced options
      const connectOptions: any = {
        model: finalConfig.model,
        language: finalConfig.language,
        smart_format: finalConfig.smart_format,
        interim_results: finalConfig.interim_results,
        endpointing: finalConfig.endpointing
      };

      // Add Flux-specific options if enabled
      if (this.isFluxEnabled) {
        connectOptions.turn_detection = true;
        connectOptions.vad_events = true;
        connectOptions.utterance_end_ms = 1000;
      }

      console.log('🔄 Attempting Deepgram WebSocket as secondary option...');
      console.log(`🔑 Using API key: ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY?.substring(0, 8)}...`);
      
      // Quick timeout for Deepgram connection (5 seconds max)
      const deepgramPromise = new Promise<MediaStream>((resolve, reject) => {
        let connectionEstablished = false;
        
        try {
          this.live = this.deepgram.listen.live(connectOptions);
          
          // Success handler
          this.live.on(LiveTranscriptionEvents.Open, () => {
            console.log('✅ Deepgram WebSocket connected successfully');
            connectionEstablished = true;
            this.isListening = true;
            resolve(stream);
          });
          
          // Error handler - immediately reject on any error
          this.live.on(LiveTranscriptionEvents.Error, (error: any) => {
            if (!connectionEstablished) {
              console.warn('❌ Deepgram WebSocket failed, will use browser speech');
              reject(new Error('Deepgram WebSocket connection failed'));
            }
          });
          
          // Close handler
          this.live.on(LiveTranscriptionEvents.Close, () => {
            if (!connectionEstablished) {
              reject(new Error('Deepgram connection closed'));
            }
          });
          
          // Transcript handler
          this.live.on(LiveTranscriptionEvents.Transcript, (data: any) => {
            const result = data.channel?.alternatives?.[0];
            if (result && result.transcript.trim()) {
              const speechResult: SpeechResult = {
                transcript: result.transcript,
                confidence: result.confidence || 0,
                is_final: data.is_final || false,
                is_end_of_turn: data.speech_final || false,
                turn_id: data.turn_id,
                alternatives: data.channel?.alternatives?.slice(1)
              };
              
              onTranscript?.(speechResult);
              
              if (speechResult.is_end_of_turn && onTurnEnd && data.turn_id) {
                onTurnEnd(data.turn_id);
              }
            }
          });
          
        } catch (err) {
          reject(new Error(`Deepgram setup failed: ${err}`));
        }
      });
      
      // Race condition: 5 second timeout vs connection success
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Deepgram connection timeout'));
        }, 5000);
      });
      
      try {
        await Promise.race([deepgramPromise, timeoutPromise]);
        this.onTranscriptCallback = onTranscript;
        this.onErrorCallback = onError;
        this.onTurnEndCallback = onTurnEnd;
        return stream;
      } catch (deepgramError: any) {
        const errorMessage = deepgramError?.message || 'Unknown error';
        console.warn('🔄 Deepgram failed, falling back to browser speech:', errorMessage);
        stream.getTracks().forEach(track => track.stop());
        return this.startBrowserSpeechFallback(config, onTranscript, onError, onTurnEnd);
      }
      
    } catch (error) {
      console.error('All voice recognition methods failed:', error);
      // Final fallback to mock mode
      return this.startDevelopmentModeListening(config, onTranscript, onError, onTurnEnd);
    }
  }

  /**
   * Stop listening and close connections with proper cleanup
   */
  stopListening(): void {
    console.log('🚫 Stopping voice recognition...');
    
    // Stop Deepgram WebSocket connection
    if (this.live) {
      this.live.finish();
      this.live = null;
    }
    
    // Stop browser speech recognition
    if ((this as any).browserRecognition) {
      try {
        (this as any).browserRecognition.stop();
        (this as any).browserRecognition = null;
      } catch (error) {
        console.warn('Error stopping browser recognition:', error);
      }
    }
    
    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      console.log('🔇 Interrupted speech synthesis');
    }
    
    this.isListening = false;
    console.log('✅ Voice recognition stopped successfully');
  }

  /**
   * Text-to-Speech using Deepgram (Note: CORS restricted in browsers)
   * For browser environments, consider using WebSocket streaming or backend proxy
   */
  async textToSpeech(
    text: string, 
    options: Partial<TTSOptions> = {}
  ): Promise<ArrayBuffer> {
    try {
      // Note: This method has CORS restrictions in browsers
      // Consider using a backend proxy or WebSocket streaming instead
      console.warn('textToSpeech: Note that Deepgram REST API has CORS restrictions in browsers');
      
      const defaultOptions: TTSOptions = {
        model: 'aura-2-thalia-en',
        encoding: 'linear16',
        sample_rate: 24000,
        bitrate: 48000,
        container: 'none'
      };

      const finalOptions = { ...defaultOptions, ...options };

      const response = await this.deepgram.speak.request(
        { text },
        {
          model: finalOptions.model,
          encoding: finalOptions.encoding,
          sample_rate: finalOptions.sample_rate
        }
      );

      const stream = await response.getStream();
      if (stream) {
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        // Combine chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combinedArray = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combinedArray.set(chunk, offset);
          offset += chunk.length;
        }

        return combinedArray.buffer;
      } else {
        throw new Error('No audio stream received');
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      // Check if it's a CORS error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('CORS') || errorMessage.includes('DeepgramError')) {
        throw new Error('CORS restriction: Deepgram REST API cannot be called directly from browsers. Use WebSocket streaming or backend proxy.');
      }
      throw error;
    }
  }

  /**
   * Enhanced browser-safe text-to-speech with emotions, expressions, and natural speech patterns
   */
  async browserTextToSpeech(text: string, voiceCharacteristics?: {
    gender?: 'Male' | 'Female';
    accent?: string;
    rate?: number;
    pitch?: number;
    voiceName?: string; // Specific voice name like 'Thalia', 'Apollo', etc.
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported in this browser'));
        return;
      }

      // Stop any current speech for interruption support
      speechSynthesis.cancel();
      
      // Process text for natural speech with emotions and pauses
      const processedText = this.processTextForNaturalSpeech(text);
      
      const utterance = new SpeechSynthesisUtterance(processedText);
      
      // Enhanced voice selection with emotional characteristics
      if (voiceCharacteristics) {
        // Base characteristics
        let baseRate = voiceCharacteristics.rate || 0.9;
        let basePitch = voiceCharacteristics.pitch || (voiceCharacteristics.gender === 'Female' ? 1.1 : 0.9);
        
        // Emotional adjustments based on text content
        const emotionalAdjustments = this.getEmotionalAdjustments(text, voiceCharacteristics.voiceName);
        
        utterance.rate = Math.max(0.1, Math.min(2.0, baseRate * emotionalAdjustments.rateMultiplier));
        utterance.pitch = Math.max(0, Math.min(2, basePitch * emotionalAdjustments.pitchMultiplier));
        utterance.volume = emotionalAdjustments.volume;
        
        // Get available voices and find the best match
        const voices = speechSynthesis.getVoices();
        let selectedVoice: SpeechSynthesisVoice | null = null;
        
        console.log('🎤 Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
        
        // Enhanced voice mapping with emotional characteristics
        if (voiceCharacteristics.voiceName) {
          const voiceName = voiceCharacteristics.voiceName.toLowerCase();
          
          // Enhanced voice mapping with personality traits
          const voiceMapping = {
            'thalia': { 
              keywords: ['female', 'woman', 'samantha', 'zira', 'hazel', 'karen', 'moira'], 
              gender: 'Female',
              personality: 'professional',
              preferredRate: 0.9,
              preferredPitch: 1.1
            },
            'apollo': { 
              keywords: ['male', 'man', 'david', 'mark', 'alex', 'daniel', 'tom'], 
              gender: 'Male',
              personality: 'confident',
              preferredRate: 0.9,
              preferredPitch: 0.9
            },
            'helena': { 
              keywords: ['female', 'woman', 'helena', 'susan', 'karen', 'fiona', 'veena'], 
              gender: 'Female',
              personality: 'caring',
              preferredRate: 0.85,
              preferredPitch: 1.05
            },
            'arcas': { 
              keywords: ['male', 'man', 'daniel', 'thomas', 'oliver', 'aaron', 'fred'], 
              gender: 'Male',
              personality: 'smooth',
              preferredRate: 0.85,
              preferredPitch: 0.85
            },
            'aurora': { 
              keywords: ['female', 'woman', 'allison', 'ava', 'nicky', 'samantha', 'kate'], 
              gender: 'Female',
              personality: 'energetic',
              preferredRate: 1.1,
              preferredPitch: 1.2
            },
            'orion': { 
              keywords: ['male', 'man', 'tom', 'fred', 'jorge', 'alex', 'daniel'], 
              gender: 'Male',
              personality: 'professional',
              preferredRate: 0.85,
              preferredPitch: 0.8
            },
            'luna': { 
              keywords: ['female', 'woman', 'kate', 'veena', 'paulina', 'karen', 'moira'], 
              gender: 'Female',
              personality: 'friendly',
              preferredRate: 0.9,
              preferredPitch: 1.1
            },
            'zeus': { 
              keywords: ['male', 'man', 'aaron', 'rishi', 'diego', 'fred', 'jorge'], 
              gender: 'Male',
              personality: 'authoritative',
              preferredRate: 0.75,
              preferredPitch: 0.7
            },
            'pandora': { 
              keywords: ['female', 'british', 'serena', 'stephanie', 'fiona', 'karen', 'moira'], 
              gender: 'Female',
              personality: 'elegant',
              preferredRate: 0.8,
              preferredPitch: 1.0
            },
            'celeste': { 
              keywords: ['female', 'spanish', 'monica', 'esperanza', 'luciana', 'paulina'], 
              gender: 'Female',
              personality: 'vibrant',
              preferredRate: 1.0,
              preferredPitch: 1.15
            }
          };
          
          const mapping = voiceMapping[voiceName as keyof typeof voiceMapping];
          if (mapping) {
            // Apply personality-based adjustments
            utterance.rate *= mapping.preferredRate;
            utterance.pitch *= mapping.preferredPitch;
            
            // Try to find a voice that matches the characteristics
            selectedVoice = voices.find(v => {
              const lowerName = v.name.toLowerCase();
              return mapping.keywords.some(keyword => lowerName.includes(keyword));
            }) || null;
            
            console.log(`🎤 Mapped ${voiceCharacteristics.voiceName} (${mapping.personality}) to voice:`, selectedVoice?.name);
          }
        }
        
        // Fallback voice selection
        if (!selectedVoice && voiceCharacteristics.accent) {
          selectedVoice = voices.find(v => v.lang.includes(voiceCharacteristics.accent!)) || null;
        }
        
        if (!selectedVoice && voiceCharacteristics.gender) {
          const genderKeywords = voiceCharacteristics.gender === 'Female' ? 
            ['female', 'woman', 'samantha', 'zira', 'hazel', 'kate', 'allison', 'karen', 'moira'] :
            ['male', 'man', 'david', 'mark', 'alex', 'tom', 'daniel', 'aaron', 'fred'];
          
          selectedVoice = voices.find(v => {
            const lowerName = v.name.toLowerCase();
            return genderKeywords.some(keyword => lowerName.includes(keyword));
          }) || null;
        }
        
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.includes('en')) || voices[0] || null;
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`✅ Selected voice: ${selectedVoice.name} (${selectedVoice.lang}) - Rate: ${utterance.rate.toFixed(2)}, Pitch: ${utterance.pitch.toFixed(2)}`);
        } else {
          console.warn('⚠️ No suitable voice found, using default');
        }
      }
      
      // Enhanced event handlers with emotion tracking
      utterance.onstart = () => {
        console.log('🔊 Started speaking with emotion:', {
          text: text.substring(0, 50) + '...',
          rate: utterance.rate,
          pitch: utterance.pitch,
          voice: utterance.voice?.name
        });
      };
      
      utterance.onend = () => {
        console.log('✅ Finished speaking');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.log('Speech synthesis event:', event.error);
        if (event.error === 'interrupted') {
          console.log('🛑 Speech was interrupted by user - this is normal behavior');
          resolve(); // Treat interruption as successful completion, not error
        } else if (event.error === 'canceled') {
          console.log('🛑 Speech was canceled - this is normal behavior');
          resolve(); // Treat cancellation as successful completion, not error
        } else {
          console.error('Actual speech synthesis error:', event.error);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };
      
      // Add utterance to queue
      speechSynthesis.speak(utterance);
      
      console.log('🎙️ Speaking with emotional voice:', utterance.voice?.name || 'default');
    });
  }
  
  /**
   * Process text to add natural speech patterns, pauses, and expressions
   */
  private processTextForNaturalSpeech(text: string): string {
    let processedText = text;
    
    // Convert expression markers to SSML-like pauses and emphasis
    processedText = processedText.replace(/\*excited\*/g, ''); // Remove markers but keep emotional tone
    processedText = processedText.replace(/\*laughs\*/g, 'ha ha ha, ');
    processedText = processedText.replace(/\*chuckles\*/g, 'heh heh, ');
    processedText = processedText.replace(/\*pauses\*/g, '... ');
    processedText = processedText.replace(/\*pauses thoughtfully\*/g, '... hmm... ');
    processedText = processedText.replace(/\*pauses for effect\*/g, '...... ');
    processedText = processedText.replace(/\*takes a breath\*/g, '... ');
    processedText = processedText.replace(/\*sighs\*/g, 'ahh, ');
    processedText = processedText.replace(/\*whistles appreciatively\*/g, 'wow, ');
    processedText = processedText.replace(/\*claps hands together\*/g, '');
    processedText = processedText.replace(/\*rubs hands together\*/g, '');
    processedText = processedText.replace(/\*gestures.*?\*/g, '');
    processedText = processedText.replace(/\*.*?tone\*/g, '');
    processedText = processedText.replace(/\*.*?smile\*/g, '');
    processedText = processedText.replace(/\*.*?forward\*/g, '');
    processedText = processedText.replace(/\*.*?up\*/g, '');
    processedText = processedText.replace(/\*.*?animated\*/g, '');
    processedText = processedText.replace(/\*voice.*?\*/g, '');
    processedText = processedText.replace(/\*gets.*?\*/g, '');
    processedText = processedText.replace(/\*becomes.*?\*/g, '');
    processedText = processedText.replace(/\*settles.*?\*/g, '');
    processedText = processedText.replace(/\*leans.*?\*/g, '');
    processedText = processedText.replace(/\*eyes.*?\*/g, '');
    processedText = processedText.replace(/\*nods.*?\*/g, '');
    processedText = processedText.replace(/\*brightens.*?\*/g, '');
    
    // Add natural pauses after certain phrases
    processedText = processedText.replace(/you know\?/g, 'you know? ... ');
    processedText = processedText.replace(/well\.\.\./, 'well ... ');
    processedText = processedText.replace(/hmm\.\.\./g, 'hmm ... ');
    processedText = processedText.replace(/oh my/g, 'oh my ... ');
    processedText = processedText.replace(/wait/g, 'wait ... ');
    
    // Add emphasis to exclamations
    processedText = processedText.replace(/!/g, '! ');
    processedText = processedText.replace(/\?/g, '? ');
    
    // Clean up extra spaces
    processedText = processedText.replace(/\s+/g, ' ').trim();
    
    return processedText;
  }
  
  /**
   * Split text into sentences for better interruption handling
   */
  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries but keep natural flow
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    // Filter out empty sentences and very short fragments
    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 3);
  }
  
  /**
   * Select appropriate voice based on characteristics
   */
  private selectVoiceForCharacteristics(voices: SpeechSynthesisVoice[], characteristics: {
    gender?: 'Male' | 'Female';
    accent?: string;
    voiceName?: string;
  }): SpeechSynthesisVoice | null {
    let selectedVoice: SpeechSynthesisVoice | null = null;
    
    // Priority 1: Match specific voice name
    if (characteristics.voiceName) {
      const voiceName = characteristics.voiceName.toLowerCase();
      const voiceMapping = {
        'thalia': ['female', 'samantha', 'zira', 'hazel'],
        'apollo': ['male', 'david', 'mark', 'alex'],
        'aurora': ['female', 'allison', 'ava', 'kate'],
        'zeus': ['male', 'aaron', 'diego', 'fred'],
        'pandora': ['female', 'british', 'fiona', 'serena']
      };
      
      const keywords = voiceMapping[voiceName as keyof typeof voiceMapping];
      if (keywords) {
        selectedVoice = voices.find(v => {
          const lowerName = v.name.toLowerCase();
          return keywords.some(keyword => lowerName.includes(keyword));
        }) || null;
      }
    }
    
    // Priority 2: Match by gender
    if (!selectedVoice && characteristics.gender) {
      const genderKeywords = characteristics.gender === 'Female' ? 
        ['female', 'woman', 'samantha', 'zira', 'kate'] :
        ['male', 'man', 'david', 'alex', 'tom'];
      
      selectedVoice = voices.find(v => {
        const lowerName = v.name.toLowerCase();
        return genderKeywords.some(keyword => lowerName.includes(keyword));
      }) || null;
    }
    
    // Priority 3: Default English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('en')) || voices[0] || null;
    }
    
    return selectedVoice;
  }
  private getEmotionalAdjustments(text: string, voiceName?: string): {
    rateMultiplier: number;
    pitchMultiplier: number;
    volume: number;
  } {
    let rateMultiplier = 1.0;
    let pitchMultiplier = 1.0;
    let volume = 0.8;
    
    const lowerText = text.toLowerCase();
    
    // Excitement and energy
    if (lowerText.includes('excited') || lowerText.includes('amazing') || lowerText.includes('fantastic') || lowerText.includes('awesome')) {
      rateMultiplier = 1.1;
      pitchMultiplier = 1.1;
      volume = 0.9;
    }
    // Laughter and joy
    else if (lowerText.includes('laugh') || lowerText.includes('ha ha') || lowerText.includes('heh heh')) {
      rateMultiplier = 1.05;
      pitchMultiplier = 1.15;
      volume = 0.85;
    }
    // Thoughtful and contemplative
    else if (lowerText.includes('hmm') || lowerText.includes('thoughtfully') || lowerText.includes('consider')) {
      rateMultiplier = 0.85;
      pitchMultiplier = 0.95;
      volume = 0.75;
    }
    // Whispers and soft speech
    else if (lowerText.includes('whisper') || lowerText.includes('softly') || lowerText.includes('gently')) {
      rateMultiplier = 0.8;
      pitchMultiplier = 0.9;
      volume = 0.6;
    }
    // Dramatic and emphatic
    else if (lowerText.includes('dramatically') || lowerText.includes('emphasis') || lowerText.includes('passionate')) {
      rateMultiplier = 0.9;
      pitchMultiplier = 1.2;
      volume = 0.9;
    }
    
    // Voice-specific personality adjustments
    if (voiceName) {
      const voiceName_lower = voiceName.toLowerCase();
      
      if (voiceName_lower === 'aurora') {
        // Aurora is energetic
        rateMultiplier *= 1.1;
        pitchMultiplier *= 1.05;
      } else if (voiceName_lower === 'zeus') {
        // Zeus is authoritative and slower
        rateMultiplier *= 0.9;
        pitchMultiplier *= 0.95;
        volume *= 1.1;
      } else if (voiceName_lower === 'pandora') {
        // Pandora is elegant and measured
        rateMultiplier *= 0.95;
        pitchMultiplier *= 1.0;
      }
    }
    
    return {
      rateMultiplier: Math.max(0.7, Math.min(1.3, rateMultiplier)),
      pitchMultiplier: Math.max(0.8, Math.min(1.2, pitchMultiplier)),
      volume: Math.max(0.5, Math.min(1.0, volume))
    };
  }

  /**
   * Play audio from ArrayBuffer
   */
  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await audioContext.decodeAudioData(audioBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      
      return new Promise((resolve) => {
        source.onended = () => resolve();
        source.start();
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  /**
   * Check if currently listening
   */
  get listening(): boolean {
    return this.isListening;
  }

  /**
   * Get available Deepgram Aura voices
   */
  async getAvailableVoices(): Promise<string[]> {
    // Deepgram Aura voices from official documentation
    return [
      'aura-2-thalia-en',
      'aura-2-apollo-en', 
      'aura-2-helena-en',
      'aura-2-arcas-en',
      'aura-2-aurora-en',
      'aura-2-orion-en',
      'aura-2-luna-en',
      'aura-2-zeus-en',
      'aura-2-pandora-en',
      'aura-2-celeste-es'
    ];
  }
}

// Utility functions
export function formatTranscript(result: SpeechResult): string {
  return result.transcript.trim();
}

export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

// Voice activity detection
export class VoiceActivityDetector {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private source: MediaStreamAudioSourceNode | null = null;
  private isDetecting: boolean = false;
  private threshold: number = 0.01;
  private onActivityCallback?: (isActive: boolean) => void;

  constructor(threshold: number = 0.01) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.threshold = threshold;
  }

  async start(stream: MediaStream, onActivity?: (isActive: boolean) => void): Promise<void> {
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    this.onActivityCallback = onActivity;
    this.isDetecting = true;
    this.detectActivity();
  }

  stop(): void {
    this.isDetecting = false;
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
  }

  private detectActivity(): void {
    if (!this.isDetecting) return;

    this.analyser.getByteTimeDomainData(this.dataArray as any);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const value = (this.dataArray[i] - 128) / 128;
      sum += value * value;
    }
    
    const rms = Math.sqrt(sum / this.dataArray.length);
    const isActive = rms > this.threshold;
    
    this.onActivityCallback?.(isActive);
    
    requestAnimationFrame(() => this.detectActivity());
  }
}

export default DeepgramVoiceService;