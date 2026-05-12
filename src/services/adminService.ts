import api from './api'
import type {
  ApiResponse, CustomerResponse, CustomerUpdateRequest,
  PromptVersionResponse, PromptVersionRequest, QuestionBank, Page
} from '../types'

export const adminService = {
  // Customers
  async listCustomers(page = 0, size = 20): Promise<ApiResponse<Page<CustomerResponse>>> {
    const res = await api.get('/admin/customers', { params: { page, size } })
    return res.data
  },
  async getCustomer(id: number): Promise<ApiResponse<CustomerResponse>> {
    const res = await api.get(`/admin/customers/${id}`)
    return res.data
  },
  async createCustomer(data: {
    email: string
    password: string
    fullName: string
    phoneNumber?: string
    role?: string
  }): Promise<ApiResponse<CustomerResponse>> {
    const res = await api.post('/admin/customers', data)
    return res.data
  },
  async updateCustomer(id: number, data: CustomerUpdateRequest): Promise<ApiResponse<CustomerResponse>> {
    const res = await api.patch(`/admin/customers/${id}`, data)
    return res.data
  },
  async extendAccess(id: number, days: number): Promise<ApiResponse<CustomerResponse>> {
    const res = await api.post(`/admin/customers/${id}/extend`, null, { params: { days } })
    return res.data
  },

  // Prompt Versions
  async listVersions(promptType: string): Promise<ApiResponse<PromptVersionResponse[]>> {
    const res = await api.get(`/admin/prompts/${promptType}/versions`)
    return res.data
  },
  async getActivePrompt(promptType: string): Promise<ApiResponse<PromptVersionResponse>> {
    const res = await api.get(`/admin/prompts/${promptType}/active`)
    return res.data
  },
  async createVersion(data: PromptVersionRequest): Promise<ApiResponse<PromptVersionResponse>> {
    const res = await api.post('/admin/prompts/versions', data)
    return res.data
  },
  async activateVersion(id: number): Promise<ApiResponse<PromptVersionResponse>> {
    const res = await api.post(`/admin/prompts/versions/${id}/activate`)
    return res.data
  },
  async getVersion(id: number): Promise<ApiResponse<PromptVersionResponse>> {
    const res = await api.get(`/admin/prompts/versions/${id}`)
    return res.data
  },

  // Question Bank
  async searchBank(subjectCode?: string, type?: string, page = 0, size = 20): Promise<ApiResponse<Page<QuestionBank>>> {
    const res = await api.get('/admin/question-bank', { params: { subjectCode, type, page, size } })
    return res.data
  },
  async verifyAnswer(id: number, answer: string): Promise<ApiResponse<void>> {
    const res = await api.patch(`/admin/question-bank/${id}/verify`, { answer })
    return res.data
  },
}