
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { Bot, Check, Shirt, User, Users, Wind, Sparkles, RefreshCcw, BookOpen, Info, Upload, Eye, Download, Trash2, AlertCircle, Lightbulb, ImageIcon } from "lucide-react";


const GenderButton = ({ value, selected, onSelect, children }: { value: string, selected: string, onSelect: (value: string) => void, children: React.ReactNode }) => (
    <Button
        variant="outline"
        className={cn(
            "w-full h-12 text-base",
            selected === value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent'
        )}
        onClick={() => onSelect(value)}
    >
        {children}
    </Button>
);

const AgeButton = ({ value, selected, onSelect, children }: { value: string, selected: string, onSelect: (value: string) => void, children: React.ReactNode }) => (
    <Button
        variant="outline"
        className={cn(
            "w-full h-12 text-base",
            selected === value ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent'
        )}
        onClick={() => onSelect(value)}
    >
        {children}
    </Button>
);

const SkinTonePicker = ({ selected, onSelect }: { selected: string, onSelect: (value: string) => void }) => {
    const tones = [
        { value: 'light-1', color: 'bg-[#fde5d5]' },
        { value: 'light-2', color: 'bg-[#f7d3b7]' },
        { value: 'mid-1', color: 'bg-[#d8a881]' },
        { value: 'mid-2', color: 'bg-[#a37448]' },
        { value: 'dark-1', color: 'bg-[#7a543d]' },
        { value: 'dark-2', color: 'bg-[#4a2e22]' },
    ];
    return (
        <RadioGroup value={selected} onValueChange={onSelect} className="flex gap-3">
            {tones.map(tone => (
                <div key={tone.value} className="relative">
                    <RadioGroupItem value={tone.value} id={tone.value} className="sr-only" />
                    <Label
                        htmlFor={tone.value}
                        className={cn(
                            "block w-12 h-12 rounded-lg cursor-pointer border-2",
                            tone.color,
                            selected === tone.value ? 'border-primary' : 'border-transparent'
                        )}
                    />
                    {selected === tone.value && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Check className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.5))' }} />
                        </div>
                    )}
                </div>
            ))}
        </RadioGroup>
    );
}

const HintButton = ({ children }: { children: React.ReactNode }) => (
    <Button variant="secondary" className="bg-card hover:bg-card/80 text-foreground">{children}</Button>
)

const VirtualModelTab = () => {
    const [gender, setGender] = useState('female');
    const [age, setAge] = useState('youth');
    const [skinTone, setSkinTone] = useState('light-2');
    const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);

    const handleGenerate = () => {
        setShowComingSoonDialog(true);
    };

    return (
        <>
        <Dialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                            <Sparkles className="h-12 w-12 text-white" />
                        </div>
                        <DialogTitle className="text-2xl text-center">Coming Soon!</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            We're working hard to bring you the Virtual Model feature. This exciting feature will be available very soon!
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm text-center">
                            In the meantime, try our <strong>AI Virtual Try-On</strong> feature to see how garments look on real models!
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        onClick={() => setShowComingSoonDialog(false)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        Got it!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Card className="bg-card/50 max-w-4xl mx-auto h-full flex flex-col">
            <CardHeader>
                <CardTitle>Model Settings / Model Custom</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                <div className="space-y-3">
                    <Label>Gender</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <GenderButton value="male" selected={gender} onSelect={setGender}><User className="mr-2 h-5 w-5" /> Male</GenderButton>
                        <GenderButton value="female" selected={gender} onSelect={setGender}><User className="mr-2 h-5 w-5" /> Female</GenderButton>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Age</Label>
                    <div className="grid grid-cols-3 gap-4">
                        <AgeButton value="children" selected={age} onSelect={setAge}><Users className="mr-2 h-5 w-5" /> Children</AgeButton>
                        <AgeButton value="youth" selected={age} onSelect={setAge}><User className="mr-2 h-5 w-5" /> Youth</AgeButton>
                        <AgeButton value="elderly" selected={age} onSelect={setAge}><Users className="mr-2 h-5 w-5" /> Elderly</AgeButton>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Skin Tone</Label>
                    <SkinTonePicker selected={skinTone} onSelect={setSkinTone} />
                </div>

                <div className="space-y-3">
                    <Label>Prompt (Optional)</Label>
                    <Textarea placeholder="Please describe how you want to style the Virtual Model, such as the hairstyle, outfit, pose, background, etc." className="h-28" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                             <span className="text-sm text-muted-foreground">Hints:</span>
                            <HintButton>Urban</HintButton>
                            <HintButton>Energetic</HintButton>
                            <HintButton>Intellectual</HintButton>
                            <HintButton>Elegant</HintButton>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-muted-foreground italic flex items-center gap-1">
                                <Sparkles className="h-4 w-4" /> DeepSeek
                            </span>
                            <Button variant="ghost" size="icon"><RefreshCcw className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
                
            </CardContent>
            <CardFooter className="bg-background/30 p-4 rounded-b-lg flex justify-between items-center mt-auto">
                 <div className="flex gap-2">
                     <Select defaultValue="3:4">
                        <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1:1">1:1</SelectItem>
                            <SelectItem value="3:4">3:4</SelectItem>
                            <SelectItem value="16:9">16:9</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select defaultValue="4">
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 Output</SelectItem>
                            <SelectItem value="2">2 Outputs</SelectItem>
                            <SelectItem value="4">4 Outputs</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <Button 
                    size="lg" 
                    className="bg-green-500 hover:bg-green-600 text-black font-bold text-base"
                    onClick={handleGenerate}
                >
                    <Sparkles className="mr-2 h-5 w-5" /> 20 Generate
                </Button>
            </CardFooter>
        </Card>
        </>
    );
};

