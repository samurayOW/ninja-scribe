import type { Folder, Note } from '../types'
import { Icon } from './Icon'

type Props = { folder: Folder | undefined; notes: Note[]; activeNote: string | null; onSelect: (id: string) => void; onCreate: () => void }

export function NotesList({ folder, notes, activeNote, onSelect, onCreate }: Props) {
  return <section className="notes-list-panel" aria-labelledby="notes-list-title">
    <header className="list-header"><div><h1 id="notes-list-title">{folder?.name ?? 'Усі нотатки'}</h1><p>{notes.length} нотаток · оновлено сьогодні</p></div><button className="plain-icon" aria-label="Створити нотатку" onClick={onCreate}><Icon name="plus" size={18}/></button></header>
    {notes.length ? <ul className="note-cards">{notes.map(note => <li key={note.id}><button className={`note-card ${activeNote === note.id ? 'active' : ''}`} onClick={() => onSelect(note.id)}><h3>{note.title || 'Нова нотатка'}</h3><time>{note.updatedAt}</time><p>{note.content.slice(0, 90) || 'Почніть записувати думки…'}{note.content.length > 90 ? '…' : ''}</p>{((note.decisions?.length ?? 0) > 0 || (note.actionItems?.length ?? 0) > 0) && <div className="note-chips">{(note.decisions?.length ?? 0) > 0 && <span>{note.decisions?.length} рішення</span>}{(note.actionItems?.length ?? 0) > 0 && <span>{note.actionItems?.length} дій</span>}</div>}</button></li>)}</ul> : <div className="list-empty"><Icon name="note" size={22}/><b>Нотаток немає</b><button onClick={onCreate}>Створити першу нотатку</button></div>}
  </section>
}
