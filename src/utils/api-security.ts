import { NextRequest, NextResponse } from 'next/server'

export const RATE_LIMIT_WINDOW = 60 * 1000
export const RATE_LIMIT_MAX_REQUESTS = 15
export const requestCounts = new Map<string, { count: number; resetTime: number }>()

export const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://chat.mewis.me']

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const real = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || real || '127.0.0.1'
  return ip.trim()
}

export function isRateLimited(clientIp: string): boolean {
  const now = Date.now()
  const clientData = requestCounts.get(clientIp)

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientIp, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })

    return false
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  clientData.count += 1
  return false
}

export function setCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

export function createErrorResponse(
  message: string,
  status: number,
  origin?: string | null
): NextResponse {
  const response = NextResponse.json({ error: message }, { status })
  return setCorsHeaders(response, origin)
}
