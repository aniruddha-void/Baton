import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  Layers,
  Users,
  BarChart3,
  FileText,
  CheckCircle2,
  Edit3,
  CloudUpload,
  CheckSquare,
  GraduationCap,
  Code2,
  UserCheck,
  Calendar,
  AlertTriangle,
  Link2,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Check,
  Menu,
  X,
  Clock,
  Download,
} from 'lucide-react';
import BatonLogo from '../../components/common/BatonLogo';
import './LandingPage.css';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [reviewItems, setReviewItems] = useState([
    {
      id: 1,
      type: 'Decision',
      typeClass: 'decision',
      text: 'Use MongoDB as the project database.',
      source: 'Source: Project_Notes.pdf (p.4)',
      confidence: '92%',
      checked: true,
      category: 'Decisions',
    },
    {
      id: 2,
      type: 'Task',
      typeClass: 'task',
      text: 'Implement user authentication.',
      source: 'Source: Meeting_Notes.docx (p.2)',
      confidence: '88%',
      checked: true,
      category: 'Tasks',
    },
    {
      id: 3,
      type: 'Blocker',
      typeClass: 'blocker',
      text: 'Delay in receiving UI design assets.',
      source: 'Source: Sprint_Notes.txt (p.1)',
      confidence: '76%',
      checked: false,
      category: 'Blockers',
    },
  ]);

  const toggleReviewItem = (id) => {
    setReviewItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const selectedCount = reviewItems.filter((item) => item.checked).length;

  const faqs = [
    {
      question: 'What is Baton?',
      answer:
        'Baton is an AI-powered project knowledge handover platform designed to capture, organize, and transfer project knowledge seamlessly between team members, students, and engineers.',
    },
    {
      question: 'How does the AI analysis work?',
      answer:
        'Baton ingests your project documentation, meeting notes, commits, and tickets. Using contextual AI models, it extracts key technical decisions, pending deliverables, owners, and blockers with transparent source references.',
    },
    {
      question: 'What kind of project information can it extract?',
      answer:
        'Baton surfaces core project objectives, tech stack choices, architecture decisions, task allocations, deadlines, active dependencies, roadblocks, and next setup steps.',
    },
    {
      question: 'Can I review and edit the extracted information?',
      answer:
        'Yes. Baton provides a human-in-the-loop Review & Verify screen where you can inspect, edit, delete, or add missing points before generating the final report.',
    },
    {
      question: 'What is included in the handover report?',
      answer:
        'A complete handover report includes an executive project overview, chronological decisions log, task ownership matrix, milestone timeline, risks & blockers list, and direct links to source documents.',
    },
  ];

  return (
    <div className="landing-container">
      {/* ========================================================
          1. HEADER NAVIGATION
      ======================================================== */}
      <header className="landing-header">
        <div className="header-inner">
          <Link to="/" className="brand-logo-link">
            <BatonLogo size={34} />
          </Link>

          {/* Center Navigation Links */}
          <nav className="desktop-nav" aria-label="Landing Navigation">
            <a href="#home" className="nav-link active">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#use-cases" className="nav-link">Use Cases</a>
            <a href="#about" className="nav-link">About</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="header-actions">
            <Link to="/login" className="btn-login">
              Log In
            </Link>
            <Link to="/signup" className="btn-create-account">
              Create Account
            </Link>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <a href="#use-cases" onClick={() => setMobileMenuOpen(false)}>Use Cases</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
            <div className="mobile-auth-actions">
              <Link to="/login" className="btn-login" onClick={() => setMobileMenuOpen(false)}>
                Log In
              </Link>
              <Link to="/signup" className="btn-create-account" onClick={() => setMobileMenuOpen(false)}>
                Create Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          2. HERO SECTION
      ======================================================== */}
      <section id="home" className="hero-section">
        <div className="hero-grid">
          {/* Left Hero Content */}
          <div className="hero-copy">
            <div className="hero-pill-badge">
              <Sparkles size={14} className="pill-sparkle" />
              <span>AI-Powered Project Handover</span>
            </div>

            <h1 className="hero-heading">
              Never Lose
              <span className="heading-line-break">Project Knowledge</span>
              <span className="heading-highlight">
                Again
                <svg className="curved-underline" viewBox="0 0 170 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 11C48 3.5 122 3.5 167 11" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
                  <path d="M12 13C52 6 118 6 158 13" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="hero-subtext">
              Baton helps teams capture, organize, and transfer project knowledge
              with the power of AI — so handovers are fast, complete, and hassle-free.
            </p>

            <div className="hero-cta-group">
              <Link to="/signup" className="btn-primary-hero">
                <span>Get Started for Free</span>
                <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="btn-demo-hero">
                <span className="play-icon-wrap">
                  <Play size={12} fill="currentColor" />
                </span>
                <span>Watch Demo</span>
              </a>
            </div>
          </div>

          {/* Right Hero Visual / Interactive 3D Perspective Card */}
          <div className="hero-visual">
            <div className="hero-orbital-glow" />

            {/* Floating Floating Pill: AI Analysis */}
            <div className="floating-badge badge-top-right">
              <Sparkles size={13} className="float-sparkle" />
              <span>AI Analysis</span>
            </div>

            {/* Floating Floating Pill: Project Handover */}
            <div className="floating-badge badge-bottom-right">
              <Layers size={13} />
              <span>Project Handover</span>
            </div>

            {/* Mockup Preview Card */}
            <div className="hero-mockup-card">
              <div className="mockup-sidebar">
                <div className="mockup-logo-mark">
                  <div className="mockup-logo-dot" />
                  <span className="mockup-brand-text">Baton</span>
                </div>
                <div className="mockup-nav-icon active"></div>
                <div className="mockup-nav-icon"></div>
                <div className="mockup-nav-icon"></div>
                <div className="mockup-nav-icon"></div>
                <div className="mockup-nav-icon"></div>
              </div>

              <div className="mockup-main">
                <div className="mockup-topbar">
                  <div className="mockup-report-badge">
                    <FileText size={14} />
                    <span>AI Handover Report</span>
                  </div>
                  <div className="mockup-check-circle">
                    <Check size={12} />
                  </div>
                </div>

                <div className="mockup-grid">
                  <div className="mockup-metric-card">
                    <CheckSquare size={16} className="metric-icon purple" />
                    <span className="metric-title">Tasks</span>
                  </div>
                  <div className="mockup-metric-card">
                    <Calendar size={16} className="metric-icon blue" />
                    <span className="metric-title">Timeline</span>
                  </div>
                  <div className="mockup-metric-card">
                    <Users size={16} className="metric-icon purple" />
                    <span className="metric-title">Team</span>
                  </div>
                  <div className="mockup-metric-card">
                    <BarChart3 size={16} className="metric-icon blue" />
                    <span className="metric-title">Reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Value Prop Ticker Row */}
        <div className="hero-ticker-bar">
          <div className="ticker-item">
            <div className="ticker-icon-box">
              <Zap size={18} />
            </div>
            <div className="ticker-text">
              <h4>Capture Knowledge</h4>
              <p>From docs, notes, and code</p>
            </div>
          </div>

          <div className="ticker-item">
            <div className="ticker-icon-box">
              <Layers size={18} />
            </div>
            <div className="ticker-text">
              <h4>AI-Powered Analysis</h4>
              <p>Extract tasks, decisions, and blockers</p>
            </div>
          </div>

          <div className="ticker-item">
            <div className="ticker-icon-box">
              <Users size={18} />
            </div>
            <div className="ticker-text">
              <h4>Team Collaboration</h4>
              <p>Keep everyone aligned</p>
            </div>
          </div>

          <div className="ticker-item">
            <div className="ticker-icon-box">
              <BarChart3 size={18} />
            </div>
            <div className="ticker-text">
              <h4>Handover Reports</h4>
              <p>Professional, shareable reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. POWERFUL FEATURES SECTION
      ======================================================== */}
      <section id="features" className="features-section">
        <div className="section-heading-center">
          <h2 className="section-title">Powerful Features for Project Handover</h2>
          <p className="section-subtitle">
            Everything you need to capture, organize, review, and transfer project knowledge.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrap">
              <FileText size={22} />
            </div>
            <h3 className="feature-title">Capture Project Knowledge</h3>
            <p className="feature-desc">
              Upload project documents, notes, or project files to bring all project
              information in one place.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Sparkles size={22} />
            </div>
            <h3 className="feature-title">AI Extraction with Source Traceability</h3>
            <p className="feature-desc">
              Automatically extract key decisions, tasks, owners, deadlines, and
              blockers with source references.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Edit3 size={22} />
            </div>
            <h3 className="feature-title">Human Review & Correction</h3>
            <p className="feature-desc">
              Review the AI-extracted information, edit or add missing details, and
              approve with confidence.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Layers size={22} />
            </div>
            <h3 className="feature-title">Structured Handover Report</h3>
            <p className="feature-desc">
              Generate a complete, well-organized handover report that keeps the
              project knowledge ready for the next team.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. HOW BATON WORKS SECTION
      ======================================================== */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-heading-center">
          <h2 className="section-title">How Baton Works</h2>
          <p className="section-subtitle">
            Turn your project knowledge into a seamless handover in 4 simple steps.
          </p>
        </div>

        <div className="workflow-steps-wrap">
          <div className="workflow-step-card">
            <div className="step-icon-box">
              <CloudUpload size={22} />
            </div>
            <h3 className="step-number-title">1. Import</h3>
            <p className="step-desc">Upload docs, notes, or project files.</p>
          </div>

          <div className="step-connector-arrow">
            <ArrowRight size={20} />
          </div>

          <div className="workflow-step-card">
            <div className="step-icon-box">
              <Sparkles size={22} />
            </div>
            <h3 className="step-number-title">2. Analyze</h3>
            <p className="step-desc">AI extracts tasks, decisions, and key insights.</p>
          </div>

          <div className="step-connector-arrow">
            <ArrowRight size={20} />
          </div>

          <div className="workflow-step-card">
            <div className="step-icon-box">
              <CheckSquare size={22} />
            </div>
            <h3 className="step-number-title">3. Review</h3>
            <p className="step-desc">Verify and refine the extracted information.</p>
          </div>

          <div className="step-connector-arrow">
            <ArrowRight size={20} />
          </div>

          <div className="workflow-step-card">
            <div className="step-icon-box">
              <FileText size={22} />
            </div>
            <h3 className="step-number-title">4. Handover</h3>
            <p className="step-desc">Generate a complete handover report.</p>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. FEATURE SHOWCASE 1: REVIEW & VERIFY INTERFACE
      ======================================================== */}
      <section className="showcase-section">
        <div className="showcase-grid">
          {/* Left Mockup: Review & Verify (Static Product Preview) */}
          <div className="showcase-mockup-frame">
            <div className="mockup-window-header">
              <div className="mockup-brand-row">
                <BatonLogo size={20} showSubtitle={false} />
                <span className="product-preview-pill">Product Preview</span>
              </div>
              <div className="mockup-project-badge">
                <span>Project: CampusConnect</span>
                <ChevronDown size={14} />
              </div>
            </div>

            <div className="review-interface-body">
              <div className="review-headline">
                <h4 className="review-title">Review & Verify</h4>
                <p className="review-subtitle">
                  Review the AI-extracted information, make any corrections, and approve.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="review-filter-tabs">
                {['All (12)', 'Decisions (3)', 'Tasks (5)', 'Owners (2)', 'Blockers (2)'].map((tab) => {
                  const key = tab.split(' ')[0];
                  return (
                    <button
                      key={tab}
                      type="button"
                      className={`filter-pill ${selectedFilter === key ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(key)}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Review Table Items */}
              <div className="review-items-list">
                {reviewItems.map((item) => (
                  <div
                    key={item.id}
                    className={`review-item-row ${item.checked ? 'selected' : ''}`}
                  >
                    <div
                      className="item-checkbox"
                      onClick={() => toggleReviewItem(item.id)}
                      role="checkbox"
                      aria-checked={item.checked}
                      tabIndex={0}
                    >
                      {item.checked && <Check size={13} />}
                    </div>

                    <span className={`item-type-badge ${item.typeClass}`}>
                      {item.type}
                    </span>

                    <div className="item-content-wrap">
                      <span className="item-title-text">{item.text}</span>
                      <span className="item-source-ref">
                        {item.source} <ExternalLink size={11} className="ext-icon" />
                      </span>
                    </div>

                    <span className="item-confidence-tag">{item.confidence}</span>

                    <div className="item-actions">
                      <button type="button" className="item-action-btn" title="Preview Edit Action">
                        <Edit3 size={13} />
                      </button>
                      <button type="button" className="item-action-btn check" title="Preview Approved Action">
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Row (Illustrative Preview Buttons) */}
              <div className="review-footer-bar">
                <span className="selected-counter">{selectedCount} items selected</span>
                <div className="review-footer-btns">
                  <button type="button" className="btn-review-secondary" title="Preview Edit Action">
                    Edit Selected
                  </button>
                  <button type="button" className="btn-review-primary" title="Preview Approve Action">
                    <span>Approve & Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Copy: Review Benefits */}
          <div className="showcase-content">
            <h2 className="showcase-heading">
              From Project Files to Actionable Handover
            </h2>
            <p className="showcase-body">
              See how Baton extracts key information from your project documents,
              links each item to its source, and lets you review and approve
              before generating the final handover report.
            </p>

            <ul className="benefit-checklist">
              <li className="benefit-item">
                <div className="benefit-check-icon">
                  <Check size={14} />
                </div>
                <span>Extracted items with source references</span>
              </li>
              <li className="benefit-item">
                <div className="benefit-check-icon">
                  <Check size={14} />
                </div>
                <span>Edit and correct before finalizing</span>
              </li>
              <li className="benefit-item">
                <div className="benefit-check-icon">
                  <Check size={14} />
                </div>
                <span>Approve and move to handover report</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. PROJECT USE CASES SECTION
      ======================================================== */}
      <section id="use-cases" className="use-cases-section">
        <div className="section-heading-center">
          <h2 className="section-title">Project Use Cases</h2>
          <p className="section-subtitle">
            Baton fits the way real teams work and helps in many handover scenarios.
          </p>
        </div>

        <div className="use-cases-grid">
          <div className="use-case-card">
            <div className="use-case-icon-box">
              <GraduationCap size={24} />
            </div>
            <h3 className="use-case-title">Student & Academic Projects</h3>
            <p className="use-case-desc">
              Maintain complete project knowledge for college projects, group work,
              and semester handovers.
            </p>
          </div>

          <div className="use-case-card">
            <div className="use-case-icon-box">
              <Code2 size={24} />
            </div>
            <h3 className="use-case-title">Developer Teams</h3>
            <p className="use-case-desc">
              Keep project decisions, tasks, and context organized for smoother
              collaboration across the development cycle.
            </p>
          </div>

          <div className="use-case-card">
            <div className="use-case-icon-box">
              <UserCheck size={24} />
            </div>
            <h3 className="use-case-title">Team Member Transitions</h3>
            <p className="use-case-desc">
              Ensure a smooth handover when team members change, leave, or take
              over responsibilities.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. FEATURE SHOWCASE 2: HANDOVER REPORT
      ======================================================== */}
      <section className="showcase-section report-showcase">
        <div className="showcase-grid reverse">
          {/* Left Mockup: Complete Handover Report Preview */}
          <div className="showcase-mockup-frame report-frame">
            <div className="report-preview-layout">
              {/* Report Sub-Nav Column */}
              <div className="report-subnav">
                <span className="report-subnav-title">Handover Report</span>
                <button className="subnav-item active">Overview</button>
                <button className="subnav-item">Decisions</button>
                <button className="subnav-item">Tasks</button>
                <button className="subnav-item">Timeline</button>
                <button className="subnav-item">Blockers</button>
                <button className="subnav-item">Sources</button>
              </div>

              {/* Report Main Container */}
              <div className="report-content-body">
                <div className="report-header-row">
                  <div>
                    <h4 className="report-title-text">Project Handover Report</h4>
                    <span className="report-project-label">Project: CampusConnect</span>
                  </div>
                  <button className="btn-export-badge">
                    <Download size={13} />
                    <span>Export Report</span>
                  </button>
                </div>

                {/* Section: Project Overview */}
                <div className="report-section-card">
                  <div className="section-card-title-row">
                    <FileText size={16} className="section-title-icon" />
                    <h5>Project Overview</h5>
                  </div>
                  <p className="overview-snippet">
                    A student project for campus management including user
                    authentication, course management, and announcements.
                  </p>
                </div>

                {/* Collapsible Section Rows */}
                <div className="report-accordion-list">
                  <div className="report-row-item">
                    <div className="report-row-left">
                      <CheckCircle2 size={15} className="row-icon" />
                      <span>Key Decisions (1)</span>
                    </div>
                    <ChevronDown size={14} className="row-arrow" />
                  </div>

                  <div className="report-row-item">
                    <div className="report-row-left">
                      <CheckSquare size={15} className="row-icon" />
                      <span>Tasks (5)</span>
                    </div>
                    <ChevronDown size={14} className="row-arrow" />
                  </div>

                  <div className="report-row-item">
                    <div className="report-row-left">
                      <Calendar size={15} className="row-icon" />
                      <span>Timeline</span>
                    </div>
                    <ChevronDown size={14} className="row-arrow" />
                  </div>

                  <div className="report-row-item">
                    <div className="report-row-left">
                      <AlertTriangle size={15} className="row-icon" />
                      <span>Blockers (2)</span>
                    </div>
                    <ChevronDown size={14} className="row-arrow" />
                  </div>

                  <div className="report-row-item">
                    <div className="report-row-left">
                      <Link2 size={15} className="row-icon" />
                      <span>Source References (4)</span>
                    </div>
                    <ChevronDown size={14} className="row-arrow" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Copy: Report Breakdown */}
          <div className="showcase-content">
            <h2 className="showcase-heading">A Complete Handover Report</h2>
            <p className="showcase-body">
              A single, structured report that brings all essential project
              knowledge together.
            </p>

            <div className="report-spec-list">
              <div className="spec-row">
                <FileText size={18} className="spec-icon" />
                <div className="spec-text">
                  <span className="spec-name">Project Overview</span>
                  <span className="spec-desc">What the project is about</span>
                </div>
              </div>

              <div className="spec-row">
                <CheckCircle2 size={18} className="spec-icon" />
                <div className="spec-text">
                  <span className="spec-name">Decisions</span>
                  <span className="spec-desc">Key technical and project decisions</span>
                </div>
              </div>

              <div className="spec-row">
                <CheckSquare size={18} className="spec-icon" />
                <div className="spec-text">
                  <span className="spec-name">Tasks</span>
                  <span className="spec-desc">Important tasks and their status</span>
                </div>
              </div>

              <div className="spec-row">
                <Calendar size={18} className="spec-icon" />
                <div className="spec-text">
                  <span className="spec-name">Timeline</span>
                  <span className="spec-desc">Key milestones and progress</span>
                </div>
              </div>

              <div className="spec-row">
                <AlertTriangle size={18} className="spec-icon" />
                <div className="spec-text">
                  <span className="spec-name">Blockers</span>
                  <span className="spec-desc">Current issues and pending items</span>
                </div>
              </div>

              <div className="spec-row">
                <Link2 size={18} className="spec-icon" />
                <div className="spec-text">
                  <span className="spec-name">Source References</span>
                  <span className="spec-desc">Linked sources for full context</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. PRIVACY & TRUST + FREQUENTLY ASKED QUESTIONS
      ======================================================== */}
      <section id="about" className="trust-faq-section">
        <div className="trust-faq-grid">
          {/* Left: Privacy & Trust Card */}
          <div className="privacy-trust-card">
            <div className="privacy-shield-icon-wrap">
              <ShieldCheck size={32} />
            </div>
            <h3 className="privacy-title">Privacy & Trust</h3>
            <p className="privacy-desc">
              Your project data stays private to your team within Baton. We focus
              on keeping your information organized, accessible only to authorized
              members of your project.
            </p>
          </div>

          {/* Right: FAQ Accordions */}
          <div className="faq-column">
            <h3 className="faq-heading">Frequently Asked Questions</h3>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-accordion-item ${activeFaq === index ? 'open' : ''}`}
                >
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={activeFaq === index}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`faq-chevron ${activeFaq === index ? 'rotate' : ''}`}
                    />
                  </button>
                  {activeFaq === index && (
                    <div className="faq-answer-panel">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. PRE-FOOTER CTA BANNER
      ======================================================== */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">
              Ready to Make Project Handover Effortless?
            </h2>
            <p className="cta-banner-desc">
              Join Baton today and keep your project knowledge always in flow.
            </p>
          </div>
          <div className="cta-banner-action">
            <Link to="/signup" className="btn-cta-white">
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          10. FOOTER
      ======================================================== */}
      <footer className="landing-footer">
        <div className="footer-top-row">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <BatonLogo size={32} />
          </div>

          {/* Links: Product */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-links-list">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#use-cases">Use Cases</a></li>
            </ul>
          </div>

          {/* Links: Resources */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links-list">
              <li><a href="#about">Docs</a></li>
              <li><a href="#about">Blog</a></li>
              <li><a href="#about">Help Center</a></li>
            </ul>
          </div>

          {/* Links: Company */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#about">About</a></li>
              <li><a href="#about">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="copyright-text">
            © 2026 Baton. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

