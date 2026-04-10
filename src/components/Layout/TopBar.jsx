import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import './TopBar.css';

const pageTitles = {
  '/': 'Dashboard',
  '/add': 'Add Expense',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/analytics': 'Analytics',
  '/insights': 'AI Insights',
  '/categories': 'Categories',
  '/settings': 'Settings',
};

const pageDescriptions = {
  '/': 'Your financial overview at a glance',
  '/add': 'Log a new expense with AI assistance',
  '/transactions': 'View and manage all your transactions',
  '/budgets': 'Track your spending against budgets',
  '/analytics': 'Deep dive into your spending patterns',
  '/insights': 'AI-powered financial recommendations',
  '/categories': 'Manage your expense categories',
  '/settings': 'Configure your preferences',
};

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const description = pageDescriptions[location.pathname] || '';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__menu-btn btn-icon"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          id="topbar-menu-btn"
        >
          <Menu size={20} />
        </button>
        <div className="topbar__title-group">
          <h1 className="topbar__title">{title}</h1>
          <p className="topbar__description">{description}</p>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__search">
          <Search size={16} className="topbar__search-icon" />
          <input
            type="text"
            placeholder="Search expenses..."
            className="topbar__search-input"
            id="topbar-search"
          />
        </div>
        <button className="topbar__notification btn-icon btn-secondary" id="notifications-btn">
          <Bell size={18} />
          <span className="topbar__notification-dot" />
        </button>
        <div className="topbar__avatar" id="user-avatar">
          <span>JM</span>
        </div>
      </div>
    </header>
  );
}
