

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PenSquare, ShoppingCart, Search, CopyCheck, Wand2, Repeat, Bot, FileText, Tags, Key } from "lucide-react";
import { Progress } from "../ui/progress";

const AiWriterTab = () => (
    <Card className="bg-card/50 card-gradient-border">
        <CardHeader>
            <CardTitle className="text-gradient-multi text-transparent">AI Writer</CardTitle>
            <CardDescription>Generate high-quality articles, blog posts, or any other long-form content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="writer-prompt">Content Topic or Prompt</Label>
                <Textarea id="writer-prompt" placeholder="e.g., 'The future of renewable energy sources'" className="h-28" />
            </div>
            <div className="space-y-2">
                <Label>Generated Content</Label>
                <Textarea placeholder="Your AI-generated article will appear here..." className="h-64 bg-background/50" readOnly/>
            </div>
        </CardContent>
        <CardFooter className="gap-2">
            <Button className="w-full animated-gradient-border bg-transparent text-white"><Bot className="mr-2 h-4 w-4" />Generate</Button>
            <Button variant="outline" className="w-full"><Repeat className="mr-2 h-4 w-4" />Regenerate</Button>
        </CardFooter>
    </Card>
);

const ProductDetailsTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50 card-gradient-border">
            <CardHeader>
                <CardTitle className="text-gradient-multi text-transparent">Generate Product Details</CardTitle>
                <CardDescription>Create compelling product titles, descriptions, and hashtags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input id="product-name" placeholder="e.g., 'Wireless Noise-Cancelling Headphones'" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-features">Key Features (comma-separated)</Label>
                    <Textarea id="product-features" placeholder="e.g., 'Bluetooth 5.2, 40-hour battery, foldable design'" className="h-24" />
                </div>
            </CardContent>
             <CardFooter>
                <Button className="w-full animated-gradient-border bg-transparent text-white"><Bot className="mr-2 h-4 w-4" />Generate Details</Button>
            </CardFooter>
        </Card>
        <div className="space-y-6">
            <Card className="bg-card/50 card-gradient-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gradient-multi text-transparent"><FileText className="w-5 h-5 text-primary" />Generated Title & Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input readOnly placeholder="Generated Title..."/>
                    <Textarea readOnly placeholder="Generated product description..." className="h-40 bg-background/50" />
                </CardContent>
            </Card>
            <Card className="bg-card/50 card-gradient-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gradient-multi text-transparent"><Tags className="w-5 h-5 text-primary" />Generated Hashtags</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Badge variant="secondary">#YourHashtags</Badge>
                    <Badge variant="secondary">#WillBeHere</Badge>
                </CardContent>
            </Card>
        </div>
    </div>
);

const SeoKeywordsTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50 card-gradient-border">
            <CardHeader>
                <CardTitle className="text-gradient-multi text-transparent">SEO Keyword Generator</CardTitle>
                <CardDescription>Enter a topic or paste your text to find relevant SEO keywords.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea placeholder="Enter your topic, or paste your full article text here..." className="h-48" />
            </CardContent>
            <CardFooter>
                 <Button className="w-full animated-gradient-border bg-transparent text-white"><Search className="mr-2 h-4 w-4" />Find Keywords</Button>
            </CardFooter>
        </Card>
        <Card className="bg-card/50 card-gradient-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient-multi text-transparent"><Key className="w-5 h-5 text-primary" />Generated SEO Keywords</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">SEO Keyword 1</Badge>
                <Badge variant="outline">Long-tail Keyword</Badge>
                <Badge variant="outline">Another Keyword</Badge>
                <Badge variant="outline">SEO</Badge>
            </CardContent>
        </Card>
    </div>
);

const PlagiarismCheckTab = () => (
    <Card className="bg-card/50 max-w-4xl mx-auto card-gradient-border">
        <CardHeader>
            <CardTitle className="text-gradient-multi text-transparent">Plagiarism Checker</CardTitle>
            <CardDescription>Paste your text below to check for potential plagiarism across the web.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea placeholder="Paste the content you want to check here..." className="h-64" />
            <Button className="w-full animated-gradient-border bg-transparent text-white"><CopyCheck className="mr-2 h-4 w-4" />Check for Plagiarism</Button>
            <div className="space-y-2 pt-4">
                <Label>Originality Score</Label>
                <Progress value={0} />
                <p className="text-sm text-muted-foreground text-center">Your originality score will appear here after checking.</p>
            </div>
        </CardContent>
    </Card>
);

