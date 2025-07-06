import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'

import { db } from './firebase'

export interface TypingStatus {
  userId: string
  timestamp: any
}

// Set user typing status
export async function setTypingStatus(roomId: string, userId: string): Promise<void> {
  try {
    const typingRef = doc(db, 'typing', `${roomId}_${userId}`)
    await setDoc(typingRef, {
      roomId,
      userId,
      timestamp: serverTimestamp()
    })
  } catch (error) {
    console.error('Error setting typing status:', error)
  }
}

// Clear user typing status
export async function clearTypingStatus(roomId: string, userId: string): Promise<void> {
  try {
    const typingRef = doc(db, 'typing', `${roomId}_${userId}`)
    await deleteDoc(typingRef)
  } catch (error) {
    console.error('Error clearing typing status:', error)
  }
}

// Listen to typing status for a room (detects other users typing)
export function listenToTypingStatus(
  roomId: string,
  currentUserId: string,
  callback: (isTyping: boolean) => void
): () => void {
  // Create a simple listener that checks for any typing document in this room
  // that doesn't belong to the current user

  // For simplicity, let's assume there are only 2 users max in a room
  // We'll listen to a general typing status document for the room
  const typingRef = doc(db, 'typing', `${roomId}_status`)

  return onSnapshot(
    typingRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()

        // Check if anyone other than current user is typing
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
      console.error('Error listening to typing status:', error)
      callback(false)
    }
  )
}

// Update room typing status (for multi-user support)
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
    console.error('Error updating room typing status:', error)
  }
}

// Clear user from room typing status
export async function clearRoomTypingStatus(roomId: string, userId: string): Promise<void> {
  try {
    const typingRef = doc(db, 'typing', `${roomId}_status`)
    await setDoc(
      typingRef,
      {
        [userId]: null // Remove the user's typing status
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error clearing room typing status:', error)
  }
}
