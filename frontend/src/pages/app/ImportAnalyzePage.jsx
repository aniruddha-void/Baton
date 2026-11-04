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
import { api } from '../../services/apiClient';

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

  // Real backend-backed state
  const [projectList, setProjectList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [serverFiles, setServerFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [projectLoadError, setProjectLoadError] = useState('');
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load the authenticated user's real MongoDB projects for the file selector.
    (async () => {
      setProjectLoadError('');
      setProjectsLoaded(false);
      try {
        const response = await api.get('/projects');
        // Normalize the enlightened { success, data: { projects } } envelope.
        const rawProjects = response?.data?.projects || [];
        const projects = rawProjects.map((p) => ({
          id: p._id || p.id,
          name: p.name || 'Untitled project',
        }));
        setProjectList(projects);
        if (projects.length === 1) setSelectedProjectId(projects[0].id);
      } catch (err) {
        // The request itself failed — surface the real error instead of claiming
        // there are no projects (the empty-state message would be misleading).
        setProjectLoadError(err?.message || 'Could not load your projects.');
      } finally {
        setProjectsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setServerFiles([]);
      return;
    }
    const loadFiles = async () => {
      setLoadingFiles(true);
      setUploadError('');
      try {
        const response = await api.get(`/files/projects/${selectedProjectId}`);
        setServerFiles(response?.data?.files || []);
      } catch {
        setUploadError('Could not load files for this project.');
      } finally {
        setLoadingFiles(false);
      }
    };
    loadFiles();
  }, [selectedProjectId]);

  const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg', '.zip']);
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB — matches backend limiter

  const validateFile = (file) => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return `Unsupported file type: ${ext || '(none)'}. Allowed: PDF, DOCX, TXT, MD, PNG, JPG, ZIP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} exceeds the 25 MB limit.`;
    }
    return null;
  };

  const addFiles = (fileList) => {
    if (!fileList || !fileList.length) return;
    if (!selectedProjectId) {
      setUploadError('Select a project first to upload files.');
      return;
    }
    const newItems = Array.from(fileList)
      .map((file) => {
        const validationError = validateFile(file);
        const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        return {
          id,
          raw: file,
          name: file.name,
          size: file.size,
          status: validationError ? 'error' : 'uploading',
          progress: 0,
          error: validationError,
        };
      })
      .filter((item) => item);
    setFiles((prev) => [...prev, ...newItems]);
    setAnalysisRequested(false);
    setUploadError('');
    newItems.forEach((item) => {
      if (item.status === 'uploading') uploadToBackend(item);
    });
  };

  const uploadToBackend = async (item) => {
    if (!selectedProjectId) return;
    const formData = new FormData();
    formData.append('file', item.raw);
    try {
      const response = await api.post(`/files/projects/${selectedProjectId}`, formData);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: 'done', progress: 100, serverId: response?.data?.file?._id }
            : f
        )
      );
      setUploadError('');
      refreshServerFiles();
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'error', error: err.message || 'Upload failed.' } : f))
      );
      setUploadError(err.message || 'Upload failed.');
    }
  };

  const refreshServerFiles = async () => {
    if (!selectedProjectId) return;
    try {
      const response = await api.get(`/files/projects/${selectedProjectId}`);
      setServerFiles(response?.data?.files || []);
    } catch {
      // keep current list
    }
  };

  const handleDownload = async (fileId) => {
    setUploadError('');
    try {
      const response = await api.get(`/files/${fileId}/download`);
      const signedUrl = response?.data?.url;
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        setUploadError('Could not generate a download link.');
      }
    } catch (err) {
      setUploadError(err.message || 'Could not generate a download link.');
    }
  };

  const handleDeleteFile = async (fileId) => {
    setUploadError('');
    try {
      await api.delete(`/files/${fileId}`);
      setServerFiles((prev) => prev.filter((f) => (f._id || f.id) !== fileId));
    } catch (err) {
      setUploadError(err.message || 'Could not delete the file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setAnalysisRequested(false);
    setUploadError('');
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

            {/* Project selector — files are scoped to a real MongoDB project */}
            <div className="ia-project-picker">
              <label className="ia-project-label" htmlFor="ia-project-select">
                Upload to project
              </label>
              <select
                id="ia-project-select"
                className="ia-project-select"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setFiles([]);
                  setServerFiles([]);
                  setUploadError('');
                }}
              >
                <option value="">Select a project…</option>
                {projectList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {projectLoadError ? (
                <span className="ia-project-hint error">
                  Could not load projects: {projectLoadError}
                </span>
              ) : projectsLoaded && projectList.length === 0 ? (
                <span className="ia-project-hint">
                  No MongoDB projects found. Create a project first, then upload files.
                </span>
              ) : !projectsLoaded ? (
                <span className="ia-project-hint">Loading projects…</span>
              ) : null}
            </div>

            <div
              className={`ia-dropzone ${dragging ? 'dragging' : ''}`}
              onClick={() => {
                if (selectedProjectId) fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (selectedProjectId) setDragging(true);
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
              <span className="ia-dropzone-note">
                {selectedProjectId ? 'Max 25 MB per file' : 'Select a project to enable uploads'}
              </span>
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
                        {formatBytes(f.size)} •{" "}
                        {f.status === 'done'
                          ? 'Uploaded'
                          : f.status === 'uploading'
                            ? 'Uploading…'
                            : f.status === 'error'
                              ? 'Upload failed'
                              : ''}
                      </span>
                      {f.status === 'uploading' && (
                        <div className="progress-track ia-file-progress">
                          <div className="progress-fill ia-progress-indeterminate" />
                        </div>
                      )}
                      {f.status === 'error' && f.error && (
                        <span className="ia-file-error">{f.error}</span>
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

            {uploadError && (
              <div className="ia-error-banner">
                <X size={15} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Server-stored files (Backblaze B2 metadata) */}
            {selectedProjectId && (
              <div className="ia-server-section">
                <div className="ia-server-head">
                  <span className="ia-server-title">Stored files</span>
                  {loadingFiles && <Loader2 size={14} className="spin" />}
                </div>
                {!loadingFiles && serverFiles.length === 0 ? (
                  <p className="ia-server-empty">No files stored for this project yet.</p>
                ) : (
                  <ul className="ia-server-list">
                    {serverFiles.map((file) => {
                      const fileId = file._id || file.id;
                      return (
                        <li key={fileId} className="ia-server-row">
                          <div className="ia-file-icon">
                            <FileText size={17} />
                          </div>
                          <div className="ia-file-info">
                            <span className="ia-file-name">{file.originalName || file.name}</span>
                            <span className="ia-file-meta">{formatBytes(file.size)}</span>
                          </div>
                          <div className="ia-server-actions">
                            <button
                              type="button"
                              className="ia-server-btn"
                              onClick={() => handleDownload(fileId)}
                              title="Download"
                            >
                              <CloudUpload size={14} />
                            </button>
                            <button
                              type="button"
                              className="ia-server-btn danger"
                              onClick={() => handleDeleteFile(fileId)}
                              title="Delete"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
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
