/**
 * Lingo Voice Integration Component
 * Complete integration of Deepgram voice, Lingo Master Agent, and Lancers Teams
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  Users, 
  Loader2,
  Settings,
  Radio,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';

import DeepgramVoiceService, { type SpeechResult, VoiceActivityDetector } from '@/lib/deepgram-service';
import { lingoAPI, type TaskStatus, getTaskStatusIcon, getTaskStatusColor } from '@/lib/lingo-api';
import TeamLauncher, { lancersTeams, QuickTeamLauncher } from './team-launcher';

interface VoiceSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  transcript: string;
  response: string;
  taskId?: string;
  teamUsed?: string;
  confidence: number;
  status: 'listening' | 'processing' | 'responding' | 'completed' | 'error';
}

interface LingoVoiceIntegrationProps {
  userId?: string;
  compact?: boolean;
  autoLaunchTeams?: boolean;
}

export default function LingoVoiceIntegration({ 
  userId = 'user-001',
  compact = false,
  autoLaunchTeams = true
}: LingoVoiceIntegrationProps) {
  const { toast } = useToast();
  
  // Voice service refs
  const voiceServiceRef = useRef<DeepgramVoiceService | null>(null);
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // State management
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [sessionHistory, setSessionHistory] = useState<VoiceSession[]>([]);
  const [activeTask, setActiveTask] = useState<TaskStatus | null>(null);
  const [voiceActivity, setVoiceActivity] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  
  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState({
    model: 'nova-2',
    language: 'en-US',
    ttsVoice: 'aura-asteria-en',
    autoSpeak: true,
    vadThreshold: 0.01
  });

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize Deepgram service
        const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
        if (!apiKey) {
          throw new Error('Deepgram API key not configured. Please set NEXT_PUBLIC_DEEPGRAM_API_KEY environment variable.');
        }
        voiceServiceRef.current = new DeepgramVoiceService(apiKey);
        
        // Initialize voice activity detector
        vadRef.current = new VoiceActivityDetector(voiceSettings.vadThreshold);
        
        // Check system status
        const statusResult = await lingoAPI.getSystemStatus();
        if (statusResult.success) {
          setSystemStatus(statusResult.data);
        }
        
        toast({
          title: '🎙️ Voice System Ready',
          description: 'Lingo Master Agent with voice communication is active.',
        });
      } catch (error) {
        console.error('Service initialization error:', error);
        toast({
          title: '❌ Initialization Failed',
          description: 'Failed to initialize voice services.',
          variant: 'destructive',
        });
      }
    };

    initializeServices();
    
    return () => {
      stopListening();
    };
  }, []);

  // Handle voice input processing
  const handleVoiceInput = useCallback(async (result: SpeechResult) => {
    if (result.is_final && result.transcript.trim()) {
      const sessionId = `session-${Date.now()}`;
      const transcript = result.transcript.trim();
      
      setCurrentTranscript(transcript);
      setIsProcessing(true);

      // Create new session
      const newSession: VoiceSession = {
        id: sessionId,
        startTime: new Date(),
        transcript,
        response: '',
        confidence: result.confidence,
        status: 'processing'
      };
      
      setSessionHistory(prev => [newSession, ...prev]);
      
      try {
        // Send to Lingo Master with team preference
        const request = selectedTeam 
          ? `[PREFERRED_TEAM: ${selectedTeam}] ${transcript}` 
          : transcript;
          
        const result = await lingoAPI.sendVoiceMessage(
          request,
          (response) => {
            setCurrentResponse(response);
            // Handle TTS if enabled
            if (voiceSettings.autoSpeak) {
              handleTextToSpeech(response);
            }
          },
          'high'
        );

        if (result.success) {
          // Update session with response
          setSessionHistory(prev => 
            prev.map(session => 
              session.id === sessionId 
                ? { 
                    ...session, 
                    response: result.data || '',
                    status: 'completed',
                    endTime: new Date()
                  }
                : session
            )
          );
        } else {
          throw new Error(result.error || 'Processing failed');
        }
      } catch (error: any) {
        console.error('Voice processing error:', error);
        
        // Update session with error
        setSessionHistory(prev =>
          prev.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  status: 'error',
                  response: `Error: ${error.message}`,
                  endTime: new Date()
                }
              : session
          )
        );
        
        toast({
          title: '❌ Processing Failed',
          description: error.message || 'Failed to process voice input.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Interim result
      setCurrentTranscript(result.transcript);
    }
  }, [selectedTeam, voiceSettings.autoSpeak]);

  // Handle text-to-speech
  const handleTextToSpeech = useCallback(async (text: string) => {
    if (!voiceServiceRef.current || isSpeaking) return;
    
    try {
      setIsSpeaking(true);
      const audioBuffer = await voiceServiceRef.current.textToSpeech(text, {
        model: voiceSettings.ttsVoice,
        voice: voiceSettings.ttsVoice,
        encoding: 'linear16',
        sample_rate: 24000
      });
      
      await voiceServiceRef.current.playAudio(audioBuffer);
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: '🔊 Speech Error',
        description: 'Failed to generate speech response.',
        variant: 'destructive',
      });
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking, voiceSettings.ttsVoice]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!voiceServiceRef.current || isListening) return;
    
    try {
      setIsListening(true);
      setCurrentTranscript('');
      
      const stream = await voiceServiceRef.current.startListening(
        {
          model: voiceSettings.model,
          language: voiceSettings.language,
          smart_format: true,
          interim_results: true,
          endpointing: 300
        },
        handleVoiceInput,
        (error: Error) => {
          console.error('Speech recognition error:', error);
          toast({
            title: '🎙️ Recognition Error',
            description: error.message,
            variant: 'destructive',
          });
          stopListening();
        }
      );
      
      streamRef.current = stream;
      
      // Start voice activity detection
      if (vadRef.current) {
        vadRef.current.start(stream, setVoiceActivity);
      }
      
      toast({
        title: '🎙️ Listening Started',
        description: 'Speak now. Lingo is listening...',
      });
    } catch (error: any) {
      console.error('Failed to start listening:', error);
      toast({
        title: '❌ Microphone Error',
        description: 'Please allow microphone access.',
        variant: 'destructive',
      });
      setIsListening(false);
    }
  }, [isListening, voiceSettings, handleVoiceInput]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (voiceServiceRef.current && isListening) {
      voiceServiceRef.current.stopListening();
    }
    
    if (vadRef.current) {
      vadRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
    setVoiceActivity(false);
    setCurrentTranscript('');
  }, [isListening]);

  // Handle team selection
  const handleTeamSelect = useCallback((team: any) => {
    setSelectedTeam(team.domain);
    toast({
      title: `🎯 Team Selected: ${team.name}`,
      description: 'Future requests will be routed to this team.',
    });
  }, []);

  // Compact view for integration
  if (compact) {
    return (
      <Card className="w-full bg-gradient-to-r from-purple-500/10 to-green-500/10 border-purple-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Lingo Voice Agent</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {isListening && <Badge variant="outline" className="text-green-500">Listening</Badge>}
              {isProcessing && <Badge variant="outline" className="text-blue-500">Processing</Badge>}
              {isSpeaking && <Badge variant="outline" className="text-purple-500">Speaking</Badge>}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className="flex-1"
            >
              {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isListening ? 'Stop' : 'Talk to Lingo'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }))}
            >
              {voiceSettings.autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
          
          {voiceActivity && isListening && (
            <div className="flex items-center gap-2 text-green-500">
              <Radio className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Voice detected...</span>
            </div>
          )}
          
          {currentTranscript && (
            <div className="text-sm bg-background/50 p-2 rounded">
              <strong>You:</strong> {currentTranscript}
            </div>
          )}
          
          {currentResponse && (
            <div className="text-sm bg-background/50 p-2 rounded">
              <strong>Lingo:</strong> {currentResponse}
            </div>
          )}
          
          <QuickTeamLauncher onTeamSelect={handleTeamSelect} />
        </CardContent>
      </Card>
    );
  }

  // Full interface
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-green-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/lingo-avatar.png" alt="Lingo" />
                <AvatarFallback>🤖</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Lingo Master Agent
                  <Badge variant="outline" className="text-green-500">Voice Active</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI Agent with Microsoft Autogen & Deepgram Voice
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {systemStatus && (
                <Badge variant="outline">
                  {systemStatus.specialist_teams} Teams Ready
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="voice" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voice">
            <Mic className="h-4 w-4 mr-2" />
            Voice Chat
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="history">
            <MessageSquare className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-4">
          {/* Voice Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="lg"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    className="h-20 w-20 rounded-full text-lg"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : isListening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                  
                  {voiceActivity && isListening && (
                    <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse" />
                  )}
                </div>
                
                <div className="text-center">
                  <p className="font-medium">
                    {isProcessing 
                      ? 'Processing with Lingo Master...' 
                      : isListening 
                      ? 'Listening... Speak now!' 
                      : 'Click to start voice conversation'
                    }
                  </p>
                  {selectedTeam && (
                    <Badge variant="outline" className="mt-2">
                      Preferred Team: {lancersTeams.find(t => t.domain === selectedTeam)?.name}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Live Transcript */}
              {(currentTranscript || currentResponse) && (
                <div className="mt-6 space-y-3">
                  {currentTranscript && (
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">You</Badge>
                        {isListening && <Radio className="h-4 w-4 animate-pulse text-blue-500" />}
                      </div>
                      <p className="text-sm">{currentTranscript}</p>
                    </div>
                  )}
                  
                  {currentResponse && (
                    <div className="bg-green-500/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Lingo</Badge>
                        {isSpeaking && <Volume2 className="h-4 w-4 animate-pulse text-green-500" />}
                      </div>
                      <p className="text-sm">{currentResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <TeamLauncher onTeamLaunched={handleTeamSelect} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {sessionHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No conversation history yet. Start talking to Lingo!
              </CardContent>
            </Card>
          ) : (
            sessionHistory.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {session.startTime.toLocaleTimeString()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-${getTaskStatusColor(session.status as any)}`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                    
                    <div className="bg-blue-500/10 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-sm">You:</strong>
                        <Badge variant="outline" className="text-xs">
                          {(session.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm">{session.transcript}</p>
                    </div>
                    
                    {session.response && (
                      <div className="bg-green-500/10 p-3 rounded">
                        <strong className="text-sm">Lingo:</strong>
                        <p className="text-sm mt-1">{session.response}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}