"use client";

import React, { useState } from 'react';
import {
    Bot,
    Settings,
    Share2,
    Boxes,
    LayoutDashboard,
    FileText,
    Users,
    MessageSquare,
    Video,
    Instagram,
    ShoppingCart,
    BookUser,
    PenSquare,
    Code2,
    Music,
    ImageIcon,
    MoreHorizontal,
    Star,
    Book,
    LifeBuoy,
    Plus,
    Minus,
    Briefcase,
    HeartHandshake,
    KeyRound,
    Link as LinkIcon,
    ShieldCheck,
    CreditCard,
    Menu as MenuIcon,
    Layout,
    GraduationCap,
    Shirt,
} from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarSeparator,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { Whatsapp, Telegram } from '@/components/icons';

// Helper Components
const NavCollapsible = ({
    icon,
    title,
    children,
    initialOpen = false,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    initialOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                    <div className='flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center'>
                        {icon}
                        <span className="group-data-[collapsible=icon]:hidden">{title}</span>
                    </div>
                    {isOpen ? <Minus className="h-4 w-4 group-data-[collapsible=icon]:hidden" /> : <Plus className="h-4 w-4 group-data-[collapsible=icon]:hidden" />}
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenu className="pl-6 gap-0.5 py-1 group-data-[collapsible=icon]:hidden">
                    {children}
                </SidebarMenu>
            </CollapsibleContent>
        </Collapsible>
    )
};

