import { useState, type FormEvent } from 'react'
import type { Note } from '../types'

type Props = { note: Note; onSave: (note: Note) => void; onCancel: () => void }

function splitItems(value: string): string[] {
  return value.split('\n').map(item => item.trim()).filter(Boolean).slice(0, 100)
}

export function NoteAnalysisEditor({ note, onSave, onCancel }: Props) {
  const [summary, setSummary] = useState(note.summary ?? '')
  const [keyTopics, setKeyTopics] = useState((note.keyTopics ?? []).join('\n'))
  const [decisions, setDecisions] = useState((note.decisions ?? []).join('\n'))
  const [actionItems, setActionItems] = useState((note.actionItems ?? []).join('\n'))

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      ...note,
      summary: summary.trim(),
      keyTopics: splitItems(keyTopics),
      decisions: splitItems(decisions),
      actionItems: splitItems(actionItems),
      updatedAt: 'Щойно',
    })
  }

  return <form className="note-editor analysis-editor" onSubmit={submit}>
    <header className="analysis-editor-heading">
      <div><h2>Редагування AI-підсумку</h2><p>Кожен пункт зі списків введіть з нового рядка.</p></div>
      <button type="button" onClick={onCancel}>Скасувати</button>
    </header>
    <label className="analysis-edit-field">
      <span>Короткий підсумок</span>
      <textarea value={summary} onChange={event => setSummary(event.target.value)} maxLength={10000} rows={4} />
    </label>
    <label className="analysis-edit-field">
      <span>Ключові теми</span>
      <textarea value={keyTopics} onChange={event => setKeyTopics(event.target.value)} maxLength={10000} rows={4} placeholder="Одна тема на рядок" />
    </label>
    <label className="analysis-edit-field">
      <span>Прийняті рішення</span>
      <textarea value={decisions} onChange={event => setDecisions(event.target.value)} maxLength={10000} rows={4} placeholder="Одне рішення на рядок" />
    </label>
    <label className="analysis-edit-field">
      <span>Заплановані дії</span>
      <textarea value={actionItems} onChange={event => setActionItems(event.target.value)} maxLength={10000} rows={4} placeholder="Одна дія на рядок" />
    </label>
    <footer className="editor-footer">
      <span>Зміни збережуться після натискання кнопки</span>
      <button className="filled-button" type="submit">Зберегти підсумок</button>
    </footer>
  </form>
}
