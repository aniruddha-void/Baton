import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PenLine,
  FileText,
  Users,
  CalendarClock,
  GitBranch,
  ListTodo,
  Clock,
  Sparkles,
  Link2,
  CircleDot,
  Save,
  X,
} from 'lucide-react';
import './ReviewVerifyPage.css';

/* ─────────────────────────────────────────────
   REVIEW & VERIFY PAGE
   Frontend-only: users can edit, approve, or reject
   extracted items with local state. No AI extraction
   or backend persistence happens here yet.
───────────────────────────────────────────── */

const AVATAR_COLORS = ['#7c3aed', '#6366f1', '#d97706', '#16a34a', '#0284c7'];

const OWNERS = [
  { initials: 'A', name: 'Aniruddha Bhandare', role: 'Project Lead', color: '#7c3aed' },
  { initials: 'RY', name: 'Raju Yadav', role: 'Frontend Engineer', color: '#6366f1' },
  { initials: 'HS', name: 'Hrithikraj Singh', role: 'Backend Engineer', color: '#d97706' },
  { initials: 'VC', name: 'Vishal Chauhan', role: 'Product Designer', color: '#16a34a' },
];

const SOURCES = [
  { id: 's1', name: 'meeting-notes-oct.pdf', type: 'Meeting Transcript' },
  { id: 's2', name: 'architecture-decisions.md', type: 'Document' },
  { id: 's3', name: 'campusconnect-repo', type: 'Code Repository' },
  { id: 's4', name: 'product-spec.docx', type: 'Document' },
  { id: 's5', name: 'sprint-review-notes.pdf', type: 'Meeting Transcript' },
];

const INITIAL = {
  decisions: [
    {
      id: 'd1',
      title: 'Use React + Vite for frontend',
      detail: 'Chosen for fast builds, component ergonomics, and team familiarity.',
      owner: 'A',
      source: 's1',
      status: 'pending',
    },
    {
      id: 'd2',
      title: 'Supabase for backend & auth',
      detail: 'Managed Postgres, realtime, and built-in auth to move faster on MVP.',
      owner: 'HS',
      source: 's2',
      status: 'pending',
    },
    {
      id: 'd3',
      title: 'Ship MVP to 5 pilot colleges',
      detail: 'Limit initial rollout to validate product-market fit before scaling.',
      owner: 'A',
      source: 's4',
      status: 'approved',
    },
  ],
  tasks: [
    {
      id: 't1',
      title: 'Design student events feed UI',
      assignee: 'VC',
      deadline: 'Oct 18',
      source: 's4',
      status: 'pending',
    },
    {
      id: 't2',
      title: 'Implement events API endpoints',
      assignee: 'HS',
      deadline: 'Oct 25',
      source: 's3',
      status: 'pending',
    },
    {
      id: 't3',
      title: 'Student services integration test',
      assignee: 'RY',
      deadline: 'Nov 2',
      source: 's5',
      status: 'rejected',
    },
  ],
  timeline: [
    {
      id: 'tl1',
      phase: 'Discovery & Research',
      period: 'Sep 1 – Sep 14',
      source: 's1',
      status: 'approved',
    },
    {
      id: 'tl2',
      phase: 'Design & Prototyping',
      period: 'Sep 15 – Sep 30',
      source: 's4',
      status: 'approved',
    },
    {
      id: 'tl3',
      phase: 'Core Platform Development',
      period: 'Oct 1 – Nov 15',
      source: 's3',
      status: 'pending',
    },
  ],
};

function ownerByInitials(initials) {
  return OWNERS.find((o) => o.initials === initials) || OWNERS[0];
}

function sourceById(id) {
  return SOURCES.find((s) => s.id === id) || SOURCES[0];
}

function StatusBadge({ status }) {
  return <span className={`rv-status-badge ${status}`}>{status}</span>;
}

