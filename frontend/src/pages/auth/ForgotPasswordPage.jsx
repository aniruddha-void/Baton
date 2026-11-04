import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import BatonLogo from '../../components/common/BatonLogo';
import { api } from '../../services/apiClient';
import './AuthStyles.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStatusMessage({
        type: 'success',
        text: response.message || 'If an account with that email exists, reset instructions have been sent.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Unable to process password reset request.',
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

            <h1 className="auth-hero-heading">Reset Password</h1>
            <p className="auth-hero-subtext">
              Recover access to your Baton project workspace securely.
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
              <span className="auth-feature-text">Single-Use Security Token</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="auth-card-frame">
          <div className="auth-card-header">
            <div className="auth-card-brand">
              <BatonLogo size={32} />
            </div>
            <h2 className="auth-card-title">Forgot Your Password?</h2>
            <p className="auth-card-subtitle">
              Enter the email associated with your account and we'll send you a recovery link.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="forgot-email" className="form-label">
                Email Address
              </label>
              <div className="input-icon-wrapper">
                <Mail size={17} className="input-leading-icon" />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                    if (statusMessage) setStatusMessage(null);
                  }}
                  placeholder="Enter your registered email"
                  className={`auth-input ${error ? 'input-error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {error && (
                <span className="field-error-msg">
                  <AlertCircle size={12} /> {error}
                </span>
              )}
            </div>

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
              <span>{submitting ? 'Sending Request…' : 'Send Reset Link'}</span>
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

