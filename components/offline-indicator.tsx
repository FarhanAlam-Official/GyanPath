"use client"

import { WifiOff, Wifi, RefreshCw } from "lucide-react"
import { useOfflineSync } from "@/hooks/use-offline-sync"

export function OfflineIndicator() {
  const { isOnline, isSyncing, syncNow } = useOfflineSync()

  if (isOnline && !isSyncing) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          isOnline ? "bg-blue-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {isOnline ? (
          <>
            {isSyncing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Wifi className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isSyncing ? "Syncing..." : "Back Online"}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">You are offline</span>
          </>
        )}
        {isOnline && !isSyncing && (
          <button
            onClick={syncNow}
            className="ml-2 underline underline-offset-2 hover:no-underline"
          >
            Sync Now
          </button>
        )}
      </div>
    </div>
  )
}
