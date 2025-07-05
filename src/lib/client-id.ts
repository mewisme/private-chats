// Client ID management using localStorage

import { v4 as uuidv4 } from 'uuid'

const CLIENT_ID_KEY = 'private-chats-client-id'

/**
 * Get or generate a persistent client ID from localStorage
 */
export function getClientId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return a temporary ID
    return 'temp-' + Math.random().toString(36).substr(2, 9)
  }

  let clientId = localStorage.getItem(CLIENT_ID_KEY)

  if (!clientId) {
    clientId = uuidv4()
    localStorage.setItem(CLIENT_ID_KEY, clientId)
  }

  return clientId
}

/**
 * Clear the client ID (for testing purposes)
 */
export function clearClientId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CLIENT_ID_KEY)
  }
} 