import { useEffect, useMemo, useState } from 'react'
import { initialStore, readStore } from '../data'
import type { Folder, Note, Store } from '../types'

export function useNinjaScribe(userId: string) {
  const storageKey = `ninja-scribe-data:${userId}`
  const [store, setStore] = useState<Store>(() => readStore(storageKey))
  const [activeFolder, setActiveFolder] = useState(() => {
    const saved = readStore(storageKey)
    return saved.folders.some(folder => folder.id === 'work') ? 'work' : saved.folders[0]?.id ?? 'all'
  })
  const [activeNote, setActiveNote] = useState<string | null>(() => readStore(storageKey).notes[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(store)) }, [storageKey, store])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const filteredNotes = useMemo(() => store.notes.filter(note =>
    (activeFolder === 'all' || note.folderId === activeFolder) &&
    `${note.title} ${note.content}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  ), [store.notes, activeFolder, query])
  const selectedNote = store.notes.find(note => note.id === activeNote) ?? null

  function createNote() {
    const folderId = activeFolder === 'all' ? store.folders[0]?.id ?? '' : activeFolder
    const note: Note = { id: crypto.randomUUID(), title: '', content: '', folderId, updatedAt: 'Щойно' }
    setStore(current => ({ ...current, notes: [note, ...current.notes] }))
    setActiveNote(note.id)
    return note
  }
  function saveNote(note: Note) {
    setStore(current => ({ ...current, notes: current.notes.some(item => item.id === note.id) ? current.notes.map(item => item.id === note.id ? note : item) : [note, ...current.notes] }))
    setActiveFolder(note.folderId)
    setActiveNote(note.id)
    setToast('Нотатку збережено')
  }
  function deleteNote() {
    if (!selectedNote) return
    setStore(current => ({ ...current, notes: current.notes.filter(note => note.id !== selectedNote.id) }))
    setActiveNote(null)
    setToast('Нотатку видалено')
  }
  function addFolder(name: string) {
    const folder: Folder = { id: crypto.randomUUID(), name, color: ['violet', 'blue', 'mint'][store.folders.length % 3] }
    setStore(current => ({ ...current, folders: [...current.folders, folder] }))
    setActiveFolder(folder.id)
    setActiveNote(null)
    setToast('Папку створено')
  }
  function resetDemo() {
    setStore(initialStore)
    setActiveFolder('work')
    setActiveNote('meeting-2026-05-12')
    setQuery('')
    localStorage.removeItem(storageKey)
    setToast('Демонстраційні дані відновлено')
  }

  return { store, activeFolder, setActiveFolder, activeNote, setActiveNote, query, setQuery, toast, setToast, filteredNotes, selectedNote, createNote, saveNote, deleteNote, addFolder, resetDemo }
}
