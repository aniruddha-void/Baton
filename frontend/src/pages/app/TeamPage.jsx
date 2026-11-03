import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  UserMinus,
  UserPlus,
  Search,
  Filter,
  Mail,
  MoreHorizontal,
  X,
  ShieldCheck,
  Award,
  Code2,
  Palette,
  Cpu,
  Briefcase,
} from 'lucide-react';
import './TeamPage.css';

/* ─────────────────────────────────────────────
   TEAM MANAGEMENT PAGE
   Frontend-only: member search, filters, and the
   invite flow use local state until the backend is
   connected. No invitations are actually sent and
   nothing is persisted — submitting the invite form
   shows a clear "demo / pending" confirmation only.
───────────────────────────────────────────── */

const TEAM_MEMBERS = [
  {
    id: 'm1',
    name: 'Aniruddha Bhandare',
    initials: 'A',
    role: 'Project Lead',
    email: 'aniruddha.bhandare@baton.app',
    status: 'active',
    projects: 4,
    icon: Briefcase,
    color: '#7c3aed',
  },
  {
    id: 'm2',
    name: 'Raju Yadav',
    initials: 'RY',
    role: 'Frontend Engineer',
    email: 'raju.yadav@baton.app',
    status: 'active',
    projects: 3,
    icon: Code2,
    color: '#6366f1',
  },
  {
    id: 'm3',
    name: 'Hrithikraj Singh',
    initials: 'HS',
    role: 'Backend Engineer',
    email: 'hrithikraj.singh@baton.app',
    status: 'active',
    projects: 3,
    icon: Cpu,
    color: '#d97706',
  },
  {
    id: 'm4',
    name: 'Vishal Chauhan',
    initials: 'VC',
    role: 'Product Designer',
    email: 'vishal.chauhan@baton.app',
    status: 'active',
    projects: 2,
    icon: Palette,
    color: '#16a34a',
  },
  {
    id: 'm5',
    name: 'Sneha Iyer',
    initials: 'SI',
    role: 'QA Engineer',
    email: 'sneha.iyer@baton.app',
    status: 'active',
    projects: 2,
    icon: ShieldCheck,
    color: '#0284c7',
  },
  {
    id: 'm6',
    name: 'Arjun Mehta',
    initials: 'AM',
    role: 'Product Manager',
    email: 'arjun.mehta@baton.app',
    status: 'on-leave',
    projects: 1,
    icon: Award,
    color: '#db2777',
  },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'Project Lead', label: 'Project Lead' },
  { value: 'Frontend Engineer', label: 'Frontend Engineer' },
  { value: 'Backend Engineer', label: 'Backend Engineer' },
  { value: 'Product Designer', label: 'Product Designer' },
  { value: 'QA Engineer', label: 'QA Engineer' },
  { value: 'Product Manager', label: 'Product Manager' },
];

const STATUS_META = {
  active: { label: 'Active', cls: 'active' },
  'on-leave': { label: 'On Leave', cls: 'on-leave' },
  invited: { label: 'Invited', cls: 'invited' },
};