const AIVirtualTryOnTab = () => {
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [modelImage, setModelImage] = useState<string | null>(null);
    const [garmentImage, setGarmentImage] = useState<string | null>(null);
    const [garmentType, setGarmentType] = useState<string>("");
    const [history, setHistory] = useState<any[]>([]);
    const [fullViewImage, setFullViewImage] = useState<string | null>(null);
    const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string; tips: string[] }>({
        open: false,
        title: '',
        message: '',
        tips: []
    });
    
    const modelInputRef = React.useRef<HTMLInputElement>(null);
    const garmentInputRef = React.useRef<HTMLInputElement>(null);

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/virtual-tryon/history?user_id=default_user&limit=20');
            const data = await response.json();
            if (data.success) {
                setHistory(data.results);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    };

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setModelImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGarmentImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async (resultId: number, imageData: string) => {
        try {
            // Track download
            await fetch(`http://localhost:8000/api/virtual-tryon/result/${resultId}/download`, {
                method: 'POST'
            });

            // Download image
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${imageData}`;
            link.download = `virtual-tryon-${resultId}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDelete = async (resultId: number) => {
        if (!confirm('Delete this image?')) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/virtual-tryon/result/${resultId}?user_id=default_user`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadHistory();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };
    
    // Real Virtual Try-On generation
    const handleGenerate = async () => {
        if (!modelImage || !garmentImage) {
            alert("Please upload both model and garment images");
            return;
        }

        try {
            // Show loading state
            setGeneratedImage("loading");

            // Prepare request
            const requestBody = {
                person_image: modelImage.split(',')[1], // Remove data:image/...;base64, prefix
                garment_image: garmentImage.split(',')[1],
                garment_type: garmentType || "shirt",
                user_id: "default_user",
                save_to_history: true
            };

            // Call Virtual Try-On API
            const response = await fetch('http://localhost:8000/api/virtual-tryon/try-on', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.result_image) {
                // Display the result
                setGeneratedImage(`data:image/png;base64,${data.result_image}`);
                // Reload history to show new image
                loadHistory();
            } else {
                throw new Error(data.error || 'Generation failed');
            }
        } catch (error) {
            console.error('Virtual Try-On error:', error);
            setGeneratedImage(null);
            
            // Parse error message to provide helpful feedback
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            let title = "Generation Failed";
            let message = errorMessage;
            let tips: string[] = [];
            
            // Check for specific error types
            if (errorMessage.includes('credentials') || errorMessage.includes('authentication')) {
                title = "Service Configuration Required";
                message = "Virtual Try-On requires Google Cloud credentials to be configured. The service is installed but needs authentication setup.";
                tips = [
                    "Contact your administrator to set up Google Cloud credentials",
                    "See AI_IMAGE_SERVICES_SETUP.md for detailed setup instructions",
                    "Alternative: Use Nano Banana Studio for image generation (fully working)",
                    "The service will work once credentials are configured"
                ];
            } else if (errorMessage.includes('masks_to_keep cannot be empty')) {
                title = "Image Quality Issue";
                message = "We couldn't detect a person or garment in your images. This usually happens when images are unclear or don't meet quality requirements.";
                tips = [
                    "Use clear, high-resolution images (at least 512x512 pixels)",
                    "Ensure the person is facing forward with good lighting",
                    "Use plain white or light backgrounds for garment images",
                    "Make sure the garment is clearly visible and centered",
                    "Try professional product photos or stock images",
                    "Avoid busy backgrounds or multiple items in one image"
                ];
            } else if (errorMessage.includes('Image editing failed')) {
                title = "Image Processing Error";
                message = "There was an issue processing your images. Please check image quality and try again.";
                tips = [
                    "Ensure images are in PNG or JPG format",
                    "Check that images are not corrupted",
                    "Try using different, higher quality images",
                    "Make sure images are not too large (under 5MB)"
                ];
            } else if (errorMessage.includes('API error') || errorMessage.includes('400')) {
                title = "Request Error";
                message = "There was an issue with the request. Please check your images and try again.";
                tips = [
                    "Verify both model and garment images are uploaded",
                    "Ensure images meet quality requirements",
                    "Try refreshing the page and uploading again"
                ];
            }
            
            setErrorDialog({
                open: true,
                title,
                message,
                tips
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>1. Upload Model</CardTitle>
                        <CardDescription>Upload an image of a person or model.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                        <input
                            ref={modelInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleModelUpload}
                            className="hidden"
                        />
                        <div 
                            onClick={() => modelInputRef.current?.click()}
                            className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors relative overflow-hidden"
                        >
                            {modelImage ? (
                                <Image src={modelImage} alt="Model" fill className="object-contain" />
                            ) : (
                                <>
                                    <User className="h-12 w-12 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">Upload Model Image</p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>2. Upload Garment</CardTitle>
                        <CardDescription>Upload the clothing or accessory.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex flex-col">
                        <input
                            ref={garmentInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleGarmentUpload}
                            className="hidden"
                        />
                        <div 
                            onClick={() => garmentInputRef.current?.click()}
                            className="w-full flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary mb-4 transition-colors relative overflow-hidden"
                        >
                            {garmentImage ? (
                                <Image src={garmentImage} alt="Garment" fill className="object-contain" />
                            ) : (
                                <>
                                    <Shirt className="h-12 w-12 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">Upload Garment Image</p>
                                </>
                            )}
                        </div>
                        <Select value={garmentType} onValueChange={setGarmentType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select garment type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="shirt">👕 Shirt</SelectItem>
                                <SelectItem value="t-shirt">👕 T-Shirt</SelectItem>
                                <SelectItem value="dress">👗 Dress</SelectItem>
                                <SelectItem value="pants">👖 Pants</SelectItem>
                                <SelectItem value="jeans">👖 Jeans</SelectItem>
                                <SelectItem value="jacket">🧥 Jacket</SelectItem>
                                <SelectItem value="hat">🎩 Hat</SelectItem>
                                <SelectItem value="jewelry">💍 Jewelry</SelectItem>
                                <SelectItem value="shoes">👟 Shoes</SelectItem>
                                <SelectItem value="handbag">👜 Handbag</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-4">
                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-black font-bold text-base" onClick={handleGenerate}>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate
                </Button>
            </div>

            {generatedImage && (
                <Card className="bg-card/50">
                    <CardHeader>
                        <CardTitle>Generated Try-On</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <div className="aspect-[3/4] w-full max-w-md relative bg-background/30 rounded-lg overflow-hidden group">
                            {generatedImage === "loading" ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <RefreshCcw className="h-12 w-12 animate-spin text-primary" />
                                    <p className="mt-4 text-sm text-muted-foreground">Generating try-on...</p>
                                </div>
                            ) : (
                                <>
                                    <Image src={generatedImage} alt="Generated try-on" fill className="object-contain" data-ai-hint="person wearing clothes" />
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-10 w-10 bg-black/60 hover:bg-black/80 text-white border-0"
                                            onClick={() => setFullViewImage(generatedImage)}
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-10 w-10 bg-black/60 hover:bg-black/80 text-white border-0"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = generatedImage;
                                                link.download = `virtual-tryon-${Date.now()}.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <Download className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div>
                <h3 className="text-lg font-semibold my-4">History</h3>
                {history.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Shirt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No generated images yet</p>
                        <p className="text-sm mt-2">Your try-on results will appear here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {history.map((item) => (
                            <div key={item.id} className="aspect-[3/4] rounded-lg overflow-hidden relative group bg-background/30">
                                <Image 
                                    src={`data:image/png;base64,${item.result_image_data}`} 
                                    alt={`Try-on ${item.id}`} 
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={() => setFullViewImage(`data:image/png;base64,${item.result_image_data}`)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={() => handleDownload(item.id, item.result_image_data)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Full View Modal */}
            {fullViewImage && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setFullViewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
                        <Image 
                            src={fullViewImage} 
                            alt="Full view" 
                            fill
                            className="object-contain"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-4 right-4 text-white hover:bg-white/20"
                            onClick={() => setFullViewImage(null)}
                        >
                            <span className="text-2xl">×</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Error Dialog */}
            <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle className="text-xl">{errorDialog.title}</DialogTitle>
                        </div>
                        <DialogDescription className="text-base pt-2">
                            {errorDialog.message}
                        </DialogDescription>
                    </DialogHeader>

                    {errorDialog.tips.length > 0 && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <Lightbulb className="h-4 w-4" />
                                <span>Tips for Better Results</span>
                            </div>
                            
                            <div className="space-y-3">
                                {errorDialog.tips.map((tip, index) => (
                                    <Alert key={index} className="border-l-4 border-l-primary">
                                        <AlertDescription className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{tip}</span>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                            Recommended Image Sources
                                        </p>
                                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                            <li>• <strong>Model photos:</strong> Unsplash, Pexels (search "fashion model")</li>
                                            <li>• <strong>Garment images:</strong> Fashion retailer websites (product photos)</li>
                                            <li>• <strong>Accessories:</strong> Jewelry/bag store websites (white background)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button 
                            onClick={() => setErrorDialog({ ...errorDialog, open: false })}
                            className="w-full sm:w-auto"
                        >
                            Got it, I'll try better images
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default function VirtualTryOnView({ initialTab }: { initialTab?: string }) {
  // Always default to AI Try-On (Virtual Model tab removed)
  const [activeTab, setActiveTab] = useState("ai-try-on");

  useEffect(() => {
    // Always force AI Try-On tab
    setActiveTab("ai-try-on");
  }, [initialTab]);

  // Check for navigation data when component mounts
  useEffect(() => {
    const checkNavigationData = () => {
      try {
        const storedData = sessionStorage.getItem('lingo_navigation_data');
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log('🔍 Virtual Try-On View - Navigation data found:', data);
          
          // If there's a tab, set it as active
          if (data.tab) {
            console.log('🔖 Setting initial tab:', data.tab);
            setActiveTab(data.tab);
          }
          
          // Clear the stored data after processing
          sessionStorage.removeItem('lingo_navigation_data');
        }
      } catch (error) {
        console.error('Error processing navigation data:', error);
      }
    };

    // Small delay to ensure component is mounted
    const timeoutId = setTimeout(checkNavigationData, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="p-4 md:p-6 h-full">
        {/* Virtual Model tab removed - only AI Virtual Try-On */}
        <AIVirtualTryOnTab />
    </div>
  );
}
