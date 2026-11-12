import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Folder } from '../types'
import { Icon } from './Icon'

type Props = { folders: Folder[]; noteCounts: Record<string, number>; activeFolder: string; query: string; userName: string; userEmail: string; onFolderSelect: (id: string) => void; onQueryChange: (query: string) => void; onCreateNote: () => void; onAddFolder: () => void; onEditFolder: (folder: Folder) => void; onDeleteFolder: (folder: Folder) => void; onSignOut: () => void }

export function Sidebar({ folders, noteCounts, activeFolder, query, userName, userEmail, onFolderSelect, onQueryChange, onCreateNote, onAddFolder, onEditFolder, onDeleteFolder, onSignOut }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage === 'uk' ? 'uk' : 'en'
  return <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <header className="sidebar-header"><a className="brand" href="#home" onClick={event => event.preventDefault()}><span className="brand-mark">◆</span><span>NinjaScribe</span></a><button aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')} title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')} onClick={() => setCollapsed(value => !value)}>{collapsed ? '»' : '«'}</button></header>
    <div className="sidebar-controls"><button className="new-note" onClick={onCreateNote}><Icon name="plus"/> <span>{t('sidebar.newNote')}</span></button><label className="side-search"><Icon name="search" size={15}/><input aria-label={t('sidebar.search')} placeholder={t('sidebar.searchPlaceholder')} value={query} onChange={event => onQueryChange(event.target.value)}/></label></div>
    <nav className="folder-nav" aria-label={t('sidebar.folders')}><h2>{t('sidebar.folders')}</h2>{folders.map(folder => <div key={folder.id} className={`folder-row ${activeFolder === folder.id ? 'active' : ''}`}><button className="folder-link" onClick={() => onFolderSelect(folder.id)}><Icon name="folder" size={16}/><span>{folder.name}</span><b>{noteCounts[folder.id] ?? 0}</b></button><button className="folder-menu-trigger" aria-label={t('sidebar.folderActions', { name: folder.name })} aria-expanded={openMenu === folder.id} onClick={() => setOpenMenu(current => current === folder.id ? null : folder.id)}><Icon name="dots" size={17}/></button>{openMenu === folder.id && <div className="folder-menu"><button onClick={() => { setOpenMenu(null); onEditFolder(folder) }}>{t('sidebar.rename')}</button><button className="folder-menu-danger" onClick={() => { setOpenMenu(null); onDeleteFolder(folder) }}>{t('sidebar.delete')}</button></div>}</div>)}<button className="add-folder" onClick={onAddFolder}><Icon name="plus" size={15}/> {t('sidebar.createFolder')}</button></nav>
    <div className="language-switcher" role="group" aria-label={t('common.language')} title={t('common.language')}><span className="language-switcher-label">{t('common.language')}</span><button type="button" aria-label={t('common.english')} aria-pressed={language === 'en'} className={language === 'en' ? 'active' : ''} onClick={() => void i18n.changeLanguage('en')}>{t('common.englishShort')}</button><button type="button" aria-label={t('common.ukrainian')} aria-pressed={language === 'uk'} className={language === 'uk' ? 'active' : ''} onClick={() => void i18n.changeLanguage('uk')}>{t('common.ukrainianShort')}</button></div>
    <footer className="profile-footer"><button onClick={onSignOut} title={t('sidebar.signOut')} aria-label={t('sidebar.signOut')}><span className="profile-avatar">{userName.split(/\s+/).slice(0, 2).map(part => part[0]?.toLocaleUpperCase()).join('')}</span><span className="profile-copy"><b>{userName}</b><small>{userEmail}</small></span><span className="profile-menu">↪</span></button></footer>
  </aside>
}
