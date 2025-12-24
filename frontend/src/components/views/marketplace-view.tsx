
"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ShoppingCart, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

const modules = [
  {
    title: "AI Social Poster",
    description: "Automatically post generated content to all your social media channels.",
    image: "https://picsum.photos/seed/social/400/300",
    imageHint: "social media collage",
    tags: ["Social Media", "Automation"],
    creator: "LingoLancers Core",
    date: "2024-09-15",
    price: "Free",
  },
  {
    title: "Shopify Product Sync",
    description: "Sync your products to generate descriptions and marketing content.",
    image: "https://picsum.photos/seed/shopify/400/300",
    imageHint: "ecommerce products",
    tags: ["E-commerce", "Shopify"],
    creator: "LingoLancers Core",
    date: "2024-09-10",
    price: "Free",
  },
  {
    title: "WordPress Publisher",
    description: "Publish AI-generated articles directly to your WordPress site.",
    image: "https://picsum.photos/seed/wordpress/400/300",
    imageHint: "blog interface",
    tags: ["Content", "WordPress"],
    creator: "LingoLancers Core",
    date: "2024-09-05",
    price: "Free",
  },
  {
    title: "YouTube Video Uploader",
    description: "Automate uploading of generated videos to your YouTube channel.",
    image: "https://picsum.photos/seed/youtube/400/300",
    imageHint: "video player interface",
    tags: ["Video", "YouTube"],
    creator: "3rd-Party Dev",
    date: "2024-08-20",
    price: "$19.99",
  },
  {
    title: "TikTok Viral Clipper",
    description: "Find and post viral-worthy clips to your TikTok account automatically.",
    image: "https://picsum.photos/seed/tiktok/400/300",
    imageHint: "mobile phone screen",
    tags: ["Video", "Social Media", "TikTok"],
    creator: "3rd-Party Dev",
    date: "2024-08-18",
    price: "$29.99",
  },
  {
    title: "Viral Video Content Pack",
    description: "A pack of 100 prompts guaranteed to create engaging short-form videos.",
    image: "https://picsum.photos/seed/viral/400/300",
    imageHint: "abstract viral pattern",
    tags: ["Content", "Video"],
    creator: "ContentCreators Inc.",
    date: "2024-07-30",
    price: "$49.99",
  },
  {
    title: "SEO Keyword Analyzer",
    description: "Analyze your content and get SEO keyword suggestions.",
    image: "https://picsum.photos/seed/seo/400/300",
    imageHint: "analytics graph",
    tags: ["Content", "SEO"],
    creator: "SEOGurus",
    date: "2024-09-18",
    price: "$14.99",
  },
  {
    title: "WooCommerce Integration",
    description: "Connect your WooCommerce store for seamless product content creation.",
    image: "https://picsum.photos/seed/woo/400/300",
    imageHint: "shopping cart icon",
    tags: ["E-commerce", "WordPress"],
    creator: "LingoLancers Core",
    date: "2024-09-12",
    price: "Free",
  },
  {
    title: "Instagram Story Generator",
    description: "Create engaging and interactive Instagram stories with AI.",
    image: "https://picsum.photos/seed/igstory/400/300",
    imageHint: "instagram stories ui",
    tags: ["Social Media", "Instagram"],
    creator: "Social Orbits",
    date: "2024-09-01",
    price: "$9.99",
  },
  {
    title: "Facebook Ad Copywriter",
    description: "Generate high-converting ad copy for your Facebook campaigns.",
    image: "https://picsum.photos/seed/fbads/400/300",
    imageHint: "facebook ads manager",
    tags: ["Social Media", "Marketing", "Facebook"],
    creator: "AdWizards",
    date: "2024-08-25",
    price: "$24.99",
  },
  {
    title: "LinkedIn Article Writer",
    description: "Create professional articles and posts for your LinkedIn profile.",
    image: "https://picsum.photos/seed/linkedin/400/300",
    imageHint: "professional network",
    tags: ["Content", "Social Media", "LinkedIn"],
    creator: "ProContent",
    date: "2024-08-15",
    price: "$19.99",
  },
  {
    title: "Amazon Product Descriptions",
    description: "Optimize your Amazon listings with persuasive, keyword-rich descriptions.",
    image: "https://picsum.photos/seed/amazon/400/300",
    imageHint: "amazon product page",
    tags: ["E-commerce", "Amazon"],
    creator: "EcomExperts",
    date: "2024-08-10",
    price: "$39.99",
  },
  {
    title: "Pinterest Pin Designer",
    description: "Automatically create beautiful and clickable pins for your Pinterest boards.",
    image: "https://picsum.photos/seed/pinterest/400/300",
    imageHint: "pinterest board",
    tags: ["Social Media", "Design", "Pinterest"],
    creator: "Designify",
    date: "2024-08-05",
    price: "$12.99",
  },
  {
    title: "Plagiarism Checker Pro",
    description: "Ensure your content is 100% original with advanced plagiarism detection.",
    image: "https://picsum.photos/seed/plagiarism/400/300",
    imageHint: "document checkmark",
    tags: ["Content", "Tools"],
    creator: "LingoLancers Core",
    date: "2024-09-20",
    price: "$5/month",
  },
  {
    title: "Analytics Dashboard",
    description: "A comprehensive dashboard to track all your content performance metrics.",
    image: "https://picsum.photos/seed/analytics/400/300",
    imageHint: "charts and graphs",
    tags: ["Analytics", "Tools"],
    creator: "DataDriven Co.",
    date: "2024-09-22",
    price: "$49.99",
  },
  {
    title: "Advanced Voice Cloning",
    description: "Create a near-perfect clone of any voice for your audio projects.",
    image: "https://picsum.photos/seed/voiceclone/400/300",
    imageHint: "sound waves",
    tags: ["Audio", "AI"],
    creator: "VocalizeAI",
    date: "2024-09-08",
    price: "$99.99",
  },
  {
    title: "Music Generation Suite",
    description: "Create royalty-free background music in any genre for your videos.",
    image: "https://picsum.photos/seed/music/400/300",
    imageHint: "music notes",
    tags: ["Audio", "Video"],
    creator: "SoundWave",
    date: "2024-09-02",
    price: "$29.99",
  },
  {
    title: "Brand Voice Manager",
    description: "Define and maintain a consistent brand voice across all generated content.",
    image: "https://picsum.photos/seed/brand/400/300",
    imageHint: "brand guidelines",
    tags: ["Content", "Tools"],
    creator: "LingoLancers Core",
    date: "2024-09-19",
    price: "Free",
  },
  {
    title: "Twitter Thread Creator",
    description: "Convert long-form articles into engaging Twitter threads automatically.",
    image: "https://picsum.photos/seed/threads/400/300",
    imageHint: "twitter ui",
    tags: ["Social Media", "Twitter"],
    creator: "Threadify",
    date: "2024-08-28",
    price: "$9.99",
  },
  {
    title: "Etsy Store Connector",
    description: "Manage your Etsy listings and create compelling product descriptions.",
    image: "https://picsum.photos/seed/etsy/400/300",
    imageHint: "handmade crafts",
    tags: ["E-commerce", "Etsy"],
    creator: "CraftyContent",
    date: "2024-08-12",
    price: "$14.99",
  },
  {
    title: "AI Video Script Writer",
    description: "Generate complete video scripts from a simple prompt, including scene directions.",
    image: "https://picsum.photos/seed/script/400/300",
    imageHint: "screenplay document",
    tags: ["Video", "Content"],
    creator: "ScriptBot",
    date: "2024-09-14",
    price: "$22.99",
  },
  {
    title: "Podcast Transcription Service",
    description: "Transcribe your podcast episodes with high accuracy and speaker labels.",
    image: "https://picsum.photos/seed/podcast/400/300",
    imageHint: "microphone and headphones",
    tags: ["Audio", "Content"],
    creator: "PodScribe",
    date: "2024-09-11",
    price: "$0.10/min",
  },
  {
    title: "Google Docs Exporter",
    description: "Export all your generated content directly to Google Docs.",
    image: "https://picsum.photos/seed/gdocs/400/300",
    imageHint: "google docs logo",
    tags: ["Tools", "Productivity"],
    creator: "LingoLancers Core",
    date: "2024-09-25",
    price: "Free",
  },
  {
    title: "Medium Publisher",
    description: "Cross-post your articles to Medium with a single click.",
    image: "https://picsum.photos/seed/medium/400/300",
    imageHint: "medium logo",
    tags: ["Content", "Blogging", "Medium"],
    creator: "3rd-Party Dev",
    date: "2024-08-01",
    price: "$4.99",
  },
  {
    title: "AI Logo Generator",
    description: "Create a unique and professional logo for your brand in seconds.",
    image: "https://picsum.photos/seed/logo/400/300",
    imageHint: "geometric logo design",
    tags: ["Design", "Branding"],
    creator: "LogoCraft",
    date: "2024-09-23",
    price: "$49.99 (one-time)",
  },
  {
    title: "Custom Chatbot Builder",
    description: "Build a custom chatbot trained on your own documents and data.",
    image: "https://picsum.photos/seed/chatbot/400/300",
    imageHint: "chat bubbles",
    tags: ["AI", "Tools", "Customer Support"],
    creator: "LingoLancers Core",
    date: "2024-09-28",
    price: "$99/month",
  },
  {
    title: "Substack Newsletter Integration",
    description: "Automate content creation and publishing for your Substack.",
    image: "https://picsum.photos/seed/substack/400/300",
    imageHint: "newsletter email",
    tags: ["Content", "Email", "Substack"],
    creator: "MailMogul",
    date: "2024-08-22",
    price: "$19.99",
  },
  {
    title: "Mailchimp Campaign Creator",
    description: "Generate and schedule email campaigns in Mailchimp.",
    image: "https://picsum.photos/seed/mailchimp/400/300",
    imageHint: "mailchimp logo",
    tags: ["Email", "Marketing", "Mailchimp"],
    creator: "MailMogul",
    date: "2024-08-21",
    price: "$29.99",
  },
  {
    title: "A/B Testing for Headlines",
    description: "Generate multiple headline variations and test their performance.",
    image: "https://picsum.photos/seed/abtest/400/300",
    imageHint: "split comparison",
    tags: ["Marketing", "Analytics"],
    creator: "DataDriven Co.",
    date: "2024-09-03",
    price: "$19.99",
  },
  {
    title: "Reddit Post Optimizer",
    description: "Tailor your content for specific subreddits and get posting suggestions.",
    image: "https://picsum.photos/seed/reddit/400/300",
    imageHint: "reddit logo",
    tags: ["Social Media", "Reddit"],
    creator: "Social Orbits",
    date: "2024-07-25",
    price: "$14.99",
  },
  {
    title: "AI Presentation Maker",
    description: "Turn your documents into beautiful slide decks automatically.",
    image: "https://picsum.photos/seed/slides/400/300",
    imageHint: "presentation slides",
    tags: ["Productivity", "Tools"],
    creator: "SlideWiz",
    date: "2024-09-01",
    price: "$29.99",
  },
  {
    title: "Video Subtitle Generator (SRT)",
    description: "Automatically generate and export subtitles for your videos in SRT format.",
    image: "https://picsum.photos/seed/srt/400/300",
    imageHint: "video timeline with captions",
    tags: ["Video", "Tools"],
    creator: "LingoLancers Core",
    date: "2024-09-17",
    price: "Free",
  },
  {
    title: "Content Calendar Sync",
    description: "Sync your generated content schedule with Google Calendar or Outlook.",
    image: "https://picsum.photos/seed/gcal/400/300",
    imageHint: "calendar interface",
    tags: ["Productivity", "Tools"],
    creator: "Productivity Plus",
    date: "2024-09-04",
    price: "$9.99",
  },
  {
    title: "BigCommerce Connector",
    description: "AI-powered content generation for your BigCommerce products.",
    image: "https://picsum.photos/seed/bigc/400/300",
    imageHint: "ecommerce backend",
    tags: ["E-commerce", "BigCommerce"],
    creator: "EcomExperts",
    date: "2024-08-08",
    price: "$29.99",
  },
  {
    title: "Quora Answer Writer",
    description: "Find relevant questions on Quora and generate expert answers.",
    image: "https://picsum.photos/seed/quora/400/300",
    imageHint: "quora logo",
    tags: ["Content", "Social Media", "Quora"],
    creator: "ProContent",
    date: "2024-07-20",
    price: "$19.99",
  },
  {
    title: "AI Voice Chatbot",
    description: "Deploy a voice-enabled chatbot on your website for 24/7 customer interaction.",
    image: "https://picsum.photos/seed/voicebot/400/300",
    imageHint: "voice assistant icon",
    tags: ["AI", "Customer Support", "Audio"],
    creator: "VocalizeAI",
    date: "2024-09-26",
    price: "$149/month",
  },
  {
    title: "Image Background Remover",
    description: "Instantly remove the background from any image with one click.",
    image: "https://picsum.photos/seed/removebg/400/300",
    imageHint: "image with transparent background",
    tags: ["Design", "Tools"],
    creator: "Designify",
    date: "2024-09-16",
    price: "$9.99/month",
  },
  {
    title: "Video Intro Maker",
    description: "Create professional animated intros for your YouTube videos.",
    image: "https://picsum.photos/seed/intromaker/400/300",
    imageHint: "animated logo",
    tags: ["Video", "Branding"],
    creator: "VidCraft",
    date: "2024-08-30",
    price: "$25.00",
  },
  {
    title: "Code Documentation Writer",
    description: "Automatically generate documentation for your code in any language.",
    image: "https://picsum.photos/seed/codedoc/400/300",
    imageHint: "lines of code",
    tags: ["Tools", "Productivity"],
    creator: "DevTools Inc.",
    date: "2024-09-24",
    price: "$19.99",
  },
  {
    title: "AI Avatar Creator",
    description: "Create a unique digital avatar for your online presence or as a virtual influencer.",
    image: "https://picsum.photos/seed/avatar/400/300",
    imageHint: "futuristic person portrait",
    tags: ["AI", "Design", "Social Media"],
    creator: "LingoLancers Core",
    date: "2024-09-27",
    price: "$39.99",
  },
  {
    title: "Infographic Generator",
    description: "Convert your data and articles into stunning infographics.",
    image: "https://picsum.photos/seed/infograph/400/300",
    imageHint: "infographic elements",
    tags: ["Design", "Content"],
    creator: "DataDriven Co.",
    date: "2024-09-09",
    price: "$29.99",
  },
  {
    title: "Stock Photo Finder",
    description: "AI-powered search for royalty-free images that match your content.",
    image: "https://picsum.photos/seed/stock/400/300",
    imageHint: "stack of photos",
    tags: ["Tools", "Design"],
    creator: "Image AI",
    date: "2024-09-13",
    price: "$9.99/month",
  },
  {
    title: "Ebook Cover Designer",
    description: "Generate professional ebook covers from a text description.",
    image: "https://picsum.photos/seed/ebook/400/300",
    imageHint: "book cover",
    tags: ["Design", "Content"],
    creator: "Designify",
    date: "2024-08-26",
    price: "$49.00",
  },
  {
    title: "Legal Document Templates",
    description: "AI-powered templates for common legal documents like Privacy Policies.",
    image: "https://picsum.photos/seed/legal/400/300",
    imageHint: "gavel and book",
    tags: ["Tools", "Productivity"],
    creator: "LegalEase",
    date: "2024-08-02",
    price: "$99.00",
  },
  {
    title: "Real Estate Listing Generator",
    description: "Create compelling property descriptions for your real estate listings.",
    image: "https://picsum.photos/seed/realty/400/300",
    imageHint: "modern house",
    tags: ["Content", "E-commerce"],
    creator: "RealtyWrite",
    date: "2024-08-14",
    price: "$29.99/month",
  },
  {
    title: "AI Music Remixer",
    description: "Remix existing audio tracks into new and unique compositions.",
    image: "https://picsum.photos/seed/remix/400/300",
    imageHint: "dj mixer",
    tags: ["Audio", "AI"],
    creator: "SoundWave",
    date: "2024-09-06",
    price: "$19.99",
  },
  {
    title: "Discord Bot Integration",
    description: "Bring the power of LingoLancers AI to your Discord server.",
    image: "https://picsum.photos/seed/discord/400/300",
    imageHint: "discord logo",
    tags: ["Tools", "Social Media", "Discord"],
    creator: "3rd-Party Dev",
    date: "2024-08-19",
    price: "$9.99/month",
  },
  {
    title: "Slack Post Automation",
    description: "Automatically post updates and generated content to your Slack channels.",
    image: "https://picsum.photos/seed/slack/400/300",
    imageHint: "slack logo",
    tags: ["Tools", "Productivity", "Slack"],
    creator: "Productivity Plus",
    date: "2024-08-29",
    price: "$14.99",
  },
  {
    title: "Meeting Summarizer",
    description: "Upload an audio recording of a meeting and get a concise summary with action items.",
    image: "https://picsum.photos/seed/meeting/400/300",
    imageHint: "meeting room",
    tags: ["Productivity", "Audio", "AI"],
    creator: "PodScribe",
    date: "2024-09-21",
    price: "$25/month",
  },
  {
    title: "Recipe Generator",
    description: "Create unique recipes from a list of ingredients or a dietary preference.",
    image: "https://picsum.photos/seed/recipe/400/300",
    imageHint: "food ingredients",
    tags: ["Content", "Blogging"],
    creator: "Foodie AI",
    date: "2024-07-28",
    price: "$9.99",
  }
];

