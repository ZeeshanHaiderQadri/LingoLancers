
import { Button } from "@/components/ui/button";
import { Mic, Upload, Bot } from "lucide-react";

export default function SpeechPopover() {
    return (
        <div className="p-4 w-64 space-y-3">
            <h4 className="font-semibold">Speech</h4>
             <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                <Bot className="h-4 w-4 mr-2" />
                Text to Speech
            </Button>
            <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                <Mic className="h-4 w-4 mr-2" />
                Record Voice
            </Button>
            <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload Voice
            </Button>
        </div>
    )
}
