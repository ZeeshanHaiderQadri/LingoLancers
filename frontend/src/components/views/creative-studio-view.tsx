
'use client';

import React, { useState } from 'react';
import LeftPanel from './studio/left-panel';
import MiddlePanel from './studio/middle-panel';
import RightPanel from './studio/right-panel';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ViewMode = 'video' | 'image';

export default function CreativeStudioView({ onClose }: { onClose: () => void }) {
  const [activeMode, setActiveMode] = useState('Image or Text');
  const [viewMode, setViewMode] = useState<ViewMode>('video');
  const userImage = PlaceHolderImages.find(p => p.id === 'user-avatar');

  return (
    <div className="bg-background text-white h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold font-headline">Creative Studio</h1>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="text-xs h-8">API Platform</Button>
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={userImage?.imageUrl}
                alt="User Avatar"
                data-ai-hint={userImage?.imageHint} 
              />
              <AvatarFallback>LL</AvatarFallback>
            </Avatar>
        </div>
      </header>
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        <div className="col-span-2 border-r border-white/10 p-4">
          <LeftPanel activeMode={activeMode} setActiveMode={setActiveMode} />
        </div>
        <div className="col-span-3 border-r border-white/10 p-4 overflow-y-auto no-scrollbar">
          <MiddlePanel activeMode={activeMode} />
        </div>
        <div className="col-span-7 flex flex-col">
          <RightPanel viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>
    </div>
  );
}

    