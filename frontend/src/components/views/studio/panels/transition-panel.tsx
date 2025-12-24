
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const transitions = [
    { name: "Fade", src: "https://picsum.photos/seed/t1/80/60", hint: "fade effect" },
    { name: "Dissolve", src: "https://picsum.photos/seed/t2/80/60", hint: "dissolve effect" },
    { name: "Wipe Left", src: "https://picsum.photos/seed/t3/80/60", hint: "wipe effect" },
    { name: "Wipe Right", src: "https://picsum.photos/seed/t4/80/60", hint: "wipe effect" },
    { name: "Zoom In", src: "https://picsum.photos/seed/t5/80/60", hint: "zoom effect" },
    { name: "Slide Up", src: "https://picsum.photos/seed/t6/80/60", hint: "slide effect" },
    { name: "Slide Down", src: "https://picsum.photos/seed/t7/80/60", hint: "slide effect" },
    { name: "Push Left", src: "https://picsum.photos/seed/t8/80/60", hint: "push effect" },
]

export default function TransitionPanel() {
    return (
        <Card className="bg-card/50 border-white/10">
            <CardHeader>
                <CardTitle className="text-base">Select Transition</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-2 gap-3">
                     {transitions.map(t => (
                        <div key={t.name} className="flex flex-col items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-white/5">
                            <Image src={t.src} alt={t.name} width={120} height={90} className="rounded-md border-2 border-transparent group-hover:border-primary" data-ai-hint={t.hint} />
                            <span className="text-xs text-muted-foreground group-hover:text-white">{t.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
