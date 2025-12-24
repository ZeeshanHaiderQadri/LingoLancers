
import { Button } from "@/components/ui/button";
import { Music, Upload } from "lucide-react";

export default function SoundPopover() {
    return (
        <div className="p-4 w-64 space-y-3">
            <h4 className="font-semibold">Sound</h4>
            <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                <Music className="h-4 w-4 mr-2" />
                AI Music
            </Button>
            <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload Audio
            </Button>
        </div>
    )
}
