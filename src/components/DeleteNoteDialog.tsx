import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
            <b id="delete-note-title">{t("deleteNote.title")}</b>
            <p>{t("deleteNote.irreversible")}</p>
          </div>
          <button
            type="button"
            className="modal-close"
            aria-label={t("common.close")}
            onClick={onClose}
            disabled={busy}
          >
            <Icon name="close" />
          </button>
        </header>
        <p id="delete-note-description">{t("deleteNote.description")}</p>
        {error && (
          <div className="folder-error" role="alert">
            {error}
          </div>
        )}
        <footer>
          <button type="button" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </button>
          <button
            className="danger-button"
            type="button"
            disabled={busy}
            onClick={() => void confirm()}
          >
            {busy || confirming ? t("common.deleting") : t("sidebar.delete")}
          </button>
        </footer>
      </section>
    </div>
  );
}
