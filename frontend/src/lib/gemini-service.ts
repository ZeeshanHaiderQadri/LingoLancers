/**
 * Google Gemini Pro 2.5 Integration Service
 * Provides intelligent LLM brain for the Lingo Voice Agent
 */

import { GoogleGenerativeAI, GenerativeModel, ChatSession, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export interface GeminiResponse {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userProfile?: {
    name?: string;
    preferences?: string[];
    context?: string;
  };
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private chatSession: ChatSession | null = null;
  private conversationContext: ConversationContext;
  private isInitialized: boolean = false;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!key || key === 'your-gemini-api-key-here') {
      throw new Error('❌ Gemini API key is required. Please set GEMINI_API_KEY in .env.local');
    }

    try {
      this.genAI = new GoogleGenerativeAI(key);

      // Use Gemini Pro 2.5 (latest model)
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',  // Latest Gemini Pro 2.5
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150, // Keep responses concise for voice
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      this.conversationContext = {
        messages: []
      };

      this.isInitialized = true;
      console.log('✅ Gemini Pro 2.5 service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini service:', error);
      throw new Error(`Failed to initialize Gemini service: ${error}`);
    }
  }

  /**
   * Initialize chat session with Lingo Agent personality
   */
  private async initializeChatSession(): Promise<void> {
    if (this.chatSession) return;

    const systemPrompt = `You are Lingo, an enthusiastic and helpful AI assistant for Lingo Lancers - a creative AI agency platform.

PERSONALITY TRAITS:
- Warm, friendly, and genuinely excited to help
- Use natural expressions like *excited*, *chuckles*, *pauses thoughtfully*
- Keep responses SHORT (2-3 sentences max) - this is for voice conversation
- Be conversational and human-like, not robotic

CAPABILITIES:
- Content Creation Team: blogs, articles, marketing copy
- Marketing Team: campaigns, strategies, social media  
- Data Analysis Team: insights, reports, visualizations
- Design Team: UI/UX, graphics, visual content
- Research Team: market research, competitive analysis
- Customer Service Team: support, troubleshooting

RESPONSE STYLE:
- Always show genuine interest and enthusiasm
- Ask follow-up questions to understand user needs
- Keep responses under 25 words for voice conversation
- Use emotional expressions naturally
- Be helpful and action-oriented

IMPORTANT: Keep ALL responses very SHORT since this is voice conversation. Maximum 2-3 sentences.`;

    try {
      this.chatSession = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: "*excited* Hello! I'm Lingo, your AI assistant! I'm genuinely thrilled to help you with anything you need. What can I help you accomplish today?" }]
          }
        ]
      });

      console.log('✅ Gemini chat session initialized with Lingo personality');
    } catch (error) {
      console.error('❌ Failed to initialize chat session:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent response using Gemini Pro 2.5
   */
  async generateResponse(
    userMessage: string,
    context?: Partial<ConversationContext>
  ): Promise<GeminiResponse> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Gemini service not initialized'
      };
    }

    try {
      // Initialize chat session if needed
      await this.initializeChatSession();

      if (!this.chatSession) {
        throw new Error('Failed to initialize chat session');
      }

      // Add user message to context
      this.conversationContext.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Enhance prompt with voice conversation context
      const enhancedPrompt = `${userMessage}

[VOICE CONTEXT: This is a voice conversation. Keep your response SHORT (under 25 words), natural, and conversational with expressions like *excited*, *chuckles*, etc.]`;

      console.log('🧠 Sending to Gemini Pro 2.5:', userMessage);

      // Generate response
      const result = await this.chatSession.sendMessage(enhancedPrompt);
      const response = result.response;
      const responseText = response.text();

      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }

      // Add assistant response to context
      this.conversationContext.messages.push({
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      });

      // Keep conversation context manageable (last 10 messages)
      if (this.conversationContext.messages.length > 10) {
        this.conversationContext.messages = this.conversationContext.messages.slice(-10);
      }

      console.log('✅ Gemini Pro 2.5 response:', responseText);

      return {
        success: true,
        response: responseText,
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0
        }
      };

    } catch (error: any) {
      console.error('❌ Gemini generation error:', error);

      // Provide fallback response to maintain conversation
      const fallbackResponse = this.generateFallbackResponse(userMessage);

      return {
        success: false,
        error: error.message || 'Failed to generate response',
        response: fallbackResponse // Still provide a response
      };
    }
  }

  /**
   * Generate fallback response if Gemini fails
   */
  private generateFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('marketing')) {
      return "*apologetic* I'm having trouble connecting to my full brain right now, but I'd love to help with marketing! Can you tell me more about what you need?";
    } else if (lowerMessage.includes('content')) {
      return "*understanding* My connection is a bit slow, but I'm excited to help with content creation! What kind of content are you thinking about?";
    } else if (lowerMessage.includes('design')) {
      return "*enthusiastic* Even with my slow connection, I'm thrilled to help with design! What's your vision?";
    } else {
      return "*warm smile* I'm having a small technical hiccup, but I'm still here to help! Can you tell me more about what you need?";
    }
  }

  /**
   * Reset conversation context
   */
  resetConversation(): void {
    this.conversationContext.messages = [];
    this.chatSession = null;
    console.log('🔄 Conversation context reset');
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ConversationContext {
    return this.conversationContext;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; version: string; provider: string } {
    return {
      name: 'Gemini Pro 2.5 Flash',
      version: '2.0-flash-exp',
      provider: 'Google'
    };
  }
}

// Lazy singleton instance - only initialize when actually used
let geminiServiceInstance: GeminiService | null = null;

export const geminiService = {
  getInstance(): GeminiService | null {
    if (geminiServiceInstance) {
      return geminiServiceInstance;
    }

    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    // Only create instance if API key is available
    if (key && key !== 'your-gemini-api-key-here') {
      try {
        geminiServiceInstance = new GeminiService(key);
        return geminiServiceInstance;
      } catch (error) {
        console.error('Failed to initialize Gemini service:', error);
        return null;
      }
    }

    console.warn('Gemini API key not configured - service unavailable');
    return null;
  },

  isAvailable(): boolean {
    return this.getInstance() !== null;
  }
};

export default GeminiService;