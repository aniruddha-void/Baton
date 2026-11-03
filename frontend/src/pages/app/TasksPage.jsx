import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Plus,
  CalendarDays,
  MoreHorizontal,
  Flag,
  X,
} from 'lucide-react';
import './TasksPage.css';

/* ─────────────────────────────────────────────
   TASKS PAGE
   Frontend-only: task interactions (search, filter,
   status/priority changes, add) use local state until
   the backend is connected. No persistence happens here.
───────────────────────────────────────────── */

const OWNERS = [
  { initials: 'A', name: 'Aniruddha Bhandare', role: 'Project Lead', color: '#7c3aed' },
  { initials: 'RY', name: 'Raju Yadav', role: 'Frontend Engineer', color: '#6366f1' },
  { initials: 'HS', name: 'Hrithikraj Singh', role: 'Backend Engineer', color: '#d97706' },
  { initials: 'VC', name: 'Vishal Chauhan', role: 'Product Designer', color: '#16a34a' },
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', color: '#b91c1c', bg: '#fee2e2' },
  { value: 'medium', label: 'Medium', color: '#b45309', bg: '#fef3c7' },
  { value: 'low', label: 'Low', color: '#15803d', bg: '#dcfce7' },
];

const INITIAL_TASKS = [
  {
    id: 'tk1',
    title: 'Design student events feed UI',
    project: 'CampusConnect',
    assignee: 'VC',
    priority: 'high',
    status: 'in-progress',
    due: 'Oct 16',
  },
  {
    id: 'tk2',
    title: 'Implement events API endpoints',
    project: 'CampusConnect',
    assignee: 'HS',
    priority: 'high',
    status: 'todo',
    due: 'Oct 22',
  },
  {
    id: 'tk3',
    title: 'Student services integration test',
    project: 'CampusConnect',
    assignee: 'RY',
    priority: 'medium',
    status: 'review',
    due: 'Oct 28',
  },
  {
    id: 'tk4',
    title: 'Finalize onboarding flow prototype',
    project: 'CampusConnect',
    assignee: 'VC',
    priority: 'medium',
    status: 'todo',
    due: 'Nov 2',
  },
  {
    id: 'tk5',
    title: 'Auth + profile endpoints coverage',
    project: 'CampusConnect',
    assignee: 'HS',
    priority: 'low',
    status: 'done',
    due: 'Oct 9',
  },
  {
    id: 'tk6',
    title: 'Prepare pilot launch kickoff notes',
    project: 'CampusConnect',
    assignee: 'A',
    priority: 'medium',
    status: 'done',
    due: 'Oct 5',
  },
];

function ownerById(initials) {
  return OWNERS.find((o) => o.initials === initials) || OWNERS[0];
}

function priorityMeta(value) {
  return PRIORITY_OPTIONS.find((p) => p.value === value) || PRIORITY_OPTIONS[1];
}

function statusMeta(value) {
  return STATUS_OPTIONS.find((s) => s.value === value) || STATUS_OPTIONS[0];
}

