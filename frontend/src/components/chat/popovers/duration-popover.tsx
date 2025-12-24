
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export default function DurationPopover() {
    return (
        <div className="p-4 w-64 space-y-4">
            <div className="flex justify-between items-center">
                <Label htmlFor="duration-slider" className="font-semibold">Duration</Label>
                <span className="text-sm">5s</span>
            </div>
            <Slider
                id="duration-slider"
                defaultValue={[5]}
                min={1}
                max={60}
                step={1}
            />
        </div>
    )
}
