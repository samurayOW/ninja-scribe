import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Folder } from '../types'
import { Icon } from './Icon'

type Props = { folder: Folder; busy: boolean; error: string; onClose: () => void; onConfirm: () => Promise<void> }
export function DeleteFolderDialog({ folder, busy, error, onClose, onConfirm }: Props) {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  async function confirm() { setConfirming(true); try { await onConfirm() } finally { setConfirming(false) } }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose() }}><section className="folder-modal delete-folder-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-folder-title" aria-describedby="delete-folder-description"><header><div><b id="delete-folder-title">{t('folders.deleteTitle')}</b><p>{t('folders.irreversible')}</p></div><button type="button" className="modal-close" aria-label={t('common.close')} onClick={onClose} disabled={busy}><Icon name="close"/></button></header><p id="delete-folder-description">{t('folders.deleteDescription', { name: folder.name })}</p>{error && <div className="folder-error" role="alert">{error}</div>}<footer><button type="button" onClick={onClose} disabled={busy}>{t('common.cancel')}</button><button className="danger-button" type="button" disabled={busy} onClick={() => void confirm()}>{busy || confirming ? t('common.deleting') : t('sidebar.delete')}</button></footer></section></div>
}
