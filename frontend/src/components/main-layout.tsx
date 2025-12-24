"use client";

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Languages,
  Bell,
} from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import UserNav from '@/components/user-nav';
import ApiSettingsView from '@/components/views/api-settings-view';
import AdminView from '@/components/views/admin-view';
import AiAudioView from './views/ai-audio-view';
import AiContentView from './views/ai-content-view';
import AiImageView from './views/ai-image-view';
import AiInfluencerView from './views/ai-influencer-view';
import AiSocialMediaView from './views/ai-social-media-view';
import AiVideoView from './views/ai-video-view';
import DocumentsView from './views/documents-view';
import MarketingBotView from './views/marketing-bot-view';
import SettingsView from './views/settings-view';
import OtherView from './views/other-view';
import SmartBotsView from './views/smart-bots-view';
import AiChatView from './views/ai-chat-view';
import CodeAgentView from './views/code-agent-view';
import LancerBuilderView from './views/lancer-builder-view';
import CreativeStudioView from './views/creative-studio-view';
import { ThemeToggle } from './theme-toggle';
import VirtualTryOnView from './views/virtual-try-on-view';
import AvatarView from './views/avatar-view';
import FinanceView from './views/finance-view';
import LancersTeamsView from './views/lancers-teams-view';
import AgenticWorkflowView from './views/agentic-workflow-view';
import EnhancedTeamDashboard from './enhanced-team-dashboard';
import BlogTeamDashboard from './blog-team/blog-team-dashboard';
import { TravelTeamDashboard } from './travel-team';
import { FloatingLingoAgent } from './floating-lingo-agent';
import { autogenTeamsService } from '@/lib/autogen-teams-service';
import { lingoAPI } from '@/lib/lingo-api';
import ImageEditingDashboard from './image-editing-dashboard';
import NanoBananaView from './views/nano-banana-view';
import { AppSidebar } from './app-sidebar';

type View = 'chat' | 'models' | 'settings' | 'documents' | 'social' | 'influencer' | 'marketing' | 'content' | 'image' | 'video' | 'audio' | 'admin' | 'other' | 'smart-bots' | 'code' | 'lancer-builder' | 'virtual-try-on' | 'avatar' | 'finance' | 'lancers-teams' | 'blog-team' | 'travel-team' | 'nano-banana';
type SubView = string;

type TeamDashboardState = {
  teamName: string;
  taskId: string;
} | null;

