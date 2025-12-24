

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types";
import { handleGenerateContent } from "@/app/actions";
import ChatMessage from "@/components/chat/chat-message";
import ContentDisplay from "@/components/chat/content-display";
import { useToast } from "@/hooks/use-toast";
import AdvancedChatInput from "./advanced-chat-input";

const initialMessages: ChatMessageType[] = [
    {
        id: "init1",
        role: "agent",
        content: "Welcome to LingoLancers! How can I help you create amazing content today? You can ask me to generate articles, images, videos, and more."
    }
]

export default function ChatInterface({ onMaximize }: { onMaximize: () => void; }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (promptValue: string) => {
    if (!promptValue) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: promptValue },
    ]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("prompt", promptValue);

    const result = await handleGenerateContent(formData);
    
    if (result && "error" in result) {
      toast({
        variant: "destructive",
        title: "Error Generating Content",
        description: result.error,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: `Error: ${result.error}`,
        },
      ]);
    } else if (result) {
        setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "agent",
              content: <ContentDisplay data={result} />,
            },
          ]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);


  return (
    <div className="flex flex-col h-full bg-background/70">
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} role={message.role}>
              {message.content}
            </ChatMessage>
          ))}
          {isLoading && (
            <ChatMessage role="agent">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </ChatMessage>
          )}
        </div>
      </div>

      <div className="bg-transparent p-4 md:p-6 sticky bottom-0">
        <AdvancedChatInput onSubmit={onSubmit} isLoading={isLoading} onMaximize={onMaximize} />
      </div>
    </div>
  );
}
