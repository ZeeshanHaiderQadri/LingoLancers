'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import {
    Voicemail,
    Server,
    User,
    Users,
    Languages,
    X,
    Bot,
    PlusCircle,
    Volume2,
    VolumeX,
    Loader2,
    Mic,
    MicOff,
    Play,
    Pause
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
// Microsoft Azure Neural Voices
const azureVoices = [
    {
        name: 'Aria',
        image: 'https://picsum.photos/seed/aria/100/100',
        imageHint: 'professional female voice',
        ethnicity: 'American',
        gender: 'Female',
        age: 'Adult',
        type: 'Professional',
        languages: ['English (US)'],
        model: 'en-US-AriaNeural',
        characteristics: 'Confident, Positive, Professional',
        useCases: 'Assistant, Chat, News'
    },
    {
        name: 'Guy',
        image: 'https://picsum.photos/seed/guy/100/100',
        imageHint: 'professional male voice',
        ethnicity: 'American',
        gender: 'Male',
        age: 'Adult',
        type: 'Neutral',
        languages: ['English (US)'],
        model: 'en-US-GuyNeural',
        characteristics: 'Neutral, Professional, Calm',
        useCases: 'Assistant, News'
    },
    {
        name: 'Sonia',
        image: 'https://picsum.photos/seed/sonia/100/100',
        imageHint: 'british female voice',
        ethnicity: 'British',
        gender: 'Female',
        age: 'Adult',
        type: 'Elegant',
        languages: ['English (UK)'],
        model: 'en-GB-SoniaNeural',
        characteristics: 'Polite, Clear, Elegant',
        useCases: 'Assistant, Narration'
    },
    {
        name: 'Ryan',
        image: 'https://picsum.photos/seed/ryan/100/100',
        imageHint: 'british male voice',
        ethnicity: 'British',
        gender: 'Male',
        age: 'Adult',
        type: 'Friendly',
        languages: ['English (UK)'],
        model: 'en-GB-RyanNeural',
        characteristics: 'Friendly, Cheerful, Engaging',
        useCases: 'Chat, Assistant'
    },
    {
        name: 'Denise',
        image: 'https://picsum.photos/seed/denise/100/100',
        imageHint: 'french female voice',
        ethnicity: 'French',
        gender: 'Female',
        age: 'Adult',
        type: 'Charming',
        languages: ['French'],
        model: 'fr-FR-DeniseNeural',
        characteristics: 'Charming, Professional',
        useCases: 'Assistant, Chat'
    },
    {
        name: 'Elvira',
        image: 'https://picsum.photos/seed/elvira/100/100',
        imageHint: 'spanish female voice',
        ethnicity: 'Spanish',
        gender: 'Female',
        age: 'Adult',
        type: 'Vibrant',
        languages: ['Spanish'],
        model: 'es-ES-ElviraNeural',
        characteristics: 'Clear, Expressive',
        useCases: 'Assistant, Chat'
    },
    {
        name: 'Xiaoxiao',
        image: 'https://picsum.photos/seed/xiaoxiao/100/100',
        imageHint: 'chinese female voice',
        ethnicity: 'Chinese',
        gender: 'Female',
        age: 'Young Adult',
        type: 'Friendly',
        languages: ['Chinese (Mandarin)'],
        model: 'zh-CN-XiaoxiaoNeural',
        characteristics: 'Warm, Friendly, Clear',
        useCases: 'Assistant, Chat'
    },
    {
        name: 'Salma',
        image: 'https://picsum.photos/seed/salma/100/100',
        imageHint: 'arabic female voice',
        ethnicity: 'Arabic',
        gender: 'Female',
        age: 'Adult',
        type: 'Professional',
        languages: ['Arabic'],
        model: 'ar-SA-ZariyahNeural', // Using Zariyah as Salma might not be available in all regions
        characteristics: 'Professional, Clear',
        useCases: 'Assistant, News'
    }
];

interface VoiceSelectionViewProps {
    selectedVoice: typeof azureVoices[0];
    onVoiceSelect: (voice: typeof azureVoices[0]) => void;
}

