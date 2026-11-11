import { useState, type FormEvent } from 'react'
import { Icon } from './Icon'
import type { Folder } from '../types'

type Props = { onClose: () => void; onSave: (name: string) => void; folder?: Folder }

export function FolderDialog({ onClose, onSave, folder }: Props) {
  const [name, setName] = useState(folder?.name ?? '')
  const editing = Boolean(folder)
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (name.trim()) onSave(name.trim()) }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><form className="folder-modal" onSubmit={submit}><header><div><b>{editing ? 'Перейменувати папку' : 'Створити папку'}</b><p>{editing ? 'Змініть назву папки.' : 'Згрупуйте нотатки за темою.'}</p></div><button type="button" className="modal-close" aria-label="Закрити" onClick={onClose}><Icon name="close"/></button></header><label htmlFor="folder-name">Назва папки</label><input id="folder-name" autoFocus maxLength={100} placeholder="Наприклад, Робота" value={name} onChange={event => setName(event.target.value)}/><footer><button type="button" onClick={onClose}>Скасувати</button><button className="filled-button" type="submit" disabled={!name.trim() || name.trim() === folder?.name}>{editing ? 'Зберегти зміни' : 'Створити папку'}</button></footer></form></div>
}
