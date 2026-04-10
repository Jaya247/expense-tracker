import React, { useMemo, useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { formatCurrency, formatPercentage, getMonthName } from '../../utils/formatters';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight,
  Clock, Repeat, CreditCard, Target
} from 'lucide-react';
import './AnalyticsPage.css';

const categoryColors = {
  'Food & Dining': '#fb923c', 'Transport': '#60a5fa', 'Shopping': '#a855f7',
  'Bills & Utilities': '#fbbf24', 'Entertainment': '#fb7185', 'Health': '#34d399',
  'Education': '#22d3ee', 'Travel': '#c084fc', 'Other': '#9d9db8',
};

const CHART_COLORS = ['#a855f7', '#22d3ee', '#fb923c', '#34d399', '#fb7185', '#fbbf24', '#60a5fa', '#c084fc', '#9d9db8'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="analytics-tooltip glass-card">
      <p className="analytics-tooltip__label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="analytics-tooltip__value" style={{ color: p.color || p.stroke }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { state } = useExpenses();
  const { expenses } = state;
  const [timeRange, setTimeRange] = useState('3months');

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const rangeMap = {
      'week': 7, 'month': 30, '3months': 90, '6months': 180, 'year': 365,
    };
    const days = rangeMap[timeRange] || 90;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    return expenses.filter(e => new Date(e.date) >= cutoff);
  }, [expenses, timeRange]);

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = {
        month: getMonthName(d.getMonth()),
        total: 0,
        count: 0,
        key,
      };
    }
    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].total += e.amount;
        months[key].count++;
      }
    });
    return Object.values(months);
  }, [expenses]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const cats = {};
    filteredExpenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value, color: categoryColors[name] || '#9d9db8' }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Daily spending (last 30 days)
  const dailyData = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
      days[key] = { date: key, amount: 0, label: `${d.getDate()} ${getMonthName(d.getMonth())}`, day: dayName };
    }
    expenses.forEach(e => {
      if (days[e.date]) days[e.date].amount += e.amount;
    });
    return Object.values(days);
  }, [expenses]);

  // Payment method breakdown
  const paymentData = useMemo(() => {
    const methods = {};
    filteredExpenses.forEach(e => {
      methods[e.paymentMethod] = (methods[e.paymentMethod] || 0) + e.amount;
    });
    return Object.entries(methods)
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Day of week analysis
  const dayOfWeekData = useMemo(() => {
    const days = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    filteredExpenses.forEach(e => {
      const dayIndex = new Date(e.date).getDay();
      days[dayNames[dayIndex]] += e.amount;
    });
    return dayNames.map(day => ({ day, amount: days[day] }));
  }, [filteredExpenses]);

  // Hour of day analysis
  const hourData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: 0,
      amount: 0,
    }));
    filteredExpenses.forEach(e => {
      if (e.time) {
        const h = parseInt(e.time.split(':')[0]);
        if (h >= 0 && h < 24) {
          hours[h].count++;
          hours[h].amount += e.amount;
        }
      }
    });
    return hours;
  }, [filteredExpenses]);

  // Top merchants
  const topMerchants = useMemo(() => {
    const merchants = {};
    filteredExpenses.forEach(e => {
      if (e.merchant) {
        if (!merchants[e.merchant]) merchants[e.merchant] = { amount: 0, count: 0 };
        merchants[e.merchant].amount += e.amount;
        merchants[e.merchant].count++;
      }
    });
    return Object.entries(merchants)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [filteredExpenses]);

  // Month over month change
  const monthChange = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthEnd = now;
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisTotal = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= thisMonth && d <= thisMonthEnd;
    }).reduce((s, e) => s + e.amount, 0);

    const lastTotal = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= lastMonth && d <= lastMonthEnd;
    }).reduce((s, e) => s + e.amount, 0);

    const change = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;
    return { thisTotal, lastTotal, change };
  }, [expenses]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const avgPerDay = total / Math.max(1, new Set(filteredExpenses.map(e => e.date)).size);
    const avgPerTransaction = total / Math.max(1, filteredExpenses.length);
    const maxExpense = filteredExpenses.reduce((max, e) => e.amount > max ? e.amount : max, 0);
    return { total, avgPerDay, avgPerTransaction, maxExpense, count: filteredExpenses.length };
  }, [filteredExpenses]);

  const totalCategory = categoryData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="analytics animate-fade-in">
      {/* Time Range Selector */}
      <div className="analytics__toolbar glass-card">
        <div className="analytics__toolbar-label">
          <Calendar size={16} />
          <span>Time Range</span>
        </div>
        <div className="analytics__range-selector">
          {[
            { key: 'week', label: '7D' },
            { key: 'month', label: '30D' },
            { key: '3months', label: '3M' },
            { key: '6months', label: '6M' },
            { key: 'year', label: '1Y' },
          ].map(r => (
            <button
              key={r.key}
              className={`analytics__range-btn ${timeRange === r.key ? 'analytics__range-btn--active' : ''}`}
              onClick={() => setTimeRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="analytics__stats">
        <div className="analytics__stat-card glass-card animate-fade-in-up stagger-1">
          <div className="analytics__stat-icon" style={{ background: 'var(--gradient-primary)' }}>
            <Target size={18} />
          </div>
          <div className="analytics__stat-info">
            <span className="analytics__stat-label">Total Spent</span>
            <span className="analytics__stat-value">{formatCurrency(stats.total)}</span>
          </div>
        </div>
        <div className="analytics__stat-card glass-card animate-fade-in-up stagger-2">
          <div className="analytics__stat-icon" style={{ background: 'var(--gradient-secondary)' }}>
            <Clock size={18} />
          </div>
          <div className="analytics__stat-info">
            <span className="analytics__stat-label">Daily Average</span>
            <span className="analytics__stat-value">{formatCurrency(stats.avgPerDay)}</span>
          </div>
        </div>
        <div className="analytics__stat-card glass-card animate-fade-in-up stagger-3">
          <div className="analytics__stat-icon" style={{ background: 'var(--gradient-warm)' }}>
            <Repeat size={18} />
          </div>
          <div className="analytics__stat-info">
            <span className="analytics__stat-label">Avg / Transaction</span>
            <span className="analytics__stat-value">{formatCurrency(stats.avgPerTransaction)}</span>
          </div>
        </div>
        <div className="analytics__stat-card glass-card animate-fade-in-up stagger-4">
          <div className="analytics__stat-icon" style={{
            background: monthChange.change > 0 ? 'var(--gradient-danger)' : 'var(--gradient-success)'
          }}>
            {monthChange.change > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>
          <div className="analytics__stat-info">
            <span className="analytics__stat-label">vs Last Month</span>
            <span className="analytics__stat-value" style={{
              color: monthChange.change > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
            }}>
              {monthChange.change > 0 ? '+' : ''}{formatPercentage(monthChange.change, 1)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Monthly Trend + Category Breakdown */}
      <div className="analytics__row">
        <div className="analytics__chart-card glass-card" style={{ flex: '1.6' }}>
          <div className="analytics__chart-header">
            <h3>Monthly Spending Trend</h3>
            <span className="badge badge-purple">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barCategoryGap="25%">
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5a5a7a' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5a5a7a' }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[8, 8, 0, 0]} name="Spending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics__chart-card glass-card" style={{ flex: '1' }}>
          <div className="analytics__chart-header">
            <h3>Category Split</h3>
            <span className="badge badge-cyan">{categoryData.length} categories</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={3} dataKey="value" stroke="none">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="analytics__category-list">
            {categoryData.slice(0, 5).map(cat => (
              <div key={cat.name} className="analytics__category-item">
                <div className="analytics__category-dot" style={{ background: cat.color }} />
                <span className="analytics__category-name">{cat.name}</span>
                <span className="analytics__category-pct">
                  {formatPercentage((cat.value / totalCategory) * 100, 0)}
                </span>
                <span className="analytics__category-val">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Daily Spending + Day of Week */}
      <div className="analytics__row">
        <div className="analytics__chart-card glass-card" style={{ flex: '1.6' }}>
          <div className="analytics__chart-header">
            <h3>Daily Spending Pattern</h3>
            <span className="badge badge-emerald">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5a5a7a' }} tickLine={false}
                axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#5a5a7a' }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={2}
                fill="url(#areaGrad)" name="Spent" dot={false}
                activeDot={{ r: 4, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics__chart-card glass-card" style={{ flex: '1' }}>
          <div className="analytics__chart-header">
            <h3>By Day of Week</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dayOfWeekData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#5a5a7a' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5a5a7a' }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} name="Spent">
                {dayOfWeekData.map((entry, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: Payment Methods + Top Merchants */}
      <div className="analytics__row">
        <div className="analytics__chart-card glass-card" style={{ flex: '1' }}>
          <div className="analytics__chart-header">
            <h3><CreditCard size={16} style={{ marginRight: 8 }} />Payment Methods</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" outerRadius={75}
                paddingAngle={2} dataKey="value" stroke="none">
                {paymentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="analytics__category-list">
            {paymentData.map(pm => (
              <div key={pm.name} className="analytics__category-item">
                <div className="analytics__category-dot" style={{ background: pm.color }} />
                <span className="analytics__category-name">{pm.name}</span>
                <span className="analytics__category-val">{formatCurrency(pm.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics__chart-card glass-card" style={{ flex: '1.5' }}>
          <div className="analytics__chart-header">
            <h3>Top Merchants</h3>
            <span className="badge badge-amber">By spending</span>
          </div>
          <div className="analytics__merchants">
            {topMerchants.map((merchant, i) => {
              const maxAmt = topMerchants[0]?.amount || 1;
              const pct = (merchant.amount / maxAmt) * 100;
              return (
                <div key={merchant.name} className="analytics__merchant-item">
                  <div className="analytics__merchant-rank">{i + 1}</div>
                  <div className="analytics__merchant-info">
                    <div className="analytics__merchant-header">
                      <span className="analytics__merchant-name">{merchant.name}</span>
                      <span className="analytics__merchant-amount">{formatCurrency(merchant.amount)}</span>
                    </div>
                    <div className="analytics__merchant-bar">
                      <div
                        className="analytics__merchant-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="analytics__merchant-count">{merchant.count} transactions</span>
                  </div>
                </div>
              );
            })}
            {topMerchants.length === 0 && (
              <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                <p>No merchant data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spending Heatmap by Hour */}
      <div className="analytics__chart-card glass-card">
        <div className="analytics__chart-header">
          <h3><Clock size={16} style={{ marginRight: 8 }} />Spending by Time of Day</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourData} barCategoryGap="10%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#5a5a7a' }} tickLine={false}
              axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 11, fill: '#5a5a7a' }} tickLine={false} axisLine={false}
              tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={45} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" fill="#a855f7" radius={[4, 4, 0, 0]} name="Amount" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
