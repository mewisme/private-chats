import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
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
  id: string
  clientId: string
  participants: string[]
  status: 'waiting' | 'active' | 'ended'
  createdAt: any
  updatedAt: any
}

export interface Message {
  id: string
  roomId: string
  senderId: string
  text: string
  timestamp: any
}

export async function findOrCreateRoom(clientId: string): Promise<string> {
  const roomsRef = collection(db, 'rooms')
  const q = query(
    roomsRef,
    where('status', '==', 'waiting'),
    where('participants', 'array-contains', clientId)
  )

  const existingRooms = await getDocs(q)

  if (!existingRooms.empty) {
    return existingRooms.docs[0].id
  }

  const waitingRoomsQuery = query(roomsRef, where('status', '==', 'waiting'))

  const waitingRooms = await getDocs(waitingRoomsQuery)

  for (const roomDoc of waitingRooms.docs) {
    const roomData = roomDoc.data()
    if (roomData.participants.length === 1 && !roomData.participants.includes(clientId)) {
      await updateDoc(doc(db, 'rooms', roomDoc.id), {
        participants: arrayUnion(clientId),
        status: 'active',
        updatedAt: serverTimestamp()
      })
      return roomDoc.id
    }
  }

  const newRoom = await addDoc(roomsRef, {
    participants: [clientId],
    status: 'waiting',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    clientId: clientId
  })

  return newRoom.id
}

export async function leaveRoom(roomId: string, clientId: string): Promise<void> {
  try {
    const roomRef = doc(db, 'rooms', roomId)
    const roomDoc = await getDoc(roomRef)

    if (!roomDoc.exists()) {
      return
    }

    const roomData = roomDoc.data()
    const participants = roomData.participants as string[]

    if (participants.length <= 2) {
      const messagesRef = collection(db, 'messages')
      const messagesQuery = query(messagesRef, where('roomId', '==', roomId))
      const messagesSnapshot = await getDocs(messagesQuery)

      const batch = writeBatch(db)
      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      batch.delete(roomRef)

      await batch.commit()
    } else {
      await updateDoc(roomRef, {
        participants: arrayRemove(clientId),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.log(error)
  }
}

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

export async function isRoomActive(roomId: string): Promise<boolean> {
  const roomRef = doc(db, 'rooms', roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    return false
  }

  const roomData = roomDoc.data()
  return roomData.status === 'active' && roomData.participants.length === 2
}