export default function TeamPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Frontend Engineer' });
  const [inviteError, setInviteError] = useState('');
  const [pendingInvites, setPendingInvites] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuDir, setMenuDir] = useState('down');
  const [toast, setToast] = useState(null);

  const members = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TEAM_MEMBERS.filter((m) => {
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (
        q &&
        !m.name.toLowerCase().includes(q) &&
        !m.role.toLowerCase().includes(q) &&
        !m.email.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [searchQuery, roleFilter, statusFilter]);

  const activeCount = TEAM_MEMBERS.filter((m) => m.status === 'active').length;
  const onLeaveCount = TEAM_MEMBERS.filter((m) => m.status === 'on-leave').length;
  const invitedCount = pendingInvites.length;

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const handleInviteSubmit = () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setInviteError('Name and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email.trim())) {
      setInviteError('Please enter a valid email address.');
      return;
    }

    /* Frontend-only demo: no invitation is actually sent. */
    const initials = inviteForm.name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    setPendingInvites((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}`,
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        initials,
        color: '#7c3aed',
      },
    ]);
    setInviteForm({ name: '', email: '', role: 'Frontend Engineer' });
    setInviteError('');
    setShowInvite(false);
    showToast('Invitation added (frontend demo) — no email was sent.');
  };

  /* Open the row actions menu, flipping it upward when there is not enough
     space below the clicked button (e.g. the last row / short viewport) so
     it is never clipped by the bottom of the page. */
  const toggleMenu = (e, id) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const menuEstimate = 150; // approximate menu height in px
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dir = spaceBelow < menuEstimate && spaceAbove >= spaceBelow ? 'up' : 'down';
    setMenuDir(dir);
    setActiveMenu(activeMenu === id ? null : id);
  };

  const renderMemberRow = (m, isInvite) => (
    <tr key={m.id} className="team-row">
      <td className="tm-col-member">
        <div className="tm-member-cell">
          <div
            className="tm-avatar"
            style={{ background: m.color }}
            title={`${m.name} — ${m.role}`}
          >
            {m.initials}
            <span className={`tm-status-dot ${m.status}`} />
          </div>
          <div className="tm-member-info">
            <span className="tm-name">{m.name}</span>
            <span className="tm-email">
              <Mail size={12} /> {m.email}
            </span>
          </div>
        </div>
      </td>

      <td className="tm-col-role">
        <div className="tm-role-pill">
          <m.icon size={14} />
          <span>{m.role}</span>
        </div>
      </td>

      <td className="tm-col-status">
        <span className={`tm-status-badge ${STATUS_META[m.status]?.cls || 'active'}`}>
          <span className="tm-status-badge-dot" />
          {STATUS_META[m.status]?.label || 'Active'}
        </span>
      </td>

      <td className="tm-col-projects">
        <span className="tm-projects-count">{m.projects ?? '—'}</span>
      </td>

      <td className="tm-col-actions">
        <div className="tm-row-actions">
          <button
            type="button"
            className="tm-row-action"
            onClick={(e) => toggleMenu(e, m.id)}
            aria-label="Member options"
          >
            <MoreHorizontal size={16} />
          </button>

          {!isInvite && activeMenu === m.id && (
            <div
              className={`tm-row-action-menu${menuDir === 'up' ? ' open-up' : ''
                }`}
            >
              <button
                type="button"
                className="tm-action-menu-item"
                onClick={() => {
                  showToast(`${m.name} · ${m.role} (frontend demo)`);
                  setActiveMenu(null);
                }}
              >
                <Users size={13} />
                <span>View Profile</span>
              </button>
              <button
                type="button"
                className="tm-action-menu-item"
                onClick={() => {
                  showToast(`Role updated for ${m.name} (frontend demo)`);
                  setActiveMenu(null);
                }}
              >
                <Briefcase size={13} />
                <span>Change Role</span>
              </button>
              <div className="tm-action-menu-divider" />
              <button
                type="button"
                className="tm-action-menu-item danger"
                onClick={() => {
                  showToast(`Removal is a backend action — not performed.`);
                  setActiveMenu(null);
                }}
              >
                <UserMinus size={13} />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="tm-page">
      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="tm-header">
        <button type="button" className="btn-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>

        <div className="tm-title-group">
          <div className="tm-icon">
            <Users size={24} />
          </div>
          <div className="tm-heading-text">
            <h1 className="tm-title">Team</h1>
            <p className="tm-subtitle">
              Manage your members, roles, and access across all Baton projects.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="tm-invite-btn"
          onClick={() => {
            setInviteError('');
            setShowInvite(true);
          }}
        >
          <UserPlus size={16} />
          <span>Invite Member</span>
        </button>
      </div>

      {/* ── STAT STRIP ──────────────────────────────────── */}
      <div className="tm-stat-strip">
        <div className="tm-stat-card">
          <div className="tm-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <Users size={20} />
          </div>
          <div className="tm-stat-text">
            <span className="tm-stat-count">{TEAM_MEMBERS.length + invitedCount}</span>
            <span className="tm-stat-label">Team Members</span>
          </div>
        </div>

        <div className="tm-stat-card">
          <div className="tm-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="tm-stat-text">
            <span className="tm-stat-count">{activeCount}</span>
            <span className="tm-stat-label">Active</span>
          </div>
        </div>

        <div className="tm-stat-card">
          <div className="tm-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={20} />
          </div>
          <div className="tm-stat-text">
            <span className="tm-stat-count">{onLeaveCount}</span>
            <span className="tm-stat-label">On Leave</span>
          </div>
        </div>

        <div className="tm-stat-card">
          <div className="tm-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Mail size={20} />
          </div>
          <div className="tm-stat-text">
            <span className="tm-stat-count">{invitedCount}</span>
            <span className="tm-stat-label">Pending Invites</span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR ────────────────────────────────────── */}
      <div className="tm-toolbar">
        <div className="tm-search-box">
          <Search size={15} className="tm-search-ico" />
          <input
            type="text"
            className="tm-search-input"
            placeholder="Search members by name, role, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search team members"
          />
          {searchQuery && (
            <button
              type="button"
              className="tm-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="tm-filter-group">
          <button type="button" className="tm-filter-btn" aria-label="Filter">
            <Filter size={15} />
            <span>Filter</span>
          </button>

          <select
            className="tm-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            className="tm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="invited">Invited</option>
          </select>
        </div>
      </div>

      {/* ── MEMBERS TABLE ──────────────────────────────── */}
      <div className="tm-table-card">
        {members.length === 0 && pendingInvites.length === 0 ? (
          <div className="tm-empty-state">
            <Users size={42} className="tm-empty-icon" />
            <h3>No members found</h3>
            <p>
              {searchQuery
                ? `No members match "${searchQuery}". Try a different search or clear filters.`
                : 'No members in this team yet. Invite the first member to get started.'}
            </p>
          </div>
        ) : (
          <table className="tm-data-table">
            <thead>
              <tr>
                <th className="tm-col-member">Member</th>
                <th className="tm-col-role">Role</th>
                <th className="tm-col-status">Status</th>
                <th className="tm-col-projects">Projects</th>
                <th className="tm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => renderMemberRow(m, false))}

              {/* Pending invite rows (frontend demo) */}
              {pendingInvites.map((inv) => {
                const invMember = {
                  ...inv,
                  status: 'invited',
                  projects: 0,
                };
                return renderMemberRow(invMember, true);
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── INVITE MODAL ───────────────────────────────── */}
      {showInvite && (
        <div className="tm-modal-overlay" onClick={() => setShowInvite(false)}>
          <div
            className="tm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tm-invite-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tm-modal-header">
              <div className="tm-modal-icon">
                <UserPlus size={22} />
              </div>
              <div className="tm-modal-heading">
                <h2 id="tm-invite-title" className="tm-modal-title">
                  Invite Member
                </h2>
                <p className="tm-modal-subtitle">
                  Add a new member to the team. (Frontend demo — no email is sent.)
                </p>
              </div>
              <button
                type="button"
                className="tm-modal-close"
                onClick={() => setShowInvite(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tm-modal-body">
              <label className="tm-field-label" htmlFor="inv-name">
                Full name <span className="tm-req">*</span>
              </label>
              <input
                id="inv-name"
                type="text"
                className="tm-input"
                placeholder="e.g. Priya Sharma"
                value={inviteForm.name}
                onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
              />

              <label className="tm-field-label" htmlFor="inv-email">
                Email address <span className="tm-req">*</span>
              </label>
              <input
                id="inv-email"
                type="email"
                className="tm-input"
                placeholder="name@company.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              />

              <label className="tm-field-label" htmlFor="inv-role">
                Role
              </label>
              <select
                id="inv-role"
                className="tm-input tm-input-select"
                value={inviteForm.role}
                onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
              >
                {ROLE_OPTIONS.filter((r) => r.value !== 'all').map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              {inviteError && <div className="tm-form-error">{inviteError}</div>}
            </div>

            <div className="tm-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowInvite(false)}
              >
                Cancel
              </button>
              <button type="button" className="tm-invite-submit" onClick={handleInviteSubmit}>
                <UserPlus size={15} />
                <span>Invite Member</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ──────────────────────────────────────── */}
      {toast && <div className="tm-toast">{toast}</div>}
    </div>
  );
}
