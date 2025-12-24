
"use client";
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader, File, Code, ChevronDown, ChevronRight, Bot } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';

const TaskItem = ({ task }: { task: any }) => {
    const getStatusIcon = () => {
        switch (task.status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-destructive" />;
            case 'in-progress':
                return <Loader className="w-5 h-5 text-primary animate-spin" />;
            default:
                return <File className="w-5 h-5 text-muted-foreground" />;
        }
    };
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between p-3 bg-card rounded-lg border"
        >
            <div className="flex items-center gap-3">
                {task.content.startsWith('view') ? <File className="w-5 h-5 text-muted-foreground" /> : <Code className="w-5 h-5 text-muted-foreground" />}
                <span className="font-mono text-sm">{task.content}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground capitalize">{task.status}</span>
                {getStatusIcon()}
            </div>
        </motion.div>
    );
};


const WorkflowDisplayPanel = ({ isComplete, finalOutput, tasks, progress, totalTasks }: { isComplete: boolean, finalOutput: string, tasks: any[], progress: number, totalTasks: number }) => {

    if (isComplete) {
        return (
            <motion.div 
                className="flex-1 p-6 overflow-y-auto no-scrollbar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-xl font-semibold mb-4">Final Output</h2>
                <div className="flex-1 bg-black/80 text-white p-4 rounded-lg overflow-auto no-scrollbar">
                    <pre><code className="language-javascript text-sm">{finalOutput}</code></pre>
                </div>
            </motion.div>
        );
    }

    const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const pendingTasks = tasks.filter(t => t.status === 'pending');

    return (
        <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">Plan Progress</h2>
                    <span className="text-sm text-muted-foreground">{completedTasks.length} of {totalTasks} tasks completed</span>
                </div>
                <Progress value={progress} />
            </div>

            <div className="space-y-4">
                <Collapsible defaultOpen>
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <ChevronDown className="w-5 h-5" />
                            <span>In Progress</span>
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="py-4 pl-6 space-y-3">
                        <AnimatePresence>
                            {inProgressTasks.length > 0 ? (
                                inProgressTasks.map((task, index) => <TaskItem key={`inprogress-${index}`} task={task} />)
                            ) : (
                                <p className="text-sm text-muted-foreground">No tasks currently in progress.</p>
                            )}
                        </AnimatePresence>
                    </CollapsibleContent>
                </Collapsible>
                
                 <Collapsible>
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                            <ChevronRight className="w-5 h-5" />
                            <span>Pending</span>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="py-4 pl-6 space-y-3">
                        <AnimatePresence>
                             {pendingTasks.length > 0 ? (
                                pendingTasks.map((task, index) => <TaskItem key={`pending-${index}`} task={task} />)
                             ) : (
                                <p className="text-sm text-muted-foreground">No tasks pending.</p>
                             )}
                        </AnimatePresence>
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                    <CollapsibleTrigger className="w-full">
                         <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                            <ChevronRight className="w-5 h-5" />
                            <span>Done ({completedTasks.length})</span>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="py-4 pl-6 space-y-3">
                         <AnimatePresence>
                            {completedTasks.map((task, index) => (
                               <TaskItem key={`done-${index}`} task={task} />
                            ))}
                        </AnimatePresence>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    );
};

export default WorkflowDisplayPanel;
