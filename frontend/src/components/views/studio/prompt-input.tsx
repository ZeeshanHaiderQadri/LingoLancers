
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Upload } from 'lucide-react';

export default function PromptInput() {
  return (
    <div className="space-y-3">
        <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-card/50 border-white/10 h-12 w-12 flex-col gap-1">
                <Sparkles className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="bg-card/50 border-white/10 h-12 w-12 flex-col gap-1">
                <Upload className="h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground">First button for Template, Second for upload</p>
        </div>
        <div className="flex items-center gap-2">
            <Textarea placeholder="Describe your video..." className="bg-card/50 border-white/10" />
            <Button className="h-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8">
                Create
            </Button>
        </div>
    </div>
  );
}
