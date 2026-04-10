import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../common/Modal';
import {
  Plus, Edit3, Trash2, Tag, Palette, Check, X,
  UtensilsCrossed, Car, ShoppingBag, Zap, Film, Heart,
  GraduationCap, Plane, MoreHorizontal, Briefcase, Home,
  Gift, Dumbbell, Music, Coffee, Wifi, Box
} from 'lucide-react';
import './CategoryManager.css';

const availableIcons = {
  UtensilsCrossed, Car, ShoppingBag, Zap, Film, Heart,
  GraduationCap, Plane, MoreHorizontal, Briefcase, Home,
  Gift, Dumbbell, Music, Coffee, Wifi, Tag, Box,
};

const colorPalette = [
  '#fb923c', '#60a5fa', '#a855f7', '#fbbf24', '#fb7185',
  '#34d399', '#22d3ee', '#c084fc', '#f472b6', '#818cf8',
  '#4ade80', '#facc15', '#e879f9', '#2dd4bf', '#f97316',
  '#8b5cf6', '#06b6d4', '#d946ef', '#14b8a6', '#f43f5e',
];

export default function CategoryManager() {
  const { state, dispatch, addToast } = useExpenses();
  const { categories, expenses } = state;
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', icon: 'Tag', color: '#a855f7' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Category expense counts
  const categoryCounts = {};
  const categoryTotals = {};
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  expenses.forEach(e => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    if (new Date(e.date) >= monthStart) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    }
  });

  const handleAdd = () => {
    setEditCategory(null);
    setForm({ name: '', icon: 'Tag', color: '#a855f7' });
    setShowModal(true);
  };

  const handleEdit = (cat) => {
    setEditCategory(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    if (editCategory) {
      dispatch({
        type: 'EDIT_CATEGORY',
        payload: { id: editCategory.id, name: form.name, icon: form.icon, color: form.color },
      });
      addToast(`Category "${form.name}" updated`, 'success');
    } else {
      // Check duplicate
      if (categories.some(c => c.name.toLowerCase() === form.name.toLowerCase())) {
        addToast('Category already exists', 'error');
        return;
      }
      dispatch({
        type: 'ADD_CATEGORY',
        payload: {
          id: form.name.toLowerCase().replace(/\s+/g, '_'),
          name: form.name,
          icon: form.icon,
          color: form.color,
        },
      });
      addToast(`Category "${form.name}" created`, 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (cat) => {
    const count = categoryCounts[cat.name] || 0;
    if (count > 0) {
      setDeleteConfirm(cat);
    } else {
      dispatch({ type: 'DELETE_CATEGORY', payload: cat.id });
      addToast(`Category "${cat.name}" deleted`, 'success');
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      dispatch({ type: 'DELETE_CATEGORY', payload: deleteConfirm.id });
      addToast(`Category "${deleteConfirm.name}" deleted`, 'success');
      setDeleteConfirm(null);
    }
  };

  const totalMonthSpend = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  return (
    <div className="categories animate-fade-in">
      {/* Header */}
      <div className="categories__header glass-card">
        <div className="categories__header-info">
          <div className="categories__header-icon">
            <Tag size={22} />
          </div>
          <div>
            <h2>Expense Categories</h2>
            <p>Manage your spending categories and customize colors & icons</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleAdd} id="add-category-btn">
          <Plus size={16} /> New Category
        </button>
      </div>

      {/* Category Grid */}
      <div className="categories__grid">
        {categories.map((cat, i) => {
          const Icon = availableIcons[cat.icon] || Tag;
          const count = categoryCounts[cat.name] || 0;
          const monthTotal = categoryTotals[cat.name] || 0;
          const pctOfTotal = totalMonthSpend > 0 ? (monthTotal / totalMonthSpend) * 100 : 0;

          return (
            <div
              key={cat.id}
              className={`categories__card glass-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="categories__card-header">
                <div className="categories__card-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
                  <Icon size={22} />
                </div>
                <div className="categories__card-actions">
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleEdit(cat)}>
                    <Edit3 size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(cat)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className="categories__card-name">{cat.name}</h4>

              <div className="categories__card-stats">
                <div className="categories__card-stat">
                  <span className="categories__card-stat-value">{count}</span>
                  <span className="categories__card-stat-label">Total</span>
                </div>
                <div className="categories__card-stat">
                  <span className="categories__card-stat-value">{formatCurrency(monthTotal)}</span>
                  <span className="categories__card-stat-label">This Month</span>
                </div>
              </div>

              <div className="categories__card-bar-wrap">
                <div className="categories__card-bar">
                  <div
                    className="categories__card-bar-fill"
                    style={{ width: `${pctOfTotal}%`, background: cat.color }}
                  />
                </div>
                <span className="categories__card-pct">{pctOfTotal.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editCategory ? 'Edit Category' : 'New Category'}
        size="medium"
      >
        <div className="categories__form">
          <div className="input-group">
            <label>Category Name</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Groceries"
              id="category-name-input"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label>Icon</label>
            <div className="categories__icon-picker">
              {Object.entries(availableIcons).map(([name, IconComp]) => (
                <button
                  key={name}
                  className={`categories__icon-option ${form.icon === name ? 'categories__icon-option--active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, icon: name }))}
                  style={form.icon === name ? { borderColor: form.color, background: `${form.color}15` } : {}}
                >
                  <IconComp size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Color</label>
            <div className="categories__color-picker">
              {colorPalette.map(color => (
                <button
                  key={color}
                  className={`categories__color-option ${form.color === color ? 'categories__color-option--active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setForm(prev => ({ ...prev, color }))}
                >
                  {form.color === color && <Check size={12} color="white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="categories__preview">
            <span className="categories__preview-label">Preview</span>
            <div className="categories__preview-card" style={{ borderColor: `${form.color}40` }}>
              <div style={{ background: `${form.color}20`, color: form.color, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.createElement(availableIcons[form.icon] || Tag, { size: 18 })}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{form.name || 'Category Name'}</span>
            </div>
          </div>

          <button className="btn btn-primary w-full" onClick={handleSave} id="save-category-btn">
            <Check size={16} /> {editCategory ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category?"
        size="small"
      >
        {deleteConfirm && (
          <div className="categories__delete-confirm">
            <p>
              <strong>"{deleteConfirm.name}"</strong> has{' '}
              <strong>{categoryCounts[deleteConfirm.name] || 0} expenses</strong>.
              Deleting it won't remove those expenses, but they'll no longer be categorized.
            </p>
            <div className="categories__delete-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete Anyway</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
