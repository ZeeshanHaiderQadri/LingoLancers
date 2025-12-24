"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Mic, Sparkles, PenSquare, Plane, X, Paperclip, Send, Share2, FileText, Code2, Image as ImageIcon, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LancersAgentsDropdown } from "@/components/lancers-agents-dropdown";
import { ConnectAppsDropdown } from "@/components/connect-apps-dropdown";

interface Message {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  intent?: string;
  extracted_data?: any;
  suggestionCards?: SuggestionCard[];  // ✅ NEW
}

// ✅ NEW interface
interface SuggestionCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: "navigate" | "start_workflow";
  destination?: string;
  data?: any;
}

interface TeamCard {
  name: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

export default function UnifiedChatInterface() {
  // Default welcome message
  const getDefaultMessages = (): Message[] => [
    {
      id: "welcome",
      role: "agent",
      content: "Welcome to LingoLancers! I'm your AI assistant. I can help you with blog writing, travel planning, and much more. What would you like to do today?",
      timestamp: new Date(),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(getDefaultMessages());

  // Load chat history from localStorage on client side only
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lingo_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const loadedMessages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
  }, []);

  // Clear chat function
  const clearChat = async () => {
    // Reset backend conversation state
    try {
      const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/lingo/reset`, {
        method: 'POST',
      });
      console.log("🔄 Backend conversation state reset");
    } catch (error) {
      console.error("❌ Failed to reset backend state:", error);
    }

    // Reset frontend state
    const welcomeMessage: Message = {
      id: "welcome",
      role: "agent",
      content: "Welcome to LingoLancers! I'm your AI assistant. I can help you with blog writing, travel planning, and much more. What would you like to do today?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    localStorage.removeItem("lingo_chat_history");
    setDetectedIntent(null);
    console.log("🗑️ Chat cleared");
  };
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // ✅ NEW: Handle suggestion card clicks
  const handleCardClick = (card: SuggestionCard) => {
    console.log("🎯 Card clicked:", card);

    if (card.action === "navigate") {
      // Store data in sessionStorage for the destination page
      if (card.data) {
        sessionStorage.setItem("agent_extracted_data", JSON.stringify(card.data));
        sessionStorage.setItem(`${card.destination}_data`, JSON.stringify(card.data));
      }

      // Navigate to the destination
      window.dispatchEvent(
        new CustomEvent("navigate", {
          detail: {
            route: card.destination,
            data: card.data
          }
        })
      );

      // Add confirmation message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: `Opening ${card.title} for you now...`,
          timestamp: new Date()
        }
      ]);
    }
  };

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8000';
      const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const websocket = new WebSocket(`${wsUrl}/api/lingo/ws`);

      websocket.onopen = () => {
        console.log("✅ Connected to Lingo Agent");
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📨 Received:", data);

        // Always clear loading state when we receive any message (except heartbeats)
        if (data.type !== "pong" && data.type !== "heartbeat" && data.type !== "heartbeat_response") {
          setIsLoading(false);
        }

        // ✅ NEW: Handle suggestion cards
        if (data.type === "show_suggestion_cards") {
          console.log("📋 Showing suggestion cards:", data.cards);
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "agent",
              content: data.message,
              timestamp: new Date(),
              suggestionCards: data.cards
            }
          ]);
          return;
        }

        if (data.type === "navigate") {
          // Handle navigation events with data
          console.log("🧭 Navigation:", data.destination, data.data);

          // Store extracted data in sessionStorage for the destination page
          if (data.data) {
            sessionStorage.setItem("agent_extracted_data", JSON.stringify(data.data));
          }

          // If this is automatic navigation, do it immediately
          if (data.auto) {
            console.log("🚀 Auto-navigating to:", data.destination);
            // Small delay to let user see the message
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("navigate", {
                  detail: {
                    route: data.destination,
                    data: data.data
                  },
                })
              );
            }, 1000); // 1 second delay
          } else {
            // Manual navigation (from clicking card)
            window.dispatchEvent(
              new CustomEvent("navigate", {
                detail: {
                  route: data.destination,
                  data: data.data
                },
              })
            );
          }
        } else if (data.type === "start_workflow" || data.type === "workflow_started") {
          console.log("🚀 Workflow started:", data.workflow_type, data.data);

          // Store workflow data
          if (data.data) {
            sessionStorage.setItem("workflow_data", JSON.stringify(data.data));
            sessionStorage.setItem(`${data.workflow_type}_workflow_data`, JSON.stringify(data.data));
          }

          // Add success message
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "agent",
              content: `🎉 ${data.workflow_type.charAt(0).toUpperCase() + data.workflow_type.slice(1)} workflow started! Watch the progress on the right →`,
              timestamp: new Date(),
              intent: data.workflow_type,
            },
          ]);

          // Dispatch event to trigger split-screen (instead of navigating away)
          console.log('🚀 Dispatching workflow-started event:', {
            workflowId: data.workflow_id,
            type: data.workflow_type
          });

          window.dispatchEvent(new CustomEvent('workflow-started', {
            detail: {
              workflowId: data.workflow_id,
              type: data.workflow_type,
              data: data.data
            }
          }));
        } else if (data.type === "ui_update") {
          // Handle UI updates from agent
          console.log("🔄 UI Update:", data.data);
          if (data.data.message) {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "agent",
                content: data.data.message,
                timestamp: new Date(),
                intent: data.data.intent,
                extracted_data: data.data.extracted_data, // Store extracted data from backend!
              },
            ]);

            // Speak the response!
            speakWithAzure(data.data.message);

            if (data.data.intent) {
              setDetectedIntent(data.data.intent);
            }
            console.log("💾 Stored message with extracted_data:", data.data.extracted_data);
          }
        } else if (data.type === "chat_message") {
          // Handle direct chat messages from backend
          console.log("💬 Chat Message:", data);
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: data.role === "assistant" ? "agent" : data.role,
              content: data.content,
              timestamp: new Date(data.timestamp ? data.timestamp * 1000 : Date.now()),
              intent: data.intent,
            },
          ]);
          if (data.intent) {
            setDetectedIntent(data.intent);
          }
        } else if (data.type === "pong") {
          // Heartbeat response
          console.log("💓 Pong received");
        }
      };

      websocket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
      };

      websocket.onclose = () => {
        console.log("🔌 Disconnected from Lingo Agent");
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem("lingo_chat_history", JSON.stringify(messages));
    } catch (e) {
      console.error("Error saving chat history:", e);
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Send via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "text_input",
          text: input,
        })
      );
    } else {
      // Fallback: show error
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: "Connection lost. Reconnecting...",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("📎 File selected:", file.name);

      // Add file attachment message
      const fileMessage: Message = {
        id: crypto.randomUUID(),
        role: "system",
        content: `📎 Attached file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fileMessage]);
    }
  };

  // Azure TTS helper function
  const speakWithAzure = async (text: string) => {
    if (!text) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8000';
      console.log('🔊 Calling Azure TTS:', `${apiUrl}/api/voice/tts`);

      const response = await fetch(`${apiUrl}/api/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: "en-US-AriaNeural", // Default voice
          language: "en-US",
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play();
      }
    } catch (error) {
      console.error('❌ Azure TTS error:', error);
    }
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsListening(true);
      console.log("🎤 Voice recognition started...");
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      setInput(transcript);

      if (event.results[0].isFinal) {
        handleSend(); // Auto-send on final result
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsListening(false);
      console.log("🎤 Voice recognition ended");
    };

    recognition.start();
  };

  const stopVoiceRecording = () => {
    // SpeechRecognition stops automatically, but we can force it if needed
    // This is kept for compatibility with the toggle function
    setIsRecording(false);
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleAgentSelect = (agentId: string) => {
    console.log("🎯 Selected agent:", agentId);
    setSelectedAgent(agentId);

    // Add agent selection message to chat
    const agentSelectionMessage: Message = {
      id: crypto.randomUUID(),
      role: "system",
      content: `Selected: ${agentId.charAt(0).toUpperCase() + agentId.slice(1)} Agent`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, agentSelectionMessage]);

    // Send agent selection to backend with request for form questions
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "agent_selected",
          agent_id: agentId,
          request_form_questions: true, // Request form questions
        })
      );

      // Add loading state
      setIsLoading(true);

      // Add welcome message based on agent type
      const welcomeMessages = {
        blog: "Perfect! I'll help you create an amazing blog article. Let me ask you a few questions to get started.",
        travel: "Excellent! I'll help you plan your perfect trip. Let me gather some details to create the best itinerary for you.",
        social: "Great choice! I'll help you create engaging social media content. Let's collect some information first.",
        avatar: "Awesome! I'll help you create stunning avatars. Let me ask a few questions to understand your vision.",
        product: "Perfect! I'll help you write compelling product descriptions. Let's start with some details.",
        web: "Excellent! I'll help you design a beautiful website. Let me understand your requirements first.",
        marketing: "Great! I'll help you create effective marketing campaigns. Let's gather the necessary information.",
        code: "Perfect! I'll help you with your coding needs. Let me understand what you're looking to build."
      };

      const welcomeMessage = welcomeMessages[agentId as keyof typeof welcomeMessages] ||
        "Great! I'll help you with your request. Let me ask a few questions to get started.";

      // Add welcome message after a short delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "agent",
            content: welcomeMessage,
            timestamp: new Date(),
            intent: agentId,
          },
        ]);
        setDetectedIntent(agentId);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleAppSelect = (appId: string) => {
    console.log("Selected app:", appId);
    if (!selectedApps.includes(appId)) {
      setSelectedApps(prev => [...prev, appId]);
    }
  };

  const removeApp = (appId: string) => {
    setSelectedApps(prev => prev.filter(id => id !== appId));
  };

  // Handle navigation from backend
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { route, data } = event.detail;
      console.log("🧭 Navigating to:", route, data);

      // Store data if provided
      if (data) {
        sessionStorage.setItem("agent_extracted_data", JSON.stringify(data));
      }

      // Use the navigation callback from lingoAPI
      if (typeof window !== 'undefined') {
        // Trigger navigation through the existing system
        const navEvent = new CustomEvent('lingo-navigate', {
          detail: { route, data }
        });
        window.dispatchEvent(navEvent);
      }
    };

    window.addEventListener('navigate' as any, handleNavigate);
    return () => {
      window.removeEventListener('navigate' as any, handleNavigate);
    };
  }, []);

  // Listen for voice agent messages
  useEffect(() => {
    const handleUserMessage = (event: CustomEvent) => {
      const { message } = event.detail;
      console.log("🎤 Received voice user message:", message);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: message,
          timestamp: new Date(),
        },
      ]);
    };

    const handleAgentMessage = (event: CustomEvent) => {
      const { message } = event.detail;
      console.log("🤖 Received voice agent message:", message);

      // Check if this message is already the last one (to avoid duplicates if using same websocket)
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "agent" && lastMsg.content === message) {
          return prev;
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "agent",
            content: message,
            timestamp: new Date(),
          },
        ];
      });
    };

    window.addEventListener('lingo-user-message' as any, handleUserMessage);
    window.addEventListener('lingo-agent-message' as any, handleAgentMessage);

    return () => {
      window.removeEventListener('lingo-user-message' as any, handleUserMessage);
      window.removeEventListener('lingo-agent-message' as any, handleAgentMessage);
    };
  }, []);

  // Dynamic team cards based on intent - CONTEXT-AWARE!
  const getTeamCards = (): TeamCard[] => {
    const cards: TeamCard[] = [];

    // Get the MOST RECENT intent from messages (not all intents)
    const recentMessages = messages.slice(-5); // Look at last 5 messages only
    const recentIntent = [...recentMessages].reverse().find(m => m.intent)?.intent || detectedIntent;

    console.log('🎯 Context-aware cards - Recent Intent:', recentIntent);
    console.log('📊 Last 5 message intents:', recentMessages.map(m => m.intent).filter(Boolean));

    if (recentIntent === "blog") {
      cards.push({
        name: "Blog Writing Team",
        icon: <PenSquare className="h-5 w-5" />,
        description: "Create professional blog articles with AI",
        action: () => {
          console.log("📝 Blog Team card clicked");

          // Get the LAST message with extracted_data from backend
          const blogMessages = messages.filter(m => m.intent === "blog");
          const lastMessageWithData = [...blogMessages].reverse().find(m => m.extracted_data && Object.keys(m.extracted_data).length > 0);

          let extractedData: any = {};

          if (lastMessageWithData && lastMessageWithData.extracted_data) {
            // Use backend's extracted data (most reliable)
            console.log("✅ Using backend extracted data:", lastMessageWithData.extracted_data);
            extractedData = {
              topic: lastMessageWithData.extracted_data.topic || "",
              seo_keywords: lastMessageWithData.extracted_data.keywords || [],
              tone: lastMessageWithData.extracted_data.tone || "professional",
              target_word_count: lastMessageWithData.extracted_data.length || 1500,
              reference_urls: [],
              additional_instructions: ""
            };
          } else {
            // Fallback: extract from message content
            console.log("⚠️ No backend data, extracting from messages");
            const topicMessage = blogMessages.find(m => m.role === "user");
            if (topicMessage) {
              extractedData.topic = topicMessage.content.replace(/write a blog about/i, "").trim();
            }
          }

          console.log("📦 Final extracted data:", extractedData);

          // Store data for the form
          sessionStorage.setItem("blog_form_data", JSON.stringify(extractedData));
          sessionStorage.setItem("agent_extracted_data", JSON.stringify(extractedData));
          sessionStorage.setItem("blog_team_view", "create"); // Open directly to create form

          console.log("🎯 Navigating to blog team with view=create");

          // Navigate to blog team
          window.dispatchEvent(
            new CustomEvent("lingo-navigate", {
              detail: {
                route: "blog-team",
                data: extractedData,
                view: "create" // Pass view parameter
              },
            })
          );
        },
      });
    }

    if (recentIntent === "travel") {
      console.log('✈️ Adding Travel Planning Team card');
      cards.push({
        name: "Travel Planning Team",
        icon: <Plane className="h-5 w-5" />,
        description: "Plan your perfect trip with AI assistance",
        action: async () => {
          console.log("✈️ Travel Team card clicked");

          // Get the LAST message with extracted_data from backend
          const travelMessages = messages.filter(m => m.intent === "travel");
          const lastMessageWithData = [...travelMessages].reverse().find(m => m.extracted_data && Object.keys(m.extracted_data).length > 0);

          let extractedData: any = {};

          if (lastMessageWithData && lastMessageWithData.extracted_data) {
            // Use backend's extracted data
            console.log("✅ Using backend extracted data:", lastMessageWithData.extracted_data);
            extractedData = lastMessageWithData.extracted_data;
          } else {
            // Fallback: extract from message content
            console.log("⚠️ No backend data, extracting from messages");
            const destinationMessage = travelMessages.find(m => m.role === "user");
            if (destinationMessage) {
              extractedData.destination = destinationMessage.content;
            }
          }

          console.log("📦 Travel extracted data:", extractedData);

          // Create travel workflow using dedicated API (like Blog team)
          const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8001';

          const travelData = {
            destination: extractedData.destination || extractedData.to || "Paris",
            departure: extractedData.from || extractedData.departure || "",
            duration: extractedData.duration || "7 days",
            travelers: extractedData.travelers || "2 adults",
            budget: extractedData.budget || "$2500",
            preferences: extractedData.preferences || ""
          };

          console.log("🚀 Creating travel workflow:", travelData);

          try {
            const response = await fetch(`${apiUrl}/api/travel/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(travelData)
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ Travel workflow created:", result);

            if (result.workflow_id) {
              // Dispatch workflow-started event to trigger split-screen
              window.dispatchEvent(
                new CustomEvent("workflow-started", {
                  detail: {
                    workflowId: result.workflow_id,
                    type: "travel"
                  }
                })
              );

              console.log("🎯 Travel workflow started in split-screen:", result.workflow_id);
            }
          } catch (error) {
            console.error("❌ Error creating travel workflow:", error);
            // Fallback to navigation
            window.dispatchEvent(
              new CustomEvent("lingo-navigate", {
                detail: { route: "travel-team" },
              })
            );
          }
        },
      });
    }

    // Social Media Suite - only show if social media intent detected
    if (recentIntent === "social") {
      console.log('📱 Adding Social Media Suite card');
      cards.push({
        name: "AI Social Media Suite",
        icon: <Share2 className="h-5 w-5" />,
        description: "Create and schedule social media content",
        action: () => {
          console.log("📱 Social Media Suite card clicked");
          window.dispatchEvent(
            new CustomEvent("lingo-navigate", {
              detail: { route: "social" },
            })
          );
        },
      });
    }

    // Content Creation - only show if content/writing intent detected
    if (recentIntent === "content" || recentIntent === "writing") {
      console.log('✍️ Adding AI Content card');
      cards.push({
        name: "AI Content",
        icon: <FileText className="h-5 w-5" />,
        description: "Write, edit, and optimize any content",
        action: () => {
          console.log("✍️ AI Content card clicked");
          window.dispatchEvent(
            new CustomEvent("lingo-navigate", {
              detail: { route: "content" },
            })
          );
        },
      });
    }

    // Code Agent - only show if code/programming intent detected
    if (recentIntent === "code" || recentIntent === "programming") {
      console.log('💻 Adding Code Agent card');
      cards.push({
        name: "Code Agent",
        icon: <Code2 className="h-5 w-5" />,
        description: "Generate, review, and fix code",
        action: () => {
          console.log("💻 Code Agent card clicked");
          window.dispatchEvent(
            new CustomEvent("lingo-navigate", {
              detail: { route: "code" },
            })
          );
        },
      });
    }

    // Image Generation - only show if image intent detected
    if (recentIntent === "image") {
      console.log('🎨 Adding AI Image card');
      cards.push({
        name: "AI Image",
        icon: <ImageIcon className="h-5 w-5" />,
        description: "Generate and edit images with AI",
        action: () => {
          console.log("🎨 AI Image card clicked");
          window.dispatchEvent(
            new CustomEvent("lingo-navigate", {
              detail: { route: "image" },
            })
          );
        },
      });
    }

    // Video Generation - only show if video intent detected
    if (recentIntent === "video") {
      console.log('🎬 Adding AI Video card');
      cards.push({
        name: "AI Video",
        icon: <Video className="h-5 w-5" />,
        description: "Create and edit videos with AI",
        action: () => {
          console.log("🎬 AI Video card clicked");
          window.dispatchEvent(
            new CustomEvent("lingo-navigate", {
              detail: { route: "video" },
            })
          );
        },
      });
    }

    // Marketing Bot - only show if marketing intent detected
    if (recentIntent === "marketing") {
      console.log('📢 Adding Marketing Bot card');
      cards.push({
        name: "Marketing Bot",
        icon: <Bot className="h-5 w-5" />,
        description: "Create effective marketing campaigns",
        action: () => {
          console.log("📢 Marketing Bot card clicked");
          window.dispatchEvent(
            new CustomEvent("lingo-navigate", {
              detail: { route: "marketing" },
            })
          );
        },
      });
    }

    console.log(`✅ Returning ${cards.length} context-aware cards for recent intent: ${recentIntent}`);
    return cards;
  };

  const teamCards = getTeamCards();

  const hasMessages = messages.length > 1;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Main Content Container */}
      <div className={cn(
        "flex-1 overflow-hidden flex flex-col transition-all duration-700 ease-in-out",
        hasMessages ? "justify-start" : "justify-center items-center"
      )}>

        {/* Hero Section - Only shown when no messages */}
        {!hasMessages && (
          <div className="text-center space-y-8 px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Just talk to{" "}
                <span className="bg-gradient-to-r from-purple-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                  Lingo Agent
                </span>
                !
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Lingo have Agentic Lancers Teams to Automate Your Workflow
              </p>
            </div>

            {/* Upgrade Badge - Clickable */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  console.log("🎨 Image Editing button clicked - Opening Nano Banana Studio");
                  window.dispatchEvent(
                    new CustomEvent("open-image-editing", {
                      detail: { source: "chat-button" },
                    })
                  );
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 via-green-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-sm hover:from-purple-500/30 hover:via-green-500/30 hover:to-blue-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-green-400" />
                <span className="text-sm text-purple-200">Image Editing With Nano Banana</span>
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages - Only shown when there are messages */}
        {hasMessages && (
          <div
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 hide-scrollbar animate-in fade-in-0 slide-in-from-top-4 duration-500"
          >
            <div className="max-w-2xl mx-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 items-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                      message.role === "agent"
                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                        : message.role === "user"
                          ? "bg-gradient-to-br from-purple-500 via-green-500 to-blue-500"
                          : "bg-gray-500"
                    )}
                  >
                    {message.role === "agent" ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {message.role === "user" ? "U" : "S"}
                      </span>
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={cn(
                      "flex-1 rounded-lg p-3 max-w-[80%]",
                      message.role === "agent"
                        ? "bg-card/50 border border-border/50"
                        : message.role === "user"
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted/50 border border-border/30"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* ✅ NEW: Render suggestion cards */}
                    {message.suggestionCards && message.suggestionCards.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {message.suggestionCards.map((card) => (
                          <Card
                            key={card.id}
                            className="cursor-pointer hover:border-purple-500 hover:shadow-lg transition-all duration-200"
                            onClick={() => handleCardClick(card)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                {card.icon === "plane" && <Plane className="h-5 w-5 text-purple-500" />}
                                {card.icon === "pen" && <PenSquare className="h-5 w-5 text-purple-500" />}
                                {card.icon === "image" && <ImageIcon className="h-5 w-5 text-purple-500" />}
                                <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <CardDescription className="text-xs">
                                {card.description}
                              </CardDescription>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    <span className="text-xs text-muted-foreground mt-2 block" suppressHydrationWarning>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 items-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 rounded-lg p-3 bg-card/50 border border-border/50">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}

              {/* Team Cards */}
              {teamCards.length > 0 && (
                <div className="mt-4 space-y-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    <span>Suggested Teams</span>
                  </div>
                  <div className="grid gap-2">
                    {teamCards.map((card, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg bg-card/50 card-gradient-border"
                        onClick={card.action}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            {card.icon}
                            {card.name}
                            <Badge variant="secondary" className="ml-auto">
                              Available
                            </Badge>
                          </CardTitle>
                          <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Beautiful centered or bottom positioned */}
      <div className={cn(
        "transition-all duration-700 ease-in-out flex-shrink-0",
        hasMessages
          ? "p-4 bg-background/95 backdrop-blur-xl border-t border-border"
          : "absolute bottom-[68px] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
      )}>
        <div className={cn(
          "relative group",
          hasMessages ? "max-w-3xl mx-auto" : "w-full"
        )}>
          {/* Multi-Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-green-500 to-blue-500 rounded-2xl p-[2px]">
            <div className="bg-background rounded-[14px] h-full w-full"></div>
          </div>

          {/* Input Content */}
          <div className="relative rounded-2xl p-3">
            {/* Top Controls - Show in both states */}
            <div className="flex gap-2 mb-3 flex-wrap items-center">
              <LancersAgentsDropdown onSelect={handleAgentSelect} />
              <ConnectAppsDropdown onSelect={handleAppSelect} selectedApps={selectedApps} />

              {selectedAgent && (
                <Badge variant="secondary" className="gap-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500/20 via-green-500/20 to-blue-500/20 text-purple-300 border-purple-500/30">
                  {selectedAgent}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-400 transition-colors"
                    onClick={() => setSelectedAgent(null)}
                  />
                </Badge>
              )}

              {selectedApps.map(appId => (
                <Badge key={appId} variant="outline" className="gap-1 px-2 py-1 text-xs bg-gradient-to-r from-blue-500/20 via-green-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
                  {appId}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-400 transition-colors"
                    onClick={() => removeApp(appId)}
                  />
                </Badge>
              ))}

              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted ml-auto transition-colors"
                >
                  Clear Chat
                </Button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />

            {/* Main Input Row */}
            <div className="flex gap-3 items-end">
              {/* Text Input */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={hasMessages ? "Type your message..." : "Talk to Lingo... Use / for prompts"}
                className={cn(
                  "resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none transition-all duration-300",
                  hasMessages
                    ? "min-h-[40px] max-h-[120px] text-sm p-3 rounded-xl bg-muted/30"
                    : "min-h-[48px] max-h-[120px] text-base p-4 rounded-xl bg-muted/20"
                )}
                disabled={isLoading}
              />

              {/* Action Buttons */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                  onClick={handleFileSelect}
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={isListening ? "default" : "ghost"}
                  className={cn(
                    "h-10 w-10 p-0 transition-all duration-300",
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 animate-pulse"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  onClick={toggleVoice}
                  disabled={isLoading}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="h-10 w-10 p-0 bg-gradient-to-r from-purple-500 via-green-500 to-blue-500 hover:from-purple-600 hover:via-green-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Bottom Status - Only in welcome state */}
            {!hasMessages && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  Press Enter to send
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
