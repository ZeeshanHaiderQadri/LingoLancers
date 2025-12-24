
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Sparkles, GitMerge, Wand2, Play, Music, Mic, Palette, Smile, Maximize, PanelRight, Clock, RectangleHorizontal, Video, AudioLines, Speech, Brush, Box, Bot, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import TemplatePopover from './popovers/template-popover';
import TransitionPopover from './popovers/transition-popover';
import SoundPopover from './popovers/sound-popover';
import SpeechPopover from './popovers/speech-popover';
import RestylePopover from './popovers/restyle-popover';
import CharacterPopover from './popovers/character-popover';
import PanelPopover from './popovers/panel-popover';
import DurationPopover from './popovers/duration-popover';
import StylePopover from './popovers/style-popover';
import ResolutionPopover from './popovers/resolution-popover';
import AspectRatioPopover from './popovers/aspect-ratio-popover';

type Mode = 'image-text' | 'template' | 'transition' | 'fusion' | 'extend' | 'sound' | 'speech' | 'restyle' | 'character';

const topNavItems: { mode: Mode, icon: React.ElementType, label: string, popover: React.ReactNode }[] = [
  { mode: 'image-text', icon: ImageIcon, label: 'Image or Text', popover: null },
  { mode: 'template', icon: Sparkles, label: 'Template', popover: <TemplatePopover /> },
  { mode: 'transition', icon: GitMerge, label: 'Transition', popover: <TransitionPopover /> },
  { mode: 'fusion', icon: Wand2, label: 'Fusion', popover: null },
  { mode: 'extend', icon: Play, label: 'Extend', popover: <p className="p-4 text-sm">Extend video options here.</p> },
  { mode: 'sound', icon: Music, label: 'Sound', popover: <SoundPopover /> },
  { mode: 'speech', icon: Mic, label: 'Speech', popover: <SpeechPopover /> },
  { mode: 'restyle', icon: Palette, label: 'Restyle', popover: <RestylePopover /> },
  { mode: 'character', icon: Smile, label: 'Character', popover: <CharacterPopover /> },
];

const defaultBottomNavItems = [
    { icon: PanelRight, label: 'Panel', pro: true, popover: <PanelPopover /> },
    { icon: Clock, label: '5s', popover: <DurationPopover /> },
    { icon: Video, label: '360P', pro: true, popover: <ResolutionPopover /> },
    { icon: RectangleHorizontal, label: '16:9', popover: <AspectRatioPopover /> },
    { icon: AudioLines, label: 'Auto Sound', popover: <p className="p-4 text-sm">AI will automatically select the best sound.</p> },
    { icon: Speech, label: 'Auto Speech', popover: <p className="p-4 text-sm">AI will automatically generate speech.</p> },
    { icon: Brush, label: 'Style', popover: <StylePopover /> },
];

const soundBottomNavItems = [
    { icon: Music, label: 'AI Music', pro: false, popover: <SoundPopover /> },
    { icon: AudioLines, label: 'Sound Effects', pro: true, popover: <p className="p-4 text-sm">AI will find sound effects for your video.</p> },
    { icon: Wand2, label: 'Music from Video', pro: true, popover: <p className="p-4 text-sm">Extract and reuse music from a video.</p> },
];

const speechBottomNavItems = [
    { icon: Bot, label: 'Text to Speech', pro: false, popover: <SpeechPopover /> },
    { icon: Mic, label: 'Record Voice', pro: false, popover: <p className="p-4 text-sm">Record your own voiceover.</p> },
    { icon: Upload, label: 'Upload Voice', pro: false, popover: <p className="p-4 text-sm">Upload an existing audio file.</p> },
];

