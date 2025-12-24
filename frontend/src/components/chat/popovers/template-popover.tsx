
import { Button } from "@/components/ui/button";

const templates = [
    "A cinematic trailer for a sci-fi movie",
    "A product ad for a new sneaker",
    "A viral dance challenge video",
    "A calming nature documentary scene",
];

export default function TemplatePopover() {
    return (
        <div className="p-4 w-80">
            <h4 className="font-semibold mb-3">Prompt Templates</h4>
            <div className="space-y-2">
                {templates.map((template, i) => (
                    <Button key={i} variant="ghost" className="w-full justify-start text-left h-auto py-1.5 px-2 bg-white/5 hover:bg-white/10">
                       {template}
                    </Button>
                ))}
            </div>
        </div>
    )
}
