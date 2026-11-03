import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './AppLayout.css';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="baton-app-container">
      {/* Sidebar with Navigation and Brand */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Viewport Container */}
      <div className="baton-viewport">
        {/* Top Header with Breadcrumbs & Profile */}
        <Header onMenuClick={toggleSidebar} />

        {/* Dynamic Route Content Area */}
        <main className="baton-main-content">
          <div className="baton-content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