const IconButton = ({ item, active = false, onClick }: { item: { icon: React.ElementType, label: string, mode: Mode, popover: React.ReactNode }, active?: boolean, onClick: () => void }) => {
    const buttonContent = (
        <Button 
            variant="ghost" 
            className={cn(
                "flex items-center gap-1 text-xs h-auto px-2 py-1 rounded-md", 
                active ? "text-primary-foreground bg-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
            onClick={onClick}
        >
            <item.icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{item.label}</span>
        </Button>
    );

    if (!item.popover || active) {
        return buttonContent;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-white/10 bg-black/80 text-white" side="top" align="center">
                {item.popover}
            </PopoverContent>
        </Popover>
    );
};

const PillButton = ({ item }: { item: { icon: React.ElementType, label: string, pro?: boolean, popover: React.ReactNode }}) => {
    const button = (
        <Button variant="secondary" className="bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground rounded-full h-8 px-3 text-xs font-normal">
            <item.icon className="h-3 w-3 mr-1.5" />
            <span className="whitespace-nowrap">{item.label}</span>
            {item.pro && <Sparkles className="h-3 w-3 ml-1.5 text-pink-400" />}
        </Button>
    );

    if (!item.popover) {
        return button;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>{button}</PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-white/10 bg-black/80 text-white" side="top" align="center">
                {item.popover}
            </PopoverContent>
        </Popover>
    );
}

const FusionUploadSlot = ({ optional = false }: { optional?: boolean }) => (
    <div className={cn(
        "h-12 w-12 rounded-lg flex items-center justify-center flex-col cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10",
        optional && "border-dashed"
    )}>
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
        {optional && <span className="text-[10px] text-muted-foreground mt-0.5">Optional</span>}
    </div>
);


export default function AdvancedChatInput({ onSubmit, isLoading, onMaximize }: { onSubmit: (value: string) => void, isLoading: boolean, onMaximize: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [activeMode, setActiveMode] = useState<Mode>('image-text');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
        onSubmit(prompt);
        setPrompt('');
    }
  };

  const renderBottomNav = () => {
    switch(activeMode) {
        case 'sound': return soundBottomNavItems;
        case 'speech': return speechBottomNavItems;
        default: return defaultBottomNavItems;
    }
  }

  const renderInputArea = () => {
    switch (activeMode) {
        case 'fusion':
            return (
                <div className="flex items-center gap-2">
                    <FusionUploadSlot />
                    <FusionUploadSlot optional />
                    <FusionUploadSlot optional />
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the content you'd like to create."
                        className="bg-transparent border-none text-sm placeholder:text-muted-foreground/80 focus-visible:ring-0 resize-none h-12 p-0 ml-2"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleFormSubmit(e);
                            }
                        }}
                    />
                </div>
            );
        case 'image-text':
        default:
            return (
                <div className="flex items-start gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-12 w-12 bg-white/5 border border-white/10 hover:bg-white/10 flex-shrink-0">
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Image</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleFormSubmit(e);
                        }
                    }}
                    placeholder="Describe the content you want to create"
                    className="bg-transparent border-none text-sm placeholder:text-muted-foreground/80 focus-visible:ring-0 resize-none h-12 p-0"
                  />
                </div>
            );
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:animate-gradient bg-[length:400%_400%]"></div>
            <div className="relative bg-black/80 backdrop-blur-sm rounded-[11px] p-3 border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <div className="flex items-center gap-1 flex-nowrap overflow-x-auto no-scrollbar">
                        {topNavItems.map(item => (
                        <IconButton key={item.label} item={item} active={activeMode === item.mode} onClick={() => setActiveMode(item.mode)} />
                        ))}
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 ml-2 flex-shrink-0" onClick={onMaximize}>
                        <Maximize className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleFormSubmit}>
                    {renderInputArea()}

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar">
                            {renderBottomNav().map(item => (
                                <PillButton key={item.label} item={item} />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 pl-2">
                            <Button variant="ghost" className="text-muted-foreground rounded-full h-8 px-3 text-xs whitespace-nowrap">
                                <Box className="h-4 w-4 mr-2" /> V5
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold px-6 h-10" disabled={isLoading}>
                                Create
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}

    