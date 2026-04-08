import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'seeker',
    company: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await signup(form);
      navigate(
        user.role === 'recruiter'
          ? '/dashboard/recruiter'
          : '/dashboard/seeker'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-100 px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Create your account
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Join <span className="text-indigo-600 font-semibold">HireFlow</span> and start applying today
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                I am a
              </label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { value: 'seeker', label: 'Job Seeker' },
                  { value: 'recruiter', label: 'Recruiter' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, role: r.value }))
                    }
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      form.role === r.value
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={set('fullName')}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={set('password')}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="••••••••"
              />
            </div>

            {/* Company */}
            {form.role === 'recruiter' && (
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={set('company')}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Google / Microsoft"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center"
            >
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}