// Auth
export interface AuthResponse {
  token: string
  email: string
  role: string
  full_name: string
  ai_mode_enabled: boolean
  access_expires_at?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Customer
export interface CustomerResponse {
  id: number
  email: string
  role: string
  active: boolean
  full_name: string
  phone_number?: string
  ai_mode_enabled: boolean
  access_expires_at?: string
  created_at: string
}

export interface CustomerUpdateRequest {
  access_expires_at?: string
  ai_mode_enabled?: boolean
  active?: boolean
}

// Solve / Job
export interface SolveRequest {
  session: {
    email: string
    exam_code: string
    subject_code: string
    device_id: string
  }
  question: {
    number: string
    text: string
    options: { label: string; text: string }[]
    question_type: string
    screenshot_base64?: string
  }
  question_id: string
  captured_at: string
}

export interface JobSubmittedResponse {
  status: string
  message: string
  job_id: number
  question_id: string
}

export interface JobStatusResponse {
  status: string
  answer?: string
  job_id: number
  question_id: string
  answer_source?: string
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
  created_at: string
}

export interface QuestionRecordResponse {
  id: number
  answer?: string
  success: boolean
  question_hash: string
  question_number: string
  question_type: string
  question_text: string
  answer_source: string
  processing_time_ms?: number
  created_at: string
}

// Prompt
export interface PromptVersionResponse {
  id: number
  notes?: string
  prompt_type: string
  version_number: number
  version_label?: string
  prompt_template: string
  is_active: boolean
  created_by: string
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
  questionHash: string
  normalizedText: string
  originalText: string
  questionType: 'SINGLECHOICE' | 'MULTIPLECHOICE' | 'TRUEFALSE' | 'ESSAY'
  optionsJson: string
  answer: string
  subjectCode: string
  hitCount: number
  verified: boolean
  promptVersionId?: number
  createdAt: string
  updatedAt: string
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
