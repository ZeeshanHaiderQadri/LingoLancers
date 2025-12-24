"use client";

import React from "react";

export function ChatHeroHeader() {
  return (
    <div className="text-center py-8 md:py-12 px-4">
      {/* Main Heading with Gradient */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
        Just talk to{" "}
        <span className="bg-gradient-to-r from-purple-500 via-green-500 to-blue-500 text-transparent bg-clip-text gradient-text-animated">
          Lingo Agent!
        </span>
      </h1>
      
      {/* Subheading */}
      <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
        Lingo have Agentic Lancers Teams to Automate Your Workflow
      </p>
    </div>
  );
}
