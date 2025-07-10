import ChatRoom from '@/components/chat/chat-room'
import { ErrorBoundary } from '@/components/providers/error-boundary'

interface ChatPageProps {
  params: Promise<{
    roomId: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { roomId } = await params
  return (
    <ErrorBoundary>
      <ChatRoom roomId={roomId} />
    </ErrorBoundary>
  )
}
