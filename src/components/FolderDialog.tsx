import { useState, type FormEvent } from 'react'
import { Icon } from './Icon'

export function FolderDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (name.trim()) onCreate(name.trim()) }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><form className="folder-modal" onSubmit={submit}><header><div><b>Створити папку</b><p>Згрупуйте нотатки за темою.</p></div><button type="button" className="modal-close" aria-label="Закрити" onClick={onClose}><Icon name="close"/></button></header><label htmlFor="folder-name">Назва папки</label><input id="folder-name" autoFocus maxLength={48} placeholder="Наприклад, Робота" value={name} onChange={event => setName(event.target.value)}/><footer><button type="button" onClick={onClose}>Скасувати</button><button className="filled-button" type="submit" disabled={!name.trim()}>Створити папку</button></footer></form></div>
}