export default function MainLayout() {
  const [activeView, setActiveView] = useState<View>('chat');
  const [activeSubView, setActiveSubView] = useState<SubView | undefined>('agent');
  const [showCreativeStudio, setShowCreativeStudio] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [teamDashboard, setTeamDashboard] = useState<TeamDashboardState>(null);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  const [showImageEditingDashboard, setShowImageEditingDashboard] = useState(false);

  useEffect(() => {
    const navigationCallback = (route: string, tab?: string) => {
      console.log('🧭 Navigation request from teams service:', route, tab);

      if (route && tab) {
        console.log(`📍 Navigating to ${route} with tab ${tab}`);
        handleNavigation(route as View, tab as SubView);
      } else if (route) {
        console.log(`📍 Navigating to main route ${route}`);
        handleNavigation(route as View, undefined);
      }
    };

    const handleLingoNavigate = (event: CustomEvent) => {
      const { route, data } = event.detail;
      console.log('🤖 Lingo navigation request:', route, data);

      if ((window as any).__splitScreenActive && route === 'blog-team') {
        console.log('🔒 Navigation blocked - split-screen is active');
        return;
      }

      navigationCallback(route);
    };

    const handleOpenTeamDashboardEvent = (event: CustomEvent) => {
      const { teamName, taskId } = event.detail;
      console.log('🚀 Opening team dashboard:', teamName, taskId);
      handleOpenTeamDashboard(teamName, taskId);
    };

    const handleOpenImageEditingEvent = (event: CustomEvent) => {
      console.log('🎨 Opening Image Editing Studio (Nano Banana)');
      setShowImageEditingDashboard(true);
    };

    autogenTeamsService.setNavigationCallback(navigationCallback);
    lingoAPI.setNavigationCallback(navigationCallback);
    window.addEventListener('lingo-navigate' as any, handleLingoNavigate);
    window.addEventListener('open-team-dashboard' as any, handleOpenTeamDashboardEvent);
    window.addEventListener('open-image-editing' as any, handleOpenImageEditingEvent);

    console.log('🚀 Main Layout: Autogen Teams integration initialized with enhanced navigation');

    return () => {
      window.removeEventListener('lingo-navigate' as any, handleLingoNavigate);
      window.removeEventListener('open-team-dashboard' as any, handleOpenTeamDashboardEvent);
      window.removeEventListener('open-image-editing' as any, handleOpenImageEditingEvent);
    };
  }, []);

  const handleNavigation = (view: View, subView?: SubView) => {
    setActiveView(view);
    setActiveSubView(subView);
    setActiveWorkflow(null);
    setTeamDashboard(null);
    setShowImageEditingDashboard(false);
    setShowApiKeyAlert(false);
  }

  const handleLaunchWorkflow = (teamName: string) => {
    setActiveWorkflow(teamName);
  }

  const handleOpenTeamDashboard = (teamName: string, taskId: string) => {
    setTeamDashboard({ teamName, taskId });
  }

  const handleEndWorkflow = () => {
    setActiveWorkflow(null);
    handleNavigation('lancers-teams');
  }

  const handleCloseTeamDashboard = () => {
    setTeamDashboard(null);
    if (teamDashboard?.teamName?.toLowerCase().includes('travel')) {
      handleNavigation('travel-team');
    } else {
      handleNavigation('lancers-teams');
    }
  }

  const renderView = () => {
    if (showImageEditingDashboard) {
      return <ImageEditingDashboard onClose={() => setShowImageEditingDashboard(false)} />;
    }

    if (teamDashboard) {
      return (
        <EnhancedTeamDashboard
          teamName={teamDashboard.teamName}
          taskId={teamDashboard.taskId}
          onBack={handleCloseTeamDashboard}
        />
      );
    }

    if (activeWorkflow) {
      return <AgenticWorkflowView teamName={activeWorkflow} onBack={handleEndWorkflow} />;
    }

    switch (activeView) {
      case 'models': return <ApiSettingsView initialTab={activeSubView} />;
      case 'settings': return <SettingsView />;
      case 'documents': return <DocumentsView />;
      case 'social': return <AiSocialMediaView initialTab={activeSubView} />;
      case 'influencer': return <AiInfluencerView initialTab={activeSubView} />;
      case 'marketing': return <MarketingBotView initialTab={activeSubView} />;
      case 'content': return <AiContentView initialTab={activeSubView} />;
      case 'image': return <AiImageView initialTab={activeSubView} />;
      case 'video': return <AiVideoView initialTab={activeSubView} />;
      case 'audio': return <AiAudioView initialTab={activeSubView} />;
      case 'admin': return <AdminView initialTab={activeSubView} navigate={(view: string, subView?: string) => handleNavigation(view as View, subView as SubView)} />;
      case 'other': return <OtherView />;
      case 'smart-bots': return <SmartBotsView initialTab={activeSubView} />;
      case 'code': return <CodeAgentView initialTab={activeSubView} />;
      case 'lancer-builder': return <LancerBuilderView />;
      case 'virtual-try-on': return <VirtualTryOnView initialTab={activeSubView} />;
      case 'avatar': return <AvatarView initialTab={activeSubView} />;
      case 'finance': return <FinanceView initialTab={activeSubView} />;
      case 'lancers-teams': return <LancersTeamsView onLaunch={handleLaunchWorkflow} onOpenTeamDashboard={handleOpenTeamDashboard} />;
      case 'blog-team': return <BlogTeamDashboard className="p-6" />;
      case 'travel-team': return <TravelTeamDashboard className="p-6" />;
      case 'nano-banana': return <NanoBananaView />;
      case 'chat':
      default:
        return <AiChatView initialTab={activeSubView} />;
    }
  };

  const getTitleForView = (view: View) => {
    if (activeWorkflow) {
      return `Agentic Workflow: ${activeWorkflow}`;
    }
    switch (view) {
      case 'models': return 'Integrations & API Keys';
      case 'settings': return 'Settings';
      case 'documents': return 'Documents';
      case 'social': return 'AI Social Media Suite';
      case 'influencer': return 'AI Influencer';
      case 'marketing': return 'Marketing Bot';
      case 'content': return 'AI Content Creation';
      case 'image': return 'AI Image Generation';
      case 'video': return 'AI Video Production';
      case 'audio': return 'AI Audio Tools';
      case 'admin': return 'Admin Panel';
      case 'other': return 'More Features';
      case 'smart-bots': return 'Smart Bots';
      case 'code': return 'Code Agent';
      case 'lancer-builder': return 'Lancer Builder';
      case 'virtual-try-on': return 'Virtual Try On';
      case 'avatar': return 'Avatar Studio';
      case 'finance': return 'Finance Management';
      case 'lancers-teams': return 'Lancers Agents';
      case 'travel-team': return 'Travel Planning';
      case 'blog-team': return 'Blog Writing Team';
      case 'nano-banana': return 'Nano Banana Studio';
      case 'chat':
      default:
        return 'AI Agent';
    }
  }

  if (showCreativeStudio) {
    return <CreativeStudioView onClose={() => setShowCreativeStudio(false)} />;
  }

  return (
    <>
      {showApiKeyAlert && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg flex items-start">
            <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold">API Keys Not Configured</h4>
              <p className="text-sm mt-1">
                To use image generation features, please configure your API keys in the Integration settings.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    handleNavigation('models', 'integrations');
                    setShowApiKeyAlert(false);
                  }}
                >
                  Configure Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowApiKeyAlert(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SidebarProvider>
        <AppSidebar activeView={activeView} onNavigate={handleNavigation} />

        <SidebarInset className="h-full overflow-hidden flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/90 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10 backdrop-blur-md flex-shrink-0">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-lg font-semibold md:text-2xl text-gradient-multi bg-clip-text text-transparent">
                {getTitleForView(activeView)}
              </h1>
            </div>
            <div className='ml-auto flex items-center gap-2'>
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-purple-500 via-green-500 to-blue-500 hover:from-purple-600 hover:via-green-600 hover:to-blue-600 text-white"
                onClick={() => setShowImageEditingDashboard(true)}
              >
                Image Editing
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Select Language</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <UserNav />
            </div>
          </header>
          <main className="flex flex-1 flex-col bg-background overflow-hidden">
            {renderView()}
          </main>
        </SidebarInset>
      </SidebarProvider>

      <div className="fixed bottom-4 right-4 z-[9999]">
        <FloatingLingoAgent
          onNavigate={(dest, data) => {
            console.log(`🧭 Lingo Agent navigation request: ${dest}`, data);

            const destinationMap: Record<string, string> = {
              'travel': 'travel-team',
              'travel-team': 'travel-team',
              'blog': 'blog-team',
              'blog-team': 'blog-team',
              'ai-image': 'image',
              'virtual-try-on': 'virtual-try-on',
              'virtual-tryon': 'virtual-try-on',
              'nano-banana': 'nano-banana',
            };

            let targetView = destinationMap[dest] || dest;
            let specialData = data;

            if (dest === 'ai-image' && data && data.tab === 'nano-banana') {
              targetView = 'nano-banana';
              specialData = { prompt: data.prompt };
            }

            console.log(`🚀 Navigating to view: ${targetView}`);

            const tabMap: Record<string, string> = {
              'logo-generation': 'logo',
              'remove-background': 'editor',
              'product-shot': 'product',
            };

            let subView = undefined;
            if (data && data.tab) {
              subView = tabMap[data.tab] || data.tab;
              console.log(`🔖 Navigating to tab: ${subView}`);
            }

            if (specialData) {
              console.log(`💾 Storing navigation data:`, specialData);
              sessionStorage.setItem('lingo_navigation_data', JSON.stringify(specialData));
            }

            setActiveView(targetView as any);
            if (subView) {
              setActiveSubView(subView);
            }
          }}
          onStartWorkflow={(workflowType, data) => {
            console.log(`🚀 Starting workflow from Voice Agent: ${workflowType}`, data);

            // Store workflow data if present
            if (data) {
              sessionStorage.setItem(`${workflowType}_workflow_data`, JSON.stringify(data));
            }

            // Map workflow types to team names if necessary
            const teamMap: Record<string, string> = {
              'travel': 'travel-team',
              'blog': 'blog-team',
            };

            const teamName = teamMap[workflowType] || workflowType;
            handleLaunchWorkflow(teamName);
          }}
        />
      </div>
    </>
  );
}