const VoiceSelectionView: React.FC<VoiceSelectionViewProps> = ({ selectedVoice, onVoiceSelect }) => {
    const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
    const { toast } = useToast();

    const previewVoice = async (voice: typeof azureVoices[0]) => {
        try {
            setPreviewingVoice(voice.model);

            const sampleText = `Hello! I'm ${voice.name}, your ${voice.type.toLowerCase()} voice assistant.`;

            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(sampleText);
                utterance.volume = 0.8;

                // Try to match browser voice
                const voices = speechSynthesis.getVoices();
                const matchingVoice = voices.find(v => v.name.includes(voice.name) || v.lang.includes(voice.languages[0].split(' ')[0]));
                if (matchingVoice) utterance.voice = matchingVoice;

                speechSynthesis.speak(utterance);

                toast({
                    title: `🎤 ${voice.name} Preview`,
                    description: `${voice.characteristics} - Browser preview active.`,
                });
            }
        } catch (error: any) {
            console.error('Voice preview error:', error);
        } finally {
            setPreviewingVoice(null);
        }
    };

    return (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {azureVoices.map(voice => (
                <Card key={voice.name} className="bg-background/50 hover:bg-card/70 transition-colors">
                    <CardContent className="p-3 flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={voice.image} alt={voice.name} />
                            <AvatarFallback>{voice.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <h4 className="font-bold">{voice.name}</h4>
                            <div className="flex flex-wrap gap-1 text-xs">
                                <Badge variant="outline">{voice.gender}, {voice.age}</Badge>
                                <Badge variant="outline">{voice.ethnicity}</Badge>
                                <Badge variant="secondary" className="bg-primary/20 text-primary">{voice.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Languages className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{voice.languages.join(', ')}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{voice.characteristics}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                variant={selectedVoice.name === voice.name ? "default" : "outline"}
                                onClick={() => onVoiceSelect(voice)}
                            >
                                {selectedVoice.name === voice.name ? 'Selected' : 'Select'}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={() => previewVoice(voice)}
                                disabled={previewingVoice === voice.model}
                            >
                                {previewingVoice === voice.model ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                    <Play className="h-3 w-3 mr-1" />
                                )}
                                Preview
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

interface LingoAgentWidgetProps {
    className?: string;
}

export default function LingoAgentWidget({ className }: LingoAgentWidgetProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);
    const mouthRef = useRef<SVGRectElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const dragRef = useRef({ active: false, offX: 0, offY: 0 });

    const [isExpanded, setIsExpanded] = useState(false);
    const [activeView, setActiveView] = useState('main');
    const [selectedVoice, setSelectedVoice] = useState(azureVoices[0]);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [lingoResponse, setLingoResponse] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const { toast } = useToast();

    // Initialize WebSocket connection to Master Lingo Agent
    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8000';
        const wsUrl = apiUrl.replace('http://', 'ws://')
            .replace('https://', 'wss://') + '/api/lingo/ws';
        const socket = new WebSocket(wsUrl);
        socket.onopen = () => {
            console.log('✅ WebSocket connected');
            setIsConnected(true);
        };
        socket.onclose = () => {
            console.log('WebSocket closed');
            setIsConnected(false);
        };
        socket.onerror = (e) => {
            console.error('WebSocket error', e);
            toast({ title: '❌ WebSocket error', variant: 'destructive' });
        };
        setWs(socket);
        return () => socket.close();
    }, []);


    // WebSocket message handling
    useEffect(() => {
        if (!ws) return;
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'ui_update' && data.data) {
                const msg = data.data.message || data.data;
                setLingoResponse(msg);
                // Speak response via Azure TTS
                speakWithAzure(msg);
            }
            if (data.type === 'workflow_started') {
                toast({
                    title: `🚀 ${data.workflow_type} workflow started`,
                    description: `ID: ${data.workflow_id}`,
                });
            }
        };
    }, [ws, toast]);

    // Azure TTS helper function
    const speakWithAzure = useCallback(async (text: string) => {
        if (!text) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8000';
            console.log('🔊 Calling Azure TTS:', `${apiUrl}/api/voice/tts`);
            console.log('🗣️ Using Voice:', selectedVoice.model);

            const response = await fetch(`${apiUrl}/api/voice/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voice: selectedVoice.model,
                    language: selectedVoice.languages[0].includes('(') ? 'en-US' : 'en-US', // Simplified language mapping for now
                }),
            });

            if (!response.ok) {
                throw new Error(`TTS request failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ TTS response received, audio length:', data.audio?.length || 0);
            if (data.audio) {
                const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
                setIsSpeaking(true);
                console.log('🔊 Playing audio...');
                audio.play();
                audio.onended = () => {
                    console.log('✅ Audio playback ended');
                    setIsSpeaking(false);
                };
                audio.onerror = (e) => {
                    console.error('❌ Audio playback error:', e);
                    setIsSpeaking(false);
                };
            } else {
                console.warn('⚠️ No audio data in TTS response');
            }
        } catch (error) {
            console.error('❌ Azure TTS error:', error);
            toast({
                title: '❌ TTS error',
                description: (error as any).message || 'Failed to synthesize speech',
                variant: 'destructive',
            });
        }
    }, [toast, selectedVoice]);

    // Web Speech API for voice recognition
    const startVoiceRecognition = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast({
                title: '❌ Speech Recognition not supported',
                description: 'Please use Chrome or Edge browser',
                variant: 'destructive',
            });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript;
            const isFinal = event.results[last].isFinal;

            setCurrentTranscript(transcript);

            if (isFinal && ws && ws.readyState === WebSocket.OPEN) {
                console.log('Sending transcript to Lingo Agent:', transcript);
                ws.send(JSON.stringify({ type: 'text_input', text: transcript }));
                setIsProcessing(true);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            toast({
                title: '❌ Speech error',
                description: event.error,
                variant: 'destructive',
            });
            setIsListening(false);
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
        };

        try {
            recognition.start();
            setIsListening(true);
            toast({
                title: '🎤 Listening',
                description: 'Speak now…',
            });
        } catch (error) {
            console.error('Failed to start recognition:', error);
            toast({
                title: '❌ Failed to start',
                description: 'Could not start voice recognition',
                variant: 'destructive',
            });
        }
    }, [ws, toast]);

    const stopVoiceRecognition = useCallback(() => {
        setIsListening(false);
        toast({ title: '🛑 Stopped listening' });
    }, [toast]);

    // Enhanced voice selection handler
    const handleVoiceSelect = useCallback((voice: typeof azureVoices[0]) => {
        setSelectedVoice(voice);
        toast({
            title: `🎤 Voice Selected: ${voice.name}`,
            description: `${voice.characteristics} - Ready for voice communication!`,
        });
    }, [toast]);

    // Enhanced dragging functionality for better UX
    const bound = useCallback((val: number, min: number, max: number) => {
        return Math.max(min, Math.min(max, val));
    }, []);

    const startDrag = useCallback((x: number, y: number) => {
        const widget = widgetRef.current;
        if (!widget) return;

        const rect = widget.getBoundingClientRect();
        dragRef.current.active = true;
        dragRef.current.offX = x - rect.left;
        dragRef.current.offY = y - rect.top;
        setIsDragging(true);
    }, []);

    const moveDrag = useCallback((x: number, y: number) => {
        if (!dragRef.current.active) return;

        const widget = widgetRef.current;
        if (!widget) return;

        const w = widget.offsetWidth;
        const h = widget.offsetHeight;
        const maxX = window.innerWidth - w;
        const maxY = window.innerHeight - h;

        const nx = bound(x - dragRef.current.offX, 0, maxX);
        const ny = bound(y - dragRef.current.offY, 0, maxY);

        widget.style.left = nx + 'px';
        widget.style.top = ny + 'px';
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
    }, [bound]);

    const endDrag = useCallback(() => {
        dragRef.current.active = false;
        setIsDragging(false);
    }, []);

    // Mouse drag handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Don't drag if clicking on buttons
        if (e.target instanceof HTMLElement &&
            (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
            return;
        }
        startDrag(e.clientX, e.clientY);
    }, [startDrag]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        moveDrag(e.clientX, e.clientY);
    }, [moveDrag]);

    const handleMouseUp = useCallback(() => {
        endDrag();
    }, [endDrag]);

    // Touch drag handlers  
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;

        // Don't drag if touching buttons
        if (e.target instanceof HTMLElement &&
            (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
            return;
        }
        startDrag(touch.clientX, touch.clientY);
    }, [startDrag]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        moveDrag(touch.clientX, touch.clientY);
    }, [moveDrag]);

    const handleTouchEnd = useCallback(() => {
        endDrag();
    }, [endDrag]);

    // Setup global event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);


    // Deepgram functions removed. Using Web Speech API defined above.

    // Enhanced animation functions for the new Lingo Master Agent
    const setTalkAmount = useCallback((amount: number) => {
        const mouth = mouthRef.current;
        const svg = svgRef.current;

        if (mouth && svg) {
            // a is 0..1
            const minH = 4, maxH = 38; // mouth vertical expansion
            const h = minH + (maxH - minH) * amount;
            mouth.setAttribute('height', h.toFixed(2));
            mouth.setAttribute('y', (9 - h / 2).toFixed(2));
            // Nose scale pulse
            const s = 1 + amount * 0.25;
            svg.style.setProperty('--noseScale', s.toFixed(3));
        }
    }, []);

    // Enhanced animation system for the new Lingo Master Agent
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        // Random blinking animation
        const scheduleBlink = () => {
            const t = 1400 + Math.random() * 3000; // 1.4s–4.4s
            setTimeout(() => {
                if (svg) {
                    svg.classList.add('blink');
                    setTimeout(() => {
                        if (svg) {
                            svg.classList.remove('blink');
                            scheduleBlink();
                        }
                    }, 120); // lid down-up duration
                }
            }, t);
        };
        scheduleBlink();

        // Pupil parallax tracking (simplified for widget)
        const handleMouseMove = (e: MouseEvent) => {
            const pL = svg.querySelector('#pL') as SVGCircleElement;
            const pR = svg.querySelector('#pR') as SVGCircleElement;
            if (!pL || !pR) return;

            const r = 4; // max offset
            const box = svg.getBoundingClientRect();
            const mx = e.clientX - box.left;
            const my = e.clientY - box.top;
            const nx = (mx / box.width) * 320; // normalize to viewBox units
            const ny = (my / box.height) * 360;
            const faceCenter = { x: 160, y: 140 };
            const dx = Math.max(-r, Math.min(r, (nx - faceCenter.x) / 18));
            const dy = Math.max(-r, Math.min(r, (ny - faceCenter.y) / 18));
            pL.style.transform = `translate(${dx}px, ${dy}px)`;
            pR.style.transform = `translate(${dx}px, ${dy}px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Enhanced talking animation with proper class management
        if (isListening || isSpeaking) {
            svg.classList.remove('idleTalking');
            if (isListening) svg.classList.add('listening');
            if (isSpeaking) svg.classList.add('speaking');

            const animate = () => {
                const amount = 0.3 + Math.random() * 0.4;
                setTalkAmount(amount);
                if (isListening || isSpeaking) {
                    setTimeout(animate, 100 + Math.random() * 200);
                } else {
                    setTalkAmount(0.35);
                    svg.classList.remove('listening', 'speaking');
                    svg.classList.add('idleTalking');
                }
            };
            animate();
        } else {
            svg.classList.remove('listening', 'speaking');
            svg.classList.add('idleTalking');
            setTalkAmount(0.35);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isListening, isSpeaking, setTalkAmount]);

    const renderExpandedContent = () => {
        switch (activeView) {
            case 'voices':
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Select Deepgram Voice</h3>
                        <div className="text-xs text-muted-foreground mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            🎤 <strong>Voice Preview:</strong> Uses browser speech synthesis. For full Deepgram quality, use the main "Talk" button!
                        </div>
                        <VoiceSelectionView
                            selectedVoice={selectedVoice}
                            onVoiceSelect={handleVoiceSelect}
                            deepgramService={deepgramServiceRef.current}
                        />
                    </div>
                )
            default:
                return (
                    <div className="space-y-2">
                        <Button onClick={() => setActiveView('voices')} variant="outline" className="w-full justify-start text-left h-auto py-2 bg-card/50 hover:bg-card/70">
                            <Voicemail className="h-5 w-5 mr-3" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">Voice: {selectedVoice.name}</p>
                                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                                        Active
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{selectedVoice.characteristics}</p>
                                <p className="text-xs text-blue-400">Ready for voice communication • Click to change</p>
                            </div>
                        </Button>

                        {/* Enhanced Connection Status */}
                        <Card className="bg-card/50">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                        <span className="text-sm font-medium">
                                            {isConnected ? 'Flux Streaming Ready' : 'Disconnected'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Badge variant={isConnected ? 'default' : 'secondary'} className="text-xs">
                                            {isConnected ? 'Flux' : 'Idle'}
                                        </Badge>
                                        {isConnected && (
                                            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400">
                                                Functions
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {isConnected && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        ⚡ Ultra-low latency • 🎯 Smart turn detection • 🔧 Function calling
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Voice Status Display */}
                        {(isListening || isProcessing || currentTranscript || lingoResponse) && (
                            <Card className="mt-4 bg-card/80">
                                <CardContent className="p-3 space-y-2">
                                    {isListening && (
                                        <div className="flex items-center gap-2 text-blue-500">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <div className="flex-1">
                                                <span className="text-sm font-medium">Listening with {selectedVoice.name}</span>
                                                <div className="text-xs text-muted-foreground">{selectedVoice.type} • Continuous Conversation</div>
                                                <div className="text-xs text-blue-400">Say anything to continue the conversation</div>
                                            </div>
                                        </div>
                                    )}

                                    {isProcessing && (
                                        <div className="flex items-center gap-2 text-orange-500">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">Processing with Lingo Master Agent...</span>
                                        </div>
                                    )}

                                    {isSpeaking && (
                                        <div className="flex items-center gap-2 text-green-500">
                                            <Volume2 className="h-4 w-4" />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium">Lingo speaking with {selectedVoice.name}</span>
                                                <div className="text-xs text-muted-foreground">{selectedVoice.type} voice • High quality audio</div>
                                            </div>
                                        </div>
                                    )}

                                    {currentTranscript && (
                                        <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                            <strong>You:</strong> {currentTranscript}
                                        </div>
                                    )}

                                    {lingoResponse && (
                                        <div className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                            <strong>Lingo:</strong> {lingoResponse}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )
        }
    }

    return (
        <div className={`${className}`}>
            <div
                ref={widgetRef}
                className={`bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl transition-all duration-300 user-select-none ${isExpanded ? 'w-96 h-[500px]' : 'w-32 h-32'
                    } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                style={{
                    position: 'fixed',
                    top: '120px', // Lower position from header
                    right: '40px', // More margin from right edge
                    zIndex: 9999,
                    userSelect: 'none'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="w-full h-full p-4 text-white">
                    {isExpanded ? (
                        <div className="w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveView('main')}
                                    disabled={activeView === 'main'}
                                    className="text-white hover:bg-white/20"
                                >
                                    {activeView !== 'main' && '← Back'}
                                </Button>
                                <h2 className="text-sm font-bold">Lingo Voice Agent</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setIsExpanded(false); setActiveView('main'); }}
                                    className="text-white hover:bg-white/20"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {renderExpandedContent()}
                            </div>
                        </div>
                    ) : (
                        <div
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer relative"
                            onClick={() => setIsExpanded(true)}
                        >
                            {/* Drag indicator */}
                            <div className="absolute top-1 right-1 opacity-40 text-white text-xs">
                                ❙❙
                            </div>
                            <svg
                                ref={svgRef}
                                id="lingo"
                                className={`bot ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''} ${!isListening && !isSpeaking ? 'idleTalking' : ''} w-20 h-20 mb-2`}
                                viewBox="0 0 320 360"
                                role="img"
                                aria-label="Lingo voice agent: cute robot blinking and talking"
                                style={{
                                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                                    '--noseScale': '1'
                                } as React.CSSProperties}
                            >
                                <defs>
                                    {/* Brand gradients */}
                                    <linearGradient id="grad-purple" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#7a2cff" />
                                        <stop offset="100%" stopColor="#4416b3" />
                                    </linearGradient>
                                    <linearGradient id="grad-green" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#00ff88" />
                                        <stop offset="100%" stopColor="#18c37a" />
                                    </linearGradient>
                                    <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000" floodOpacity=".45" />
                                    </filter>
                                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="6" result="b" />
                                        <feMerge>
                                            <feMergeNode in="b" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Body shadow */}
                                <ellipse cx="160" cy="330" rx="85" ry="20" fill="#000" opacity=".35" filter="url(#softShadow)" />

                                {/* Body */}
                                <g className="body" filter="url(#softShadow)">
                                    <rect x="85" y="240" rx="36" ry="36" width="150" height="80" fill="url(#grad-purple)" />
                                    <text x="160" y="293" textAnchor="middle" fontSize="32" fontWeight="800" fill="url(#grad-green)" style={{ letterSpacing: '1px' }}>LINGO</text>
                                </g>

                                {/* Head */}
                                <g className="head" transform="translate(0,-10)" filter="url(#softShadow)">
                                    {/* head shell */}
                                    <rect className="face-outer" x="40" y="60" rx="40" ry="40" width="240" height="170" fill="url(#grad-purple)" stroke="#00e08a" strokeWidth="3" />
                                    {/* face panel */}
                                    <rect x="62" y="82" rx="28" ry="28" width="196" height="126" fill="#2a1b57" />

                                    {/* Left ear */}
                                    <circle cx="40" cy="145" r="18" fill="url(#grad-green)" />
                                    {/* Right ear */}
                                    <circle cx="280" cy="145" r="18" fill="url(#grad-green)" />

                                    {/* Antenna */}
                                    <line className="antenna" x1="160" y1="50" x2="160" y2="25" stroke="#00ff88" strokeWidth="5" />
                                    <circle className="antenna" cx="160" cy="20" r="10" fill="url(#grad-green)" />

                                    {/* Eyes group */}
                                    <g className="eyes">
                                        {/* sockets */}
                                        <circle cx="115" cy="140" r="26" fill="#1b113e" stroke="#00e08a" strokeWidth="3" />
                                        <circle cx="205" cy="140" r="26" fill="#1b113e" stroke="#00e08a" strokeWidth="3" />
                                        {/* pupils */}
                                        <circle id="pL" className="pupil" cx="115" cy="140" r="12" fill="url(#grad-green)" />
                                        <circle id="pR" className="pupil" cx="205" cy="140" r="12" fill="url(#grad-green)" />
                                        {/* eyelids: we scaleY to blink */}
                                        <g className="eyelids" style={{ transformOrigin: '160px 135px', transition: 'transform 120ms ease' }}>
                                            <rect x="89" y="114" width="52" height="52" rx="26" ry="26" fill="#2a1b57" />
                                            <rect x="179" y="114" width="52" height="52" rx="26" ry="26" fill="#2a1b57" />
                                        </g>
                                    </g>

                                    {/* Nose (voice blob with waveform cut) */}
                                    <g className="nose" transform="translate(140,160)" style={{
                                        transformBox: 'fill-box' as const,
                                        transformOrigin: '50% 60%',
                                        transform: `scale(var(--noseScale, 1))`,
                                        transition: 'transform 80ms linear'
                                    }}>
                                        <path d="M20 0 C32 0 40 8 40 20 C40 32 32 40 20 40 C8 40 0 32 0 20 C0 8 8 0 20 0 Z" fill="url(#grad-green)" />
                                        {/* tiny waveform bars */}
                                        <g fill="#1b113e" transform="translate(8,12)">
                                            <rect x="0" y="4" width="3" height="8" rx="1" />
                                            <rect x="5" y="0" width="3" height="16" rx="1" />
                                            <rect x="10" y="6" width="3" height="6" rx="1" />
                                            <rect x="15" y="2" width="3" height="12" rx="1" />
                                        </g>
                                    </g>

                                    {/* Mouth: rounded rect scales on Y */}
                                    <g className="mouth" transform="translate(130,196)" style={{ transformOrigin: '160px 205px' }}>
                                        <rect
                                            ref={mouthRef}
                                            id="mouthRect"
                                            x="0"
                                            y="0"
                                            width="60"
                                            height="18"
                                            rx="9"
                                            ry="9"
                                            fill="#00ff88"
                                            stroke="#0b0620"
                                            strokeWidth="2.2"
                                            filter="url(#glow)"
                                        />
                                        <rect x="6" y="5" width="48" height="8" rx="4" ry="4" fill="#0d0a24" />
                                    </g>
                                </g>
                            </svg>

                            {/* Voice controls */}
                            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                                    disabled={isProcessing}
                                    className={`p-2 rounded-lg text-sm font-medium ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                        } hover:opacity-90 disabled:opacity-50 transition-colors`}
                                    title={isListening ? 'Stop Listening' : 'Start Voice Chat'}
                                >
                                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={stopVoiceRecognition}
                                    disabled={!isListening && !isProcessing}
                                    className="p-2 rounded-lg text-sm bg-gray-500 hover:bg-gray-600 hover:opacity-90 disabled:opacity-30 transition-colors"
                                    title="Stop All"
                                >
                                    <Pause className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}