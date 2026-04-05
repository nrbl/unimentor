// ============================================================
// UniMentor — Real API Client
// ============================================================

import type {
  User,
  Role,
  Course,
  CourseDetail,
  LessonDetail,
  Assignment,
  Submission,
  AiAskResponse,
  AiMode,
  LoginResponse,
  RegisterResponse,
  Module,
  Lesson,
  LessonBlock,
} from "./types"

// API base URL. In development you can set NEXT_PUBLIC_API_URL to an absolute URL
// (https://...) or leave it empty to use relative requests which can be proxied
// via Next.js rewrites (recommended to avoid CORS issues during development).
const BASE = (process.env.NEXT_PUBLIC_API_URL as string) ?? ""

// ---- Response normalization helpers ----

function parseCoverUrl(raw: any): string | null {
  if (!raw) return null
  if (typeof raw === "string") return raw || null
  if (typeof raw === "object") {
    // backend may return { "String": "", "Valid": false }
    if (typeof raw.String === "string") return raw.String || null
    if (typeof raw.string === "string") return raw.string || null
  }
  return null
}

function normalizeUser(raw: any): User | null {
  if (!raw || typeof raw !== "object") return null
  try {
    // Map role: string or numeric or casing
    let role: Role = "student"
    const rawRole = String(raw.role || raw.Role || "").toLowerCase()
    if (rawRole === "teacher" || rawRole === "1") role = "teacher"
    else if (rawRole === "admin" || rawRole === "2") role = "admin"
    
    // Second level of defense: fallback based on email substring if role is still student
    if (role === "student" && raw.email && String(raw.email).toLowerCase().includes("teacher")) {
      role = "teacher"
    }
    
    return {
      id: Number(raw.id || 0),
      full_name: String(raw.full_name || raw.fullName || ""),
      email: String(raw.email || ""),
      role,
      created_at: String(raw.created_at || raw.createdAt || new Date().toISOString()),
    }
  } catch {
    return null
  }
}

/** Safely extracts a string error message from any object or raw value */
function extractErrorMessage(err: any): string {
  if (!err) return "Unknown error"
  if (typeof err === "string") return err
  if (err instanceof Error) return err.message
  if (typeof err === "object") {
    // Check common error fields
    const raw = err.message || err.error || err.detail || err.msg || err.error_description
    if (typeof raw === "string") return raw
    if (typeof raw === "object" && raw !== null) return JSON.stringify(raw)
    // If no common fields, stringify the whole object
    try {
      return JSON.stringify(err)
    } catch {
      return String(err)
    }
  }
  return String(err)
}

function normalizeCourse(raw: any): Course | null {
  if (!raw || typeof raw !== "object") return null
  try {
    return {
      id: Number(raw.id || 0),
      teacher_id: Number(raw.teacher_id || raw.teacherId || 0),
      title: String(raw.title || "Untitled course"),
      description: String(raw.description || ""),
      status: String(raw.status || "draft") as Course["status"],
      language: String(raw.language || "en"),
      cover_url: parseCoverUrl(raw.cover_url || raw.coverUrl),
      created_at: String(raw.created_at || raw.createdAt || new Date().toISOString()),
    }
  } catch {
    return null
  }
}

// ---- Lessons / LessonDetail normalization ----

