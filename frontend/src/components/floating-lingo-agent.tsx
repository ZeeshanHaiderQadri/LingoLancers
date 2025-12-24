"use client";

import React, { useState, useEffect, useRef } from "react";

interface FloatingLingoAgentProps {
  onNavigate?: (destination: string, data?: any) => void;
  onStartWorkflow?: (workflowType: string, data: any) => void;
}

export function FloatingLingoAgent({
  onNavigate,
  onStartWorkflow,
}: FloatingLingoAgentProps) {
  // Use environment variable or default to 8000
  const BACKEND_URL = process.env.NEXT_PUBLIC_LINGO_API_URL || "http://localhost:8000";
  const WS_URL = BACKEND_URL.replace("http", "ws").replace("https", "wss");

  const [isListening, setIsListening] = useState(false);
  const [isCardMode, setIsCardMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [talkAmount, setTalkAmount] = useState(0.35);
  const [noseScale, setNoseScale] = useState(1);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("en-US-AriaNeural");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [voices, setVoices] = useState<any[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Hardcoded Azure Voices
  const azureVoices = [
    { value: "en-US-AriaNeural", label: "Aria (English US Female)", category: "English US", language: "en-US", gender: "Female" },
    { value: "en-US-GuyNeural", label: "Guy (English US Male)", category: "English US", language: "en-US", gender: "Male" },
    { value: "en-GB-SoniaNeural", label: "Sonia (English UK Female)", category: "English UK", language: "en-GB", gender: "Female" },
    { value: "en-GB-RyanNeural", label: "Ryan (English UK Male)", category: "English UK", language: "en-GB", gender: "Male" },
    { value: "fr-FR-DeniseNeural", label: "Denise (French Female)", category: "French", language: "fr-FR", gender: "Female" },
    { value: "es-ES-ElviraNeural", label: "Elvira (Spanish Female)", category: "Spanish", language: "es-ES", gender: "Female" },
    { value: "zh-CN-XiaoxiaoNeural", label: "Xiaoxiao (Chinese Female)", category: "Chinese", language: "zh-CN", gender: "Female" },
    { value: "ar-SA-ZariyahNeural", label: "Zariyah (Arabic Female)", category: "Arabic", language: "ar-SA", gender: "Female" }
  ];

  useEffect(() => {
    setVoices(azureVoices);
  }, []);

  // Azure TTS helper function
  const speakWithAzure = async (text: string) => {
    if (!text) return;

    // Animate mouth while speaking
    const speakInterval = setInterval(() => {
      setTalkAmount(Math.random());
    }, 100);

    try {
      console.log('🔊 Calling Azure TTS:', `${BACKEND_URL}/api/voice/tts`);

      const response = await fetch(`${BACKEND_URL}/api/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play();
        audio.onended = () => {
          clearInterval(speakInterval);
          setTalkAmount(0.35);
        };
        audio.onerror = () => {
          clearInterval(speakInterval);
          setTalkAmount(0.35);
        };
      } else {
        clearInterval(speakInterval);
        setTalkAmount(0.35);
      }
    } catch (error) {
      console.error('❌ Azure TTS error:', error);
      clearInterval(speakInterval);
      setTalkAmount(0.35);
    }
  };

  // WebSocket connection
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log(`🔌 Connecting to ${WS_URL}/api/lingo/ws`);
    setConnectionStatus("connecting");

    try {
      const ws = new WebSocket(`${WS_URL}/api/lingo/ws`);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'ui_update' && message.data) {
            const msgText = message.data.message || message.data;
            if (typeof msgText === 'string') {
              speakWithAzure(msgText);
              // Dispatch event for chat interface
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('lingo-agent-message', {
                  detail: { message: msgText }
                }));
              }
            }
          }

          if (message.type === 'navigate' && onNavigate) {
            onNavigate(message.destination, message.data);
          }

          if ((message.type === 'start_workflow' || message.type === 'workflow_started') && onStartWorkflow) {
            onStartWorkflow(message.workflow_type, message.data);
          }

        } catch (err) {
          console.error("❌ WebSocket parse error:", err);
        }
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        setConnectionStatus("disconnected");
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("❌ WebSocket error:", err);
      setConnectionStatus("disconnected");
    }
  };

  // Connect on mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Web Speech API for STT
  const startMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported. Please use Chrome/Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      // Ensure WebSocket is connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      if (event.results[0].isFinal) {
        console.log("🎤 Final transcript:", transcript);
        // Send to backend
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'text_input', text: transcript }));
          // Dispatch event for chat interface
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lingo-user-message', {
              detail: { message: transcript }
            }));
          }
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopMic = () => {
    setIsListening(false);
    // SpeechRecognition stops automatically
  };

  // Random blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 1400 + Math.random() * 3000;
      setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 120);
      }, delay);
    };
    scheduleBlink();
  }, []);

  // Pupil parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current || isCardMode) return;
      const box = svgRef.current.getBoundingClientRect();
      const mx = e.clientX - box.left;
      const my = e.clientY - box.top;
      const nx = (mx / box.width) * 320;
      const ny = (my / box.height) * 360;
      const faceCenter = { x: 160, y: 140 };
      const maxOffset = 4;
      const dx = Math.max(-maxOffset, Math.min(maxOffset, (nx - faceCenter.x) / 18));
      const dy = Math.max(-maxOffset, Math.min(maxOffset, (ny - faceCenter.y) / 18));
      setPupilOffset({ x: dx, y: dy });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isCardMode]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.tagName === "SELECT" || target.closest("button")) return;

    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !widgetRef.current) return;
      const w = widgetRef.current.offsetWidth;
      const h = widgetRef.current.offsetHeight;
      const maxX = window.innerWidth - w;
      const maxY = window.innerHeight - h;
      const nx = Math.max(0, Math.min(maxX, e.clientX - dragOffset.x));
      const ny = Math.max(0, Math.min(maxY, e.clientY - dragOffset.y));
      setPosition({ x: nx, y: ny });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Calculate mouth dimensions
  const minH = 6, maxH = 38;
  const mouthHeight = minH + (maxH - minH) * talkAmount;
  const mouthY = 9 - mouthHeight / 2;
  const innerH = Math.max(6, Math.min(14, mouthHeight * 0.45));
  const innerY = (mouthHeight - innerH) / 2;
  const innerW = 48;
  const innerX = (60 - innerW) / 2;

  return (
    <>
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed z-[9999] right-[50px] w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
          style={{ top: '70px' }}
          title="Show Lingo"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 16c-2.8 0-5.2-1.5-6.5-3.8.1-2.2 4.3-3.4 6.5-3.4s6.4 1.2 6.5 3.4C17.2 18.5 14.8 20 12 20zm-6-8c0-3.3 2.7-6 6-6s6 2.7 6 6h-2c0-2.2-1.8-4-4-4s-4 1.8-4 4H6z" />
          </svg>
        </button>
      )}

      <div
        ref={widgetRef}
        className={`fixed z-[9999] select-none transition-all duration-300 ${isDragging ? "cursor-grabbing" : isCardMode ? "" : "cursor-grab"
          } ${isMinimized ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"}`}
        style={{
          right: position.x ? "auto" : "50px",
          top: position.y ? `${position.y}px` : "20px",
          left: position.x ? `${position.x}px` : "auto",
          bottom: position.y ? "auto" : "auto",
        }}
        onMouseDown={handleMouseDown}
      >
        {!isCardMode ? (
          <div className="relative grid gap-2 place-items-center group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
              title="Minimize"
            >
              <span className="text-sm font-bold">−</span>
            </button>

            <div
              onClick={() => setIsCardMode(true)}
              className="cursor-pointer hover:scale-105 transition-transform"
              title="Click to expand settings"
            >
              <svg
                ref={svgRef}
                className={`bot ${!isListening ? "idle-talking" : ""}`}
                viewBox="0 0 320 360"
                role="img"
                aria-label="Lingo voice agent"
                style={{ width: "min(28vmin, 140px)", height: "auto", overflow: "visible" }}
              >
                <defs>
                  <linearGradient id="grad-purple" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7a2cff" />
                    <stop offset="100%" stopColor="#4416b3" />
                  </linearGradient>
                  <linearGradient id="grad-green" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00ff88" />
                    <stop offset="100%" stopColor="#18c37a" />
                  </linearGradient>
                  <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000" floodOpacity=".45" />
                  </filter>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <ellipse cx="160" cy="330" rx="85" ry="20" fill="#000" opacity=".35" filter="url(#softShadow)" />

                <g className="body" filter="url(#softShadow)">
                  <rect x="85" y="240" rx="36" ry="36" width="150" height="80" fill="url(#grad-purple)" />
                  <text x="160" y="293" textAnchor="middle" fontSize="32" fontWeight="800" fill="url(#grad-green)" style={{ letterSpacing: "1px" }}>LINGO</text>
                </g>

                <g className="head" transform="translate(0,-10)" filter="url(#softShadow)">
                  <rect className="face-outer" x="40" y="60" rx="40" ry="40" width="240" height="170" fill="url(#grad-purple)" stroke="#00e08a" strokeWidth="3" />
                  <rect x="62" y="82" rx="28" ry="28" width="196" height="126" fill="#2a1b57" />
                  <circle cx="40" cy="145" r="18" fill="url(#grad-green)" />
                  <circle cx="280" cy="145" r="18" fill="url(#grad-green)" />
                  <line x1="160" y1="50" x2="160" y2="25" stroke="#00ff88" strokeWidth="5" />
                  <circle cx="160" cy="20" r="10" fill="url(#grad-green)" />

                  <g className="eyes">
                    <circle cx="115" cy="140" r="26" fill="#1b113e" stroke="#00e08a" strokeWidth="3" />
                    <circle cx="205" cy="140" r="26" fill="#1b113e" stroke="#00e08a" strokeWidth="3" />
                    <circle className="pupil" cx="115" cy="140" r="12" fill="url(#grad-green)" style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`, transition: "transform 100ms ease" }} />
                    <circle className="pupil" cx="205" cy="140" r="12" fill="url(#grad-green)" style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`, transition: "transform 100ms ease" }} />
                    <g className="eyelids" style={{ transformOrigin: "160px 135px", transform: isBlinking ? "scaleY(0.08)" : "scaleY(1)", transition: "transform 120ms ease" }}>
                      <rect x="89" y="114" width="52" height="52" rx="26" ry="26" fill="#2a1b57" />
                      <rect x="179" y="114" width="52" height="52" rx="26" ry="26" fill="#2a1b57" />
                    </g>
                  </g>

                  <g className="nose" transform="translate(140,160)" style={{ transformBox: "fill-box", transformOrigin: "50% 60%", transform: `scale(${noseScale})`, transition: "transform 80ms linear" }}>
                    <path d="M20 0 C32 0 40 8 40 20 C40 32 32 40 20 40 C8 40 0 32 0 20 C0 8 8 0 20 0 Z" fill="url(#grad-green)" />
                    <g fill="#1b113e" transform="translate(8,12)">
                      <rect x="0" y="4" width="3" height="8" rx="1" />
                      <rect x="5" y="0" width="3" height="16" rx="1" />
                      <rect x="10" y="6" width="3" height="6" rx="1" />
                      <rect x="15" y="2" width="3" height="12" rx="1" />
                    </g>
                  </g>

                  <g className="mouth" transform="translate(130,196)">
                    <rect x="0" y={mouthY} width="60" height={mouthHeight} rx="9" ry="9" fill="#00ff88" stroke="#00c070" strokeWidth="2.4" filter="url(#glow)" />
                    <rect x={innerX} y={mouthY + innerY} width={innerW} height={innerH} rx="4" ry="4" fill="#0d0a24" />
                  </g>
                </g>
              </svg>
            </div>

            <div className="flex gap-2 flex-wrap justify-center mt-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={startMic}
                disabled={isListening}
                className="px-3 py-1.5 rounded-xl border-0 font-extrabold text-[11px] cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,.35)] bg-gradient-to-br from-[#7a2cff] to-[#00e08a] text-[#0b0620] disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] hover:scale-105 transition-transform"
              >
                🎙️ Talk
              </button>
              <button
                onClick={stopMic}
                disabled={!isListening}
                className="px-3 py-1.5 rounded-xl border border-[#2a2057] font-extrabold text-[11px] cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,.35)] bg-[#2a1b57] text-[#e8e8ff] disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] hover:scale-105 transition-transform"
              >
                ◼ Stop
              </button>
            </div>

            <div className="text-[10px] text-center mt-1">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${connectionStatus === "connected" ? "bg-green-500" : connectionStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-gray-400"}`}></span>
              <span className="text-gray-400">{connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Connecting..." : "Offline"}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a113e] border border-gray-200 dark:border-[#2a2057] rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-[400px] relative group" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCardMode(false);
              }}
              className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
              title="Minimize"
            >
              <span className="text-sm font-bold">×</span>
            </button>

            <div className="flex items-center justify-center mb-4 cursor-move" onMouseDown={handleMouseDown} title="Drag to move">
              <h3 className="text-gray-900 dark:text-[#e8e8ff] font-bold text-lg flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Master Lingo Agent
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-600 dark:text-[#a8a8c8] text-sm font-semibold block mb-2">Select Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => {
                    const voice = azureVoices.find(v => v.value === e.target.value);
                    if (voice) {
                      setSelectedVoice(voice.value);
                      setSelectedLanguage(voice.language);
                    }
                  }}
                  className="w-full bg-gray-50 dark:bg-[#2a1b57] text-gray-900 dark:text-[#e8e8ff] border border-gray-300 dark:border-[#3a2b67] rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer focus:outline-none focus:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/20"
                >
                  {azureVoices.map((voice) => (
                    <option key={voice.value} value={voice.value}>
                      {voice.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-[#2a2057] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isListening ? "bg-green-500 animate-pulse" : connectionStatus === "connected" ? "bg-blue-500" : "bg-gray-400"}`}></div>
                  <span className="text-gray-600 dark:text-[#a8a8c8] text-xs font-medium">{isListening ? "Agent Active" : connectionStatus === "connected" ? "Connected" : "Agent Inactive"}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={startMic}
                    disabled={isListening}
                    className="px-4 py-2 rounded-lg font-bold text-xs bg-gradient-to-br from-[#7a2cff] to-[#00e08a] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-lg"
                  >
                    🎙️ Talk
                  </button>
                  <button
                    onClick={stopMic}
                    disabled={!isListening}
                    className="px-4 py-2 rounded-lg font-bold text-xs bg-gray-50 dark:bg-[#2a1b57] text-gray-900 dark:text-[#e8e8ff] border border-gray-300 dark:border-[#3a2b67] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                  >
                    ◼ Stop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
        .idle-talking .mouth {
          animation: talkLoop 700ms ease-in-out infinite;
        }
        @keyframes talkLoop {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      </div>
    </>
  );
}
