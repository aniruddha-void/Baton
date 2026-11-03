import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CloudUpload,
  UploadCloud,
  FileText,
  FolderGit2,
  MessageSquare,
  Palette,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import './ImportAnalyzePage.css';

/* ─────────────────────────────────────────────
   IMPORT & ANALYZE PAGE
   Frontend-only: file selection + simulated upload
   states. No backend/AI calls are made. Replace the
   simulated upload with a real API call later.
───────────────────────────────────────────── */

const SOURCE_TYPES = [
  {
    id: 'docs',
    label: 'Documents & Notes',
    desc: 'PDFs, docs, markdown files',
    icon: FileText,
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    id: 'code',
    label: 'Code Repository',
    desc: 'GitHub / GitLab repositories',
    icon: FolderGit2,
    color: '#0284c7',
    bg: '#e0f2fe',
  },
  {
    id: 'design',
    label: 'Architecture Diagrams',
    desc: 'Diagrams and design assets',
    icon: Palette,
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    id: 'meetings',
    label: 'Meeting Transcripts',
    desc: 'Calls, recordings, notes',
    icon: MessageSquare,
    color: '#16a34a',
    bg: '#dcfce7',
  },
];

const ANALYZE_STEPS = [
  {
    icon: UploadCloud,
    text: 'Upload documents, repositories, or transcripts you want Baton to analyze.',
  },
  {
    icon: FileText,
    text: 'Baton extracts tasks, decisions, and architectural context from your sources.',
  },
  {
    icon: Sparkles,
    text: 'Review and refine what was extracted before creating handover reports.',
  },
];

