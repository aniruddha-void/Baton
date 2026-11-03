import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Layers,
  Palette,
  Route,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import './FoundationOverview.css';

export default function FoundationOverview() {
  const foundationHighlights = [
    {
      title: 'React 18 + Vite Foundation',
      desc: 'Blazing-fast JSX/JavaScript architecture with optimized build tooling and zero TypeScript overhead.',
      icon: CheckCircle2,
      badge: 'Active & Verified',
    },
    {
      title: 'Visual Identity & Design Tokens',
      desc: 'Extracted directly from Baton reference screens: neon dark sidebar, purple glowing gradients, card containers, and status palettes.',
      icon: Palette,
      badge: 'Tokens Configured',
    },
    {
      title: 'Reusable Application Layout',
      desc: 'Integrated Sidebar, Header with breadcrumbs and user profile, and responsive drawer navigation for all devices.',
      icon: Layers,
      badge: 'Responsive Layout',
    },
    {
      title: 'Configured Route Hierarchy',
      desc: 'React Router setup with registered routes ready for individual screen implementations.',
      icon: Route,
      badge: 'Router Ready',
    },
  ];

  const futureRoutes = [
    { name: 'Projects', path: '/projects', desc: 'Project overview & repository status' },
    { name: 'Import & Analyze', path: '/import', desc: 'Document and codebase ingestion' },
    { name: 'Handover Reports', path: '/reports', desc: 'Structured AI handover documentation' },
    { name: 'Tasks Dashboard', path: '/tasks', desc: 'Extracted tasks, owners & deadlines' },
    { name: 'Timeline', path: '/timeline', desc: 'Milestones, sprint logs & phases' },
    { name: 'Team Management', path: '/team', desc: 'Roles, members & permissions' },
    { name: 'AI Assistant', path: '/assistant', desc: 'Project copilot & interactive queries' },
    { name: 'Settings', path: '/settings', desc: 'Profile, preferences & dark/light theme' },
  ];

  return (
    <div className="foundation-page">
      {/* Hero Welcome Banner */}
      <section className="foundation-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="hero-sparkle" />
            <span>Frontend Foundation Initialized</span>
          </div>
          <h1 className="hero-title">
            Baton — AI Project Knowledge Handover Platform
          </h1>
          <p className="hero-description">
            The frontend foundation is successfully set up and aligned with the Baton visual design system.
            Standing by for your prompt to implement specific screens.
          </p>

          <div className="hero-meta-tags">
            <span className="meta-tag">
              <ShieldCheck size={14} /> Clean Architecture (JS + JSX + CSS)
            </span>
            <span className="meta-tag">
              <span className="status-dot green"></span> Reference UI Aligned
            </span>
            <span className="meta-tag">
              <span className="status-dot purple"></span> Zero Mocked Backend / Fake Data
            </span>
          </div>
        </div>
      </section>

      {/* Foundation Verification Grid */}
      <section className="foundation-grid-section">
        <h2 className="section-title">Foundation Architecture Highlights</h2>
        <div className="foundation-cards-grid">
          {foundationHighlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="foundation-card">
                <div className="card-top">
                  <div className="card-icon-wrap">
                    <Icon size={20} />
                  </div>
                  <span className="card-badge">{item.badge}</span>
                </div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Configured Route Endpoints */}
      <section className="routes-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Configured Application Routes</h2>
            <p className="section-subtitle">
              Click any route to verify navigation within the reusable Baton layout.
            </p>
          </div>
        </div>

        <div className="routes-grid">
          {futureRoutes.map((route) => (
            <Link key={route.path} to={route.path} className="route-card">
              <div className="route-card-info">
                <span className="route-name">{route.name}</span>
                <span className="route-path">{route.path}</span>
                <p className="route-desc">{route.desc}</p>
              </div>
              <div className="route-arrow-wrap">
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