function tryParseJSON(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

function parseLastSeen(raw: any): string | null {
  // backend may send { Time: "...", Valid: true } or null
  if (!raw) return null
  if (typeof raw === "string") return raw || null
  if (typeof raw === "object") {
    if (raw.Time) return String(raw.Time)
    if (raw.time) return String(raw.time)
  }
  return null
}

function normalizeLessonDetail(raw: any): LessonDetail {
  const lesson = raw.lesson || raw
  const blocksRaw = Array.isArray(raw.blocks) ? raw.blocks : raw.blocks ? [raw.blocks] : []
  const blocks = blocksRaw.map((b: any) => ({
    id: Number(b.id || 0),
    lesson_id: Number(b.lesson_id || b.lessonId || lesson.id || 0),
    type: String(b.type || "text") as any,
    data: tryParseJSON(b.data ?? b.data_raw ?? b.payload ?? {}),
    sort: Number(b.sort || 0),
  }))

  const progressRaw = raw.progress || null
  const progress = progressRaw
    ? {
        id: Number(progressRaw.id || 0),
        lesson_id: Number(progressRaw.lesson_id || progressRaw.lessonId || lesson.id || 0),
        student_id: Number(progressRaw.student_id || progressRaw.studentId || 0),
        status: String(progressRaw.status || "not_started") as any,
        progress_percent: Number(progressRaw.progress_percent || progressRaw.progressPercent || 0),
        last_seen_at: parseLastSeen(progressRaw.last_seen_at || progressRaw.lastSeenAt || progressRaw.last_seen || null),
      }
    : undefined

  return {
    lesson: {
      id: Number(lesson.id || 0),
      module_id: Number(lesson.module_id || lesson.moduleId || 0),
      title: String(lesson.title || "Untitled lesson"),
      objectives: String(lesson.objectives || ""),
      sort: Number(lesson.sort || 0),
      is_published: Boolean(lesson.is_published ?? lesson.isPublished ?? true),
    },
    blocks,
    progress: progress ?? null,
  }
}

function parseNullableString(raw: any): string | null {
  if (raw == null) return null
  if (typeof raw === "string") return raw
  if (typeof raw === "object") {
    // handle sql.NullString-like shapes { String: "...", Valid: true }
    if (typeof raw.String === "string") return raw.String
    if (typeof raw.string === "string") return raw.string
  }
  return String(raw)
}

function normalizeAssignment(raw: any): Assignment | null {
  if (!raw || typeof raw !== "object") return null
  try {
    return {
      id: Number(raw.id || 0),
      lesson_id: Number(raw.lesson_id || raw.lessonId || 0),
      title: String(raw.title || "Untitled assignment"),
      description: String(raw.description || ""),
      rubric: parseNullableString(raw.rubric ?? raw.rubric_text ?? null),
      due_at: String(raw.due_at || raw.dueAt || null) || null,
      max_score: Number(raw.max_score || raw.maxScore || 0),
      created_at: String(raw.created_at || raw.createdAt || new Date().toISOString()),
    }
  } catch {
    return null
  }
}

// ---- Token helpers ----

const TOKEN_KEY = "unimentor_tokens"

function getTokens(): { accessToken: string; refreshToken: string } | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function setTokens(access: string, refresh: string) {
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ accessToken: access, refreshToken: refresh }))
}

function clearTokens() {
  sessionStorage.removeItem(TOKEN_KEY)
}

// ---- Generic fetch helpers ----

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens()
  if (!tokens?.refreshToken) return null
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: tokens.refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    setTokens(data.access_token, data.refresh_token)
    return data.access_token
  } catch {
    return null
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const tokens = getTokens()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }
  if (tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`
  }

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { 
      ...options, 
      headers,
      cache: options.cache || "no-store", // Prevent aggressive browser caching of API responses
    })
  } catch (e: any) {
    // Network error, CORS error, etc.
    console.error("API Fetch Network Error:", e)
    throw new Error(`Ошибка сети: Сервер недоступен или заблокирован (CORS). ${e.message || ""}`)
  }

  // If 401, try to refresh the token once
  if (res.status === 401 && tokens?.refreshToken) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(`${BASE}${path}`, { ...options, headers })
    }
  }

  if (!res.ok) {
    let body: any = null
    try {
      body = await res.json()
    } catch {
      // not JSON
    }
    const message = body ? extractErrorMessage(body) : `Ошибка ${res.status}`
    const err: any = new Error(String(message))
    err.status = res.status
    err.body = body
    throw err
  }

  // Some endpoints may return empty body (204 etc.)
  const text = await res.text()
  if (!text) return null as T
  return JSON.parse(text) as T
}

// ---- Auth ----

export const auth = {
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    setTokens(data.access_token, data.refresh_token)
    return {
      user: normalizeUser(data.user) || data.user,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
  },

  async register(full_name: string, email: string, password: string, role: string = "student"): Promise<RegisterResponse> {
    const bodyPayload: Record<string, unknown> = { email, password, full_name }
    if (role) bodyPayload.role = role
    const regData = await apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(bodyPayload),
    })
    
    // regData is already the user object (id, email, full_name, role, created_at)
    // We normalize it to ensure the role type is consistent
    return normalizeUser(regData) as any as RegisterResponse || regData
  },

  async me(): Promise<User> {
    const raw = await apiFetch<User>("/api/me")
    return normalizeUser(raw) || raw
  },

  clearTokens,
  getTokens,
  setTokens,
}

// ---- Courses ----

export const coursesApi = {
  /** List all published courses */
  async listPublished(): Promise<Course[]> {
    const raw = await apiFetch<any[]>("/api/courses")
    if (!raw || !Array.isArray(raw)) return []
    return raw.map(normalizeCourse).filter(Boolean) as Course[]
  },

  /** List courses the current user is enrolled in */
  async listMy(): Promise<Course[]> {
    const raw = await apiFetch<any[]>("/api/courses/my")
    if (!raw || !Array.isArray(raw)) return []
    return raw.map(normalizeCourse).filter(Boolean) as Course[]
  },

  /** Get course detail with modules, lessons, and progress */
  async get(courseId: number): Promise<CourseDetail> {
    const raw = await apiFetch<any>(`/api/courses/${courseId}`)
    // Defensive parsing: backend returns { course, modules, progress_summary }
    if (!raw || typeof raw !== "object") {
      throw new Error("Course not found")
    }
  const course = normalizeCourse(raw.course || raw)
  if (!course) throw new Error("Invalid course data")
    const modules: any[] = Array.isArray(raw.modules) ? raw.modules : []
    const normalizedModules = modules.map((m) => {
      const module = m.module || m
      const lessons = Array.isArray(m.lessons) ? m.lessons : []
      return {
        module: {
          id: Number(module.id || 0),
          course_id: Number(module.course_id || course.id || 0),
          title: String(module.title || "Untitled module"),
          sort: Number(module.sort || 0),
        },
        lessons: lessons.map((l: any) => ({
          id: Number(l.id || 0),
          module_id: Number(l.module_id || module.id || 0),
          title: String(l.title || "Untitled lesson"),
          objectives: String(l.objectives || ""),
          sort: Number(l.sort || 0),
          is_published: Boolean(l.is_published),
        })),
      }
    })

    const progress = raw.progress_summary || raw.progressSummary || raw.progress || { total_lessons: 0, completed_lessons: 0, progress_percent: 0 }

    return {
      course,
      modules: normalizedModules,
      progress_summary: {
        total_lessons: Number(progress.total_lessons || 0),
        completed_lessons: Number(progress.completed_lessons || 0),
        progress_percent: Number(progress.progress_percent || 0),
      },
    }
  },

  /** Enroll current user in a course */
  async enroll(courseId: number): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/api/courses/${courseId}/enroll`, {
      method: "POST",
    })
  },
}

