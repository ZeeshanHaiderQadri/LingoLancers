

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Mic, FileText, Globe, SlidersHorizontal, Settings, BrainCircuit } from "lucide-react";
import UnifiedChatInterface from "../unified-chat-interface";
import { SplitScreenLayout } from "../split-screen-layout";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";

const AiChatPro = () => {
    return (
        <div className="p-4 md:p-6 h-full grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card className="h-full flex flex-col bg-card/50 card-gradient-border">
                    <CardHeader>
                        <CardTitle className="text-gradient-multi text-transparent">AI Chat Pro</CardTitle>
                        <CardDescription>An advanced chat interface with enhanced controls for power users.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <div className="flex-1 bg-background/50 rounded-lg p-4 mb-4 min-h-[300px]">
                            {/* Dummy chat messages */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-primary rounded-full text-primary-foreground"><Bot size={18} /></div>
                                <div className="bg-muted p-3 rounded-lg max-w-xl">
                                    <p className="text-sm">Welcome to Chat Pro. How can I assist you with advanced tasks today?</p>
                                </div>
                            </div>
                        </div>
                         <Textarea placeholder="Type your advanced prompt here..." className="h-24"/>
                         <Button className="mt-4 w-full animated-gradient-border bg-transparent text-white">Send Message</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card className="bg-card/50 card-gradient-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gradient-multi text-transparent"><BrainCircuit size={20} /> Model</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select defaultValue="gemini-2.5-flash">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 card-gradient-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gradient-multi text-transparent"><SlidersHorizontal size={20} /> Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Temperature</Label>
                                <span className="text-sm text-muted-foreground">0.8</span>
                            </div>
                            <Slider defaultValue={[0.8]} max={1} step={0.1} />
                            <p className="text-xs text-muted-foreground">Controls randomness. Higher is more creative.</p>
                        </div>
                         <div className="space-y-2">
                            <Label>System Prompt</Label>
                            <Textarea placeholder="You are a helpful assistant..." className="h-28 text-xs"/>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="bg-card/50 card-gradient-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gradient-multi text-transparent"><Settings size={20} /> Session Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">Clear Chat History</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const AiVoiceChat = () => {
    return (
        <div className="p-4 md:p-6 h-full flex items-center justify-center">
            <Card className="w-full max-w-2xl text-center bg-card/50 card-gradient-border">
                <CardHeader>
                    <CardTitle className="text-gradient-multi text-transparent">Real-time Voice Chat</CardTitle>
                    <CardDescription>Speak directly with the AI. Click the button below to start.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6 p-10">
                     <Button size="icon" className="h-24 w-24 rounded-full animated-gradient-border bg-transparent hover:bg-transparent">
                        <Mic className="h-12 w-12 text-white" />
                     </Button>
                     <p className="text-muted-foreground text-sm">Waiting to start listening...</p>
                </CardContent>
            </Card>
        </div>
    )
}

const AiFileChat = () => {
    return (
        <div className="p-4 md:p-6 h-full grid md:grid-cols-3 gap-6">
            <div className="space-y-6">
                <Card className="bg-card/50 card-gradient-border">
                    <CardHeader>
                        <CardTitle className="text-gradient-multi text-transparent">Chat With Your File</CardTitle>
                        <CardDescription>Upload a file and start asking questions about its content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-dashed border-2 p-6 flex flex-col items-center justify-center text-center rounded-lg">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Drag & drop a file or click to upload</p>
                            <p className="text-xs text-muted-foreground/80">PDF, DOCX, TXT</p>
                            <Button variant="outline" size="sm" className="mt-4">Browse</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                 <Card className="h-full flex flex-col bg-card/50 card-gradient-border">
                    <CardContent className="flex-1 flex flex-col p-4">
                        <div className="flex-1 bg-background/50 rounded-lg p-4 mb-4 min-h-[300px] flex items-center justify-center">
                            <p className="text-muted-foreground">Upload a file to begin the conversation.</p>
                        </div>
                         <Textarea placeholder="Ask a question about the document..."/>
                         <Button className="mt-4 w-full animated-gradient-border bg-transparent text-white">Ask Question</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const AiWebChat = () => {
    return (
        <div className="p-4 md:p-6 h-full flex items-center justify-center">
            <Card className="w-full max-w-3xl bg-card/50 card-gradient-border">
                <CardHeader>
                    <CardTitle className="text-gradient-multi text-transparent">Chat With a Webpage</CardTitle>
                    <CardDescription>Enter a URL and start a conversation about its content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input placeholder="https://example.com" />
                        <Button>Fetch Content</Button>
                    </div>
                    <div className="min-h-[400px] rounded-lg bg-background/50 p-4 flex items-center justify-center">
                         <p className="text-muted-foreground">Content will be loaded here to start chatting.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AiChatView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "agent");
  const [activeWorkflow, setActiveWorkflow] = useState<{
    id: string
    type: 'blog' | 'travel'
  } | null>(null);
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Listen for workflow start events from Lingo Agent
  useEffect(() => {
    const handleWorkflowStart = (event: CustomEvent) => {
      console.log('🚀 Workflow started:', event.detail);
      setActiveWorkflow({
        id: event.detail.workflowId,
        type: event.detail.type
      });
      
      // Set a global flag to prevent automatic navigation
      (window as any).__splitScreenActive = true;
      console.log('🔒 Split-screen mode activated - navigation blocked');
    };
    
    const handleWorkflowComplete = (event: CustomEvent) => {
      console.log('✅ Workflow completed:', event.detail);
      // Keep workflow panel open to show completion
      // User can close it manually
      // DON'T clear the flag - keep split-screen active
    };
    
    window.addEventListener('workflow-started', handleWorkflowStart as EventListener);
    window.addEventListener('workflow-completed', handleWorkflowComplete as EventListener);
    
    return () => {
      window.removeEventListener('workflow-started', handleWorkflowStart as EventListener);
      window.removeEventListener('workflow-completed', handleWorkflowComplete as EventListener);
      // Clear the flag when component unmounts
      (window as any).__splitScreenActive = false;
    };
  }, []);

  return (
    <div className="h-full relative">
      {activeTab === "agent" ? (
        <SplitScreenLayout
          chatContent={<UnifiedChatInterface />}
          workflowId={activeWorkflow?.id}
          workflowType={activeWorkflow?.type}
          onClose={() => {
            setActiveWorkflow(null);
            // Clear the split-screen flag when closing
            (window as any).__splitScreenActive = false;
            console.log('🔓 Split-screen closed - navigation enabled');
          }}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-5 max-w-5xl mx-auto">
                <TabsTrigger value="agent">
                    <Bot className="mr-2 h-4 w-4" /> AI Agent
                </TabsTrigger>
                <TabsTrigger value="pro">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Chat Pro
                </TabsTrigger>
                <TabsTrigger value="voice">
                    <Mic className="mr-2 h-4 w-4" /> Voice Chat
                </TabsTrigger>
                <TabsTrigger value="file">
                    <FileText className="mr-2 h-4 w-4" /> File Chat
                </TabsTrigger>
                 <TabsTrigger value="web">
                    <Globe className="mr-2 h-4 w-4" /> Web Chat
                </TabsTrigger>
            </TabsList>

            <TabsContent value="agent" className="flex-1 mt-2">
              {/* This content is handled by the conditional rendering above */}
            </TabsContent>

            <TabsContent value="pro" className="flex-1 mt-2">
                <AiChatPro />
            </TabsContent>
            
            <TabsContent value="voice" className="flex-1 mt-2">
                <AiVoiceChat />
            </TabsContent>
            
            <TabsContent value="file" className="flex-1 mt-2">
                <AiFileChat />
            </TabsContent>

            <TabsContent value="web" className="flex-1 mt-2">
                <AiWebChat />
            </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
