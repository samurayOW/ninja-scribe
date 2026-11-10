import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { app, auth } from './firebase'

const DELETE_BATCH_SIZE = 450

/** Deletes this user's notes in bounded batches before deleting their folder. */
export async function deleteFolderAndNotes(folderId: string): Promise<void> {
  const user = auth?.currentUser
  if (!app || !user) throw new Error('Потрібно увійти, щоб видалити папку.')
  if (!folderId.trim()) throw new Error('Не вказано папку для видалення.')

  const db = getFirestore(app)
  const folderRef = doc(db, 'folders', folderId)
  const folderSnapshot = await getDoc(folderRef)
  if (!folderSnapshot.exists()) return
  if (folderSnapshot.data().userId !== user.uid) {
    throw new Error('Немає доступу до цієї папки.')
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
