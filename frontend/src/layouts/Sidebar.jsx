import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CloudUpload,
  ShieldCheck,
  FileText,
  ListTodo,
  TrendingUp,
  Users,
  Sparkles,
  Settings,
  X,
  ArrowRight,
} from 'lucide-react';
import BatonLogo from '../components/common/BatonLogo';
import './Sidebar.css';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'Import & Analyze', path: '/import', icon: CloudUpload },
  { label: 'Review & Verify', path: '/review', icon: ShieldCheck },
  { label: 'Handover Reports', path: '/reports', icon: FileText },
  { label: 'Tasks', path: '/tasks', icon: ListTodo },
  { label: 'Timeline', path: '/timeline', icon: TrendingUp },
  { label: 'Team', path: '/team', icon: Users },
  { label: 'AI Assistant', path: '/assistant', icon: Sparkles },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`baton-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header with Brand */}
        <div className="sidebar-header">
          <Link to="/" onClick={onClose} className="sidebar-brand-link" title="Baton Home">
            <BatonLogo size={32} />
          </Link>
          {isOpen && (
            <button
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <ul className="sidebar-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="sidebar-menu-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={19} className="nav-item-icon" />
                    <span className="nav-item-text">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer with AI Promo Card */}
        <div className="sidebar-footer">
          <div className="sidebar-promo-card">
            <div className="promo-card-icon" aria-hidden="true">
              <Sparkles size={16} />
            </div>
            <h4 className="promo-card-title">Baton AI</h4>
            <p className="promo-card-desc">
              Turn project data into ready handover in seconds.
            </p>
            <NavLink
              to="/assistant"
              className="promo-card-btn"
              onClick={onClose}
            >
              <span>Try Now</span>
              <ArrowRight size={14} />
            </NavLink>
          </div>

          {/* Decorative subtle wave glow at bottom */}
          <div className="sidebar-wave-glow" aria-hidden="true" />
        </div>
      </aside>
    </>
  );
}
