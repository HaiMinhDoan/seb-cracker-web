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
  full_name: string
}

// Customer
export interface CustomerResponse {
  id: number
  email: string
  full_name: string
  phone_number?: string
  role: string
  active: boolean
  ai_mode_enabled?: boolean
  access_expires_at: string
  created_at: string
}

export interface CustomerUpdateRequest {
  access_expires_at?: string
  ai_mode_enabled?: boolean
  active?: boolean
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
  id: number
  question_hash: string
  question_number: string
  question_type: string
  question_text?: string
  answer: string
  answer_source?: string
  success: boolean
  processing_time_ms?: number
  created_at: string
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

export interface HumanAnswerSubmit {
  jobId: number
  answer: string
}

// Prompt
export interface PromptVersionResponse {
  id: number
  prompt_type: string
  version_number: number
  version_label?: string
  prompt_template: string
  is_active: boolean
  created_by: string
  notes?: string
  created_at: string
  activated_at?: string
}

export interface PromptVersionRequest {
  prompt_type: string
  version_label?: string
  prompt_template: string
  notes?: string
}

// Question Bank
export interface QuestionBank {
  id: number
  question_hash: string
  normalized_text: string
  original_text: string
  question_type: 'SINGLECHOICE' | 'MULTIPLECHOICE' | 'TRUEFALSE' | 'ESSAY'
  options?: { label: string; text: string }[]
  answer: string
  subject_code: string
  hit_count: number
  is_verified: boolean
  prompt_version_id?: number
  created_at: string
  updated_at: string
}
