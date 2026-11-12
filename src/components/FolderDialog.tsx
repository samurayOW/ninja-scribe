import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from './Icon'
import type { Folder } from '../types'

type Props = { onClose: () => void; onSave: (name: string) => void; folder?: Folder }
export function FolderDialog({ onClose, onSave, folder }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(folder?.name ?? '')
  const editing = Boolean(folder)
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (name.trim()) onSave(name.trim()) }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><form className="folder-modal" onSubmit={submit}><header><div><b>{editing ? t('folders.renameTitle') : t('folders.createTitle')}</b><p>{editing ? t('folders.renameSubtitle') : t('folders.createSubtitle')}</p></div><button type="button" className="modal-close" aria-label={t('common.close')} onClick={onClose}><Icon name="close"/></button></header><label htmlFor="folder-name">{t('folders.name')}</label><input id="folder-name" autoFocus maxLength={100} placeholder={t('folders.namePlaceholder')} value={name} onChange={event => setName(event.target.value)}/><footer><button type="button" onClick={onClose}>{t('common.cancel')}</button><button className="filled-button" type="submit" disabled={!name.trim() || name.trim() === folder?.name}>{editing ? t('common.save') : t('folders.createTitle')}</button></footer></form></div>
}
