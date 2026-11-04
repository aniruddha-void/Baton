import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  KeyRound,
  CheckCircle2,
  Camera,
  LogOut,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import './SettingsPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function buildAvatarUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_BASE + path.replace(/^\/api/, '');
}

/**
 * Settings page — wired to the backend for supported settings:
 *   - Profile: PUT /users/profile (name/email/role/location/bio)
 *   - Security: PUT /users/security (currentPassword/newPassword)
 *   - Notifications: PUT /users/notifications
 *   - Avatar: POST /users/avatar (multipart)
 * Appearance (theme/density/reduceMotion) and username have no backend fields,
 * so they remain frontend-only and are labeled as such.
 */
export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Project Lead',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailSummary: user?.notifications?.emailSummary ?? true,
    mention: user?.notifications?.mention ?? true,
    decisionAlerts: user?.notifications?.decisionAlerts ?? true,
    weeklyDigest: user?.notifications?.weeklyDigest ?? false,
    mobilePush: user?.notifications?.mobilePush ?? true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark-sidebar',
    density: 'comfortable',
    reduceMotion: false,
  });

  // Per-section async states
  const [profileSaving, setProfileSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastError, setToastError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fileInputRef = useRef(null);

  const showConfirm = (msg) => {
    setToast(msg);
    setToastError(false);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2400);
  };

  const showError = (msg) => {
    setToast(msg);
    setToastError(true);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3400);
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name: profile.name,
        email: profile.email,
        role: profile.role,
        location: profile.location,
        bio: profile.bio,
      });
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        showConfirm('Profile updated successfully.');
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      showError(err.message || 'Could not update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const discardProfile = () => {
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'Project Lead',
      location: user?.location || '',
      bio: user?.bio || '',
    });
  };

  const saveSecurity = async () => {
    if (!security.currentPassword) {
      showError('Please enter your current password.');
      return;
    }
    if (security.newPassword.length < 8) {
      showError('New password must be at least 8 characters.');
      return;
    }
    setSecuritySaving(true);
    try {
      const res = await api.put('/users/security', {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      if (res.success) {
        setSecurity({ currentPassword: '', newPassword: '' });
        showConfirm(res.message || 'Security credentials updated.');
      } else {
        throw new Error(res.message || 'Failed to update security settings');
      }
    } catch (err) {
      showError(err.message || 'Could not update password.');
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    setNotifSaving(true);
    try {
      const res = await api.put('/users/notifications', next);
      if (res.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
      } else {
        throw new Error(res.message || 'Failed to save notification preferences');
      }
    } catch (err) {
      showError(err.message || 'Could not save notification preferences.');
    } finally {
      setNotifSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setAvatarUploading(true);
    try {
      const res = await api.post('/users/avatar', fd);
      if (res.success && res.data?.avatarUrl) {
        updateUser({ avatarUrl: res.data.avatarUrl });
        showConfirm('Avatar uploaded successfully.');
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err) {
      showError(err.message || 'Could not upload avatar.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarSrc = buildAvatarUrl(user?.avatarUrl);
  const initials = user?.initials || (profile.name.trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase() || 'AB');

  return (
    <div className="settings-page">
      {/* Toast */}
      <div className={`settings-toast ${showToast ? 'show' : ''} ${toastError ? 'error' : ''}`}>
        {toastError ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
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
                {avatarSrc ? <img className="settings-avatar-img" src={avatarSrc} alt="Avatar" /> : initials}
                <span className="settings-avatar-cam">
                  <Camera size={13} />
                </span>
              </div>
              <div className="settings-avatar-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                />
                <button
                  className="btn-secondary btn-sm"
                  disabled={avatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUploading ? <Loader2 size={14} className="spin" /> : 'Upload new photo'}
                </button>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => showConfirm('Avatar removed (frontend only).')}
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
                <select
                  value={profile.role}
                  onChange={(e) => handleProfileChange('role', e.target.value)}
                >
                  <option>Project Lead</option>
                  <option>Frontend Engineer</option>
                  <option>Backend Engineer</option>
                  <option>Product Designer</option>
                  <option>QA Engineer</option>
                  <option>Product Manager</option>
                  <option>Other</option>
                </select>
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
              <button className="btn-secondary" onClick={discardProfile} disabled={profileSaving}>
                Discard
              </button>
              <button className="btn-primary" onClick={saveProfile} disabled={profileSaving}>
                {profileSaving ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
                {profileSaving ? 'Saving…' : 'Save changes'}
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
                <p>Change your password. Username is tied to your account and cannot be edited here.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="settings-field">
                <label>Current password</label>
                <div className="settings-password">
                  <KeyRound size={15} />
                  <input
                    type="password"
                    value={security.currentPassword}
                    placeholder="Current password"
                    onChange={(e) =>
                      setSecurity((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="settings-field">
                <label>New password</label>
                <div className="settings-password">
                  <KeyRound size={15} />
                  <input
                    type="password"
                    value={security.newPassword}
                    placeholder="Min. 8 characters"
                    onChange={(e) =>
                      setSecurity((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn-secondary" onClick={handleLogout}>
                <LogOut size={15} /> Sign out
              </button>
              <button className="btn-primary" onClick={saveSecurity} disabled={securitySaving}>
                {securitySaving ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
                {securitySaving ? 'Saving…' : 'Update password'}
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
            {notifSaving && (
              <div className="settings-saving-note">
                <Loader2 size={13} className="spin" /> Saving…
              </div>
            )}
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
                onClick={() =>
                  setAppearance((prev) => ({ ...prev, reduceMotion: !prev.reduceMotion }))
                }
              >
                <span className="settings-switch-knob" />
              </button>
            </div>

            <div className="settings-actions">
              <button
                className="btn-primary"
                onClick={() => showConfirm('Appearance applied to this session only (not persisted — no backend field).')}
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
              project activity.
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
