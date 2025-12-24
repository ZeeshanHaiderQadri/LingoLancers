

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Speech, Mic, Phone, Settings, Upload, Bot, Play, Music, Copy, Voicemail, Waves } from "lucide-react";
import { TwilioIcon } from "../icons/twilio";


const VoiceoverTab = () => (
    <Card className="bg-card/50 max-w-4xl mx-auto card-gradient-border">
        <CardHeader>
            <CardTitle className="text-gradient-multi text-transparent">AI Voiceover (Text-to-Speech)</CardTitle>
            <CardDescription>Convert any text into natural-sounding speech for your projects.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="tts-text">Text to Synthesize</Label>
                    <Textarea id="tts-text" placeholder="Enter the text you want to convert to speech..." className="h-48" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tts-voice">AI Voice</Label>
                    <Select>
                        <SelectTrigger id="tts-voice"><SelectValue placeholder="Select a voice" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alloy">Alloy (Male, Neutral)</SelectItem>
                            <SelectItem value="nova">Nova (Female, Energetic)</SelectItem>
                            <SelectItem value="shimmer">Shimmer (Female, Professional)</SelectItem>
                            <SelectItem value="echo">Echo (Male, Deep)</SelectItem>
                            <SelectItem value="fable">Fable (Male, Storyteller)</SelectItem>
                            <SelectItem value="onyx">Onyx (Male, Formal)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button className="w-full animated-gradient-border bg-transparent text-white"><Play className="mr-2 h-4 w-4" />Generate Audio</Button>
            </div>
            <div className="space-y-4">
                <Label>Generated Audio</Label>
                <div className="h-full w-full bg-background/50 rounded-md p-4 flex flex-col items-center justify-center space-y-4">
                     <p className="text-muted-foreground text-sm">Your generated audio will appear here.</p>
                     <audio controls className="w-full">
                        {/* The source will be dynamically set */}
                     </audio>
                </div>
            </div>
        </CardContent>
    </Card>
);

const SpeechToTextTab = () => (
    <Card className="bg-card/50 max-w-4xl mx-auto card-gradient-border">
        <CardHeader>
            <CardTitle className="text-gradient-multi text-transparent">AI Speech-to-Text</CardTitle>
            <CardDescription>Transcribe audio files into text with high accuracy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Upload Audio File</Label>
                <Card className="border-dashed border-2 p-8 flex flex-col items-center justify-center text-center bg-transparent">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop an audio file or click to upload</p>
                    <p className="text-xs text-muted-foreground/80">MP3, WAV, M4A, FLAC up to 50MB</p>
                    <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                </Card>
            </div>
             <Button className="w-full animated-gradient-border bg-transparent text-white"><Mic className="mr-2 h-4 w-4" />Transcribe Audio</Button>
             <div className="space-y-2">
                <Label>Transcription Result</Label>
                <Textarea placeholder="The transcribed text will appear here..." className="h-48 bg-background/50" readOnly/>
             </div>
        </CardContent>
    </Card>
);


