# AnimeHako — Техническое Задание (MVP)

## 1. Описание проекта

**AnimeHako** — каталог аниме с личными списками и обзорами. Пет-проект для изучения fullstack-разработки.

### Компоненты

- **Бекенд** — монолитный REST API
- **Фронтенд** — веб-приложение
- **Мобильное приложение** — отдельно от фронтенда

### Функционал

| Функция | Описание |
|---------|----------|
| Каталог аниме | Главная страница со списком аниме |
| Топ-100 | Рейтинг аниме по оценкам |
| Карточка аниме | Описание, жанры, теги, оценка, обзоры, скриншоты |
| Авторизация | Регистрация и вход |
| Личный кабинет | Профиль и списки аниме |
| Списки просмотра | Просмотренное / Брошено / Смотрю / Запланировано |
| Избранное | Отметить аниме как любимое |
| Обзоры | Только просмотр обзоров |

---

## 2. Архитектура

### Стек технологий

**Бекенд:**
- Node.js + Express или Python + FastAPI
- PostgreSQL
- JWT для авторизации

**Фронтенд:**
- React
- Shadcn UI
- Zustand
- Axios + TanStack Query

**Мобильное приложение:**
- React Native или Flutter

### Схема работы

```
Веб/Мобильное приложение → REST API → PostgreSQL
                                    ↓
                            Внешний API аниме
```

- Все данные хранятся в PostgreSQL
- Картинки (постеры, скриншоты) — URL из внешнего API
- Синхронизация с внешним API — по запросу или вручную

---

## 3. Бекенд

### API Эндпоинты

#### Аутентификация

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |

#### Аниме

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/anime` | Список аниме (пагинация, фильтры) |
| GET | `/api/anime/top` | Топ-100 аниме |
| GET | `/api/anime/:id` | Детали аниме |
| GET | `/api/anime/:id/screenshots` | Скриншоты |
| GET | `/api/anime/:id/reviews` | Обзоры |
| GET | `/api/genres` | Список жанров |
| GET | `/api/tags` | Список тегов |

#### Пользователь (требуется авторизация)

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/user/me` | Профиль |
| PATCH | `/api/user/me` | Обновить профиль |
| GET | `/api/user/anime` | Мой список аниме |
| POST | `/api/user/anime` | Добавить в список |
| PATCH | `/api/user/anime/:animeId` | Обновить статус |
| DELETE | `/api/user/anime/:animeId` | Удалить из списка |
| POST | `/api/user/favorites/:animeId` | Добавить в избранное |
| DELETE | `/api/user/favorites/:animeId` | Убрать из избранного |

#### Обзоры

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/anime/:id/reviews` | Получить обзоры аниме |
| GET | `/api/reviews/:id` | Получить конкретный обзор |

### Форматы данных

#### Регистрация / Вход

```json
// Запрос
{
  "email": "user@example.com",
  "username": "animefan",
  "password": "password123"
}