export default function ReviewVerifyPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(INITIAL);
  const [activeTab, setActiveTab] = useState('decisions');
  const [editing, setEditing] = useState(null); // { type, id }
  const [editDraft, setEditDraft] = useState({});

  const applyTo = (type, id, updater) => {
    setData((prev) => ({
      ...prev,
      [type]: prev[type].map((item) =>
        item.id === id ? updater(item) : item
      ),
    }));
  };

  const setStatus = (type, id, status) => {
    applyTo(type, id, (item) => ({ ...item, status }));
    setEditing(null);
  };

  const startEdit = (type, id) => {
    const item = data[type].find((i) => i.id === id);
    setEditing({ type, id });
    setEditDraft({ title: item.title, detail: item.detail || '' });
  };

  const persistEdit = () => {
    if (!editing) return;
    const { type, id } = editing;
    applyTo(type, id, (item) => ({
      ...item,
      title: editDraft.title || item.title,
      detail: editDraft.detail !== undefined ? editDraft.detail : item.detail,
    }));
    setEditing(null);
  };

  const tabMeta = [
    { key: 'decisions', label: 'Decisions', icon: GitBranch },
    { key: 'tasks', label: 'Tasks', icon: ListTodo },
    { key: 'timeline', label: 'Timeline', icon: CalendarClock },
  ];

  const totalItems = data.decisions.length + data.tasks.length + data.timeline.length;
  const approvedCount =
    [...data.decisions, ...data.tasks, ...data.timeline].filter(
      (i) => i.status === 'approved'
    ).length;
  const rejectedCount =
    [...data.decisions, ...data.tasks, ...data.timeline].filter(
      (i) => i.status === 'rejected'
    ).length;
  const pendingCount = totalItems - approvedCount - rejectedCount;

  return (
    <div className="rv-page">
      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="rv-header">
        <button type="button" className="btn-back" onClick={() => navigate('/import')}>
          <ArrowLeft size={16} />
          <span>Back to Import</span>
        </button>
        <div className="rv-title-group">
          <div className="rv-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="rv-title">Review & Verify</h1>
            <p className="rv-subtitle">
              Validate extracted decisions, tasks, and timeline items before handover.
            </p>
          </div>
        </div>
      </div>

      {/* ── STAT STRIP ────────────────────────────────── */}
      <div className="rv-stat-strip">
        <div className="rv-stat-card">
          <div className="rv-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <GitBranch size={19} />
          </div>
          <div className="rv-stat-text">
            <span className="rv-stat-count">{totalItems}</span>
            <span className="rv-stat-label">Extracted Items</span>
          </div>
        </div>
        <div className="rv-stat-card">
          <div className="rv-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={19} />
          </div>
          <div className="rv-stat-text">
            <span className="rv-stat-count">{approvedCount}</span>
            <span className="rv-stat-label">Approved</span>
          </div>
        </div>
        <div className="rv-stat-card">
          <div className="rv-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={19} />
          </div>
          <div className="rv-stat-text">
            <span className="rv-stat-count">{pendingCount}</span>
            <span className="rv-stat-label">Pending</span>
          </div>
        </div>
        <div className="rv-stat-card">
          <div className="rv-stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <XCircle size={19} />
          </div>
          <div className="rv-stat-text">
            <span className="rv-stat-count">{rejectedCount}</span>
            <span className="rv-stat-label">Rejected</span>
          </div>
        </div>
        <div className="rv-stat-card">
          <div className="rv-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Users size={19} />
          </div>
          <div className="rv-stat-text">
            <span className="rv-stat-count">{OWNERS.length}</span>
            <span className="rv-stat-label">Owners</span>
          </div>
        </div>
      </div>

      <div className="rv-grid">
        {/* ── MAIN COLUMN ────────────────────────────── */}
        <div className="rv-main">
          {/* Tabs */}
          <div className="rv-tab-row">
            {tabMeta.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`rv-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  <span className="rv-tab-count">({data[tab.key].length})</span>
                </button>
              );
            })}
          </div>

          {/* Extracted items list */}
          <section className="rv-card">
            <div className="rv-card-head">
              <div className="rv-card-head-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="rv-card-title">
                  {tabMeta.find((t) => t.key === activeTab)?.label} extracted from sources
                </h2>
                <p className="rv-card-subtitle">
                  Review each item, edit details, then approve or reject before finalizing.
                </p>
              </div>
            </div>

            <div className="rv-item-list">
              {data[activeTab].map((item) => {
                const isEditing = editing && editing.type === activeTab && editing.id === item.id;
                const source = sourceById(item.source);
                return (
                  <div key={item.id} className={`rv-item ${item.status}`}>
                    <div className="rv-item-main">
                      <div className="rv-item-check">
                        <CircleDot size={16} />
                      </div>

                      <div className="rv-item-content">
                        {isEditing ? (
                          <div className="rv-edit-fields">
                            <input
                              type="text"
                              className="rv-edit-input"
                              value={editDraft.title || ''}
                              onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                            />
                            {activeTab !== 'timeline' && (
                              <textarea
                                className="rv-edit-textarea"
                                rows={2}
                                value={editDraft.detail || ''}
                                onChange={(e) => setEditDraft((d) => ({ ...d, detail: e.target.value }))}
                              />
                            )}
                          </div>
                        ) : (
                          <>
                            <span className="rv-item-title">{item.title}</span>
                            {item.detail && <span className="rv-item-detail">{item.detail}</span>}
                            {item.period && (
                              <span className="rv-item-period">{item.period}</span>
                            )}
                          </>
                        )}

                        <div className="rv-item-meta">
                          {item.owner ? (
                            <span className="rv-owner">
                              <span
                                className="member-avatar rv-owner-avatar"
                                style={{ background: ownerByInitials(item.owner).color }}
                                title={ownerByInitials(item.owner).name}
                              >
                                {item.owner}
                              </span>
                              <span className="rv-owner-name">
                                {ownerByInitials(item.owner).name}
                              </span>
                            </span>
                          ) : (
                            item.assignee && (
                              <span className="rv-owner">
                                <span
                                  className="member-avatar rv-owner-avatar"
                                  style={{ background: ownerByInitials(item.assignee).color }}
                                  title={ownerByInitials(item.assignee).name}
                                >
                                  {item.assignee}
                                </span>
                                <span className="rv-owner-name">
                                  {ownerByInitials(item.assignee).name}
                                </span>
                              </span>
                            )
                          )}

                          {item.deadline && (
                            <span className="rv-meta-chip">
                              <Clock size={12} />
                              Due {item.deadline}
                            </span>
                          )}

                          <span className="rv-meta-chip">
                            <Link2 size={12} />
                            {source.name} · {source.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rv-item-actions">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="btn-primary rv-btn-small"
                            onClick={persistEdit}
                          >
                            <Save size={14} />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            className="rv-btn-icon"
                            onClick={() => setEditing(null)}
                            aria-label="Cancel edit"
                          >
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="rv-btn-icon"
                            onClick={() => startEdit(activeTab, item.id)}
                            aria-label="Edit item"
                          >
                            <PenLine size={15} />
                          </button>
                          <button
                            type="button"
                            className="rv-btn-approve"
                            onClick={() => setStatus(activeTab, item.id, 'approved')}
                            disabled={item.status === 'approved'}
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            className="rv-btn-reject"
                            onClick={() => setStatus(activeTab, item.id, 'rejected')}
                            disabled={item.status === 'rejected'}
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── SIDE COLUMN ────────────────────────────── */}
        <aside className="rv-side">
          {/* Owners card */}
          <section className="rv-card">
            <div className="rv-card-head">
              <div className="rv-card-head-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Users size={18} />
              </div>
              <div>
                <h2 className="rv-card-title">Owners</h2>
                <p className="rv-card-subtitle">Team members assigned to extracted items.</p>
              </div>
            </div>
            <div className="rv-owner-list">
              {OWNERS.map((o, i) => (
                <div key={o.initials} className="rv-owner-row">
                  <div className="member-avatar" style={{ background: o.color }}>
                    {o.initials}
                  </div>
                  <div className="rv-owner-info">
                    <span className="rv-owner-name">{o.name}</span>
                    <span className="rv-owner-role">{o.role}</span>
                  </div>
                  <span className="rv-owner-count">{data[activeTab].filter((it) => it.owner === o.initials || it.assignee === o.initials).length}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Source references card */}
          <section className="rv-card">
            <div className="rv-card-head">
              <div className="rv-card-head-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <FileText size={18} />
              </div>
              <div>
                <h2 className="rv-card-title">Source References</h2>
                <p className="rv-card-subtitle">Files these items were extracted from.</p>
              </div>
            </div>
            <div className="rv-source-list">
              {SOURCES.map((s) => (
                <div key={s.id} className="rv-source-row">
                  <div className="rv-source-icon">
                    <FileText size={14} />
                  </div>
                  <div className="rv-source-info">
                    <span className="rv-source-name">{s.name}</span>
                    <span className="rv-source-type">{s.type}</span>
                  </div>
                  <span className="rv-source-count">{totalItems}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Guidance / promo card */}
          <section className="rv-card rv-ai-card">
            <div className="rv-ai-glow" />
            <div className="rv-ai-icon">
              <Sparkles size={18} />
            </div>
            <h2 className="rv-card-title rv-ai-title">Finalize Handover</h2>
            <p className="rv-card-subtitle rv-ai-desc">
              Once all items are approved, generate the handover report for your team.
            </p>
            <button
              type="button"
              className="btn-primary rv-ai-btn"
              onClick={() => navigate('/reports')}
            >
              <FileText size={15} />
              <span>Generate Report</span>
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
