import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  Plus,
  Calendar,
  Users,
  Sparkles,
  Eye,
  Info,
  X,
  Lightbulb,
  CalendarClock,
  Settings2,
  CheckCircle2,
} from 'lucide-react';
import './CreateProjectPage.css';
import { api } from '../../services/apiClient';

const STORAGE_KEY = 'baton_created_projects';

export function loadCreatedProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCreatedProject(project) {
  const list = loadCreatedProjects();
  list.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const CATEGORIES = ['Web App', 'Mobile App', 'AI / ML', 'Design', 'Research', 'Other'];
const AVATAR_COLORS = ['#7c3aed', '#6366f1', '#d97706', '#16a34a', '#0284c7'];

const STATUS_OPTIONS = [
  { value: 'on-track', label: 'On Track' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
];

const TIPS = [
  { icon: Info, text: 'Add a clear, specific description to help Baton generate accurate handover context.' },
  { icon: Users, text: 'Invite your full team so everyone can share updates and own their tasks.' },
  { icon: CalendarClock, text: 'Set realistic start and end dates to track milestones on the timeline.' },
  { icon: Sparkles, text: 'Baton AI extracts decisions, tasks, and insights automatically as you work.' },
];

function initialsFor(name) {
  const cleaned = name.trim();
  if (!cleaned) return '?';
  return cleaned
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function statusLabel(value) {
  return STATUS_OPTIONS.find((s) => s.value === value)?.label || 'In Progress';
}

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Web App',
    startDate: '',
    endDate: '',
  });
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'm-default-1',
      name: 'Aniruddha Bhandare',
      initials: 'A',
      color: AVATAR_COLORS[0],
    },
    {
      id: 'm-default-2',
      name: 'Raju Yadav',
      initials: 'RY',
      color: AVATAR_COLORS[1],
    },
    {
      id: 'm-default-3',
      name: 'Hrithikraj Singh',
      initials: 'HS',
      color: AVATAR_COLORS[2],
    },
    {
      id: 'm-default-4',
      name: 'Vishal Chauhan',
      initials: 'VC',
      color: AVATAR_COLORS[3],
    },
  ]);
  const [memberInput, setMemberInput] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [autoReport, setAutoReport] = useState(true);
  const [notifyTeam, setNotifyTeam] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const addMember = () => {
    const name = memberInput.trim();
    if (!name) return;
    if (teamMembers.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      setMemberInput('');
      return;
    }
    setTeamMembers((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        initials: initialsFor(name),
        color: AVATAR_COLORS[prev.length % AVATAR_COLORS.length],
      },
    ]);
    setMemberInput('');
  };

  const removeMember = (id) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMemberKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMember();
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Project name is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      next.endDate = 'End date must be after start date.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setSubmitting(true);
    const initials = teamMembers.map((m) => m.initials).slice(0, 4);
    const team = initials.length ? initials : ['A'];
    const project = {
      id: `proj-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      iconKey: 'code',
      status: statusLabel(status),
      statusType: status,
      progress: 0,
      team,
      extraMembers: Math.max(0, teamMembers.length - 4),
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      category: form.category,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    // Persist to MongoDB via the backend. If the backend is unreachable, keep
    // the local-only copy so the demo still works without a server.
    try {
      await api.post('/projects', {
        name: project.name,
        description: project.description,
        status: project.status,
        repositoryUrl: '',
        technologies: [],
      });
    } catch {
      saveCreatedProject(project);
    } finally {
      setSubmitting(false);
      navigate('/projects');
    }
  };

  return (
    <div className="create-project-page">
      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="create-project-header">
        <button type="button" className="btn-back" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>
        <div className="create-project-title-group">
          <div className="create-project-icon">
            <FolderKanban size={22} />
          </div>
          <div>
            <h1 className="create-project-title">Create Project</h1>
            <p className="create-project-subtitle">
              Start a new project and track its handover lifecycle.
            </p>
          </div>
        </div>
      </div>

      <div className="create-project-grid">
        {/* ── MAIN COLUMN (FORM SECTIONS) ─────────────── */}
        <div className="create-project-main">
          <form className="create-project-form" onSubmit={handleSubmit} noValidate>
            {/* Project Details */}
            <section className="cp-card">
              <div className="cp-card-head">
                <div className="cp-step-badge">01</div>
                <div>
                  <h2 className="cp-card-title">Project Details</h2>
                  <p className="cp-card-subtitle">Core information about the project.</p>
                </div>
              </div>

              <div className="cp-card-body">
                <div className="form-field">
                  <label htmlFor="cp-name">Project Name</label>
                  <input
                    id="cp-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g. CampusConnect"
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="cp-desc">Description</label>
                  <textarea
                    id="cp-desc"
                    rows={3}
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="Short summary of the project"
                  />
                  {errors.description && <span className="field-error">{errors.description}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="cp-category">Category</label>
                  <select
                    id="cp-category"
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="cp-start">
                      <Calendar size={13} /> Start Date
                    </label>
                    <input
                      id="cp-start"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => update('startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="cp-end">
                      <Calendar size={13} /> End Date
                    </label>
                    <input
                      id="cp-end"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => update('endDate', e.target.value)}
                    />
                    {errors.endDate && <span className="field-error">{errors.endDate}</span>}
                  </div>
                </div>
              </div>
            </section>

            {/* Add Team Members */}
            <section className="cp-card">
              <div className="cp-card-head">
                <div className="cp-step-badge">02</div>
                <div>
                  <h2 className="cp-card-title">Add Team Members</h2>
                  <p className="cp-card-subtitle">Invite people to collaborate on this project.</p>
                </div>
              </div>

              <div className="cp-card-body">
                <div className="member-input-row">
                  <div className="member-input-wrap">
                    <Users size={16} className="member-input-icon" />
                    <input
                      type="text"
                      className="member-input"
                      placeholder="Enter member name and press Enter"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyDown={handleMemberKeyDown}
                    />
                  </div>
                  <button type="button" className="btn-add-member" onClick={addMember}>
                    <Plus size={15} />
                    <span>Add</span>
                  </button>
                </div>

                {teamMembers.length > 0 ? (
                  <div className="member-chips">
                    {teamMembers.map((m) => (
                      <div key={m.id} className="member-chip">
                        <div className="member-chip-avatar" style={{ background: m.color }}>
                          {m.initials}
                        </div>
                        <span className="member-chip-name">{m.name}</span>
                        <button
                          type="button"
                          className="member-chip-remove"
                          onClick={() => removeMember(m.id)}
                          aria-label={`Remove ${m.name}`}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="member-empty-hint">
                    No members added yet. Your project will start with you as the project lead.
                  </p>
                )}
              </div>
            </section>

            {/* Project Settings */}
            <section className="cp-card">
              <div className="cp-card-head">
                <div className="cp-step-badge">03</div>
                <div>
                  <h2 className="cp-card-title">Project Settings</h2>
                  <p className="cp-card-subtitle">Configure lifecycle and automation preferences.</p>
                </div>
              </div>

              <div className="cp-card-body">
                <div className="form-field">
                  <label htmlFor="cp-status">
                    <Settings2 size={13} /> Status
                  </label>
                  <select
                    id="cp-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="toggle-rows">
                  <div className="toggle-row">
                    <div className="toggle-text">
                      <span className="toggle-title">Auto-generate handover report</span>
                      <span className="toggle-hint">
                        Baton drafts a handover report when the project is completed.
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoReport}
                      className={`switch ${autoReport ? 'on' : ''}`}
                      onClick={() => setAutoReport((v) => !v)}
                    >
                      <span className="switch-knob" />
                    </button>
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-text">
                      <span className="toggle-title">Notify team on updates</span>
                      <span className="toggle-hint">Send email notifications to all members.</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifyTeam}
                      className={`switch ${notifyTeam ? 'on' : ''}`}
                      onClick={() => setNotifyTeam((v) => !v)}
                    >
                      <span className="switch-knob" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Action buttons */}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/projects')}>
                Cancel
              </button>
              <button type="submit" className="btn-create" disabled={submitting}>
                <Plus size={16} />
                <span>{submitting ? 'Creating...' : 'Create Project'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ── SIDE COLUMN (TIPS + PREVIEW) ────────────── */}
        <aside className="create-project-side">
          {/* Project Setup Tips */}
          <section className="cp-card cp-tips">
            <div className="cp-card-head">
              <div className="cp-tips-icon">
                <Lightbulb size={18} />
              </div>
              <div>
                <h2 className="cp-card-title">Project Setup Tips</h2>
                <p className="cp-card-subtitle">Get the most out of Baton.</p>
              </div>
            </div>
            <ul className="tips-list">
              {TIPS.map((tip, i) => (
                <li key={i} className="tip-item">
                  <div className="tip-icon">
                    <tip.icon size={15} />
                  </div>
                  <span className="tip-text">{tip.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Project Preview */}
          <section className="cp-card cp-preview">
            <div className="cp-card-head">
              <div className="cp-preview-icon">
                <Eye size={18} />
              </div>
              <div>
                <h2 className="cp-card-title">Project Preview</h2>
                <p className="cp-card-subtitle">How this project will appear.</p>
              </div>
            </div>

            <div className="preview-card">
              <div className="preview-top">
                <div className="preview-icon-box">
                  <FolderKanban size={19} />
                </div>
                <div className="preview-info">
                  <span className="preview-name">{form.name.trim() || 'Untitled Project'}</span>
                  <span className="preview-desc">
                    {form.description.trim() || 'No description yet'}
                  </span>
                </div>
              </div>

              <div className="preview-team">
                {teamMembers.length > 0 ? (
                  teamMembers.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="member-avatar"
                      style={{ background: m.color }}
                      title={m.name}
                    >
                      {m.initials}
                    </div>
                  ))
                ) : (
                  <div className="member-avatar" style={{ background: '#7c3aed' }} title="You">
                    A
                  </div>
                )}
                {teamMembers.length > 4 && (
                  <div className="member-avatar extra">+{teamMembers.length - 4}</div>
                )}
              </div>

              <div className="preview-meta">
                <div className="preview-progress">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '0%' }} />
                  </div>
                  <span className="preview-pct">0%</span>
                </div>
                <span className={`status-badge ${status}`}>{statusLabel(status)}</span>
              </div>

              <div className="preview-footer">
                <CheckCircle2 size={13} />
                <span>Will appear in your Projects list.</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
