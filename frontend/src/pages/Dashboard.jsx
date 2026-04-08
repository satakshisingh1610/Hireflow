import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // ❗ If user not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❗ Loader screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4 animate-pulse">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="opacity-80">Setting up your dashboard...</p>

          <div className="mt-6 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // ❗ Role-based redirect
  const redirectPath =
    user.role === 'recruiter'
      ? '/dashboard/recruiter'
      : '/dashboard/seeker';

  return <Navigate to={redirectPath} replace />;
}