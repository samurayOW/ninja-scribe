import { useState, type FormEvent } from "react";
import {
  getAuthErrorMessage,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
} from "../shared/auth";
import { isFirebaseConfigured } from "../shared/firebase";

type Props = { mode: "login" | "register"; onNavigate: (path: string) => void };

export function AuthScreen({ mode, onNavigate }: Props) {
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
      setError("Вкажіть ім’я.");
      return;
    }
    if (registering && password !== confirmPassword) {
      setError("Паролі не збігаються.");
      return;
    }
    if (registering && password.length < 8) {
      setError("Пароль має містити щонайменше 8 символів.");
      return;
    }
    if (registering && !acceptedTerms) {
      setError(
        "Потрібно прийняти умови використання та політику конфіденційності.",
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
      setError("Спочатку введіть електронну пошту.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setNotice(
        "Якщо для цієї адреси є акаунт, Firebase надішле лист для зміни пароля.",
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
          <h1>{registering ? "Створення акаунту" : "З поверненням"}</h1>
          <p>
            {registering
              ? "Кілька кроків — і ви готові до роботи"
              : "Увійдіть, щоб продовжити роботу з нотатками"}
          </p>
        </header>
        {!isFirebaseConfigured && (
          <div className="config-notice" role="status">
            <b>Потрібне налаштування Firebase</b>
            <span>
              Скопіюйте .env.example у .env, додайте конфігурацію вебзастосунку
              з Firebase Console й перезапустіть сервер.
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
              <label htmlFor="displayName">Ім’я</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Едуард Михайлов"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                required
              />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="email">Електронна пошта</label>
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
              <label htmlFor="password">Пароль</label>
              {!registering && (
                <button
                  type="button"
                  className="text-link"
                  onClick={handleResetPassword}
                  disabled={busy}
                >
                  Забули пароль?
                </button>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={
                registering ? "Мінімум 8 символів" : "Введіть пароль"
              }
              autoComplete={registering ? "new-password" : "current-password"}
              minLength={registering ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {registering && <small>Мінімум 8 символів</small>}
          </div>
          {registering && (
            <div className="auth-field">
              <label htmlFor="passwordConfirm">Підтвердження пароля</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="Повторіть пароль"
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
                Я приймаю{" "}
                <a href="#terms" onClick={(event) => event.preventDefault()}>
                  умови використання
                </a>{" "}
                та{" "}
                <a href="#privacy" onClick={(event) => event.preventDefault()}>
                  політику конфіденційності
                </a>
              </span>
            </label>
          )}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Зачекайте…" : registering ? "Створити акаунт" : "Увійти"}
          </button>
          <p className="auth-switch">
            {registering ? "Вже маєте акаунт?" : "Ще не маєте акаунту?"}{" "}
            <button
              type="button"
              onClick={() => onNavigate(registering ? "/login" : "/register")}
            >
              {registering ? "Увійти" : "Зареєструватися"}
            </button>
          </p>
        </form>
      </section>
      <p className="auth-footnote">Ваші нотатки — тільки для вас.</p>
    </main>
  );
}