// Ответ
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "animefan",
    "avatar": null
  }
}
```

#### Список аниме

```json
{
  "data": [
    {
      "id": 1,
      "title": "Название аниме",
      "titleEn": "Anime Title",
      "poster": "https://example.com/poster.jpg",
      "rating": 8.5,
      "year": 2024,
      "episodes": 12,
      "genres": ["Экшен", "Фэнтези"]
    }
  ],
  "page": 1,
  "totalPages": 10,
  "total": 200
}
```

#### Детали аниме

```json
{
  "id": 1,
  "title": "Название аниме",
  "titleEn": "Anime Title",
  "titleJp": "アニメタイトル",
  "poster": "https://example.com/poster.jpg",
  "cover": "https://example.com/cover.jpg",
  "description": "Описание аниме...",
  "rating": 8.5,
  "year": 2024,
  "season": "winter",
  "status": "ongoing",
  "episodes": 12,
  "duration": 24,
  "studio": "Studio Name",
  "genres": ["Экшен", "Фэнтези"],
  "tags": ["Исекай", "Магия"]
}
```

#### Аниме в списке пользователя

```json
{
  "animeId": 1,
  "status": "watching",
  "score": 8,
  "episodesWatched": 5,
  "isFavorite": true
}
```

#### Обзор

```json
{
  "id": 1,
  "animeId": 1,
  "authorName": "Автор обзора",
  "title": "Заголовок",
  "content": "Текст обзора...",
  "score": 9,
  "createdAt": "2026-03-05T10:00:00Z"
}
```

### Параметры запроса

#### GET /api/anime

| Параметр | Описание |
|----------|----------|
| `page` | Номер страницы |
| `search` | Поиск по названию |
| `genres` | Фильтр по жанрам (через запятую) |
| `year` | Фильтр по году |
| `sort` | Сортировка: rating, year, created |

#### GET /api/user/anime

| Параметр | Описание |
|----------|----------|
| `status` | Фильтр: watching, completed, dropped, planned |

---

## 4. База данных

### Таблицы

#### users

| Поле | Тип |
|------|-----|
| id | SERIAL PRIMARY KEY |
| email | VARCHAR(255) UNIQUE |
| username | VARCHAR(50) UNIQUE |
| password_hash | VARCHAR(255) |
| avatar | VARCHAR(500) |
| created_at | TIMESTAMP |

#### anime

| Поле | Тип |
|------|-----|
| id | SERIAL PRIMARY KEY |
| title | VARCHAR(255) |
| title_en | VARCHAR(255) |
| title_jp | VARCHAR(255) |
| poster | VARCHAR(500) |
| cover | VARCHAR(500) |
| description | TEXT |
| rating | DECIMAL(3,1) |
| year | INT |
| season | VARCHAR(20) |
| status | VARCHAR(20) |
| episodes | INT |
| duration | INT |
| studio | VARCHAR(255) |
| external_id | VARCHAR(100) |
| created_at | TIMESTAMP |

#### user_anime

| Поле | Тип |
|------|-----|
| id | SERIAL PRIMARY KEY |
| user_id | INT REFERENCES users |
| anime_id | INT REFERENCES anime |
| status | VARCHAR(20) |
| score | INT |
| episodes_watched | INT |
| is_favorite | BOOLEAN DEFAULT false |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

**Уникальность:** (user_id, anime_id)

#### reviews

*Обзоры импортируются из внешнего источника или добавляются администратором. Пользователи могут только просматривать обзоры.*

| Поле | Тип |
|------|-----|
| id | SERIAL PRIMARY KEY |
| anime_id | INT REFERENCES anime |
| author_name | VARCHAR(255) |
| title | VARCHAR(255) |
| content | TEXT |
| score | INT |
| external_id | VARCHAR(100) |
| created_at | TIMESTAMP |

#### screenshots

| Поле | Тип |
|------|-----|
| id | SERIAL PRIMARY KEY |
| anime_id | INT REFERENCES anime |
| url | VARCHAR(500) |

#### genres

| Поле | Тип |
|------|-----|
| id | SERIAL PRIMARY KEY |
| name | VARCHAR(100) UNIQUE |
| slug | VARCHAR(100) UNIQUE |

#### tags

| Поле | Тип |
|------|-----|
| id | SERIAL PRIMARY KEY |
| name | VARCHAR(100) UNIQUE |
| slug | VARCHAR(100) UNIQUE |

#### anime_genres

| Поле | Тип |
|------|-----|
| anime_id | INT REFERENCES anime |
| genre_id | INT REFERENCES genres |

#### anime_tags

| Поле | Тип |
|------|-----|
| anime_id | INT REFERENCES anime |
| tag_id | INT REFERENCES tags |

---

## 5. Фронтенд

### Страницы

| Маршрут | Страница |
|---------|----------|
| `/` | Главная — каталог аниме |
| `/top` | Топ-100 |
| `/anime/:id` | Карточка аниме |
| `/login` | Вход |
| `/register` | Регистрация |
| `/profile` | Личный кабинет |
| `/profile/anime` | Мой список |
| `/profile/favorites` | Избранное |

### Компоненты (поверх Shadcn UI)

**Аниме:**
- `AnimeCard` — карточка с постером и рейтингом
- `AnimeGrid` — сетка карточек
- `AnimeScreenshots` — галерея скриншотов
- `GenreBadge` — бейдж жанра
- `RatingDisplay` — рейтинг звёздами

**Пользователь:**
- `UserAvatar` — аватар
- `StatusSelect` — выбор статуса аниме
- `FavoriteButton` — кнопка избранного

**Формы:**
- `LoginForm` — форма входа
- `RegisterForm` — форма регистрации

### Функциональность страниц

#### Главная
- Сетка аниме с пагинацией
- Фильтры: поиск, жанры, год
- Сортировка: по рейтингу, году

#### Топ-100
- Список топ-100 по рейтингу
- Быстрое добавление в список

#### Карточка аниме
- Постер, обложка, описание
- Информация: год, студия, эпизоды
- Жанры и теги (кликабельные)
- Скриншоты (галерея)
- Обзоры (только просмотр)
- Кнопки: добавить в список, в избранное

#### Личный кабинет
- Профиль: аватар, имя, email
- Статистика: сколько просмотрено
- Табы: Смотрю / Просмотренное / Брошено / Запланировано

---

## 6. Мобильное приложение

### Экраны

| Экран | Описание |
|-------|----------|
| Home | Каталог с каруселями |
| Top | Топ-100 |
| Search | Поиск |
| AnimeDetail | Карточка аниме |
| Profile | Личный кабинет |
| Login / Register | Авторизация |

### Навигация

TabBar: Главная | Топ | Поиск | Профиль

### Особенности

- Горизонтальные карусели на главной
- Бесконечная прокрутка списков
- Pull-to-refresh
- Галерея скриншотов с зумом

---

## 7. Интеграция с внешним API

### Подход

- Создать простой сервис-адаптер
- При запросе аниме проверять наличие в БД
- Если нет — загрузить из внешнего API и сохранить
- Картинки хранить как URL (не загружать локально)

### Пример адаптера

```typescript
interface AnimeProvider {
  getAnime(id: string): Promise<AnimeData>;
  searchAnime(query: string): Promise<AnimeData[]>;
  getGenres(): Promise<Genre[]>;
}
```

### Провайдеры на выбор

- Shikimori API
- Kitsu API
- Jikan API (MyAnimeList)

---

## 8. План разработки

1. **Бекенд**: настройка проекта, БД, базовые CRUD
2. **Бекенд**: авторизация, JWT
3. **Бекенд**: списки пользователя
4. **Бекенд**: интеграция с внешним API (включая импорт обзоров)
5. **Фронтенд**: настройка, страницы, компоненты
6. **Фронтенд**: авторизация, личный кабинет
7. **Мобильное**: базовая структура
8. **Мобильное**: функционал аналогично фронтенду
