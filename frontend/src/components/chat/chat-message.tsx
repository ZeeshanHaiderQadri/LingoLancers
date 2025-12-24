import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type ChatMessageProps = {
  role: "user" | "agent" | "system";
  children: React.ReactNode;
};

export default function ChatMessage({ role, children }: ChatMessageProps) {
  const agentImage = PlaceHolderImages.find(p => p.id === "agent-avatar");
  const userImage = PlaceHolderImages.find(p => p.id === "user-avatar");

  const isAgent = role === "agent";

  return (
    <div
      className={cn(
        "flex items-start gap-4",
        !isAgent && "flex-row-reverse"
      )}
    >
      <Avatar className="h-9 w-9 border">
        <AvatarImage 
            src={isAgent ? agentImage?.imageUrl : userImage?.imageUrl}
            alt={isAgent ? "Agent Avatar" : "User Avatar"}
            data-ai-hint={isAgent ? agentImage?.imageHint : userImage?.imageHint}
        />
        <AvatarFallback>{isAgent ? "AI" : "U"}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[75%] rounded-lg p-3 text-sm shadow-sm",
          isAgent
            ? "bg-card text-card-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="prose prose-sm text-inherit max-w-none">
            {children}
        </div>
      </div>
    </div>
  );
}
