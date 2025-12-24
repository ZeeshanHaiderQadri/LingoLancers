
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Mic, Upload } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function SpeechPanel() {
    return (
        <div className="space-y-4">
            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-base">Text to Speech</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label>Text</Label>
                        <Textarea placeholder="Enter the text to convert to speech..." />
                    </div>
                     <div className="space-y-2">
                        <Label>Voice</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Select a voice" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alloy">Alloy (Male, Neutral)</SelectItem>
                                <SelectItem value="nova">Nova (Female, Energetic)</SelectItem>
                                <SelectItem value="shimmer">Shimmer (Female, Professional)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                        <Bot className="h-4 w-4 mr-2" />
                        Generate Speech
                    </Button>
                </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-base">Other Speech Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                        <Mic className="h-4 w-4 mr-2" />
                        Record Voice
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Voice
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
