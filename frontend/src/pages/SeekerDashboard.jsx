import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState, StatusBadge, Modal } from '../components/ui/index.jsx';
import JobCard from '../components/JobCard';

const TABS = [
  { id: 'applications', label: 'My Applications' },
  { id: 'saved',        label: 'Saved Jobs'       },
  { id: 'profile',      label: 'Profile'           },
];

export default function SeekerDashboard() {
  const { user, updateUser } = useAuth();
  const [tab,          setTab]          = useState('applications');
  const [applications, setApplications] = useState([]);
  const [savedJobs,    setSavedJobs]    = useState([]);
  const [loadingApps,  setLoadingApps]  = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    bio:      user?.bio      || '',
    skills:   user?.skills?.join(', ') || '',
  });
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [profileMsg,     setProfileMsg]     = useState('');

  // Resume upload
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeMsg,       setResumeMsg]       = useState('');
  const fileRef = useRef();

  // Load applications on mount
  useEffect(() => {
    api.get('/applications/my')
      .then(({ data }) => setApplications(data.data))
      .finally(() => setLoadingApps(false));
  }, []);

  // Lazy-load saved jobs
  useEffect(() => {
    if (tab === 'saved' && savedJobs.length === 0) {
      setLoadingSaved(true);
      api.get('/users/saved-jobs')
        .then(({ data }) => setSavedJobs(data.data))
        .finally(() => setLoadingSaved(false));
    }
  }, [tab]); // eslint-disable-line

  const counts = {
    total:       applications.length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    reviewed:    applications.filter((a) => a.status === 'reviewed').length,
    rejected:    applications.filter((a) => a.status === 'rejected').length,
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true); setProfileMsg('');
    try {
      const skills = profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
      const { data } = await api.put('/users/profile', { ...profileForm, skills });
      updateUser(data.user);
      setProfileMsg('✓ Profile updated successfully');
    } catch (err) {
      setProfileMsg('✗ ' + (err.response?.data?.message || 'Update failed'));
    } finally { setSavingProfile(false); }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true); setResumeMsg('');
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await api.post('/users/upload-resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ resumeUrl: data.resumeUrl });
      setResumeMsg('✓ Resume uploaded successfully');
    } catch (err) {
      setResumeMsg('✗ ' + (err.response?.data?.message || 'Upload failed'));
    } finally {
      setResumeUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleUnsave = (jobId) => {
    setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            My Dashboard 👋
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Welcome back, {user?.fullName}
          </p>
        </div>

        <Link
          to="/jobs"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          Browse Jobs
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total', value: counts.total, bg: 'from-slate-700 to-slate-900' },
          { label: 'Shortlisted', value: counts.shortlisted, bg: 'from-emerald-500 to-emerald-600' },
          { label: 'Reviewed', value: counts.reviewed, bg: 'from-indigo-500 to-indigo-600' },
          { label: 'Rejected', value: counts.rejected, bg: 'from-red-500 to-red-600' },
        ].map(({ label, value, bg }) => (
          <div
            key={label}
            className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r ${bg}`}
          >
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs opacity-90 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === t.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-500 border hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* APPLICATIONS */}
      {tab === 'applications' && (
        loadingApps ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              No applications yet
            </h2>
            <p className="text-slate-400 mb-4">
              Start applying to jobs and track your progress
            </p>
            <Link to="/jobs" className="px-5 py-2 bg-indigo-600 text-white rounded-lg">
              Find Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5 border border-slate-100 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/jobs/${app.job?._id}`}
                    className="font-semibold text-slate-800 hover:text-indigo-600 transition block truncate"
                  >
                    {app.job?.title}
                  </Link>

                  <p className="text-sm text-slate-500">
                    {app.job?.company} · {app.job?.location}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <StatusBadge status={app.status} />
                  {app.job?.status !== 'open' && (
                    <StatusBadge status={app.job?.status} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* SAVED JOBS */}
      {tab === 'saved' && (
        loadingSaved ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              No saved jobs
            </h2>
            <p className="text-slate-400 mb-4">
              Bookmark jobs while browsing
            </p>
            <Link to="/jobs" className="px-5 py-2 bg-indigo-600 text-white rounded-lg">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5 border border-slate-100"
              >
                <h3 className="font-semibold text-slate-800 mb-1">
                  {job.title}
                </h3>

                <p className="text-sm text-slate-500 mb-3">
                  {job.company} · {job.location}
                </p>

                <Link
                  to={`/jobs/${job._id}`}
                  className="text-indigo-600 text-sm font-medium hover:underline"
                >
                  View Job →
                </Link>
              </div>
            ))}
          </div>
        )
      )}

      {/* PROFILE */}
      {tab === 'profile' && (
        <div className="grid md:grid-cols-2 gap-6">

          {/* PROFILE FORM */}
          <form
            onSubmit={handleProfileSave}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 border"
          >
            <h3 className="text-lg font-semibold text-slate-800">
              Personal Info
            </h3>

            {profileMsg && (
              <div className={`text-sm px-4 py-2 rounded-lg ${
                profileMsg.startsWith('✓')
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {profileMsg}
              </div>
            )}

            <input
              className="input"
              placeholder="Full Name"
              value={profileForm.fullName}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, fullName: e.target.value }))
              }
            />

            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Your bio..."
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, bio: e.target.value }))
              }
            />

            <input
              className="input"
              placeholder="Skills (React, Node, ML...)"
              value={profileForm.skills}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, skills: e.target.value }))
              }
            />

            <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg self-start">
              {savingProfile ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </form>

          {/* RESUME */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5 border">
            <h3 className="text-lg font-semibold text-slate-800">
              Resume
            </h3>

            {resumeMsg && (
              <div className={`text-sm px-4 py-2 rounded-lg ${
                resumeMsg.startsWith('✓')
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {resumeMsg}
              </div>
            )}

            {user?.resumeUrl ? (
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="block bg-slate-50 border rounded-xl p-4 hover:bg-slate-100 transition"
              >
                📄 View Resume
              </a>
            ) : (
              <p className="text-slate-400">No resume uploaded</p>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Upload Resume
            </button>

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handleResumeUpload}
            />
          </div>
        </div>
      )}

    </div>
  </div>
);
}
