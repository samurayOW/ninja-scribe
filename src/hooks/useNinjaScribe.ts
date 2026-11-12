import { useEffect, useMemo, useState } from "react";
import { initialStore, readStore } from "../data";
import type { Folder, Note, Store } from "../types";

export function useNinjaScribe(userId: string) {
  const storageKey = `ninja-scribe-data:${userId}`;
  const [store, setStore] = useState<Store>(() => readStore(storageKey));
  const [activeFolder, setActiveFolder] = useState(() => {
    const saved = readStore(storageKey);
    return saved.folders.some((folder) => folder.id === "work")
      ? "work"
      : (saved.folders[0]?.id ?? "all");
  });
  const [activeNote, setActiveNote] = useState<string | null>(
    () => readStore(storageKey).notes[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ notes: store.notes }));
  }, [storageKey, store.notes]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredNotes = useMemo(
    () =>
      store.notes.filter(
        (note) =>
          (activeFolder === "all" || note.folderId === activeFolder) &&
          `${note.title} ${note.content}`
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()),
      ),
    [store.notes, activeFolder, query],
  );
  const selectedNote =
    store.notes.find((note) => note.id === activeNote) ?? null;

  function createNote() {
    const folderId =
      activeFolder === "all" ? (store.folders[0]?.id ?? "") : activeFolder;
    const note: Note = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      folderId,
      updatedAt: "Щойно",
    };
    setStore((current) => ({ ...current, notes: [note, ...current.notes] }));
    setActiveNote(note.id);
    return note;
  }
  function saveNote(note: Note) {
    setStore((current) => ({
      ...current,
      notes: current.notes.some((item) => item.id === note.id)
        ? current.notes.map((item) => (item.id === note.id ? note : item))
        : [note, ...current.notes],
    }));
    setActiveFolder(note.folderId);
    setActiveNote(note.id);
    setToast("Нотатку збережено");
  }
  function syncNotes(remoteNotes: Note[]) {
    setStore((current) => {
      const remoteIds = new Set(remoteNotes.map((note) => note.id));
      const merged = [
        ...remoteNotes,
        ...current.notes.filter((note) => !remoteIds.has(note.id)),
      ];
      const same =
        merged.length === current.notes.length &&
        merged.every((note, index) => {
          const previous = current.notes[index];
          return (
            previous?.id === note.id &&
            previous.title === note.title &&
            previous.content === note.content &&
            previous.folderId === note.folderId &&
            previous.updatedAt === note.updatedAt &&
            previous.summary === note.summary &&
            JSON.stringify(previous.keyTopics ?? []) ===
              JSON.stringify(note.keyTopics ?? []) &&
            JSON.stringify(previous.decisions ?? []) ===
              JSON.stringify(note.decisions ?? []) &&
            JSON.stringify(previous.actionItems ?? []) ===
              JSON.stringify(note.actionItems ?? [])
          );
        });
      return same ? current : { ...current, notes: merged };
    });
  }
  function deleteNote(noteId: string) {
    setStore((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== noteId),
    }));
    if (activeNote === noteId) setActiveNote(null);
    setToast("Нотатку видалено");
  }
  function removeNotesInFolder(folderId: string) {
    setStore((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.folderId !== folderId),
    }));
    if (selectedNote?.folderId === folderId) setActiveNote(null);
  }
  function syncFolders(folders: Folder[]) {
    setStore((current) => {
      const byId = new Map(folders.map((folder) => [folder.id, folder]));
      const byName = new Map(
        folders.map((folder) => [
          folder.name.trim().toLocaleLowerCase(),
          folder,
        ]),
      );
      const folderIds = new Map(
        current.folders.map((folder) => [
          folder.id,
          byId.get(folder.id) ??
            byName.get(folder.name.trim().toLocaleLowerCase()),
        ]),
      );
      const migratedNotes = current.notes.map((note) => {
        const folder = folderIds.get(note.folderId);
        return folder && folder.id !== note.folderId
          ? { ...note, folderId: folder.id }
          : note;
      });
      const sameFolders =
        current.folders.length === folders.length &&
        current.folders.every(
          (folder, index) =>
            folder.id === folders[index]?.id &&
            folder.name === folders[index]?.name &&
            folder.color === folders[index]?.color,
        );
      const sameNotes = current.notes.every(
        (note, index) => note.folderId === migratedNotes[index]?.folderId,
      );
      if (sameFolders && sameNotes) return current;
      return { folders, notes: migratedNotes };
    });
  }
  function resetDemo() {
    setStore(initialStore);
    setActiveFolder("work");
    setActiveNote("meeting-2026-05-12");
    setQuery("");
    localStorage.removeItem(storageKey);
    setToast("Демонстраційні дані відновлено");
  }

  return {
    store,
    activeFolder,
    setActiveFolder,
    activeNote,
    setActiveNote,
    query,
    setQuery,
    toast,
    setToast,
    filteredNotes,
    selectedNote,
    createNote,
    saveNote,
    deleteNote,
    removeNotesInFolder,
    syncFolders,
    syncNotes,
    resetDemo,
  };
}
