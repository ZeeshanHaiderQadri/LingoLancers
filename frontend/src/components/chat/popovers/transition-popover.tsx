
import Image from "next/image";

const transitions = [
    { name: "Fade", src: "https://picsum.photos/seed/t1/60/40", hint: "fade effect" },
    { name: "Dissolve", src: "https://picsum.photos/seed/t2/60/40", hint: "dissolve effect" },
    { name: "Wipe Left", src: "https://picsum.photos/seed/t3/60/40", hint: "wipe effect" },
    { name: "Wipe Right", src: "https://picsum.photos/seed/t4/60/40", hint: "wipe effect" },
    { name: "Zoom In", src: "https://picsum.photos/seed/t5/60/40", hint: "zoom effect" },
]

export default function TransitionPopover() {
    return (
        <div className="p-4 w-96">
            <h4 className="font-semibold mb-3">Select Transition</h4>
            <div className="grid grid-cols-5 gap-3">
                 {transitions.map(t => (
                    <div key={t.name} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <Image src={t.src} alt={t.name} width={60} height={40} className="rounded-md border-2 border-transparent group-hover:border-primary" data-ai-hint={t.hint} />
                        <span className="text-xs text-muted-foreground group-hover:text-white">{t.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
