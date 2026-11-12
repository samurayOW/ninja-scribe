import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { auth, isFirebaseConfigured } from './shared/firebase'
import './App.css'

function App() {
  const { t, i18n } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [checkingSession, setCheckingSession] = useState(isFirebaseConfigured)
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    function onPopState() { setPath(window.location.pathname) }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setCheckingSession(false)
    }, () => setCheckingSession(false))
  }, [])

  function navigate(nextPath: string) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  useEffect(() => {
    if (user && (path === '/login' || path === '/register')) navigate('/')
    else if (!user && path !== '/login' && path !== '/register') navigate('/login')
  }, [user, path])

  useEffect(() => {
    document.title = t('meta.title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'))
    document.documentElement.lang = i18n.resolvedLanguage ?? 'en'
  }, [i18n.resolvedLanguage, t])

  if (checkingSession) return <main className="auth-loading"><span className="loading-spinner"/><p>{t('auth.sessionChecking')}</p></main>
  if (!user) return <AuthScreen mode={path === '/register' ? 'register' : 'login'} onNavigate={navigate}/>
  return <Dashboard user={user}/>
}

export default App
