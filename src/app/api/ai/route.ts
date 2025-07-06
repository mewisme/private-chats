import { NextRequest, NextResponse } from 'next/server'
import { getChatMessages, setChatMessage } from '@/utils/ai-chat'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

export async function POST(req: NextRequest) {
  const { clientId, content } = await req.json()

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

  return NextResponse.json({
    role: data?.role || 'assistant',
    content: text
  })
}
