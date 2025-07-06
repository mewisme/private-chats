import ChatRoom from '@/components/chat/chat-room'

interface ChatPageProps {
  params: Promise<{
    roomId: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { roomId } = await params
  return <ChatRoom roomId={roomId} />
}
