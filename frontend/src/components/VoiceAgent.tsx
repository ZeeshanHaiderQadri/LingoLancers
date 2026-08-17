"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceAgentProps {
    isOpen: boolean;
    onClose: () => void;
    onTranscript?: (text: string, isFinal: boolean) => void;
    onStateChange?: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
}

export function VoiceAgent({ isOpen, onClose, onTranscript, onStateChange }: VoiceAgentProps) {
    const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Update parent when state changes
    const updateState = useCallback((newState: 'idle' | 'listening' | 'thinking' | 'speaking') => {
        setAgentState(newState);
        onStateChange?.(newState);
    }, [onStateChange]);

    // Initialize Web Speech API
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Speech Recognition setup
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                console.log('🎤 Speech recognition started');
                updateState('listening');
            };

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Send partial transcripts
                if (interimTranscript && onTranscript) {
                    console.log('🎙️ Interim transcript:', interimTranscript);
                    onTranscript(interimTranscript, false);
                }

                // Send final transcript
                if (finalTranscript && onTranscript) {
                    console.log('✅ Final transcript:', finalTranscript.trim());
                    onTranscript(finalTranscript.trim(), true);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    console.log('No speech detected, continuing...');
                } else {
                    updateState('idle');
                }
            };

            recognition.onend = () => {
                console.log('🎤 Speech recognition ended');
                // Restart if still open
                if (isOpen && agentState === 'listening') {
                    recognition.start();
                } else {
                    updateState('idle');
                }
            };

            recognitionRef.current = recognition;
        }

        // Speech Synthesis setup
        synthRef.current = window.speechSynthesis;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    // Start/stop recognition based on isOpen
    useEffect(() => {
        if (!recognitionRef.current) return;

        if (isOpen) {
            try {
                recognitionRef.current.start();
                updateState('listening');
            } catch (e) {
                console.error('Failed to start recognition:', e);
            }
        } else {
            try {
                recognitionRef.current.stop();
                updateState('idle');
            } catch (e) {
                // Already stopped
            }
        }

        return () => {
            try {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            } catch (e) {
                // Ignore
            }
        };
    }, [isOpen]);

    // Expose a method to speak text (called from parent)
    useEffect(() => {
        // Store reference on window for parent to call
        if (typeof window !== 'undefined') {
            (window as any).lingoVoiceSpeak = (text: string) => {
                if (synthRef.current && text) {
                    // Cancel any ongoing speech
                    synthRef.current.cancel();

                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'en-US';
                    utterance.rate = 1.0;
                    utterance.pitch = 1.0;

                    utterance.onstart = () => {
                        updateState('speaking');
                    };

                    utterance.onend = () => {
                        updateState('listening');
                    };

                    utterance.onerror = () => {
                        updateState('listening');
                    };

                    synthRef.current.speak(utterance);
                }
            };
        }
    }, [updateState]);

    // Headless component - no UI
    return null;
}
