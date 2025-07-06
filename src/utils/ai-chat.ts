export type Message = {
  role: 'user' | 'assistant'
  content: string
}

const chatSessions = new Map<string, Message[]>()

export async function getChatMessages(clientId: string): Promise<Message[]> {
  return chatSessions.get(clientId) || []
}

export async function setChatMessages(clientId: string, messages: Message[]): Promise<void> {
  chatSessions.set(clientId, messages)
}

export async function setChatMessage(
  clientId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const messages = await getChatMessages(clientId)

  if (messages.length > 0) {
    messages.push({ role, content })
    await setChatMessages(clientId, messages)
  } else {
    await setChatMessages(clientId, [
      {
        role: 'assistant',
        content: 'You are a great and helpful friend.'
      },
      { role, content }
    ])
  }
}
