"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { handleAdjustVideoSettings } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import type { AdjustVideoSettingsOutput } from '@/ai/flows/dynamically-adjust-video-settings';

const formSchema = z.object({
  task: z.string().min(3, "Please describe the task, e.g., 'create a YouTube short'."),
});

type VideoSettingsPanelProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function VideoSettingsPanel({ isOpen, onOpenChange }: VideoSettingsPanelProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AdjustVideoSettingsOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { task: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setSettings(null);

    const formData = new FormData();
    formData.append("task", values.task);
    const result = await handleAdjustVideoSettings(formData);

    if (result && "error" in result) {
      toast({
        variant: "destructive",
        title: "Error Adjusting Settings",
        description: result.error,
      });
    } else if (result) {
      setSettings(result);
    }
    setIsLoading(false);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-background/95 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle className="font-headline text-primary">Dynamic Video Settings</SheetTitle>
          <SheetDescription>
            Describe the video task, and our AI will suggest the best settings.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8 space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="task"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Video Task</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 'A cinematic scene for a movie'" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Get Recommendations
                    </Button>
                </form>
            </Form>

            {isLoading && (
                <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {settings && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <h3 className="font-semibold font-headline">Recommended Settings</h3>
                        <div className="space-y-2 text-sm">
                            {settings.aspectRatio && <p><strong>Aspect Ratio:</strong> {settings.aspectRatio}</p>}
                            {settings.frameRate && <p><strong>Frame Rate:</strong> {settings.frameRate} fps</p>}
                            {settings.resolution && <p><strong>Resolution:</strong> {settings.resolution}</p>}
                            {settings.bitrate && <p><strong>Bitrate:</strong> {settings.bitrate}</p>}
                        </div>
                        {settings.otherRelevantSettings && settings.otherRelevantSettings.length > 0 && (
                            <div>
                                <h4 className="font-semibold mt-4 mb-2">Other Suggestions:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {settings.otherRelevantSettings.map((setting, i) => (
                                        <Badge key={i} variant="secondary">{setting}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
