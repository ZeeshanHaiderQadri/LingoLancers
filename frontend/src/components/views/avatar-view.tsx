
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Video, Users, Sparkles, PlusCircle } from "lucide-react";

const ImageAvatarTab = () => (
    <Card className="bg-card/50">
        <CardHeader>
            <CardTitle>Image Avatar Generator</CardTitle>
            <CardDescription>Create a unique static image avatar from a text description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea placeholder="Describe your desired avatar, e.g., 'A futuristic cyberpunk warrior with neon hair and a leather jacket'" className="h-32" />
            <Button className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Image Avatar
            </Button>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <Image src="https://picsum.photos/seed/avatar_img1/200/200" width={200} height={200} alt="Generated avatar" className="rounded-lg" data-ai-hint="portrait" />
                <Image src="https://picsum.photos/seed/avatar_img2/200/200" width={200} height={200} alt="Generated avatar" className="rounded-lg" data-ai-hint="portrait" />
                <Image src="https://picsum.photos/seed/avatar_img3/200/200" width={200} height={200} alt="Generated avatar" className="rounded-lg" data-ai-hint="portrait" />
                <Image src="https://picsum.photos/seed/avatar_img4/200/200" width={200} height={200} alt="Generated avatar" className="rounded-lg" data-ai-hint="portrait" />
            </div>
        </CardContent>
    </Card>
);

const VideoAvatarTab = () => (
    <Card className="bg-card/50">
        <CardHeader>
            <CardTitle>Video Avatar Generator</CardTitle>
            <CardDescription>Create a talking, animated avatar from a script.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea placeholder="Enter the script for your avatar to speak..." className="h-32" />
            <Textarea placeholder="Describe the avatar's appearance..." className="h-20" />
            <Button className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Video Avatar
            </Button>
            <div className="aspect-video bg-background/50 rounded-lg flex items-center justify-center text-muted-foreground mt-4">
                Your generated video avatar will appear here.
            </div>
        </CardContent>
    </Card>
);

const CommunityAvatarsTab = () => {
    const communityAvatars = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/seed/community${i + 1}/300/300`);
    return (
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Community Avatars</CardTitle>
                <CardDescription>Explore and use avatars created by the community.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {communityAvatars.map((src, index) => (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden group">
                        <Image src={src} layout="fill" objectFit="cover" alt={`Community Avatar ${index + 1}`} data-ai-hint="portrait" />
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary">Use</Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default function AvatarView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "image");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold font-headline tracking-tight">Avatar Studio</h2>
                <p className="text-muted-foreground">Create, manage, and explore digital avatars.</p>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Avatar
                </Button>
                <Button variant="outline">
                    My Avatars
                </Button>
                <Button variant="secondary">
                    Explore Community
                </Button>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto">
                <TabsTrigger value="image"><User className="mr-2 h-4 w-4"/>Image Avatar</TabsTrigger>
                <TabsTrigger value="video"><Video className="mr-2 h-4 w-4"/>Video Avatar</TabsTrigger>
                <TabsTrigger value="community"><Users className="mr-2 h-4 w-4"/>Community</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="flex-1 mt-6"><ImageAvatarTab /></TabsContent>
            <TabsContent value="video" className="flex-1 mt-6"><VideoAvatarTab /></TabsContent>
            <TabsContent value="community" className="flex-1 mt-6"><CommunityAvatarsTab /></TabsContent>
        </Tabs>
    </div>
  );
}
