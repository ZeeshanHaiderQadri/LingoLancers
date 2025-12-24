
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageIcon, Sparkles, GitMerge, Wand2, Play, Music, Mic, Palette, Smile } from 'lucide-react';

const navItems = [
  { name: 'Image or Text', icon: <ImageIcon className="h-5 w-5" /> },
  { name: 'Template', icon: <Sparkles className="h-5 w-5" /> },
  { name: 'Transition', icon: <GitMerge className="h-5 w-5" /> },
  { name: 'Fusion', icon: <Wand2 className="h-5 w-5" /> },
  { name: 'Extend', icon: <Play className="h-5 w-5" /> },
  { name: 'Sound', icon: <Music className="h-5 w-5" /> },
  { name: 'Speech', icon: <Mic className="h-5 w-5" /> },
  { name: 'Restyle', icon: <Palette className="h-5 w-5" /> },
  { name: 'Character', icon: <Smile className="h-5 w-5" /> },
];

type LeftPanelProps = {
  activeMode: string;
  setActiveMode: (mode: string) => void;
};

export default function LeftPanel({ activeMode, setActiveMode }: LeftPanelProps) {
  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          className={cn(
            'w-full justify-start text-sm gap-3 h-10',
            activeMode === item.name ? 'bg-primary/20 text-white' : 'text-muted-foreground'
          )}
          onClick={() => setActiveMode(item.name)}
        >
          {item.icon}
          <span>{item.name}</span>
        </Button>
      ))}
    </nav>
  );
}
