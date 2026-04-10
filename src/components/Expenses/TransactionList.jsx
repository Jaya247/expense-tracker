import React, { useState, useMemo } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { formatCurrency, formatDate, getRelativeDate } from '../../utils/formatters';
import Modal from '../common/Modal';
import {
  Search, Filter, Trash2, Edit3, Download, ChevronDown, ChevronUp,
  ArrowUpDown, X
} from 'lucide-react';
import './TransactionList.css';

const categoryColors = {
  'Food & Dining': '#fb923c', 'Transport': '#60a5fa', 'Shopping': '#a855f7',
  'Bills & Utilities': '#fbbf24', 'Entertainment': '#fb7185', 'Health': '#34d399',
  'Education': '#22d3ee', 'Travel': '#c084fc', 'Other': '#9d9db8',
};

export default function TransactionList() {
  const { state, dispatch, addToast } = useExpenses();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editExpense, setEditExpense] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filtered = useMemo(() => {
    let list = [...state.expenses];

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(e =>
        e.description?.toLowerCase().includes(s) ||
        e.merchant?.toLowerCase().includes(s) ||
        e.category?.toLowerCase().includes(s)
      );
    }

    if (categoryFilter) {
      list = list.filter(e => e.category === categoryFilter);
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date': cmp = new Date(a.date) - new Date(b.date); break;
        case 'amount': cmp = a.amount - b.amount; break;
        case 'category': cmp = a.category.localeCompare(b.category); break;
        default: cmp = 0;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [state.expenses, search, categoryFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)));
    }
  };

  const deleteSelected = () => {
    dispatch({ type: 'DELETE_EXPENSES', payload: Array.from(selectedIds) });
    addToast(`Deleted ${selectedIds.size} expense(s)`, 'success');
    setSelectedIds(new Set());
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setEditForm({ ...expense });
  };

  const saveEdit = () => {
    dispatch({ type: 'EDIT_EXPENSE', payload: { ...editForm, amount: Number(editForm.amount) } });
    addToast('Expense updated', 'success');
    setEditExpense(null);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    addToast('Expense deleted', 'success');
  };

  const exportCSV = () => {
    const headers = 'Date,Description,Category,Merchant,Amount,Payment Method\n';
    const rows = filtered.map(e =>
      `${e.date},"${e.description}","${e.category}","${e.merchant || ''}",${e.amount},${e.paymentMethod}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'expenses.csv'; a.click();
    URL.revokeObjectURL(url);
    addToast('Exported to CSV', 'success');
  };

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="transactions animate-fade-in">
      {/* Toolbar */}
      <div className="transactions__toolbar glass-card">
        <div className="transactions__search-wrap">
          <Search size={16} className="transactions__search-icon" />
          <input
            type="text"
            className="transactions__search"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="transaction-search"
          />
          {search && (
            <button className="transactions__search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <select
          className="input-field transactions__filter-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          id="category-filter"
        >
          <option value="">All Categories</option>
          {state.categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {selectedIds.size > 0 && (
          <button className="btn btn-danger btn-sm" onClick={deleteSelected} id="delete-selected-btn">
            <Trash2 size={14} /> Delete ({selectedIds.size})
          </button>
        )}

        <button className="btn btn-secondary btn-sm" onClick={exportCSV} id="export-csv-btn">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Summary bar */}
      <div className="transactions__summary">
        <span>{filtered.length} transactions</span>
        <span>Total: <strong>{formatCurrency(totalFiltered)}</strong></span>
      </div>

      {/* Table */}
      <div className="transactions__table glass-card">
        <div className="transactions__thead">
          <div className="transactions__th transactions__th--check">
            <input
              type="checkbox"
              checked={selectedIds.size === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
            />
          </div>
          <div className="transactions__th transactions__th--date" onClick={() => toggleSort('date')}>
            Date <ArrowUpDown size={12} />
          </div>
          <div className="transactions__th transactions__th--desc">Description</div>
          <div className="transactions__th transactions__th--cat" onClick={() => toggleSort('category')}>
            Category <ArrowUpDown size={12} />
          </div>
          <div className="transactions__th transactions__th--amount" onClick={() => toggleSort('amount')}>
            Amount <ArrowUpDown size={12} />
          </div>
          <div className="transactions__th transactions__th--actions">Actions</div>
        </div>

        <div className="transactions__tbody">
          {filtered.map(expense => (
            <div
              key={expense.id}
              className={`transactions__row ${selectedIds.has(expense.id) ? 'transactions__row--selected' : ''}`}
            >
              <div className="transactions__td transactions__td--check">
                <input
                  type="checkbox"
                  checked={selectedIds.has(expense.id)}
                  onChange={() => toggleSelect(expense.id)}
                />
              </div>
              <div className="transactions__td transactions__td--date">
                <span className="transactions__date-main">{formatDate(expense.date)}</span>
                <span className="transactions__date-sub">{getRelativeDate(expense.date)}</span>
              </div>
              <div className="transactions__td transactions__td--desc">
                <span className="transactions__desc-text">{expense.description}</span>
                {expense.merchant && (
                  <span className="transactions__merchant">{expense.merchant}</span>
                )}
              </div>
              <div className="transactions__td transactions__td--cat">
                <span
                  className="transactions__cat-badge"
                  style={{ borderColor: categoryColors[expense.category], color: categoryColors[expense.category] }}
                >
                  {expense.category}
                </span>
              </div>
              <div className="transactions__td transactions__td--amount">
                <span className="transactions__amount-val">-{formatCurrency(expense.amount)}</span>
                <span className="transactions__payment-method">{expense.paymentMethod}</span>
              </div>
              <div className="transactions__td transactions__td--actions">
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleEdit(expense)}>
                  <Edit3 size={14} />
                </button>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(expense.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={40} />
            <h3>No transactions found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editExpense} onClose={() => setEditExpense(null)} title="Edit Expense">
        {editExpense && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Amount (₹)</label>
              <input type="number" className="input-field" value={editForm.amount}
                onChange={e => setEditForm(prev => ({ ...prev, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select className="input-field" value={editForm.category}
                onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}>
                {state.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Description</label>
              <input type="text" className="input-field" value={editForm.description}
                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Merchant</label>
              <input type="text" className="input-field" value={editForm.merchant || ''}
                onChange={e => setEditForm(prev => ({ ...prev, merchant: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Date</label>
              <input type="date" className="input-field" value={editForm.date}
                onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))} />
            </div>
            <button className="btn btn-primary w-full" onClick={saveEdit}>Save Changes</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
