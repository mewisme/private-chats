// Room management for matching, joining, and leaving chat rooms

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore'

import { db } from './firebase'

export interface Room {
  id: string;
  participants: string[];
  status: 'waiting' | 'active' | 'ended';
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: any;
}

/**
 * Find an existing room with exactly one participant or create a new one
 */
export async function findOrCreateRoom(clientId: string): Promise<string> {
  // First, try to find a room with exactly one participant (waiting for someone)
  const roomsRef = collection(db, 'rooms')
  const q = query(
    roomsRef,
    where('status', '==', 'waiting'),
    where('participants', 'array-contains', clientId)
  )

  const existingRooms = await getDocs(q)

  // If user is already in a waiting room, return that room
  if (!existingRooms.empty) {
    return existingRooms.docs[0].id
  }

  // Look for any waiting room with exactly one participant (not including current user)
  const waitingRoomsQuery = query(
    roomsRef,
    where('status', '==', 'waiting')
  )

  const waitingRooms = await getDocs(waitingRoomsQuery)

  for (const roomDoc of waitingRooms.docs) {
    const roomData = roomDoc.data()
    if (roomData.participants.length === 1 && !roomData.participants.includes(clientId)) {
      // Join this room
      await updateDoc(doc(db, 'rooms', roomDoc.id), {
        participants: arrayUnion(clientId),
        status: 'active',
        updatedAt: serverTimestamp()
      })
      return roomDoc.id
    }
  }

  // No suitable room found, create a new one
  const newRoom = await addDoc(roomsRef, {
    participants: [clientId],
    status: 'waiting',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return newRoom.id
}

/**
 * Leave a room and clean up
 */
export async function leaveRoom(roomId: string, clientId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    return
  }

  const roomData = roomDoc.data()
  const participants = roomData.participants as string[]

  // If this is the last participant or there are only 2 participants, delete the room
  if (participants.length <= 2) {
    // Delete all messages in the room
    const messagesRef = collection(db, 'messages')
    const messagesQuery = query(messagesRef, where('roomId', '==', roomId))
    const messagesSnapshot = await getDocs(messagesQuery)

    const batch = writeBatch(db)
    messagesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // Delete the room
    batch.delete(roomRef)

    await batch.commit()
  } else {
    // Just remove the participant
    await updateDoc(roomRef, {
      participants: arrayRemove(clientId),
      updatedAt: serverTimestamp()
    })
  }
}

/**
 * Listen to room changes
 */
export function listenToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
  const roomRef = doc(db, 'rooms', roomId)

  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Room)
    } else {
      callback(null)
    }
  })
}

/**
 * Check if a room exists and is active
 */
export async function isRoomActive(roomId: string): Promise<boolean> {
  const roomRef = doc(db, 'rooms', roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    return false
  }

  const roomData = roomDoc.data()
  return roomData.status === 'active' && roomData.participants.length === 2
} 