import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'

import { Logger } from '@/utils/logger'
import { db } from './firebase'

export interface TypingStatus {
  userId: string
  timestamp: any
}

export async function setTypingStatus(roomId: string, userId: string): Promise<void> {
  try {
    const typingRef = doc(db, 'typing', `${roomId}_${userId}`)
    await setDoc(typingRef, {
      roomId,
      userId,
      timestamp: serverTimestamp()
    })
  } catch (error) {
    Logger.error('Error setting typing status:', error)
  }
}

export async function clearTypingStatus(roomId: string, userId: string): Promise<void> {
  try {
    const typingRef = doc(db, 'typing', `${roomId}_${userId}`)
    await deleteDoc(typingRef)
  } catch (error) {
    Logger.error('Error clearing typing status:', error)
  }
}

export function listenToTypingStatus(
  roomId: string,
  currentUserId: string,
  callback: (isTyping: boolean) => void
): () => void {
  const typingRef = doc(db, 'typing', `${roomId}_status`)

  return onSnapshot(
    typingRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()

        let someoneElseTyping = false

        for (const [userId, typingData] of Object.entries(data)) {
          if (userId !== currentUserId && typingData && typeof typingData === 'object') {
            const typingInfo = typingData as { timestamp: any }
            if (typingInfo.timestamp) {
              const now = Date.now()
              const typingTime = typingInfo.timestamp.toDate?.()?.getTime?.() || 0
              const isRecent = now - typingTime < 3000 // 3 seconds

              if (isRecent) {
                someoneElseTyping = true
                break
              }
            }
          }
        }

        callback(someoneElseTyping)
      } else {
        callback(false)
      }
    },
    (error) => {
      Logger.error('Error listening to typing status:', error)
      callback(false)
    }
  )
}

export async function updateRoomTypingStatus(roomId: string, userId: string): Promise<void> {
  try {
    const typingRef = doc(db, 'typing', `${roomId}_status`)
    await setDoc(
      typingRef,
      {
        [userId]: {
          timestamp: serverTimestamp()
        }
      },
      { merge: true }
    )
  } catch (error) {
    Logger.error('Error updating room typing status:', error)
  }
}

export async function clearRoomTypingStatus(roomId: string, userId: string): Promise<void> {
  try {
    const typingRef = doc(db, 'typing', `${roomId}_status`)
    await setDoc(
      typingRef,
      {
        [userId]: null
      },
      { merge: true }
    )
  } catch (error) {
    Logger.error('Error clearing room typing status:', error)
  }
}
