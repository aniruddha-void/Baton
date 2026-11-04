import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  SlidersHorizontal,
  Code2,
  Layers,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flag,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
  Trash2,
} from 'lucide-react';

import './ProjectsPage.css';
import { api } from '../../services/apiClient';

const AVATAR_COLORS = [
  '#7c3aed',
  '#6366f1',
  '#d97706',
  '#16a34a',
  '#0284c7',
];

/** Demo projects shown alongside real MongoDB projects. */
const DEMO_PROJECTS = [
  {
    id: 'demo-campusconnect',
    demo: true,
    name: 'CampusConnect',
    description: 'A unified campus engagement platform connecting students, clubs, and events.',
    status: 'In Progress',
    statusType: 'in-progress',
    progress: 68,
    team: ['A', 'RY', 'HS', 'VC'],
    extraMembers: 0,
    lastUpdated: 'Oct 28, 2026',
    iconKey: 'code',
    category: 'Web App',
  },
  {
    id: 'demo-bunexa',
    demo: true,
    name: 'NotesOfAni',
    description: 'A collaborative study-notes platform with AI-powered transcription and search.',
    status: 'On Track',
    statusType: 'on-track',
    progress: 82,
    team: ['A', 'RY'],
    extraMembers: 0,
    lastUpdated: 'Oct 25, 2026',
    iconKey: 'layers',
    category: 'Mobile App',
  },
];

const demoBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: '#7c3aed',
  background: '#ede9fe',
  padding: '2px 8px',
  borderRadius: 999,
  marginLeft: 8,
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const dialogStyle = {
  background: '#ffffff',
  borderRadius: 16,
  padding: 24,
  width: 'min(420px, 90vw)',
  boxShadow: '0 20px 50px rgba(15,23,42,0.25)',
};

const secondaryBtnStyle = {
  padding: '8px 16px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  color: '#475569',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
};

const dangerBtnStyle = {
  padding: '8px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#dc2626',
  color: '#ffffff',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
};

const ITEMS_PER_PAGE = 5;

const TABS = [
  { key: 'all', label: 'All Projects' },
  { key: 'active', label: 'Active' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'completed', label: 'Completed' },
];

function getStatusType(status) {
  const normalizedStatus = String(status || '').toLowerCase();

  if (normalizedStatus === 'on track') return 'on-track';
  if (normalizedStatus === 'in progress') return 'in-progress';
  if (normalizedStatus === 'review') return 'review';
  if (normalizedStatus === 'completed') return 'completed';
  if (normalizedStatus === 'on hold') return 'on-hold';

  return 'in-progress';
}

