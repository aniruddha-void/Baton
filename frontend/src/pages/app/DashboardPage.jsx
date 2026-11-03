import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Folder,
  CheckCircle2,
  Users,
  Layers,
  TrendingUp,
  Plus,
  BarChart3,
  ChevronDown,
  MoreHorizontal,
  Sparkles,
  FileText,
  AlertTriangle,
  Info,
  CheckSquare,
  Activity,
  ArrowRight,
  Code2,
  Box,
  GraduationCap,
  Check,
  Send,
  FileCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Project progress filter state
  const [projectFilter, setProjectFilter] = useState('All');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Copilot input state
  const [copilotQuery, setCopilotQuery] = useState('');

  // Sample structured project records matching the Baton reference UI
  // Structured to seamlessly connect to backend API endpoints
  const [projects, setProjects] = useState([
    {
      id: 'proj-1',
      name: 'CampusConnect',
      category: 'College platform',
      icon: Code2,
      status: 'On Track',
      statusType: 'on-track',
      progress: 72,
      handover: 'Ready',
      handoverType: 'ready',
      lastUpdated: 'Oct 31, 2026',
    },
    {
      id: 'proj-2',
      name: 'EventSphere',
      category: 'Event management system',
      icon: Box,
      status: 'In Progress',
      statusType: 'in-progress',
      progress: 54,
      handover: 'Draft',
      handoverType: 'draft',
      lastUpdated: 'Oct 28, 2026',
    },
    {
      id: 'proj-3',
      name: 'NotesofAni',
      category: 'Notes sharing platform',
      icon: GraduationCap,
      status: 'On Track',
      statusType: 'on-track',
      progress: 88,
      handover: 'Ready',
      handoverType: 'ready',
      lastUpdated: 'Oct 30, 2026',
    },
    {
      id: 'proj-4',
      name: 'Bunexa AI',
      category: 'Study assistant (AI)',
      icon: Sparkles,
      status: 'Review',
      statusType: 'review',
      progress: 60,
      handover: 'In Review',
      handoverType: 'in-review',
      lastUpdated: 'Oct 29, 2026',
    },
  ]);

  // Tasks state with interactive toggle capability
  const [tasks, setTasks] = useState([
    {
      id: 't-1',
      title: 'Verify AI-extracted decisions',
      project: 'CampusConnect',
      priority: 'High',
      priorityType: 'high',
      completed: false,
    },
    {
      id: 't-2',
      title: 'Review pending blockers',
      project: 'EventSphere',
      priority: 'Medium',
      priorityType: 'medium',
      completed: false,
    },
    {
      id: 't-3',
      title: 'Update project timeline',
      project: 'NotesofAni',
      priority: 'Completed',
      priorityType: 'completed',
      completed: true,
    },
  ]);

  // Supported event activities (structured for future backend activity log)
  const [activities] = useState([
    {
      id: 'act-1',
      title: 'Handover report generated for NotesofAni',
      time: '10 min ago',
      type: 'report',
    },
    {
      id: 'act-2',
      title: 'New document imported in CampusConnect',
      time: '42 min ago',
      type: 'document',
    },
    {
      id: 'act-3',
      title: 'Task "Integrate payment API" marked as blocker',
      time: '1 hour ago',
      type: 'blocker',
    },
    {
      id: 'act-4',
      title: 'Project Bunexa AI created',
      time: '2 hours ago',
      type: 'project',
    },
  ]);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (projectFilter === 'All') return true;
    return p.status === projectFilter;
  });

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              priority: !t.completed ? 'Completed' : 'Medium',
              priorityType: !t.completed ? 'completed' : 'medium',
            }
          : t
      )
    );
  };

  const handleCopilotSubmit = (e) => {
    e.preventDefault();
    if (copilotQuery.trim()) {
      navigate('/assistant');
    }
  };

  // Determine dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Aniruddha';

  return (
    <div className="baton-dashboard-page">
      {/* ========================================================
          1. HEADER WELCOME ROW
      ======================================================== */}
      <div className="dashboard-welcome-row">
        <div className="welcome-text-col">
          <h1 className="welcome-heading">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="welcome-subtext">
            Here's the latest on your projects and handovers.
          </p>
        </div>

        <div className="welcome-action-col">
          <Link to="/projects/create" className="btn-create-project-primary">
            <Plus size={18} />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          2. METRIC OVERVIEW CARDS (4 CARDS)
      ======================================================== */}
      <div className="overview-cards-grid">
        {/* Card 1: Total Projects */}
        <div className="metric-overview-card">
          <div className="metric-card-header">
            <div className="metric-icon-box purple">
              <Folder size={20} />
            </div>
            <span className="metric-title-text">Total Projects</span>
          </div>
          <div className="metric-card-body">
            <span className="metric-big-value">{projects.length || 8}</span>
            <span className="metric-trend-badge green">
              <TrendingUp size={12} />
              <span>+2 this week</span>
            </span>
          </div>
          <Folder size={64} className="metric-watermark purple" aria-hidden="true" />
        </div>

        {/* Card 2: Completed Tasks */}
        <div className="metric-overview-card">
          <div className="metric-card-header">
            <div className="metric-icon-box green">
              <CheckCircle2 size={20} />
            </div>
            <span className="metric-title-text">Completed Tasks</span>
          </div>
          <div className="metric-card-body">
            <span className="metric-big-value">42</span>
            <span className="metric-trend-badge green">
              <TrendingUp size={12} />
              <span>+18%</span>
            </span>
          </div>
          <CheckCircle2 size={64} className="metric-watermark green" aria-hidden="true" />
        </div>

        {/* Card 3: Active Members */}
        <div className="metric-overview-card">
          <div className="metric-card-header">
            <div className="metric-icon-box blue">
              <Users size={20} />
            </div>
            <span className="metric-title-text">Active Members</span>
          </div>
          <div className="metric-card-body">
            <span className="metric-big-value">14</span>
            <span className="metric-sub-label">Across team projects</span>
          </div>
          <Users size={64} className="metric-watermark blue" aria-hidden="true" />
        </div>

        {/* Card 4: Pending Handover */}
        <div className="metric-overview-card">
          <div className="metric-card-header">
            <div className="metric-icon-box orange">
              <Layers size={20} />
            </div>
            <span className="metric-title-text">Pending Handover</span>
          </div>
          <div className="metric-card-body">
            <span className="metric-big-value">3</span>
            <span className="metric-sub-label pending">Requires review</span>
          </div>
          <Layers size={64} className="metric-watermark orange" aria-hidden="true" />
        </div>
      </div>

      {/* ========================================================
          3. MIDDLE SECTION: PROJECT PROGRESS & BATON AI INSIGHTS
      ======================================================== */}
      <div className="dashboard-middle-grid">
        {/* Left: Project Progress Table Card */}
        <div className="dashboard-card project-progress-card">
          <div className="card-header-bar">
            <div className="header-title-group">
              <div className="card-header-icon purple">
                <BarChart3 size={18} />
              </div>
              <h2 className="card-title-heading">Project Progress</h2>
            </div>

            {/* Filter Dropdown */}
            <div className="filter-dropdown-container">
              <button
                type="button"
                className="filter-dropdown-btn"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                aria-expanded={filterDropdownOpen}
              >
                <span>{projectFilter === 'All' ? 'All Projects' : projectFilter}</span>
                <ChevronDown size={14} className={filterDropdownOpen ? 'rotate' : ''} />
              </button>

              {filterDropdownOpen && (
                <div className="filter-dropdown-menu">
                  {['All', 'On Track', 'In Progress', 'Review'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`filter-item ${projectFilter === status ? 'active' : ''}`}
                      onClick={() => {
                        setProjectFilter(status);
                        setFilterDropdownOpen(false);
                      }}
                    >
                      {status === 'All' ? 'All Projects' : status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="projects-table-wrapper">
            {filteredProjects.length > 0 ? (
              <table className="projects-data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Handover</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => {
                    const ProjectIcon = project.icon;
                    return (
                      <tr key={project.id} className="project-table-row">
                        {/* Project Name & Category */}
                        <td>
                          <div className="project-cell">
                            <div className="project-row-icon">
                              <ProjectIcon size={16} />
                            </div>
                            <div className="project-row-details">
                              <span className="project-cell-name">{project.name}</span>
                              <span className="project-cell-category">{project.category}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td>
                          <span className={`status-pill ${project.statusType}`}>
                            {project.status}
                          </span>
                        </td>

                        {/* Progress Bar & Value */}
                        <td>
                          <div className="progress-cell-wrapper">
                            <span className="progress-percentage-text">{project.progress}%</span>
                            <div className="table-progress-track">
                              <div
                                className="table-progress-fill"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Handover Badge */}
                        <td>
                          <span className={`handover-pill ${project.handoverType}`}>
                            {project.handover}
                          </span>
                        </td>

                        {/* Row Actions */}
                        <td className="text-right">
                          <div className="row-actions-wrapper">
                            <button
                              type="button"
                              className="btn-row-menu"
                              title="Project Options"
                              onClick={() =>
                                setActiveMenuId(activeMenuId === project.id ? null : project.id)
                              }
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {activeMenuId === project.id && (
                              <div className="row-action-popover">
                                <Link
                                  to="/reports"
                                  className="action-popover-item"
                                  onClick={() => setActiveMenuId(null)}
                                >
                                  <FileText size={13} />
                                  <span>Handover Report</span>
                                </Link>
                                <Link
                                  to="/import"
                                  className="action-popover-item"
                                  onClick={() => setActiveMenuId(null)}
                                >
                                  <ExternalLink size={13} />
                                  <span>View Project</span>
                                </Link>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Clean Empty State when no projects match */
              <div className="empty-projects-state">
                <Folder size={36} className="empty-icon" />
                <h4>No projects found</h4>
                <p>No projects match the selected filter status.</p>
                <Link to="/projects/create" className="btn-secondary">
                  <Plus size={14} />
                  <span>Create Project</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Baton AI Insights Card */}
        <div className="dashboard-card ai-insights-card">
          <div className="card-header-bar">
            <div className="header-title-group">
              <div className="card-header-icon violet">
                <Sparkles size={18} />
              </div>
              <h2 className="card-title-heading">Baton AI Insights</h2>
            </div>
            <span className="insights-new-badge">New</span>
          </div>

          <div className="ai-insights-list">
            <div className="insight-item">
              <div className="insight-icon green">
                <Check size={13} strokeWidth={2.5} />
              </div>
              <p className="insight-text">3 key decisions identified this week.</p>
            </div>

            <div className="insight-item">
              <div className="insight-icon purple">
                <FileText size={13} />
              </div>
              <p className="insight-text">5 tasks are pending handover.</p>
            </div>

            <div className="insight-item">
              <div className="insight-icon amber">
                <AlertTriangle size={13} />
              </div>
              <p className="insight-text">
                Payment integration is a blocker in <strong>EventSphere</strong>.
              </p>
            </div>

            <div className="insight-item">
              <div className="insight-icon blue">
                <Info size={13} />
              </div>
              <p className="insight-text">
                CampusConnect is 72% complete and ready for handover soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. BOTTOM SECTION: MY TASKS, RECENT ACTIVITY & ASK BATON AI
      ======================================================== */}
      <div className="dashboard-bottom-grid">
        {/* Card 1: My Tasks */}
        <div className="dashboard-card tasks-card">
          <div className="card-header-bar">
            <div className="header-title-group">
              <div className="card-header-icon purple">
                <CheckSquare size={17} />
              </div>
              <h3 className="card-title-heading">My Tasks</h3>
            </div>
            <Link to="/tasks" className="card-header-link">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="dashboard-tasks-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-row-item ${task.completed ? 'completed' : ''}`}
              >
                <div
                  className={`task-checkbox-box ${task.completed ? 'checked' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  role="checkbox"
                  aria-checked={task.completed}
                  tabIndex={0}
                >
                  {task.completed && <Check size={12} strokeWidth={3} />}
                </div>

                <div className="task-content">
                  <span className="task-name">{task.title}</span>
                  <span className="task-project-tag">{task.project}</span>
                </div>

                <span className={`task-priority-badge ${task.priorityType}`}>
                  {task.priority}
                </span>

                <button type="button" className="task-more-btn" title="Options">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Recent Activity Timeline */}
        <div className="dashboard-card activity-card">
          <div className="card-header-bar">
            <div className="header-title-group">
              <div className="card-header-icon purple">
                <Activity size={17} />
              </div>
              <h3 className="card-title-heading">Recent Activity</h3>
            </div>
            <Link to="/timeline" className="card-header-link">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="dashboard-activity-feed">
            {activities.length > 0 ? (
              activities.map((act, index) => (
                <div key={act.id} className="activity-timeline-item">
                  <div className="timeline-node">
                    <div className="timeline-dot" />
                    {index < activities.length - 1 && <div className="timeline-track" />}
                  </div>
                  <div className="activity-details">
                    <p className="activity-title-text">{act.title}</p>
                    <span className="activity-time-stamp">{act.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-activity-state">
                <Clock size={28} className="empty-icon" />
                <p>No recent activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Ask Baton AI Copilot Widget */}
        <div className="dashboard-card copilot-widget-card">
          <div className="copilot-widget-content">
            <div className="copilot-icon-halo">
              <Sparkles size={20} />
            </div>
            <h3 className="copilot-widget-title">Ask Baton AI</h3>
            <p className="copilot-widget-desc">
              Get summaries, extract tasks, find decisions, or generate handover reports.
            </p>

            <form className="copilot-input-form" onSubmit={handleCopilotSubmit}>
              <div className="copilot-input-box">
                <Sparkles size={15} className="copilot-sparkle-icon" />
                <input
                  type="text"
                  placeholder="Ask anything about your projects..."
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  className="copilot-text-input"
                />
                <button
                  type="submit"
                  className="copilot-send-btn"
                  title="Submit prompt to Baton AI"
                >
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