const VoiceAgentTab = () => (
    <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="bg-card/50 card-gradient-border">
                <CardHeader>
                    <CardTitle className="text-gradient-multi text-transparent">Voice Agent Configuration</CardTitle>
                    <CardDescription>Set up an AI-powered voice agent to handle calls for your web app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-medium flex items-center gap-2"><Bot className="w-5 h-5 text-primary"/>Agent Behavior</h3>
                        <div className="space-y-2">
                            <Label htmlFor="va-prompt">System Prompt / Goal</Label>
                            <Textarea id="va-prompt" placeholder="Define the voice agent's purpose, e.g., 'You are an appointment booking assistant for a dental office...'" className="h-24"/>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="va-voice">AI Voice</Label>
                                <Select>
                                    <SelectTrigger id="va-voice"><SelectValue placeholder="Select a voice" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alloy">Alloy</SelectItem>
                                        <SelectItem value="nova">Nova</SelectItem>
                                        <SelectItem value="shimmer">Shimmer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="va-language">Primary Language</Label>
                                <Select>
                                    <SelectTrigger id="va-language"><SelectValue placeholder="Select a language" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en-us">English (US)</SelectItem>
                                        <SelectItem value="es-mx">Spanish (Mexico)</SelectItem>
                                        <SelectItem value="fr-fr">French (France)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-medium flex items-center gap-2"><Settings className="w-5 h-5 text-primary"/>Advanced Settings</h3>
                         <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="va-interruption">Interruption Threshold (ms)</Label>
                                <Input id="va-interruption" type="number" defaultValue="100" />
                                <p className="text-xs text-muted-foreground">How quickly the agent can be interrupted.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="va-end-timeout">End of Call Timeout (ms)</Label>
                                <Input id="va-end-timeout" type="number" defaultValue="2000" />
                                <p className="text-xs text-muted-foreground">Silence duration before ending call.</p>
                            </div>
                         </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full animated-gradient-border bg-transparent text-white">Save Voice Agent</Button>
                </CardFooter>
            </Card>
        </div>
        <div className="space-y-6">
            <Card className="bg-card/50 card-gradient-border">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <TwilioIcon className="h-8 w-8 text-red-500" />
                        <div>
                            <CardTitle className="text-gradient-multi text-transparent">Twilio Integration</CardTitle>
                            <CardDescription>Connect your Twilio account to enable live calls.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="twilio-sid">Account SID</Label>
                        <Input id="twilio-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="twilio-token">Auth Token</Label>
                        <Input id="twilio-token" type="password" placeholder="••••••••••••••••••••••••" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="twilio-phone">Twilio Phone Number</Label>
                        <Input id="twilio-phone" placeholder="+15551234567" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="twilio-app-sid">TwiML App SID</Label>
                        <Input id="twilio-app-sid" placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                         <p className="text-xs text-muted-foreground">The TwiML Application SID to handle incoming calls.</p>
                    </div>
                    <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white">Save Twilio Settings</Button>
                </CardContent>
            </Card>
        </div>
    </div>
);

const MusicTab = () => (
    <Card className="bg-card/50 max-w-4xl mx-auto card-gradient-border">
        <CardHeader>
            <CardTitle className="text-gradient-multi text-transparent">AI Music Generation</CardTitle>
            <CardDescription>Create royalty-free music from a text prompt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="music-prompt">Describe the music you want to create</Label>
                <Textarea id="music-prompt" placeholder="e.g., 'An upbeat, funky electronic track with a driving bassline, perfect for a tech product video.'" className="h-24" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="music-duration">Duration (seconds)</Label>
                    <Input id="music-duration" type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="music-style">Genre / Style</Label>
                    <Select>
                        <SelectTrigger id="music-style"><SelectValue placeholder="Select a style" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="electronic">Electronic</SelectItem>
                            <SelectItem value="cinematic">Cinematic</SelectItem>
                            <SelectItem value="lofi">Lofi Hip-Hop</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
                            <SelectItem value="ambient">Ambient</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <Button className="w-full animated-gradient-border bg-transparent text-white"><Music className="mr-2 h-4 w-4" />Generate Music</Button>
             <div className="pt-4 space-y-2">
                <Label>Generated Music</Label>
                <div className="h-full w-full bg-background/50 rounded-md p-4 flex flex-col items-center justify-center space-y-4">
                     <p className="text-muted-foreground text-sm">Your generated music track will appear here.</p>
                     <audio controls className="w-full">
                        {/* The source will be dynamically set */}
                     </audio>
                </div>
            </div>
        </CardContent>
    </Card>
);

