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
- нотатки поки що зберігаються у `localStorage` цього браузера окремо для кожного Firebase UID (ще не синхронізуються з Firestore);
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

Збереження нотаток у Cloud Firestore та Firebase AI Logic ще не під’єднані. Нотатки зберігаються лише в браузері й не синхронізуються між пристроями. Кнопка AI-аналізу повідомляє, що інтеграція ще не готова; стартові підсумки є демонстраційними даними.
