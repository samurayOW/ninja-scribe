import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { app } from './firebase'

export async function saveUserProfile(user: User): Promise<void> {
  if (!app) return
  const db = getFirestore(app)
  const profileRef = doc(db, 'users', user.uid)
  const existingProfile = await getDoc(profileRef)
  const profile = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    updatedAt: serverTimestamp(),
  }
  await setDoc(profileRef, existingProfile.exists()
    ? profile
    : { ...profile, createdAt: serverTimestamp() }, { merge: true })
}
