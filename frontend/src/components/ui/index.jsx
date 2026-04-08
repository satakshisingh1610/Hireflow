// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const cls = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-[3px]',
    lg: 'w-10 h-10 border-4',
  }[size];
  return <div className={`${cls} border-brand-200 border-t-brand-600 rounded-full animate-spin`} />;
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div className="card text-center py-16">
      <span className="text-4xl">{icon}</span>
      <p className="mt-3 font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending:     'badge-slate',
  reviewed:    'badge-blue',
  shortlisted: 'badge-green',
  rejected:    'badge-red',
  open:        'badge-green',
  closed:      'badge-red',
  draft:       'badge-slate',
  'full-time': 'badge-blue',
  'part-time': 'badge-amber',
  contract:    'badge-amber',
  internship:  'badge-slate',
  remote:      'badge-purple',
  entry:       'badge-slate',
  mid:         'badge-blue',
  senior:      'badge-purple',
  lead:        'badge-amber',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_MAP[status] || 'badge-slate'} capitalize`}>
      {status?.replace('-', ' ')}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="btn-ghost rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
