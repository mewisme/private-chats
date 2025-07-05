'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogBackdrop, DialogDescription, DialogFooter, DialogHeader, DialogPanel, DialogTitle } from '../animate-ui/headless/dialog';
import { LogOut, Send } from 'lucide-react';
import { Message, listenToMessages, sendMessage } from '@/lib/message';
import { Room, leaveRoom, listenToRoom } from '@/lib/room';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ChatMessageList } from './chat-message-list';
import { Input } from '@/components/ui/input';
import { getClientId } from '@/lib/client-id';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ChatRoomProps {
  roomId: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [_, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const clientId = getClientId();

  useEffect(() => {
    const unsubRoom = listenToRoom(roomId, (roomData) => {
      if (!roomData) {
        toast.info('The chat has ended');
        router.push('/');
        return;
      }
      setRoom(roomData);
      setIsConnected(roomData.status === 'active' && roomData.participants.length === 2);
    });

    const unsubMessages = listenToMessages(roomId, setMessages);

    return () => {
      unsubRoom?.();
      unsubMessages?.();
    };
  }, [roomId, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [roomId, clientId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(roomId, clientId, newMessage);
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleUnload = () => leaveRoom(roomId, clientId)

  const handleLeaveChat = async () => {
    try {
      await handleUnload()
      router.push('/');
    } catch {
      toast.error('Failed to leave chat');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-header">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-white">Anonymous Chat</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected with stranger' : 'Waiting for connection...'}
            </p>
          </div>
          <Button onClick={() => setIsLeaveOpen(true)} variant="destructive" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>
          <Dialog open={isLeaveOpen} onClose={() => setIsLeaveOpen(false)}>
            <DialogBackdrop />
            <DialogPanel>
              <DialogHeader>
                <DialogTitle>Leave chat</DialogTitle>
                <DialogDescription>Are you sure you want to leave this chat?</DialogDescription>
              </DialogHeader>
              <p>
                All messages will be deleted and you will be disconnected from the chat.
              </p>
              <DialogFooter>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLeaveOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant={'destructive'} onClick={handleLeaveChat}>
                    Leave
                  </Button>
                </DialogFooter>
              </DialogFooter>
            </DialogPanel>
          </Dialog>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-3 pb-0">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p className="text-center text-sm">
                {isConnected ? 'Start your conversation...' : 'Waiting for someone to join...'}
              </p>
            </div>
          ) : (
            <ChatMessageList messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={!isConnected || isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected || isSending}
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Waiting for someone to join the chat...
            </p>
          )}
        </CardContent>
      </Card>
    </div >
  );
}
