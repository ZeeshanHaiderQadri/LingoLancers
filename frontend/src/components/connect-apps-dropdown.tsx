"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import { connectedApps } from "@/data/connected-apps";

interface ConnectAppsDropdownProps {
  onSelect: (appId: string) => void;
  selectedApps?: string[];
}

export function ConnectAppsDropdown({ onSelect, selectedApps = [] }: ConnectAppsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredApps = connectedApps.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.description.toLowerCase().includes(search.toLowerCase()) ||
    app.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <span className="font-semibold text-xs">Connect</span>
        {selectedApps.length > 0 && (
          <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
            {selectedApps.length}
          </span>
        )}
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
          <div className="absolute bottom-full left-0 mb-2 w-96 bg-popover border border-border rounded-lg shadow-lg z-[9999] animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-1 text-popover-foreground">Select Apps</h3>
              <p className="text-sm text-muted-foreground">
                Selected {selectedApps.length} apps from {connectedApps.length}
              </p>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for an app"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Apps List */}
            <div className="max-h-96 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
              {filteredApps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No apps found
                </div>
              ) : (
                filteredApps.map((app) => (
                  <Button
                    key={app.id}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={() => {
                      onSelect(app.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="text-2xl">{app.icon}</div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{app.name}</div>
                      <div className="text-xs text-muted-foreground">{app.description}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{app.category}</div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
