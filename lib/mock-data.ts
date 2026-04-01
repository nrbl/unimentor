import type { User, Course, Module, Lesson, LessonBlock, LessonProgress, Assignment, Submission, SkillProgress } from "./types"

// ============================================================
// USERS
// ============================================================
export const users: User[] = [
  { id: 1, full_name: "Алексей Иванов", email: "teacher1@uni.ru", role: "teacher", created_at: "2026-01-01T10:00:00Z" },
  { id: 2, full_name: "Мария Петрова", email: "teacher2@uni.ru", role: "teacher", created_at: "2026-01-02T10:00:00Z" },
  { id: 3, full_name: "Админ Системы", email: "admin@uni.ru", role: "admin", created_at: "2026-01-03T10:00:00Z" },
  { id: 4, full_name: "Дмитрий Сидоров", email: "student1@uni.ru", role: "student", created_at: "2026-01-04T10:00:00Z" },
  { id: 5, full_name: "Елена Козлова", email: "student2@uni.ru", role: "student", created_at: "2026-01-05T10:00:00Z" },
  { id: 6, full_name: "Анна Смирнова", email: "student3@uni.ru", role: "student", created_at: "2026-01-06T10:00:00Z" },
]

// ============================================================
// COURSES
// ============================================================
export const courses: Course[] = [
  { id: 1, title: "Основы Python", description: "Курс по основам программирования на Python. Подходит для начинающих.", status: "published", language: "ru", cover_url: "/placeholder-python.jpg", teacher_id: 1, created_at: "2026-01-01T10:00:00Z" },
  { id: 2, title: "Веб-разработка", description: "Современная веб-разработка: HTML, CSS, JavaScript и React.", status: "published", language: "ru", cover_url: "/placeholder-web.jpg", teacher_id: 1, created_at: "2026-01-02T10:00:00Z" },
  { id: 3, title: "Машинное обучение", description: "Введение в машинное обучение и анализ данных.", status: "published", language: "ru", cover_url: "/placeholder-ml.jpg", teacher_id: 2, created_at: "2026-01-03T10:00:00Z" },
  { id: 4, title: "Алгоритмы и структуры данных", description: "Углублённый курс по алгоритмам (черновик).", status: "draft", language: "ru", cover_url: "/placeholder-algo.jpg", teacher_id: 1, created_at: "2026-01-04T10:00:00Z" },
  { id: 5, title: "English for IT", description: "Technical English for software developers.", status: "draft", language: "en", cover_url: "/placeholder-eng.jpg", teacher_id: 2, created_at: "2026-01-05T10:00:00Z" },
]

// ============================================================
// MODULES
// ============================================================
export const modules: Module[] = [
  { id: 1, course_id: 1, title: "Введение в Python", sort: 1 },
  { id: 2, course_id: 1, title: "Управляющие конструкции", sort: 2 },
  { id: 3, course_id: 1, title: "Функции и модули", sort: 3 },
  { id: 4, course_id: 2, title: "HTML и CSS", sort: 1 },
  { id: 5, course_id: 2, title: "JavaScript", sort: 2 },
  { id: 6, course_id: 3, title: "Введение в ML", sort: 1 },
  { id: 7, course_id: 3, title: "Регрессия", sort: 2 },
  { id: 8, course_id: 3, title: "Классификация", sort: 3 },
  { id: 9, course_id: 4, title: "Сортировки", sort: 1 },
  { id: 10, course_id: 4, title: "Графы", sort: 2 },
  { id: 11, course_id: 5, title: "Basic IT Vocabulary", sort: 1 },
  { id: 12, course_id: 5, title: "Technical Writing", sort: 2 },
]

