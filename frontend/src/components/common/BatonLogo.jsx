import React from 'react';
import batonLogo from '../../assets/baton-logo.png';
import './BatonLogo.css';

/**
 * Official Baton Logo Component
 * - Uses the official baton-logo.png image asset
 * - Preserves exact aspect ratio with object-fit: contain
 * - Displays brand name exactly as 'Baton'
 */
export default function BatonLogo({
  collapsed = false,
  light = false,
  size = 36,
  showSubtitle = true,
  className = '',
}) {
  return (
    <div className={`baton-brand-logo ${collapsed ? 'collapsed' : ''} ${light ? 'light-mode' : ''} ${className}`}>
      <div
        className="baton-logo-mark"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img
          src={batonLogo}
          alt="Baton"
          className="baton-logo-img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {!collapsed && (
        <div className="baton-logo-text">
          <span className="baton-logo-title">Baton</span>
          {showSubtitle && (
            <span className="baton-logo-subtitle">AI Project Handover</span>
          )}
        </div>
      )}
    </div>
  );
}
