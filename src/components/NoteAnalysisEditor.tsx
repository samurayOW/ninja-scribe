import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Note } from '../types'

type Props = { note: Note; onSave: (note: Note) => void; onCancel: () => void }
function splitItems(value: string): string[] { return value.split('\n').map(item => item.trim()).filter(Boolean).slice(0, 100) }
export function NoteAnalysisEditor({ note, onSave, onCancel }: Props) {
  const { t } = useTranslation()
  const [summary, setSummary] = useState(note.summary ?? '')
  const [keyTopics, setKeyTopics] = useState((note.keyTopics ?? []).join('\n'))
  const [decisions, setDecisions] = useState((note.decisions ?? []).join('\n'))
  const [actionItems, setActionItems] = useState((note.actionItems ?? []).join('\n'))
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ ...note, summary: summary.trim(), keyTopics: splitItems(keyTopics), decisions: splitItems(decisions), actionItems: splitItems(actionItems), updatedAt: t('common.justNow') })
  }
  return <form className="note-editor analysis-editor" onSubmit={submit}>
    <header className="analysis-editor-heading"><div><h2>{t('editor.editAnalysis')}</h2><p>{t('editor.listHint')}</p></div><button type="button" onClick={onCancel}>{t('editor.cancel')}</button></header>
    <label className="analysis-edit-field"><span>{t('editor.summary')}</span><textarea value={summary} onChange={event => setSummary(event.target.value)} maxLength={10000} rows={4} /></label>
    <label className="analysis-edit-field"><span>{t('editor.keyTopics')}</span><textarea value={keyTopics} onChange={event => setKeyTopics(event.target.value)} maxLength={10000} rows={4} placeholder={t('editor.keyTopicPlaceholder')} /></label>
    <label className="analysis-edit-field"><span>{t('editor.decisions')}</span><textarea value={decisions} onChange={event => setDecisions(event.target.value)} maxLength={10000} rows={4} placeholder={t('editor.decisionPlaceholder')} /></label>
    <label className="analysis-edit-field"><span>{t('editor.actions')}</span><textarea value={actionItems} onChange={event => setActionItems(event.target.value)} maxLength={10000} rows={4} placeholder={t('editor.actionPlaceholder')} /></label>
    <footer className="editor-footer"><span>{t('editor.saveHint')}</span><button className="filled-button" type="submit">{t('editor.saveSummary')}</button></footer>
  </form>
}
