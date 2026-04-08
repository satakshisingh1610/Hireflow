import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import Navbar           from './components/Navbar';

import Login               from './pages/Login';
import Signup              from './pages/Signup';
import Jobs                from './pages/Jobs';
import JobDetail           from './pages/JobDetail';
import Dashboard           from './pages/Dashboard';
import SeekerDashboard     from './pages/SeekerDashboard';
import RecruiterDashboard  from './pages/RecruiterDashboard';

export default function App() {
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<Navigate to="/jobs" replace />} />
            <Route path="/jobs"     element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/signup"   element={<Signup />} />

            {/* Any logged-in user → redirects by role */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Seeker only */}
            <Route element={<ProtectedRoute role="seeker" />}>
              <Route path="/dashboard/seeker" element={<SeekerDashboard />} />
            </Route>

            {/* Recruiter only */}
            <Route element={<ProtectedRoute role="recruiter" />}>
              <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
