import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Clock } from 'lucide-react';
import './PlaceholderPage.css';

export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="placeholder-icon-halo">
          {Icon ? <Icon size={32} /> : <Sparkles size={32} />}
        </div>

        <div className="placeholder-status-tag">
          <Clock size={13} />
          <span>Foundation Ready • Awaiting Screen Implementation</span>
        </div>

        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-desc">
          {description ||
            `This route (${title}) is registered and connected to the Baton application layout. It is ready to be implemented according to the reference UI in your next prompt.`}
        </p>

        <div className="placeholder-actions">
          <Link to="/" className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

