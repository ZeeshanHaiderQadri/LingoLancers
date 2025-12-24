
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const FusionUploadSlot = ({ optional = false, isFirst = false }: { optional?: boolean, isFirst?: boolean }) => (
    <div className={cn(
        "h-32 w-full rounded-lg flex items-center justify-center flex-col cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10",
        optional && "border-dashed"
    )}>
        <Upload className="h-6 w-6 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mt-1">{isFirst ? 'Upload Base' : 'Upload Style'}</span>
        {optional && <span className="text-[10px] text-muted-foreground mt-0.5">Optional</span>}
    </div>
);


export default function FusionPanel() {
    return (
        <Card className="bg-card/50 border-white/10">
            <CardHeader>
                <CardTitle className="text-base">Fusion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Combine a base image/video with one or more style images.</p>
                <div className="grid grid-cols-2 gap-4">
                    <FusionUploadSlot isFirst />
                    <FusionUploadSlot />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FusionUploadSlot optional />
                    <FusionUploadSlot optional />
                </div>
            </CardContent>
        </Card>
    )
}
