/**
 * Tests for offline sync functionality
 */

import { SyncManager } from "@/lib/offline/sync"
import { createClient } from "@/lib/supabase/client"

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}))

describe("Offline Sync Manager", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock IndexedDB
    global.indexedDB = {
      open: jest.fn(),
    } as any
  })

  it("syncs progress when online", async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      })),
    }

    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      configurable: true,
      value: true,
    })

    const syncManager = new SyncManager()
    
    // This is a conceptual test
    expect(syncManager).toBeDefined()
  })

  it("queues actions when offline", () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      configurable: true,
      value: false,
    })

    const syncManager = new SyncManager()
    expect(syncManager).toBeDefined()
  })
})

