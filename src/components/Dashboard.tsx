import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { getAuthErrorMessage, logout } from "../shared/auth";
import { FolderDialog } from "./FolderDialog";
import { NoteWorkspace } from "./NoteWorkspace";
import { NotesList } from "./NotesList";
import { Sidebar } from "./Sidebar";
import { useNinjaScribe } from "../hooks/useNinjaScribe";

export function Dashboard({ user }: { user: User }) {
  const notes = useNinjaScribe(user.uid);
  const [editing, setEditing] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const folder = notes.store.folders.find(
    (item) => item.id === notes.activeFolder,
  );
  const noteCounts = useMemo(
    () =>
      Object.fromEntries(
        notes.store.folders.map((item) => [
          item.id,
          notes.store.notes.filter((note) => note.folderId === item.id).length,
        ]),
      ),
    [notes.store],
  );
  const displayName =
    user.displayName?.trim() || user.email?.split("@")[0] || "Користувач";

  function createNote() {
    notes.createNote();
    setEditing(true);
  }
  function saveNote(note: Parameters<typeof notes.saveNote>[0]) {
    notes.saveNote(note);
    setEditing(false);
  }
  async function signOutUser() {
    try {
      await logout();
    } catch (error) {
      notes.setToast(getAuthErrorMessage(error));
    }
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        createNote();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".side-search input")?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  return (
    <div className="app-shell">
      <Sidebar
        folders={notes.store.folders}
        noteCounts={noteCounts}
        activeFolder={notes.activeFolder}
        query={notes.query}
        userName={displayName}
        userEmail={user.email ?? ""}
        onFolderSelect={(id) => {
          notes.setActiveFolder(id);
          notes.setActiveNote(null);
          setEditing(false);
        }}
        onQueryChange={notes.setQuery}
        onCreateNote={createNote}
        onAddFolder={() => setShowFolderDialog(true)}
        onSignOut={() => {
          void signOutUser();
        }}
      />
      <NotesList
        folder={folder}
        notes={notes.filteredNotes}
        activeNote={notes.activeNote}
        onSelect={(id) => {
          notes.setActiveNote(id);
          setEditing(false);
        }}
        onCreate={createNote}
      />
      <NoteWorkspace
        note={notes.selectedNote}
        folders={notes.store.folders}
        isEditing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onSave={saveNote}
        onDelete={() => {
          notes.deleteNote();
          setEditing(false);
        }}
        onAnalyze={() =>
          notes.setToast(
            "AI-підсумки з’являться після налаштування Firebase AI Logic",
          )
        }
        onCreate={createNote}
      />
      {showFolderDialog && (
        <FolderDialog
          onClose={() => setShowFolderDialog(false)}
          onCreate={(name) => {
            notes.addFolder(name);
            setShowFolderDialog(false);
          }}
        />
      )}
      {notes.toast && (
        <div className="toast" role="status">
          {notes.toast}
        </div>
      )}
    </div>
  );
}
