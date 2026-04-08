import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from || null;

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(from || (user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/seeker'));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">

    {/* Card */}
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back 👋
        </h1>
        <p className="text-slate-500 text-sm">
          Sign in to your HireFlow account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Email
          </label>
          <input
            type="email"
            required
            autoFocus
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none transition"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Password
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none transition"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:scale-[1.02] transition-all flex items-center justify-center"
        >
          {loading ? <Spinner size="sm" /> : 'Log in'}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Sign up
        </Link>
      </p>

    </div>
  </div>
);
}
