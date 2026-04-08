import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, StatusBadge, Modal } from '../components/ui/index.jsx';

function ApplyModal({ jobId, onClose, onSuccess }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('jobId', jobId);

      if (coverLetter) fd.append('coverLetter', coverLetter);
      if (file) fd.append('resume', file);

      await api.post('/applications/apply', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Apply for this role" onClose={onClose}>
      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="flex flex-col gap-4">
        {/* Resume */}
        <div className="form-group">
          <label className="label">
            Resume{' '}
            <span className="text-slate-400 font-normal">
              (PDF/DOC, max 5MB)
            </span>
          </label>

          {user?.resumeUrl && !file && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-2">
              <span className="text-sm text-emerald-700">
                Using your saved resume
              </span>
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-xs text-emerald-600 hover:underline"
              >
                View
              </a>
            </div>
          )}

          <div
            onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-colors
              ${
                file
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
              }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm text-brand-700">
                <span>📄</span>
                <span className="font-medium truncate max-w-xs">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-slate-400 hover:text-red-500 ml-1"
                >
                  ×
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Click to upload your resume
              </p>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>

        {/* Cover letter */}
        <div className="form-group">
          <label className="label">
            Cover letter{' '}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>

          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={5}
            className="input resize-none"
            placeholder="Tell the recruiter why you're a great fit…"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="btn btn-secondary flex-1">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary flex-1"
        >
          {loading ? <Spinner size="sm" /> : 'Submit application'}
        </button>
      </div>
    </Modal>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.data);
      } catch (err) {
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();

    if (user?.role === 'seeker') {
      api
        .get('/users/saved-jobs')
        .then(({ data }) =>
          setSaved(data.data.some((j) => j._id === id))
        )
        .catch(() => {});
    }
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const { data } = await api.post(`/users/save-job/${id}`);
      setSaved(data.saved);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition"
        >
          ← Back to jobs
        </Link>

        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-slate-100">

          <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {job.title}
              </h1>
              <p className="text-slate-500 text-sm">
                {job.company} • {job.location}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={job.type} />
              <StatusBadge status={job.experience} />
              <StatusBadge status={job.status} />
            </div>
          </div>

          {job.salary?.min && (
            <div className="inline-block bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md mb-6">
              💰 {job.salary.currency} {job.salary.min.toLocaleString()}
              {job.salary.max
                ? ` – ${job.salary.max.toLocaleString()}`
                : '+'}{' '}
              / yr
            </div>
          )}

          <div className="text-slate-700 text-[15px] leading-relaxed mb-8 whitespace-pre-line">
            {job.description}
          </div>

          {job.skills?.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Required skills
              </p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-t pt-6">
            <p className="text-sm text-slate-400">
              Posted by{' '}
              <span className="text-slate-600 font-medium">
                {job.postedBy?.fullName}
              </span>
              {' • '}
              {job.applicantCount} applicant
              {job.applicantCount !== 1 ? 's' : ''}
            </p>

            <div className="flex gap-3 flex-wrap">
              {user?.role === 'seeker' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                    ${
                      saved
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    }`}
                >
                  {saved ? '★ Saved' : '☆ Save'}
                </button>
              )}

              {user?.role === 'seeker' ? (
                applied ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    ✓ Applied
                  </span>
                ) : job.status === 'open' ? (
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition"
                  >
                    Apply Now 🚀
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium">
                    Closed
                  </span>
                )
              ) : !user ? (
                <Link
                  to="/login"
                  state={{ from: `/jobs/${id}` }}
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
                >
                  Login to Apply
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ApplyModal
          jobId={id}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setApplied(true);
          }}
        />
      )}
    </div>
  );
}
