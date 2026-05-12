import api from './api'
import type { ApiResponse, ExamSessionResponse, QuestionRecordResponse, Page } from '../types'

export const sessionService = {
  async getMySessions(page = 0, size = 20): Promise<ApiResponse<Page<ExamSessionResponse>>> {
    const res = await api.get('/sessions/my', { params: { page, size } })
    return res.data
  },
  async getSessionQuestions(sessionId: number): Promise<ApiResponse<QuestionRecordResponse[]>> {
    const res = await api.get(`/sessions/${sessionId}/questions`)
    return res.data
  },
}