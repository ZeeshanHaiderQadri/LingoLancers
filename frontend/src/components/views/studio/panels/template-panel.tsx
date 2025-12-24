
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const templates = [
    "A cinematic trailer for a sci-fi movie",
    "A product ad for a new sneaker",
    "A viral dance challenge video",
    "A calming nature documentary scene",
    "A historical documentary about ancient Rome",
    "An upbeat, fast-paced commercial for a sports drink",
    "A tutorial video for a software product",
];

export default function TemplatePanel() {
    return (
        <Card className="bg-card/50 border-white/10">
            <CardHeader>
                <CardTitle className="text-base">Prompt Templates</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {templates.map((template, i) => (
                        <Button key={i} variant="ghost" className="w-full justify-start text-left h-auto py-2 px-3 bg-white/5 hover:bg-white/10 text-sm">
                           {template}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
