import { Link } from 'react-router-dom';
import { useState } from 'react';
import { StatusBadge } from './ui/index.jsx';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

function timeAgo(date) {
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

export default function JobCard({ job, savedIds = [], onSaveToggle }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const isSaved = savedIds.includes(job._id);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/users/save-job/${job._id}`);
      onSaveToggle?.(job._id, data.saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="bg-white/70 backdrop-blur-lg border border-slate-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug truncate">
            {job.title}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5 truncate">
            {job.company} · {job.location}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={job.type} />
          {user?.role === 'seeker' && (
            <button
              onClick={handleSave}
              disabled={saving}
              title={isSaved ? 'Unsave' : 'Save job'}
              className={`p-2 rounded-xl transition-colors ${
                isSaved
                  ? 'text-pink-600 bg-pink-50 hover:bg-pink-100'
                  : 'text-slate-300 hover:text-pink-500 hover:bg-pink-50'
              }`}
            >
              <svg
                className="w-5 h-5 transition-transform duration-200"
                fill={isSaved ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">{job.description}</p>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((s, idx) => (
            <span
              key={s}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                ['bg-indigo-100 text-indigo-700','bg-emerald-100 text-emerald-700','bg-purple-100 text-purple-700','bg-pink-100 text-pink-700'][idx%4]
              }`}
            >
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-slate-400 mt-1">+{job.skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto text-sm text-slate-400">
        <span>{timeAgo(job.createdAt)}</span>
        <div className="flex items-center gap-4">
          {job.salary?.min && (
            <span className="text-emerald-600 font-semibold">
              {job.salary.currency} {job.salary.min.toLocaleString()}
              {job.salary.max ? `–${job.salary.max.toLocaleString()}` : '+'}
            </span>
          )}
          <span>{job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
}