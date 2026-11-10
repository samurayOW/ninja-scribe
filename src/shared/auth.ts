import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

function getAuthInstance() {
  if (!auth) throw new Error('Firebase ще не налаштовано. Додайте параметри Firebase у файл .env.')
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
    case 'auth/email-already-in-use': return 'Для цієї електронної пошти вже створено акаунт.'
    case 'auth/invalid-email': return 'Перевірте формат електронної пошти.'
    case 'auth/weak-password': return 'Пароль надто простий. Використайте щонайменше 8 символів.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Неправильна електронна пошта або пароль.'
    case 'auth/too-many-requests': return 'Забагато спроб. Спробуйте пізніше.'
    case 'auth/network-request-failed': return 'Не вдалося з’єднатися. Перевірте інтернет і спробуйте ще раз.'
    case 'auth/operation-not-allowed': return 'У Firebase Console не ввімкнено вхід через Email/Password.'
    case 'auth/user-disabled': return 'Цей акаунт вимкнено. Зверніться до адміністратора.'
    case 'permission-denied': return 'Firestore відхилив запит. Опублікуйте правила з файлу firestore.rules у Firebase Console.'
    case 'unavailable': return 'Firebase тимчасово недоступний. Спробуйте ще раз.'
    default:
      if (error instanceof Error && error.message.startsWith('Firebase ще не налаштовано')) return error.message
      return 'Не вдалося виконати запит. Спробуйте ще раз.'
  }
}
