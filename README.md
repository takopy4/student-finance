# 💰 Student Finance

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**Персональный финансовый помощник для студентов.**

</div>

---

## 📸 Что внутри

| Функция | Что делает |
| --- | --- |
| 💼 Доходы | Записывает поступления (зарплата, стипендия, фриланс) |
| 💸 Расходы | Помогает вести бюджет по категориям |
| 🎯 Накопления | Показывает прогресс к финансовым целям |
| 🔢 Калькулятор | Рассчитывает, сколько месяцев до цели |
| 📊 Статистика | Показывает расходы по категориям с диаграммами |
| 📅 Планировщик | Помогает планировать бюджет на месяц |

---

## 🚀 Быстрый старт

### Что нужно
- [Node.js](https://nodejs.org/) версии **20 или новее**

### Установка и запуск

```bash
# 1. Клонируй репозиторий
git clone https://github.com/ТВОЙ_НИК/student-finance.git
cd student-finance

# 2. Установи зависимости
npm install

# 3. Запусти
npm run dev
```

Открой **http://localhost:3000** в браузере. Готово!

> 💡 Приложение работает **без базы данных** для демо. PostgreSQL нужен для сохранения данных между сессиями.

---

## 🗄 PostgreSQL (для сохранения данных)

```bash
# Подними PostgreSQL через Docker
docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
docker exec pg createdb -U postgres app_db
```

Создай файл `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Примени схему:

```bash
npx drizzle-kit push
```

---

## 🛠 Технологии

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Drizzle ORM + PostgreSQL**
- **Motion** (анимации)

---

## 📝 Лицензия

MIT
