

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Clapperboard, Sparkles, User, Upload, Wand2, Film, ImageIcon } from "lucide-react";
import Image from "next/image";

const VideoGenTab = () => (
    <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-6">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Text-to-Video</CardTitle>
                    <CardDescription>Describe the video you want to create.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea placeholder="e.g., 'A cinematic shot of a futuristic city at sunset, with flying cars'" className="h-32" />
                    <div className="space-y-2">
                        <Label htmlFor="video-aspect">Aspect Ratio</Label>
                        <Select defaultValue="16:9">
                            <SelectTrigger id="video-aspect"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="video-duration">Duration (seconds)</Label>
                        <Input id="video-duration" type="number" defaultValue="5" />
                    </div>
                    <Button size="lg" className="w-full animated-gradient-border bg-transparent text-white"><Sparkles className="mr-2 h-4 w-4" /> Generate Video</Button>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Generated Video</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video bg-background/50 rounded-lg flex items-center justify-center text-muted-foreground">
                        <Clapperboard className="h-16 w-16" />
                        <p className="ml-4">Your video will appear here</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);

const VideoProTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>1. Upload Source Video</CardTitle>
                <CardDescription>Upload the video you want to transform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card className="border-dashed border-2 p-8 flex flex-col items-center justify-center text-center bg-transparent">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop a video file</p>
                    <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                </Card>
                 <div className="space-y-2">
                    <Label htmlFor="v2v-prompt">2. Describe the transformation</Label>
                    <Textarea id="v2v-prompt" placeholder="e.g., 'Make this video look like a watercolor painting', 'Change the season to winter'" className="h-24" />
                </div>
                <Button className="w-full"><Wand2 className="mr-2 h-4 w-4" /> Transform Video</Button>
            </CardContent>
        </Card>
         <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Transformed Video</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video w-full bg-background/50 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">The result will appear here.</p>
                </div>
            </CardContent>
        </Card>
    </div>
);

const ImageToVideoTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>1. Upload Source Image</CardTitle>
                <CardDescription>Upload the image you want to animate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card className="border-dashed border-2 p-8 flex flex-col items-center justify-center text-center bg-transparent">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop an image file</p>
                    <Button variant="outline" size="sm" className="mt-4">Browse Files</Button>
                </Card>
                 <div className="space-y-2">
                    <Label htmlFor="i2v-prompt">2. Describe the animation</Label>
                    <Textarea id="i2v-prompt" placeholder="e.g., 'Make the clouds move', 'Animate the person to wave'" className="h-24" />
                </div>
                <Button className="w-full"><Wand2 className="mr-2 h-4 w-4" /> Animate Image</Button>
            </CardContent>
        </Card>
         <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Generated Video</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video w-full bg-background/50 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">The animated video will appear here.</p>
                </div>
            </CardContent>
        </Card>
    </div>
);

const PersonaTab = () => (
     <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card className="bg-card/50 h-full">
                <CardHeader>
                    <CardTitle>Avatar Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-full">
                    <div className="w-[400px] h-[400px] bg-background/50 rounded-lg flex items-center justify-center">
                        <Image src="https://picsum.photos/seed/avatar3/400/400" width={400} height={400} alt="Avatar preview" className="rounded-lg" data-ai-hint="male portrait" />
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Create AI Persona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Appearance Prompt</Label>
                        <Textarea placeholder="e.g., 'A friendly female news anchor with brown hair, wearing a blue blazer'" className="h-24" />
                    </div>
                    <div className="space-y-2">
                        <Label>Voice</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Select a voice" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alloy">Alloy (Male)</SelectItem>
                                <SelectItem value="nova">Nova (Female)</SelectItem>
                                <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full">Generate/Update Persona</Button>
                </CardContent>
            </Card>
             <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Generate Talking Video</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea placeholder="Enter the script for the avatar to speak..." className="h-24" />
                    <Button className="w-full">Generate Video</Button>
                </CardContent>
            </Card>
        </div>
    </div>
);

export default function AiVideoView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "video");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-4 max-w-4xl mx-auto">
            <TabsTrigger value="video"><Sparkles className="mr-2 h-4 w-4" />AI Video</TabsTrigger>
            <TabsTrigger value="pro-video"><Film className="mr-2 h-4 w-4" />Video-to-Video</TabsTrigger>
            <TabsTrigger value="image-video"><ImageIcon className="mr-2 h-4 w-4" />Image-to-Video</TabsTrigger>
            <TabsTrigger value="persona"><User className="mr-2 h-4 w-4" />AI Persona</TabsTrigger>
        </TabsList>
        <TabsContent value="video" className="flex-1 mt-6"><VideoGenTab /></TabsContent>
        <TabsContent value="pro-video" className="flex-1 mt-6"><VideoProTab /></TabsContent>
        <TabsContent value="image-video" className="flex-1 mt-6"><ImageToVideoTab /></TabsContent>
        <TabsContent value="persona" className="flex-1 mt-6"><PersonaTab /></TabsContent>
      </Tabs>
    </div>
  );
}
