import { useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { useNinjaScribe } from '../hooks/useNinjaScribe'
import { useUserFolders } from '../hooks/useUserFolders'
import { getAuthErrorMessage, logout } from '../shared/auth'
import { analyzeNote, createUserNote, deleteUserNote, getUserNotes, updateUserNote, type NoteLanguage } from '../shared/notes'
import type { Folder, Note } from '../types'
import { DeleteFolderDialog } from './DeleteFolderDialog'
import { DeleteNoteDialog } from './DeleteNoteDialog'
import { CreateNoteDialog } from './CreateNoteDialog'
import { FolderDialog } from './FolderDialog'
import { NoteWorkspace } from './NoteWorkspace'
import { NotesList } from './NotesList'
import { Sidebar } from './Sidebar'

export function Dashboard({ user }: { user: User }) {
  const notes = useNinjaScribe(user.uid)
  const cloudFolders = useUserFolders(user.uid, notes.store.folders)
  const [editing, setEditing] = useState(false)
  const [editingSummary, setEditingSummary] = useState(false)
  const [showCreateNote, setShowCreateNote] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deletingNote, setDeletingNote] = useState<Note | null>(null)
  const [deleteNoteError, setDeleteNoteError] = useState('')
  const [deleteNoteBusy, setDeleteNoteBusy] = useState(false)
  const [cloudNoteIds, setCloudNoteIds] = useState<Set<string>>(() => new Set())
  const [analyzingNote, setAnalyzingNote] = useState(false)
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
    setShowCreateNote(true)
  }

  async function createNoteInCloud(draft: { title: string; content: string; folderId: string; language: NoteLanguage }) {
    try {
      const analysis = await analyzeNote(draft.content, draft.language, draft.title)
      const note = await createUserNote(user.uid, {
        title: draft.title,
        content: draft.content,
        folderId: draft.folderId,
        ...analysis,
      })
      notes.saveNote(note)
      setCloudNoteIds(current => new Set(current).add(note.id))
      notes.setActiveFolder(note.folderId)
      setShowCreateNote(false)
      notes.setToast('Нотатку проаналізовано та збережено у Firestore')
    } catch (error) {
      if (error instanceof Error && !('code' in error)) throw error
      throw new Error(getAuthErrorMessage(error))
    }
  }

  function saveNote(note: Note) {
    void (async () => {
      try {
        if (cloudNoteIds.has(note.id)) await updateUserNote(user.uid, note)
        notes.saveNote(note)
        setEditing(false)
        setEditingSummary(false)
      } catch (error) {
        notes.setToast(getAuthErrorMessage(error))
      }
    })()
  }

  function requestDeleteNote() {
    const selected = notes.selectedNote
    if (!selected) return
    setDeleteNoteError('')
    setDeletingNote(selected)
  }

  async function confirmDeleteNote() {
    if (!deletingNote) return
    setDeleteNoteBusy(true)
    setDeleteNoteError('')
    try {
      if (cloudNoteIds.has(deletingNote.id)) await deleteUserNote(deletingNote.id)
      notes.deleteNote(deletingNote.id)
      setCloudNoteIds(current => {
        const next = new Set(current)
        next.delete(deletingNote.id)
        return next
      })
      setDeletingNote(null)
      setEditing(false)
      setEditingSummary(false)
    } catch (error) {
      setDeleteNoteError(getAuthErrorMessage(error))
    } finally {
      setDeleteNoteBusy(false)
    }
  }

  function cancelNoteEditing() {
    setEditing(false)
    setEditingSummary(false)
  }

  function editNote() {
    setEditing(true)
    setEditingSummary(false)
  }

  function editNoteSummary() {
    setEditing(false)
    setEditingSummary(true)
  }

  function selectNote(noteId: string) {
    notes.setActiveNote(noteId)
    cancelNoteEditing()
  }

  function selectFolder(folderId: string) {
    notes.setActiveFolder(folderId)
    notes.setActiveNote(null)
    cancelNoteEditing()
  }

  function saveEditedSummary(note: Note) {
    saveNote(note)
  }

  async function reanalyzeSelectedNote() {
    const selected = notes.selectedNote
    if (!selected || analyzingNote) return
    setAnalyzingNote(true)
    try {
      const analysis = await analyzeNote(selected.content, 'uk', selected.title)
      const updatedNote = { ...selected, ...analysis, updatedAt: 'Щойно' }
      if (cloudNoteIds.has(selected.id)) await updateUserNote(user.uid, updatedNote)
      notes.saveNote(updatedNote)
      notes.setToast('AI-підсумок оновлено українською')
    } catch (error) {
      notes.setToast(error instanceof Error && !('code' in error) ? error.message : getAuthErrorMessage(error))
    } finally {
      setAnalyzingNote(false)
    }
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
    let cancelled = false
    void getUserNotes(user.uid)
      .then(remoteNotes => {
        if (cancelled) return
        setCloudNoteIds(new Set(remoteNotes.map(note => note.id)))
        notes.syncNotes(remoteNotes)
      })
      .catch(error => { if (!cancelled) notes.setToast(getAuthErrorMessage(error)) })
    return () => { cancelled = true }
  }, [user.uid])

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
      onFolderSelect={selectFolder}
      onQueryChange={notes.setQuery}
      onCreateNote={createNote}
      onAddFolder={() => setShowFolderDialog(true)}
      onEditFolder={setEditingFolder}
      onDeleteFolder={targetFolder => { setDeletingFolder(targetFolder); setDeleteError('') }}
      onSignOut={() => { void signOutUser() }}
    />
    <NotesList folder={folder} notes={notes.filteredNotes} activeNote={notes.activeNote} onSelect={selectNote} onCreate={createNote}/>
    <NoteWorkspace note={notes.selectedNote} folders={cloudFolders.folders} isEditing={editing} isEditingSummary={editingSummary} isAnalyzing={analyzingNote} onEdit={editNote} onEditSummary={editNoteSummary} onCancel={cancelNoteEditing} onSave={saveNote} onSaveSummary={saveEditedSummary} onDelete={requestDeleteNote} onAnalyze={() => { void reanalyzeSelectedNote() }} onCreate={createNote}/>
    {showFolderDialog && <FolderDialog onClose={() => setShowFolderDialog(false)} onSave={name => { void createFolder(name) }}/>}
    {editingFolder && <FolderDialog key={editingFolder.id} folder={editingFolder} onClose={() => setEditingFolder(null)} onSave={name => { void renameFolder(editingFolder.id, name) }}/>}
    {deletingFolder && <DeleteFolderDialog folder={deletingFolder} busy={deleting} error={deleteError} onClose={() => setDeletingFolder(null)} onConfirm={confirmDeleteFolder}/>}
    {deletingNote && <DeleteNoteDialog note={deletingNote} busy={deleteNoteBusy} error={deleteNoteError} onClose={() => setDeletingNote(null)} onConfirm={confirmDeleteNote}/>}
    {showCreateNote && <CreateNoteDialog folders={cloudFolders.folders} initialFolderId={folder?.id ?? cloudFolders.folders[0]?.id ?? ''} onClose={() => setShowCreateNote(false)} onCreate={createNoteInCloud}/>}
    {(cloudFolders.error || notes.toast) && <div className="toast" role={cloudFolders.error ? 'alert' : 'status'}>{cloudFolders.error || notes.toast}</div>}
  </div>
}
