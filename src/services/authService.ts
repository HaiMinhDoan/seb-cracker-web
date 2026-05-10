import api from './api'
import type { ApiResponse, AuthResponse } from '../types'

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password })
    return res.data.data
  },

  async register(data: {
    email: string
    password: string
    fullName: string
    phoneNumber?: string
    role?: string
  }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return res.data.data
  },
}
