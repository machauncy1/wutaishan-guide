import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn, getSavedRole } from '../services/authService';
import Loading from '../components/Loading';

const Login = lazy(() => import('../pages/Login'));
const GuideHome = lazy(() => import('../pages/GuideHome'));
const AdminHome = lazy(() => import('../pages/AdminHome'));

function RequireAuth({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: UserRole;
}) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && getSavedRole() !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RootRedirect() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const role = getSavedRole();
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/guide" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/guide"
            element={
              <RequireAuth allowedRole="guide">
                <GuideHome />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth allowedRole="admin">
                <AdminHome />
              </RequireAuth>
            }
          />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
