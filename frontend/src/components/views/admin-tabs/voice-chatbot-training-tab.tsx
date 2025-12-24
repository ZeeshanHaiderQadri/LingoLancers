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
  Mic,
  Play,
  Pause,
  RotateCcw,
  Volume2
} from 'lucide-react';

const VoiceChatbotTrainingTab = () => {
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'completed'>('idle');
  
  // Mock data for voice training examples
  const trainingExamples = [
    {
      id: 1,
      phrase: 'What are your business hours?',
      response: 'We are open from 9 AM to 6 PM, Monday through Friday.',
      category: 'Business Info',
      confidence: 94
    },
    {
      id: 2,
      phrase: 'How do I reset my password?',
      response: 'You can reset your password by visiting the login page and clicking on "Forgot Password".',
      category: 'Account',
      confidence: 89
    },
    {
      id: 3,
      phrase: 'Do you offer refunds?',
      response: 'Yes, we offer a 30-day money-back guarantee on all our products.',
      category: 'Policies',
      confidence: 91
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
          <h2 className="text-2xl font-bold tracking-tight">Voice Chatbot Training</h2>
          <p className="text-muted-foreground">
            Train your voice-enabled chatbot with spoken phrases and responses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Audio
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voice Training Status</CardTitle>
          <CardDescription>
            Monitor and manage your voice chatbot's training process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mic className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Voice Recognition Model</h3>
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
          <CardTitle>Voice Training Examples</CardTitle>
          <CardDescription>
            Manage spoken phrases and responses for voice training
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
                      <Play className="h-4 w-4" />
                    </Button>
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
                    <Label className="text-sm font-medium">Spoken Phrase</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <p>{example.phrase}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Response</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <p>{example.response}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Voice Training Example</CardTitle>
          <CardDescription>
            Create a new spoken phrase and response pair for training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phrase">Spoken Phrase</Label>
              <div className="flex gap-2">
                <Textarea 
                  id="phrase" 
                  placeholder="Enter the spoken phrase users might say" 
                  className="flex-1 min-h-[80px]"
                />
                <Button variant="outline" size="icon">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice-response">Voice Response</Label>
              <div className="flex gap-2">
                <Textarea 
                  id="voice-response" 
                  placeholder="Enter the voice response for the chatbot" 
                  className="flex-1 min-h-[80px]"
                />
                <Button variant="outline" size="icon">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice-category">Category</Label>
              <Input id="voice-category" placeholder="Enter category" />
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

export default VoiceChatbotTrainingTab;