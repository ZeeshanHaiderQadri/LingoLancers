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
import DeepgramVoiceService, { type SpeechResult } from '@/lib/deepgram-service';
import { lingoAPI } from '@/lib/lingo-api';
import { autogenTeamsService } from '@/lib/autogen-teams-service';

// Real Deepgram Aura voices from official documentation
const deepgramVoices = [
    { 
        name: 'Thalia', 
        image: 'https://picsum.photos/seed/thalia/100/100', 
        imageHint: 'professional female voice', 
        ethnicity: 'American', 
        gender: 'Female', 
        age: 'Adult', 
        type: 'Professional', 
        languages: ['English'], 
        model: 'aura-2-thalia-en', 
        characteristics: 'Clear, Confident, Energetic, Enthusiastic',
        useCases: 'Casual chat, customer service, IVR'
    },
    { 
        name: 'Apollo', 
        image: 'https://picsum.photos/seed/apollo/100/100', 
        imageHint: 'confident male voice', 
        ethnicity: 'American', 
        gender: 'Male', 
        age: 'Adult', 
        type: 'Confident', 
        languages: ['English'], 
        model: 'aura-2-apollo-en', 
        characteristics: 'Confident, Comfortable, Casual',
        useCases: 'Casual chat'
    },
    { 
        name: 'Helena', 
        image: 'https://picsum.photos/seed/helena/100/100', 
        imageHint: 'caring female voice', 
        ethnicity: 'American', 
        gender: 'Female', 
        age: 'Adult', 
        type: 'Caring', 
        languages: ['English'], 
        model: 'aura-2-helena-en', 
        characteristics: 'Caring, Natural, Positive, Friendly, Raspy',
        useCases: 'IVR, casual chat'
    },
    { 
        name: 'Arcas', 
        image: 'https://picsum.photos/seed/arcas/100/100', 
        imageHint: 'smooth male voice', 
        ethnicity: 'American', 
        gender: 'Male', 
        age: 'Adult', 
        type: 'Smooth', 
        languages: ['English'], 
        model: 'aura-2-arcas-en', 
        characteristics: 'Natural, Smooth, Clear, Comfortable',
        useCases: 'Customer service, casual chat'
    },
    { 
        name: 'Aurora', 
        image: 'https://picsum.photos/seed/aurora/100/100', 
        imageHint: 'energetic female voice', 
        ethnicity: 'American', 
        gender: 'Female', 
        age: 'Adult', 
        type: 'Energetic', 
        languages: ['English'], 
        model: 'aura-2-aurora-en', 
        characteristics: 'Cheerful, Expressive, Energetic',
        useCases: 'Interview'
    },
    { 
        name: 'Orion', 
        image: 'https://picsum.photos/seed/orion/100/100', 
        imageHint: 'professional male voice', 
        ethnicity: 'American', 
        gender: 'Male', 
        age: 'Adult', 
        type: 'Professional', 
        languages: ['English'], 
        model: 'aura-2-orion-en', 
        characteristics: 'Approachable, Comfortable, Calm, Polite',
        useCases: 'Informative'
    },
    { 
        name: 'Luna', 
        image: 'https://picsum.photos/seed/luna/100/100', 
        imageHint: 'friendly female voice', 
        ethnicity: 'American', 
        gender: 'Female', 
        age: 'Young Adult', 
        type: 'Friendly', 
        languages: ['English'], 
        model: 'aura-2-luna-en', 
        characteristics: 'Friendly, Natural, Engaging',
        useCases: 'IVR'
    },
    { 
        name: 'Zeus', 
        image: 'https://picsum.photos/seed/zeus/100/100', 
        imageHint: 'deep male voice', 
        ethnicity: 'American', 
        gender: 'Male', 
        age: 'Adult', 
        type: 'Authoritative', 
        languages: ['English'], 
        model: 'aura-2-zeus-en', 
        characteristics: 'Deep, Trustworthy, Smooth',
        useCases: 'IVR'
    },
    { 
        name: 'Pandora', 
        image: 'https://picsum.photos/seed/pandora/100/100', 
        imageHint: 'british female voice', 
        ethnicity: 'British', 
        gender: 'Female', 
        age: 'Adult', 
        type: 'Elegant', 
        languages: ['English'], 
        model: 'aura-2-pandora-en', 
        characteristics: 'Smooth, Calm, Melodic, Breathy',
        useCases: 'IVR, informative'
    },
    { 
        name: 'Celeste', 
        image: 'https://picsum.photos/seed/celeste/100/100', 
        imageHint: 'spanish female voice', 
        ethnicity: 'Colombian', 
        gender: 'Female', 
        age: 'Young Adult', 
        type: 'Vibrant', 
        languages: ['Spanish', 'English'], 
        model: 'aura-2-celeste-es', 
        characteristics: 'Clear, Energetic, Positive, Friendly, Enthusiastic',
        useCases: 'Casual Chat, Advertising, IVR'
    }
];

