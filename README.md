# NinjaScribe

Вебзастосунок для нотаток зустрічей. Реєстрація, вхід, вихід і відновлення пароля працюють через Firebase Authentication (Email/Password). Інтерфейс українською.

## Запуск

```sh
npm install
npm run dev
```

## Можливості поточної версії

- перегляд, пошук і фільтрація нотаток за папками;
- створення, редагування та видалення нотаток;
- створення, перегляд, перейменування й видалення папок у Cloud Firestore;
- Firebase Authentication для акаунтів;
- профіль користувача у Firestore за ID Firebase Authentication;
- нові нотатки створюються через Gemini та зберігаються у Cloud Firestore; локальні демонстраційні нотатки залишаються у `localStorage`;
- адаптивний інтерфейс для мобільних і настільних екранів.

Комбінації клавіш: `⌘/Ctrl + N` — нова нотатка, `⌘/Ctrl + K` — пошук.

## Перевірка

```sh
npm run build
npm run lint
```

## Інтеграції Firebase

### Під’єднати Firebase Authentication

1. Створіть проєкт у [Firebase Console](https://console.firebase.google.com/).
2. У **Project settings → General → Your apps** створіть вебзастосунок (іконка `</>`) і скопіюйте його Firebase config.
3. У **Authentication → Sign-in method** увімкніть провайдер **Email/Password**. За бажанням там само встановіть політику паролів із мінімумом 8 символів: форма також перевіряє цю вимогу на клієнті.
4. Додайте `localhost` для розробки та домен розгорнутого застосунку у **Authentication → Settings → Authorized domains**. Для нових проєктів `localhost` може бути відсутній.
5. Скопіюйте `.env.example` у `.env` у корені проєкту та підставте значення з Firebase config:

   ```sh
   cp .env.example .env
   ```

   Заповніть `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` і `VITE_FIREBASE_APP_ID`.

6. Перезапустіть `npm run dev`. Сторінка входу доступна за `/login`, реєстрація — за `/register`.

### Опублікувати правила Firestore

Реєстрація та вхід створюють/оновлюють профіль у `users/{uid}`. [firestore.rules](./firestore.rules) також містить правила для `folders/{folderId}` та `notes/{noteId}`: вони перевіряють власника, допустимі поля, типи й те, що нотатка належить папці того самого користувача. Запити списків папок і нотаток мають фільтрувати за `userId == auth.currentUser.uid`, щоб Firestore міг підтвердити умову доступу. Якщо список папок користувача у Firestore порожній, локальні папки переносяться туди під час завантаження.

Видалення папки з UI використовує `deleteFolderAndNotes` з `src/shared/folders.ts`: функція видаляє пов’язані Firestore-нотатки поточного користувача пачками по 450 документів, а потім папку. Локальні нотатки з цієї папки також прибираються.

Опублікуйте правила у **Firestore Database → Rules** в Firebase Console. Або, якщо Firebase CLI вже встановлений і ви увійшли в потрібний проєкт, виконайте `firebase deploy --only firestore:rules` з кореня репозиторію. Firestore не потребує ручного створення порожніх колекцій: вони з’являться після першого запису документа.

Firebase Web API key є публічним і використовується клієнтським SDK; він не є Admin SDK ключем. Не додавайте до `.env` service account JSON, приватні ключі чи паролі. `.env` ігнорується Git.

Список хмарних нотаток завантажується з Firestore; локальні демонстраційні записи залишаються в браузері. Створення нової нотатки викликає Gemini 3.5 Flash-Lite, додає структурований саммарі й зберігає все в `notes/{noteId}`. Довгі тексти аналізуються частинами до 12 000 символів. Мова використовується для первинної генерації саммарі й окремо в документі не зберігається; повторний аналіз наразі генерує саммарі українською.

### Підготувати Gemini через Firebase AI Logic

Проєкт використовує Firebase AI Logic як шар доступу до Gemini з браузера. Окремий `GEMINI_API_KEY` у `.env` не потрібен: Firebase налаштовує авторизацію провайдера у проєкті. Не додавайте Gemini ключ до `VITE_*` змінних — Vite вбудовує їх у клієнтський застосунок, де вони видимі користувачам. Вже наявний `VITE_FIREBASE_API_KEY` є Firebase Web API key, а не Gemini secret.

Щоб підготувати Firebase-проєкт:

1. У Firebase Console відкрийте **AI Services → AI Logic** і натисніть **Get started**.
2. Виберіть **Gemini Developer API** як провайдера та завершіть майстер налаштування. Firebase увімкне потрібні API й створить/налаштує Gemini API key у Google Cloud для використання через Firebase AI Logic.
3. Для локального запуску код вмикає App Check debug provider. Після запуску скопіюйте debug token з консолі браузера та зареєструйте його у **App Check → Apps → Manage debug tokens**.
4. Для production створіть reCAPTCHA Enterprise site key, зареєструйте провайдер для вебзастосунку в App Check і додайте ключ у змінну `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` середовища розгортання.
5. Перезапустіть dev-сервер після змін Firebase налаштувань.

Залежність `firebase` уже встановлена й містить Web SDK Firebase AI Logic; окремий Gemini SDK або секрет у `.env` не потрібен. Якщо AI Logic вже ввімкнений, переходьте одразу до створення нотатки. Локально завантажуються лише `.txt` і `.md` файли; документи `.doc`/`.docx` поки не підтримуються.
