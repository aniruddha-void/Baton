import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiClient';
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Share2,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CalendarClock,
  Users,
  GitBranch,
  Copy,
  X,
  Printer,
  Mail,
  Loader2,
} from 'lucide-react';
import './HandoverReportsPage.css';

/* ─────────────────────────────────────────────
   HANDOVER REPORTS PAGE
   Frontend-only: reports are demo data in local state.
   Preview opens a modal; download/export prepare a file
   in-browser. No real backend persistence happens here.
───────────────────────────────────────────── */

const MEMBERS = [
  { initials: 'A', name: 'Aniruddha Bhandare', role: 'Project Lead', color: '#7c3aed' },
  { initials: 'RY', name: 'Raju Yadav', role: 'Frontend Engineer', color: '#6366f1' },
  { initials: 'HS', name: 'Hrithikraj Singh', role: 'Backend Engineer', color: '#d97706' },
  { initials: 'VC', name: 'Vishal Chauhan', role: 'Product Designer', color: '#16a34a' },
];

const INITIAL_REPORTS = [
  {
    id: 'rp-1',
    title: 'CampusConnect Handover Report',
    project: 'CampusConnect',
    status: 'Ready',
    updated: 'Oct 31, 2026',
    author: 'Aniruddha Bhandare',
    decisions: 14,
    tasks: 23,
    coverage: 98,
    excerpt:
      'Comprehensive handover for CampusConnect covering architecture decisions, task status, and key stakeholder notes from the Oct sprint.',
  },
  {
    id: 'rp-2',
    title: 'NotesofAni Handover Report',
    project: 'NotesofAni',
    status: 'In Progress',
    updated: 'Oct 30, 2026',
    author: 'Raju Yadav',
    decisions: 9,
    tasks: 18,
    coverage: 84,
    excerpt:
      'Mid-sprint handover capturing product decisions, ongoing feature work, and pending design reviews.',
  },
  {
    id: 'rp-3',
    title: 'Bunexa AI Handover Report',
    project: 'Bunexa AI',
    status: 'Draft',
    updated: 'Oct 28, 2026',
    author: 'Hrithikraj Singh',
    decisions: 6,
    tasks: 12,
    coverage: 61,
    excerpt:
      'Early-stage report summarizing the AI study assistant vision, technical direction, and next milestones.',
  },
  {
    id: 'rp-4',
    title: 'Quarterly Portfolio Handover',
    project: 'All Projects',
    status: 'Ready',
    updated: 'Oct 25, 2026',
    author: 'Vishal Chauhan',
    decisions: 31,
    tasks: 54,
    coverage: 100,
    excerpt:
      'Executive-level portfolio handover aggregating progress across all active projects for the quarter.',
  },
];

const STATUS_META = {
  Ready: { cls: 'ready', color: '#16a34a', bg: '#dcfce7' },
  'In Progress': { cls: 'progress', color: '#b45309', bg: '#fef3c7' },
  Draft: { cls: 'draft', color: '#6d28d9', bg: '#ede9fe' },
};

