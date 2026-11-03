import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Mail,
  KeyRound,
  CheckCircle2,
  Camera,
  LogOut,
  Sparkles,
} from 'lucide-react';
import './SettingsPage.css';

/**
 * Settings page — frontend-only state. Changes are kept in React state and
 * shown as confirmed to the user, but nothing is persisted to a backend.
 */
export default function SettingsPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: 'Aniruddha Bhandare',
    email: 'aniruddha@baton.app',
    role: 'Project Lead',
    location: 'Mumbai, India',
    bio: 'Driving project handovers with Baton. Focused on clear communication and documentation.',
  });

  const [account, setAccount] = useState({
    username: 'aniruddha',
    password: '••••••••••••',
  });

  const [notifications, setNotifications] = useState({
    emailSummary: true,
    mention: true,
    decisionAlerts: true,
    weeklyDigest: false,
    mobilePush: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark-sidebar',
    density: 'comfortable',
    reduceMotion: false,
  });

  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showConfirm = (msg) => {
    setToast(msg);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2400);
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAppearanceToggle = (key) => {
    setAppearance((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="settings-page">
      {/* Toast */}
      <div className={`settings-toast ${showToast ? 'show' : ''}`}>
        <CheckCircle2 size={17} />
        {toast}
      </div>

      {/* Header */}
      <div className="settings-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="settings-title-group">
          <div className="settings-icon">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">
              Manage your profile, account, notifications, and appearance.
            </p>
          </div>
        </div>
      </div>

      <div className="settings-grid">
        {/* ── Main column ─────────────────────────────── */}
        <div className="settings-main">
          {/* Profile */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon">
                <User size={18} />
              </div>
              <div className="settings-card-heading">
                <h3>Profile Details</h3>
                <p>This information appears on your handover and team views.</p>
              </div>
            </div>

            <div className="settings-avatar-row">
              <div className="settings-avatar">
                AB
                <span className="settings-avatar-cam">
                  <Camera size={13} />
                </span>
              </div>
              <div className="settings-avatar-actions">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() =>
                    showConfirm('Avatar upload is not enabled in this demo.')
                  }
                >
                  Upload new photo
                </button>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => showConfirm('Avatar removed (demo).')}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="settings-field">
                <label>Full name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Email address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Role / title</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => handleProfileChange('role', e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                />
              </div>
              <div className="settings-field settings-field-full">
                <label>Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                />
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn-secondary" onClick={() => setProfile({
                name: 'Aniruddha Bhandare',
                email: 'aniruddha@baton.app',
                role: 'Project Lead',
                location: 'Mumbai, India',
                bio: 'Driving project handovers with Baton. Focused on clear communication and documentation.',
              })}>
                Discard
              </button>
              <button
                className="btn-primary"
                onClick={() => showConfirm('Profile updated (frontend demo).')}
              >
                <CheckCircle2 size={16} /> Save changes
              </button>
            </div>
          </section>

          {/* Account & Security */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon">
                <Shield size={18} />
              </div>
              <div className="settings-card-heading">
                <h3>Account &amp; Security</h3>
                <p>Manage your sign-in credentials.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="settings-field">
                <label>Username</label>
                <input
                  type="text"
                  value={account.username}
                  onChange={(e) =>
                    setAccount((prev) => ({ ...prev, username: e.target.value }))
                  }
                />
              </div>
              <div className="settings-field">
                <label>Password</label>
                <div className="settings-password">
                  <KeyRound size={15} />
                  <input
                    type="password"
                    value={account.password}
                    onChange={(e) =>
                      setAccount((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() =>
                      showConfirm('Password reset link sent (demo).')
                    }
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-actions">
              <button
                className="btn-secondary"
                onClick={() => showConfirm('Signed out (demo).')}
              >
                <LogOut size={15} /> Sign out
              </button>
              <button
                className="btn-primary"
                onClick={() => showConfirm('Account settings saved (frontend demo).')}
              >
                <CheckCircle2 size={16} /> Save
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon">
                <Bell size={18} />
              </div>
              <div className="settings-card-heading">
                <h3>Notifications</h3>
                <p>Choose what you want to be notified about.</p>
              </div>
            </div>

            {[
              { key: 'emailSummary', title: 'Email summary', desc: 'Get a summary of project activity by email.' },
              { key: 'mention', title: 'Mentions', desc: 'Notify me when I am mentioned in comments or decisions.' },
              { key: 'decisionAlerts', title: 'Decision alerts', desc: 'Alert me when a new decision is recorded.' },
              { key: 'weeklyDigest', title: 'Weekly digest', desc: 'Receive a weekly digest of all projects.' },
              { key: 'mobilePush', title: 'Mobile push', desc: 'Send push notifications to my mobile device.' },
            ].map((item) => (
              <div className="settings-toggle-row" key={item.key}>
                <div>
                  <div className="settings-toggle-title">{item.title}</div>
                  <div className="settings-toggle-desc">{item.desc}</div>
                </div>
                <button
                  className={`settings-switch ${notifications[item.key] ? 'on' : ''}`}
                  role="switch"
                  aria-checked={notifications[item.key]}
                  onClick={() => handleNotificationToggle(item.key)}
                >
                  <span className="settings-switch-knob" />
                </button>
              </div>
            ))}
          </section>
        </div>

        {/* ── Side column ─────────────────────────────── */}
        <div className="settings-side">
          {/* Appearance */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon">
                <Palette size={18} />
              </div>
              <div className="settings-card-heading">
                <h3>Appearance</h3>
                <p>Personalise how Baton looks.</p>
              </div>
            </div>

            <div className="settings-field">
              <label>Theme</label>
              <select
                value={appearance.theme}
                onChange={(e) =>
                  setAppearance((prev) => ({ ...prev, theme: e.target.value }))
                }
              >
                <option value="dark-sidebar">Dark sidebar (default)</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Density</label>
              <select
                value={appearance.density}
                onChange={(e) =>
                  setAppearance((prev) => ({ ...prev, density: e.target.value }))
                }
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>

            <div className="settings-toggle-row">
              <div>
                <div className="settings-toggle-title">Reduce motion</div>
                <div className="settings-toggle-desc">Minimise animations and transitions.</div>
              </div>
              <button
                className={`settings-switch ${appearance.reduceMotion ? 'on' : ''}`}
                role="switch"
                aria-checked={appearance.reduceMotion}
                onClick={() => handleAppearanceToggle('reduceMotion')}
              >
                <span className="settings-switch-knob" />
              </button>
            </div>

            <div className="settings-actions">
              <button
                className="btn-primary"
                onClick={() => showConfirm('Appearance preferences saved (frontend demo).')}
              >
                <CheckCircle2 size={16} /> Apply
              </button>
            </div>
          </section>

          {/* Help */}
          <section className="settings-card settings-card-dark">
            <div className="settings-card-icon-dark">
              <Sparkles size={18} />
            </div>
            <h3 className="settings-dark-title">Need a hand?</h3>
            <p className="settings-dark-desc">
              The Baton AI assistant can help you draft handovers and summarise
              project activity. Changes here are demo-only and not persisted.
            </p>
            <button
              className="settings-dark-btn"
              onClick={() => navigate('/assistant')}
            >
              Open AI Assistant
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
