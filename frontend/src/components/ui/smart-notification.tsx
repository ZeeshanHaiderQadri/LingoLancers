'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Clock,
  Zap,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SmartNotificationProps {
  type: 'analysis' | 'confirmation' | 'progress' | 'success' | 'error'
  title: string
  message: string
  details?: {
    changeType?: string
    confidence?: number
    estimatedTime?: number
    executionTime?: number
    target?: string
  }
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
  progress?: number
  autoClose?: number // milliseconds
}

export function SmartNotification({
  type,
  title,
  message,
  details,
  onConfirm,
  onCancel,
  onClose,
  progress,
  autoClose
}: SmartNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [countdown, setCountdown] = useState(autoClose ? Math.ceil(autoClose / 1000) : 0)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoClose)

      const countdownTimer = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1))
      }, 1000)

      return () => {
        clearTimeout(timer)
        clearInterval(countdownTimer)
      }
    }
  }, [autoClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300) // Allow animation to complete
  }

  const getIcon = () => {
    switch (type) {
      case 'analysis':
        return <Sparkles className="h-5 w-5 text-blue-400" />
      case 'confirmation':
        return <AlertCircle className="h-5 w-5 text-amber-400" />
      case 'progress':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
    }
  }

  const getGradient = () => {
    switch (type) {
      case 'analysis':
        return 'from-blue-500/20 to-purple-500/20'
      case 'confirmation':
        return 'from-amber-500/20 to-orange-500/20'
      case 'progress':
        return 'from-blue-500/20 to-cyan-500/20'
      case 'success':
        return 'from-green-500/20 to-emerald-500/20'
      case 'error':
        return 'from-red-500/20 to-pink-500/20'
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'analysis':
        return 'border-blue-500/30'
      case 'confirmation':
        return 'border-amber-500/30'
      case 'progress':
        return 'border-blue-500/30'
      case 'success':
        return 'border-green-500/30'
      case 'error':
        return 'border-red-500/30'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className={cn(
        "w-full max-w-md transform transition-all duration-300 ease-out",
        "bg-gradient-to-br backdrop-blur-xl border shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4",
        isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
        getGradient(),
        getBorderColor()
      )}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <h3 className="font-semibold text-lg text-white">{title}</h3>
                {details?.changeType && (
                  <Badge variant="secondary" className="mt-1 bg-white/10 text-white/80 border-white/20">
                    {details.changeType.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Message */}
          <p className="text-white/80 mb-4 leading-relaxed">{message}</p>

          {/* Details */}
          {details && (
            <div className="space-y-3 mb-4">
              {details.confidence !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Confidence</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={details.confidence * 100} 
                      className="w-20 h-2 bg-white/10"
                    />
                    <span className="text-sm font-medium text-white">
                      {(details.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              
              {details.estimatedTime !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Estimated Time
                  </span>
                  <span className="text-sm font-medium text-white">
                    {details.estimatedTime}s
                  </span>
                </div>
              )}

              {details.executionTime !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Execution Time
                  </span>
                  <span className="text-sm font-medium text-white">
                    {details.executionTime.toFixed(1)}s
                  </span>
                </div>
              )}

              {details.target && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Target</span>
                  <span className="text-sm font-medium text-white">
                    {details.target}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {type === 'progress' && progress !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Progress</span>
                <span className="text-sm font-medium text-white">{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-white/10"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {type === 'confirmation' && onConfirm && onCancel && (
              <>
                <Button
                  onClick={onConfirm}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                >
                  Apply Smart Change
                </Button>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Full Rewrite
                </Button>
              </>
            )}

            {(type === 'success' || type === 'error') && (
              <Button
                onClick={handleClose}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
                variant="outline"
              >
                {countdown > 0 ? `Close (${countdown})` : 'Close'}
              </Button>
            )}

            {type === 'analysis' && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-white/60 mr-2" />
                <span className="text-sm text-white/60">Analyzing...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}