import type { Timestamp } from 'firebase/firestore'

/** Firestore document fields. Document IDs remain the Firestore document IDs. */
export type UserProfileDocument = {
  uid: string
  email: string
  displayName: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type FolderDocument = {
  name: string
  description?: string
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type NoteDocument = {
  title: string
  content: string
  folderId: string
  userId: string
  summary?: string
  keyTopics?: string[]
  decisions?: string[]
  actionItems?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

/** UI models may format timestamps and include presentation-only properties. */
export type Folder = { id: string; name: string; color: string }

export type Note = {
  id: string
  title: string
  content: string
  folderId: string
  updatedAt: string
  summary?: string
  keyTopics?: string[]
  decisions?: string[]
  actionItems?: string[]
}

export type Store = { folders: Folder[]; notes: Note[] }