interface VoiceSelectionViewProps {
    selectedVoice: typeof deepgramVoices[0];
    onVoiceSelect: (voice: typeof deepgramVoices[0]) => void;
    deepgramService: DeepgramVoiceService | null;
}

const VoiceSelectionView: React.FC<VoiceSelectionViewProps> = ({ selectedVoice, onVoiceSelect, deepgramService }) => {
    const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
    const { toast } = useToast();

    const previewVoice = async (voice: typeof deepgramVoices[0]) => {
        if (!deepgramService) {
            toast({
                title: "Preview Unavailable",
                description: "Deepgram service not initialized. Please check your API key.",
                variant: "destructive",
            });
            return;
        }

        try {
            setPreviewingVoice(voice.model);
            
            // Create unique sample text for each voice
            const sampleTexts = {
                'Thalia': "Hi there! I'm Thalia, your energetic and confident assistant. Ready to help with professional communication!",
                'Apollo': "Hello! I'm Apollo, bringing you a comfortable and casual conversational experience.",
                'Helena': "Hi! I'm Helena, your caring and friendly voice for warm, positive interactions.",
                'Arcas': "Greetings! I'm Arcas, offering smooth and clear communication for all your needs.",
                'Aurora': "Hey there! I'm Aurora, your cheerful and expressive voice bringing energy to every conversation!",
                'Orion': "Hello! I'm Orion, your calm and professional voice for informative discussions.",
                'Luna': "Hi! I'm Luna, your friendly and engaging companion for natural conversations.",
                'Zeus': "Greetings! I'm Zeus, providing deep, trustworthy communication with authority.",
                'Pandora': "Hello! I'm Pandora, offering elegant British sophistication for your conversations.",
                'Celeste': "¡Hola! I'm Celeste, bringing vibrant Spanish-English bilingual communication!"
            };
            
            const sampleText = sampleTexts[voice.name as keyof typeof sampleTexts] || `Hello! I'm ${voice.name}, your ${voice.type.toLowerCase()} voice assistant.`;
            
            if ('speechSynthesis' in window) {
                // Use browser's built-in speech synthesis for preview
                const utterance = new SpeechSynthesisUtterance(sampleText);
                
                // Configure voice characteristics based on Deepgram voice profile
                utterance.rate = voice.name === 'Aurora' ? 1.1 : voice.name === 'Zeus' ? 0.8 : 0.9;
                utterance.pitch = voice.gender === 'Female' ? 
                    (voice.name === 'Pandora' ? 0.9 : 1.1) : 
                    (voice.name === 'Zeus' ? 0.7 : 0.8);
                utterance.volume = 0.8;
                
                // Try to find a voice that matches the characteristics
                const voices = speechSynthesis.getVoices();
                let matchingVoice;
                
                if (voice.ethnicity === 'British') {
                    matchingVoice = voices.find(v => v.lang.includes('en-GB') && v.name.toLowerCase().includes(voice.gender.toLowerCase()));
                } else if (voice.ethnicity === 'Colombian') {
                    matchingVoice = voices.find(v => v.lang.includes('es') || v.name.toLowerCase().includes('spanish'));
                }
                
                if (!matchingVoice) {
                    matchingVoice = voices.find(v => 
                        v.lang.includes('en') && 
                        v.name.toLowerCase().includes(voice.gender.toLowerCase())
                    ) || voices.find(v => v.lang.includes('en'));
                }
                
                if (matchingVoice) {
                    utterance.voice = matchingVoice;
                }
                
                speechSynthesis.speak(utterance);
                
                toast({
                    title: `🎤 ${voice.name} Preview`,
                    description: `${voice.characteristics} - Browser preview active. Use main Talk button for Deepgram quality!`,
                });
            } else {
                throw new Error('Speech synthesis not supported in this browser');
            }
        } catch (error: any) {
            console.error('Voice preview error:', error);
            toast({
                title: "❌ Preview Failed",
                description: "Browser voice preview unavailable. Use the main Talk button for full Deepgram experience!",
                variant: "destructive",
            });
        } finally {
            setPreviewingVoice(null);
        }
    };

    return (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {deepgramVoices.map(voice => (
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
                                <span>{voice.languages.join(', ')}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{voice.characteristics}</p>
                            <p className="text-xs text-blue-600">Use cases: {voice.useCases}</p>
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
                                {previewingVoice === voice.model ? 'Playing...' : 'Preview'}
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
    const deepgramServiceRef = useRef<DeepgramVoiceService | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const dragRef = useRef({ active: false, offX: 0, offY: 0 });
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeView, setActiveView] = useState('main');
    const [selectedVoice, setSelectedVoice] = useState(deepgramVoices[0]);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [lingoResponse, setLingoResponse] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const { toast } = useToast();

    // Enhanced voice selection handler
    const handleVoiceSelect = useCallback((voice: typeof deepgramVoices[0]) => {
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

    // Initialize Deepgram service with Flux enabled
    useEffect(() => {
        try {
            // Enable Flux for ultra-low latency and advanced turn detection
            deepgramServiceRef.current = new DeepgramVoiceService(undefined, true);
            setIsConnected(true);
            
            // Check if running in development mode
            const isDevelopmentMode = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' && 
                                      process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
            
            if (isDevelopmentMode) {
                toast({
                    title: "👥 Development Mode Active",
                    description: "Mock voice recognition enabled. Get a real Deepgram API key for full functionality!",
                });
            } else {
                toast({
                    title: "🚀 Lingo Agent Ready",
                    description: "Advanced voice agent with Flux streaming enabled.",
                });
            }
        } catch (error: any) {
            console.error('❌ Failed to initialize Deepgram service:', error);
            setIsConnected(false);
            
            // Check if it's an API key issue
            if (error.message.includes('API key')) {
                toast({
                    title: "🔑 API Key Required",
                    description: "Please set up your Deepgram API key in .env.local file. Check the setup guide!",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "❌ Setup Error",
                    description: error.message || "Please check your Deepgram configuration.",
                    variant: "destructive",
                });
            }
        }
    }, [toast]);

    // Handle voice input processing with Autogen Teams integration
    const handleVoiceInput = useCallback(async (transcript: string) => {
        setIsProcessing(true);
        // Don't stop listening here - keep it active for continuous conversation
        
        try {
            console.log('🎤 Processing voice input with teams integration:', transcript);
            
            // First, check if this is a team command using Autogen Teams service
            const teamCommand = await autogenTeamsService.processVoiceCommand(transcript);
            
            if (teamCommand.success && teamCommand.data?.team) {
                console.log('🚀 Team command detected:', teamCommand.data.team.name);
                
                // Show team launch notification
                toast({
                    title: `🚀 Launching ${teamCommand.data.team.name}`,
                    description: teamCommand.data.team.description,
                });
                
                // Set the team response
                setLingoResponse(teamCommand.data.response);
                
                // Handle text-to-speech for team response
                if (deepgramServiceRef.current && selectedVoice) {
                    try {
                        setIsSpeaking(true);
                        
                        await deepgramServiceRef.current.browserTextToSpeech(teamCommand.data.response, {
                            gender: selectedVoice.gender as 'Male' | 'Female',
                            accent: selectedVoice.ethnicity === 'British' ? 'en-GB' : 
                                    selectedVoice.ethnicity === 'Colombian' ? 'es' : 'en-US',
                            rate: selectedVoice.name === 'Aurora' ? 1.0 : 
                                  selectedVoice.name === 'Zeus' ? 0.8 : 0.9,
                            pitch: selectedVoice.gender === 'Female' ? 
                                   (selectedVoice.name === 'Pandora' ? 1.0 : 1.1) : 
                                   (selectedVoice.name === 'Zeus' ? 0.8 : 0.9),
                            voiceName: selectedVoice.name
                        });
                        
                    } catch (speechError: any) {
                        if (!speechError.message?.includes('interrupted') && !speechError.message?.includes('canceled')) {
                            console.error('Speech synthesis error:', speechError);
                        }
                    } finally {
                        setIsSpeaking(false);
                        // IMPORTANT: After team response, continue listening for more commands
                        console.log('✅ Team response completed, continuing to listen for next command...');
                        
                        // Provide feedback that we're ready for more team commands
                        setTimeout(() => {
                            if (isListening) {
                                toast({
                                    title: "🚀 Team Ready",
                                    description: "What else can I help you with?",
                                });
                            }
                        }, 1000);
                    }
                }
                
                setCurrentTranscript('');
                setIsProcessing(false);
                // DON'T stop listening - continue for natural conversation flow
                console.log('🔄 Team command processed, continuing conversation...');
                return;
            }
            
            // Enhanced processing with function calling capabilities
            const response = await lingoAPI.sendVoiceMessage(
                transcript,
                (partialResponse) => {
                    // Handle real-time function calls and status updates
                    if (partialResponse.includes('🚀')) {
                        // Team launch detected
                        toast({
                            title: "🚀 Team Launching",
                            description: partialResponse,
                        });
                    } else if (partialResponse.includes('🤖')) {
                        // Agent processing update
                        toast({
                            title: "🤖 Lingo Processing",
                            description: partialResponse,
                        });
                    }
                },
                'high' // High priority for voice messages
            );
            
            if (response.success && response.data) {
                setLingoResponse(response.data);
                
                // Enhanced text-to-speech with voice agent configuration and interruption handling
                if (deepgramServiceRef.current && selectedVoice) {
                    try {
                        setIsSpeaking(true);
                        
                        // Use enhanced browser speech synthesis with proper voice mapping
                        await deepgramServiceRef.current.browserTextToSpeech(response.data, {
                            gender: selectedVoice.gender as 'Male' | 'Female',
                            accent: selectedVoice.ethnicity === 'British' ? 'en-GB' : 
                                    selectedVoice.ethnicity === 'Colombian' ? 'es' : 'en-US',
                            rate: selectedVoice.name === 'Aurora' ? 1.0 : 
                                  selectedVoice.name === 'Zeus' ? 0.8 : 0.9,
                            pitch: selectedVoice.gender === 'Female' ? 
                                   (selectedVoice.name === 'Pandora' ? 1.0 : 1.1) : 
                                   (selectedVoice.name === 'Zeus' ? 0.8 : 0.9),
                            voiceName: selectedVoice.name // Pass the selected voice name for mapping
                        });
                        
                        // Speech completed successfully (or was interrupted, which is also fine)
                        console.log('✅ Speech synthesis completed or interrupted');
                        
                    } catch (speechError: any) {
                        // Only log actual errors, not interruptions
                        if (!speechError.message?.includes('interrupted') && !speechError.message?.includes('canceled')) {
                            console.error('Actual speech synthesis error:', speechError);
                        } else {
                            console.log('🛑 Speech was interrupted - continuing conversation');
                        }
                    } finally {
                        setIsSpeaking(false);
                        // CRITICAL: After AI finishes speaking, ensure we continue listening
                        console.log('✅ AI speech completed, automatically continuing to listen for user input...');
                        
                        // Provide clear feedback that we're ready for more input
                        setTimeout(() => {
                            if (isListening) {
                                toast({
                                    title: "🎙️ Ready for Next Input",
                                    description: "I'm listening! Continue the conversation...",
                                });
                            }
                        }, 1000);
                    }
                }
                
                toast({
                    title: "✅ Request Completed",
                    description: "Continue talking for more conversation!",
                });
                
                // Clear transcript for next input but keep listening active
                setCurrentTranscript('');
                
            } else {
                throw new Error(response.error || 'Failed to process request');
            }
            
        } catch (error: any) {
            console.error('Processing error:', error);
            
            // Check if it's a backend connection issue
            if (error.message.includes('Failed to fetch') || error.message.includes('Failed to create task') || error.message.includes('network')) {
                const fallbackResponse = `I heard you say: "${transcript}"

🔌 Backend connection issue detected. I'm running in development mode with intelligent fallback responses.

🚀 To unlock full team coordination: Start the Lingo Master backend at http://localhost:8001`;
                setLingoResponse(fallbackResponse);
                
                toast({
                    title: "🔌 Backend Offline",
                    description: "Using development mode. Keep talking for continuous conversation!",
                    variant: "destructive",
                });
            } else {
                // Enhanced fallback response
                const fallbackResponse = `I heard you say: "${transcript}". I'm currently in demo mode. Please ensure your Lingo Master backend is running for full functionality.`;
                setLingoResponse(fallbackResponse);
                
                toast({
                    title: "⚠️ Demo Mode Active",
                    description: "Backend connection needed. Keep talking!",
                    variant: "destructive",
                });
            }
            
            // Clear transcript for next input
            setCurrentTranscript('');
        } finally {
            setIsProcessing(false);
            // Keep listening active for continuous conversation
        }
    }, [selectedVoice, toast]);

    // Enhanced voice service integration with interruption detection
    const startVoiceRecognition = useCallback(async () => {
        try {
            if (!deepgramServiceRef.current) {
                toast({
                    title: "Service Error",
                    description: "Deepgram service not initialized. Please check your API key configuration.",
                    variant: "destructive",
                });
                return;
            }

            // CRITICAL: Request microphone permission FIRST - this will show the browser popup
            console.log('🎤 Requesting microphone permission...');
            
            let microphoneStream: MediaStream;
            try {
                // This line will trigger the browser's microphone permission popup
                microphoneStream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 16000
                    } 
                });
                
                console.log('✅ Microphone permission granted!');
                
                toast({
                    title: "🎤 Microphone Connected",
                    description: "Permission granted! Starting voice recognition...",
                });
                
            } catch (micError: any) {
                console.error('❌ Microphone permission denied:', micError);
                toast({
                    title: "🚫 Microphone Access Required",
                    description: `Cannot access microphone: ${micError.message}. Please allow microphone access and try again.`,
                    variant: "destructive",
                });
                return;
            }

            setIsListening(true);
            setCurrentTranscript('');
            
            try {
                // Enhanced voice recognition with interruption handling
                const stream = await deepgramServiceRef.current.startListening(
                    {
                        model: 'flux-general-en',
                        language: 'en-US',
                        smart_format: true,
                        interim_results: true,
                        endpointing: 200,
                        flux_enabled: true,
                        turn_detection: true,
                        early_responses: true,
                        channels: 1,
                        sample_rate: 16000
                    },
                    (result: SpeechResult) => {
                        if (result.transcript.trim()) {
                            setCurrentTranscript(result.transcript);
                            console.log('🎙️ Transcript:', result.transcript);
                            
                            // Enhanced interruption detection - more sensitive and responsive
                            if (isSpeaking && result.transcript.length > 3) {
                                console.log('🛑 User started speaking during AI response - IMMEDIATE interruption!');
                                // Immediately stop current speech synthesis
                                if ('speechSynthesis' in window) {
                                    speechSynthesis.cancel();
                                    console.log('⚙️ Speech synthesis cancelled immediately');
                                }
                                setIsSpeaking(false);
                                setIsProcessing(false);
                                
                                // Clear any pending responses
                                setLingoResponse('');
                                
                                // Show immediate feedback
                                toast({
                                    title: "🛑 Interrupted",
                                    description: "I'm listening to what you're saying now...",
                                });
                            }
                            
                            if (result.is_final || result.is_end_of_turn) {
                                handleVoiceInput(result.transcript);
                            }
                        }
                    },
                    (error: Error) => {
                        console.error('Voice recognition error:', error);
                                                
                        // Only show user-facing errors for critical issues
                        if (error.message.includes('permission') || 
                            error.message.includes('not-allowed') ||
                            error.message.includes('microphone access')) {
                            toast({
                                title: "Microphone Access Required",
                                description: error.message,
                                variant: "destructive",
                            });
                            setIsListening(false);
                        } else if (error.message.includes('Voice recognition stopped')) {
                            toast({
                                title: "Voice Chat Paused",
                                description: "Click the Talk button to resume voice conversation.",
                            });
                            setIsListening(false);
                        } else {
                            // For other errors (like 'no-speech'), just log them without stopping
                            console.log('Non-critical voice error (continuing):', error.message);
                            // Don't set isListening to false for non-critical errors
                        }
                    },
                    (turnId: string) => {
                        console.log('🎙️ Turn ended:', turnId);
                        toast({
                            title: "🎙️ Turn Complete",
                            description: "Processing your request...",
                        });
                    }
                );
                
                // Store the stream for cleanup
                streamRef.current = stream;
                
                toast({
                    title: "🎙️ Voice Recognition Active",
                    description: `Speaking with ${selectedVoice.name}. Start talking!`,
                });
                
            } catch (deepgramError: any) {
                console.error('Deepgram error:', deepgramError);
                
                // Stop the microphone stream if Deepgram fails
                microphoneStream.getTracks().forEach(track => track.stop());
                
                // Check for API key issues
                if (deepgramError.message.includes('API key') || deepgramError.message.includes('unauthorized') || deepgramError.message.includes('403')) {
                    toast({
                        title: "🔑 API Key Error",
                        description: "Invalid Deepgram API key. Please set NEXT_PUBLIC_DEEPGRAM_API_KEY in .env.local",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "🌐 Connection Error",
                        description: `Deepgram connection failed: ${deepgramError.message}`,
                        variant: "destructive",
                    });
                }
                
                setIsListening(false);
                setIsConnected(false);
            }
            
        } catch (error: any) {
            console.error('Unexpected error:', error);
            toast({
                title: "❌ Unexpected Error",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
            setIsListening(false);
            setIsConnected(false);
        }
    }, [selectedVoice, toast, handleVoiceInput, isSpeaking]);

    const stopVoiceRecognition = useCallback(() => {
        console.log('🚫 Stopping voice recognition and speech...');
        
        // Stop voice recognition
        if (deepgramServiceRef.current) {
            deepgramServiceRef.current.stopListening();
        }
        
        // Stop microphone stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // Immediately stop any ongoing speech synthesis
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            console.log('🔇 Interrupted ongoing speech');
        }
        
        // Reset all states
        setIsListening(false);
        setIsProcessing(false);
        setIsSpeaking(false);
        setCurrentTranscript('');
        
        toast({
            title: "Voice Stopped",
            description: "Voice recognition and speech have been stopped.",
        });
    }, [toast]);

    // Enhanced animation functions for the new Lingo Master Agent
    const setTalkAmount = useCallback((amount: number) => {
        const mouth = mouthRef.current;
        const svg = svgRef.current;
        
        if (mouth && svg) {
            // a is 0..1
            const minH = 4, maxH = 38; // mouth vertical expansion
            const h = minH + (maxH - minH) * amount;
            mouth.setAttribute('height', h.toFixed(2));
            mouth.setAttribute('y', (9 - h/2).toFixed(2));
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
            const nx = (mx/box.width)*320; // normalize to viewBox units
            const ny = (my/box.height)*360;
            const faceCenter = {x:160, y:140};
            const dx = Math.max(-r, Math.min(r, (nx - faceCenter.x)/18));
            const dy = Math.max(-r, Math.min(r, (ny - faceCenter.y)/18));
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
        switch(activeView) {
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
                className={`bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl transition-all duration-300 user-select-none ${
                    isExpanded ? 'w-96 h-[500px]' : 'w-32 h-32'
                } ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
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
                                        <stop offset="0%" stopColor="#7a2cff"/>
                                        <stop offset="100%" stopColor="#4416b3"/>
                                    </linearGradient>
                                    <linearGradient id="grad-green" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#00ff88"/>
                                        <stop offset="100%" stopColor="#18c37a"/>
                                    </linearGradient>
                                    <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000" floodOpacity=".45"/>
                                    </filter>
                                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="6" result="b"/>
                                        <feMerge>
                                            <feMergeNode in="b"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Body shadow */}
                                <ellipse cx="160" cy="330" rx="85" ry="20" fill="#000" opacity=".35" filter="url(#softShadow)"/>

                                {/* Body */}
                                <g className="body" filter="url(#softShadow)">
                                    <rect x="85" y="240" rx="36" ry="36" width="150" height="80" fill="url(#grad-purple)"/>
                                    <text x="160" y="293" textAnchor="middle" fontSize="32" fontWeight="800" fill="url(#grad-green)" style={{letterSpacing:'1px'}}>LINGO</text>
                                </g>

                                {/* Head */}
                                <g className="head" transform="translate(0,-10)" filter="url(#softShadow)">
                                    {/* head shell */}
                                    <rect className="face-outer" x="40" y="60" rx="40" ry="40" width="240" height="170" fill="url(#grad-purple)" stroke="#00e08a" strokeWidth="3"/>
                                    {/* face panel */}
                                    <rect x="62" y="82" rx="28" ry="28" width="196" height="126" fill="#2a1b57"/>

                                    {/* Left ear */}
                                    <circle cx="40" cy="145" r="18" fill="url(#grad-green)"/>
                                    {/* Right ear */}
                                    <circle cx="280" cy="145" r="18" fill="url(#grad-green)"/>

                                    {/* Antenna */}
                                    <line className="antenna" x1="160" y1="50" x2="160" y2="25" stroke="#00ff88" strokeWidth="5"/>
                                    <circle className="antenna" cx="160" cy="20" r="10" fill="url(#grad-green)"/>

                                    {/* Eyes group */}
                                    <g className="eyes">
                                        {/* sockets */}
                                        <circle cx="115" cy="140" r="26" fill="#1b113e" stroke="#00e08a" strokeWidth="3"/>
                                        <circle cx="205" cy="140" r="26" fill="#1b113e" stroke="#00e08a" strokeWidth="3"/>
                                        {/* pupils */}
                                        <circle id="pL" className="pupil" cx="115" cy="140" r="12" fill="url(#grad-green)"/>
                                        <circle id="pR" className="pupil" cx="205" cy="140" r="12" fill="url(#grad-green)"/>
                                        {/* eyelids: we scaleY to blink */}
                                        <g className="eyelids" style={{transformOrigin: '160px 135px', transition: 'transform 120ms ease'}}>
                                            <rect x="89" y="114" width="52" height="52" rx="26" ry="26" fill="#2a1b57"/>
                                            <rect x="179" y="114" width="52" height="52" rx="26" ry="26" fill="#2a1b57"/>
                                        </g>
                                    </g>

                                    {/* Nose (voice blob with waveform cut) */}
                                    <g className="nose" transform="translate(140,160)" style={{
                                        transformBox: 'fill-box' as const,
                                        transformOrigin: '50% 60%',
                                        transform: `scale(var(--noseScale, 1))`,
                                        transition: 'transform 80ms linear'
                                    }}>
                                        <path d="M20 0 C32 0 40 8 40 20 C40 32 32 40 20 40 C8 40 0 32 0 20 C0 8 8 0 20 0 Z" fill="url(#grad-green)"/>
                                        {/* tiny waveform bars */}
                                        <g fill="#1b113e" transform="translate(8,12)">
                                            <rect x="0" y="4" width="3" height="8" rx="1"/>
                                            <rect x="5" y="0" width="3" height="16" rx="1"/>
                                            <rect x="10" y="6" width="3" height="6" rx="1"/>
                                            <rect x="15" y="2" width="3" height="12" rx="1"/>
                                        </g>
                                    </g>

                                    {/* Mouth: rounded rect scales on Y */}
                                    <g className="mouth" transform="translate(130,196)" style={{transformOrigin: '160px 205px'}}>
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
                                        <rect x="6" y="5" width="48" height="8" rx="4" ry="4" fill="#0d0a24"/>
                                    </g>
                                </g>
                            </svg>
                            
                            {/* Voice controls */}
                            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                                    disabled={isProcessing}
                                    className={`p-2 rounded-lg text-sm font-medium ${
                                        isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
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