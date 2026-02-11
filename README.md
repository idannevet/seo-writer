# SEO Writer ✍️

מערכת לכתיבת מאמרי SEO באמצעות בינה מלאכותית

## התקנה

```bash
npm install
```

## הגדרת מפתח OpenAI

ערוך את `.env.local`:
```
OPENAI_API_KEY=sk-your-key-here
```

## הרצה

```bash
npx prisma db push
npm run dev
```

פתח http://localhost:3000

## מבנה

- `/` - דשבורד
- `/articles/new` - יצירת מאמר חדש
- `/articles` - רשימת מאמרים
- `/articles/[id]` - עריכת מאמר
- `/categories` - ניהול קטגוריות
- `/categories/[id]/topics` - ניהול נושאים
- `/settings` - הגדרות

## טכנולוגיות

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- TipTap Editor
- OpenAI GPT-4o
