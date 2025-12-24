
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const resolutions = [
    { label: "360p", pro: false },
    { label: "720p", pro: false },
    { label: "1080p", pro: true },
    { label: "2K", pro: true },
    { label: "4K", pro: true },
];

export default function ResolutionPopover() {
    return (
        <div className="p-1">
            <div className="flex items-center gap-1">
                {resolutions.map(res => (
                    <Button key={res.label} variant="ghost" className="flex items-center gap-1.5 text-xs h-auto px-3 py-1.5 rounded-md hover:bg-white/10 text-white">
                        <span>{res.label}</span>
                        {res.pro && <Sparkles className="h-3 w-3 text-pink-400" />}
                    </Button>
                ))}
            </div>
        </div>
    )
}