// ============================================================
// LESSONS
// ============================================================
export const lessons: Lesson[] = [
  { id: 1, module_id: 1, title: "Что такое Python?", objectives: "Узнать историю Python; Установить среду разработки", sort: 1, is_published: true },
  { id: 2, module_id: 1, title: "Переменные и типы данных", objectives: "Работа с int, float, str; Приведение типов", sort: 2, is_published: true },
  { id: 3, module_id: 1, title: "Ввод и вывод", objectives: "Функции print() и input()", sort: 3, is_published: true },
  { id: 4, module_id: 2, title: "Условия if/elif/else", objectives: "Ветвление в коде", sort: 1, is_published: true },
  { id: 5, module_id: 2, title: "Циклы for и while", objectives: "Итерации; break и continue", sort: 2, is_published: true },
  { id: 6, module_id: 2, title: "Списки и кортежи", objectives: "Индексация; Срезы", sort: 3, is_published: true },
  { id: 7, module_id: 2, title: "Словари и множества", objectives: "Хеш-таблицы в Python", sort: 4, is_published: true },
  { id: 8, module_id: 3, title: "Определение функций", objectives: "def, return, параметры", sort: 1, is_published: true },
  { id: 9, module_id: 3, title: "Лямбда-функции", objectives: "Анонимные функции", sort: 2, is_published: true },
  { id: 10, module_id: 3, title: "Модули и пакеты", objectives: "import, pip, виртуальные окружения", sort: 3, is_published: true },
  { id: 11, module_id: 4, title: "Структура HTML-документа", objectives: "Теги, атрибуты; Семантика", sort: 1, is_published: true },
  { id: 12, module_id: 4, title: "CSS-селекторы и свойства", objectives: "Каскадность; Box model", sort: 2, is_published: true },
  { id: 13, module_id: 4, title: "Flexbox и Grid", objectives: "Современная вёрстка", sort: 3, is_published: true },
  { id: 14, module_id: 5, title: "Переменные и функции JS", objectives: "let, const, arrow functions", sort: 1, is_published: true },
  { id: 15, module_id: 5, title: "DOM и события", objectives: "querySelector; addEventListener", sort: 2, is_published: true },
  { id: 16, module_id: 5, title: "Асинхронность", objectives: "Promise, async/await, fetch", sort: 3, is_published: true },
  { id: 17, module_id: 6, title: "Что такое ML?", objectives: "Обзор области ML", sort: 1, is_published: true },
  { id: 18, module_id: 6, title: "Подготовка данных", objectives: "Pandas, numpy, очистка данных", sort: 2, is_published: true },
  { id: 19, module_id: 6, title: "Визуализация данных", objectives: "matplotlib, seaborn", sort: 3, is_published: true },
  { id: 20, module_id: 7, title: "Линейная регрессия", objectives: "OLS, MSE, R^2", sort: 1, is_published: true },
  { id: 21, module_id: 7, title: "Полиномиальная регрессия", objectives: "Переобучение; Кросс-валидация", sort: 2, is_published: true },
  { id: 22, module_id: 8, title: "Логистическая регрессия", objectives: "Бинарная классификация", sort: 1, is_published: true },
  { id: 23, module_id: 8, title: "Деревья решений", objectives: "Энтропия; Information Gain", sort: 2, is_published: true },
  { id: 24, module_id: 8, title: "Метрики качества", objectives: "Accuracy, Precision, Recall, F1", sort: 3, is_published: true },
  { id: 25, module_id: 9, title: "Пузырьковая сортировка", objectives: "O(n^2) алгоритмы", sort: 1, is_published: true },
  { id: 26, module_id: 9, title: "Быстрая сортировка", objectives: "Divide and conquer", sort: 2, is_published: true },
  { id: 27, module_id: 10, title: "BFS и DFS", objectives: "Обход графа", sort: 1, is_published: true },
  { id: 28, module_id: 10, title: "Алгоритм Дейкстры", objectives: "Кратчайший путь", sort: 2, is_published: false },
  { id: 29, module_id: 11, title: "IT Terms and Definitions", objectives: "Core vocabulary", sort: 1, is_published: true },
  { id: 30, module_id: 11, title: "Code Review Language", objectives: "Communication patterns", sort: 2, is_published: true },
  { id: 31, module_id: 12, title: "Writing Documentation", objectives: "README, API docs", sort: 1, is_published: true },
  { id: 32, module_id: 12, title: "Bug Reports", objectives: "Structured reporting", sort: 2, is_published: false },
]

