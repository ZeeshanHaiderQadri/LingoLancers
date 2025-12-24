
import Image from "next/image";

const styles = [
    { name: "Cinematic", src: "https://picsum.photos/seed/s1/80/80", hint: "movie still" },
    { name: "Anime", src: "https://picsum.photos/seed/s2/80/80", hint: "anime drawing" },
    { name: "3D", src: "https://picsum.photos/seed/s3/80/80", hint: "3d render" },
    { name: "Painting", src: "https://picsum.photos/seed/s4/80/80", hint: "oil painting" },
];

export default function StylePopover() {
    return (
        <div className="p-4 w-80">
            <h4 className="font-semibold mb-3">Select Style</h4>
            <div className="grid grid-cols-4 gap-3">
                {styles.map(style => (
                    <div key={style.name} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <Image src={style.src} alt={style.name} width={60} height={60} className="rounded-md border-2 border-transparent group-hover:border-primary" data-ai-hint={style.hint} />
                        <span className="text-xs text-muted-foreground group-hover:text-white">{style.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
