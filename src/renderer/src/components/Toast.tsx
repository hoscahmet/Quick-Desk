import React from 'react'

interface ToastProps {
  message: string | null
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-xs font-medium text-app shadow-2xl border border-accent/40 backdrop-blur-md transition-all animate-bounce">
      <span>{message}</span>
    </div>
  )
}
