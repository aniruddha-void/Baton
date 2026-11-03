import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TimelinePage.css';

// Demo team members (consistent with the rest of the app)
const MEMBERS = [
  { name: 'Aniruddha Bhandare', role: 'Product' },
  { name: 'Raju Yadav', role: 'Design' },
  { name: 'Hrithikraj Singh', role: 'Engineering' },
  { name: 'Vishal Chauhan', role: 'Operations' },
];

const AVATAR_COLORS = ['#6C5CE7', '#0984E3', '#E17055', '#00B894'];

function initialsOf(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function colorFor(name) {
  const idx = MEMBERS.findIndex((m) => m.name === name);
  return AVATAR_COLORS[Math.max(0, idx)];
}

// Demo timeline events
const INITIAL_EVENTS = [
  {
    id: 'ev-1',
    date: 'Today',
    title: 'Handover report approved',
    description: 'The Q3 handover report was approved by all owners and is ready for distribution.',
    kind: 'approval',
    members: ['Aniruddha Bhandare', 'Vishal Chauhan'],
    type: 'decision',
  },
  {
    id: 'ev-2',
    date: 'Today',
    title: 'New task assigned: CampusConnect',
    description: 'Vishal assigned a design review task for the CampusConnect onboarding flow.',
    kind: 'task',
    members: ['Vishal Chauhan'],
    type: 'task',
  },
  {
    id: 'ev-3',
    date: 'Yesterday',
    title: 'Timeline milestone added',
    description: 'Alpha release milestone was moved to the project timeline for the mobile app.',
    kind: 'milestone',
    members: ['Raju Yadav'],
    type: 'timeline',
  },
  {
    id: 'ev-4',
    date: 'May 28',
    title: 'Document analyzed: campus handover notes',
    description: 'The uploaded PDF was parsed and extracted decisions, tasks, and timeline items.',
    kind: 'analysis',
    members: ['Hrithikraj Singh'],
    type: 'decision',
  },
  {
    id: 'ev-5',
    date: 'May 27',
    title: 'Team member added',
    description: 'Hrithikraj Singh joined the operating team for the engineering track.',
    kind: 'team',
    members: ['Hrithikraj Singh'],
    type: 'team',
  },
  {
    id: 'ev-6',
    date: 'May 26',
    title: 'Project created',
    description: 'CampusConnect was created from the onboarding template.',
    kind: 'create',
    members: ['Aniruddha Bhandare'],
    type: 'decision',
  },
];

const KIND_META = {
  approval: { label: 'Approval', color: '#00B894' },
  task: { label: 'Task', color: '#0984E3' },
  milestone: { label: 'Milestone', color: '#6C5CE7' },
  analysis: { label: 'Analysis', color: '#E17055' },
  team: { label: 'Team', color: '#FDCB6E' },
  create: { label: 'Create', color: '#00CEC9' },
};

function TimelinePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const counts = {
    all: events.length,
    decision: events.filter((e) => e.type === 'decision').length,
    task: events.filter((e) => e.type === 'task').length,
    timeline: events.filter((e) => e.type === 'timeline').length,
    team: events.filter((e) => e.type === 'team').length,
  };

  const filtered = events.filter((e) => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${e.title} ${e.description} ${e.members.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="timeline-page">
      <div className="page-head">
        <button className="btn-back" onClick={() => navigate('/projects')} aria-label="Back to projects">
          ←
        </button>
        <div className="page-title-wrap">
          <span className="page-icon" style={{ background: 'linear-gradient(135deg, #6C5CE7, #0984E3)' }}>
            ⟷
          </span>
          <div>
            <h1 className="page-title">Timeline</h1>
            <p className="page-subtitle">Project activity, milestones, and events in chronological order.</p>
          </div>
        </div>
        <div className="page-actions" />
      </div>

      <div className="timeline-stats">
        <div className="stat-card">
          <span className="stat-value">{counts.all}</span>
          <span className="stat-label">Total events</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.decision}</span>
          <span className="stat-label">Decisions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.task}</span>
          <span className="stat-label">Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.timeline}</span>
          <span className="stat-label">Milestones</span>
        </div>
      </div>

      <div className="timeline-toolbar">
        <div className="timeline-filters">
          {['all', 'decision', 'task', 'timeline', 'team'].map((t) => (
            <button
              key={t}
              className={`filter-chip ${filter === t ? 'is-active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="timeline-search">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="timeline-body">
        <div className="timeline-column">
          {filtered.length === 0 ? (
            <div className="timeline-empty">
              <p>No activity matches your filter.</p>
            </div>
          ) : (
            <div className="timeline-list">
              {filtered.map((e) => {
                const meta = KIND_META[e.kind] || KIND_META.create;
                return (
                  <div className="timeline-event" key={e.id}>
                    <div className="timeline-event-marker" style={{ background: meta.color }}>
                      <span className="marker-dot" />
                    </div>
                    <div className="timeline-event-card">
                      <div className="timeline-event-top">
                        <span className="event-kind" style={{ background: `${meta.color}1A`, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="event-date">{e.date}</span>
                      </div>
                      <h3 className="event-title">{e.title}</h3>
                      <p className="event-description">{e.description}</p>
                      {e.members.length > 0 && (
                        <div className="event-members">
                          {e.members.map((m) => (
                            <div className="event-member" key={m} title={m}>
                              <span
                                className="member-avatar"
                                style={{ background: colorFor(m) }}
                              >
                                {initialsOf(m)}
                              </span>
                              <span className="event-member-name">{m}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="timeline-side">
          <div className="side-card">
            <h4 className="side-card-title">Event types</h4>
            <div className="legend-list">
              {Object.entries(KIND_META).map(([k, m]) => (
                <div className="legend-row" key={k}>
                  <span className="legend-dot" style={{ background: m.color }} />
                  <span className="legend-label">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="side-card dark">
            <h4 className="side-card-title">Handover</h4>
            <p className="side-card-text">
              Generate a handover report from the recorded activity and progress on this project.
            </p>
            <button className="btn-primary" onClick={() => navigate('/reports')}>
              Generate report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelinePage;
