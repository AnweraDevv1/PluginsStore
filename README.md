# AnweraDev — Портфолио сайт

Портфолио разработчика **Paper / Spigot плагинов, Fabric / Forge модов** и инструментов для Minecraft серверов. Next.js + PostgreSQL (Drizzle ORM) + Tailwind CSS.

## Возможности

- 🎨 Тёмный сайт-портфолио с проектами (плагины, моды, датапаки, тулзы)
- 🔐 Админ-панель с авторизацией (токен + cookie) для управления проектами
- 🖼️ Баннер, скриншоты, видео (Google Drive / YouTube) у каждого проекта
- ⬇️ Прямая скачка файлов (в т.ч. загруженных в `/uploads` и с Google Drive)
- 📊 Счётчик скачиваний

## Стек

- **Next.js 16** (App Router, Turbopack)
- **PostgreSQL + Drizzle ORM**
- **Tailwind CSS v4**
- Деплой: Vercel / Netlify / Railway

## Запуск локально

```bash
npm install
# создай .env (см. ниже)
npm run dev
```

### Переменные окружения (`.env`)

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
AUTH_SECRET=любая_длинная_строка_секрета
AUTH_ADMIN_EMAIL=твой_email_для_входа_в_админку
AUTH_ADMIN_PASSWORD=твой_пароль_для_входа_в_админку
```

> ⚠️ `.env` в git не пушить! Логин/пароль админки задаются через переменные окружения `AUTH_ADMIN_EMAIL` и `AUTH_ADMIN_PASSWORD` (см. выше) — в коде их нет.

### Инициализация БД

```bash
npx drizzle-kit push   # создаст таблицы по схеме
```

или вручную выполни SQL из схемы `src/db/schema.ts`.

## Деплой на Vercel

1. Подключи репозиторий на [vercel.com](https://vercel.com)
2. Добавь переменные `DATABASE_URL` и `AUTH_SECRET`
3. Создай бесплатную БД (Neon / Supabase / Vercel Postgres)
4. Deploy — готово!

## Структура

```
src/
├── app/
│   ├── page.tsx              — главная (hero, проекты, стек, CTA)
│   ├── admin/page.tsx        — админ-панель (CRUD проектов)
│   ├── login/page.tsx        — вход
│   ├── guide/page.tsx        — хостинг-гайд (только для админа)
│   ├── projects/[slug]/      — страница проекта
│   └── api/                  — API: auth, projects, upload, download
├── components/               — Navbar, Footer, ProjectCard
├── db/                       — подключение + схема БД
└── lib/                      — auth, media (Google Drive утилиты)
```

## Лицензия

MIT
