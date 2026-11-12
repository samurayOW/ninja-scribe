import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Folder, Note } from '../types'
import { Icon } from './Icon'
import { NoteAnalysisEditor } from './NoteAnalysisEditor'
import { NoteEditor } from './NoteEditor'

type Props = { note: Note | null; folders: Folder[]; isEditing: boolean; isEditingSummary: boolean; isAnalyzing?: boolean; onEdit: () => void; onEditSummary: () => void; onCancel: () => void; onSave: (note: Note) => void; onSaveSummary: (note: Note) => void; onDelete: () => void; onAnalyze: () => void; onCreate: () => void }
function AnalysisSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return <section className="analysis-section"><h4>{title}</h4><ul>{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></section>
}
function getNotePreview(content: string): { text: string; truncated: boolean } {
  const normalized = content.trim()
  const maxLength = 700
  const sentenceBoundary = /[.!?]+["'»”)]*(?=\s|$)/g
  let sentenceCount = 0
  let thirdSentenceEnd = 0
  for (const match of normalized.matchAll(sentenceBoundary)) {
    sentenceCount += 1
    if (sentenceCount === 3) { thirdSentenceEnd = (match.index ?? 0) + match[0].length; break }
  }
  let previewEnd = thirdSentenceEnd > 0 && thirdSentenceEnd <= maxLength ? thirdSentenceEnd : normalized.length <= maxLength ? normalized.length : maxLength
  if (previewEnd === maxLength && normalized.length > maxLength) { const lastSpace = normalized.lastIndexOf(' ', maxLength); if (lastSpace > maxLength / 2) previewEnd = lastSpace }
  const text = normalized.slice(0, previewEnd).trimEnd()
  return { text: text + (previewEnd < normalized.length ? '…' : ''), truncated: previewEnd < normalized.length }
}
function NoteText({ content }: { content: string }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const preview = getNotePreview(content)
  const visibleText = expanded ? content : preview.text
  return <><div className="note-copy">{visibleText ? visibleText.split('\n').map((line, index) => <p key={index}>{line || <br/>}</p>) : <p className="muted">{t('workspace.emptyText')}</p>}</div>{preview.truncated && <button className="expand-note-button" type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? t('workspace.collapse') : t('workspace.expand')}</button>}</>
}
export function NoteWorkspace({ note, folders, isEditing, isEditingSummary, isAnalyzing = false, onEdit, onEditSummary, onCancel, onSave, onSaveSummary, onDelete, onAnalyze, onCreate }: Props) {
  const { t } = useTranslation()
  if (!note) return <main className="note-workspace workspace-empty"><div className="empty-note-icon"><Icon name="note" size={30}/></div><h2>{t('workspace.chooseNote')}</h2><p>{t('workspace.chooseDescription')}</p><button className="filled-button" onClick={onCreate}><Icon name="plus" size={16}/> {t('common.newNote')}</button></main>
  if (isEditingSummary) return <main className="note-workspace"><NoteAnalysisEditor key={`${note.id}-analysis`} note={note} onSave={onSaveSummary} onCancel={onCancel}/></main>
  if (isEditing) return <main className="note-workspace"><NoteEditor key={note.id} note={note} folders={folders} onSave={onSave} onCancel={onCancel}/></main>
  const folder = folders.find(item => item.id === note.folderId)
  return <main className="note-workspace">
    <header className="workspace-heading"><div className="workspace-title"><span>{folder?.name ?? t('workspace.folderFallback')}</span><Icon name="chevron" size={14}/><h2 id="note-title">{note.title || t('common.untitledNote')}</h2></div><div className="workspace-actions"><button aria-label={t('workspace.editNote')} title={t('workspace.editText')} onClick={onEdit}><Icon name="edit" size={16}/></button><button aria-label={t('workspace.deleteNote')} title={t('workspace.deleteNote')} onClick={onDelete}><Icon name="trash" size={16}/></button></div></header>
    <p className="note-date">{note.updatedAt} · {t('workspace.updated')} {note.updatedAt}</p>
    <article className="note-body"><h3 className="section-label">{t('workspace.text')}</h3><NoteText key={note.id} content={note.content}/></article>
    <hr className="workspace-divider"/>
    <section className="analysis-panel" aria-labelledby="analysis-title"><header className="analysis-heading"><h3 id="analysis-title"><Icon name="spark" size={18}/> {t('workspace.analysisResults')}</h3><span>Gemini</span></header>
      {note.summary || note.keyTopics?.length || note.decisions?.length || note.actionItems?.length ? <div className="analysis-content">{note.summary && <p className="analysis-summary">{note.summary}</p>}<AnalysisSection title={t('workspace.keyTopics')} items={note.keyTopics ?? []}/><AnalysisSection title={t('workspace.decisions')} items={note.decisions ?? []}/><AnalysisSection title={t('workspace.actionItems')} items={note.actionItems ?? []}/></div> : <p className="analysis-empty">{t('workspace.analysisEmpty')}</p>}
      <footer className="analysis-footer"><p>{t('workspace.analysisCaveat')}</p><div><button onClick={onEditSummary}>{t('workspace.editSummary')}</button><button className="quiet-button" onClick={onAnalyze} disabled={isAnalyzing}>{isAnalyzing ? t('workspace.analyzing') : t('workspace.reanalyze')}</button></div></footer>
    </section>
    <button className="filled-button analyze-button" onClick={onAnalyze} disabled={isAnalyzing}><Icon name="spark" size={16}/> {isAnalyzing ? t('workspace.analyzing') : t('workspace.runAnalysis')}</button>
  </main>
}
