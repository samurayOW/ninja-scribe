import { useState, type FormEvent } from 'react'
import type { Folder, Note } from '../types'

type Props = { note: Note; folders: Folder[]; onSave: (note: Note) => void; onCancel: () => void }

export function NoteEditor({ note, folders, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [folderId, setFolderId] = useState(note.folderId)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() && !content.trim()) return
    onSave({ ...note, title: title.trim() || 'Нотатка без назви', content: content.trim(), folderId, updatedAt: 'Щойно' })
  }
  return <form className="note-editor" onSubmit={submit}>
    <div className="editor-toolbar"><label htmlFor="note-folder">Папка</label><select id="note-folder" value={folderId} onChange={event => setFolderId(event.target.value)}>{folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select><button type="button" onClick={onCancel}>Скасувати</button></div>
    <input className="editor-title" aria-label="Назва нотатки" placeholder="Назва нотатки" value={title} onChange={event => setTitle(event.target.value)} maxLength={120}/>
    <div className="editor-section-label">ТЕКСТ НОТАТКИ</div><textarea aria-label="Текст нотатки" placeholder="Записуйте думки, рішення та наступні кроки…" value={content} onChange={event => setContent(event.target.value)}/>
    <footer className="editor-footer"><span>Зміни збережуться після натискання кнопки</span><button className="filled-button" type="submit" disabled={!title.trim() && !content.trim()}>Зберегти нотатку</button></footer>
  </form>
}
