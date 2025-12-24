
"use client";

import React, { useState, useCallback, DragEvent } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { 
    Bot, 
    Share2, 
    ShoppingCart, 
    BookOpen, 
    Twitter, 
    Facebook, 
    Instagram, 
    Linkedin,
    Youtube,
    Twitch,
    Webhook,
    Code2,
    Mail
} from 'lucide-react';


const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Start Trigger' }, position: { x: 250, y: 5 } },
];

let id = 2;
const getId = () => `${id++}`;

const sidebarAgents = [
    {
        title: "Social Media",
        icon: <Share2 className="h-5 w-5 text-primary" />,
        agents: [
            { name: "Post to Twitter", icon: <Twitter className="h-4 w-4" />, type: 'default' },
            { name: "Post to Facebook", icon: <Facebook className="h-4 w-4" />, type: 'default' },
            { name: "Post to Instagram", icon: <Instagram className="h-4 w-4" />, type: 'default' },
            { name: "Upload to YouTube", icon: <Youtube className="h-4 w-4" />, type: 'default' },
        ]
    },
    {
        title: "E-Commerce",
        icon: <ShoppingCart className="h-5 w-5 text-primary" />,
        agents: [
            { name: "Get Shopify Product", icon: <Bot className="h-4 w-4" />, type: 'input' },
            { name: "Update Shopify Product", icon: <Bot className="h-4 w-4" />, type: 'output' },
            { name: "List on WooCommerce", icon: <Bot className="h-4 w-4" />, type: 'default' },
        ]
    },
    {
        title: "Blogs / CMS",
        icon: <BookOpen className="h-5 w-5 text-primary" />,
        agents: [
            { name: "Post to WordPress", icon: <Bot className="h-4 w-4" />, type: 'default' },
            { name: "Post to Medium", icon: <Bot className="h-4 w-4" />, type: 'default' },
        ]
    },
    {
        title: "Utilities",
        icon: <Code2 className="h-5 w-5 text-primary" />,
        agents: [
            { name: "Webhook", icon: <Webhook className="h-4 w-4" />, type: 'input' },
            { name: "Send Email", icon: <Mail className="h-4 w-4" />, type: 'output' },
            { name: "AI Content Generation", icon: <Bot className="h-4 w-4" />, type: 'default' },
        ]
    }
]

const Sidebar = () => {
    const onDragStart = (event: DragEvent, nodeType: string, nodeName: string) => {
        const nodeData = { type: nodeType, name: nodeName };
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <Card className="h-full bg-card/50">
            <CardHeader>
                <CardTitle>Add your Lancers Agents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {sidebarAgents.map(group => (
                    <div key={group.title}>
                        <h3 className="flex items-center gap-2 font-semibold text-muted-foreground mb-2">
                            {group.icon}
                            {group.title}
                        </h3>
                        <div className="space-y-2">
                             {group.agents.map(agent => (
                                <div 
                                    key={agent.name}
                                    className="p-2 border rounded-md cursor-grab flex items-center gap-2 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-colors"
                                    onDragStart={(event) => onDragStart(event, agent.type, agent.name)}
                                    draggable
                                >
                                    {agent.icon}
                                    <span className="text-sm">{agent.name}</span>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};


export default function LancerBuilderView() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            
            if (!reactFlowInstance) return;

            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const nodeInfo = JSON.parse(event.dataTransfer.getData('application/reactflow'));

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode: Node = {
                id: getId(),
                type: nodeInfo.type,
                position,
                data: { label: nodeInfo.name },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    return (
        <div className="h-[calc(100vh-61px)] grid md:grid-cols-4">
            <div className="md:col-span-1 p-4 h-full overflow-y-auto">
                <Sidebar />
            </div>
            <div className="md:col-span-3 h-full">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                    >
                        <Controls />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
}
