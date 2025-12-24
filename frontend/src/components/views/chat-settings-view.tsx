
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Folder, FileText, BrainCircuit, MessageCircle, Bot, Mic, PlusCircle, Trash2, Upload, Edit } from "lucide-react";

const ChatCategoriesTab = () => {
    const categories = [
        { id: 1, name: "Sales Inquiries", templateCount: 5 },
        { id: 2, name: "Technical Support", templateCount: 12 },
        { id: 3, name: "Onboarding", templateCount: 8 },
        { id: 4, name: "General FAQs", templateCount: 20 },
    ];
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>Manage Categories</CardTitle>
                        <CardDescription>Organize your chat templates into categories for easier management.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Templates</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map(cat => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell>{cat.templateCount}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>New Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cat-name">Category Name</Label>
                        <Input id="cat-name" placeholder="e.g., Billing Questions" />
                    </div>
                    <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
                </CardContent>
            </Card>
        </div>
    );
};

const ChatTemplatesTab = () => {
    const templates = [
        { id: 1, name: "Welcome Greeting", category: "General FAQs" },
        { id: 2, name: "Pricing Inquiry Response", category: "Sales Inquiries" },
        { id: 3, name: "Password Reset Guide", category: "Technical Support" },
    ];
    return (
        <Card className="bg-card/50">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Chat Templates</CardTitle>
                        <CardDescription>Create and manage predefined messages for your chatbot.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> New Template</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Template Name</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {templates.map(t => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.name}</TableCell>
                                <TableCell><Badge variant="secondary">{t.category}</Badge></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const ChatbotTrainingTab = () => (
    <Card className="bg-card/50 max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Train Your Chatbot</CardTitle>
            <CardDescription>Provide the AI with knowledge by uploading documents or pasting text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Upload Documents</Label>
                <Card className="border-dashed border-2 p-8 flex flex-col items-center justify-center text-center bg-transparent">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop your knowledge base files</p>
                    <p className="text-xs text-muted-foreground/80">PDF, DOCX, TXT, CSV accepted</p>
                    <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                </Card>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="paste-text">Paste Text</Label>
                <Textarea id="paste-text" placeholder="Paste text content here to train the bot..." className="h-40" />
            </div>
        </CardContent>
        <CardFooter>
            <Button className="ml-auto">Start Training</Button>
        </CardFooter>
    </Card>
);

const FloatingChatSettingsTab = () => (
     <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Floating Chat Widget Customizer</CardTitle>
                    <CardDescription>Modify the appearance and behavior of the chat widget on your website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="primary-color">Primary Color</Label>
                            <Input id="primary-color" type="color" defaultValue="#7c3aed" className="h-12 p-2" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="header-text">Chat Header Text</Label>
                            <Input id="header-text" defaultValue="How can we help?" />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <Label>Initial Message</Label>
                        <Textarea placeholder="e.g., Hi there! Ask me anything about our products." defaultValue="Welcome to our website! Let me know if you have any questions." />
                    </div>
                    <div className="space-y-4">
                        <Label>Chat Bubble Position</Label>
                        <Select defaultValue="bottom-right">
                             <SelectTrigger><SelectValue /></SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                 <SelectItem value="bottom-left">Bottom Left</SelectItem>
                             </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Widget Settings</Button>
                </CardFooter>
            </Card>
        </div>
        <div className="flex items-center justify-center">
             <div className="relative w-80 h-[500px] bg-white rounded-lg shadow-2xl p-4 flex flex-col">
                <div className="bg-primary rounded-t-lg p-3 text-primary-foreground text-center" style={{backgroundColor: 'hsl(var(--primary))'}}>
                    <h3 className="font-semibold">How can we help?</h3>
                </div>
                <div className="flex-1 bg-gray-100 p-3 space-y-3 overflow-y-auto">
                    <div className="p-2 bg-gray-200 rounded-lg text-sm w-fit max-w-[80%]">Welcome to our website! Let me know if you have any questions.</div>
                </div>
                <div className="absolute bottom-20 right-[-20px]">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg" style={{backgroundColor: 'hsl(var(--primary))'}}>
                        <MessageCircle className="h-8 w-8 text-primary-foreground" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const AssistantTrainingTab = () => (
    <Card className="bg-card/50 max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>AI Assistant Training</CardTitle>
            <CardDescription>Define the core personality, capabilities, and instructions for your main AI assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="assistant-name">Assistant Name</Label>
                <Input id="assistant-name" placeholder="e.g., LingoBot" defaultValue="LingoLancers Assistant" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="assistant-model">Core AI Model</Label>
                <Select defaultValue="gemini-2.5-flash">
                    <SelectTrigger id="assistant-model"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt / Instructions</Label>
                <Textarea id="system-prompt" placeholder="You are a helpful and friendly assistant for the LingoLancers platform..." className="h-48" />
                <p className="text-xs text-muted-foreground">This is the most important instruction. It defines the AI's core purpose, personality, and constraints.</p>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="ml-auto">Save Assistant Settings</Button>
        </CardFooter>
    </Card>
);

const VoiceChatbotTrainingTab = () => (
    <Card className="bg-card/50 max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Voice Chatbot Training</CardTitle>
            <CardDescription>Configure and train your AI for voice-based conversations. (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-20 text-muted-foreground">
            <Mic className="h-12 w-12 mx-auto" />
            <p className="mt-4">Advanced voice training and configuration options will be available here.</p>
        </CardContent>
    </Card>
);


export default function ChatSettingsView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "chat-categories");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 max-w-6xl mx-auto">
            <TabsTrigger value="chat-categories"><Folder className="mr-2 h-4 w-4"/>Categories</TabsTrigger>
            <TabsTrigger value="chat-templates"><FileText className="mr-2 h-4 w-4"/>Templates</TabsTrigger>
            <TabsTrigger value="chatbot-training"><BrainCircuit className="mr-2 h-4 w-4"/>Chatbot Training</TabsTrigger>
            <TabsTrigger value="floating-chat-settings"><MessageCircle className="mr-2 h-4 w-4"/>Floating Chat</TabsTrigger>
            <TabsTrigger value="assistant-training"><Bot className="mr-2 h-4 w-4"/>Assistant Training</TabsTrigger>
            <TabsTrigger value="voice-chatbot-training"><Mic className="mr-2 h-4 w-4"/>Voice Bot Training</TabsTrigger>
        </TabsList>
        <TabsContent value="chat-categories" className="mt-6"><ChatCategoriesTab /></TabsContent>
        <TabsContent value="chat-templates" className="mt-6"><ChatTemplatesTab /></TabsContent>
        <TabsContent value="chatbot-training" className="mt-6"><ChatbotTrainingTab /></TabsContent>
        <TabsContent value="floating-chat-settings" className="mt-6"><FloatingChatSettingsTab /></TabsContent>
        <TabsContent value="assistant-training" className="mt-6"><AssistantTrainingTab /></TabsContent>
        <TabsContent value="voice-chatbot-training" className="mt-6"><VoiceChatbotTrainingTab /></TabsContent>
    </Tabs>
  );
}
