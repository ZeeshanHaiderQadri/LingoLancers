
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';

const characters = [
    { name: "Nova", src: "https://picsum.photos/seed/char1/100/100", hint: "female cyberpunk" },
    { name: "Jax", src: "https://picsum.photos/seed/char2/100/100", hint: "male adventurer" },
    { name: "Luna", src: "https://picsum.photos/seed/char3/100/100", hint: "fantasy elf" },
    { name: "Orion", src: "https://picsum.photos/seed/char4/100/100", hint: "space captain" },
];

export default function CharacterPanel() {
    return (
        <Card className="bg-card/50 border-white/10">
            <CardHeader>
                <CardTitle className="text-base">Character</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                    {characters.map(char => (
                        <div key={char.name} className="flex flex-col items-center gap-2 cursor-pointer">
                            <Image src={char.src} alt={char.name} width={60} height={60} className="rounded-full border-2 border-transparent hover:border-primary" data-ai-hint={char.hint} />
                            <span className="text-xs">{char.name}</span>
                        </div>
                    ))}
                </div>
                 <Button variant="outline" className="w-full mt-4 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Character
                </Button>
            </CardContent>
        </Card>
    )
}