const VoiceCloneTab = () => (
    <Card className="bg-card/50 max-w-4xl mx-auto card-gradient-border">
        <CardHeader>
            <CardTitle className="text-gradient-multi text-transparent">AI Voice Clone</CardTitle>
            <CardDescription>Create a digital clone of a voice from a short audio sample.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Upload Voice Sample (at least 30 seconds)</Label>
                <Card className="border-dashed border-2 p-8 flex flex-col items-center justify-center text-center bg-transparent">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop a clear, high-quality audio file (no background music)</p>
                    <p className="text-xs text-muted-foreground/80">WAV or MP3</p>
                    <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                </Card>
                <p className="text-xs text-center text-muted-foreground">For ethical reasons, please confirm you have consent to clone this voice.</p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="clone-name">Name Your Cloned Voice</Label>
                <Input id="clone-name" placeholder="e.g., 'My Voice', 'John's Voice'" />
            </div>
             <Button className="w-full animated-gradient-border bg-transparent text-white"><Copy className="mr-2 h-4 w-4" />Create Voice Clone</Button>
        </CardContent>
    </Card>
);

const VoiceIsolatorTab = () => (
     <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <Card className="bg-card/50 card-gradient-border">
            <CardHeader>
                <CardTitle className="text-gradient-multi text-transparent">Upload Audio</CardTitle>
                <CardDescription>Upload a song or audio track to isolate vocals from music.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card className="border-dashed border-2 p-8 flex flex-col items-center justify-center text-center bg-transparent">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop your audio file</p>
                    <p className="text-xs text-muted-foreground/80">MP3, WAV, FLAC</p>
                    <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                </Card>
                <Button className="w-full animated-gradient-border bg-transparent text-white"><Waves className="mr-2 h-4 w-4" />Isolate Tracks</Button>
            </CardContent>
        </Card>
        <div className="space-y-6">
            <Card className="bg-card/50 card-gradient-border">
                <CardHeader>
                    <CardTitle className="text-gradient-multi text-transparent">Isolated Vocals</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <p className="text-sm text-muted-foreground">The isolated vocal track will appear here.</p>
                    <audio controls className="w-full" />
                </CardContent>
            </Card>
             <Card className="bg-card/50 card-gradient-border">
                <CardHeader>
                    <CardTitle className="text-gradient-multi text-transparent">Isolated Music</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <p className="text-sm text-muted-foreground">The isolated instrumental track will appear here.</p>
                    <audio controls className="w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function AiAudioView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "voiceover");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-6 max-w-6xl mx-auto">
                <TabsTrigger value="music"><Music className="mr-2 h-4 w-4"/>AI Music</TabsTrigger>
                <TabsTrigger value="voiceover"><Speech className="mr-2 h-4 w-4"/>AI Voiceover</TabsTrigger>
                <TabsTrigger value="clone"><Voicemail className="mr-2 h-4 w-4"/>AI Voice Clone</TabsTrigger>
                <TabsTrigger value="stt"><Mic className="mr-2 h-4 w-4"/>Speech-to-Text</TabsTrigger>
                <TabsTrigger value="isolator"><Waves className="mr-2 h-4 w-4"/>AI Voice Isolator</TabsTrigger>
                <TabsTrigger value="agent"><Phone className="mr-2 h-4 w-4"/>Voice Agent</TabsTrigger>
            </TabsList>
            <TabsContent value="music" className="flex-1 mt-6"><MusicTab /></TabsContent>
            <TabsContent value="voiceover" className="flex-1 mt-6"><VoiceoverTab /></TabsContent>
            <TabsContent value="clone" className="flex-1 mt-6"><VoiceCloneTab /></TabsContent>
            <TabsContent value="stt" className="flex-1 mt-6"><SpeechToTextTab /></TabsContent>
            <TabsContent value="isolator" className="flex-1 mt-6"><VoiceIsolatorTab /></TabsContent>
            <TabsContent value="agent" className="flex-1 mt-6"><VoiceAgentTab /></TabsContent>
        </Tabs>
    </div>
  );
}
