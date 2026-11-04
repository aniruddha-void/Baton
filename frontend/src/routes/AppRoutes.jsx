import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AppLayout from '../layouts/AppLayout';
import DashboardPage from '../pages/app/DashboardPage';
import ProjectsPage from '../pages/app/ProjectsPage';
import CreateProjectPage from '../pages/app/CreateProjectPage';
import ProjectDetailPage from '../pages/app/ProjectDetailPage';
import ImportAnalyzePage from '../pages/app/ImportAnalyzePage';
import ReviewVerifyPage from '../pages/app/ReviewVerifyPage';
import HandoverReportsPage from '../pages/app/HandoverReportsPage';
import TasksPage from '../pages/app/TasksPage';
import TimelinePage from '../pages/app/TimelinePage';
import TeamPage from '../pages/app/TeamPage';
import AiAssistantPage from '../pages/app/AiAssistantPage';
import SettingsPage from '../pages/app/SettingsPage';
import PrivateRoute from '../components/common/PrivateRoute';

/** Wraps AppLayout so all child routes are auth-gated */
function ProtectedLayout() {
  return (
    <PrivateRoute>
      <AppLayout />
    </PrivateRoute>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public: Official Baton Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public: Authentication Screens */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected: Application Workspace — all routes require auth */}
        <Route element={<ProtectedLayout />}>
          {/* Dashboard index */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Projects */}
          <Route path="/projects" element={<ProjectsPage />} />

          {/* Project Detail */}
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

          <Route path="/projects/create" element={<CreateProjectPage />} />

          {/* Import & Analyze */}
          <Route path="/import" element={<ImportAnalyzePage />} />

          {/* Review & Verify */}
          <Route path="/review" element={<ReviewVerifyPage />} />

          {/* Handover Reports */}
          <Route path="/reports" element={<HandoverReportsPage />} />

          {/* Tasks */}
          <Route path="/tasks" element={<TasksPage />} />

          {/* Timeline */}
          <Route path="/timeline" element={<TimelinePage />} />

          {/* Team Management */}
          <Route path="/team" element={<TeamPage />} />

          {/* AI Assistant */}
          <Route path="/assistant" element={<AiAssistantPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
