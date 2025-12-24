

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Mic, User, Database, Palette, Shield, MessageSquare, Upload, SlidersHorizontal, Share2, Component } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
        <Card className="relative bg-card/80 backdrop-blur-sm hover:shadow-primary/10 transition-all shadow-md h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>
                <div>
                    <CardTitle className="font-headline text-lg">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </div>
);


export default function SmartBotsView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "chat-bot");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
                <TabsTrigger value="chat-bot">
                    <Bot className="mr-2 h-4 w-4" /> AI Chat Bot
                </TabsTrigger>
                <TabsTrigger value="voice-bot">
                    <Mic className="mr-2 h-4 w-4" /> AI Voice Bot
                </TabsTrigger>
                <TabsTrigger value="human-agent">
                    <User className="mr-2 h-4 w-4" /> Human Agent
                </TabsTrigger>
            </TabsList>
            <TabsContent value="chat-bot" className="flex-1 mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle>Create & Train Chatbot</CardTitle>
                            <CardDescription>Build a new chatbot and train it on your data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bot-name">Bot Name</Label>
                                <Input id="bot-name" placeholder="e.g., 'Customer Support Bot'" />
                            </div>
                            <div className="space-y-2">
                                <Label>Training Data</Label>
                                <Card className="border-dashed border-2 p-6 flex flex-col items-center justify-center text-center">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop files or click to upload</p>
                                    <p className="text-xs text-muted-foreground/80">PDF, DOCX, TXT, CSV up to 25MB</p>
                                    <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                                </Card>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prompt">System Prompt</Label>
                                <Textarea id="prompt" placeholder="Define the bot's personality and instructions..." className="h-32" />
                            </div>
                            <Button className="w-full animated-gradient-border bg-transparent text-white">Create & Train Bot</Button>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                       <FeatureCard icon={<Database className="w-6 h-6" />} title="Knowledge Base" description="Connect your existing databases and documentation to provide instant, accurate answers." />
                       <FeatureCard icon={<Palette className="w-6 h-6" />} title="Custom Appearance" description="Customize the chat widget's colors, branding, and position to match your website's design." />
                       <FeatureCard icon={<Share2 className="w-6 h-6" />} title="Multi-channel Integration" description="Deploy your chatbot on your website, WhatsApp, Telegram, Messenger, and more." />
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="voice-bot" className="flex-1 mt-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-card/50">
                        <CardHeader>
                            <CardTitle>Configure Voice Bot</CardTitle>
                            <CardDescription>Set up a conversational voice agent.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="voice-bot-name">Bot Name</Label>
                                <Input id="voice-bot-name" placeholder="e.g., 'Appointment Booker'" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="voice">Voice Selection</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select a voice" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alloy">Alloy (Male)</SelectItem>
                                        <SelectItem value="echo">Echo (Male)</SelectItem>
                                        <SelectItem value="fable">Fable (Male)</SelectItem>
                                        <SelectItem value="onyx">Onyx (Male)</SelectItem>
                                        <SelectItem value="nova">Nova (Female)</SelectItem>
                                        <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="voice-prompt">Conversation Goal</Label>
                                <Textarea id="voice-prompt" placeholder="e.g., 'Your goal is to book a dental appointment for the user...'" className="h-32" />
                            </div>
                            <Button className="w-full animated-gradient-border bg-transparent text-white">Save Voice Bot</Button>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <FeatureCard icon={<SlidersHorizontal className="w-6 h-6" />} title="Advanced Controls" description="Adjust speed, pitch, and emotion. Add custom pauses and pronunciations for fine-tuned control." />
                       <FeatureCard icon={<Component className="w-6 h-6" />} title="Function Calling" description="Enable the bot to perform actions by integrating with your APIs, like checking order status or making reservations." />
                       <FeatureCard icon={<MessageSquare className="w-6 h-6" />} title="Real-time Transcription" description="View a live transcript of the conversation between the user and the voice bot." />
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="human-agent" className="flex-1 mt-6">
                <Card className="max-w-3xl mx-auto bg-card/50">
                    <CardHeader>
                        <CardTitle>Human Agent Handoff</CardTitle>
                        <CardDescription>Configure the rules and availability for escalating a conversation to a human agent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Handoff Triggers</Label>
                            <p className="text-sm text-muted-foreground">Set up keywords or scenarios that will automatically trigger a handoff to a live agent. (e.g., "speak to human", "complaint", multiple failed intents).</p>
                             <Input placeholder="Enter keywords, separated by commas" />
                        </div>
                         <div className="space-y-2">
                            <Label>Agent Availability</Label>
                            <p className="text-sm text-muted-foreground">Define business hours when live agents are available. Outside these hours, the bot will take a message.</p>
                             <Button variant="outline">Set Business Hours</Button>
                        </div>
                        <div className="space-y-2">
                            <Label>Agent Routing</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select a routing strategy" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="round-robin">Round Robin</SelectItem>
                                    <SelectItem value="least-active">Least Active</SelectItem>
                                    <SelectItem value="department-based">Department-based</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <Button className="w-full animated-gradient-border bg-transparent text-white">Save Handoff Settings</Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
