import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import BatonLogo from '../../components/common/BatonLogo';
import { api } from '../../services/apiClient';
import './AuthStyles.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic password strength calculation
  const calculateStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', class: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: 'Weak password', class: 'weak' };
    if (score <= 3) return { level: 2, label: 'Medium password', class: 'medium' };
    return { level: 3, label: 'Strong password', class: 'strong' };
  };

  const strength = calculateStrength(password);

  const validate = () => {
    const errs = {};
    if (!token) errs.token = 'Reset token is missing.';
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
      });

      setStatusMessage({
        type: 'success',
        text: response.message || 'Password reset successfully. Redirecting to login…',
      });

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Password updated successfully! Please log in.' },
        });
      }, 1600);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Unable to reset password. Token may be invalid or expired.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-bottom-wave" aria-hidden="true" />

      <div className="auth-split-wrapper">
        {/* Left Column */}
        <div className="auth-left-column">
          <div className="auth-left-header">
            <Link to="/" className="auth-brand-link" title="Baton Home">
              <BatonLogo size={36} />
            </Link>

            <h1 className="auth-hero-heading">New Credentials</h1>
            <p className="auth-hero-subtext">
              Set a strong, new password for your Baton account.
            </p>
          </div>

          <div className="auth-illustration-stage" aria-hidden="true">
            <div className="auth-orbit-ring" />
            <Sparkles size={16} className="auth-sparkle-star star-1" />
            <Sparkles size={14} className="auth-sparkle-star star-2" />

            <div className="auth-glass-cards">
              <div className="glass-card code-card" style={{ top: '20px', left: '30px' }}>
                <KeyRound size={32} />
              </div>
              <div className="glass-card folder-card" style={{ bottom: '20px', right: '30px' }}>
                <ShieldCheck size={32} />
              </div>
            </div>
          </div>

          <div className="auth-feature-tags">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <ShieldCheck size={18} />
              </div>
              <span className="auth-feature-text">End-to-End Cryptographic Security</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="auth-card-frame">
          <div className="auth-card-header">
            <div className="auth-card-brand">
              <BatonLogo size={32} />
            </div>
            <h2 className="auth-card-title">Set New Password</h2>
            <p className="auth-card-subtitle">
              Choose a secure password with at least 8 characters.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="reset-password" className="form-label">
                New Password
              </label>
              <div className="input-icon-wrapper">
                <Lock size={17} className="input-leading-icon" />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="Create new password"
                  className={`auth-input has-trailing ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-trailing-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error-msg">
                  <AlertCircle size={12} /> {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="reset-confirm" className="form-label">
                Confirm New Password
              </label>
              <div className="input-icon-wrapper">
                <Lock size={17} className="input-leading-icon" />
                <input
                  id="reset-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Confirm new password"
                  className={`auth-input has-trailing ${errors.confirmPassword ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-trailing-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error-msg">
                  <AlertCircle size={12} /> {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="password-strength-wrap">
                <div className="strength-meter-bars">
                  <div className={`meter-bar ${strength.level >= 1 ? `active-${strength.class}` : ''}`} />
                  <div className={`meter-bar ${strength.level >= 2 ? `active-${strength.class}` : ''}`} />
                  <div className={`meter-bar ${strength.level >= 3 ? `active-${strength.class}` : ''}`} />
                  <div className={`meter-bar ${strength.level >= 3 ? `active-${strength.class}` : ''}`} />
                </div>
                <span className={`strength-text ${strength.class}`}>
                  {strength.level >= 3 && <CheckCircle2 size={13} />}
                  {strength.label}
                </span>
              </div>
            )}

            {/* Status Feedback Banner */}
            {statusMessage && (
              <div className={`auth-feedback-banner ${statusMessage.type}`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button type="submit" className="btn-auth-primary" disabled={submitting}>
              <span>{submitting ? 'Resetting Password…' : 'Update Password'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-switch-footer" style={{ marginTop: '24px' }}>
              <Link to="/login" className="auth-switch-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} /> Back to Log In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

