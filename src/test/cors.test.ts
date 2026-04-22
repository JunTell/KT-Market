import { describe, it, expect, vi } from 'vitest'

// Mock process.env before importing to control ALLOWED_ORIGINS
vi.stubEnv('ALLOWED_ORIGINS', '')

// Dynamic import so env stub takes effect
const { getCorsHeaders } = await import('../shared/lib/cors')

describe('getCorsHeaders', () => {
  it('returns full CORS headers for an allowed ktmarket.co.kr origin', () => {
    const headers = getCorsHeaders('https://ktmarket.co.kr')
    expect(headers['Access-Control-Allow-Origin']).toBe('https://ktmarket.co.kr')
    expect(headers['Access-Control-Allow-Credentials']).toBe('true')
    expect(headers['Access-Control-Allow-Methods']).toContain('GET')
  })

  it('returns full CORS headers for the Framer app origin', () => {
    const headers = getCorsHeaders('https://smaller-process-561216.framer.app')
    expect(headers['Access-Control-Allow-Origin']).toBe('https://smaller-process-561216.framer.app')
    expect(headers['Access-Control-Allow-Credentials']).toBe('true')
  })

  it('returns only Vary header for an unknown origin (no CORS leak)', () => {
    const headers = getCorsHeaders('https://evil.example.com')
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined()
    expect(headers['Vary']).toBe('Origin')
  })

  it('returns only Vary header for null origin', () => {
    const headers = getCorsHeaders(null)
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined()
    expect(headers['Vary']).toBe('Origin')
  })
})
