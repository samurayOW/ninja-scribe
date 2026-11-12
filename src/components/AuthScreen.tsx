import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  getAuthErrorMessage,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
} from "../shared/auth";
import { isFirebaseConfigured } from "../shared/firebase";

type Props = { mode: "login" | "register"; onNavigate: (path: string) => void };

export function AuthScreen({ mode, onNavigate }: Props) {
  const { t } = useTranslation();
  const registering = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (registering && !name.trim()) {
      setError(t("auth.nameRequired"));
      return;
    }
    if (registering && password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    if (registering && password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (registering && !acceptedTerms) {
      setError(
        t("auth.termsRequired"),
      );
      return;
    }
    setBusy(true);
    try {
      if (registering)
        await registerWithEmail(name.trim(), email.trim(), password);
      else await loginWithEmail(email.trim(), password);
    } catch (cause) {
      setError(getAuthErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError(t("auth.emailRequired"));
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setNotice(
        t("auth.resetNotice"),
      );
    } catch (cause) {
      setError(getAuthErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <a
            href="/"
            className="auth-brand"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/login");
            }}
          >
            <span>◆</span> NinjaScribe
          </a>
          <h1>{registering ? t("auth.registerTitle") : t("auth.loginTitle")}</h1>
          <p>
            {registering
              ? t("auth.registerSubtitle")
              : t("auth.loginSubtitle")}
          </p>
        </header>
        {!isFirebaseConfigured && (
          <div className="config-notice" role="status">
            <b>{t("auth.firebaseSetup")}</b>
            <span>
              {t("auth.firebaseSetupDetails")}
            </span>
          </div>
        )}
        {error && (
          <div className="auth-message error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="auth-message success" role="status">
            {notice}
          </div>
        )}
        <form className="auth-form" onSubmit={submit}>
          {registering && (
            <div className="auth-field">
              <label htmlFor="displayName">{t("auth.name")}</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                placeholder={t("auth.namePlaceholder")}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                required
              />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="email">{t("auth.email")}</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <div className="field-heading">
              <label htmlFor="password">{t("auth.password")}</label>
              {!registering && (
                <button
                  type="button"
                  className="text-link"
                  onClick={handleResetPassword}
                  disabled={busy}
                >
                  {t("auth.forgotPassword")}
                </button>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={
                registering ? t("auth.passwordMinimum") : t("auth.passwordPlaceholder")
              }
              autoComplete={registering ? "new-password" : "current-password"}
              minLength={registering ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {registering && <small>{t("auth.passwordMinimum")}</small>}
          </div>
          {registering && (
            <div className="auth-field">
              <label htmlFor="passwordConfirm">{t("auth.confirmPassword")}</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder={t("auth.confirmPlaceholder")}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
          )}
          {registering && (
            <label className="terms-check">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>
                {t("auth.termsLead")} {" "}
                <a href="#terms" onClick={(event) => event.preventDefault()}>
                  {t("auth.terms")}
                </a>{" "}
                {t("auth.and")} {" "}
                <a href="#privacy" onClick={(event) => event.preventDefault()}>
                  {t("auth.privacy")}
                </a>
              </span>
            </label>
          )}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? t("auth.wait") : registering ? t("auth.createAccount") : t("auth.signIn")}
          </button>
          <p className="auth-switch">
            {registering ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
            <button
              type="button"
              onClick={() => onNavigate(registering ? "/login" : "/register")}
            >
              {registering ? t("auth.signIn") : t("auth.register")}
            </button>
          </p>
        </form>
      </section>
      <p className="auth-footnote">{t("auth.footnote")}</p>
    </main>
  );
}
