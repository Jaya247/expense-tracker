import React, { useState, useMemo } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, TrendingUp, AlertTriangle, Check, Edit3 } from 'lucide-react';
import './BudgetManager.css';

const categoryColors = {
  'Food & Dining': '#fb923c', 'Transport': '#60a5fa', 'Shopping': '#a855f7',
  'Bills & Utilities': '#fbbf24', 'Entertainment': '#fb7185', 'Health': '#34d399',
  'Education': '#22d3ee', 'Travel': '#c084fc', 'Other': '#9d9db8',
};

export default function BudgetManager() {
  const { state, dispatch, addToast } = useExpenses();
  const [editingCat, setEditingCat] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  const monthlySpending = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cats = {};
    state.expenses
      .filter(e => new Date(e.date) >= monthStart)
      .forEach(e => {
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      });
    return cats;
  }, [state.expenses]);

  const budgetData = useMemo(() => {
    return state.categories.map(cat => {
      const budget = state.budgets[cat.name] || 0;
      const spent = monthlySpending[cat.name] || 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      const remaining = budget - spent;
      const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'safe';
      return { ...cat, budget, spent, percentage, remaining, status };
    }).filter(b => b.budget > 0 || b.spent > 0);
  }, [state.categories, state.budgets, monthlySpending]);

  const totalBudget = budgetData.reduce((s, b) => s + b.budget, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const chartData = budgetData.map(b => ({
    name: b.name.split(' ')[0],
    budget: b.budget,
    spent: b.spent,
    color: categoryColors[b.name] || '#9d9db8',
  }));

  const handleStartEdit = (cat) => {
    setEditingCat(cat.name);
    setEditAmount(cat.budget.toString());
  };

  const handleSaveBudget = () => {
    if (editingCat && editAmount) {
      dispatch({ type: 'SET_BUDGET', payload: { category: editingCat, amount: Number(editAmount) } });
      addToast(`Budget updated for ${editingCat}`, 'success');
    }
    setEditingCat(null);
    setEditAmount('');
  };

  return (
    <div className="budget animate-fade-in">
      {/* Overall Summary */}
      <div className="budget__summary">
        <div className="budget__summary-card glass-card">
          <div className="budget__summary-icon" style={{ background: 'var(--gradient-primary)' }}>
            <Wallet size={20} />
          </div>
          <div>
            <span className="budget__summary-label">Total Budget</span>
            <span className="budget__summary-value">{formatCurrency(totalBudget)}</span>
          </div>
        </div>
        <div className="budget__summary-card glass-card">
          <div className="budget__summary-icon" style={{ background: 'var(--gradient-warm)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="budget__summary-label">Total Spent</span>
            <span className="budget__summary-value">{formatCurrency(totalSpent)}</span>
          </div>
        </div>
        <div className="budget__summary-card glass-card">
          <div className="budget__summary-icon" style={{ 
            background: totalPercentage > 80 ? 'var(--gradient-danger)' : 'var(--gradient-success)' 
          }}>
            {totalPercentage > 80 ? <AlertTriangle size={20} /> : <Check size={20} />}
          </div>
          <div>
            <span className="budget__summary-label">Usage</span>
            <span className="budget__summary-value">{formatPercentage(totalPercentage, 0)}</span>
          </div>
        </div>
      </div>

      {/* Budget vs Actual Chart */}
      <div className="budget__chart glass-card">
        <h3>Budget vs Actual</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5a5a7a' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#5a5a7a' }} tickLine={false} axisLine={false}
              tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip
              contentStyle={{
                background: 'rgba(20,20,50,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', fontSize: '0.8rem',
              }}
              formatter={(value) => [formatCurrency(value)]}
            />
            <Bar dataKey="budget" fill="rgba(255,255,255,0.08)" radius={[6, 6, 0, 0]} name="Budget" />
            <Bar dataKey="spent" radius={[6, 6, 0, 0]} name="Spent">
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Budget List */}
      <div className="budget__list">
        {budgetData.map(item => (
          <div key={item.name} className={`budget__item glass-card budget__item--${item.status}`}>
            <div className="budget__item-header">
              <div className="budget__item-info">
                <div className="budget__item-dot" style={{ background: categoryColors[item.name] }} />
                <span className="budget__item-name">{item.name}</span>
                {item.status === 'over' && <span className="badge badge-rose">Over Budget!</span>}
                {item.status === 'warning' && <span className="badge badge-amber">Almost!</span>}
              </div>
              <div className="budget__item-amounts">
                <span className="budget__item-spent">{formatCurrency(item.spent)}</span>
                <span className="budget__item-sep">/</span>
                {editingCat === item.name ? (
                  <div className="budget__item-edit">
                    <input
                      type="number"
                      className="input-field"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      style={{ width: 100, padding: '4px 8px', fontSize: '0.85rem' }}
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleSaveBudget}>
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="budget__item-budget">{formatCurrency(item.budget)}</span>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleStartEdit(item)}>
                      <Edit3 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="budget__item-bar">
              <div
                className="budget__item-bar-fill"
                style={{
                  width: `${Math.min(item.percentage, 100)}%`,
                  background: item.status === 'over' ? 'var(--gradient-danger)' :
                    item.status === 'warning' ? 'linear-gradient(90deg, #fbbf24, #fb923c)' :
                    `linear-gradient(90deg, ${categoryColors[item.name]}, ${categoryColors[item.name]}88)`,
                }}
              />
            </div>
            <div className="budget__item-footer">
              <span>{formatPercentage(item.percentage, 0)} used</span>
              <span>{item.remaining >= 0 
                ? `${formatCurrency(item.remaining)} remaining` 
                : `${formatCurrency(Math.abs(item.remaining))} over`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
