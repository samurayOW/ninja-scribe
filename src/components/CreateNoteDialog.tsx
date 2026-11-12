import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Folder } from '../types'
import type { NoteLanguage } from '../shared/notes'

type NoteDraft = { title: string; content: string; folderId: string; language: NoteLanguage }
type Props = {
  folders: Folder[]
  initialFolderId: string
  onClose: () => void
  onCreate: (draft: NoteDraft) => Promise<void>
}

export function CreateNoteDialog({ folders, initialFolderId, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [folderId, setFolderId] = useState(initialFolderId)
  const [language, setLanguage] = useState<NoteLanguage>('uk')
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 100_000) {
      setError('Файл має бути не більшим за 100 КБ.')
      event.target.value = ''
      return
    }
    try {
      const text = await file.text()
      setContent(current => current.trim() ? `${current}\n\n${text}` : text)
      setFileName(file.name)
      setError('')
    } catch {
      setError('Не вдалося прочитати файл. Вставте текст у поле вручну.')
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onCreate({ title: title.trim(), content: content.trim(), folderId, language })
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Не вдалося створити нотатку.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="modal-backdrop note-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="create-note-modal" role="dialog" aria-modal="true" aria-labelledby="create-note-title">
      <header>
        <h2 id="create-note-title">Нова нотатка</h2>
        <button type="button" className="modal-close" aria-label="Закрити" onClick={onClose} disabled={busy}>✕</button>
      </header>
      <form id="create-note-form" onSubmit={event => { void submit(event) }}>
        <label className="note-form-field">
          <span>Назва</span>
          <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Наприклад, Зустріч з командою" maxLength={200} required autoFocus />
        </label>
        <label className="note-form-field">
          <span>Папка</span>
          <select value={folderId} onChange={event => setFolderId(event.target.value)} required>
            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
          </select>
        </label>
        <label className="note-form-field">
          <span>Мова нотатки</span>
          <select value={language} onChange={event => setLanguage(event.target.value as NoteLanguage)}>
            <option value="uk">Українська</option>
            <option value="en">English</option>
            <option value="pl">Polski</option>
          </select>
        </label>
        <label className="note-form-field">
          <span>Текст нотатки</span>
          <textarea value={content} onChange={event => setContent(event.target.value)} rows={8} maxLength={100000} required placeholder="Вставте текст протоколу зустрічі або введіть його вручну…" />
          <small>До 100 000 символів. Текстовий файл можна завантажити нижче.</small>
        </label>
        <label className="note-form-field note-file-field">
          <span>Завантажити текстовий файл</span>
          <input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={event => { void loadFile(event) }} />
          {fileName && <small>Додано: {fileName}</small>}
        </label>
        {error && <p className="note-form-error" role="alert">{error}</p>}
      </form>
      <footer>
        <button type="button" className="note-modal-cancel" onClick={onClose} disabled={busy}>Скасувати</button>
        <button type="submit" form="create-note-form" className="filled-button" disabled={busy || !title.trim() || !content.trim() || !folderId}>
          {busy ? 'Аналізуємо…' : 'Створити нотатку'}
        </button>
      </footer>
    </section>
  </div>
}
