
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const styles = [
    { name: "Cinematic", src: "https://picsum.photos/seed/style1/80/80", hint: "movie still" },
    { name: "Anime", src: "https://picsum.photos/seed/style2/80/80", hint: "anime drawing" },
    { name: "3D", src: "https://picsum.photos/seed/style3/80/80", hint: "3d render" },
    { name: "Fantasy", src: "https://picsum.photos/seed/style4/80/80", hint: "fantasy landscape" },
    { name: "Neon", src: "https://picsum.photos/seed/style5/80/80", hint: "neon lights" },
    { name: "Painting", src: "https://picsum.photos/seed/style6/80/80", hint: "oil painting" },
    { name: "Cyberpunk", src: "https://picsum.photos/seed/style7/80/80", hint: "cyberpunk city" },
    { name: "Vintage", src: "https://picsum.photos/seed/style8/80/80", hint: "vintage photo" },
]

export default function RestylePanel() {
    return (
        <Card className="bg-card/50 border-white/10">
            <CardHeader>
                <CardTitle className="text-base">Restyle</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 gap-4">
                    {styles.map(style => (
                        <div key={style.name} className="flex flex-col items-center gap-2 cursor-pointer group">
                            <Image src={style.src} alt={style.name} width={60} height={60} className="rounded-md border-2 border-transparent group-hover:border-primary" data-ai-hint={style.hint} />
                            <span className="text-xs text-muted-foreground group-hover:text-white">{style.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