function formatDate(date) {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeProject(project) {
  const team = Array.isArray(project.team) ? project.team : [];

  return {
    ...project,
    id: project._id || project.id,
    description: project.description || '',
    status: project.status || 'In Progress',
    statusType: getStatusType(project.status),
    progress: Number(project.progress) || 0,
    team: team.map((member) => {
      if (typeof member === 'string') {
        return member;
      }

      return (
        member?.name?.charAt(0) ||
        member?.username?.charAt(0) ||
        member?.email?.charAt(0) ||
        'U'
      );
    }),
    extraMembers: Math.max(team.length - 4, 0),
    lastUpdated: formatDate(project.updatedAt || project.createdAt),
    iconKey: 'code',
  };
}

/* Resolve project icons */
function ProjectIcon({ iconKey, size = 20 }) {
  const icons = {
    code: Code2,
    layers: Layers,
    sparkles: Sparkles,
    calendar: CalendarClock,
    file: FileText,
  };

  const Icon = icons[iconKey] || FolderKanban;

  return <Icon size={size} />;
}

/* Stat strip card */
function StatCard({ icon: Icon, count, label, iconColor, iconBg }) {
  return (
    <div className="pl-stat-card">
      <div
        className="pl-stat-icon"
        style={{ background: iconBg, color: iconColor }}
      >
        <Icon size={20} />
      </div>

      <div className="pl-stat-text">
        <span className="pl-stat-count">{count}</span>
        <span className="pl-stat-label">{label}</span>
      </div>
    </div>
  );
}

export function getProjectById(id) {
  const demo = DEMO_PROJECTS.find((p) => p.id === id);
  return demo ? { ...demo } : null;
}
export default function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);

  /* Fetch projects from backend */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/projects');

        const fetchedProjects = (response?.data?.projects || []).map(normalizeProject);
        const seenIds = new Set(fetchedProjects.map((p) => p.id));
        const demoProjects = DEMO_PROJECTS.filter((d) => !seenIds.has(d.id));

        setProjects([...demoProjects, ...fetchedProjects]);
      } catch (err) {
        setError(err.message || 'Failed to load projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  /* Project counts */
  const counts = useMemo(() => {
    return {
      all: projects.length,
      active: projects.filter((project) => project.statusType === 'on-track')
        .length,
      'in-progress': projects.filter(
        (project) => project.statusType === 'in-progress'
      ).length,
      review: projects.filter((project) => project.statusType === 'review')
        .length,
      completed: projects.filter(
        (project) => project.statusType === 'completed'
      ).length,
    };
  }, [projects]);

  /* Filter and search projects */
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      if (activeTab === 'active' && project.statusType !== 'on-track') {
        return false;
      }

      if (
        activeTab === 'in-progress' &&
        project.statusType !== 'in-progress'
      ) {
        return false;
      }

      if (activeTab === 'review' && project.statusType !== 'review') {
        return false;
      }

      if (
        activeTab === 'completed' &&
        project.statusType !== 'completed'
      ) {
        return false;
      }

      if (
        query &&
        !project.name.toLowerCase().includes(query) &&
        !project.description.toLowerCase().includes(query)
      ) {
        return false;
      }

      return true;
    });
  }, [projects, activeTab, searchQuery]);

  /* Pagination */
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ITEMS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginated = filtered.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const closeConfirmDelete = () => setConfirmDeleteId(null);

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/projects/${confirmDeleteId}`);
      setProjects((prev) => prev.filter((p) => p.id !== confirmDeleteId));
      setActiveMenu(null);
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
      setConfirmDeleteId(null);
    }
  };

  const onTrackCount = counts.active;
  const inProgressCount = counts['in-progress'];
  const reviewCount = counts.review;
  const completedCount = counts.completed;

  return (
    <div className="projects-page">
      {/* PAGE HEADER */}
      <div className="projects-page-header">
        <div className="projects-page-title-group">
          <div className="projects-page-icon">
            <FolderKanban size={22} />
          </div>

          <div className="projects-page-heading-text">
            <h1 className="projects-page-title">Projects</h1>

            <p className="projects-page-subtitle">
              Manage all your projects, track progress, and generate handover
              reports.
            </p>
          </div>
        </div>

        <Link to="/projects/create" className="btn-create-project">
          <Plus size={16} />
          <span>Create Project</span>
        </Link>
      </div>

      {/* STAT STRIP */}
      <div className="projects-stat-strip">
        <StatCard
          icon={FolderKanban}
          count={counts.all}
          label="Total Projects"
          iconBg="#f3e8ff"
          iconColor="#7c3aed"
        />

        <StatCard
          icon={CheckCircle2}
          count={onTrackCount}
          label="On Track"
          iconBg="#dcfce7"
          iconColor="#16a34a"
        />

        <StatCard
          icon={Clock}
          count={inProgressCount}
          label="In Progress"
          iconBg="#e0f2fe"
          iconColor="#0284c7"
        />

        <StatCard
          icon={Flag}
          count={reviewCount}
          label="Review"
          iconBg="#fef3c7"
          iconColor="#b45309"
        />

        <StatCard
          icon={CheckCircle2}
          count={completedCount}
          label="Completed"
          iconBg="#f1f5f9"
          iconColor="#64748b"
        />
      </div>

      {/* FILTER TABS AND SEARCH */}
      <div className="projects-toolbar">
        <div className="projects-tab-row">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`projects-tab-btn ${activeTab === tab.key ? 'active' : ''
                }`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}{' '}
              <span className="tab-count-badge">
                ({counts[tab.key]})
              </span>
            </button>
          ))}
        </div>

        <div className="projects-search-group">
          <div className="projects-search-box">
            <Search size={15} className="search-ico" />

            <input
              type="text"
              className="projects-search-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search projects"
            />
          </div>

          <button
            type="button"
            className="btn-filter"
            aria-label="Advanced filter"
          >
            <SlidersHorizontal size={15} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* PROJECTS TABLE */}
      <div className="projects-table-card">
        {loading ? (
          <div className="projects-empty-state">
            <p>Loading projects...</p>
          </div>
        ) : error ? (
          <div className="projects-empty-state">
            <h3>Unable to load projects</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn-create-project"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="projects-empty-state">
            <FolderKanban size={42} className="empty-state-icon" />

            <h3>No projects found</h3>

            <p>
              {searchQuery
                ? `No projects match "${searchQuery}". Try a different search term.`
                : 'No projects in this category yet.'}
            </p>

            <Link to="/projects/create" className="btn-create-project">
              <Plus size={15} />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <>
            <table className="projects-data-table">
              <thead>
                <tr>
                  <th className="col-project">Project</th>
                  <th className="col-team">Team</th>
                  <th className="col-progress">Progress</th>
                  <th className="col-status">Status</th>
                  <th className="col-updated">Last Updated</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((project) => (
                  <tr
                    key={project.id}
                    className="project-row"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* PROJECT NAME */}
                    <td className="col-project">
                      <div className="project-cell">
                        <div className="project-icon-box">
                          <ProjectIcon
                            iconKey={project.iconKey}
                            size={19}
                          />
                        </div>

                        <div className="project-info">
                          <span className="project-name">
                            {project.name}
                            {project.demo && (
                              <span style={demoBadgeStyle}>Demo</span>
                            )}
                          </span>

                          <span className="project-desc">
                            {project.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* TEAM */}
                    <td
                      className="col-team"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="team-avatars">
                        {project.team.slice(0, 4).map((initial, index) => (
                          <div
                            key={index}
                            className="member-avatar"
                            style={{
                              background:
                                AVATAR_COLORS[
                                index % AVATAR_COLORS.length
                                ],
                            }}
                            title={`Team member ${initial}`}
                          >
                            {initial}
                          </div>
                        ))}

                        {project.extraMembers > 0 && (
                          <div className="member-avatar extra">
                            +{project.extraMembers}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* PROGRESS */}
                    <td
                      className="col-progress"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="progress-wrapper">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${project.progress}%`,
                            }}
                          />
                        </div>

                        <span className="progress-pct">
                          {project.progress}%
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td
                      className="col-status"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span
                        className={`status-badge ${project.statusType}`}
                      >
                        {project.status}
                      </span>
                    </td>

                    {/* LAST UPDATED */}
                    <td className="col-updated">
                      {project.lastUpdated}
                    </td>

                    {/* ACTIONS */}
                    <td
                      className="col-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-row-action"
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === project.id ? null : project.id
                            )
                          }
                          aria-label="Project options"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {activeMenu === project.id && (
                          <div className="row-action-menu">
                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => {
                                navigate(`/projects/${project.id}`);
                                setActiveMenu(null);
                              }}
                            >
                              <ExternalLink size={13} />
                              <span>View Project</span>
                            </button>

                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => {
                                navigate('/reports');
                                setActiveMenu(null);
                              }}
                            >
                              <FileText size={13} />
                              <span>Handover Report</span>
                            </button>

                            <div className="action-menu-divider" />

                            <button
                              type="button"
                              className="action-menu-item danger"
                              onClick={() => setConfirmDeleteId(project.id)}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="projects-pagination">
              <span className="pagination-info">
                Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(
                  safeCurrentPage * ITEMS_PER_PAGE,
                  filtered.length
                )}{' '}
                of {filtered.length} project
                {filtered.length !== 1 ? 's' : ''}
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="pag-btn"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pag-btn ${safeCurrentPage === page ? 'active' : ''
                      }`}
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={
                      safeCurrentPage === page ? 'page' : undefined
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="pag-btn"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {confirmDeleteId && (
        <div style={overlayStyle} onClick={closeConfirmDelete}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>Delete project?</h3>
            <p style={{ margin: '8px 0 20px', color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
              This will permanently delete this project. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" style={secondaryBtnStyle} onClick={closeConfirmDelete}>
                Cancel
              </button>
              <button type="button" style={dangerBtnStyle} onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}