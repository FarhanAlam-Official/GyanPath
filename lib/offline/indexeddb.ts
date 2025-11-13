/**
 * IndexedDB utilities for offline storage
 */

const DB_NAME = "gyanpath-offline"
const DB_VERSION = 1

export interface OfflineLesson {
  id: string
  courseId: string
  title: string
  titleNe?: string
  description?: string
  descriptionNe?: string
  videoUrl?: string
  pdfUrl?: string
  orderIndex: number
  cachedAt: string
  videoBlob?: Blob
  pdfBlob?: Blob
}

export interface OfflineProgress {
  id?: number
  lessonId: string
  userId: string
  videoProgressSeconds: number
  isCompleted: boolean
  completedAt?: string
  lastAccessedAt: string
  synced: boolean
}

export interface OfflineQueueItem {
  id: string
  type: "progress" | "quiz_attempt" | "enrollment"
  data: unknown
  createdAt: string
  retries: number
}

export interface OfflineCourse {
  id: string
  title: string
  titleNe?: string
  description?: string
  descriptionNe?: string
  thumbnailUrl?: string
  instructorId: string
  cachedAt: string
}

class IndexedDBManager {
  private db: IDBDatabase | null = null

  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("lessons")) {
          const lessonStore = db.createObjectStore("lessons", { keyPath: "id" })
          lessonStore.createIndex("courseId", "courseId", { unique: false })
          lessonStore.createIndex("cachedAt", "cachedAt", { unique: false })
        }

        if (!db.objectStoreNames.contains("progress")) {
          const progressStore = db.createObjectStore("progress", {
            keyPath: "id",
            autoIncrement: true,
          })
          progressStore.createIndex("lessonId", "lessonId", { unique: false })
          progressStore.createIndex("userId", "userId", { unique: false })
          progressStore.createIndex("synced", "synced", { unique: false })
          progressStore.createIndex("composite", ["lessonId", "userId"], { unique: false })
        }

        if (!db.objectStoreNames.contains("queue")) {
          const queueStore = db.createObjectStore("queue", {
            keyPath: "id",
          })
          queueStore.createIndex("type", "type", { unique: false })
          queueStore.createIndex("createdAt", "createdAt", { unique: false })
        }

        if (!db.objectStoreNames.contains("cache")) {
          db.createObjectStore("cache", { keyPath: "url" })
        }

        if (!db.objectStoreNames.contains("courses")) {
          const courseStore = db.createObjectStore("courses", { keyPath: "id" })
          courseStore.createIndex("cachedAt", "cachedAt", { unique: false })
        }
      }
    })
  }

  // Lesson operations
  async saveLesson(lesson: OfflineLesson): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction("lessons", "readwrite")
    const store = transaction.objectStore("lessons")
    await store.put(lesson)
  }

  async getLesson(lessonId: string): Promise<OfflineLesson | null> {
    const db = await this.init()
    const transaction = db.transaction("lessons", "readonly")
    const store = transaction.objectStore("lessons")
    return new Promise((resolve, reject) => {
      const request = store.get(lessonId)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getLessonsByCourse(courseId: string): Promise<OfflineLesson[]> {
    const db = await this.init()
    const transaction = db.transaction("lessons", "readonly")
    const store = transaction.objectStore("lessons")
    const index = store.index("courseId")
    return new Promise((resolve, reject) => {
      const request = index.getAll(courseId)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction("lessons", "readwrite")
    const store = transaction.objectStore("lessons")
    await store.delete(lessonId)
  }

  async getAllLessons(): Promise<OfflineLesson[]> {
    const db = await this.init()
    const transaction = db.transaction("lessons", "readonly")
    const store = transaction.objectStore("lessons")
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Course operations
  async saveCourse(course: OfflineCourse): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction("courses", "readwrite")
    const store = transaction.objectStore("courses")
    await store.put(course)
  }

  async getCourse(courseId: string): Promise<OfflineCourse | null> {
    const db = await this.init()
    const transaction = db.transaction("courses", "readonly")
    const store = transaction.objectStore("courses")
    return new Promise((resolve, reject) => {
      const request = store.get(courseId)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteCourse(courseId: string): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction("courses", "readwrite")
    const store = transaction.objectStore("courses")
    await store.delete(courseId)
  }

  // Progress operations
  async saveProgress(progress: OfflineProgress): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction("progress", "readwrite")
    const store = transaction.objectStore("progress")
    await store.put(progress)
  }

  async getProgress(lessonId: string, userId: string): Promise<OfflineProgress | null> {
    const db = await this.init()
    const transaction = db.transaction("progress", "readonly")
    const store = transaction.objectStore("progress")
    const index = store.index("lessonId")
    return new Promise((resolve, reject) => {
      const request = index.getAll(lessonId)
      request.onsuccess = () => {
        const all = request.result || []
        const progress = all.find((p: OfflineProgress) => p.userId === userId)
        resolve(progress || null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedProgress(userId: string): Promise<OfflineProgress[]> {
    const db = await this.init()
    const transaction = db.transaction("progress", "readonly")
    const store = transaction.objectStore("progress")
    const index = store.index("synced")
    return new Promise((resolve, reject) => {
      const request = index.getAll(false)
      request.onsuccess = () => {
        const all = request.result || []
        resolve(all.filter((p) => p.userId === userId))
      }
      request.onerror = () => reject(request.error)
    })
  }

  async markProgressSynced(lessonId: string, userId: string): Promise<void> {
    const progress = await this.getProgress(lessonId, userId)
    if (progress) {
      const db = await this.init()
      const transaction = db.transaction("progress", "readwrite")
      const store = transaction.objectStore("progress")
      progress.synced = true
      await store.put(progress)
    }
  }

  // Queue operations
  async addToQueue(item: Omit<OfflineQueueItem, "id" | "createdAt" | "retries">): Promise<string> {
    const db = await this.init()
    const transaction = db.transaction("queue", "readwrite")
    const store = transaction.objectStore("queue")
    const queueItem: OfflineQueueItem = {
      ...item,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
      retries: 0,
    }
    return new Promise((resolve, reject) => {
      const request = store.put(queueItem)
      request.onsuccess = () => resolve(queueItem.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getQueueItems(): Promise<OfflineQueueItem[]> {
    const db = await this.init()
    const transaction = db.transaction("queue", "readonly")
    const store = transaction.objectStore("queue")
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async removeQueueItem(id: string): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction("queue", "readwrite")
    const store = transaction.objectStore("queue")
    await store.delete(id)
  }

  async incrementQueueRetry(id: string): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction("queue", "readwrite")
    const store = transaction.objectStore("queue")
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => {
        const item = request.result
        if (item) {
          item.retries += 1
          store.put(item)
          resolve()
        } else {
          reject(new Error("Queue item not found"))
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Cache operations
  async cacheResponse(url: string, response: Response): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction("cache", "readwrite")
    const store = transaction.objectStore("cache")
    const blob = await response.blob()
    await store.put({
      url,
      blob,
      timestamp: Date.now(),
    })
  }

  async getCachedResponse(url: string): Promise<Response | null> {
    const db = await this.init()
    const transaction = db.transaction("cache", "readonly")
    const store = transaction.objectStore("cache")
    return new Promise((resolve, reject) => {
      const request = store.get(url)
      request.onsuccess = () => {
        const cached = request.result
        if (cached) {
          resolve(new Response(cached.blob, { status: 200, statusText: "OK" }))
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Utility methods
  async clearCache(): Promise<void> {
    const db = await this.init()
    const transaction = db.transaction(["cache", "lessons", "progress"], "readwrite")
    await Promise.all([
      transaction.objectStore("cache").clear(),
      transaction.objectStore("lessons").clear(),
      transaction.objectStore("progress").clear(),
    ])
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { used: 0, quota: 0 }
    }

    const estimate = await navigator.storage.estimate()
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    }
  }
}

export const db = new IndexedDBManager()

