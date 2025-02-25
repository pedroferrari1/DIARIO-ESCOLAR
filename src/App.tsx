import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import SystemSettings from './pages/admin/SystemSettings';
import SchoolDashboard from './pages/SchoolDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AttendanceDashboard from './pages/admin/AttendanceDashboard';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
}

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminRoute>
                <UsersManagement />
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute>
              <AdminRoute>
                <SystemSettings />
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AttendanceDashboard />
              </AdminRoute>
            </PrivateRoute>
          }
        />

        {/* Rotas Escola */}
        <Route
          path="/school/*"
          element={
            <PrivateRoute>
              <SchoolDashboard />
            </PrivateRoute>
          }
        />

        {/* Rotas Professor */}
        <Route
          path="/teacher/*"
          element={
            <PrivateRoute>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />

        {/* Rota padrão */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : user.role === 'school'
                    ? '/school'
                    : '/teacher'
                }
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;