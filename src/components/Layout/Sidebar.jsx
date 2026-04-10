import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, List, Wallet, BarChart3,
  Sparkles, Tag, Settings, ChevronLeft, ChevronRight, Bot
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/add', label: 'Add Expense', icon: PlusCircle },
  { path: '/transactions', label: 'Transactions', icon: List },
  { path: '/budgets', label: 'Budgets', icon: Wallet },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/insights', label: 'AI Insights', icon: Sparkles },
  { path: '/categories', label: 'Categories', icon: Tag },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <Bot size={24} />
          </div>
          {!collapsed && (
            <div className="sidebar__logo-text">
              <span className="sidebar__logo-title">ExpenseAI</span>
              <span className="sidebar__logo-subtitle">Smart Finance</span>
            </div>
          )}
        </div>
        <button
          className="sidebar__toggle btn-icon"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          id="sidebar-toggle"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            end={item.path === '/'}
            id={`nav-${item.path.replace('/', '') || 'dashboard'}`}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.path === '/insights' && (
              <span className="sidebar__badge">AI</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && (
          <div className="sidebar__footer-card glass-card">
            <Sparkles size={16} className="sidebar__footer-icon" />
            <p>AI-powered insights analyzing your spending patterns</p>
          </div>
        )}
      </div>
    </aside>
  );
}
