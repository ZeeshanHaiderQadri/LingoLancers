
"use client";
import React, { useState, useEffect } from 'react';
import WorkflowChatPanel from './workflow/workflow-chat-panel';
import WorkflowDisplayPanel from './workflow/workflow-display-panel';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const mockWorkflow = {
  initialPrompt: "Create a new React component called 'UserProfile' that displays a user's name and email.",
  steps: [
    { type: 'thought', content: "Okay, I need to create a new React component. I'll start by exploring the existing component structure to maintain consistency." },
    { type: 'task', content: "view src/components/", status: 'completed' },
    { type: 'thought', content: "The structure seems straightforward. I will create a new file `src/components/user-profile.tsx`." },
    { type: 'task', content: "create file `src/components/user-profile.tsx`", status: 'completed' },
    { type: 'thought', content: "Now, I will write the basic code for the UserProfile component, including props for name and email." },
    { type: 'task', content: "write code for `UserProfile` component", status: 'completed' },
    { type: 'thought', content: "I should add some basic styling to make it look presentable. I'll use Tailwind CSS classes already in the project." },
    { type: 'task', content: "add styling to `UserProfile` component", status: 'in-progress' },
    { type: 'thought', content: "The styling is not applying correctly. Let me check the tailwind config." },
    { type: 'task', content: "view tailwind.config.ts", status: 'failed' },
    { type: 'thought', content: "I see, it seems there was a typo. I'll correct the styling and finalize the component." },
    { type: 'task', content: "fix styling and finalize `UserProfile` component", status: 'pending' },
  ],
  finalOutput: `
import React from 'react';

type UserProfileProps = {
  name: string;
  email: string;
};

const UserProfile = ({ name, email }: UserProfileProps) => {
  return (
    <div className="p-4 border rounded-lg shadow-md bg-card text-card-foreground">
      <h2 className="text-xl font-bold text-primary">{name}</h2>
      <p className="text-muted-foreground">{email}</p>
    </div>
  );
};

export default UserProfile;
`
};


const AgenticWorkflowView = ({ teamName, onBack }: { teamName: string, onBack: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [messages, setMessages] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    
    useEffect(() => {
        setMessages([{ type: 'user', content: mockWorkflow.initialPrompt }]);

        const interval = setInterval(() => {
            setCurrentStep(prevStep => {
                if (prevStep >= mockWorkflow.steps.length) {
                    clearInterval(interval);
                    setIsComplete(true);
                    return prevStep;
                }
                const nextStep = mockWorkflow.steps[prevStep];
                if (nextStep.type === 'thought') {
                    setMessages(prev => [...prev, {...nextStep, type: 'agent' as const}]);
                } else {
                    setTasks(prev => {
                        const existingTaskIndex = prev.findIndex(t => t.content === nextStep.content);
                        if (existingTaskIndex > -1) {
                            const newTasks = [...prev];
                            newTasks[existingTaskIndex] = nextStep;
                            return newTasks;
                        }
                        return [...prev, nextStep];
                    });
                }
                return prevStep + 1;
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = mockWorkflow.steps.filter(s => s.type === 'task').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <div className="h-full flex flex-col bg-background">
             <div className="flex-1 grid grid-cols-12 overflow-hidden">
                <div className="col-span-3 border-r border-border flex flex-col">
                    <WorkflowChatPanel messages={messages} />
                </div>
                <div className="col-span-9 flex flex-col h-full">
                    <WorkflowDisplayPanel 
                        isComplete={isComplete}
                        finalOutput={mockWorkflow.finalOutput}
                        tasks={tasks}
                        progress={progress}
                        totalTasks={totalTasks}
                    />
                    <div className="p-4 border-t border-border mt-auto">
                        <div className="relative max-w-4xl mx-auto">
                            <Textarea 
                                placeholder="Type your message to the agent..." 
                                className="bg-card pr-16"
                                rows={2}
                            />
                            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Send className="w-5 h-5 text-primary" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgenticWorkflowView;