// ---- Lessons ----

export const lessonsApi = {
  /** Get lesson detail (blocks + progress) */
  async get(lessonId: number): Promise<LessonDetail> {
    const raw = await apiFetch<any>(`/api/lessons/${lessonId}`)
    if (!raw) throw new Error("Lesson not found")
    return normalizeLessonDetail(raw)
  },

  /** Mark lesson as completed */
  async complete(lessonId: number): Promise<LessonDetail> {
    const raw = await apiFetch<any>(`/api/lessons/${lessonId}/complete`, {
      method: "POST",
    })
    if (!raw) throw new Error("Unexpected response from complete")
    return normalizeLessonDetail(raw)
  },
}

// ---- Assignments ----

export const assignmentsApi = {
  /** Get assignment for a lesson (may return null) */
  async getByLesson(lessonId: number): Promise<Assignment | null> {
    const raw = await apiFetch<any>(`/api/lessons/${lessonId}/assignment`)
    if (!raw) return null
    const norm = normalizeAssignment(raw)
    return norm
  },

  /** Submit answer to an assignment */
  async submit(
    assignmentId: number,
    payload: { answer_text: string; attachments?: string }
  ): Promise<Submission> {
    return apiFetch<Submission>(`/api/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  
  /** Get current user's submission for this assignment (may be 404/null if none) */
  async getSubmission(assignmentId: number): Promise<Submission | null> {
    try {
      const res = await apiFetch<Submission>(`/api/assignments/${assignmentId}/submission`)
      return res
    } catch {
      return null
    }
  },
}

// ---- Submissions ----

export const submissionsApi = {
  async get(submissionId: number): Promise<Submission> {
    return apiFetch<Submission>(`/api/submissions/${submissionId}`)
  },
}

// ---- AI ----

export const aiApi = {
  async ask(payload: {
    course_id: number
    lesson_id: number
    mode: AiMode
    message: string
  }): Promise<AiAskResponse> {
    const raw = await apiFetch<any>("/api/ai/ask", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    if (!raw) throw new Error("AI service error")
    const answer = String(raw.answer || raw.answer_text || raw.response || "")
    const citationsRaw = Array.isArray(raw.citations) ? raw.citations : []
    const citations = citationsRaw.map((c: any) => ({
      chunk_id: Number(c.chunk_id || c.chunkId || 0),
      lesson_id: Number(c.lesson_id || c.lessonId || payload.lesson_id || 0),
      score: Number(c.score || 0),
      title: String(c.title || c.name || ""),
    }))
    return { answer, citations }
  },
}

// ---- Teacher (stub — backend may not have these yet) ----
// These are kept as stubs that throw so the teacher UI doesn't crash.
// They will work once the backend implements teacher endpoints.

// Teacher endpoints live under the main API host at /api/teacher
const TEACHER_BASE = BASE

async function teacherFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const tokens = getTokens()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }
  if (tokens?.accessToken) headers["Authorization"] = `Bearer ${tokens.accessToken}`

  let res: Response
  try {
    res = await fetch(`${TEACHER_BASE}${path}`, { 
      ...options, 
      headers,
      cache: options.cache || "no-store", 
    })
  } catch (e: any) {
    console.error("Teacher API Network Error:", e)
    throw new Error(`Ошибка сети (Teacher API): Сервер недоступен. ${e.message || ""}`)
  }

  // If 401, try to refresh the token once
  if (res.status === 401 && tokens?.refreshToken) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`
      try {
        res = await fetch(`${TEACHER_BASE}${path}`, { 
          ...options, 
          headers,
          cache: options.cache || "no-store",
        })
      } catch (e: any) {
        throw new Error(`Ошибка сети при повторной попытке: ${e.message || ""}`)
      }
    }
  }

  if (!res.ok) {
    let body: any = null
    try {
      body = await res.json()
    } catch {
      // not json
    }
    const message = body ? extractErrorMessage(body) : `Ошибка ${res.status}`
    const err: any = new Error(String(message))
    err.status = res.status
    err.body = body
    throw err
  }

  const text = await res.text()
  if (!text) return null as T
  return JSON.parse(text) as T
}