type Module = typeof modules[0];

const filterCategories = ["All", "Social Media", "E-commerce", "Content", "Video", "Tools", "AI", "Audio"];

const FilterButton = ({ category, activeFilter, setFilter }: { category: string, activeFilter: string, setFilter: (filter: string) => void }) => (
    <Button
        variant="ghost"
        className={cn(
            "rounded-full h-8 px-4",
            activeFilter === category
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-muted/50"
        )}
        onClick={() => setFilter(category)}
    >
        {category}
    </Button>
);

export default function MarketplaceView({ navigate }: { navigate: (view: string, subView?: string) => void }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const handleCardClick = (module: Module) => {
    setSelectedModule(module);
    setIsSheetOpen(true);
  };
  
  const filteredModules = modules.filter(module => 
    activeFilter === "All" || module.tags.includes(activeFilter)
  );

  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Our Lancers</h1>
                <p className="text-lg text-muted-foreground mt-2">Extend the power of your platform with pre-built modules and integrations.</p>
            </div>
            <Button onClick={() => navigate('lancer-builder')} className="animated-gradient-border bg-transparent text-white">
                <Workflow className="mr-2 h-4 w-4" />
                Create Your Own Lancer
            </Button>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
            {filterCategories.map(category => (
                <FilterButton key={category} category={category} activeFilter={activeFilter} setFilter={setActiveFilter} />
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModules.map((module) => (
                <Card 
                    key={module.title}
                    className="bg-card/50 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform duration-200"
                    onClick={() => handleCardClick(module)}
                >
                    <div className="aspect-video overflow-hidden">
                        <Image
                            src={module.image}
                            alt={module.title}
                            width={400}
                            height={300}
                            className="object-cover w-full h-full"
                            data-ai-hint={module.imageHint}
                        />
                    </div>
                    <CardHeader>
                        <CardTitle className="font-headline h-12">{module.title}</CardTitle>
                        <CardDescription className="text-xs h-8">{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {module.tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="sm:max-w-lg bg-background/95 backdrop-blur-sm">
                {selectedModule && (
                    <>
                        <SheetHeader className="mb-6">
                             <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                <Image 
                                    src={selectedModule.image}
                                    alt={selectedModule.title}
                                    width={600}
                                    height={400}
                                    className="object-cover w-full h-full"
                                    data-ai-hint={selectedModule.imageHint}
                                />
                            </div>
                            <SheetTitle className="text-2xl font-headline text-primary">{selectedModule.title}</SheetTitle>
                            <SheetDescription className="text-sm !mt-2">
                                Created by {selectedModule.creator} on {selectedModule.date}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-6">
                           <p className="text-muted-foreground">{selectedModule.description} This module helps you to expand your reach and engage with a wider audience by leveraging the power of automation and AI-driven content generation.</p>
                           
                           <div className="flex flex-wrap gap-2">
                                {selectedModule.tags.map(tag => (
                                    <Badge key={tag} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                           
                           <div className="text-3xl font-bold font-headline">
                                {selectedModule.price}
                           </div>

                           <Button size="lg" className="w-full animated-gradient-border bg-transparent hover:bg-transparent text-white">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {selectedModule.price === "Free" ? "Use It" : "Buy Now"}
                           </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    </div>
  );
}
