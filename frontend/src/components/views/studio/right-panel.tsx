
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, SplitSquareHorizontal } from 'lucide-react';
import PromptInput from './prompt-input';
import { cn } from '@/lib/utils';

type ViewMode = 'video' | 'image';

type RightPanelProps = {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
};


export default function RightPanel({ viewMode, setViewMode }: RightPanelProps) {
  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-black/50 p-1 rounded-lg flex items-center">
            <Button onClick={() => setViewMode('video')} variant="ghost" className={cn("h-8 text-xs px-4", viewMode === 'video' && 'bg-white text-black hover:bg-white/90 hover:text-black')}>Video</Button>
            <Button onClick={() => setViewMode('image')} variant="ghost" className={cn("h-8 text-xs px-4", viewMode === 'image' && 'bg-white text-black hover:bg-white/90 hover:text-black')}>Image</Button>
        </div>
        <div className="flex items-center gap-2">
            <Select defaultValue="normal">
                <SelectTrigger className="w-[120px] h-9 text-xs bg-black/50 border-white/10">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
            </Select>
            <div className="bg-black/50 p-1 rounded-lg flex items-center">
                <Button variant="ghost" size="icon" className="h-7 w-7"><LayoutGrid className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><SplitSquareHorizontal className="h-4 w-4" /></Button>
            </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold">Video Not Found</h2>
        <p className="text-muted-foreground">Start creating your first video</p>
      </div>
      <div className="mt-auto">
        <PromptInput />
      </div>
    </div>
  );
}
