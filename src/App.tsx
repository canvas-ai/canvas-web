import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/login'
import RegisterPage from './pages/auth/register'
import WorkspacesPage from './pages/workspaces'
import WorkspaceDetailPage from './pages/workspace-detail'
import HomePage from './pages/home'
import { ProtectedRoute } from './components/auth/protected-route'
import { PublicRoute } from './components/auth/public-route'
import ContextsPage from './pages/contexts'
import ContextDetailPage from './pages/context-detail'
import ApiTokensPage from './pages/api-tokens'
import { DashboardLayout } from './components/layouts/dashboard-layout'
import { ToastContainer } from './components/ui/toast-container'

function App() {
  return (
    <ToastContainer>
      <BrowserRouter>
        <Routes>
          {/* Authentication routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Dashboard layout for authenticated routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/workspaces" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
            <Route path="contexts" element={<ContextsPage />} />
            <Route path="contexts/:contextId" element={<ContextDetailPage />} />
            <Route path="users/:userId/contexts/:contextId" element={<ContextDetailPage />} />
            <Route path="api-tokens" element={<ApiTokensPage />} />
          </Route>

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastContainer>
  )
}

export default App