const SubMenuItem = ({ title, href = "#", isNew = false, onClick }: { title: string, href?: string, isNew?: boolean, onClick?: () => void }) => (
    <SidebarMenuItem>
        <a href={href} onClick={(e) => { e.preventDefault(); onClick?.(); }} className="flex items-center justify-between text-sidebar-foreground/80 hover:text-sidebar-foreground w-full px-4 py-1.5 rounded-md hover:bg-sidebar-accent">
            <span className="group-data-[collapsible=icon]:hidden">{title}</span>
            {isNew && <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">NEW</Badge>}
        </a>
    </SidebarMenuItem>
);

interface AppSidebarProps {
    activeView: string;
    onNavigate: (view: string, subView?: string) => void;
}

export function AppSidebar({ activeView, onNavigate }: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon" className="border-r border-border/50 bg-background/95 backdrop-blur-sm">
            <SidebarHeader className="p-4 flex items-center justify-between">
                <Logo />
            </SidebarHeader>
            <SidebarContent className="no-scrollbar">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('chat', 'agent')} isActive={activeView === 'chat'}>
                            <LayoutDashboard />
                            <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('documents')} isActive={activeView === 'documents'}>
                            <FileText />
                            <span className="group-data-[collapsible=icon]:hidden">Documents</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('virtual-try-on')} isActive={activeView === 'virtual-try-on'}>
                            <Shirt />
                            <span className="group-data-[collapsible=icon]:hidden">Virtual Try On</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<Users className="h-4 w-4" />} title="Lancers Agents">
                            <SubMenuItem
                                title="Blog Writing Team"
                                isNew
                                onClick={() => onNavigate('blog-team')}
                            />
                            <SubMenuItem
                                title="Travel Planning"
                                isNew
                                onClick={() => onNavigate('travel-team')}
                            />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<ImageIcon className="h-4 w-4" />} title="AI Image">
                            <SubMenuItem title="Logo Generation" isNew onClick={() => onNavigate('image', 'logo')} />
                            <SubMenuItem title="Remove Background" isNew onClick={() => onNavigate('image', 'editor')} />
                            <SubMenuItem title="AI Product Shot" isNew onClick={() => onNavigate('image', 'product')} />
                            <SubMenuItem title="AI Vision" onClick={() => onNavigate('image', 'vision')} />
                            <SubMenuItem title="Combine Images" isNew onClick={() => onNavigate('image', 'combine')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<Bot className="h-4 w-4" />} title="Smart Bots">
                            <SubMenuItem title="AI Chat Bots" isNew onClick={() => onNavigate('smart-bots', 'chat-bot')} />
                            <SubMenuItem title="AI Voice Bots" isNew onClick={() => onNavigate('smart-bots', 'voice-bot')} />
                            <SubMenuItem title="Human Agent" isNew onClick={() => onNavigate('smart-bots', 'human-agent')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<Share2 className="h-4 w-4" />} title="AI Social Media Suite">
                            <SubMenuItem title="Dashboard" onClick={() => onNavigate('social', 'dashboard')} />
                            <SubMenuItem title="Platforms" onClick={() => onNavigate('social', 'platforms')} />
                            <SubMenuItem title="Calendar" onClick={() => onNavigate('social', 'calendar')} />
                            <SubMenuItem title="Post Studio" onClick={() => onNavigate('social', 'studio')} />
                            <SubMenuItem title="Campaigns" onClick={() => onNavigate('social', 'campaigns')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<MessageSquare className="h-4 w-4" />} title="AI Chat">
                            <SubMenuItem title="AI Chat" onClick={() => onNavigate('chat', 'agent')} />
                            <SubMenuItem title="AI Chat Pro" onClick={() => onNavigate('chat', 'pro')} />
                            <SubMenuItem title="AI Realtime Voice Chat" onClick={() => onNavigate('chat', 'voice')} />
                            <SubMenuItem title="AI File Chat" onClick={() => onNavigate('chat', 'file')} />
                            <SubMenuItem title="AI Web Chat" onClick={() => onNavigate('chat', 'web')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<Instagram className="h-4 w-4" />} title="AI Influencer">
                            <SubMenuItem title="Dashboard" isNew onClick={() => onNavigate('influencer', 'dashboard')} />
                            <SubMenuItem title="Url To Video" isNew onClick={() => onNavigate('influencer', 'url-to-video')} />
                            <SubMenuItem title="AI Viral Clips" isNew onClick={() => onNavigate('influencer', 'viral-clips')} />
                            <SubMenuItem title="Influencer Avatar" isNew onClick={() => onNavigate('influencer', 'avatar-studio')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<Users className="h-4 w-4" />} title="Avatar Studio">
                            <SubMenuItem title="Image Avatar" isNew onClick={() => onNavigate('avatar', 'image')} />
                            <SubMenuItem title="Video Avatar" isNew onClick={() => onNavigate('avatar', 'video')} />
                            <SubMenuItem title="Community Avatars" isNew onClick={() => onNavigate('avatar', 'community')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<ShoppingCart className="h-4 w-4" />} title="Marketing bot">
                            <SubMenuItem title="Dashboard" isNew onClick={() => onNavigate('marketing', 'dashboard')} />
                            <SubMenuItem title="Inbox" onClick={() => onNavigate('marketing', 'inbox')} />
                            <SubMenuItem title="Campaigns" onClick={() => onNavigate('marketing', 'campaigns')} />
                            <NavCollapsible icon={<Whatsapp className="h-4 w-4" />} title="Whatsapp">
                                <SubMenuItem title="Whatsapp" onClick={() => onNavigate('marketing', 'channels')} />
                                <SubMenuItem title="Contact Lists" onClick={() => onNavigate('marketing', 'contacts')} />
                            </NavCollapsible>
                            <NavCollapsible icon={<Telegram className="h-4 w-4" />} title="Telegram">
                                <SubMenuItem title="Telegram" onClick={() => onNavigate('marketing', 'channels')} />
                                <SubMenuItem title="Telegram Groups" onClick={() => onNavigate('marketing', 'channels')} />
                                <SubMenuItem title="Telegram Subscribers" onClick={() => onNavigate('marketing', 'contacts')} />
                            </NavCollapsible>
                            <SubMenuItem title="Marketing Bot Settings" onClick={() => onNavigate('marketing', 'settings')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<BookUser className="h-4 w-4" />} title="Contacts">
                            <SubMenuItem title="Contact Lists" onClick={() => onNavigate('marketing', 'contacts')} />
                            <SubMenuItem title="Segments" onClick={() => onNavigate('marketing', 'contacts')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<PenSquare className="h-4 w-4" />} title="AI Content">
                            <SubMenuItem title="AI Writer" onClick={() => onNavigate('content', 'writer')} />
                            <SubMenuItem title="AI Editor" onClick={() => onNavigate('content', 'rewriter')} />
                            <SubMenuItem title="AI Article Wizard" onClick={() => onNavigate('content', 'wizard')} />
                            <SubMenuItem title="AI ReWriter" onClick={() => onNavigate('content', 'rewriter')} />
                            <SubMenuItem title="Product Details" onClick={() => onNavigate('content', 'product')} />
                            <SubMenuItem title="SEO Keywords" onClick={() => onNavigate('content', 'seo')} />
                            <SubMenuItem title="Plagiarism Check" onClick={() => onNavigate('content', 'plagiarism')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<Music className="h-4 w-4" />} title="AI Audio">
                            <SubMenuItem title="AI Music" onClick={() => onNavigate('audio', 'music')} />
                            <SubMenuItem title="AI Voiceover" onClick={() => onNavigate('audio', 'voiceover')} />
                            <SubMenuItem title="AI Voice Clone" onClick={() => onNavigate('audio', 'clone')} />
                            <SubMenuItem title="AI Speech to Text" onClick={() => onNavigate('audio', 'stt')} />
                            <SubMenuItem title="AI Voice Isolator" onClick={() => onNavigate('audio', 'isolator')} />
                            <SubMenuItem title="Voice Agent" onClick={() => onNavigate('audio', 'agent')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<Code2 className="h-4 w-4" />} title="Code Agent">
                            <SubMenuItem title="Code Assistant" onClick={() => onNavigate('code', 'assistant')} />
                            <SubMenuItem title="Website Designer" onClick={() => onNavigate('code', 'designer')} />
                            <SubMenuItem title="Design Agent" onClick={() => onNavigate('code', 'design-agent')} />
                            <SubMenuItem title="Code Reviewer" onClick={() => onNavigate('code', 'reviewer')} />
                            <SubMenuItem title="Unit Test Writer" onClick={() => onNavigate('code', 'tester')} />
                            <SubMenuItem title="Publish & Deploy" onClick={() => onNavigate('code', 'publish')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<Video className="h-4 w-4" />} title="AI Video">
                            <SubMenuItem title="AI Video" onClick={() => onNavigate('video', 'video')} />
                            <SubMenuItem title="Video-to-Video" onClick={() => onNavigate('video', 'pro-video')} />
                            <SubMenuItem title="Image-to-Video" onClick={() => onNavigate('video', 'image-video')} />
                            <SubMenuItem title="AI Persona" onClick={() => onNavigate('video', 'persona')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <NavCollapsible icon={<MoreHorizontal className="h-4 w-4" />} title="More">
                            <SubMenuItem title="AI Bot Knowledge Base" onClick={() => onNavigate('documents')} />
                            <SubMenuItem title="AI Bot Contacts" onClick={() => onNavigate('marketing', 'contacts')} />
                            <SubMenuItem title="Brand Voice" onClick={() => onNavigate('settings')} />
                            <SubMenuItem title="AI YouTube" onClick={() => onNavigate('social', 'platforms')} />
                            <SubMenuItem title="AI RSS" onClick={() => onNavigate('social', 'platforms')} />
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('other')}>
                            <HeartHandshake />
                            <span className="group-data-[collapsible=icon]:hidden">Affiliates</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('models', 'integrations')} isActive={activeView === 'models'}>
                            <Boxes />
                            <span className="group-data-[collapsible=icon]:hidden">Integration</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('other')}>
                            <LifeBuoy />
                            <span className="group-data-[collapsible=icon]:hidden">Support</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('other')}>
                            <KeyRound />
                            <span className="group-data-[collapsible=icon]:hidden">Personal API Keys</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('other')}>
                            <LinkIcon />
                            <span className="group-data-[collapsible=icon]:hidden">Links</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarSeparator />

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('other')}>
                            <Star />
                            <span className="group-data-[collapsible=icon]:hidden">Favorites</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('other')}>
                            <Book />
                            <span className="group-data-[collapsible=icon]:hidden">Workbook</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarSeparator />

                    <SidebarMenuItem>
                        <NavCollapsible icon={<ShieldCheck className="h-4 w-4" />} title="Admin" initialOpen={true}>
                            <SubMenuItem title="Dashboard" onClick={() => onNavigate('admin', 'dashboard')} />
                            <SubMenuItem title="Marketplace" onClick={() => onNavigate('admin', 'marketplace')} />
                            <SubMenuItem title="Lancer Builder" isNew onClick={() => onNavigate('lancer-builder')} />
                            <SubMenuItem title="Themes" onClick={() => onNavigate('admin', 'themes')} />
                            <NavCollapsible icon={<Users className="h-4 w-4" />} title="User Management">
                                <SubMenuItem title="Users List" onClick={() => onNavigate('admin', 'users-list')} />
                                <SubMenuItem title="Users Activities" onClick={() => onNavigate('admin', 'user-activity')} />
                                <SubMenuItem title="Users Dashboard" onClick={() => onNavigate('admin', 'user-dashboard')} />
                                <SubMenuItem title="User Deletion Requests" onClick={() => onNavigate('admin', 'deletion-requests')} />
                                <SubMenuItem title="User Permissions" onClick={() => onNavigate('admin', 'permissions')} />
                            </NavCollapsible>
                            <NavCollapsible icon={<Users className="h-4 w-4" />} title="Team Management">
                                <SubMenuItem title="All Team Members" onClick={() => onNavigate('admin', 'team-members')} />
                                <SubMenuItem title="Developers" onClick={() => onNavigate('admin', 'developers')} />
                                <SubMenuItem title="Marketers" onClick={() => onNavigate('admin', 'marketers')} />
                                <SubMenuItem title="Support" onClick={() => onNavigate('admin', 'support')} />
                                <SubMenuItem title="Roles & Permissions" onClick={() => onNavigate('admin', 'team-roles')} />
                            </NavCollapsible>
                            <SubMenuItem title="Live Customizer" onClick={() => onNavigate('admin', 'live-customizer')} />
                            <SubMenuItem title="Announcements" onClick={() => onNavigate('admin', 'announcements')} />
                            <SubMenuItem title="Support Requests" onClick={() => onNavigate('admin', 'support-requests')} />
                            <NavCollapsible icon={<GraduationCap className="h-4 w-4" />} title="Onboarding Pro">
                                <SubMenuItem title="Onboarding" onClick={() => onNavigate('admin', 'onboarding')} />
                                <SubMenuItem title="Templates" onClick={() => onNavigate('admin', 'onboarding-templates')} />
                            </NavCollapsible>
                            <NavCollapsible icon={<MessageSquare className="h-4 w-4" />} title="Chat Settings">
                                <SubMenuItem title="Chat Categories" onClick={() => onNavigate('admin', 'chat-categories')} />
                                <SubMenuItem title="Chat Templates" onClick={() => onNavigate('admin', 'chat-templates')} />
                                <SubMenuItem title="Chatbot Training" onClick={() => onNavigate('admin', 'chatbot-training')} />
                                <SubMenuItem title="Floating Chat Settings" onClick={() => onNavigate('admin', 'floating-chat-settings')} />
                                <SubMenuItem title="Assistant Training" onClick={() => onNavigate('admin', 'assistant-training')} />
                                <SubMenuItem title="Voice Chatbot Training" onClick={() => onNavigate('admin', 'voice-chatbot-training')} />
                            </NavCollapsible>
                            <SubMenuItem title="Frontend" onClick={() => onNavigate('admin', 'frontend')} />
                            <NavCollapsible icon={<CreditCard className="h-4 w-4" />} title="Finance">
                                <SubMenuItem title="Payment Gateways" onClick={() => onNavigate('finance', 'payment-gateways')} />
                                <SubMenuItem title="Trial Features" onClick={() => onNavigate('finance', 'trial-features')} />
                                <SubMenuItem title="Mobile Payment" onClick={() => onNavigate('finance', 'mobile-payment')} />
                                <SubMenuItem title="Pricing Plans" isNew onClick={() => onNavigate('finance', 'pricing-plans')} />
                            </NavCollapsible>
                            <NavCollapsible icon={<Layout className="h-4 w-4" />} title="Pages">
                                <SubMenuItem title="Blog" onClick={() => onNavigate('admin', 'blog')} />
                                <SubMenuItem title="Affiliates" onClick={() => onNavigate('admin', 'affiliates')} />
                                <SubMenuItem title="Coupons" onClick={() => onNavigate('admin', 'coupons')} />
                                <SubMenuItem title="Discount & Offer Manager" isNew onClick={() => onNavigate('admin', 'discount-manager')} />
                            </NavCollapsible>
                            <SubMenuItem title="Google adsense" onClick={() => onNavigate('admin', 'adsense')} />
                            <SubMenuItem title="Email Templates" onClick={() => onNavigate('admin', 'email-templates')} />
                            <SubMenuItem title="Site Health" onClick={() => onNavigate('admin', 'site-health')} />
                            <SubMenuItem title="Update" onClick={() => onNavigate('admin', 'update')} />
                            <NavCollapsible icon={<MenuIcon className="h-4 w-4" />} title="Menu">
                                <SubMenuItem title="Mailchimp Newsletter" onClick={() => onNavigate('admin', 'mailchimp')} />
                                <SubMenuItem title="Mega Menu" onClick={() => onNavigate('admin', 'mega-menu')} />
                                <SubMenuItem title="Hubspot" onClick={() => onNavigate('admin', 'hubspot')} />
                            </NavCollapsible>
                        </NavCollapsible>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('finance', 'pricing-plans')}>
                            <Briefcase className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden">Credits</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => onNavigate('other')}>
                            <HeartHandshake className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden">Affiliation</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <SidebarTrigger className='w-full' />
            </SidebarFooter>
        </Sidebar>
    );
}
