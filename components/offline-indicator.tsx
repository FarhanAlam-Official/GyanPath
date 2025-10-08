"use client"

import { useEffect, useState } from "react"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
    }

    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showNotification) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          isOnline ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
        <span className="font-medium">{isOnline ? "Back Online" : "You're Offline"}</span>
      </div>
    </div>
  )
}
