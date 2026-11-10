import type { Store } from './types'

export const initialStore: Store = {
  folders: [
    { id: 'work', name: 'Робота', color: 'violet' },
    { id: 'study', name: 'Навчання', color: 'blue' },
    { id: 'projects', name: 'Проєкти', color: 'mint' },
  ],
  notes: [
    {
      id: 'meeting-2026-05-12', title: 'Зустріч з командою', folderId: 'work', updatedAt: '12 травня 2026',
      content: 'Зустріч команди розробки, 12 травня 2026. Присутні: Едуард, Віталій, Олена, Максим.\n\nОбговорили поточний стан проєкту NinjaScribe. Основні питання: інтеграція Gemini API, структура Firestore, план тестування та терміни релізу MVP. Визначили пріоритети на найближчі два тижні.\n\nПрийняли рішення розпочати з авторизації та CRUD для папок і нотаток, після чого перейти до AI-аналізу. Відповідальний за модуль аналізу — Максим. Дедлайн — 20 травня.',
      summary: 'Команда узгодила пріоритети NinjaScribe на найближчі два тижні: спочатку авторизація та CRUD, далі — AI-аналіз.',
      keyTopics: ['Інтеграція Gemini API', 'Структура Cloud Firestore', 'План тестування', 'Терміни релізу MVP'],
      decisions: ['Розпочати з авторизації та CRUD папок і нотаток', 'Реалізувати AI-аналіз після базового CRUD', 'Максим відповідатиме за модуль аналізу'],
      actionItems: ['Реалізувати авторизацію через Firebase — до 15 травня', 'Створити CRUD для папок і нотаток — до 18 травня', 'Підключити Gemini API та перевірити аналіз — до 20 травня'],
    },
    { id: 'sprint-planning', title: 'Планування спринту', folderId: 'work', updatedAt: '10 травня 2026', content: 'Визначили пріоритети беклогу та оцінки задач. Команда погодила обсяг робіт на наступний спринт.', keyTopics: ['Пріоритети беклогу', 'Оцінка задач', 'Планування'], decisions: ['Почати з найважливіших задач для MVP'], actionItems: [] },
    { id: 'retro', title: 'Ретроспектива', folderId: 'work', updatedAt: '8 травня 2026', content: 'Підсумували результати спринту та визначили покращення для наступного циклу.', keyTopics: [], decisions: [], actionItems: ['Покращити передачу задач між учасниками', 'Оновити процес code review'] },
    { id: 'client-call', title: 'Дзвінок з клієнтом', folderId: 'work', updatedAt: '6 травня 2026', content: 'Узгодили вимоги до нового модуля звітності та наступні кроки.', keyTopics: [], decisions: [], actionItems: [] },
    { id: 'research', title: 'Підготовка до іспиту', folderId: 'study', updatedAt: '5 травня 2026', content: 'Склали план підготовки та розподілили теми на тиждень.', keyTopics: ['План підготовки'], decisions: [], actionItems: [] },
  ],
}

export function readStore(storageKey = 'ninja-scribe-data'): Store {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw) as Store
  } catch { /* Keep starter data if stored data is unavailable. */ }
  return initialStore
}
