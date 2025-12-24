"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LingoAgentProps {
  onNavigate?: (destination: string) => void
  onStartWorkflow?: (workflowType: string, data: any) => void
}

export function MasterLingoAgent({ onNavigate, onStartWorkflow }: LingoAgentProps) {
  const [isActive, setIsActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [agentResponse, setAgentResponse] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("en-US-AriaNeural")
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [showSettings, setShowSettings] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string, content: string }>>([])

  const wsRef = useRef<WebSocket | null>(null)

  // Microsoft Azure Neural Voices
  const azureVoices = [
    { value: "en-US-AriaNeural", label: "Aria (English US Female)", category: "English US" },
    { value: "en-US-GuyNeural", label: "Guy (English US Male)", category: "English US" },
    { value: "en-GB-SoniaNeural", label: "Sonia (English UK Female)", category: "English UK" },
    { value: "en-GB-RyanNeural", label: "Ryan (English UK Male)", category: "English UK" },
    { value: "fr-FR-DeniseNeural", label: "Denise (French Female)", category: "French" },
    { value: "es-ES-ElviraNeural", label: "Elvira (Spanish Female)", category: "Spanish" },
    { value: "zh-CN-XiaoxiaoNeural", label: "Xiaoxiao (Chinese Female)", category: "Chinese" },
    { value: "ar-SA-ZariyahNeural", label: "Zariyah (Arabic Female)", category: "Arabic" }
  ]

  // Connect to WebSocket
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/api/lingo/ws';

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('✅ Connected to Master Lingo Agent')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'ui_update' && data.data) {
        const msg = data.data.message || data.data;

        // Add to history
        setConversationHistory(prev => [...prev, {
          role: 'assistant',
          content: msg
        }])

        // Speak response
        speakWithAzure(msg)
      }

      if (data.type === 'workflow_started') {
        if (onStartWorkflow) {
          onStartWorkflow(data.workflow_type, data.data)
        }
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('Disconnected from Master Lingo Agent')
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [onStartWorkflow])

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
          voice: selectedVoice,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        setIsSpeaking(true);
        audio.play();
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
      }
    } catch (error) {
      console.error('❌ Azure TTS error:', error);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setIsActive(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      setInterimTranscript(transcript);

      if (event.results[0].isFinal) {
        setTranscript(transcript);
        setConversationHistory(prev => [...prev, { role: 'user', content: transcript }]);

        // Send to backend via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'text_input', text: transcript }));
        }
        setInterimTranscript('');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopAgent = () => {
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            Master Lingo Agent
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold">Voice Settings</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a voice..." />
                </SelectTrigger>
                <SelectContent>
                  {azureVoices.map(voice => (
                    <SelectItem key={voice.value} value={voice.value}>
                      {voice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="zh-CN">Chinese</SelectItem>
                  <SelectItem value="ar-SA">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Conversation Display */}
        <div className="min-h-[300px] max-h-[400px] overflow-y-auto p-4 border rounded-lg space-y-3">
          {conversationHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>Start the agent to begin conversation</p>
            </div>
          ) : (
            conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                    }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}

          {/* Interim transcript */}
          {interimTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] p-3 rounded-lg bg-blue-300 text-white opacity-70">
                {interimTranscript}
              </div>
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Speaking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isListening ? (
            <Button
              onClick={startListening}
              size="lg"
              className="gap-2"
            >
              <Mic className="h-5 w-5" />
              Talk
            </Button>
          ) : (
            <Button
              onClick={stopAgent}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <MicOff className="h-5 w-5" />
              Stop
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Try saying:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">"Plan a trip to London"</Badge>
            <Badge variant="outline">"Write a blog about AI"</Badge>
            <Badge variant="outline">"Help me"</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
