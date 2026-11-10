import { useState } from 'react'
import type { Folder } from '../types'
import { Icon } from './Icon'

type Props = { folders: Folder[]; noteCounts: Record<string, number>; activeFolder: string; query: string; userName: string; userEmail: string; onFolderSelect: (id: string) => void; onQueryChange: (query: string) => void; onCreateNote: () => void; onAddFolder: () => void; onSignOut: () => void }

export function Sidebar({ folders, noteCounts, activeFolder, query, userName, userEmail, onFolderSelect, onQueryChange, onCreateNote, onAddFolder, onSignOut }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  return <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <header className="sidebar-header"><a className="brand" href="#home" onClick={event => event.preventDefault()}><span className="brand-mark">◆</span><span>NinjaScribe</span></a><button aria-label={collapsed ? 'Розгорнути панель' : 'Згорнути панель'} onClick={() => setCollapsed(value => !value)}>{collapsed ? '»' : '«'}</button></header>
    <div className="sidebar-controls"><button className="new-note" onClick={onCreateNote}><Icon name="plus"/> <span>Нова нотатка</span></button><label className="side-search"><Icon name="search" size={15}/><input aria-label="Пошук нотаток" placeholder="Пошук нотаток…" value={query} onChange={event => onQueryChange(event.target.value)}/></label></div>
    <nav className="folder-nav" aria-label="Папки"><h2>Папки</h2>{folders.map(folder => <button key={folder.id} className={`folder-link ${activeFolder === folder.id ? 'active' : ''}`} onClick={() => onFolderSelect(folder.id)}><Icon name="folder" size={16}/><span>{folder.name}</span><b>{noteCounts[folder.id] ?? 0}</b></button>)}<button className="add-folder" onClick={onAddFolder}><Icon name="plus" size={15}/> Створити папку</button></nav>
    <footer className="profile-footer"><button onClick={onSignOut} title="Вийти з акаунту"><span className="profile-avatar">{userName.split(/\s+/).slice(0, 2).map(part => part[0]?.toLocaleUpperCase()).join('')}</span><span className="profile-copy"><b>{userName}</b><small>{userEmail}</small></span><span className="profile-menu">↪</span></button></footer>
  </aside>
}
