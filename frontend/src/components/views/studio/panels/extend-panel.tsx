
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ExtendPanel() {
    return (
        <Card className="bg-card/50 border-white/10">
            <CardHeader>
                <CardTitle className="text-base">Extend Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Extend the duration of your generated video.</p>
                <div className="space-y-2">
                    <Label htmlFor="extend-duration">Extend by (seconds)</Label>
                    <Input id="extend-duration" type="number" defaultValue="5" />
                </div>
                <Button className="w-full">Extend</Button>
            </CardContent>
        </Card>
    )
}
