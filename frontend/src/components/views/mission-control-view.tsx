"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Activity, CheckCircle2, CircleAlert, Mic, Radio, ShieldCheck, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { agentApi, agentWebSocket, hasAgentBackend } from "@/lib/runtime-config";

type MissionEvent = { type: string; message: string };
type VoiceReadiness = { ready: boolean; provider: string; model: string; languages: string[] };
const steps = ["Brief", "Evidence plan", "Approval", "Launch actions"];

export default function MissionControlView() {
  const [objective, setObjective] = useState("");
  const [market, setMarket] = useState("Dubai");
  const [audience, setAudience] = useState("");
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [voice, setVoice] = useState<VoiceReadiness | null>(null);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (hasAgentBackend) fetch(agentApi("/api/voice-live/readiness")).then((response) => response.ok ? response.json() : null).then(setVoice).catch(() => setVoice(null));
    return () => socket.current?.close();
  }, []);

  async function startMission(event: FormEvent) {
    event.preventDefault();
    if (!hasAgentBackend) return setError("Connect the Azure Lingo runtime in Vercel before starting a mission.");
    setError(""); setSummary(""); setEvents([]); setRunning(true);
    try {
      const response = await fetch(agentApi("/api/missions/market-launch"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ objective, target_market: market, audience }) });
      if (!response.ok) throw new Error("Lingo could not start the mission.");
      const { mission_id } = await response.json();
      const wsUrl = agentWebSocket(`/api/missions/${mission_id}/events`);
      if (!wsUrl) throw new Error("The Azure runtime URL is missing.");
      socket.current = new WebSocket(wsUrl);
      socket.current.onmessage = async ({ data }) => {
        const update = JSON.parse(data) as MissionEvent;
        setEvents((current) => [...current, update]);
        if (update.type === "mission.completed" || update.type === "mission.failed") {
          socket.current?.close(); setRunning(false);
          const result = await fetch(agentApi(`/api/missions/${mission_id}`));
          if (result.ok) setSummary((await result.json()).manager_summary);
        }
      };
      socket.current.onerror = () => { setError("The Azure live-update channel disconnected. Check the runtime health, then retry."); setRunning(false); };
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Mission could not start."); setRunning(false); }
  }

  return <main className="h-full overflow-auto bg-[#f8f7f4] px-4 py-6 text-stone-900 md:px-8 md:py-9"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col justify-between gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Lingo / Mission Control</p><h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Make the next business move clear.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">Turn a request into an evidence-first plan, see exactly where Lingo is working, and hold consequential actions for approval.</p></div><div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm"><Radio className={`h-4 w-4 ${hasAgentBackend ? "text-emerald-600" : "text-amber-600"}`} />{running ? "Mission live" : hasAgentBackend ? "Runtime connected" : "Azure runtime needed"}</div></header>
    {!hasAgentBackend && <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0"/><div><strong>Backend not configured.</strong> Add <code>NEXT_PUBLIC_LINGO_API_URL</code> in Vercel with the Azure Container Apps URL, then redeploy. Production will never attempt localhost.</div></div>}
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]"><Card className="border-stone-200 bg-white shadow-sm"><CardHeader className="border-b border-stone-100 pb-5"><div className="flex items-start justify-between gap-4"><div><CardTitle className="text-xl">New mission</CardTitle><CardDescription className="mt-1.5">Create a visible brief before any external action.</CardDescription></div><Sparkles className="h-5 w-5 text-violet-700"/></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{steps.map((step, index) => <div key={step} className={`rounded-lg px-3 py-2 text-xs font-medium ${index === 0 ? "bg-violet-700 text-white" : "bg-stone-100 text-stone-500"}`}><span className="mr-1 opacity-75">0{index + 1}</span>{step}</div>)}</div></CardHeader><CardContent className="pt-6"><form onSubmit={startMission} className="space-y-5"><label className="block text-sm font-medium">Business outcome<Textarea required minLength={10} value={objective} onChange={(e) => setObjective(e.target.value)} className="mt-2 min-h-28 resize-y" placeholder="Launch our sustainable skincare line in Dubai, with a reviewed 30-day market-entry plan."/></label><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium">Target market<Input required value={market} onChange={(e) => setMarket(e.target.value)} className="mt-2" placeholder="Dubai"/></label><label className="text-sm font-medium">Primary audience<Input required value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-2" placeholder="e.g. eco-conscious professionals"/></label></div><div className="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-xs text-stone-500"><ShieldCheck className="h-4 w-4 text-emerald-600"/>External actions require approval.</p><Button type="submit" disabled={running} className="bg-violet-700 px-6 hover:bg-violet-800">{running ? "Mission in progress" : "Create mission brief"}</Button></div></form></CardContent></Card>
    <aside className="space-y-6"><Card className="border-stone-200 bg-white shadow-sm"><CardHeader className="pb-3"><div className="flex items-center gap-2"><Mic className="h-4 w-4 text-violet-700"/><CardTitle className="text-base">Voice workspace</CardTitle></div><CardDescription>Multilingual conversation secured through Azure.</CardDescription></CardHeader><CardContent className="space-y-4"><div className={`rounded-lg p-3 text-sm ${voice?.ready ? "bg-emerald-50 text-emerald-950" : "bg-stone-100 text-stone-600"}`}><div className="flex items-center gap-2 font-medium"><Volume2 className="h-4 w-4"/>{voice?.ready ? "Azure Voice Live ready" : "Voice runtime awaiting configuration"}</div><p className="mt-1 text-xs leading-5">{voice?.ready ? `${voice.provider} · ${voice.model}` : "Set AZURE_VOICE_LIVE_ENDPOINT on Azure to enable microphone sessions."}</p></div>{voice?.languages && <p className="text-sm text-stone-700">{voice.languages.join(" · ")}</p>}<p className="text-xs leading-5 text-stone-500">The retired local WebSocket voice prototype is being replaced with Azure Voice Live, keeping browser credentials private.</p></CardContent></Card><Card className="border-stone-200 bg-white shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base">Operating principle</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-stone-600"><p><strong className="text-stone-900">Evidence before output.</strong> Assumptions are visible.</p><p><strong className="text-stone-900">Approval before action.</strong> Lingo prepares; you decide.</p><p><strong className="text-stone-900">Traceable activity.</strong> The timeline is the shared record.</p></CardContent></Card></aside></section>
    <Card className="border-stone-200 bg-white shadow-sm"><CardHeader className="flex-row items-start justify-between border-b border-stone-100"><div><CardTitle className="text-xl">Mission activity</CardTitle><CardDescription className="mt-1">A factual timeline of agent work and decision points.</CardDescription></div><Activity className="h-5 w-5 text-violet-700"/></CardHeader><CardContent className="py-2">{events.length === 0 ? <div className="py-10 text-center text-sm text-stone-500">Your first mission will appear here as a clear, auditable activity timeline.</div> : <div className="divide-y divide-stone-100">{events.map((item, index) => <div key={`${item.type}-${index}`} className="flex gap-4 py-4"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-600"/><div><p className="text-sm font-medium capitalize">{item.type.replace(".", " ")}</p><p className="mt-1 text-sm text-stone-600">{item.message}</p></div></div>)}</div>}{error && <p className="my-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800"><CircleAlert className="h-4 w-4 shrink-0"/>{error}</p>}{summary && <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950"><p className="mb-2 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4"/>Mission brief</p><p className="whitespace-pre-wrap leading-6">{summary}</p></div>}</CardContent></Card>
  </div></main>;
}