export default function HandoverReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [preview, setPreview] = useState(null); // report id or null
  const [showExport, setShowExport] = useState(null); // report id or null
  const [toast, setToast] = useState('');
  const [realProjects, setRealProjects] = useState([]);
  const [loadingReal, setLoadingReal] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [exportId, setExportId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  // Fetch real projects from the backend to build genuine reports.
  useEffect(() => {
    let cancelled = false;
    setLoadingReal(true);
    setLoadError('');
    api
      .get('/projects')
      .then((res) => {
        if (cancelled) return;
        const projects = Array.isArray(res?.data?.projects) ? res.data.projects : [];
        setRealProjects(projects);
        if (projects.length > 0) {
          const real = projects.map((p) => ({
            id: p._id,
            title: `${p.name} Handover Report`,
            project: p.name,
            status: p.status === 'Completed' ? 'Ready' : p.status === 'On Hold' ? 'Draft' : 'In Progress',
            updated: new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            author: 'Aniruddha Bhandare',
            decisions: 0,
            tasks: 0,
            coverage: typeof p.progress === 'number' ? Math.round(p.progress) : 0,
            excerpt: p.description || `Handover report generated from live project data for ${p.name}.`,
            source: 'backend',
            repo: p.repositoryUrl || '',
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
          }));
          setReports((prev) => [...real, ...prev]);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message || 'Could not load backend projects.');
      })
      .finally(() => {
        if (!cancelled) setLoadingReal(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build real file content from a report + its source project data.
  const buildReportFile = (rep, format) => {
    const project = rep.source === 'backend' ? realProjects.find((p) => p._id === rep.id) : null;
    const repo = project?.repositoryUrl || rep.repo || '';
    const tech = project?.technologies || rep.technologies || [];
    const date = new Date().toLocaleString();

    if (format === 'json') {
      const data = {
        reportTitle: rep.title,
        project: rep.project,
        status: rep.status,
        coveragePercent: rep.coverage,
        author: rep.author,
        updated: rep.updated,
        generatedAt: date,
        excerpt: rep.excerpt,
        repositoryUrl: repo,
        technologies: tech,
        source: rep.source === 'backend' ? 'MongoDB (live)' : 'Demo',
        note: 'Tasks and decisions counts require backend integration and are not included in this export.',
      };
      return JSON.stringify(data, null, 2);
    }

    // Markdown
    const lines = [];
    lines.push(`# ${rep.title}`);
    lines.push('');
    lines.push(`> **Project:** ${rep.project}  `);
    lines.push(`> **Status:** ${rep.status}  `);
    lines.push(`> **Coverage:** ${rep.coverage}%  `);
    lines.push(`> **Author:** ${rep.author}  `);
    lines.push(`> **Updated:** ${rep.updated}  `);
    lines.push(`> **Generated:** ${date}`);
    lines.push('');
    lines.push('## Overview');
    lines.push('');
    lines.push(rep.excerpt);
    lines.push('');
    if (repo) {
      lines.push('## Repository');
      lines.push('');
      lines.push(repo);
      lines.push('');
    }
    if (tech.length > 0) {
      lines.push('## Technologies');
      lines.push('');
      tech.forEach((t) => lines.push(`- ${t}`));
      lines.push('');
    }
    lines.push('## Notes');
    lines.push('');
    lines.push('Task and decision breakdowns will be included once backend integration provides that data.');
    lines.push('');
    return lines.join('\n');
  };

  // Trigger a real browser download for the generated file.
  const downloadFile = (rep, format) => {
    const content = buildReportFile(rep, format);
    const ext = format === 'json' ? 'json' : 'md';
    const mime = format === 'json' ? 'application/json' : 'text/markdown';
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = rep.project.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'report';
    a.href = url;
    a.download = `${safeName}-handover.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return `${safeName}-handover.${ext}`;
  };

  const readyCount = reports.filter((r) => r.status === 'Ready').length;

  const handlePreview = (id) => setPreview(id);

  const handleDownload = (id) => {
    const rep = reports.find((r) => r.id === id);
    if (!rep) return;
    setBusyId(id);
    try {
      const filename = downloadFile(rep, 'md');
      showToast(`Downloaded ${filename}`);
    } catch (err) {
      showToast(`Download failed: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleExportMarkdown = (id) => {
    const rep = reports.find((r) => r.id === id);
    if (!rep) return;
    setBusyId(id);
    try {
      const filename = downloadFile(rep, 'md');
      showToast(`Exported ${rep.project} report (.md) → ${filename}`);
      setShowExport(null);
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };
  const handleExportJson = (id) => {
    const rep = reports.find((r) => r.id === id);
    if (!rep) return;
    setBusyId(id);
    try {
      const filename = downloadFile(rep, 'json');
      showToast(`Exported ${rep.project} report (.json) → ${filename}`);
      setShowExport(null);
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleExportPrint = (id) => {
    const rep = reports.find((r) => r.id === id);
    if (!rep) return;
    setShowExport(null);
    const content = buildReportFile(rep, 'md');
    const w = window.open('', '_blank');
    if (!w) {
      showToast('Print blocked. Allow pop-ups for this site.');
      return;
    }
    w.document.write(`<html><head><title>${rep.title}</title></head><body><pre style="font-family: monospace; white-space: pre-wrap;">${content}</pre></body></html>`);
    w.document.close();
    w.print();
  };

  const handleShare = (id) => {
    const r = reports.find((x) => x.id === id);
    showToast(`Shareable link copied for "${r.project}" (frontend demo)`);
  };

  const previewReport = reports.find((r) => r.id === preview) || null;

  return (
    <div className="hr-page">
      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="hr-header">
        <button type="button" className="btn-back" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>
        <div className="hr-title-group">
          <div className="hr-icon">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="hr-title">Handover Reports</h1>
            <p className="hr-subtitle">
              Generate, review, and share AI handover documentation for your projects.
            </p>
          </div>
        </div>
      </div>

      {/* ── BACKEND SYNC STATUS ─────────────────── */}
      {loadingReal && (
        <div className="hr-sync-bar">Loading live projects from the backend…</div>
      )}
      {!loadingReal && loadError && (
        <div className="hr-sync-bar hr-sync-error">
          Could not load backend projects: {loadError}. Showing demo data only.
        </div>
      )}
      {!loadingReal && !loadError && realProjects.length === 0 && (
        <div className="hr-sync-bar hr-sync-info">
          No backend projects found. Demo reports are shown; create a project to generate live reports.
        </div>
      )}

      {/* ── STAT STRIP ────────────────────────────────── */}
      <div className="hr-stat-strip">
        <div className="hr-stat-card">
          <div className="hr-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <FileText size={19} />
          </div>
          <div className="hr-stat-text">
            <span className="hr-stat-count">{reports.length}</span>
            <span className="hr-stat-label">Total Reports</span>
          </div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={19} />
          </div>
          <div className="hr-stat-text">
            <span className="hr-stat-count">{readyCount}</span>
            <span className="hr-stat-label">Ready</span>
          </div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={19} />
          </div>
          <div className="hr-stat-text">
            <span className="hr-stat-count">{reports.filter((r) => r.status === 'In Progress').length}</span>
            <span className="hr-stat-label">In Progress</span>
          </div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <Sparkles size={19} />
          </div>
          <div className="hr-stat-text">
            <span className="hr-stat-count">{reports.filter((r) => r.status === 'Draft').length}</span>
            <span className="hr-stat-label">Draft</span>
          </div>
        </div>
      </div>

      <div className="hr-grid">
        {/* ── MAIN COLUMN ────────────────────────────── */}
        <div className="hr-main">
          <section className="hr-card">
            <div className="hr-card-head">
              <div className="hr-card-head-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="hr-card-title">Report Library</h2>
                <p className="hr-card-subtitle">
                  View, preview, download, and share generated handover reports.
                </p>
              </div>
            </div>

            <div className="hr-report-list">
              {reports.map((r) => {
                const meta = STATUS_META[r.status] || STATUS_META.Draft;
                const author = MEMBERS.find((m) => m.name === r.author) || MEMBERS[0];
                return (
                  <div key={r.id} className="hr-report-item">
                    <div className="hr-report-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
                      <FileText size={20} />
                    </div>

                    <div className="hr-report-body">
                      <div className="hr-report-title-row">
                        <h3 className="hr-report-title">{r.title}</h3>
                        <span className="hr-status-badge" style={{ background: meta.bg, color: meta.color }}>
                          {r.status}
                        </span>
                      </div>
                      <p className="hr-report-excerpt">{r.excerpt}</p>

                      <div className="hr-report-meta">
                        <span className="hr-meta-chip">
                          <Users size={12} />
                          {r.project}
                        </span>
                        <span className="hr-meta-chip">
                          <CalendarClock size={12} />
                          {r.updated}
                        </span>
                        <span className="hr-meta-chip">
                          <span className="member-avatar hr-small-avatar" style={{ background: author.color }}>
                            {author.initials}
                          </span>
                          {r.author}
                        </span>
                      </div>

                      <div className="hr-coverage-row">
                        <span className="hr-coverage-label">Coverage</span>
                        <div className="progress-track hr-progress">
                          <div className="progress-fill" style={{ width: `${r.coverage}%` }} />
                        </div>
                        <span className="hr-coverage-value">{r.coverage}%</span>
                      </div>
                    </div>

                    <div className="hr-report-actions">
                      <button type="button" className="hr-action-btn" onClick={() => handlePreview(r.id)} title="Preview report">
                        <Eye size={16} />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        className="hr-action-btn"
                        onClick={() => handleDownload(r.id)}
                        title="Download report"
                        disabled={busyId === r.id}
                      >
                        {busyId === r.id ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                        <span>{busyId === r.id ? 'Preparing…' : 'Download'}</span>
                      </button>
                      <button type="button" className="hr-action-btn" onClick={() => setShowExport(r.id)} title="Export as file">
                        <Copy size={16} />
                        <span>Export</span>
                      </button>
                      <button type="button" className="hr-action-btn" onClick={() => handleShare(r.id)} title="Copy shareable link">
                        <Share2 size={16} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── SIDE COLUMN ────────────────────────────── */}
        <aside className="hr-side">
          <section className="hr-card">
            <div className="hr-card-head">
              <div className="hr-card-head-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <GitBranch size={18} />
              </div>
              <div>
                <h2 className="hr-card-title">Report Coverage</h2>
                <p className="hr-card-subtitle">Percentage of project data captured.</p>
              </div>
            </div>
            <div className="hr-coverage-list">
              {reports.map((r) => (
                <div key={r.id} className="hr-coverage-row hr-coverage-slim">
                  <span className="hr-coverage-proj">{r.project}</span>
                  <div className="progress-track hr-progress-sm">
                    <div className="progress-fill" style={{ width: `${r.coverage}%` }} />
                  </div>
                  <span className="hr-coverage-value">{r.coverage}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="hr-card hr-ai-card">
            <div className="hr-ai-glow" />
            <div className="hr-ai-icon">
              <Sparkles size={18} />
            </div>
            <h2 className="hr-card-title hr-ai-title">Generate New Report</h2>
            <p className="hr-card-subtitle hr-ai-desc">
              Build a fresh handover report from the latest project decisions, tasks, and timeline.
            </p>
            <button
              type="button"
              className="btn-primary hr-ai-btn"
              onClick={() => {
                if (realProjects.length > 0) {
                  // Generate a real report from the most recently updated backend project.
                  const p = realProjects[0];
                  const added = {
                    id: p._id,
                    title: `${p.name} Handover Report`,
                    project: p.name,
                    status: p.status === 'Completed' ? 'Ready' : p.status === 'On Hold' ? 'Draft' : 'In Progress',
                    updated: new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                    author: 'Aniruddha Bhandare',
                    decisions: 0,
                    tasks: 0,
                    coverage: typeof p.progress === 'number' ? Math.round(p.progress) : 0,
                    excerpt: p.description || `Handover report generated from live project data for ${p.name}.`,
                    source: 'backend',
                    repo: p.repositoryUrl || '',
                    technologies: Array.isArray(p.technologies) ? p.technologies : [],
                  };
                  setReports((prev) => [added, ...prev]);
                  showToast(`Generated ${p.name} report from live data`);
                  return;
                }
                const n = reports.length + 1;
                const added = {
                  id: `rp-new-${n}`,
                  title: `New Handover Report ${n}`,
                  project: 'CampusConnect',
                  status: 'Draft',
                  updated: 'Today',
                  author: 'Aniruddha Bhandare',
                  decisions: 0,
                  tasks: 0,
                  coverage: 0,
                  excerpt: 'A newly generated handover report. Connect the backend to populate it with live data.',
                };
                setReports((prev) => [added, ...prev]);
                showToast('New draft report added (frontend demo)');
              }}
            >
              <Sparkles size={15} />
              <span>{realProjects.length > 0 ? 'Generate Report (live)' : 'Generate Report'}</span>
            </button>
          </section>
        </aside>
      </div>

      {/* ── PREVIEW MODAL ────────────────────────────── */}
      {previewReport && (
        <div className="hr-modal-overlay" onClick={() => setPreview(null)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-head">
              <div className="hr-modal-icon">
                <FileText size={20} />
              </div>
              <div className="hr-modal-title-wrap">
                <h3 className="hr-modal-title">{previewReport.title}</h3>
                <span className="hr-modal-subtitle">
                  {previewReport.project} · Updated {previewReport.updated} · By {previewReport.author}
                </span>
              </div>
              <button type="button" className="hr-modal-close" onClick={() => setPreview(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>

            <div className="hr-modal-body">
              <div className="hr-modal-section">
                <h4 className="hr-modal-section-title">Overview</h4>
                <p className="hr-modal-text">{previewReport.excerpt}</p>
              </div>

              <div className="hr-modal-grid">
                <div className="hr-modal-stat">
                  <span className="hr-modal-stat-value">{previewReport.decisions}</span>
                  <span className="hr-modal-stat-label">Decisions</span>
                </div>
                <div className="hr-modal-stat">
                  <span className="hr-modal-stat-value">{previewReport.tasks}</span>
                  <span className="hr-modal-stat-label">Tasks</span>
                </div>
                <div className="hr-modal-stat">
                  <span className="hr-modal-stat-value">{previewReport.coverage}%</span>
                  <span className="hr-modal-stat-label">Coverage</span>
                </div>
              </div>

              <div className="hr-modal-section">
                <h4 className="hr-modal-section-title">Key Sections</h4>
                <ul className="hr-modal-list">
                  <li>Executive summary &amp; project status</li>
                  <li>Key decisions &amp; rationale</li>
                  <li>Task &amp; progress breakdown</li>
                  <li>Timeline milestones &amp; owners</li>
                  <li>Source references &amp; traceability</li>
                </ul>
              </div>
            </div>

            <div className="hr-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setPreview(null)}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={() => handleDownload(previewReport.id)} disabled={busyId === previewReport.id}>
                {busyId === previewReport.id ? <Loader2 size={15} className="spin" /> : <Download size={15} />}
                <span>{busyId === previewReport.id ? 'Preparing…' : 'Download'}</span>
              </button>
              <button type="button" className="btn-primary" onClick={() => handleShare(previewReport.id)}>
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT MENU ──────────────────────────────── */}
      {showExport && (
        <div className="hr-export-menu">
          <div className="hr-export-menu-title">Export report as</div>
          <button type="button" className="hr-export-option" onClick={() => handleExportMarkdown(showExport)}>
            <FileText size={15} />
            <span>Markdown (.md)</span>
          </button>
          <button type="button" className="hr-export-option" onClick={() => handleExportJson(showExport)}>
            <Copy size={15} />
            <span>JSON (.json)</span>
          </button>
          <button type="button" className="hr-export-option" onClick={() => handleExportPrint(showExport)}>
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>
          <button type="button" className="hr-export-option" onClick={() => setShowExport(null)}>
            <X size={15} />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* ── TOAST ────────────────────────────────────── */}
      {toast && <div className="hr-toast">{toast}</div>}
    </div>
  );
}
