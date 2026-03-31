// ============================================================
// UniMentor — Data Types & Interfaces (real backend)
// ============================================================

export type Role = "student" | "teacher" | "admin"

export type CourseStatus = "draft" | "published"

export type LessonBlockType =
  | "text"
  | "callout"
  | "file"
  | "video"
  | "link"
  | "image"
  | "code"
  | "table"

export type LessonProgressStatus = "not_started" | "in_progress" | "completed"

export type SubmissionStatus = "submitted" | "reviewed"

export type AiMode = "explain" | "quiz" | "check_homework" | "plan"

// ---- Core Entities (matching backend JSON) ----

export interface User {
  id: number
  full_name: string
  email: string
  role: Role
  created_at: string
}

export interface Course {
  id: number
  teacher_id: number
  title: string
  description: string
  status: CourseStatus
  language: string
  cover_url: string | null
  created_at: string
}

export interface Module {
  id: number
  course_id: number
  title: string
  sort: number
}

export interface Lesson {
  id: number
  module_id: number
  title: string
  objectives: string
  sort: number
  is_published: boolean
}

export interface LessonBlock {
  id: number
  lesson_id: number
  type: LessonBlockType
  /** The backend stores data as a JSON string in this field */
  data: string | Record<string, unknown>
  sort: number
}

export interface LessonProgress {
  id: number
  lesson_id: number
  student_id: number
  status: LessonProgressStatus
  progress_percent: number
  last_seen_at: string | null
}

export interface Assignment {
  id: number
  lesson_id: number
  title: string
  description: string
  rubric: string | null
  due_at: string | null
  max_score: number
  created_at: string
}

export interface Submission {
  id: number
  assignment_id: number
  student_id: number
  answer_text: string
  attachments: string | null
  status: SubmissionStatus
  ai_feedback: string | null
  teacher_feedback: string | null
  score: number | null
  created_at: string
  graded_at: string | null
}

export interface AiCitation {
  chunk_id: number
  lesson_id: number
  score: number
  title: string
}

export interface AiAskResponse {
  answer: string
  citations: AiCitation[]
}

// ---- Composite responses from backend ----

export interface ProgressSummary {
  total_lessons: number
  completed_lessons: number
  progress_percent: number
}

export interface ModuleWithLessons {
  module: Module
  lessons: Lesson[]
}

export interface CourseDetail {
  course: Course
  modules: ModuleWithLessons[]
  progress_summary?: ProgressSummary
}

export interface LessonDetail {
  lesson: Lesson
  blocks: LessonBlock[]
  progress?: LessonProgress | null
}

// ---- Auth ----

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterResponse {
  id: number
  email: string
  full_name: string
  role: Role
  created_at: string
}

// ---- Chat (client-side only) ----

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: AiCitation[]
  mode?: AiMode
  timestamp: string
}
