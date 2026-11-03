import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  Search,
  Sparkles,
  LogOut,
  User,
  Settings,
  FolderPlus,
  CheckCheck,
  FileText,
  Flag,
  Inbox,
  ListTodo,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'task', title: 'Task assigned to you', message: 'Hrithikraj Singh assigned you "Finalize design handover notes".', time: '2m ago', read: false },
    { id: 2, type: 'decision', title: 'New decision approved', message: '"Deploy to staging" was approved by Aniruddha Bhandare.', time: '28m ago', read: false },
    { id: 3, type: 'milestone', title: 'Milestone reached', message: 'CampusConnect sprint 4 reached 80% progress.', time: '1h ago', read: false },
    { id: 4, type: 'team', title: 'Team member joined', message: 'Vishal Chauhan joined the campusconnect project.', time: '3h ago', read: true },
    { id: 5, type: 'report', title: 'Handover report ready', message: 'Your latest handover draft is ready to review.', time: '1d ago', read: true },
  ]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'task': return <ListTodo size={15} />;
      case 'decision': return <FileText size={15} />;
      case 'milestone': return <Flag size={15} />;
      case 'team': return <UserPlus size={15} />;
      case 'report': return <FileText size={15} />;
      default: return <Bell size={15} />;
    }
  };

  // Close dropdowns on click outside and on Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationPanelOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
        setNotificationPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="baton-header">
      <div className="header-left">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar (matching Baton UI screenshot) */}
        <div className="header-search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search projects, tasks, decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="search-shortcut-badge">Ctrl K</kbd>
        </div>
      </div>

      <div className="header-right">
        {/* Quick New Project Button in Header on smaller screens */}
        <Link to="/projects/create" className="header-new-project-btn" title="Create New Project">
          <FolderPlus size={15} />
          <span>New Project</span>
        </Link>

        {/* AI Quick Status Indicator */}
        <div className="header-ai-badge" title="Baton AI Engine Active">
          <Sparkles size={14} className="ai-badge-sparkle" />
          <span>AI Ready</span>
        </div>

        {/* Notifications Icon Button + Panel */}
        <div className="header-icon-wrap" ref={notificationRef}>
          <button
            className={`header-icon-btn ${notificationPanelOpen ? 'active' : ''}`}
            onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
            aria-label="Notifications"
            aria-expanded={notificationPanelOpen}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {notificationPanelOpen && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <div className="notification-panel-title-wrap">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && <span className="notification-unread-count">{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button className="mark-all-read-btn" onClick={markAllRead}>
                    <CheckCheck size={14} />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty-state">
                    <Inbox size={30} />
                    <p>You're all caught up</p>
                    <span>No new notifications right now.</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notification-item ${n.read ? 'is-read' : 'is-unread'}`}
                      onClick={() => toggleRead(n.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={`notification-type-icon ${n.type}`}>{typeIcon(n.type)}</div>
                      <div className="notification-content">
                        <div className="notification-title-row">
                          <span className="notification-title">{n.title}</span>
                          {!n.read && <span className="notification-unread-dot" />}
                        </div>
                        <p className="notification-message">{n.message}</p>
                        <span className="notification-time">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching reference screenshot */}
        <div className="user-profile-wrapper" ref={dropdownRef}>
          <div
            className="header-user-profile"
            role="button"
            tabIndex={0}
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            title="User Profile Menu"
          >
            <div className="user-avatar" aria-hidden="true">
              <span>{user?.initials || 'A'}</span>
            </div>
            <span className="user-name">{user?.name || 'Aniruddha Bhandare'}</span>
            <ChevronDown
              size={14}
              className={`user-dropdown-arrow ${profileDropdownOpen ? 'rotate' : ''}`}
            />
          </div>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-user-header">
                <span className="dropdown-user-name">{user?.name || 'Aniruddha Bhandare'}</span>
                <span className="dropdown-user-email">{user?.email || 'aniruddha@example.com'}</span>
                <span className="dropdown-user-role">{user?.role || 'Project Lead'}</span>
              </div>
              <div className="dropdown-divider" />
              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </Link>
              <button type="button" className="dropdown-item signout-btn" onClick={handleSignOut}>
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