// ============================================================
// LESSON BLOCKS (examples for l1, l2, l4)
// ============================================================
export const lessonBlocks: LessonBlock[] = [
  { id: 1, lesson_id: 1, type: "text", data: { html: "<h2>Что такое Python?</h2><p>Python — высокоуровневый язык программирования общего назначения. Создан Гвидо ван Россумом в 1991 году. Отличается простым и понятным синтаксисом.</p><p>Python активно используется в веб-разработке, науке о данных, искусственном интеллекте и автоматизации.</p>" }, sort: 1 },
  { id: 2, lesson_id: 1, type: "callout", data: { variant: "info", text: "Python входит в тройку самых популярных языков программирования по индексу TIOBE." }, sort: 2 },
  { id: 3, lesson_id: 1, type: "code", data: { language: "python", code: 'print("Hello, World!")\n\n# Это комментарий\nname = "UniMentor"\nprint(f"Добро пожаловать в {name}!")' }, sort: 3 },
  { id: 4, lesson_id: 1, type: "link", data: { url: "https://python.org", title: "Официальный сайт Python" }, sort: 4 },
  { id: 5, lesson_id: 1, type: "video", data: { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", title: "Введение в Python (видео)" }, sort: 5 },

  { id: 6, lesson_id: 2, type: "text", data: { html: "<h2>Переменные</h2><p>Переменная — это именованная область памяти для хранения данных. В Python не нужно объявлять тип переменной явно.</p>" }, sort: 1 },
  { id: 7, lesson_id: 2, type: "code", data: { language: "python", code: 'x = 10          # int\ny = 3.14        # float\nname = "Python"  # str\nis_cool = True   # bool\n\nprint(type(x))   # <class \'int\'>' }, sort: 2 },
  { id: 8, lesson_id: 2, type: "table", data: { headers: ["Тип", "Пример", "Описание"], rows: [["int", "42", "Целое число"], ["float", "3.14", "Число с плавающей точкой"], ["str", '"Привет"', "Строка"], ["bool", "True", "Логическое значение"]] }, sort: 3 },
  { id: 9, lesson_id: 2, type: "callout", data: { variant: "warning", text: "Будьте осторожны при делении: 7 / 2 = 3.5 (float), 7 // 2 = 3 (int)." }, sort: 4 },
  { id: 10, lesson_id: 2, type: "image", data: { url: "https://placehold.co/800x400/1a1a2e/eaeaea?text=Python+Types", alt: "Типы данных в Python" }, sort: 5 },

  { id: 11, lesson_id: 4, type: "text", data: { html: "<h2>Условные конструкции</h2><p>Условия позволяют выполнять разный код в зависимости от условий. Основные конструкции: <code>if</code>, <code>elif</code>, <code>else</code>.</p>" }, sort: 1 },
  { id: 12, lesson_id: 4, type: "code", data: { language: "python", code: 'age = 20\n\nif age >= 18:\n    print("Вы совершеннолетний")\nelif age >= 14:\n    print("Подросток")\nelse:\n    print("Ребёнок")' }, sort: 2 },
  { id: 13, lesson_id: 4, type: "file", data: { url: "/files/conditions-cheatsheet.pdf", name: "Шпаргалка по условиям.pdf", size: "120 KB" }, sort: 3 },

  { id: 14, lesson_id: 11, type: "text", data: { html: "<h2>HTML-документ</h2><p>HTML (HyperText Markup Language) — стандартный язык разметки для создания веб-страниц.</p>" }, sort: 1 },
  { id: 15, lesson_id: 11, type: "code", data: { language: "html", code: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Моя страница</title>\n</head>\n<body>\n  <h1>Привет, мир!</h1>\n</body>\n</html>' }, sort: 2 },

  { id: 16, lesson_id: 17, type: "text", data: { html: "<h2>Машинное обучение</h2><p>Machine Learning — подмножество искусственного интеллекта, где модели учатся на данных, а не программируются явно.</p>" }, sort: 1 },
  { id: 17, lesson_id: 17, type: "callout", data: { variant: "info", text: "Три типа ML: обучение с учителем (supervised), без учителя (unsupervised) и с подкреплением (reinforcement)." }, sort: 2 },
]

// ============================================================
// ENROLLMENTS
// ============================================================
export const enrollments: { course_id: number; student_id: number }[] = [
  { course_id: 1, student_id: 4 },
  { course_id: 1, student_id: 5 },
  { course_id: 2, student_id: 4 },
  { course_id: 3, student_id: 5 },
  { course_id: 3, student_id: 6 },
  { course_id: 2, student_id: 6 },
]

// ============================================================
// LESSON PROGRESS
// ============================================================
export const lessonProgress: LessonProgress[] = [
  { id: 1, lesson_id: 1, student_id: 4, status: "completed", progress_percent: 100, last_seen_at: "2026-02-10T10:00:00Z" },
  { id: 2, lesson_id: 2, student_id: 4, status: "completed", progress_percent: 100, last_seen_at: "2026-02-11T10:00:00Z" },
  { id: 3, lesson_id: 3, student_id: 4, status: "in_progress", progress_percent: 50, last_seen_at: "2026-02-12T10:00:00Z" },
  { id: 4, lesson_id: 4, student_id: 4, status: "not_started", progress_percent: 0, last_seen_at: "2026-02-12T10:00:00Z" },
  { id: 5, lesson_id: 1, student_id: 5, status: "completed", progress_percent: 100, last_seen_at: "2026-02-09T10:00:00Z" },
  { id: 6, lesson_id: 2, student_id: 5, status: "in_progress", progress_percent: 30, last_seen_at: "2026-02-10T10:00:00Z" },
  { id: 7, lesson_id: 11, student_id: 4, status: "completed", progress_percent: 100, last_seen_at: "2026-02-13T10:00:00Z" },
  { id: 8, lesson_id: 12, student_id: 4, status: "in_progress", progress_percent: 60, last_seen_at: "2026-02-14T10:00:00Z" },
  { id: 9, lesson_id: 17, student_id: 5, status: "completed", progress_percent: 100, last_seen_at: "2026-02-12T10:00:00Z" },
  { id: 10, lesson_id: 18, student_id: 5, status: "in_progress", progress_percent: 40, last_seen_at: "2026-02-13T10:00:00Z" },
  { id: 11, lesson_id: 17, student_id: 6, status: "in_progress", progress_percent: 70, last_seen_at: "2026-02-12T10:00:00Z" },
]

// ============================================================
// ASSIGNMENTS
// ============================================================
export const assignments: Assignment[] = [
  { id: 1, lesson_id: 3, title: "Задание: ввод-вывод", description: "Напишите программу, которая запрашивает имя пользователя и приветствует его.", rubric: "Корректная работа input(); Форматирование строки; Чистота кода", due_at: "2026-03-01T23:59:00Z", max_score: 10, created_at: "2026-02-01T10:00:00Z" },
  { id: 2, lesson_id: 7, title: "Задание: словари", description: "Создайте телефонный справочник с помощью словаря Python.", rubric: "Правильное использование dict; Поиск и добавление; Обработка ошибок", due_at: "2026-03-10T23:59:00Z", max_score: 15, created_at: "2026-02-05T10:00:00Z" },
  { id: 3, lesson_id: 13, title: "Задание: вёрстка", description: "Сверстайте адаптивную карточку товара на Flexbox.", rubric: "Семантика HTML; Адаптивность; Визуальное качество", due_at: "2026-03-15T23:59:00Z", max_score: 20, created_at: "2026-02-08T10:00:00Z" },
  { id: 4, lesson_id: 20, title: "Задание: регрессия", description: "Реализуйте линейную регрессию на датасете Boston Housing.", rubric: "Подготовка данных; Обучение модели; Оценка качества (R^2)", due_at: "2026-03-20T23:59:00Z", max_score: 25, created_at: "2026-02-10T10:00:00Z" },
]

// ============================================================
// SUBMISSIONS
// ============================================================
export const submissions: Submission[] = [
  { id: 1, assignment_id: 1, student_id: 4, answer_text: 'name = input("Как вас зовут? ")\nprint(f"Привет, {name}!")', attachments: null, status: "reviewed", ai_feedback: "Хорошая работа! Код корректен и чист. Можно добавить валидацию пустой строки.", teacher_feedback: "Отлично! 9/10", score: 9, created_at: "2026-02-20T15:00:00Z", graded_at: "2026-02-21T10:00:00Z" },
  { id: 2, assignment_id: 1, student_id: 5, answer_text: 'n = input("Имя: ")\nprint("Привет " + n)', attachments: null, status: "reviewed", ai_feedback: "Работает, но лучше использовать f-строки.", teacher_feedback: null, score: 7, created_at: "2026-02-21T10:00:00Z", graded_at: null },
  { id: 3, assignment_id: 3, student_id: 4, answer_text: "Прикрепляю HTML-файл с версткой карточки товара.", attachments: "card.html", status: "submitted", ai_feedback: null, teacher_feedback: null, score: null, created_at: "2026-02-25T12:00:00Z", graded_at: null },
]

// ============================================================
// QUIZZES (mocked as any[] to avoid missing type definitions)
// ============================================================
export const quizzes: any[] = [
  // kept minimal for demo
]

// ============================================================
// SKILLS (For Phase 3 Radar Chart)
// ============================================================
export const mockSkills: Record<number | string, SkillProgress[]> = {
  4: [
    { concept: "Основы Python", proficiency: 85 },
    { concept: "Структуры данных", proficiency: 60 },
    { concept: "Вёрстка (HTML/CSS)", proficiency: 95 },
    { concept: "JavaScript Basics", proficiency: 40 },
    { concept: "Алгоритмы", proficiency: 30 },
  ],
  // Fallback for demo users
  default: [
    { concept: "Основы Python", proficiency: 70 },
    { concept: "Алгоритмы", proficiency: 40 },
    { concept: "Базы Данных", proficiency: 50 },
    { concept: "Web", proficiency: 65 },
    { concept: "Soft Skills", proficiency: 80 },
  ]
}

// ============================================================
// QUIZ ATTEMPTS
// ============================================================
export const quizAttempts: any[] = []

// ============================================================
// MATERIALS
// ============================================================
export const materials: any[] = [
  { id: 1, lesson_id: 1, uploader_id: 1, type: "pdf", file_url: "/files/python-intro.pdf", source_text: "", extracted_text: "Python — высокоуровневый язык программирования...", status: "ingested", created_at: "2026-01-15T10:00:00Z" },
  { id: 2, lesson_id: 2, uploader_id: 1, type: "pdf", file_url: "/files/python-types.pdf", source_text: "", extracted_text: "Переменные в Python: int, float, str, bool...", status: "ingested", created_at: "2026-01-16T10:00:00Z" },
  { id: 3, lesson_id: 17, uploader_id: 2, type: "pdf", file_url: "/files/ml-intro.pdf", source_text: "", extracted_text: "Machine Learning — подмножество AI...", status: "ingested", created_at: "2026-01-20T10:00:00Z" },
  { id: 4, lesson_id: 4, uploader_id: 1, type: "text", file_url: "", source_text: "if/elif/else в Python. Условные конструкции позволяют...", extracted_text: "if/elif/else в Python. Условные конструкции позволяют...", status: "ingested", created_at: "2026-01-17T10:00:00Z" },
  { id: 5, lesson_id: 11, uploader_id: 1, type: "pdf", file_url: "/files/html-basics.pdf", source_text: "", extracted_text: "HTML — язык разметки для веб-страниц...", status: "pending", created_at: "2026-02-01T10:00:00Z" },
]

// ============================================================
// CONTENT CHUNKS
// ============================================================
export const contentChunks: any[] = [
  { id: 1, material_id: 1, lesson_id: 1, chunk_index: 0, chunk_text: "Python был создан Гвидо ван Россумом в 1991 году. Это высокоуровневый язык программирования общего назначения с простым и понятным синтаксисом.", meta: { page: 1 } },
  { id: 2, material_id: 1, lesson_id: 1, chunk_index: 1, chunk_text: "Python поддерживает несколько парадигм: объектно-ориентированное, функциональное и процедурное программирование. Широко используется в науке, AI и веб.", meta: { page: 1 } },
  { id: 3, material_id: 2, lesson_id: 2, chunk_index: 0, chunk_text: "В Python есть базовые типы данных: int (целые числа), float (числа с плавающей точкой), str (строки), bool (логические значения). Тип переменной определяется автоматически.", meta: { page: 1 } },
  { id: 4, material_id: 2, lesson_id: 2, chunk_index: 1, chunk_text: "Приведение типов: int('10') -> 10, str(42) -> '42', float(7) -> 7.0. Функция type() возвращает тип значения.", meta: { page: 2 } },
  { id: 5, material_id: 3, lesson_id: 17, chunk_index: 0, chunk_text: "Машинное обучение (ML) — это подмножество искусственного интеллекта, в котором системы учатся на данных без явного программирования.", meta: { page: 1 } },
  { id: 6, material_id: 3, lesson_id: 17, chunk_index: 1, chunk_text: "Три основных типа ML: supervised learning (обучение с учителем), unsupervised learning (без учителя), reinforcement learning (обучение с подкреплением).", meta: { page: 2 } },
  { id: 7, material_id: 4, lesson_id: 4, chunk_index: 0, chunk_text: "Условные конструкции if/elif/else позволяют выполнять разные блоки кода в зависимости от условий. Отступы в Python определяют блоки кода.", meta: {} },
]

// ============================================================
// Passwords (mock, plain text for demo only)
// ============================================================
export const userPasswords: Record<string, string> = {
  "teacher1@uni.ru": "teacher123",
  "teacher2@uni.ru": "teacher123",
  "admin@uni.ru": "admin123",
  "student1@uni.ru": "student123",
  "student2@uni.ru": "student123",
  "student3@uni.ru": "student123",
}
