
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Upload, Wand2, AudioLines } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SoundPanel() {
    return (
        <div className="space-y-4">
            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-base">AI Music</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Label>Describe the music you want</Label>
                    <Textarea placeholder="e.g., An epic cinematic score with orchestral strings" />
                    <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                        <Music className="h-4 w-4 mr-2" />
                        Generate AI Music
                    </Button>
                </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-base">Sound Effects</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-3">
                    <Label>Describe the sound effect</Label>
                    <Textarea placeholder="e.g., A powerful explosion, a gentle whoosh" />
                    <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                        <AudioLines className="h-4 w-4 mr-2" />
                        Generate Sound Effect
                    </Button>
                </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-base">Other Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Audio File
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Extract Music from Video
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
