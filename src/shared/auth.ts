import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'
import i18n from '../i18n'

function getAuthInstance() {
  if (!auth) throw new Error(i18n.t('errors.firebaseNotConfigured'))
  return auth
}

async function ensureUserProfile(user: User): Promise<void> {
  const { saveUserProfile } = await import('./userProfile')
  await saveUserProfile(user)
}

export async function registerWithEmail(name: string, email: string, password: string): Promise<User> {
  const authInstance = getAuthInstance()
  const credential = await createUserWithEmailAndPassword(authInstance, email, password)
  try {
    await updateProfile(credential.user, { displayName: name })
    await ensureUserProfile(credential.user)
    return credential.user
  } catch (error) {
    await signOut(authInstance).catch(() => undefined)
    throw error
  }
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const authInstance = getAuthInstance()
  const credential = await signInWithEmailAndPassword(authInstance, email, password)
  try {
    await ensureUserProfile(credential.user)
    return credential.user
  } catch (error) {
    await signOut(authInstance).catch(() => undefined)
    throw error
  }
}

export async function logout(): Promise<void> {
  await signOut(getAuthInstance())
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getAuthInstance(), email)
}

export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  switch (code) {
    case 'auth/email-already-in-use': return i18n.t('errors.authEmailInUse')
    case 'auth/invalid-email': return i18n.t('errors.authInvalidEmail')
    case 'auth/weak-password': return i18n.t('errors.authWeakPassword')
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return i18n.t('errors.authInvalidCredentials')
    case 'auth/too-many-requests': return i18n.t('errors.authTooMany')
    case 'auth/network-request-failed': return i18n.t('errors.authNetwork')
    case 'auth/operation-not-allowed': return i18n.t('errors.authProviderDisabled')
    case 'auth/user-disabled': return i18n.t('errors.authDisabled')
    case 'permission-denied': return i18n.t('errors.permissionDenied')
    case 'unavailable': return i18n.t('errors.unavailable')
    default:
      if (error instanceof Error && error.message && !('code' in error)) return error.message
      return i18n.t('errors.request')
  }
}
