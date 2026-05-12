import api from './api'
import type { ApiResponse, ExamSessionResponse, JobStatusResponse, HumanJobDetail, Page } from '../types'

export const humanService = {
  async getSessions(page = 0, size = 20): Promise<ApiResponse<Page<ExamSessionResponse>>> {
    const res = await api.get('/human/sessions', { params: { page, size } })
    return res.data
  },

  async getSessionJobs(sessionId: number, page = 0, size = 20): Promise<ApiResponse<Page<JobStatusResponse>>> {
    const res = await api.get(`/human/sessions/${sessionId}/jobs`, { params: { page, size } })
    return res.data
  },

  async getJobDetail(jobId: number): Promise<ApiResponse<HumanJobDetail>> {
    const res = await api.get(`/human/jobs/${jobId}`)
    return res.data
  },

  async submitAnswer(jobId: number, answer: string): Promise<ApiResponse<JobStatusResponse>> {
    const res = await api.post(`/human/jobs/${jobId}/answer`, { answer })
    return res.data
  },
}
