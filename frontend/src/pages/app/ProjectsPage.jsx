import React, { useState, useMemo } from 'react';
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
import { loadCreatedProjects } from './CreateProjectPage';

/* ─────────────────────────────────────────────
   SAMPLE DATA — replace with API call when backend is ready.
   Each project mirrors the reference screenshot exactly.
   Icons are lucide-react components assigned per project.
───────────────────────────────────────────── */
const SAMPLE_PROJECTS = [
  {
    id: 'proj-1',
    name: 'CampusConnect',
    description: 'College platform for events, notices and student services.',
    iconKey: 'code',
    status: 'On Track',
    statusType: 'on-track',
    progress: 72,
    team: ['A', 'R', 'H', 'V'],
    extraMembers: 4,
    lastUpdated: 'Oct 31, 2026',
  },
  {
    id: 'proj-2',
    name: 'NotesofAni',
    description: 'Notes sharing and PYQ resources platform.',
    iconKey: 'layers',
    status: 'On Track',
    statusType: 'on-track',
    progress: 88,
    team: ['A', 'R', 'H', 'V'],
    extraMembers: 0,
    lastUpdated: 'Oct 30, 2026',
  },
  {
    id: 'proj-3',
    name: 'Bunexa AI',
    description: 'AI study assistant for students.',
    iconKey: 'sparkles',
    status: 'In Progress',
    statusType: 'in-progress',
    progress: 60,
    team: ['A', 'R', 'H', 'V'],
    extraMembers: 0,
    lastUpdated: 'Oct 29, 2026',
  },
  {
    id: 'proj-4',
    name: 'EventSphere',
    description: 'Event management and coordination system.',
    iconKey: 'calendar',
    status: 'In Progress',
    statusType: 'in-progress',
    progress: 54,
    team: ['A', 'R', 'H', 'V'],
    extraMembers: 0,
    lastUpdated: 'Oct 28, 2026',
  },
  {
    id: 'proj-5',
    name: 'Project Handover (Demo)',
    description: 'Sample project to demonstrate Baton workflow.',
    iconKey: 'file',
    status: 'Review',
    statusType: 'review',
    progress: 100,
    team: ['A', 'R', 'H', 'V'],
    extraMembers: 0,
    lastUpdated: 'Oct 27, 2026',
  },
];

const ALL_PROJECTS = [...loadCreatedProjects(), ...SAMPLE_PROJECTS];
const AVATAR_COLORS = ['#7c3aed', '#6366f1', '#d97706', '#16a34a', '#0284c7'];

/** Resolve any project (created or sample) by its id. */
export function getProjectById(id) {
  return ALL_PROJECTS.find((p) => p.id === id) || null;
}

/* Map iconKey → lucide-react component */
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
      <div className="pl-stat-icon" style={{ background: iconBg, color: iconColor }}>
        <Icon size={20} />
      </div>
      <div className="pl-stat-text">
        <span className="pl-stat-count">{count}</span>
        <span className="pl-stat-label">{label}</span>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 5;

const TABS = [
  { key: 'all', label: 'All Projects', filter: () => true },
  { key: 'active', label: 'Active', filter: (p) => p.statusType === 'on-track' },
  { key: 'in-progress', label: 'In Progress', filter: (p) => p.statusType === 'in-progress' },
  { key: 'review', label: 'Review', filter: (p) => p.statusType === 'review' },
  { key: 'completed', label: 'Completed', filter: (p) => p.statusType === 'completed' },
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);

  /* Derive counts for tab labels */
  const counts = useMemo(() => ({
    all: ALL_PROJECTS.length,
    active: ALL_PROJECTS.filter((p) => p.statusType === 'on-track').length,
    'in-progress': ALL_PROJECTS.filter((p) => p.statusType === 'in-progress').length,
    review: ALL_PROJECTS.filter((p) => p.statusType === 'review').length,
    completed: ALL_PROJECTS.filter((p) => p.statusType === 'completed').length,
  }), []);

  /* Filtered + searched list */
  const filtered = useMemo(() => {
    const tabFn = TABS.find((t) => t.key === activeTab)?.filter ?? (() => true);
    const q = searchQuery.trim().toLowerCase();
    return ALL_PROJECTS.filter((p) => {
      if (!tabFn(p)) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeTab, searchQuery]);

  /* Paginated slice */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  /* Stat strip values */
  const onTrackCount = counts['active'];
  const inProgressCount = counts['in-progress'];
  const reviewCount = counts['review'];
  const completedCount = counts['completed'];

  return (
    <div className="projects-page">
      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="projects-page-header">
        <div className="projects-page-title-group">
          <div className="projects-page-icon">
            <FolderKanban size={22} />
          </div>
          <div className="projects-page-heading-text">
            <h1 className="projects-page-title">Projects</h1>
            <p className="projects-page-subtitle">
              Manage all your projects, track progress, and generate handover reports.
            </p>
          </div>
        </div>
        <Link to="/projects/create" className="btn-create-project">
          <Plus size={16} />
          <span>Create Project</span>
        </Link>
      </div>

      {/* ── STAT STRIP ──────────────────────────────────── */}
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

      {/* ── FILTER TABS + SEARCH ────────────────────────── */}
      <div className="projects-toolbar">
        {/* Tabs */}
        <div className="projects-tab-row">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`projects-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}{' '}
              <span className="tab-count-badge">({counts[tab.key]})</span>
            </button>
          ))}
        </div>

        {/* Search + Filter */}
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
          <button type="button" className="btn-filter" aria-label="Advanced filter">
            <SlidersHorizontal size={15} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* ── PROJECTS TABLE ──────────────────────────────── */}
      <div className="projects-table-card">
        {filtered.length === 0 ? (
          /* Empty State */
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
                    {/* Project Name + Description */}
                    <td className="col-project">
                      <div className="project-cell">
                        <div className="project-icon-box">
                          <ProjectIcon iconKey={project.iconKey} size={19} />
                        </div>
                        <div className="project-info">
                          <span className="project-name">{project.name}</span>
                          <span className="project-desc">{project.description}</span>
                        </div>
                      </div>
                    </td>

                    {/* Team Avatars */}
                    <td className="col-team" onClick={(e) => e.stopPropagation()}>
                      <div className="team-avatars">
                        {project.team.slice(0, 4).map((initial, i) => (
                          <div
                            key={i}
                            className="member-avatar"
                            style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                            title={`Team member ${initial}`}
                          >
                            {initial}
                          </div>
                        ))}
                        {project.extraMembers > 0 && (
                          <div className="member-avatar extra">+{project.extraMembers}</div>
                        )}
                      </div>
                    </td>

                    {/* Progress Bar + Value */}
                    <td className="col-progress" onClick={(e) => e.stopPropagation()}>
                      <div className="progress-wrapper">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="progress-pct">{project.progress}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="col-status" onClick={(e) => e.stopPropagation()}>
                      <span className={`status-badge ${project.statusType}`}>
                        {project.status}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="col-updated">{project.lastUpdated}</td>

                    {/* Actions */}
                    <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-row-action"
                          onClick={() =>
                            setActiveMenu(activeMenu === project.id ? null : project.id)
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
                              onClick={() => setActiveMenu(null)}
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

            {/* Pagination */}
            <div className="projects-pagination">
              <span className="pagination-info">
                Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filtered.length)} of{' '}
                {filtered.length} project{filtered.length !== 1 ? 's' : ''}
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="pag-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pag-btn ${safeCurrentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={safeCurrentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="pag-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
    </div>
  );
}

