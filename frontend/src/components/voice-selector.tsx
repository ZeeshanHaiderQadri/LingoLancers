"use client"

import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Voice {
  id: string
  name: string
  voice: string
  gender: 'female' | 'male'
  accent: string
  tier: 'free' | 'premium' | 'enterprise'
  description: string
}

// Premium Multilingual Voices with Emotions & Styles
// These voices support 90+ languages AND emotions/styles!
const CURATED_VOICES: Voice[] = [
  // Free tier - Multilingual voices with emotions
  {
    id: "aria",
    name: "Aria",
    voice: "en-US-AriaNeural",
    gender: "female",
    accent: "Multilingual",
    tier: "free",
    description: "🌍 90+ languages • 😊 Emotions: cheerful, sad, angry, excited • Professional & versatile"
  },
  {
    id: "jenny",
    name: "Jenny",
    voice: "en-US-JennyNeural",
    gender: "female",
    accent: "Multilingual",
    tier: "free",
    description: "🌍 90+ languages • 😊 Emotions: cheerful, sad, excited • Friendly & warm"
  },
  {
    id: "guy",
    name: "Guy",
    voice: "en-US-GuyNeural",
    gender: "male",
    accent: "Multilingual",
    tier: "free",
    description: "🌍 90+ languages • 😊 Emotions: cheerful, sad, angry • Professional & clear"
  },
  
  // Premium tier - Advanced multilingual with more emotions
  {
    id: "sara",
    name: "Sara",
    voice: "en-US-SaraNeural",
    gender: "female",
    accent: "Multilingual",
    tier: "premium",
    description: "🌍 90+ languages • 😊 Emotions: cheerful, sad, angry, excited, friendly • Conversational"
  },
  {
    id: "nancy",
    name: "Nancy",
    voice: "en-US-NancyNeural",
    gender: "female",
    accent: "Multilingual",
    tier: "premium",
    description: "🌍 90+ languages • 😊 Emotions: cheerful, sad, angry, excited • Energetic & dynamic"
  },
  {
    id: "davis",
    name: "Davis",
    voice: "en-US-DavisNeural",
    gender: "male",
    accent: "Multilingual",
    tier: "premium",
    description: "🌍 90+ languages • 😊 Emotions: cheerful, sad, angry, excited • Friendly & casual"
  },
  {
    id: "tony",
    name: "Tony",
    voice: "en-US-TonyNeural",
    gender: "male",
    accent: "Multilingual",
    tier: "premium",
    description: "🌍 90+ languages • 😊 Emotions: cheerful, sad, angry, excited • Authoritative"
  },
  {
    id: "jason",
    name: "Jason",
    voice: "en-US-JasonNeural",
    gender: "male",
    accent: "Multilingual",
    tier: "premium",
    description: "🌍 90+ languages • 😊 Emotions: cheerful, sad, angry, excited • Professional & warm"
  }
]

interface VoiceSelectorProps {
  value?: string
  onChange: (voice: string) => void
  userTier?: 'free' | 'premium' | 'enterprise'
  showPreview?: boolean
}

export function VoiceSelector({ 
  value, 
  onChange, 
  userTier = 'free',
  showPreview = true 
}: VoiceSelectorProps) {
  
  // Filter voices based on user tier
  const availableVoices = CURATED_VOICES.filter(voice => {
    if (userTier === 'enterprise') return true
    if (userTier === 'premium') return voice.tier !== 'enterprise'
    return voice.tier === 'free'
  })
  
  // Group voices
  const femaleVoices = availableVoices.filter(v => v.gender === 'female')
  const maleVoices = availableVoices.filter(v => v.gender === 'male')
  
  const selectedVoice = CURATED_VOICES.find(v => v.voice === value)
  
  const handlePreview = async (voiceId: string) => {
    // Play sample audio
    const voice = CURATED_VOICES.find(v => v.id === voiceId)
    if (voice && showPreview) {
      // TODO: Implement preview functionality
      console.log(`Preview voice: ${voice.name}`)
    }
  }
  
  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a voice">
            {selectedVoice && (
              <div className="flex items-center gap-2">
                <span>{selectedVoice.name}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedVoice.accent}
                </Badge>
                {selectedVoice.tier !== 'free' && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedVoice.tier}
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {/* Female voices */}
          <SelectGroup>
            <SelectLabel>Female Voices</SelectLabel>
            {femaleVoices.map(voice => (
              <SelectItem key={voice.id} value={voice.voice}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{voice.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {voice.accent}
                      </Badge>
                      {voice.tier !== 'free' && (
                        <Badge variant="secondary" className="text-xs">
                          {voice.tier}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {voice.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          
          {/* Male voices */}
          <SelectGroup>
            <SelectLabel>Male Voices</SelectLabel>
            {maleVoices.map(voice => (
              <SelectItem key={voice.id} value={voice.voice}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{voice.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {voice.accent}
                      </Badge>
                      {voice.tier !== 'free' && (
                        <Badge variant="secondary" className="text-xs">
                          {voice.tier}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {voice.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          
          {/* Upgrade prompt for free users */}
          {userTier === 'free' && (
            <div className="p-2 mt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Upgrade to Premium for 5 more voices
              </p>
            </div>
          )}
        </SelectContent>
      </Select>
      
      {/* Voice description */}
      {selectedVoice && (
        <p className="text-sm text-muted-foreground">
          {selectedVoice.description}
        </p>
      )}
    </div>
  )
}

// Simple version - just gender selection
export function SimpleVoiceSelector({ 
  value, 
  onChange 
}: { 
  value?: 'female' | 'male'
  onChange: (gender: 'female' | 'male') => void 
}) {
  return (
    <Select 
      value={value} 
      onValueChange={(v) => onChange(v as 'female' | 'male')}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select voice gender" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="female">
          <div className="flex flex-col">
            <span className="font-medium">Female Voice</span>
            <span className="text-xs text-muted-foreground">
              Jenny - Friendly and warm
            </span>
          </div>
        </SelectItem>
        <SelectItem value="male">
          <div className="flex flex-col">
            <span className="font-medium">Male Voice</span>
            <span className="text-xs text-muted-foreground">
              Guy - Professional and clear
            </span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