export const teacherApi = {
  async myCourses(): Promise<Course[]> {
    const raw = await teacherFetch<any[]>("/api/teacher/courses/my")
    if (!raw || !Array.isArray(raw)) return []
    return raw.map(normalizeCourse).filter(Boolean) as Course[]
  },

  async createCourse(payload: {
    title: string
    description?: string
    language?: string
    cover_url?: string | null
  }): Promise<Course> {
    return teacherFetch<Course>("/api/teacher/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async updateCourse(courseId: number, payload: Partial<{ title: string; description: string; status: string; language: string; cover_url: string | null }>): Promise<Course> {
    return teacherFetch<Course>(`/api/teacher/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async createModule(payload: { course_id: number; title: string; sort?: number }): Promise<Module> {
    return teacherFetch<Module>("/api/teacher/modules", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async createLesson(payload: { module_id: number; title: string; objectives?: string; sort?: number; is_published?: boolean }): Promise<Lesson> {
    return teacherFetch<Lesson>("/api/teacher/lessons", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async upsertLessonBlocks(lessonId: number, blocks: Array<{ type: string; data: unknown; sort: number }>): Promise<{ message: string } | null> {
    return teacherFetch<{ message: string }>(`/api/teacher/lessons/${lessonId}/blocks`, {
      method: "POST",
      body: JSON.stringify(blocks),
    })
  },

  async getLessonBlocks(lessonId: number): Promise<LessonBlock[]> {
    // teacher endpoint doesn't provide a separate blocks endpoint, reuse lesson detail
    const detail = await lessonsApi.get(lessonId)
    return detail.blocks
  },

  async createAssignment(payload: {
    lesson_id: number
    title: string
    description?: string
    rubric?: string | null
    due_at?: string | null
    max_score?: number
  }): Promise<Assignment> {
    return teacherFetch<Assignment>("/api/teacher/assignments", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async updateAssignment(id: number, payload: Partial<{ title: string; description: string; rubric: string | null; due_at: string | null; max_score: number }>): Promise<Assignment> {
    return teacherFetch<Assignment>(`/api/teacher/assignments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async listSubmissions(assignmentId: number): Promise<Submission[]> {
    try {
      const raw = await teacherFetch<Submission[]>(`/api/teacher/assignments/${assignmentId}/submissions`)
      if (!raw || !Array.isArray(raw)) return []
      return raw
    } catch (e) {
      // If endpoint returns no content or errors, return empty array to keep UI stable
      return []
    }
  },

  async gradeSubmission(submissionId: number, payload: { score: number; teacher_feedback: string }): Promise<Submission> {
    return teacherFetch<Submission>(`/api/teacher/submissions/${submissionId}/grade`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async createMaterial(payload: { lesson_id: number; type: string; file_url?: string | null; source_text?: string | null }): Promise<any> {
    return teacherFetch<any>("/api/teacher/materials", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async listMaterials(lessonId: number): Promise<any[]> {
    // Try listing materials for a lesson (query param). If backend doesn't support this
    // it will either return 404 or an empty array.
    const q = `?lesson_id=${lessonId}`
    try {
      return teacherFetch<any[]>(`/api/teacher/materials${q}`)
    } catch (e) {
      // If not supported or not found, return empty array to keep UI stable
      return []
    }
  },

  async runIngest(materialId: number): Promise<{ message: string }> {
    return teacherFetch<{ message: string }>(`/api/teacher/materials/${materialId}/ingest`, {
      method: "POST",
    })
  },
}

// ---- Admin (stub) ----

export const adminApi = {
  async listUsers(): Promise<User[]> {
    throw new Error("Админ API ещё не реализован на сервере")
  },

  async listCourses(): Promise<Course[]> {
    // reuse published courses normalization
    return coursesApi.listPublished()
  },

  async setCourseStatus(_courseId: number, _status: "published" | "draft"): Promise<Course> {
    throw new Error("Смена статуса через API ещё не реализована на сервере")
  },
}
