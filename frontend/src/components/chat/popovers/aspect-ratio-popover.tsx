
import { Button } from "@/components/ui/button";
import { RectangleHorizontal, RectangleVertical, Square } from "lucide-react";

const ratios = [
    { label: "16:9", icon: <RectangleHorizontal className="h-5 w-5" /> },
    { label: "9:16", icon: <RectangleVertical className="h-5 w-5" /> },
    { label: "1:1", icon: <Square className="h-5 w-5" /> },
    { label: "4:3", icon: <RectangleHorizontal className="h-5 w-5" /> },
    { label: "3:2", icon: <RectangleHorizontal className="h-5 w-5" /> },
];

export default function AspectRatioPopover() {
    return (
        <div className="p-2">
             <h4 className="font-semibold mb-2 px-2">Aspect Ratio</h4>
            <div className="grid grid-cols-5 gap-2">
                {ratios.map(ratio => (
                    <div key={ratio.label} className="flex flex-col items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white/10">
                        {ratio.icon}
                        <span className="text-xs">{ratio.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
