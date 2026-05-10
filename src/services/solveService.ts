import api from './api'
import type { JobSubmittedResponse, JobStatusResponse, Page } from '../types'

export const solveService = {
  async submitQuestion(data: object): Promise<JobSubmittedResponse> {
    const res = await api.post<JobSubmittedResponse>('/solve', data)
    return res.data
  },

  async getJobStatus(jobId: number, email: string): Promise<JobStatusResponse> {
    const res = await api.get<JobStatusResponse>(`/jobs/${jobId}`, { params: { email } })
    return res.data
  },

  async getMyJobs(status?: string, page = 0, size = 20): Promise<{ data: Page<JobStatusResponse> }> {
    const res = await api.get('/jobs/my', {
      params: { status, page, size, sort: 'createdAt,desc' },
    })
    return res.data
  },
}
