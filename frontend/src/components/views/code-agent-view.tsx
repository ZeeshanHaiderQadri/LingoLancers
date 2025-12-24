

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code2, Bot, LayoutTemplate, Brush, Search, TestTube2, Cloud, Download, Link as LinkIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import Image from 'next/image';

const CodeAssistantTab = () => (
    <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
            <Card className="bg-card/50 h-[600px] flex flex-col flex-grow">
                <CardHeader>
                    <CardTitle>AI Code Assistant</CardTitle>
                    <CardDescription>Your general-purpose coding companion.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col bg-background/50 m-6 mt-0 rounded-lg p-4 text-sm">
                    {/* Placeholder for chat interface */}
                    <p className="text-muted-foreground">Chat with the AI to generate code, debug, or learn.</p>
                </CardContent>
                <CardFooter>
                    <div className="w-full flex gap-2">
                        <Input placeholder="Ask a coding question... e.g., 'How do I implement a binary search tree in Python?'" />
                        <Button>Send</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
        <div className="space-y-6">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Context</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder="Paste any relevant code context here..." className="h-40" />
                </CardContent>
            </Card>
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Language</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select defaultValue="javascript">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        </div>
    </div>
);

const WebsiteDesignerTab = () => (
    <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-6">
             <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Website Designer</CardTitle>
                    <CardDescription>Generate a full webpage from a description.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="web-desc">Describe the webpage you want</Label>
                        <Textarea id="web-desc" placeholder="e.g., A landing page for a SaaS product that sells AI-powered analytics..." className="h-32" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="framework">Framework</Label>
                        <Select defaultValue="nextjs">
                            <SelectTrigger id="framework"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nextjs">Next.js / React</SelectItem>
                                <SelectItem value="vue" disabled>Vue (Coming Soon)</SelectItem>
                                <SelectItem value="angular" disabled>Angular (Coming Soon)</SelectItem>
                                <SelectItem value="html" disabled>HTML & Tailwind (Coming Soon)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Currently, only Next.js/React is supported to ensure the best results.</p>
                    </div>
                    <Button className="w-full">Generate Website</Button>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
             <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full bg-background/50 rounded-lg border flex items-center justify-center">
                        <p className="text-muted-foreground">A preview of your generated website will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);

const DesignAgentTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Design to Code</CardTitle>
                <CardDescription>Convert your Figma designs into React components.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center my-4">
                     <Image src="https://picsum.photos/seed/figma/200/100" width={150} height={75} alt="Figma logo placeholder" data-ai-hint="logo figma" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="figma-url">Figma File URL</Label>
                    <Input id="figma-url" placeholder="https://www.figma.com/file/..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="figma-token">Figma Access Token</Label>
                    <Input id="figma-token" type="password" placeholder="Enter your personal access token" />
                </div>
                <Button className="w-full">Generate Components</Button>
            </CardContent>
        </Card>
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Generated Component Code</CardTitle>
                <CardDescription>Your generated React components will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea readOnly className="h-80 font-mono text-xs bg-background/50" placeholder="Awaiting Figma input..." />
            </CardContent>
        </Card>
    </div>
);

const CodeReviewerTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Code to Review</CardTitle>
                <CardDescription>Paste your code below to get an AI-powered review.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea placeholder="Paste your code here..." className="h-80 font-mono text-xs" />
                <Button className="w-full mt-4">Review Code</Button>
            </CardContent>
        </Card>
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>AI Review</CardTitle>
                <CardDescription>Analysis, suggestions, and improvements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h4 className="font-semibold">Overall Score: <Badge>Awaiting Review</Badge></h4>
                </div>
                <Textarea readOnly placeholder="The AI's feedback will appear here..." className="h-64 bg-background/50" />
            </CardContent>
        </Card>
    </div>
);

const UnitTestWriterTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Component/Function</CardTitle>
                <CardDescription>Paste the code you want to write tests for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea placeholder="Paste your function or React component here..." className="h-80 font-mono text-xs" />
                <div className="space-y-2">
                    <Label htmlFor="test-framework">Testing Framework</Label>
                     <Select defaultValue="jest">
                        <SelectTrigger id="test-framework"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jest">Jest / React Testing Library</SelectItem>
                            <SelectItem value="vitest" disabled>Vitest (Coming Soon)</SelectItem>
                            <SelectItem value="mocha" disabled>Mocha (Coming Soon)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button className="w-full mt-4">Generate Tests</Button>
            </CardContent>
        </Card>
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Generated Unit Tests</CardTitle>
                <CardDescription>AI-generated tests based on your input code.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea readOnly placeholder="Generated test code will appear here..." className="h-[28rem] font-mono text-xs bg-background/50" />
            </CardContent>
        </Card>
    </div>
);

const PublishDeployTab = () => (
     <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Deployment Status</CardTitle>
                    <CardDescription>Manage and monitor your application's deployment.</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                     <Cloud className="h-12 w-12 mx-auto text-muted-foreground" />
                     <h3 className="mt-4 text-lg font-medium">No Active Deployments</h3>
                     <p className="mt-1 text-sm text-muted-foreground">Generate a website first to enable deployment options.</p>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Publish & Download</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full" disabled><Cloud className="mr-2 h-4 w-4" /> Publish to Web</Button>
                    <Button variant="outline" className="w-full" disabled><Download className="mr-2 h-4 w-4" /> Download Code</Button>
                </CardContent>
            </Card>
             <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Custom Domain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="your-domain.com" disabled />
                    <Button className="w-full" disabled><LinkIcon className="mr-2 h-4 w-4" /> Attach Domain</Button>
                </CardContent>
            </Card>
        </div>
    </div>
);

export default function CodeAgentView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "assistant");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-6 max-w-6xl mx-auto">
                <TabsTrigger value="assistant"><Bot className="mr-2 h-4 w-4"/>Assistant</TabsTrigger>
                <TabsTrigger value="designer"><LayoutTemplate className="mr-2 h-4 w-4"/>Website Designer</TabsTrigger>
                <TabsTrigger value="design-agent"><Brush className="mr-2 h-4 w-4"/>Design Agent</TabsTrigger>
                <TabsTrigger value="reviewer"><Search className="mr-2 h-4 w-4"/>Code Reviewer</TabsTrigger>
                <TabsTrigger value="tester"><TestTube2 className="mr-2 h-4 w-4"/>Unit Test Writer</TabsTrigger>
                <TabsTrigger value="publish"><Cloud className="mr-2 h-4 w-4"/>Publish & Deploy</TabsTrigger>
            </TabsList>
            <TabsContent value="assistant" className="flex-1 mt-6"><CodeAssistantTab /></TabsContent>
            <TabsContent value="designer" className="flex-1 mt-6"><WebsiteDesignerTab /></TabsContent>
            <TabsContent value="design-agent" className="flex-1 mt-6"><DesignAgentTab /></TabsContent>
            <TabsContent value="reviewer" className="flex-1 mt-6"><CodeReviewerTab /></TabsContent>
            <TabsContent value="tester" className="flex-1 mt-6"><UnitTestWriterTab /></TabsContent>
            <TabsContent value="publish" className="flex-1 mt-6"><PublishDeployTab /></TabsContent>
        </Tabs>
    </div>
  );
}
