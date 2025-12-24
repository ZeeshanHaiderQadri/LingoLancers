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
  RotateCcw
} from 'lucide-react';

const ChatbotTrainingTab = () => {
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'completed'>('idle');
  
  // Mock data for training examples
  const trainingExamples = [
    {
      id: 1,
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page and following the instructions sent to your email.',
      category: 'Account',
      confidence: 95
    },
    {
      id: 2,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards including Visa, Mastercard, and American Express, as well as PayPal and bank transfers.',
      category: 'Billing',
      confidence: 88
    },
    {
      id: 3,
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your account settings. Navigate to Billing > Subscription and click "Cancel Subscription".',
      category: 'Billing',
      confidence: 92
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
          <h2 className="text-2xl font-bold tracking-tight">Chatbot Training</h2>
          <p className="text-muted-foreground">
            Train your AI chatbot with question-answer pairs
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
            Monitor and manage your chatbot's training process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">AI Chatbot Model</h3>
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
            Manage question-answer pairs for chatbot training
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
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Question</Label>
                    <p className="mt-1">{example.question}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Answer</Label>
                    <p className="mt-1">{example.answer}</p>
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
            Create a new question-answer pair for training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input id="question" placeholder="Enter user question" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea 
                id="answer" 
                placeholder="Enter chatbot response" 
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

export default ChatbotTrainingTab;