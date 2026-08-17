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
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [showSettings, setShowSettings] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  
  // Available Azure Speech voices - fetch from backend
  const [allVoices, setAllVoices] = useState<any>({})
  const [voiceOptions, setVoiceOptions] = useState<Array<{value: string, label: string, category: string}>>([])
  
  // Fetch all voices from backend
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/lingo/voices')
        if (response.ok) {
          const voices = await response.json()
          setAllVoices(voices)
          
          // Convert to flat list for dropdown
          const options: Array<{value: string, label: string, category: string}> = []
          
          // English voices
          if (voices.english_us) {
            voices.english_us.female?.forEach((voice: string) => {
              const name = voice.replace('en-US-', '').replace('Neural', '')
              options.push({
                value: voice,
                label: `${name} (English US Female)`,
                category: 'English US'
              })
            })
            voices.english_us.male?.forEach((voice: string) => {
              const name = voice.replace('en-US-', '').replace('Neural', '')
              options.push({
                value: voice,
                label: `${name} (English US Male)`,
                category: 'English US'
              })
            })
          }
          
          // Arabic voices
          if (voices.arabic) {
            Object.entries(voices.arabic).forEach(([country, voiceList]: [string, any]) => {
              if (Array.isArray(voiceList)) {
                voiceList.forEach((voice: string) => {
                  const name = voice.split('-')[2]?.replace('Neural', '') || voice
                  const gender = voice.includes('Zariyah') || voice.includes('Salma') || voice.includes('Fatima') ? 'Female' : 'Male'
                  options.push({
                    value: voice,
                    label: `${name} (Arabic ${country.replace('_', ' ')} ${gender})`,
                    category: 'Arabic'
                  })
                })
              }
            })
          }
          
          // Hindi voices
          if (voices.hindi?.india) {
            voices.hindi.india.forEach((voice: string) => {
              const name = voice.split('-')[2]?.replace('Neural', '') || voice
              const gender = voice.includes('Swara') ? 'Female' : 'Male'
              options.push({
                value: voice,
                label: `${name} (Hindi ${gender})`,
                category: 'Hindi'
              })
            })
          }
          
          // Urdu voices
          if (voices.urdu) {
            Object.entries(voices.urdu).forEach(([country, voiceList]: [string, any]) => {
              if (Array.isArray(voiceList)) {
                voiceList.forEach((voice: string) => {
                  const name = voice.split('-')[2]?.replace('Neural', '') || voice
                  const gender = voice.includes('Uzma') ? 'Female' : 'Male'
                  options.push({
                    value: voice,
                    label: `${name} (Urdu ${country} ${gender})`,
                    category: 'Urdu'
                  })
                })
              }
            })
          }
          
          // Chinese voices
          if (voices.chinese) {
            Object.entries(voices.chinese).forEach(([type, voiceList]: [string, any]) => {
              if (Array.isArray(voiceList)) {
                voiceList.forEach((voice: string) => {
                  const name = voice.split('-')[2]?.replace('Neural', '') || voice
                  const gender = voice.includes('Xiaoxiao') || voice.includes('HiuMaan') ? 'Female' : 'Male'
                  options.push({
                    value: voice,
                    label: `${name} (Chinese ${type} ${gender})`,
                    category: 'Chinese'
                  })
                })
              }
            })
          }
          
          // Spanish voices
          if (voices.spanish) {
            Object.entries(voices.spanish).forEach(([country, voiceList]: [string, any]) => {
              if (Array.isArray(voiceList)) {
                voiceList.slice(0, 2).forEach((voice: string) => { // Limit to 2 per country
                  const name = voice.split('-')[2]?.replace('Neural', '') || voice
                  const gender = voice.includes('Elvira') || voice.includes('Dalia') || voice.includes('Elena') ? 'Female' : 'Male'
                  options.push({
                    value: voice,
                    label: `${name} (Spanish ${country.replace('_', ' ')} ${gender})`,
                    category: 'Spanish'
                  })
                })
              }
            })
          }
          
          // French voices
          if (voices.french) {
            Object.entries(voices.french).forEach(([country, voiceList]: [string, any]) => {
              if (Array.isArray(voiceList)) {
                voiceList.forEach((voice: string) => {
                  const name = voice.split('-')[2]?.replace('Neural', '') || voice
                  const gender = voice.includes('Denise') || voice.includes('Sylvie') ? 'Female' : 'Male'
                  options.push({
                    value: voice,
                    label: `${name} (French ${country} ${gender})`,
                    category: 'French'
                  })
                })
              }
            })
          }
          
          // German voices
          if (voices.german) {
            Object.entries(voices.german).forEach(([country, voiceList]: [string, any]) => {
              if (Array.isArray(voiceList)) {
                voiceList.forEach((voice: string) => {
                  const name = voice.split('-')[2]?.replace('Neural', '') || voice
                  const gender = voice.includes('Katja') || voice.includes('Ingrid') ? 'Female' : 'Male'
                  options.push({
                    value: voice,
                    label: `${name} (German ${country} ${gender})`,
                    category: 'German'
                  })
                })
              }
            })
          }
          
          setVoiceOptions(options)
        }
      } catch (error) {
        console.error('Error fetching voices:', error)
        // Fallback to basic voices
        setVoiceOptions([
          { value: "en-US-AriaNeural", label: "Aria (English US Female)", category: "English" },
          { value: "en-US-GuyNeural", label: "Guy (English US Male)", category: "English" },
          { value: "ar-SA-ZariyahNeural", label: "Zariyah (Arabic Female)", category: "Arabic" },
          { value: "hi-IN-SwaraNeural", label: "Swara (Hindi Female)", category: "Hindi" }
        ])
      }
    }
    
    fetchVoices()
  }, [])
  
  // Connect to WebSocket
  useEffect(() => {
    if (isActive) {
      const ws = new WebSocket('ws://localhost:8000/api/lingo/ws')
      
      ws.onopen = () => {
        console.log('Connected to Master Lingo Agent')
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'navigate':
            if (onNavigate) {
              onNavigate(data.destination)
            }
            break
          
          case 'start_workflow':
            if (onStartWorkflow) {
              onStartWorkflow(data.workflow_type, data.data)
            }
            break
          
          case 'ui_update':
            if (data.data.interim_transcript) {
              setInterimTranscript(data.data.interim_transcript)
            }
            if (data.data.agent_response) {
              setAgentResponse(data.data.agent_response)
              setConversationHistory(prev => [...prev, {
                role: 'assistant',
                content: data.data.agent_response
              }])
            }
            if (data.data.form_data) {
              // Update form with collected data
              console.log('Form data:', data.data.form_data)
            }
            break
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
    }
  }, [isActive, onNavigate, onStartWorkflow])
  
  const startAgent = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/lingo/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: selectedVoice,
          language: selectedLanguage
        })
      })
      
      if (response.ok) {
        setIsActive(true)
        setIsListening(true)
        setConversationHistory([{
          role: 'assistant',
          content: "Hello! I'm your Master Lingo assistant. I can help you plan trips or write blog articles. What would you like to do?"
        }])
      }
    } catch (error) {
      console.error('Error starting agent:', error)
    }
  }
  
  const stopAgent = async () => {
    try {
      await fetch('http://localhost:8000/api/lingo/stop', {
        method: 'POST'
      })
      
      setIsActive(false)
      setIsListening(false)
      setIsSpeaking(false)
      setTranscript("")
      setInterimTranscript("")
    } catch (error) {
      console.error('Error stopping agent:', error)
    }
  }
  
  const changeVoice = async (voice: string) => {
    setSelectedVoice(voice)
    
    if (isActive) {
      try {
        await fetch('http://localhost:8000/api/lingo/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voice: voice,
            language: selectedLanguage
          })
        })
      } catch (error) {
        console.error('Error changing voice:', error)
      }
    }
  }
  
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
              <label className="text-sm font-medium">Select Voice (400+ Available)</label>
              <Select value={selectedVoice} onValueChange={changeVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a voice..." />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {/* Group voices by category */}
                  {['English US', 'Arabic', 'Hindi', 'Urdu', 'Chinese', 'Spanish', 'French', 'German'].map(category => {
                    const categoryVoices = voiceOptions.filter(voice => voice.category === category)
                    if (categoryVoices.length === 0) return null
                    
                    return (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                          {category}
                        </div>
                        {categoryVoices.map(voice => (
                          <SelectItem key={voice.value} value={voice.value}>
                            {voice.label}
                          </SelectItem>
                        ))}
                      </div>
                    )
                  })}
                  
                  {/* Show all other voices */}
                  {voiceOptions.filter(voice => 
                    !['English US', 'Arabic', 'Hindi', 'Urdu', 'Chinese', 'Spanish', 'French', 'German'].includes(voice.category)
                  ).length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                        Other Languages
                      </div>
                      {voiceOptions.filter(voice => 
                        !['English US', 'Arabic', 'Hindi', 'Urdu', 'Chinese', 'Spanish', 'French', 'German'].includes(voice.category)
                      ).map(voice => (
                        <SelectItem key={voice.value} value={voice.value}>
                          {voice.label}
                        </SelectItem>
                      ))}
                    </div>
                  )}
                </SelectContent>
              </Select>
              
              {voiceOptions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {voiceOptions.length} voices available across 140+ languages
                </p>
              )}
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
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
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
          {!isActive ? (
            <Button
              onClick={startAgent}
              size="lg"
              className="gap-2"
            >
              <Mic className="h-5 w-5" />
              Start Agent
            </Button>
          ) : (
            <>
              <Button
                onClick={stopAgent}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <MicOff className="h-5 w-5" />
                Stop Agent
              </Button>
              
              <div className="flex items-center gap-2">
                {isListening && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Listening</span>
                  </div>
                )}
              </div>
            </>
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