const ArticleWizardTab = () => (
     <Card className="bg-card/50 max-w-4xl mx-auto card-gradient-border">
        <CardHeader>
            <CardTitle className="text-gradient-multi text-transparent">AI Article Wizard</CardTitle>
            <CardDescription>A step-by-step process to create a perfectly structured article.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="wizard-topic">1. What is the main topic of your article?</Label>
                <Input id="wizard-topic" placeholder="e.g., 'The impact of AI on digital marketing'" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="wizard-keywords">2. Enter a few target keywords (optional)</Label>
                <Input id="wizard-keywords" placeholder="e.g., 'AI marketing, content automation, personalization'" />
            </div>
            <div className="space-y-2">
                <Label>3. Generate an outline</Label>
                <Textarea placeholder="Click 'Generate Outline' and the AI will create a structure for your article here..." className="h-40 bg-background/50" />
                <Button variant="outline" size="sm">Generate Outline</Button>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="w-full animated-gradient-border bg-transparent text-white"><Wand2 className="mr-2 h-4 w-4" />Write Full Article</Button>
        </CardFooter>
    </Card>
);

const RewriterTab = () => (
     <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50 card-gradient-border">
            <CardHeader>
                <CardTitle className="text-gradient-multi text-transparent">Content to Rewrite</CardTitle>
                <CardDescription>Paste the text you want to paraphrase or improve.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea placeholder="Paste your original text here..." className="h-64" />
            </CardContent>
        </Card>
        <Card className="bg-card/50 card-gradient-border">
            <CardHeader>
                <CardTitle className="text-gradient-multi text-transparent">Rewritten Content</CardTitle>
                <CardDescription>The improved version of your text will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea placeholder="The AI-rewritten text will be generated here..." className="h-64 bg-background/50" readOnly/>
            </CardContent>
        </Card>
        <div className="md:col-span-2">
             <Button className="w-full animated-gradient-border bg-transparent text-white"><Repeat className="mr-2 h-4 w-4" />Rewrite Content</Button>
        </div>
    </div>
);


export default function AiContentView({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || "writer");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="p-4 md:p-6 h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-6 max-w-6xl mx-auto">
                <TabsTrigger value="writer"><PenSquare className="mr-2 h-4 w-4"/>AI Writer</TabsTrigger>
                <TabsTrigger value="product"><ShoppingCart className="mr-2 h-4 w-4"/>Product Details</TabsTrigger>
                <TabsTrigger value="seo"><Search className="mr-2 h-4 w-4"/>SEO Keywords</TabsTrigger>
                <TabsTrigger value="plagiarism"><CopyCheck className="mr-2 h-4 w-4"/>Plagiarism Check</TabsTrigger>
                <TabsTrigger value="wizard"><Wand2 className="mr-2 h-4 w-4"/>Article Wizard</TabsTrigger>
                <TabsTrigger value="rewriter"><Repeat className="mr-2 h-4 w-4"/>AI Rewriter</TabsTrigger>
            </TabsList>
            <TabsContent value="writer" className="flex-1 mt-6"><AiWriterTab /></TabsContent>
            <TabsContent value="product" className="flex-1 mt-6"><ProductDetailsTab /></TabsContent>
            <TabsContent value="seo" className="flex-1 mt-6"><SeoKeywordsTab /></TabsContent>
            <TabsContent value="plagiarism" className="flex-1 mt-6"><PlagiarismCheckTab /></TabsContent>
            <TabsContent value="wizard" className="flex-1 mt-6"><ArticleWizardTab /></TabsContent>
            <TabsContent value="rewriter" className="flex-1 mt-6"><RewriterTab /></TabsContent>
        </Tabs>
    </div>
  );
}