export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: 'A',
    priority: 'medium',
    status: 'todo',
    due: '',
  });

  const openCreateModal = () => {
    setNewTask({
      title: '',
      description: '',
      assignee: 'A',
      priority: 'medium',
      status: 'todo',
      due: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeCreateModal = () => {
    setShowModal(false);
    setFormError('');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setFormError('Please enter a task title.');
      return;
    }
    const created = {
      id: `tk${Date.now()}`,
      title: newTask.title.trim(),
      project: 'CampusConnect',
      assignee: newTask.assignee,
      priority: newTask.priority,
      status: newTask.status,
      due: newTask.due || 'Not set',
    };
    setTasks((prev) => [created, ...prev]);
    closeCreateModal();
  };

  const setTask = (id, updater) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? updater(t) : t)));
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesQuery =
        !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.project.toLowerCase().includes(query.toLowerCase()) ||
        ownerById(t.assignee).name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesOwner = ownerFilter === 'all' || t.assignee === ownerFilter;
      return matchesQuery && matchesStatus && matchesPriority && matchesOwner;
    });
  }, [tasks, query, statusFilter, priorityFilter, ownerFilter]);

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    high: tasks.filter((t) => t.priority === 'high').length,
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setOwnerFilter('all');
  };

  return (
    <div className="tk-page">
      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="tk-header">
        <button type="button" className="btn-back" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>
        <div className="tk-title-group">
          <div className="tk-icon">
            <ListTodo size={22} />
          </div>
          <div>
            <h1 className="tk-title">Tasks</h1>
            <p className="tk-subtitle">
              Track extracted tasks, owners, delivery deadlines, and completion status.
            </p>
          </div>
        </div>
        <button type="button" className="btn-primary tk-add-btn" onClick={openCreateModal}>
          <Plus size={15} />
          <span>New Task</span>
        </button>
      </div>

      {/* ── STAT STRIP ────────────────────────────────── */}
      <div className="tk-stat-strip">
        <div className="tk-stat-card">
          <div className="tk-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <ListTodo size={19} />
          </div>
          <div className="tk-stat-text">
            <span className="tk-stat-count">{counts.total}</span>
            <span className="tk-stat-label">Total Tasks</span>
          </div>
        </div>
        <div className="tk-stat-card">
          <div className="tk-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Clock size={19} />
          </div>
          <div className="tk-stat-text">
            <span className="tk-stat-count">{counts.inProgress}</span>
            <span className="tk-stat-label">In Progress</span>
          </div>
        </div>
        <div className="tk-stat-card">
          <div className="tk-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <CheckCircle2 size={19} />
          </div>
          <div className="tk-stat-text">
            <span className="tk-stat-count">{counts.review}</span>
            <span className="tk-stat-label">In Review</span>
          </div>
        </div>
        <div className="tk-stat-card">
          <div className="tk-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 size={19} />
          </div>
          <div className="tk-stat-text">
            <span className="tk-stat-count">{counts.done}</span>
            <span className="tk-stat-label">Completed</span>
          </div>
        </div>
        <div className="tk-stat-card">
          <div className="tk-stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <Flag size={19} />
          </div>
          <div className="tk-stat-text">
            <span className="tk-stat-count">{counts.high}</span>
            <span className="tk-stat-label">High Priority</span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR (search + filters) ───────────────── */}
      <div className="tk-toolbar">
        <div className="tk-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tasks, projects, or assignees…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="tk-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`tk-filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters((s) => !s)}
        >
          <Filter size={15} />
          <span>Filters</span>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || ownerFilter !== 'all') && (
            <span className="tk-filter-dot" />
          )}
        </button>

        {(statusFilter !== 'all' || priorityFilter !== 'all' || ownerFilter !== 'all') && (
          <button type="button" className="tk-clear-filters" onClick={resetFilters}>
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="tk-filters">
          <div className="tk-filter-field">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="tk-filter-field">
            <label>Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All priorities</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="tk-filter-field">
            <label>Assignee</label>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              <option value="all">All assignees</option>
              {OWNERS.map((o) => (
                <option key={o.initials} value={o.initials}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── TASK LIST ────────────────────────────────── */}
      <section className="tk-card">
        <div className="tk-card-head">
          <div className="tk-card-head-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <ListTodo size={18} />
          </div>
          <div>
            <h2 className="tk-card-title">All Tasks</h2>
            <p className="tk-card-subtitle">
              {filtered.length} of {counts.total} tasks shown
              {query && ` for “${query}”`}
            </p>
          </div>
        </div>

        <div className="tk-table">
          <div className="tk-table-head">
            <span className="tk-th tk-th-task">Task</span>
            <span className="tk-th">Priority</span>
            <span className="tk-th">Assignee</span>
            <span className="tk-th">Due Date</span>
            <span className="tk-th">Status</span>
            <span className="tk-th tk-th-action" />
          </div>

          {filtered.length === 0 ? (
            <div className="tk-empty">
              <Search size={22} />
              <p>No tasks match your current search or filters.</p>
              <button type="button" className="btn-secondary" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((task) => {
              const owner = ownerById(task.assignee);
              const pr = priorityMeta(task.priority);
              const st = statusMeta(task.status);
              return (
                <div key={task.id} className="tk-row">
                  <div className="tk-task-cell">
                    <span className={`tk-status-rail ${task.status}`} />
                    <div className="tk-task-info">
                      <span className="tk-task-title">{task.title}</span>
                      <span className="tk-project-name">{task.project}</span>
                    </div>
                  </div>
                  <div className="tk-priority-cell">
                    <span
                      className="tk-priority-pill"
                      style={{ background: pr.bg, color: pr.color }}
                    >
                      {pr.label}
                    </span>
                  </div>
                  <div className="tk-assignee-cell">
                    <span className="tk-avatar" style={{ background: owner.color }} title={owner.name}>
                      {owner.initials}
                    </span>
                    <span className="tk-assignee-name">{owner.name}</span>
                  </div>
                  <div className="tk-due-cell">
                    <CalendarDays size={13} />
                    <span>{task.due}</span>
                  </div>
                  <div className="tk-status-cell">
                    <span className={`tk-status-pill ${task.status}`}>{st.label}</span>
                  </div>
                  <div className="tk-action-cell">
                    <select
                      className="tk-status-select"
                      value={task.status}
                      onChange={(e) => setTask(task.id, (t) => ({ ...t, status: e.target.value }))}
                      aria-label="Change task status"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button type="button" className="tk-more-btn" aria-label="More actions">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── NEW TASK MODAL ───────────────────────────── */}
      {showModal && (
        <div className="tk-modal-overlay" onClick={closeCreateModal}>
          <div
            className="tk-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-task-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tk-modal-head">
              <div className="tk-modal-icon">
                <Plus size={18} />
              </div>
              <div className="tk-modal-title-block">
                <h2 id="new-task-modal-title" className="tk-modal-title">New Task</h2>
                <p className="tk-modal-subtitle">Add a task to your project backlog.</p>
              </div>
              <button
                type="button"
                className="tk-modal-close"
                onClick={closeCreateModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="tk-modal-form" onSubmit={handleCreateTask}>
              <div className="tk-form-field">
                <label htmlFor="task-title">Task Title <span className="tk-req">*</span></label>
                <input
                  id="task-title"
                  type="text"
                  placeholder="e.g. Design student events feed UI"
                  value={newTask.title}
                  onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="tk-form-field">
                <label htmlFor="task-desc">Description</label>
                <textarea
                  id="task-desc"
                  rows={3}
                  placeholder="Add context or acceptance criteria…"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((t) => ({ ...t, description: e.target.value }))
                  }
                />
              </div>

              <div className="tk-form-grid">
                <div className="tk-form-field">
                  <label htmlFor="task-assignee">Assignee</label>
                  <select
                    id="task-assignee"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask((t) => ({ ...t, assignee: e.target.value }))}
                  >
                    {OWNERS.map((o) => (
                      <option key={o.initials} value={o.initials}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div className="tk-form-field">
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask((t) => ({ ...t, priority: e.target.value }))}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="tk-form-field">
                  <label htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    value={newTask.status}
                    onChange={(e) => setNewTask((t) => ({ ...t, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="tk-form-field">
                  <label htmlFor="task-due">Due Date</label>
                  <input
                    id="task-due"
                    type="date"
                    value={newTask.due}
                    onChange={(e) => setNewTask((t) => ({ ...t, due: e.target.value }))}
                  />
                </div>
              </div>

              {formError && <div className="tk-form-error">{formError}</div>}

              <div className="tk-modal-actions">
                <button type="button" className="btn-secondary" onClick={closeCreateModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
