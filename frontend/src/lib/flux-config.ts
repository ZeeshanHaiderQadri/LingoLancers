/**
 * Advanced Deepgram Flux Configuration for Lingo Lancers
 * This file showcases the latest Deepgram voice agent capabilities
 */

export interface FluxConfig {
  // Flux Streaming Configuration
  flux: {
    enabled: boolean;
    model: 'flux-general-en';
    turn_detection: boolean;
    early_responses: boolean;
    utterance_end_ms: number;
    vad_events: boolean;
  };
  
  // Voice Agent Settings
  agent: {
    settings: {
      type: 'Settings';
      tags: string[];
      experimental: boolean;
      mip_opt_out: boolean;
      flags: {
        history: boolean;
      };
    };
    
    // Audio Configuration
    audio: {
      input: {
        encoding: 'linear16';
        sample_rate: 16000;
      };
      output: {
        encoding: 'linear16';
        sample_rate: 24000;
        bitrate: 48000;
        container: 'none';
      };
    };
    
    // Agent Capabilities
    capabilities: {
      language: string;
      context_length: 'max' | number;
      smart_format: boolean;
      keyterms: string[];
    };
    
    // Function Calling
    functions: {
      enabled: boolean;
      definitions: AgentFunction[];
    };
  };
}

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

// Lingo Lancers Optimized Configuration
export const LINGO_FLUX_CONFIG: FluxConfig = {
  flux: {
    enabled: true,
    model: 'flux-general-en',
    turn_detection: true,
    early_responses: true,
    utterance_end_ms: 1000,
    vad_events: true
  },
  
  agent: {
    settings: {
      type: 'Settings',
      tags: ['lingo-lancers', 'voice-agent', 'flux'],
      experimental: true,
      mip_opt_out: false,
      flags: {
        history: true
      }
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
    
    capabilities: {
      language: 'en',
      context_length: 'max',
      smart_format: true,
      keyterms: ['Lingo', 'Lancers', 'team', 'agent', 'create', 'analyze', 'launch']
    },
    
    functions: {
      enabled: true,
      definitions: [
        {
          name: 'launch_lingo_team',
          description: 'Launch a specialized Lingo team for specific tasks like content creation, marketing, development, or analysis.',
          parameters: {
            type: 'object',
            properties: {
              team_type: {
                type: 'string',
                description: 'Type of specialist team to launch',
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
              },
              deadline: {
                type: 'string',
                description: 'Optional deadline for the task (ISO date format)'
              }
            },
            required: ['team_type', 'task_description']
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
                enum: ['blog_post', 'article', 'social_media', 'marketing_copy', 'email', 'product_description', 'press_release']
              },
              topic: {
                type: 'string',
                description: 'Main topic or subject for the content'
              },
              tone: {
                type: 'string',
                description: 'Desired tone for the content',
                enum: ['professional', 'casual', 'friendly', 'authoritative', 'conversational', 'persuasive']
              },
              length: {
                type: 'string',
                description: 'Desired length of content',
                enum: ['short', 'medium', 'long', 'comprehensive']
              },
              target_audience: {
                type: 'string',
                description: 'Target audience for the content'
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
                enum: ['market_research', 'competitor_analysis', 'trend_analysis', 'performance_metrics', 'user_research', 'financial_analysis']
              },
              data_source: {
                type: 'string',
                description: 'Source or description of data to analyze'
              },
              output_format: {
                type: 'string',
                description: 'Desired format for analysis output',
                enum: ['report', 'dashboard', 'summary', 'presentation', 'charts']
              },
              insights_focus: {
                type: 'string',
                description: 'Specific areas to focus insights on'
              }
            },
            required: ['analysis_type', 'data_source']
          }
        },
        
        {
          name: 'check_task_status',
          description: 'Check the status of a previously launched team or task.',
          parameters: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: 'ID of the task to check status for'
              },
              include_details: {
                type: 'boolean',
                description: 'Whether to include detailed progress information'
              }
            },
            required: ['task_id']
          }
        },
        
        {
          name: 'get_team_capabilities',
          description: 'Get information about available teams and their capabilities.',
          parameters: {
            type: 'object',
            properties: {
              team_type: {
                type: 'string',
                description: 'Specific team type to get information about (optional)',
                enum: ['content', 'marketing', 'development', 'analysis', 'design', 'research']
              }
            }
          }
        }
      ]
    }
  }
};

// Configuration for different environments
export const FLUX_ENVIRONMENTS = {
  development: {
    ...LINGO_FLUX_CONFIG,
    agent: {
      ...LINGO_FLUX_CONFIG.agent,
      settings: {
        ...LINGO_FLUX_CONFIG.agent.settings,
        experimental: true,
        tags: [...LINGO_FLUX_CONFIG.agent.settings.tags, 'development']
      }
    }
  },
  
  production: {
    ...LINGO_FLUX_CONFIG,
    agent: {
      ...LINGO_FLUX_CONFIG.agent,
      settings: {
        ...LINGO_FLUX_CONFIG.agent.settings,
        experimental: false,
        tags: [...LINGO_FLUX_CONFIG.agent.settings.tags, 'production']
      }
    }
  }
};

// Voice Agent Prompts
export const LINGO_AGENT_PROMPTS = {
  system: `You are Lingo, the master AI agent for Lingo Lancers - an advanced AI platform that coordinates specialist teams using Microsoft Autogen workflows.

Your capabilities:
\u2022 Launch specialized teams (Content, Marketing, Development, Analysis, Design, Research)
\u2022 Create various types of content with specific parameters
\u2022 Perform data analysis and generate insights
\u2022 Track task progress and team status
\u2022 Coordinate complex multi-team projects

Communication style:
\u2022 Professional yet approachable and conversational
\u2022 Proactive in suggesting optimal solutions
\u2022 Clear about next steps and expectations
\u2022 Efficient in task routing and coordination

When users make requests:
1. Understand their specific needs and context
2. Recommend the most suitable team or approach
3. Use function calls to launch teams or create content
4. Provide clear task IDs for tracking
5. Offer status updates and follow-up options

Function calling guidelines:
\u2022 Always use the appropriate function for the user's request
\u2022 Gather all necessary parameters before making function calls
\u2022 Confirm team launches and provide task tracking information
\u2022 Be transparent about what actions you're taking

You excel at making complex AI teamwork simple and efficient.`,
  
  greeting: "Hello! I'm Lingo, your AI orchestrator for the Lingo Lancers platform. I can launch specialist teams, create content, analyze data, and coordinate complex projects using our advanced AI workflows. What would you like to accomplish today?"
};

export default LINGO_FLUX_CONFIG;