import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState, StatusBadge, Modal } from '../components/ui/index.jsx';

const JOB_TYPES   = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS  = ['entry', 'mid', 'senior', 'lead'];
const APP_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected'];

const TABS = [
  { id: 'jobs',    label: 'My jobs' },
  { id: 'profile', label: 'Profile' },
];

// ── Post/Edit job modal ───────────────────────────────────────────────────────
function JobFormModal({ initial, onClose, onSaved }) {
  const { user } = useAuth();
  const editing = !!initial;
  const empty = { title: '', description: '', location: '', type: 'full-time', experience: 'entry', skills: '', salaryMin: '', salaryMax: '', status: 'open' };
  const [form, setForm] = useState(initial ? {
    ...initial,
    skills: initial.skills?.join(', ') || '',
    salaryMin: initial.salary?.min || '',
    salaryMax: initial.salary?.max || '',
  } : empty);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location) {
      setError('Title, description and location are required'); return;
    }
    setLoading(true); setError('');
    try {
      const payload = {
        title: form.title, description: form.description, location: form.location,
        type: form.type, experience: form.experience, status: form.status,
        company: user.company,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        salary: form.salaryMin ? { min: Number(form.salaryMin), max: Number(form.salaryMax) || null, currency: 'USD' } : undefined,
      };
      const { data } = editing
        ? await api.put(`/jobs/${initial._id}`, payload)
        : await api.post('/jobs', payload);
      onSaved(data.data, editing);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    } finally { setLoading(false); }
  };

  return (
    <Modal title={editing ? 'Edit job' : 'Post a job'} onClose={onClose}>
      {error && <div className="alert-error mb-4">{error}</div>}
      <div className="flex flex-col gap-4">
        <div className="form-group">
          <label className="label">Job title *</label>
          <input className="input" value={form.title} onChange={set('title')} placeholder="Senior Frontend Engineer" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="label">Location *</label>
            <input className="input" value={form.location} onChange={set('location')} placeholder="Remote / Delhi" />
          </div>
          <div className="form-group">
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={set('type')}>
              {JOB_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="label">Experience</label>
            <select className="input" value={form.experience} onChange={set('experience')}>
              {EXP_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="open">Open</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="label">Min salary (USD)</label>
            <input className="input" type="number" value={form.salaryMin} onChange={set('salaryMin')} placeholder="80000" />
          </div>
          <div className="form-group">
            <label className="label">Max salary</label>
            <input className="input" type="number" value={form.salaryMax} onChange={set('salaryMax')} placeholder="120000" />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Skills <span className="text-slate-400 font-normal">(comma-separated)</span></label>
          <input className="input" value={form.skills} onChange={set('skills')} placeholder="React, Node.js, MongoDB" />
        </div>
        <div className="form-group">
          <label className="label">Description *</label>
          <textarea className="input resize-none" rows={6} value={form.description} onChange={set('description')}
            placeholder="Describe the role, responsibilities, and requirements…" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="btn btn-primary flex-1">
          {loading ? <Spinner size="sm" /> : editing ? 'Save changes' : 'Post job'}
        </button>
      </div>
    </Modal>
  );
}

// ── Applicants panel ──────────────────────────────────────────────────────────
function ApplicantsModal({ job, onClose }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get(`/applications/job/${job._id}`);

        // Handle different backend response shapes safely
        const applications =
          data?.data ||
          data?.applications ||
          data ||
          [];

        setApps(Array.isArray(applications) ? applications : []);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [job._id]);

  const updateStatus = async (appId, status) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status });

      setApps(prev =>
        prev.map(a =>
          a._id === appId ? { ...a, status } : a
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const visible = filter ? apps.filter(a => a.status === filter) : apps;

  return (
    <Modal title={`Applicants — ${job.title}`} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {apps.length} total applicant{apps.length !== 1 ? 's' : ''}
        </p>

        <select
          className="input w-40 py-1.5 text-sm"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {APP_STATUSES.map(s => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          {filter ? 'No applicants with this status' : 'No applications yet'}
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {visible.map(app => (
            <div key={app._id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {app.applicant?.fullName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {app.applicant?.email}
                  </p>

                  {app.applicant?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {app.applicant.skills.slice(0, 5).map(s => (
                        <span
                          key={s}
                          className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm text-xs"
                    >
                      Resume ↗
                    </a>
                  )}

                  <select
                    value={app.status}
                    onChange={e => updateStatus(app._id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 outline-none cursor-pointer
                      ${app.status === 'shortlisted'
                        ? 'bg-emerald-50 text-emerald-700'
                        : app.status === 'reviewed'
                        ? 'bg-brand-50 text-brand-700'
                        : app.status === 'rejected'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {APP_STATUSES.map(s => (
                      <option key={s} value={s} className="bg-white text-slate-800 capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {app.coverLetter && (
                <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 line-clamp-3">
                  {app.coverLetter}
                </p>
              )}

              <p className="mt-1.5 text-xs text-slate-400">
                Applied {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
// ── Main dashboard ────────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab]           = useState('jobs');
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [postModal, setPostModal] = useState(false);
  const [editJob, setEditJob]   = useState(null);
  const [viewJob, setViewJob]   = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', company: user?.company || '', companyWebsite: user?.companyWebsite || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    api.get('/jobs/my')
      .then(({ data }) => setJobs(data.data))
      .finally(() => setLoading(false));
  }, []);

  const onJobSaved = (job, editing) => {
    setJobs(prev => editing ? prev.map(j => j._id === job._id ? job : j) : [job, ...prev]);
    setPostModal(false); setEditJob(null);
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    await api.delete(`/jobs/${jobId}`);
    setJobs(prev => prev.filter(j => j._id !== jobId));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSavingProfile(true); setProfileMsg('');
    try {
      const { data } = await api.put('/users/profile', profileForm);
      updateUser(data.user); setProfileMsg('✓ Profile updated');
    } catch (err) {
      setProfileMsg('✗ ' + (err.response?.data?.message || 'Update failed'));
    } finally { setSavingProfile(false); }
  };

  const totalApplicants = jobs.reduce((n, j) => n + j.applicantCount, 0);

  return (
    <div className="page">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Recruiter dashboard</h1>
          <p className="mt-1 text-slate-500">{user?.fullName} · {user?.company}</p>
        </div>
        <button onClick={() => setPostModal(true)} className="btn btn-primary">+ Post a job</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Active jobs',      value: jobs.filter(j => j.status === 'open').length, color: 'text-brand-600' },
          { label: 'Total applicants', value: totalApplicants, color: 'text-slate-800' },
          { label: 'Drafts / Closed',  value: jobs.filter(j => j.status !== 'open').length, color: 'text-slate-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Jobs tab ── */}
      {tab === 'jobs' && (
        loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : jobs.length === 0 ? (
          <EmptyState icon="📋" title="No jobs posted yet"
            description="Post your first job to start receiving applications"
            action={<button onClick={() => setPostModal(true)} className="btn btn-primary">Post your first job</button>} />
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job._id} className="card flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate">{job.title}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{job.location} · <span className="capitalize">{job.type}</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''} ·
                    Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button onClick={() => setViewJob(job)} className="btn btn-secondary btn-sm">
                    View applicants
                  </button>
                  <button onClick={() => setEditJob(job)} className="btn btn-ghost btn-sm">Edit</button>
                  <button onClick={() => deleteJob(job._id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Profile tab ── */}
      {tab === 'profile' && (
        <div className="max-w-lg">
          <form onSubmit={handleProfileSave} className="card flex flex-col gap-4">
            <h3 className="font-display font-semibold text-slate-900">Company profile</h3>
            {profileMsg && (
              <div className={profileMsg.startsWith('✓') ? 'alert-success' : 'alert-error'}>{profileMsg}</div>
            )}
            <div className="form-group">
              <label className="label">Full name</label>
              <input className="input" value={profileForm.fullName}
                onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Company name</label>
              <input className="input" value={profileForm.company}
                onChange={e => setProfileForm(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Company website</label>
              <input className="input" type="url" value={profileForm.companyWebsite}
                placeholder="https://example.com"
                onChange={e => setProfileForm(p => ({ ...p, companyWebsite: e.target.value }))} />
            </div>
            <button type="submit" disabled={savingProfile} className="btn btn-primary self-start">
              {savingProfile ? <Spinner size="sm" /> : 'Save changes'}
            </button>
          </form>
        </div>
      )}
      

      {/* Modals */}
      {postModal && <JobFormModal onClose={() => setPostModal(false)} onSaved={onJobSaved} />}
      {editJob   && <JobFormModal initial={editJob} onClose={() => setEditJob(null)} onSaved={onJobSaved} />}
      {viewJob   && <ApplicantsModal job={viewJob} onClose={() => setViewJob(null)} />}
    </div>
  );
}