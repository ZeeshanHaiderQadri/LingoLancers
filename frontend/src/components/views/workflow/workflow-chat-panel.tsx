
"use client";
import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const WorkflowChatPanel = ({ messages }: { messages: any[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col h-full">
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto no-scrollbar">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={cn("flex items-start gap-3", msg.type === 'user' && 'justify-end')}>
                                {msg.type === 'agent' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-primary" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-xs rounded-lg p-3 text-sm",
                                    msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                                )}>
                                    {msg.content}
                                </div>
                                {msg.type === 'user' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkflowChatPanel;
