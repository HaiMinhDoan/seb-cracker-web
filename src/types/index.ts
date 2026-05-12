export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
}
// Auth
export interface AuthResponse {
  id: number
  token: string
  email: string
  role: string
  fullName: string
}

// Customer
export interface CustomerResponse {
  id: number
  email: string
  fullName: string
  phoneNumber?: string
  role: string
  aiModeEnabled: boolean
  accessExpiresAt?: string
  isActive: boolean
  createdAt: string
}

export interface CustomerUpdateRequest {
  fullName?: string
  phoneNumber?: string
  aiModeEnabled?: boolean
  accessExpiresAt?: string
  isActive?: boolean
}

// Job
export interface JobSubmittedResponse {
  jobId: number
  status: string
  message: string
}

export type JobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | 'SKIPPED' | 'WAITING_HUMAN'
export type AnswerSource = 'BANK' | 'AI' | 'HUMAN' | 'NONE'

export interface JobStatusResponse {
  job_id: number
  question_id: string
  status: JobStatus
  answer?: string
  answer_source?: AnswerSource
  auto_click: boolean
  error_message?: string
  processing_time_ms?: number
  created_at: string
  updated_at: string
}

// Session
export interface ExamSessionResponse {
  id: number
  exam_code: string
  subject_code: string
  device_id: string
  pending_count?: number
  created_at: string
}

export interface QuestionRecordResponse {
  questionNumber: string
  questionText: string
  questionType: string
  answer?: string
  answerSource: string
  processingTimeMs?: number
}

// Human Solver
export interface HumanJobDetail {
  job_id: number
  question_id: string
  question_number: string
  question_text: string
  question_type: string
  options: { label: string; text: string }[]
  answer?: string
  status: JobStatus
  answer_source: string
  auto_click: string
  created_at: string
  updated_at: string
}

// Prompt
export interface PromptVersionResponse {
  id: number
  promptType: string
  versionNumber: number
  versionLabel?: string
  promptTemplate: string
  isActive: boolean
  createdBy: string
  notes?: string
  createdAt: string
  activatedAt?: string
}

export interface PromptVersionRequest {
  promptType: string
  versionLabel?: string
  promptTemplate: string
  notes?: string
}

// Question Bank
export interface QuestionBank {
  id: number
  questionHash: string
  questionText: string
  questionType: 'SINGLECHOICE' | 'MULTIPLECHOICE' | 'TRUEFALSE' | 'ESSAY'
  answer: string
  subjectCode: string
  hitCount: number
  isVerified: boolean
  options?: { label: string; text: string }[]
  createdAt: string
}