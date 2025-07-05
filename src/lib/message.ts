// Message management for sending and reading chat messages

import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore'

import { db } from './firebase'

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: any;
}

/**
 * Send a message to a room
 */
export async function sendMessage(roomId: string, senderId: string, text: string): Promise<void> {
  if (!text.trim()) {
    return
  }

  const messagesRef = collection(db, 'messages')

  await addDoc(messagesRef, {
    roomId,
    senderId,
    text: text.trim(),
    timestamp: serverTimestamp()
  })
}

/**
 * Listen to messages in a room
 */
export function listenToMessages(roomId: string, callback: (messages: Message[]) => void): () => void {
  const messagesRef = collection(db, 'messages')
  const q = query(
    messagesRef,
    where('roomId', '==', roomId),
    orderBy('timestamp', 'asc'),
    limit(100) // Limit to last 100 messages
  )

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message)
    })
    callback(messages)
  })
} 