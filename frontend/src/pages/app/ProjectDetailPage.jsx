import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  CalendarClock,
  Users,
  CheckCircle2,
  Clock,
  Flag,
  FileText,
  Download,
  PenLine,
  MoreHorizontal,
  Sparkles,
  MessageSquare,
  GitBranch,
  Target,
  Lightbulb,
  CircleDot,
  ShieldCheck,
} from 'lucide-react';
import './ProjectDetailPage.css';
import { getProjectById } from './ProjectsPage';

/* ─────────────────────────────────────────────
   REALISTIC PLACEHOLDER DATA
   Used only for the demo detail screen; swap with
   a real API call when the backend is available.
───────────────────────────────────────────── */
const AVATAR_COLORS = ['#7c3aed', '#6366f1', '#d97706', '#16a34a', '#0284c7'];

const MEMBERS = [
  { initials: 'A', name: 'Aniruddha Bhandare', role: 'Project Lead', color: '#7c3aed' },
  { initials: 'RY', name: 'Raju Yadav', role: 'Frontend Engineer', color: '#6366f1' },
  { initials: 'HS', name: 'Hrithikraj Singh', role: 'Backend Engineer', color: '#d97706' },
  { initials: 'VC', name: 'Vishal Chauhan', role: 'Product Designer', color: '#16a34a' },
];

const TASKS = [
  { id: 't1', title: 'Design student events feed UI', assignee: 'VC', status: 'Completed', statusType: 'completed', progress: 100 },
  { id: 't2', title: 'Implement events API endpoints', assignee: 'HS', status: 'In Progress', statusType: 'in-progress', progress: 68 },
  { id: 't3', title: 'Build notices board service', assignee: 'RY', status: 'On Track', statusType: 'on-track', progress: 45 },
  { id: 't4', title: 'Student services integration test', assignee: 'A', status: 'Review', statusType: 'review', progress: 82 },
  { id: 't5', title: 'Deploy staging environment', assignee: 'HS', status: 'Not Started', statusType: 'not-started', progress: 0 },
];

const TIMELINE = [
  { phase: 'Discovery & Research', period: 'Sep 1 – Sep 14', status: 'Completed', statusType: 'completed' },
  { phase: 'Design & Prototyping', period: 'Sep 15 – Sep 30', status: 'Completed', statusType: 'completed' },
  { phase: 'Core Platform Development', period: 'Oct 1 – Nov 15', status: 'In Progress', statusType: 'in-progress' },
  { phase: 'Testing & QA', period: 'Nov 16 – Nov 30', status: 'Upcoming', statusType: 'not-started' },
  { phase: 'Launch & Handover', period: 'Dec 1 – Dec 15', status: 'Upcoming', statusType: 'not-started' },
];

const DECISIONS = [
  {
    icon: GitBranch,
    title: 'Use React + Vite for frontend',
    detail: 'Decided by Aniruddha • Oct 12',
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    icon: ShieldCheck,
    title: 'Supabase for backend & auth',
    detail: 'Decided by Hrithikraj • Oct 18',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    icon: Target,
    title: 'Ship MVP to 5 pilot colleges',
    detail: 'Decided by the team • Oct 25',
    color: '#d97706',
    bg: '#fef3c7',
  },
];

