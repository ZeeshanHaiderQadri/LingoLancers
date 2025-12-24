"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, PenSquare, Plane, Globe, Package, Share2, Palette, Mail, Code } from "lucide-react";

const prebuiltAgents = [
  { id: "blog", name: "Blog Writing", icon: PenSquare, color: "text-blue-500" },
  { id: "travel", name: "Travel Planning", icon: Plane, color: "text-green-500" },
  { id: "web", name: "Web Design", icon: Globe, color: "text-purple-500" },
  { id: "product", name: "Product Description", icon: Package, color: "text-orange-500" },
  { id: "social", name: "Social Media Post", icon: Share2, color: "text-pink-500" },
  { id: "avatar", name: "Avatar Studio", icon: Palette, color: "text-indigo-500" },
  { id: "marketing", name: "Marketing Bot", icon: Mail, color: "text-red-500" },
  { id: "code", name: "Code Agent", icon: Code, color: "text-cyan-500" },
];

interface LancersAgentsDropdownProps {
  onSelect: (agentId: string) => void;
}

export function LancersAgentsDropdown({ onSelect }: LancersAgentsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <span className="bg-gradient-to-r from-purple-500 via-green-500 to-blue-500 text-transparent bg-clip-text font-semibold text-xs">
          Lancers Agents
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-lg p-2 z-[9999] animate-slide-up">
            <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
              Select a Prebuilt Agent Workflow
            </div>
            {prebuiltAgents.map((agent) => {
              const Icon = agent.icon;
              return (
                <Button
                  key={agent.id}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => {
                    onSelect(agent.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className={`h-5 w-5 ${agent.color}`} />
                  <span className="text-left">{agent.name}</span>
                </Button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
