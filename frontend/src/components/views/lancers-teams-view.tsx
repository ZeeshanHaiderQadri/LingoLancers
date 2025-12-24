"use client";

import React from 'react';
import TeamLauncher from '@/components/team-launcher'; // Import TeamLauncher

export default function LancersTeamsView({ onLaunch, onOpenTeamDashboard }: { onLaunch: (teamName: string) => void, onOpenTeamDashboard: (teamName: string, taskId: string) => void }) {
    return (
        <div className="p-4 md:p-6 h-full">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Lancers Teams</h1>
                <p className="text-lg text-muted-foreground mt-2">Select a specialized team to initiate a powerful agentic workflow.</p>
            </div>
            
            {/* Use TeamLauncher component instead of manual cards */}
            <TeamLauncher 
                onTeamLaunched={onLaunch}
                onOpenTeamDashboard={onOpenTeamDashboard}
            />
        </div>
    );
}