import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) =>
    pathname === path || pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium transition group ${
        isActive(to) ? 'text-indigo-600' : 'text-slate-600'
      }`}
    >
      {children}
      <span
        className={`absolute left-0 -bottom-1 h-0.5 bg-indigo-600 transition-all duration-300
        ${isActive(to) ? 'w-full' : 'w-0 group-hover:w-full'}`}
      />
    </Link>
  );

  return (
    <header className="sticky top-0 z-50">
      <div className="backdrop-blur-xl bg-white/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 text-2xl font-extrabold">
            <span className="text-slate-900">Hire</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Flow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/jobs">Browse Jobs</NavLink>
            {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {user.fullName}
                  </span>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      user.role === 'recruiter'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-slate-200 px-5 py-4 space-y-3">
          <Link
            to="/jobs"
            onClick={() => setOpen(false)}
            className="block text-slate-700 hover:text-indigo-600"
          >
            Browse Jobs
          </Link>

          {user && (
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="block text-slate-700 hover:text-indigo-600"
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="w-full text-left text-slate-700 hover:text-red-500"
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-slate-700"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 rounded-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}