const INTEGRATIONS = [
  { name: 'GitHub', status: 'Connected' },
  { name: 'Notion', status: 'Available' },
  { name: 'Google Drive', status: 'Available' },
  { name: 'Slack', status: 'Coming soon' },
];

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImportAnalyzePage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedType, setSelectedType] = useState('docs');
  const [dragging, setDragging] = useState(false);
  const [analysisRequested, setAnalysisRequested] = useState(false);
  const fileInputRef = useRef(null);
  const timersRef = useRef(new Map());
  const progressRef = useRef({});

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearInterval(timer));
      timersRef.current.clear();
    };
  }, []);

  const startSimulatedUpload = (id) => {
    const timer = setInterval(() => {
      const current = progressRef.current[id] ?? 0;
      const next = Math.min(100, current + 16 + Math.random() * 14);
      progressRef.current[id] = next;
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const done = next >= 100;
          return { ...f, progress: next, status: done ? 'done' : 'uploading' };
        })
      );
      if (next >= 100) {
        clearInterval(timer);
        timersRef.current.delete(id);
      }
    }, 340);
    timersRef.current.set(id, timer);
  };

  const addFiles = (fileList) => {
    if (!fileList || !fileList.length) return;
    const newItems = Array.from(fileList).map((file) => {
      const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      progressRef.current[id] = 0;
      return {
        id,
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
      };
    });
    setFiles((prev) => [...prev, ...newItems]);
    setAnalysisRequested(false);
    newItems.forEach((item) => startSimulatedUpload(item.id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(id);
    }
    delete progressRef.current[id];
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    timersRef.current.forEach((timer) => clearInterval(timer));
    timersRef.current.clear();
    progressRef.current = {};
    setFiles([]);
    setAnalysisRequested(false);
  };

  const uploadCount = files.length;
  const doneCount = files.filter((f) => f.status === 'done').length;
  const canAnalyze = doneCount > 0;

  return (
    <div className="ia-page">
      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="ia-header">
        <button type="button" className="btn-back" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>
        <div className="ia-title-group">
          <div className="ia-icon">
            <CloudUpload size={22} />
          </div>
          <div>
            <h1 className="ia-title">Import & Analyze</h1>
            <p className="ia-subtitle">
              Upload source files and let Baton extract project context for your handover.
            </p>
          </div>
        </div>
      </div>

      <div className="ia-grid">
        {/* ── MAIN COLUMN ────────────────────────────── */}
        <div className="ia-main">
          {/* Upload dropzone */}
          <section className="ia-card">
            <div className="ia-card-head">
              <div className="ia-card-head-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <UploadCloud size={18} />
              </div>
              <div>
                <h2 className="ia-card-title">Upload Source Files</h2>
                <p className="ia-card-subtitle">Drag & drop files here or browse from your device.</p>
              </div>
            </div>

            <div
              className={`ia-dropzone ${dragging ? 'dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="ia-dropzone-icon">
                <CloudUpload size={26} />
              </div>
              <span className="ia-dropzone-title">
                {dragging ? 'Drop files to upload' : 'Drag & drop files here'}
              </span>
              <span className="ia-dropzone-hint">or click to browse — PDF, DOCX, MD, images, ZIP</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="ia-file-list">
                {files.map((f) => (
                  <div key={f.id} className="ia-file-row">
                    <div className="ia-file-icon">
                      {f.status === 'done' ? (
                        <CheckCircle2 size={18} />
                      ) : f.status === 'uploading' ? (
                        <Loader2 size={18} className="spin" />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>
                    <div className="ia-file-info">
                      <span className="ia-file-name">{f.name}</span>
                      <span className="ia-file-meta">
                        {formatBytes(f.size)} • {f.status === 'done' ? 'Uploaded' : f.status === 'uploading' ? `Uploading ${Math.round(f.progress)}%` : ''}
                      </span>
                      {f.status === 'uploading' && (
                        <div className="progress-track ia-file-progress">
                          <div className="progress-fill" style={{ width: `${f.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="ia-file-remove"
                      onClick={() => removeFile(f.id)}
                      aria-label={`Remove ${f.name}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {analysisRequested && (
              <div className="ia-info-banner">
                <Sparkles size={15} />
                <span>
                  Analysis requested — extraction will start once the backend is connected. No AI
                  processing runs in this demo.
                </span>
              </div>
            )}

            <div className="ia-actions">
              <button type="button" className="btn-secondary ia-btn" onClick={clearAll} disabled={!uploadCount}>
                <X size={15} />
                <span>Clear files</span>
              </button>
              <button
                type="button"
                className="btn-primary ia-btn"
                disabled={!canAnalyze}
                onClick={() => setAnalysisRequested(true)}
              >
                <Sparkles size={15} />
                <span>{canAnalyze ? `Start Analysis (${doneCount})` : 'Start Analysis'}</span>
              </button>
            </div>
          </section>

          {/* Source type selection */}
          <section className="ia-card">
            <div className="ia-card-head">
              <div className="ia-card-head-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <FileText size={18} />
              </div>
              <div>
                <h2 className="ia-card-title">What are you importing?</h2>
                <p className="ia-card-subtitle">Select a source type to help Baton categorize your files.</p>
              </div>
            </div>

            <div className="ia-source-grid">
              {SOURCE_TYPES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className={`ia-source-card ${selectedType === s.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(s.id)}
                >
                  <div className="ia-source-icon" style={{ background: s.bg, color: s.color }}>
                    <s.icon size={18} />
                  </div>
                  <span className="ia-source-label">{s.label}</span>
                  <span className="ia-source-desc">{s.desc}</span>
                  {selectedType === s.id && (
                    <div className="ia-source-check">
                      <CheckCircle2 size={15} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ── SIDE COLUMN ────────────────────────────── */}
        <aside className="ia-side">
          {/* How it works */}
          <section className="ia-card">
            <div className="ia-card-head">
              <div className="ia-card-head-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="ia-card-title">How it works</h2>
                <p className="ia-card-subtitle">From files to handover context.</p>
              </div>
            </div>
            <ul className="ia-steps">
              {ANALYZE_STEPS.map((step, i) => (
                <li key={i} className="ia-step">
                  <div className="ia-step-icon">
                    <step.icon size={15} />
                  </div>
                  <span className="ia-step-text">{step.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Integrations */}
          <section className="ia-card">
            <div className="ia-card-head">
              <div className="ia-card-head-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Link2 size={18} />
              </div>
              <div>
                <h2 className="ia-card-title">Integrations</h2>
                <p className="ia-card-subtitle">Connect your data sources.</p>
              </div>
            </div>
            <div className="ia-integrations">
              {INTEGRATIONS.map((item) => (
                <div key={item.name} className="ia-integration-row">
                  <span className="ia-integration-name">{item.name}</span>
                  <span className={`ia-integration-status ${item.status === 'Connected' ? 'connected' : ''}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="ia-integration-hint">
              Connect integrations once backend support is available.
            </p>
          </section>

          {/* Privacy note */}
          <section className="ia-card ia-privacy-card">
            <div className="ia-privacy-icon">
              <ShieldCheck size={18} />
            </div>
            <h2 className="ia-card-title">Your data stays yours</h2>
            <p className="ia-card-subtitle ia-privacy-desc">
              Uploaded files are processed in your workspace and used only to generate handover
              context. Nothing is shared with third parties.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
