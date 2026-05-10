import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import DashboardLayout from './components/layout/DashboardLayout'
import SolvePage from './components/solve/SolvePage'
import JobsPage from './components/solve/JobsPage'
import SessionsPage from './components/sessions/SessionsPage'
import AdminCustomers from './components/admin/AdminCustomers'
import AdminPrompts from './components/admin/AdminPrompts'
import AdminQuestionBank from './components/admin/AdminQuestionBank'
import ProfilePage from './components/dashboard/ProfilePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/solve" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E1E16',
            color: '#F5F5E8',
            border: '1px solid #3A3A28',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#C8F53C', secondary: '#0D0D0D' } },
          error: { iconTheme: { primary: '#FF5C1A', secondary: '#0D0D0D' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/solve" replace />} />
          <Route path="solve" element={<SolvePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="admin/customers"
            element={
              <AdminRoute>
                <AdminCustomers />
              </AdminRoute>
            }
          />
          <Route
            path="admin/prompts"
            element={
              <AdminRoute>
                <AdminPrompts />
              </AdminRoute>
            }
          />
          <Route
            path="admin/question-bank"
            element={
              <AdminRoute>
                <AdminQuestionBank />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/solve" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
