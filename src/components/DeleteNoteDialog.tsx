import { useState } from "react";
import type { Note } from "../types";
import { Icon } from "./Icon";

type Props = {
  note: Note;
  busy: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteNoteDialog({ busy, error, onClose, onConfirm }: Props) {
  const [confirming, setConfirming] = useState(false);

  async function confirm() {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="folder-modal delete-folder-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-note-title"
        aria-describedby="delete-note-description"
      >
        <header>
          <div>
            <b id="delete-note-title">Видалити нотатку?</b>
            <p>Цю дію не можна скасувати.</p>
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label="Закрити"
            onClick={onClose}
            disabled={busy}
          >
            <Icon name="close" />
          </button>
        </header>
        <p id="delete-note-description">Нотатку буде видалено.</p>
        {error && (
          <div className="folder-error" role="alert">
            {error}
          </div>
        )}
        <footer>
          <button type="button" onClick={onClose} disabled={busy}>
            Скасувати
          </button>
          <button
            className="danger-button"
            type="button"
            disabled={busy}
            onClick={() => void confirm()}
          >
            {busy || confirming ? "Видаляємо…" : "Видалити нотатку"}
          </button>
        </footer>
      </section>
    </div>
  );
}
