import { useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { useNinjaScribe } from '../hooks/useNinjaScribe'
import { useUserFolders } from '../hooks/useUserFolders'
import { getAuthErrorMessage, logout } from '../shared/auth'
import type { Folder } from '../types'
import { DeleteFolderDialog } from './DeleteFolderDialog'
import { FolderDialog } from './FolderDialog'
import { NoteWorkspace } from './NoteWorkspace'
import { NotesList } from './NotesList'
import { Sidebar } from './Sidebar'

export function Dashboard({ user }: { user: User }) {
  const notes = useNinjaScribe(user.uid)
  const cloudFolders = useUserFolders(user.uid, notes.store.folders)
  const [editing, setEditing] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const folder = cloudFolders.folders.find(item => item.id === notes.activeFolder)
  const noteCounts = useMemo(
    () => Object.fromEntries(cloudFolders.folders.map(item => [
      item.id,
      notes.store.notes.filter(note => note.folderId === item.id).length,
    ])),
    [cloudFolders.folders, notes.store.notes],
  )
  const displayName = user.displayName?.trim() || user.email?.split('@')[0] || 'Користувач'

  function createNote() {
    if (cloudFolders.folders.length === 0) {
      notes.setToast('Спочатку створіть папку для нотаток.')
      return
    }
    notes.createNote()
    setEditing(true)
  }

  function saveNote(note: Parameters<typeof notes.saveNote>[0]) {
    notes.saveNote(note)
    setEditing(false)
  }

  async function createFolder(name: string) {
    try {
      const newFolder = await cloudFolders.create(name)
      notes.setActiveFolder(newFolder.id)
      notes.setActiveNote(null)
      setShowFolderDialog(false)
      notes.setToast('Папку створено')
    } catch (error) {
      notes.setToast(getAuthErrorMessage(error))
    }
  }

  async function renameFolder(folderId: string, name: string) {
    try {
      await cloudFolders.rename(folderId, name)
      setEditingFolder(null)
      notes.setToast('Назву папки оновлено')
    } catch (error) {
      notes.setToast(getAuthErrorMessage(error))
    }
  }

  async function confirmDeleteFolder() {
    if (!deletingFolder) return
    if (cloudFolders.folders.length <= 1) {
      setDeleteError('Спочатку створіть іншу папку, щоб видалити останню.')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await cloudFolders.remove(deletingFolder.id)
      notes.removeNotesInFolder(deletingFolder.id)
      if (notes.activeFolder === deletingFolder.id) {
        const nextFolder = cloudFolders.folders.find(item => item.id !== deletingFolder.id)
        notes.setActiveFolder(nextFolder?.id ?? 'all')
      }
      setDeletingFolder(null)
      notes.setToast('Папку та її нотатки видалено')
    } catch (error) {
      setDeleteError(getAuthErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  async function signOutUser() {
    try { await logout() } catch (error) { notes.setToast(getAuthErrorMessage(error)) }
  }

  useEffect(() => {
    if (cloudFolders.loading) return
    notes.syncFolders(cloudFolders.folders)
    const previousSelection = notes.store.folders.find(item => item.id === notes.activeFolder)
    const nextFolder = cloudFolders.folders.find(item => item.id === notes.activeFolder)
      ?? cloudFolders.folders.find(item => item.name.trim().toLocaleLowerCase() === previousSelection?.name.trim().toLocaleLowerCase())
      ?? cloudFolders.folders[0]
    if (nextFolder && nextFolder.id !== notes.activeFolder) notes.setActiveFolder(nextFolder.id)
  }, [cloudFolders.folders, cloudFolders.loading])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') { event.preventDefault(); createNote() }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.querySelector<HTMLInputElement>('.side-search input')?.focus() }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  })

  return <div className="app-shell">
    <Sidebar
      folders={cloudFolders.folders}
      noteCounts={noteCounts}
      activeFolder={notes.activeFolder}
      query={notes.query}
      userName={displayName}
      userEmail={user.email ?? ''}
      onFolderSelect={id => { notes.setActiveFolder(id); notes.setActiveNote(null); setEditing(false) }}
      onQueryChange={notes.setQuery}
      onCreateNote={createNote}
      onAddFolder={() => setShowFolderDialog(true)}
      onEditFolder={setEditingFolder}
      onDeleteFolder={targetFolder => { setDeletingFolder(targetFolder); setDeleteError('') }}
      onSignOut={() => { void signOutUser() }}
    />
    <NotesList folder={folder} notes={notes.filteredNotes} activeNote={notes.activeNote} onSelect={id => { notes.setActiveNote(id); setEditing(false) }} onCreate={createNote}/>
    <NoteWorkspace note={notes.selectedNote} folders={cloudFolders.folders} isEditing={editing} onEdit={() => setEditing(true)} onCancel={() => setEditing(false)} onSave={saveNote} onDelete={() => { notes.deleteNote(); setEditing(false) }} onAnalyze={() => notes.setToast('AI-підсумки з’являться після налаштування Firebase AI Logic')} onCreate={createNote}/>
    {showFolderDialog && <FolderDialog onClose={() => setShowFolderDialog(false)} onSave={name => { void createFolder(name) }}/>}
    {editingFolder && <FolderDialog key={editingFolder.id} folder={editingFolder} onClose={() => setEditingFolder(null)} onSave={name => { void renameFolder(editingFolder.id, name) }}/>}
    {deletingFolder && <DeleteFolderDialog folder={deletingFolder} busy={deleting} error={deleteError} onClose={() => setDeletingFolder(null)} onConfirm={confirmDeleteFolder}/>}
    {(cloudFolders.error || notes.toast) && <div className="toast" role={cloudFolders.error ? 'alert' : 'status'}>{cloudFolders.error || notes.toast}</div>}
  </div>
}
