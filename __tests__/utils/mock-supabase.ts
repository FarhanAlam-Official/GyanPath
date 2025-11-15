// Mock Supabase client for testing

export const createMockSupabaseClient = () => {
  const mockData: Record<string, any[]> = {}
  const mockSelect = jest.fn().mockReturnThis()
  const mockInsert = jest.fn().mockReturnThis()
  const mockUpdate = jest.fn().mockReturnThis()
  const mockDelete = jest.fn().mockReturnThis()
  const mockEq = jest.fn().mockReturnThis()
  const mockSingle = jest.fn()
  const mockOrder = jest.fn().mockReturnThis()
  const mockLimit = jest.fn().mockReturnThis()
  const mockRange = jest.fn().mockReturnThis()

  const mockFrom = jest.fn((table: string) => {
    return {
      select: mockSelect.mockImplementation((columns?: string) => {
        mockSelect.mockReturnValue({
          data: mockData[table] || [],
          error: null,
        })
        return {
          eq: mockEq,
          single: mockSingle,
          order: mockOrder,
          limit: mockLimit,
          range: mockRange,
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
        }
      }),
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      limit: mockLimit,
      range: mockRange,
    }
  })

  return {
    from: mockFrom,
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
        error: null,
      }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(() => ({
          data: {
            publicUrl: "https://example.com/file.jpg",
          },
        })),
      })),
    },
    // Test helpers
    _setMockData: (table: string, data: any[]) => {
      mockData[table] = data
    },
    _getMockFrom: () => mockFrom,
    _getMockSelect: () => mockSelect,
    _getMockInsert: () => mockInsert,
    _getMockUpdate: () => mockUpdate,
    _getMockDelete: () => mockDelete,
    _getMockEq: () => mockEq,
    _getMockSingle: () => mockSingle,
  }
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>

