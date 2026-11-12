import { useTranslation } from 'react-i18next'
import type { Folder, Note } from '../types'
import { Icon } from './Icon'

type Props = { folder: Folder | undefined; notes: Note[]; activeNote: string | null; onSelect: (id: string) => void; onCreate: () => void }

export function NotesList({ folder, notes, activeNote, onSelect, onCreate }: Props) {
  const { t } = useTranslation()
  return <section className="notes-list-panel" aria-labelledby="notes-list-title">
    <header className="list-header"><div><h1 id="notes-list-title">{folder?.name ?? t('sidebar.allNotes')}</h1><p>{t('notesList.updatedToday', { count: notes.length })}</p></div><button className="plain-icon" aria-label={t('notesList.createNote')} onClick={onCreate}><Icon name="plus" size={18}/></button></header>
    {notes.length ? <ul className="note-cards">{notes.map(note => <li key={note.id}><button className={`note-card ${activeNote === note.id ? 'active' : ''}`} onClick={() => onSelect(note.id)}><h3>{note.title || t('notesList.untitled')}</h3><time>{note.updatedAt}</time><p>{note.content.slice(0, 90) || t('notesList.contentPlaceholder')}{note.content.length > 90 ? '…' : ''}</p>{((note.decisions?.length ?? 0) > 0 || (note.actionItems?.length ?? 0) > 0) && <div className="note-chips">{(note.decisions?.length ?? 0) > 0 && <span>{t('notesList.decision', { count: note.decisions?.length })}</span>}{(note.actionItems?.length ?? 0) > 0 && <span>{t('notesList.action', { count: note.actionItems?.length })}</span>}</div>}</button></li>)}</ul> : <div className="list-empty"><Icon name="note" size={22}/><b>{t('notesList.empty')}</b><button onClick={onCreate}>{t('notesList.createFirst')}</button></div>}
  </section>
}