function StatusBadge({ type, children }) {
  return <span className={`pd-status-badge ${type}`}>{children}</span>;
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = useMemo(() => getProjectById(projectId), [projectId]);

  if (!project) {
    return (
      <div className="pd-page">
        <div className="pd-not-found">
          <div className="pd-not-found-icon">
            <FolderKanban size={32} />
          </div>
          <h1>Project not found</h1>
          <p>
            We couldn't find a project with that id. It may have been deleted or the link is invalid.
          </p>
          <button type="button" className="btn-secondary" onClick={() => navigate('/projects')}>
            <ArrowLeft size={16} />
            <span>Back to Projects</span>
          </button>
        </div>
      </div>
    );
  }

  const statusType = project.statusType || (project.status === 'On Track' ? 'on-track' : project.status === 'Review' ? 'review' : 'in-progress');
  const teamCount = project.team?.length || 0;

  return (
    <div className="pd-page">
      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="pd-header">
        <div className="pd-header-left">
          <button type="button" className="pd-back-btn" onClick={() => navigate('/projects')}>
            <ArrowLeft size={16} />
            <span>Projects</span>
          </button>
          <div className="pd-icon-box">
            <FolderKanban size={22} />
          </div>
          <div className="pd-title-group">
            <h1 className="pd-title">{project.name}</h1>
            <span className="pd-subtitle">{project.description}</span>
          </div>
        </div>
        <div className="pd-header-actions">
          <StatusBadge type={statusType}>{project.status}</StatusBadge>
          <button type="button" className="btn-secondary pd-btn-ghost">
            <PenLine size={15} />
            <span>Edit</span>
          </button>
          <button type="button" className="btn-primary pd-btn-primary">
            <FileText size={15} />
            <span>Handover Report</span>
          </button>
          <button type="button" className="pd-icon-btn" aria-label="More options">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* ── STAT STRIP ──────────────────────────────────── */}
      <div className="pd-stat-strip">
        <div className="pd-stat-card">
          <div className="pd-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <Target size={19} />
          </div>
          <div className="pd-stat-text">
            <span className="pd-stat-count">{project.progress}%</span>
            <span className="pd-stat-label">Overall Progress</span>
          </div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <CheckCircle2 size={19} />
          </div>
          <div className="pd-stat-text">
            <span className="pd-stat-count">2 / 5</span>
            <span className="pd-stat-label">Tasks Completed</span>
          </div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <Users size={19} />
          </div>
          <div className="pd-stat-text">
            <span className="pd-stat-count">{teamCount}</span>
            <span className="pd-stat-label">Team Members</span>
          </div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <MessageSquare size={19} />
          </div>
          <div className="pd-stat-text">
            <span className="pd-stat-count">3</span>
            <span className="pd-stat-label">Key Decisions</span>
          </div>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
            <CalendarClock size={19} />
          </div>
          <div className="pd-stat-text">
            <span className="pd-stat-count">45</span>
            <span className="pd-stat-label">Days to Launch</span>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ───────────────────────────────────── */}
      <div className="pd-grid">
        {/* LEFT / MAIN COLUMN */}
        <div className="pd-main">
          {/* Overview / Progress card */}
          <section className="pd-card">
            <div className="pd-card-head">
              <div className="pd-card-head-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <Target size={18} />
              </div>
              <div>
                <h2 className="pd-card-title">Project Overview</h2>
                <p className="pd-card-subtitle">Progress and high-level health of {project.name}.</p>
              </div>
            </div>

            <div className="pd-overview-body">
              <div className="pd-big-progress">
                <div className="pd-big-progress-top">
                  <span className="pd-big-progress-label">Completion</span>
                  <span className="pd-big-progress-value">{project.progress}%</span>
                </div>
                <div className="progress-track pd-big-track">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="pd-big-progress-meta">
                  <span className="pd-meta-chip">
                    <CalendarClock size={13} />
                    Last updated {project.lastUpdated}
                  </span>
                  <span className="pd-meta-chip">
                    <Users size={13} />
                    {teamCount} member{teamCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="pd-overview-divider" />

              <div className="pd-overview-grid">
                <div className="pd-overview-item">
                  <span className="pd-overview-label">Category</span>
                  <span className="pd-overview-value">{project.category || 'Product'}</span>
                </div>
                <div className="pd-overview-item">
                  <span className="pd-overview-label">Start Date</span>
                  <span className="pd-overview-value">{project.startDate || 'Sep 1, 2026'}</span>
                </div>
                <div className="pd-overview-item">
                  <span className="pd-overview-label">End Date</span>
                  <span className="pd-overview-value">{project.endDate || 'Dec 15, 2026'}</span>
                </div>
                <div className="pd-overview-item">
                  <span className="pd-overview-label">Status</span>
                  <StatusBadge type={statusType}>{project.status}</StatusBadge>
                </div>
              </div>
            </div>
          </section>

          {/* Tasks card */}
          <section className="pd-card">
            <div className="pd-card-head">
              <div className="pd-card-head-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h2 className="pd-card-title">Tasks</h2>
                <p className="pd-card-subtitle">Track deliverables across the handover cycle.</p>
              </div>
            </div>

            <div className="pd-task-list">
              {TASKS.map((task) => {
                const member = MEMBERS.find((m) => m.initials === task.assignee) || MEMBERS[0];
                return (
                  <div key={task.id} className="pd-task-row">
                    <div className="pd-task-check">
                      <CircleDot size={16} />
                    </div>
                    <div className="pd-task-info">
                      <span className="pd-task-title">{task.title}</span>
                      <div className="pd-task-progress">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="pd-task-progress-pct">{task.progress}%</span>
                      </div>
                    </div>
                    <div className="pd-task-assignee">
                      <div className="member-avatar" style={{ background: member.color }} title={member.name}>
                        {member.initials}
                      </div>
                    </div>
                    <StatusBadge type={task.statusType}>{task.status}</StatusBadge>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Timeline card */}
          <section className="pd-card">
            <div className="pd-card-head">
              <div className="pd-card-head-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <CalendarClock size={18} />
              </div>
              <div>
                <h2 className="pd-card-title">Timeline</h2>
                <p className="pd-card-subtitle">Milestones and phases of the project lifecycle.</p>
              </div>
            </div>

            <div className="pd-timeline">
              {TIMELINE.map((item, i) => (
                <div key={item.phase} className="pd-timeline-row">
                  <div className="pd-timeline-marker">
                    <div className={`pd-timeline-dot ${item.statusType}`} />
                    {i < TIMELINE.length - 1 && <div className="pd-timeline-line" />}
                  </div>
                  <div className="pd-timeline-content">
                    <span className="pd-timeline-phase">{item.phase}</span>
                    <span className="pd-timeline-period">{item.period}</span>
                  </div>
                  <StatusBadge type={item.statusType}>{item.status}</StatusBadge>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SIDE COLUMN */}
        <div className="pd-side">
          {/* Team card */}
          <section className="pd-card">
            <div className="pd-card-head">
              <div className="pd-card-head-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Users size={18} />
              </div>
              <div>
                <h2 className="pd-card-title">Team</h2>
                <p className="pd-card-subtitle">Members collaborating on this project.</p>
              </div>
            </div>

            <div className="pd-team-avatars">
              {MEMBERS.map((m) => (
                <div key={m.initials} className="member-avatar pd-team-avatar" style={{ background: m.color }} title={m.name}>
                  {m.initials}
                </div>
              ))}
              <div className="member-avatar extra pd-team-avatar">+2</div>
            </div>

            <div className="pd-member-list">
              {MEMBERS.map((m) => (
                <div key={m.initials} className="pd-member-row">
                  <div className="member-avatar" style={{ background: m.color }}>
                    {m.initials}
                  </div>
                  <div className="pd-member-info">
                    <span className="pd-member-name">{m.name}</span>
                    <span className="pd-member-role">{m.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Decisions card */}
          <section className="pd-card">
            <div className="pd-card-head">
              <div className="pd-card-head-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
                <Lightbulb size={18} />
              </div>
              <div>
                <h2 className="pd-card-title">Key Decisions</h2>
                <p className="pd-card-subtitle">Architectural and product decisions.</p>
              </div>
            </div>

            <div className="pd-decision-list">
              {DECISIONS.map((d, i) => (
                <div key={i} className="pd-decision-row">
                  <div className="pd-decision-icon" style={{ background: d.bg, color: d.color }}>
                    <d.icon size={16} />
                  </div>
                  <div className="pd-decision-info">
                    <span className="pd-decision-title">{d.title}</span>
                    <span className="pd-decision-detail">{d.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI / handover card */}
          <section className="pd-card pd-ai-card">
            <div className="pd-ai-glow" />
            <div className="pd-ai-icon">
              <Sparkles size={18} />
            </div>
            <h2 className="pd-card-title pd-ai-title">Generate Handover</h2>
            <p className="pd-card-subtitle pd-ai-desc">
              Let Baton AI turn {project.name} into a complete handover report with decisions, tasks, and architecture.
            </p>
            <div className="pd-ai-actions">
              <Link to="/reports" className="btn-primary pd-ai-btn">
                <Sparkles size={15} />
                <span>Generate Report</span>
              </Link>
              <button type="button" className="btn-secondary pd-ai-btn">
                <Download size={15} />
                <span>Export</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
