import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Folder, Note } from '../types'

type Props = { note: Note; folders: Folder[]; onSave: (note: Note) => void; onCancel: () => void }
export function NoteEditor({ note, folders, onSave, onCancel }: Props) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [folderId, setFolderId] = useState(note.folderId)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() && !content.trim()) return
    onSave({ ...note, title: title.trim() || t('editor.untitled'), content: content.trim(), folderId, updatedAt: t('common.justNow') })
  }
  return <form className="note-editor" onSubmit={submit}>
    <div className="editor-toolbar"><label htmlFor="note-folder">{t('editor.folder')}</label><select id="note-folder" value={folderId} onChange={event => setFolderId(event.target.value)}>{folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select><button type="button" onClick={onCancel}>{t('editor.cancel')}</button></div>
    <input className="editor-title" aria-label={t('editor.noteTitle')} placeholder={t('editor.noteTitlePlaceholder')} value={title} onChange={event => setTitle(event.target.value)} maxLength={120}/>
    <div className="editor-section-label">{t('editor.textLabel')}</div><textarea aria-label={t('workspace.text')} placeholder={t('editor.textPlaceholder')} value={content} onChange={event => setContent(event.target.value)}/>
    <footer className="editor-footer"><span>{t('editor.saveHint')}</span><button className="filled-button" type="submit" disabled={!title.trim() && !content.trim()}>{t('editor.saveNote')}</button></footer>
  </form>
}
