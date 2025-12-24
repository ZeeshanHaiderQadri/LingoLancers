
'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { Settings2, RectangleHorizontal, RectangleVertical, Square, HelpCircle, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

const resolutionOptions = ["360P", "540P", "720P", "1080P"];
const ratioOptions = [
    { label: "16:9", icon: <RectangleHorizontal className="h-5 w-5" /> },
    { label: "4:3", icon: <RectangleHorizontal className="h-5 w-5" /> },
    { label: "1:1", icon: <Square className="h-5 w-5" /> },
    { label: "3:4", icon: <RectangleVertical className="h-5 w-5" /> },
    { label: "9:16", icon: <RectangleVertical className="h-5 w-5" /> },
];
const durationOptions = ["5s", "8s"];

export default function ParameterPanel() {
    const [activeResolution, setActiveResolution] = React.useState("360P");
    const [activeRatio, setActiveRatio] = React.useState("16:9");
    const [activeDuration, setActiveDuration] = React.useState("5s");
    const [createCount, setCreateCount] = React.useState([1]);
    const [seed, setSeed] = React.useState([Math.floor(Math.random() * 999999999)]);

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Parameter</h2>
                <Button variant="ghost" className="text-muted-foreground">Creative Companion <Badge variant="secondary" className="ml-2 bg-green-400/20 text-green-300">New</Badge></Button>
            </div>

            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-sm font-normal text-muted-foreground">Model</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-background/50 p-2 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image src="https://picsum.photos/seed/v5model/60/60" width={40} height={40} alt="V5 Model" className="rounded" data-ai-hint="abstract logo" />
                            <div>
                                <div className="font-semibold flex items-center">V5 <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">NEW</Badge></div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon"><Settings2 className="h-5 w-5 text-muted-foreground" /></Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-sm font-normal text-muted-foreground">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                        {durationOptions.map(dur => (
                            <Button
                                key={dur}
                                variant="outline"
                                className={cn("bg-background/50 border-white/10 h-10", activeDuration === dur && "bg-white text-black")}
                                onClick={() => setActiveDuration(dur)}
                            >
                                {dur}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-normal text-muted-foreground">Resolution</CardTitle>
                        <div className="text-xs text-primary flex items-center gap-1">
                            <Badge variant="destructive" className="bg-transparent text-pink-400 border border-pink-400/50 px-1 py-0 text-xs">◆</Badge>
                            3 Free Trial Left
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                        {resolutionOptions.map(res => (
                            <Button
                                key={res}
                                variant="outline"
                                className={cn("bg-background/50 border-white/10", activeResolution === res && "bg-white text-black")}
                                onClick={() => setActiveResolution(res)}
                            >
                                {res} {["720P", "1080P"].includes(res) && <Badge variant="destructive" className="bg-transparent text-pink-400 border-none p-0 ml-1">◆</Badge>}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-sm font-normal text-muted-foreground">Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                        {ratioOptions.map(ratio => (
                            <Button
                                key={ratio.label}
                                variant="outline"
                                className={cn("bg-background/50 border-white/10 h-16 flex-col gap-1", activeRatio === ratio.label && "bg-white text-black")}
                                onClick={() => setActiveRatio(ratio.label)}
                            >
                                {ratio.icon}
                                <span className="text-xs">{ratio.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="auto-sound" className="flex items-center gap-2">Auto Sound <HelpCircle className="h-4 w-4 text-muted-foreground" /></Label>
                    <Switch id="auto-sound" />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="auto-speech" className="flex items-center gap-2">Auto Speech <HelpCircle className="h-4 w-4 text-muted-foreground" /></Label>
                    <Switch id="auto-speech" />
                </div>
                <Button variant="ghost" className="w-full justify-between p-3 bg-card/50 border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded-md"><Shuffle className="h-4 w-4 text-primary" /></div>
                        Style
                    </div>
                     <span className="text-muted-foreground">&gt;</span>
                </Button>
                <div className="flex items-center justify-between">
                    <Label htmlFor="off-peak" className="flex items-center gap-2">Off-Peak Mode <HelpCircle className="h-4 w-4 text-muted-foreground" /></Label>
                    <Switch id="off-peak" />
                </div>
            </div>

            <Card className="bg-card/50 border-white/10">
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-normal text-muted-foreground">Create Count</CardTitle>
                        <Badge variant="outline" className="bg-background/50">{createCount[0]}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Slider value={createCount} onValueChange={setCreateCount} min={1} max={4} step={1} />
                </CardContent>
            </Card>

             <Card className="bg-card/50 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-normal text-muted-foreground">Seed</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                    <Slider value={seed} onValueChange={(value) => setSeed(value)} min={0} max={999999999} step={1} />
                     <Button variant="outline" size="icon" className="bg-background/50 border-white/10 shrink-0" onClick={() => setSeed([Math.floor(Math.random() * 999999999)])}>
                        <Shuffle className="h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

        </div>
    );
}
