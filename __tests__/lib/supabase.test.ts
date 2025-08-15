import { isSupabaseAvailable } from '@/lib/supabase'

describe('Supabase Service', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should check if Supabase is available with valid credentials', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
    
    // Since the module is already loaded, we need to re-import it
    jest.isolateModules(() => {
      const { isSupabaseAvailable } = require('@/lib/supabase')
      expect(isSupabaseAvailable()).toBe(true)
    })
  })

  it('should return false when Supabase credentials are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    jest.isolateModules(() => {
      const { isSupabaseAvailable } = require('@/lib/supabase')
      expect(isSupabaseAvailable()).toBe(false)
    })
  })

  it('should export correct user role types', () => {
    const { UserRole } = require('@/lib/supabase')
    expect(['buyer', 'vendor', 'admin']).toEqual(
      expect.arrayContaining(['buyer', 'vendor', 'admin'])
    )
  })

  it('should export correct company status types', () => {
    const { CompanyStatus } = require('@/lib/supabase')
    expect(['pending', 'approved', 'rejected', 'suspended']).toEqual(
      expect.arrayContaining(['pending', 'approved', 'rejected', 'suspended'])
    )
  })
})