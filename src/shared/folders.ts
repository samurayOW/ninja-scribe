import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import type { Folder } from '../types'
import { app, auth } from './firebase'
import i18n from '../i18n'

const DELETE_BATCH_SIZE = 450
const folderColors = ['violet', 'blue', 'mint']

function getFolderColor(id: string): string {
  const hash = [...id].reduce((value, character) => value + character.charCodeAt(0), 0)
  return folderColors[hash % folderColors.length]
}

function getFolderCollection() {
  if (!app || !auth?.currentUser) throw new Error(i18n.t('errors.firebaseLoginRequired'))
  return { db: getFirestore(app), user: auth.currentUser }
}

function toFolder(id: string, data: Record<string, unknown>, userId: string): Folder | null {
  if (typeof data.name !== 'string' || data.userId !== userId) return null
  return { id, name: data.name, color: getFolderColor(id) }
}

export async function getUserFolders(userId: string, localFolders: Folder[]): Promise<Folder[]> {
  const { db, user } = getFolderCollection()
  if (user.uid !== userId) throw new Error(i18n.t('errors.otherUserFolders'))
  const ownedFolders = query(collection(db, 'folders'), where('userId', '==', user.uid))
  let snapshot = await getDocs(ownedFolders)
  if (snapshot.empty && localFolders.length > 0) {
    const batch = writeBatch(db)
    localFolders.forEach(folder => {
      const seedId = `${user.uid}_${encodeURIComponent(folder.id)}`
      batch.set(doc(db, 'folders', seedId), {
        name: folder.name.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })
    try {
      await batch.commit()
    } catch (error) {
      // Another signed-in tab may have initialized these folders first.
      snapshot = await getDocs(ownedFolders)
      if (snapshot.empty) throw error
    }
    if (snapshot.empty) snapshot = await getDocs(ownedFolders)
  }
  return snapshot.docs.flatMap(folder => {
    const item = toFolder(folder.id, folder.data(), user.uid)
    return item ? [item] : []
  })
}

export async function createUserFolder(name: string): Promise<Folder> {
  const { db, user } = getFolderCollection()
  const cleanName = name.trim()
  if (!cleanName || cleanName.length > 100) throw new Error(i18n.t('errors.folderName'))
  const folderRef = doc(collection(db, 'folders'))
  await setDoc(folderRef, {
    name: cleanName,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { id: folderRef.id, name: cleanName, color: getFolderColor(folderRef.id) }
}

export async function renameUserFolder(folderId: string, name: string): Promise<void> {
  const { db } = getFolderCollection()
  const cleanName = name.trim()
  if (!cleanName || cleanName.length > 100) throw new Error(i18n.t('errors.folderName'))
  await updateDoc(doc(db, 'folders', folderId), {
    name: cleanName,
    updatedAt: serverTimestamp(),
  })
}

/** Deletes this user's notes in bounded batches before deleting their folder. */
export async function deleteFolderAndNotes(folderId: string): Promise<void> {
  const { db, user } = getFolderCollection()
  if (!folderId.trim()) throw new Error(i18n.t('errors.folderMissing'))

  const folderRef = doc(db, 'folders', folderId)
  const folderSnapshot = await getDoc(folderRef)
  if (!folderSnapshot.exists()) return
  if (folderSnapshot.data().userId !== user.uid) {
    throw new Error(i18n.t('errors.folderAccess'))
  }

  const notesQuery = query(
    collection(db, 'notes'),
    where('userId', '==', user.uid),
    where('folderId', '==', folderId),
    limit(DELETE_BATCH_SIZE),
  )

  while (true) {
    const noteSnapshot = await getDocs(notesQuery)
    if (noteSnapshot.empty) break

    const batch = writeBatch(db)
    noteSnapshot.docs.forEach(note => batch.delete(note.ref))
    await batch.commit()
  }

  await deleteDoc(folderRef)
}
