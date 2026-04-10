import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { exportAllData, importData, clearAllData } from '../../utils/storage';
import Modal from '../common/Modal';
import {
  Settings, Palette, Globe, Database, Download, Upload,
  Trash2, AlertTriangle, Check, Moon, Sun, RefreshCw,
  Shield, Bell, DollarSign, Clock
} from 'lucide-react';
import './SettingsPage.css';

const currencies = [
  { symbol: '₹', name: 'Indian Rupee (₹)' },
  { symbol: '$', name: 'US Dollar ($)' },
  { symbol: '€', name: 'Euro (€)' },
  { symbol: '£', name: 'British Pound (£)' },
];

const dateFormats = [
  { value: 'short', label: 'DD Mon (e.g., 10 Apr)' },
  { value: 'medium', label: 'DD Mon YYYY (e.g., 10 Apr 2026)' },
  { value: 'long', label: 'Day, DD Month YYYY' },
];

export default function SettingsPage() {
  const { state, dispatch, addToast } = useExpenses();
  const { settings } = state;
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSettingChange = (key, value) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
    addToast(`Setting updated: ${key}`, 'success');
  };

  const handleExportJSON = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported successfully', 'success');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.EXPENSES && !data.CATEGORIES) {
          setImportError('Invalid backup file format');
          return;
        }
        importData(data);
        // Reload the context
        if (data.EXPENSES) dispatch({ type: 'LOAD_DATA', payload: { expenses: data.EXPENSES } });
        if (data.CATEGORIES) dispatch({ type: 'LOAD_DATA', payload: { categories: data.CATEGORIES } });
        if (data.BUDGETS) dispatch({ type: 'LOAD_DATA', payload: { budgets: data.BUDGETS } });
        if (data.SETTINGS) dispatch({ type: 'UPDATE_SETTINGS', payload: data.SETTINGS });
        addToast('Data imported successfully', 'success');
      } catch (err) {
        setImportError('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    clearAllData();
    dispatch({ type: 'CLEAR_ALL' });
    setShowClearConfirm(false);
    addToast('All data cleared', 'success');
  };

  const handleLoadSample = () => {
    const { generateSampleData } = require('../../utils/sampleData');
    const sampleExpenses = generateSampleData();
    dispatch({ type: 'LOAD_DATA', payload: { expenses: sampleExpenses } });
    addToast('Sample data loaded (90 days)', 'success');
  };

  const dataStats = {
    expenses: state.expenses.length,
    categories: state.categories.length,
    budgets: Object.keys(state.budgets).length,
    storageUsed: new Blob([JSON.stringify(state)]).size,
  };

  return (
    <div className="settings animate-fade-in">
      {/* Appearance */}
      <div className="settings__section glass-card">
        <div className="settings__section-header">
          <div className="settings__section-icon" style={{ background: 'var(--gradient-primary)' }}>
            <Palette size={18} />
          </div>
          <div>
            <h3>Appearance</h3>
            <p>Customize the look and feel</p>
          </div>
        </div>

        <div className="settings__items">
          <div className="settings__item">
            <div className="settings__item-info">
              <Moon size={18} />
              <div>
                <span className="settings__item-label">Theme</span>
                <span className="settings__item-desc">Choose your preferred theme</span>
              </div>
            </div>
            <div className="settings__theme-switch">
              <button
                className={`settings__theme-btn ${settings.theme === 'dark' ? 'settings__theme-btn--active' : ''}`}
                onClick={() => handleSettingChange('theme', 'dark')}
              >
                <Moon size={14} /> Dark
              </button>
              <button
                className={`settings__theme-btn ${settings.theme === 'light' ? 'settings__theme-btn--active' : ''}`}
                onClick={() => handleSettingChange('theme', 'light')}
              >
                <Sun size={14} /> Light
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Currency & Format */}
      <div className="settings__section glass-card">
        <div className="settings__section-header">
          <div className="settings__section-icon" style={{ background: 'var(--gradient-secondary)' }}>
            <Globe size={18} />
          </div>
          <div>
            <h3>Currency & Format</h3>
            <p>Regional preferences</p>
          </div>
        </div>

        <div className="settings__items">
          <div className="settings__item">
            <div className="settings__item-info">
              <DollarSign size={18} />
              <div>
                <span className="settings__item-label">Currency</span>
                <span className="settings__item-desc">Display currency for amounts</span>
              </div>
            </div>
            <select
              className="input-field settings__select"
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              id="currency-select"
            >
              {currencies.map(c => (
                <option key={c.symbol} value={c.symbol}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="settings__item">
            <div className="settings__item-info">
              <Clock size={18} />
              <div>
                <span className="settings__item-label">Date Format</span>
                <span className="settings__item-desc">How dates are displayed</span>
              </div>
            </div>
            <select
              className="input-field settings__select"
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              id="date-format-select"
            >
              {dateFormats.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings__section glass-card">
        <div className="settings__section-header">
          <div className="settings__section-icon" style={{ background: 'var(--gradient-warm)' }}>
            <Database size={18} />
          </div>
          <div>
            <h3>Data Management</h3>
            <p>Export, import, or reset your data</p>
          </div>
        </div>

        {/* Stats */}
        <div className="settings__data-stats">
          <div className="settings__data-stat">
            <span className="settings__data-stat-value">{dataStats.expenses}</span>
            <span className="settings__data-stat-label">Expenses</span>
          </div>
          <div className="settings__data-stat">
            <span className="settings__data-stat-value">{dataStats.categories}</span>
            <span className="settings__data-stat-label">Categories</span>
          </div>
          <div className="settings__data-stat">
            <span className="settings__data-stat-value">{dataStats.budgets}</span>
            <span className="settings__data-stat-label">Budgets</span>
          </div>
          <div className="settings__data-stat">
            <span className="settings__data-stat-value">
              {(dataStats.storageUsed / 1024).toFixed(1)} KB
            </span>
            <span className="settings__data-stat-label">Storage Used</span>
          </div>
        </div>

        <div className="settings__items">
          <div className="settings__item">
            <div className="settings__item-info">
              <Download size={18} />
              <div>
                <span className="settings__item-label">Export Data</span>
                <span className="settings__item-desc">Download all data as JSON backup</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleExportJSON} id="export-json-btn">
              <Download size={14} /> Export JSON
            </button>
          </div>

          <div className="settings__item">
            <div className="settings__item-info">
              <Upload size={18} />
              <div>
                <span className="settings__item-label">Import Data</span>
                <span className="settings__item-desc">Restore from a JSON backup file</span>
              </div>
            </div>
            <div className="settings__import-wrap">
              <label className="btn btn-secondary btn-sm" htmlFor="import-file-input">
                <Upload size={14} /> Import JSON
              </label>
              <input
                type="file"
                accept=".json"
                id="import-file-input"
                onChange={handleImportJSON}
                style={{ display: 'none' }}
              />
              {importError && (
                <span className="settings__import-error">{importError}</span>
              )}
            </div>
          </div>

          <div className="settings__item">
            <div className="settings__item-info">
              <RefreshCw size={18} />
              <div>
                <span className="settings__item-label">Load Sample Data</span>
                <span className="settings__item-desc">Populate with 90 days of realistic demo data</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLoadSample} id="load-sample-btn">
              <RefreshCw size={14} /> Load Samples
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings__section settings__section--danger glass-card">
        <div className="settings__section-header">
          <div className="settings__section-icon" style={{ background: 'var(--gradient-danger)' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3>Danger Zone</h3>
            <p>Irreversible actions — proceed with caution</p>
          </div>
        </div>

        <div className="settings__items">
          <div className="settings__item">
            <div className="settings__item-info">
              <Trash2 size={18} className="settings__danger-icon" />
              <div>
                <span className="settings__item-label">Clear All Data</span>
                <span className="settings__item-desc">Permanently delete all expenses, budgets, and settings</span>
              </div>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowClearConfirm(true)}
              id="clear-all-btn"
            >
              <Trash2 size={14} /> Clear Everything
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings__section glass-card">
        <div className="settings__section-header">
          <div className="settings__section-icon" style={{ background: 'var(--gradient-cool)' }}>
            <Shield size={18} />
          </div>
          <div>
            <h3>About</h3>
            <p>AI Expense Tracker v1.0.0</p>
          </div>
        </div>
        <div className="settings__about">
          <p>
            A smart, fully client-side expense tracking application powered by AI natural language processing.
            All your data stays on your device — nothing is sent to any server.
          </p>
          <div className="settings__about-badges">
            <span className="badge badge-emerald">🔒 Privacy First</span>
            <span className="badge badge-purple">✨ AI Powered</span>
            <span className="badge badge-cyan">📱 Responsive</span>
            <span className="badge badge-amber">💾 Local Storage</span>
          </div>
        </div>
      </div>

      {/* Clear Confirmation */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Data?"
        size="small"
      >
        <div className="settings__clear-confirm">
          <div className="settings__clear-warning">
            <AlertTriangle size={40} />
            <h4>This action cannot be undone!</h4>
            <p>All {state.expenses.length} expenses, budgets, categories, and preferences will be permanently deleted.</p>
          </div>
          <div className="settings__clear-actions">
            <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleClearAll}>
              <Trash2 size={14} /> Yes, Clear Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
