import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import Toast from './components/common/Toast';
import Dashboard from './components/Dashboard/Dashboard';
import SmartEntry from './components/Expenses/SmartEntry';
import TransactionList from './components/Expenses/TransactionList';
import BudgetManager from './components/Budget/BudgetManager';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import InsightsPage from './components/Insights/InsightsPage';
import CategoryManager from './components/Categories/CategoryManager';
import SettingsPage from './components/Settings/SettingsPage';
import './App.css';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        className={mobileMenuOpen ? 'sidebar--mobile-open' : ''}
      />

      <div className={`app__main ${sidebarCollapsed ? 'app__main--expanded' : ''}`}>
        <TopBar onMenuClick={() => setMobileMenuOpen(prev => !prev)} />
        <main className="app__content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<SmartEntry />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/budgets" element={<BudgetManager />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      <Toast />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="app__overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
