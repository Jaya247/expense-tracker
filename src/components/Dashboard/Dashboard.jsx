import React, { useMemo } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { getSpendingSummary } from '../../utils/aiInsights';
import SummaryCards from './SummaryCards';
import SpendingChart from './SpendingChart';
import CategoryDonut from './CategoryDonut';
import RecentTransactions from './RecentTransactions';
import './Dashboard.css';

export default function Dashboard() {
  const { state } = useExpenses();
  const { expenses } = state;

  const summary = useMemo(() => getSpendingSummary(expenses), [expenses]);

  const last30DaysData = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days[key] = { date: key, amount: 0, label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) };
    }
    expenses.forEach(e => {
      if (days[e.date]) {
        days[e.date].amount += e.amount;
      }
    });
    return Object.values(days);
  }, [expenses]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthExpenses = expenses.filter(e => new Date(e.date) >= monthStart);
    const cats = {};
    monthExpenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    const colors = {
      'Food & Dining': '#fb923c',
      'Transport': '#60a5fa',
      'Shopping': '#a855f7',
      'Bills & Utilities': '#fbbf24',
      'Entertainment': '#fb7185',
      'Health': '#34d399',
      'Education': '#22d3ee',
      'Travel': '#c084fc',
      'Other': '#9d9db8',
    };
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value, color: colors[name] || '#9d9db8' }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const recentExpenses = useMemo(() => expenses.slice(0, 10), [expenses]);

  return (
    <div className="dashboard">
      <SummaryCards summary={summary} />
      <div className="dashboard__charts">
        <SpendingChart data={last30DaysData} />
        <CategoryDonut data={categoryData} />
      </div>
      <RecentTransactions expenses={recentExpenses} />
    </div>
  );
}
