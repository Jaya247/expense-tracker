import React, { useMemo } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { generateInsights, getSpendingSummary } from '../../utils/aiInsights';
import { formatCurrency } from '../../utils/formatters';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, Zap, Repeat,
  Calculator, Calendar, Lightbulb, Brain, ShieldCheck, ArrowRight,
  ChevronRight, Target, PiggyBank
} from 'lucide-react';
import './InsightsPage.css';

const insightIcons = {
  TrendingUp, TrendingDown, AlertTriangle, Zap, Repeat,
  Calculator, Calendar, Lightbulb,
};

const typeStyles = {
  info: { color: 'var(--accent-blue)', bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.2)' },
  success: { color: 'var(--accent-emerald)', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.2)' },
  warning: { color: 'var(--accent-amber)', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)' },
  tip: { color: 'var(--accent-cyan)', bg: 'rgba(34, 211, 238, 0.1)', border: 'rgba(34, 211, 238, 0.2)' },
};

export default function InsightsPage() {
  const { state } = useExpenses();
  const { expenses, budgets } = state;

  const insights = useMemo(() => generateInsights(expenses), [expenses]);
  const summary = useMemo(() => getSpendingSummary(expenses), [expenses]);

  // Budget health score
  const budgetHealth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthExpenses = expenses.filter(e => new Date(e.date) >= monthStart);

    let totalBudget = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;
    const categories = Object.entries(budgets);

    categories.forEach(([cat, budget]) => {
      const spent = monthExpenses
        .filter(e => e.category === cat)
        .reduce((s, e) => s + e.amount, 0);
      totalBudget += budget;
      totalSpent += spent;
      if (spent > budget) overBudgetCount++;
    });

    const usagePercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    let score = 100;
    if (usagePercent > 100) score = Math.max(0, 100 - (usagePercent - 100) * 2);
    else if (usagePercent > 80) score = 85 - (usagePercent - 80);
    score -= overBudgetCount * 5;
    score = Math.max(0, Math.min(100, Math.round(score)));

    let grade, gradeColor;
    if (score >= 90) { grade = 'Excellent'; gradeColor = '#34d399'; }
    else if (score >= 75) { grade = 'Good'; gradeColor = '#22d3ee'; }
    else if (score >= 60) { grade = 'Fair'; gradeColor = '#fbbf24'; }
    else if (score >= 40) { grade = 'Needs Work'; gradeColor = '#fb923c'; }
    else { grade = 'Critical'; gradeColor = '#fb7185'; }

    return { score, grade, gradeColor, usagePercent, overBudgetCount, totalBudget, totalSpent };
  }, [expenses, budgets]);

  // Savings tips
  const savingsTips = useMemo(() => {
    const tips = [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthExpenses = expenses.filter(e => new Date(e.date) >= monthStart);

    // Check food spending
    const foodTotal = monthExpenses
      .filter(e => e.category === 'Food & Dining')
      .reduce((s, e) => s + e.amount, 0);
    if (foodTotal > 10000) {
      tips.push({
        icon: '🍽️',
        title: 'Meal Planning',
        message: `You've spent ${formatCurrency(foodTotal)} on food this month. Try batch cooking to save up to 40%.`,
        savings: Math.round(foodTotal * 0.3),
      });
    }

    // Check transport
    const transportTotal = monthExpenses
      .filter(e => e.category === 'Transport')
      .reduce((s, e) => s + e.amount, 0);
    if (transportTotal > 3000) {
      tips.push({
        icon: '🚌',
        title: 'Use Public Transport',
        message: `Transport costs are ${formatCurrency(transportTotal)}. Consider metro/bus for daily commutes.`,
        savings: Math.round(transportTotal * 0.4),
      });
    }

    // Check subscriptions
    const subTotal = monthExpenses
      .filter(e => e.category === 'Entertainment')
      .reduce((s, e) => s + e.amount, 0);
    if (subTotal > 2000) {
      tips.push({
        icon: '📺',
        title: 'Review Subscriptions',
        message: `${formatCurrency(subTotal)} on entertainment. Audit subscriptions and cancel unused ones.`,
        savings: Math.round(subTotal * 0.25),
      });
    }

    // Check shopping
    const shopTotal = monthExpenses
      .filter(e => e.category === 'Shopping')
      .reduce((s, e) => s + e.amount, 0);
    if (shopTotal > 5000) {
      tips.push({
        icon: '🛍️',
        title: 'Wait Before Buying',
        message: `${formatCurrency(shopTotal)} on shopping. Apply the 48-hour rule before impulse purchases.`,
        savings: Math.round(shopTotal * 0.2),
      });
    }

    // General tip
    tips.push({
      icon: '💰',
      title: '50/30/20 Rule',
      message: 'Allocate 50% to needs, 30% to wants, and 20% to savings for a balanced budget.',
      savings: Math.round(summary.month * 0.1),
    });

    return tips;
  }, [expenses, summary]);

  // Spending patterns
  const patterns = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthExpenses = expenses.filter(e => new Date(e.date) >= monthStart);

    // Peak spending day
    const dayTotals = {};
    monthExpenses.forEach(e => {
      dayTotals[e.date] = (dayTotals[e.date] || 0) + e.amount;
    });
    const peakDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];

    // Most used payment method
    const paymentCounts = {};
    monthExpenses.forEach(e => {
      paymentCounts[e.paymentMethod] = (paymentCounts[e.paymentMethod] || 0) + 1;
    });
    const topPayment = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0];

    // Average transaction size
    const avgTransaction = monthExpenses.length > 0
      ? monthExpenses.reduce((s, e) => s + e.amount, 0) / monthExpenses.length
      : 0;

    return {
      peakDay: peakDay ? { date: peakDay[0], amount: peakDay[1] } : null,
      topPayment: topPayment ? { method: topPayment[0], count: topPayment[1] } : null,
      avgTransaction,
      totalTransactions: monthExpenses.length,
    };
  }, [expenses]);

  const renderMarkdown = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="insights animate-fade-in">
      {/* Hero Section */}
      <div className="insights__hero glass-card">
        <div className="insights__hero-content">
          <div className="insights__hero-icon">
            <Brain size={28} />
          </div>
          <div>
            <h2>AI Financial Insights</h2>
            <p>Smart analysis of your spending patterns and personalized recommendations</p>
          </div>
        </div>
        <div className="insights__hero-stats">
          <div className="insights__hero-stat">
            <span className="insights__hero-stat-value">{insights.length}</span>
            <span className="insights__hero-stat-label">Active Insights</span>
          </div>
          <div className="insights__hero-stat">
            <span className="insights__hero-stat-value">{formatCurrency(summary.month)}</span>
            <span className="insights__hero-stat-label">Monthly Spending</span>
          </div>
          <div className="insights__hero-stat">
            <span className="insights__hero-stat-value">{patterns.totalTransactions}</span>
            <span className="insights__hero-stat-label">Transactions</span>
          </div>
        </div>
      </div>

      {/* Budget Health Score */}
      <div className="insights__row">
        <div className="insights__health glass-card">
          <div className="insights__health-header">
            <ShieldCheck size={20} />
            <h3>Budget Health Score</h3>
          </div>
          <div className="insights__health-body">
            <div className="insights__health-score">
              <svg viewBox="0 0 120 120" className="insights__health-ring">
                <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={budgetHealth.gradeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(budgetHealth.score / 100) * 327} 327`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="insights__health-score-text">
                <span className="insights__health-score-num">{budgetHealth.score}</span>
                <span className="insights__health-score-label">{budgetHealth.grade}</span>
              </div>
            </div>
            <div className="insights__health-details">
              <div className="insights__health-detail">
                <span>Budget Used</span>
                <strong>{budgetHealth.usagePercent.toFixed(0)}%</strong>
              </div>
              <div className="insights__health-detail">
                <span>Total Budget</span>
                <strong>{formatCurrency(budgetHealth.totalBudget)}</strong>
              </div>
              <div className="insights__health-detail">
                <span>Total Spent</span>
                <strong>{formatCurrency(budgetHealth.totalSpent)}</strong>
              </div>
              <div className="insights__health-detail">
                <span>Over-budget Categories</span>
                <strong style={{ color: budgetHealth.overBudgetCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {budgetHealth.overBudgetCount}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Spending Patterns */}
        <div className="insights__patterns glass-card">
          <div className="insights__patterns-header">
            <Target size={20} />
            <h3>Spending Patterns</h3>
          </div>
          <div className="insights__patterns-grid">
            {patterns.peakDay && (
              <div className="insights__pattern-item">
                <div className="insights__pattern-icon" style={{ background: 'rgba(251, 113, 133, 0.1)', color: 'var(--accent-rose)' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="insights__pattern-label">Peak Spending Day</span>
                  <span className="insights__pattern-value">
                    {new Date(patterns.peakDay.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {' '}— {formatCurrency(patterns.peakDay.amount)}
                  </span>
                </div>
              </div>
            )}
            {patterns.topPayment && (
              <div className="insights__pattern-item">
                <div className="insights__pattern-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <span className="insights__pattern-label">Preferred Payment</span>
                  <span className="insights__pattern-value">
                    {patterns.topPayment.method} ({patterns.topPayment.count} times)
                  </span>
                </div>
              </div>
            )}
            <div className="insights__pattern-item">
              <div className="insights__pattern-icon" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)' }}>
                <Calculator size={18} />
              </div>
              <div>
                <span className="insights__pattern-label">Avg Transaction</span>
                <span className="insights__pattern-value">{formatCurrency(patterns.avgTransaction)}</span>
              </div>
            </div>
            <div className="insights__pattern-item">
              <div className="insights__pattern-icon" style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-emerald)' }}>
                <Repeat size={18} />
              </div>
              <div>
                <span className="insights__pattern-label">This Month</span>
                <span className="insights__pattern-value">{patterns.totalTransactions} transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="insights__section">
        <div className="insights__section-header">
          <Sparkles size={18} className="insights__section-icon" />
          <h3>AI Observations</h3>
          <span className="badge badge-purple">{insights.length} insights</span>
        </div>

        <div className="insights__cards">
          {insights.map((insight, i) => {
            const style = typeStyles[insight.type] || typeStyles.info;
            const Icon = insightIcons[insight.icon] || Lightbulb;
            return (
              <div
                key={insight.id}
                className={`insights__card glass-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                style={{ borderColor: style.border }}
              >
                <div className="insights__card-icon" style={{ background: style.bg, color: style.color }}>
                  <Icon size={20} />
                </div>
                <div className="insights__card-content">
                  <h4 className="insights__card-title">{insight.title}</h4>
                  <p
                    className="insights__card-message"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(insight.message) }}
                  />
                </div>
                {insight.amount && (
                  <div className="insights__card-amount" style={{ color: style.color }}>
                    {formatCurrency(insight.amount)}
                  </div>
                )}
              </div>
            );
          })}

          {insights.length === 0 && (
            <div className="empty-state glass-card">
              <Sparkles size={48} />
              <h3>No Insights Yet</h3>
              <p>Add more expenses to get AI-powered recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* Savings Tips */}
      <div className="insights__section">
        <div className="insights__section-header">
          <PiggyBank size={18} className="insights__section-icon" />
          <h3>Savings Opportunities</h3>
        </div>

        <div className="insights__tips">
          {savingsTips.map((tip, i) => (
            <div key={i} className="insights__tip glass-card">
              <div className="insights__tip-emoji">{tip.icon}</div>
              <div className="insights__tip-content">
                <h4>{tip.title}</h4>
                <p>{tip.message}</p>
              </div>
              <div className="insights__tip-savings">
                <span className="insights__tip-savings-label">Potential savings</span>
                <span className="insights__tip-savings-amount">{formatCurrency(tip.savings)}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
