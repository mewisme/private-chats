import { NextRequest, NextResponse } from 'next/server'
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  query,
  where,
  writeBatch
} from 'firebase/firestore'

import { Logger } from '@/utils/logger'
import { db } from '@/lib/firebase'

interface CleanupResult {
  success: boolean
  summary: {
    roomsProcessed: number
    roomsDeleted: number
    messagesDeleted: number
    typingDeleted: number
  }
  errors: string[]
  dryRun: boolean
  executionTime: number
}

interface RoomData {
  id: string
  updatedAt: Timestamp
  [key: string]: any
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const cronSecret = request.headers.get('x-cron-secret')
    if (cronSecret !== process.env.SERVER_CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized. Invalid cron secret.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dry-run') === 'true'

    Logger.info(`Starting cleanup job ${dryRun ? '(DRY RUN)' : ''}...`)

    const cutoffTime = new Date(Date.now() - 10 * 60 * 1000)
    Logger.info(`Cutoff time: ${cutoffTime.toISOString()}`)

    const result: CleanupResult = {
      success: true,
      summary: {
        roomsProcessed: 0,
        roomsDeleted: 0,
        messagesDeleted: 0,
        typingDeleted: 0
      },
      errors: [],
      dryRun,
      executionTime: 0
    }

    Logger.info('Fetching rooms (limited for free plan optimization)...')
    const roomsRef = collection(db, 'rooms')
    const roomsQuery = query(roomsRef, limit(100))
    const roomsSnapshot = await getDocs(roomsQuery)

    const rooms: RoomData[] = []
    roomsSnapshot.forEach((doc) => {
      const data = doc.data()
      rooms.push({
        id: doc.id,
        updatedAt: data.updatedAt,
        ...data
      })
    })

    Logger.info(`Found ${rooms.length} total rooms (limited to 100 for optimization)`)
    result.summary.roomsProcessed = rooms.length

    const roomsToDelete: string[] = []

    for (const room of rooms) {
      try {
        if (!room.updatedAt) {
          Logger.warn(`Room ${room.id} has no updatedAt timestamp, skipping`)
          continue
        }

        const roomUpdatedAt = room.updatedAt.toDate()

        if (roomUpdatedAt < cutoffTime) {
          roomsToDelete.push(room.id)
          if (roomsToDelete.length <= 5) {
            Logger.info(
              `Room ${room.id} marked for deletion (last updated: ${roomUpdatedAt.toISOString()})`
            )
          }
        }
      } catch (error) {
        const errorMsg = `Error processing room ${room.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        Logger.error(`${errorMsg}`)
        result.errors.push(errorMsg)
      }
    }

    Logger.info(`Found ${roomsToDelete.length} rooms to delete`)

    Logger.info('Cleaning up typing documents (limited for free plan)...')
    const typingRef = collection(db, 'typing')
    const typingQuery = query(typingRef, limit(50))
    const allTypingSnapshot = await getDocs(typingQuery)
    let totalTypingDeleted = allTypingSnapshot.size

    if (allTypingSnapshot.size > 0) {
      Logger.info(`Found ${allTypingSnapshot.size} typing documents to delete (max 50 per run)`)
      if (!dryRun) {
        const typingBatch = writeBatch(db)
        allTypingSnapshot.forEach((doc) => {
          typingBatch.delete(doc.ref)
        })
        await typingBatch.commit()
        Logger.info(`Deleted ${allTypingSnapshot.size} typing documents`)
      } else {
        Logger.info(`Would delete ${allTypingSnapshot.size} typing documents (dry run)`)
      }
    } else {
      Logger.info('No typing documents found')
    }

    if (roomsToDelete.length === 0) {
      Logger.info('No rooms need cleanup')
      result.summary.typingDeleted = totalTypingDeleted
      result.executionTime = Date.now() - startTime
      return NextResponse.json(result)
    }

    const batchSize = 10
    let totalMessagesDeleted = 0
    let totalRoomsDeleted = 0
    const maxExecutionTime = 45000 // 45 seconds to stay under Vercel's 60s limit

    for (let i = 0; i < roomsToDelete.length; i += batchSize) {
      if (Date.now() - startTime > maxExecutionTime) {
        Logger.warn('Approaching execution time limit, stopping cleanup')
        result.errors.push('Cleanup stopped due to execution time limit')
        break
      }

      const batchRooms = roomsToDelete.slice(i, i + batchSize)

      try {
        const batchResult = await processBatch(batchRooms, dryRun)
        totalRoomsDeleted += batchResult.roomsDeleted
        totalMessagesDeleted += batchResult.messagesDeleted

        Logger.info(
          `Batch ${Math.floor(i / batchSize) + 1} completed: ${batchResult.roomsDeleted} rooms, ${batchResult.messagesDeleted} messages`
        )
      } catch (error) {
        const errorMsg = `Error processing batch ${Math.floor(i / batchSize) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
        Logger.error(`${errorMsg}`)
        result.errors.push(errorMsg)
        result.success = false
      }
    }

    result.summary.roomsDeleted = totalRoomsDeleted
    result.summary.messagesDeleted = totalMessagesDeleted
    result.summary.typingDeleted = totalTypingDeleted
    result.executionTime = Date.now() - startTime

    Logger.info(`Cleanup completed ${dryRun ? '(DRY RUN)' : ''}!`)
    Logger.info(
      `Summary: ${totalRoomsDeleted} rooms, ${totalMessagesDeleted} messages, ${totalTypingDeleted} typing docs deleted`
    )
    Logger.info(`Execution time: ${result.executionTime}ms`)

    return NextResponse.json(result)
  } catch (error) {
    Logger.error('Cleanup job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}

async function processBatch(roomIds: string[], dryRun: boolean) {
  const batch = writeBatch(db)
  let roomsDeleted = 0
  let messagesDeleted = 0

  for (const roomId of roomIds) {
    try {
      const messagesRef = collection(db, 'messages')
      const messagesQuery = query(messagesRef, where('roomId', '==', roomId))
      const messagesSnapshot = await getDocs(messagesQuery)

      messagesSnapshot.forEach((doc) => {
        if (!dryRun) {
          batch.delete(doc.ref)
        }
        messagesDeleted++
      })

      const roomRef = doc(db, 'rooms', roomId)
      if (!dryRun) {
        batch.delete(roomRef)
      }
      roomsDeleted++
    } catch (error) {
      Logger.error(`Error processing room ${roomId}:`, error)
      throw error
    }
  }

  if (!dryRun && (roomsDeleted > 0 || messagesDeleted > 0)) {
    await batch.commit()
  }

  return { roomsDeleted, messagesDeleted }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'cleanup-api',
    timestamp: new Date().toISOString()
  })
}
