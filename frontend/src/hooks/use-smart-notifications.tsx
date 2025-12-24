'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { SmartNotification, SmartNotificationProps } from '@/components/ui/smart-notification'

interface NotificationContextType {
  showAnalysis: (message: string) => void
  showConfirmation: (
    title: string,
    message: string,
    details: SmartNotificationProps['details'],
    onConfirm: () => void,
    onCancel: () => void
  ) => void
  showProgress: (message: string, progress?: number) => void
  showSuccess: (title: string, message: string, details?: SmartNotificationProps['details']) => void
  showError: (title: string, message: string) => void
  hideNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function SmartNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<SmartNotificationProps | null>(null)

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const showAnalysis = useCallback((message: string) => {
    setNotification({
      type: 'analysis',
      title: 'Smart Analysis',
      message,
      onClose: hideNotification
    })
  }, [hideNotification])

  const showConfirmation = useCallback((
    title: string,
    message: string,
    details: SmartNotificationProps['details'],
    onConfirm: () => void,
    onCancel: () => void
  ) => {
    setNotification({
      type: 'confirmation',
      title,
      message,
      details,
      onConfirm: () => {
        onConfirm()
        hideNotification()
      },
      onCancel: () => {
        onCancel()
        hideNotification()
      },
      onClose: hideNotification
    })
  }, [hideNotification])

  const showProgress = useCallback((message: string, progress?: number) => {
    setNotification({
      type: 'progress',
      title: 'Executing Smart Change',
      message,
      progress,
      onClose: hideNotification
    })
  }, [hideNotification])

  const showSuccess = useCallback((
    title: string,
    message: string,
    details?: SmartNotificationProps['details']
  ) => {
    setNotification({
      type: 'success',
      title,
      message,
      details,
      onClose: hideNotification,
      autoClose: 5000 // Auto close after 5 seconds
    })
  }, [hideNotification])

  const showError = useCallback((title: string, message: string) => {
    setNotification({
      type: 'error',
      title,
      message,
      onClose: hideNotification,
      autoClose: 8000 // Auto close after 8 seconds
    })
  }, [hideNotification])

  const contextValue: NotificationContextType = {
    showAnalysis,
    showConfirmation,
    showProgress,
    showSuccess,
    showError,
    hideNotification
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification && <SmartNotification {...notification} />}
    </NotificationContext.Provider>
  )
}

export function useSmartNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useSmartNotifications must be used within a SmartNotificationProvider')
  }
  return context
}