"use client"

import { useEffect, useState } from "react"
import { syncManager } from "@/lib/offline/sync"

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      syncManager.syncAll()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Listen for sync messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SYNC_PROGRESS" || event.data.type === "SYNC_QUEUE") {
        setIsSyncing(true)
        syncManager
          .syncAll()
          .then(() => setIsSyncing(false))
          .catch(() => setIsSyncing(false))
      }
    }

    navigator.serviceWorker?.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      navigator.serviceWorker?.removeEventListener("message", handleMessage)
    }
  }, [])

  const syncNow = async () => {
    if (!isOnline) return
    setIsSyncing(true)
    try {
      await syncManager.syncAll()
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    isOnline,
    isSyncing,
    syncNow,
  }
}

