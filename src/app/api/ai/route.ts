import {
  ALLOWED_ORIGINS,
  createErrorResponse,
  getClientIp,
  isRateLimited,
  setCorsHeaders
} from '@/utils/api-security'
import { NextRequest, NextResponse } from 'next/server'
import { getChatMessages, setChatMessage } from '@/utils/ai-chat'

import { Logger } from '@/utils/logger'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.SERVER_GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  const response = new NextResponse(null, { status: 200 })
  return setCorsHeaders(response, origin)
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return createErrorResponse('CORS: Origin not allowed', 403, origin)
  }

  const clientIp = getClientIp(req)
  if (isRateLimited(clientIp)) {
    return createErrorResponse('Rate limit exceeded. Please try again later.', 429, origin)
  }

  try {
    const { clientId, content } = await req.json()

    if (!clientId || !content) {
      return createErrorResponse('Missing required fields: clientId and content', 400, origin)
    }

    await setChatMessage(clientId, 'user', content)

    const messages = await getChatMessages(clientId)

    const response = await openai.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages,
      // @ts-ignore
      reasoning_effort: 'none'
    })

    const data = response.choices[0].message
    const text = data?.content || ''

    await setChatMessage(clientId, 'assistant', text)

    const jsonResponse = NextResponse.json({
      role: data?.role || 'assistant',
      content: text
    })

    return setCorsHeaders(jsonResponse, origin)
  } catch (error) {
    Logger.error('API Error:', error)
    return createErrorResponse('Internal server error', 500, origin)
  }
}
