
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function PanelPopover() {
    return (
        <div className="p-4 w-64 space-y-4">
            <h4 className="font-semibold">Advanced Panel</h4>
            <div className="flex items-center justify-between">
                <Label htmlFor="consistency-switch">Consistency</Label>
                <Switch id="consistency-switch" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="public-switch">Public Mode</Label>
                <Switch id="public-switch" />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="hd-switch">HD Quality</Label>
                <Switch id="hd-switch" defaultChecked />
            </div>
        </div>
    )
}
