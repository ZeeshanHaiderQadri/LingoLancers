"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Clapperboard, Settings, Blend, ImageIcon, Loader2 } from "lucide-react";
import type { GenerateContentOutput } from "@/ai/flows/generate-content-from-prompt";
import VideoSettingsPanel from "./video-settings-panel";
import { handleCombineContent } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type ContentDisplayProps = {
  data: GenerateContentOutput;
};

export default function ContentDisplay({ data }: ContentDisplayProps) {
  const { toast } = useToast();
  const [showVideoSettings, setShowVideoSettings] = useState(false);
  const [isCombining, setIsCombining] = useState(false);
  const [combinedResult, setCombinedResult] = useState<string | null>(null);

  const onCombine = async () => {
    setIsCombining(true);
    setCombinedResult(null);

    const formData = new FormData();
    if (data.article) formData.append("article", data.article);
    if (data.image) formData.append("image", data.image);
    if (data.video) formData.append("video", data.video);

    const result = await handleCombineContent(formData);
    if (result && "error" in result) {
      toast({
        variant: "destructive",
        title: "Error Combining Content",
        description: result.error,
      });
    } else if (result) {
        setCombinedResult(result.combinedContent);
    }
    setIsCombining(false);
  };


  return (
    <div className="space-y-4">
        <Card className="bg-background/50">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
                <FileText className="h-5 w-5" />
                Generated Article
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-sm">{data.article}</p>
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-background/50">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-primary">
                    <Clapperboard className="h-5 w-5" />
                    Generated Video
                </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video bg-black rounded-md overflow-hidden">
                        {/* The video URI can be long, so we check for it before rendering */}
                        {data.video ? (
                            <video src={data.video} controls className="w-full h-full" />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">Video loading...</div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => setShowVideoSettings(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Video Settings
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-background/50">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-primary">
                    <ImageIcon className="h-5 w-5" />
                    Generated Image
                </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                        <Image src={data.image} alt="Generated image" layout="fill" objectFit="cover" />
                    </div>
                </CardContent>
            </Card>
        </div>
        <Separator />
        <div className="flex justify-end">
            <Button onClick={onCombine} disabled={isCombining} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isCombining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Blend className="mr-2 h-4 w-4" />
                )}
                Combine Content
            </Button>
        </div>

        {combinedResult && (
            <Card className="bg-green-950/50 border-green-500/50">
                <CardHeader>
                    <CardTitle className="font-headline text-green-400">Combined Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">{combinedResult}</div>
                </CardContent>
            </Card>
        )}

        <VideoSettingsPanel isOpen={showVideoSettings} onOpenChange={setShowVideoSettings} />
    </div>
  );
}
