import { useCallback, useEffect, useRef, useState } from 'react'
import type { Folder } from '../types'

export function useUserFolders(userId: string, localFolders: Folder[]) {
  const localFoldersAtStartup = useRef(localFolders)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { getUserFolders } = await import('../shared/folders')
      setFolders(await getUserFolders(userId, localFoldersAtStartup.current))
    } catch {
      setError('Не вдалося завантажити папки. Перевірте підключення Firebase та опубліковані Firestore rules.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { void refresh() }, [refresh])

  const create = useCallback(async (name: string) => {
    const { createUserFolder } = await import('../shared/folders')
    const folder = await createUserFolder(name)
    setFolders(current => [...current, folder])
    return folder
  }, [])

  const rename = useCallback(async (folderId: string, name: string) => {
    const { renameUserFolder } = await import('../shared/folders')
    await renameUserFolder(folderId, name)
    setFolders(current => current.map(folder => folder.id === folderId ? { ...folder, name: name.trim() } : folder))
  }, [])

  const remove = useCallback(async (folderId: string) => {
    const { deleteFolderAndNotes } = await import('../shared/folders')
    await deleteFolderAndNotes(folderId)
    setFolders(current => current.filter(folder => folder.id !== folderId))
  }, [])

  return { folders, loading, error, create, rename, remove, refresh }
}
