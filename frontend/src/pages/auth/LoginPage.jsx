import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Check,
  Code2,
  Folder,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import BatonLogo from '../../components/common/BatonLogo';
import './AuthStyles.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error on user typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (statusMessage) {
      setStatusMessage(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Call AuthContext login — backend integration will replace this later
      login({ email: formData.email });
      navigate(from, { replace: true });
    }
  };

  const handleSocialClick = (provider) => {
    setStatusMessage({
      type: 'info',
      text: `${provider} OAuth sign-in trigger received. (Backend authentication will be integrated separately).`,
    });
  };

  return (
    <div className="auth-page-container">
      {/* Decorative Wave Glow */}
      <div className="auth-bottom-wave" aria-hidden="true" />

      <div className="auth-split-wrapper">
        {/* ========================================================
            LEFT COLUMN: BRANDING & 3D FLOATING ILLUSTRATION
        ======================================================== */}
        <div className="auth-left-column">
          <div className="auth-left-header">
            <Link to="/" className="auth-brand-link" title="Baton Home">
              <BatonLogo size={36} />
            </Link>

            <h1 className="auth-hero-heading">Welcome Back</h1>
            <p className="auth-hero-subtext">
              Continue your project handover journey with AI.
            </p>
          </div>

          {/* 3D Glass Orbit Visual */}
          <div className="auth-illustration-stage" aria-hidden="true">
            <div className="auth-orbit-ring" />
            <Sparkles size={16} className="auth-sparkle-star star-1" />
            <Sparkles size={14} className="auth-sparkle-star star-2" />

            <div className="auth-glass-cards">
              {/* Code Card */}
              <div className="glass-card code-card">
                <Code2 size={32} />
              </div>

              {/* Task Checklist Card */}
              <div className="glass-card task-card">
                <div className="task-card-row">
                  <div className="task-check-icon">
                    <Check size={11} />
                  </div>
                  <div className="task-bar" />
                </div>
                <div className="task-card-row">
                  <div className="task-check-icon">
                    <Check size={11} />
                  </div>
                  <div className="task-bar" style={{ width: '60%' }} />
                </div>
              </div>

              {/* Team Card */}
              <div className="glass-card team-card">
                <Users size={30} />
              </div>

              {/* Folder Card */}
              <div className="glass-card folder-card">
                <Folder size={32} />
              </div>
            </div>
          </div>

          {/* Bottom 3 Feature Pills */}
          <div className="auth-feature-tags">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <Zap size={18} />
              </div>
              <span className="auth-feature-text">AI-Powered Handover</span>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <Users size={18} />
              </div>
              <span className="auth-feature-text">Team Collaboration</span>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box">
                <BarChart3 size={18} />
              </div>
              <span className="auth-feature-text">Project Insights</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: LOGIN FORM CARD
        ======================================================== */}
        <div className="auth-card-frame">
          <div className="auth-card-header">
            <div className="auth-card-brand">
              <BatonLogo size={32} />
            </div>
            <h2 className="auth-card-title">Log In to Your Account</h2>
            <p className="auth-card-subtitle">
              Access your projects, tasks, and handover insights.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email
              </label>
              <div className="input-icon-wrapper">
                <Mail size={17} className="input-leading-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`auth-input ${errors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="field-error-msg">
                  <AlertCircle size={12} /> {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div className="input-icon-wrapper">
                <Lock size={17} className="input-leading-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`auth-input has-trailing ${errors.password ? 'input-error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-trailing-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
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

            {/* Remember Me & Forgot Password */}
            <div className="form-options-row">
              <label className="checkbox-label">
                <div
                  className={`auth-checkbox-box ${formData.rememberMe ? 'checked' : ''}`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rememberMe: !prev.rememberMe }))
                  }
                  role="checkbox"
                  aria-checked={formData.rememberMe}
                  tabIndex={0}
                >
                  {formData.rememberMe && <Check size={12} strokeWidth={3} />}
                </div>
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() =>
                  setStatusMessage({
                    type: 'info',
                    text: 'Password recovery flow is ready for backend email reset endpoint.',
                  })
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Status Banner */}
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

            {/* Primary Submit Button */}
            <button type="submit" className="btn-auth-primary">
              <span>Log In</span>
              <ArrowRight size={16} />
            </button>

            {/* Divider */}
            <div className="auth-divider-row">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">Or continue with</span>
              <div className="auth-divider-line" />
            </div>

            {/* Social Buttons */}
            <div className="auth-social-row">
              <button
                type="button"
                className="btn-social-auth"
                onClick={() => handleSocialClick('Google')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                className="btn-social-auth"
                onClick={() => handleSocialClick('GitHub')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>
          </form>

          {/* Bottom Switch Link */}
          <div className="auth-switch-footer">
            <span>Don't have an account?</span>
            <Link to="/signup" className="auth-switch-link">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

