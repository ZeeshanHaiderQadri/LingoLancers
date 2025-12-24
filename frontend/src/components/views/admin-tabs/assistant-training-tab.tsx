import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Filter,
  Search,
  Upload,
  Download,
  Brain,
  Play,
  Pause,
  RotateCcw,
  Zap
} from 'lucide-react';

const AssistantTrainingTab = () => {
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'completed'>('idle');
  
  // Mock data for assistant training examples
  const trainingExamples = [
    {
      id: 1,
      instruction: 'Summarize this article about AI advancements',
      input: 'Recent breakthroughs in artificial intelligence have shown significant progress in natural language processing...',
      output: 'The article discusses recent advancements in AI, particularly in natural language processing...',
      category: 'Summarization',
      confidence: 92
    },
    {
      id: 2,
      instruction: 'Translate to Spanish',
      input: 'Hello, how are you today?',
      output: 'Hola, ¿cómo estás hoy?',
      category: 'Translation',
      confidence: 95
    },
    {
      id: 3,
      instruction: 'Generate a marketing email',
      input: 'Product: New fitness tracker, Target audience: Health enthusiasts',
      output: 'Subject: Transform Your Fitness Journey with Our New Tracker...',
      category: 'Content Creation',
      confidence: 88
    }
  ];

  const handleStartTraining = () => {
    setTrainingStatus('training');
    // Simulate training process
    setTimeout(() => {
      setTrainingStatus('completed');
      setTimeout(() => setTrainingStatus('idle'), 3000);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assistant Training</h2>
          <p className="text-muted-foreground">
            Train your AI assistant with instruction-output pairs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Training Status</CardTitle>
          <CardDescription>
            Monitor and manage your AI assistant's training process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">AI Assistant Model</h3>
                <p className="text-sm text-muted-foreground">
                  {trainingStatus === 'training' 
                    ? 'Training in progress...' 
                    : trainingStatus === 'completed' 
                      ? 'Training completed successfully' 
                      : 'Ready for training'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={trainingStatus === 'training'}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleStartTraining}
                disabled={trainingStatus === 'training'}
                className="flex items-center gap-2"
              >
                {trainingStatus === 'training' ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Training...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Train Model
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Examples</CardTitle>
          <CardDescription>
            Manage instruction-output pairs for assistant training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingExamples.map((example) => (
              <div key={example.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary">{example.category}</Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Confidence: {example.confidence}%</span>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Instruction</Label>
                    <p className="mt-1 bg-muted p-2 rounded">{example.instruction}</p>
                  </div>
                  {example.input && (
                    <div>
                      <Label className="text-sm font-medium">Input</Label>
                      <p className="mt-1 bg-muted p-2 rounded">{example.input}</p>
                      </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Expected Output</Label>
                    <p className="mt-1 bg-muted p-2 rounded">{example.output}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Training Example</CardTitle>
          <CardDescription>
            Create a new instruction-output pair for training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instruction">Instruction</Label>
              <Textarea 
                id="instruction" 
                placeholder="Enter the instruction for the AI assistant" 
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input">Input (Optional)</Label>
              <Textarea 
                id="input" 
                placeholder="Enter any input data for the instruction" 
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output">Expected Output</Label>
              <Textarea 
                id="output" 
                placeholder="Enter the expected output from the AI assistant" 
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Enter category" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Example
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantTrainingTab;