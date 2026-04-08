import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const LEVELS = ['entry', 'mid', 'senior', 'lead'];

export default function Jobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const experience = searchParams.get('experience') || '';
  const page = Number(searchParams.get('page') || 1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (q) params.q = q;
      if (type) params.type = type;
      if (experience) params.experience = experience;

      const { data } = await api.get('/jobs', { params });
      setJobs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [q, type, experience, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const setParam = (key, val) => {
    const p = Object.fromEntries(searchParams);
    if (val) p[key] = val;
    else delete p[key];
    delete p.page;
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('q', search.trim());
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  const hasFilters = q || type || experience;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Discover Jobs 🚀
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {pagination
              ? `${pagination.total.toLocaleString()} jobs available`
              : 'Loading jobs...'}
          </p>
        </div>

        {/* Search + Filters */}
        <form
          onSubmit={handleSearch}
          className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg rounded-2xl p-4 flex flex-col md:flex-row gap-3 mb-8"
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <select
            value={type}
            onChange={(e) => setParam('type', e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={experience}
            onChange={(e) => setParam('experience', e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
            Search
          </button>
        </form>

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {q && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                {q}
              </span>
            )}
            {type && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs capitalize">
                {type}
              </span>
            )}
            {experience && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs capitalize">
                {experience}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-52 bg-white rounded-2xl shadow animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No jobs found
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl transition duration-200 hover:-translate-y-1"
              >
                <h2 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                  {job.title}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {job.company} • {job.location}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills?.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex justify-between items-center">
                  <span className="text-xs text-slate-400 capitalize">
                    {job.type}
                  </span>

                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-4 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => setParam('page', page - 1)}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-40"
            >
              Prev
            </button>

            <span className="text-sm text-slate-500">
              Page {page} of {pagination.pages}
            </span>

            <button
              disabled={page >= pagination.pages}
              onClick={() => setParam('page', page + 1)}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}