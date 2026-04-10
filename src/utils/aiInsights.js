// AI Insights Generator
// Analyzes spending patterns and generates recommendations

import { getDateRange, getMonthName } from './formatters';

export function generateInsights(expenses) {
  if (!expenses || expenses.length === 0) return [];

  const insights = [];

  // 1. Top spending category this month
  const thisMonth = getDateRange('month');
  const monthExpenses = expenses.filter(e => new Date(e.date) >= thisMonth.start);
  const categoryTotals = {};
  monthExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    insights.push({
      id: 'top_category',
      type: 'info',
      icon: 'TrendingUp',
      title: 'Top Spending Category',
      message: `You've spent the most on **${topCategory[0]}** this month — ₹${topCategory[1].toLocaleString('en-IN')}. Consider setting a budget cap.`,
      amount: topCategory[1],
      category: topCategory[0],
    });
  }

  // 2. Spending velocity (this week vs last week)
  const thisWeek = getDateRange('week');
  const lastWeekStart = new Date(thisWeek.start);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeek.start);

  const thisWeekTotal = expenses
    .filter(e => new Date(e.date) >= thisWeek.start)
    .reduce((sum, e) => sum + e.amount, 0);

  const lastWeekTotal = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d >= lastWeekStart && d < lastWeekEnd;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  if (lastWeekTotal > 0) {
    const change = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    if (change > 20) {
      insights.push({
        id: 'spending_velocity_up',
        type: 'warning',
        icon: 'AlertTriangle',
        title: 'Spending Spike Detected',
        message: `Your spending is up **${change.toFixed(0)}%** compared to last week. You've spent ₹${thisWeekTotal.toLocaleString('en-IN')} so far.`,
        amount: thisWeekTotal,
      });
    } else if (change < -20) {
      insights.push({
        id: 'spending_velocity_down',
        type: 'success',
        icon: 'TrendingDown',
        title: 'Great Saving Week!',
        message: `Your spending is down **${Math.abs(change).toFixed(0)}%** compared to last week. Keep it up! 🎉`,
        amount: thisWeekTotal,
      });
    }
  }

  // 3. Largest single expense
  const largest = monthExpenses.reduce((max, e) => e.amount > (max?.amount || 0) ? e : max, null);
  if (largest && largest.amount > 1000) {
    insights.push({
      id: 'largest_expense',
      type: 'info',
      icon: 'Zap',
      title: 'Biggest Expense',
      message: `Your largest expense this month was ₹${largest.amount.toLocaleString('en-IN')} on **${largest.category}**${largest.merchant ? ` at ${largest.merchant}` : ''}. Was it planned?`,
      amount: largest.amount,
    });
  }

  // 4. Recurring patterns
  const merchantCounts = {};
  monthExpenses.forEach(e => {
    if (e.merchant) {
      merchantCounts[e.merchant] = (merchantCounts[e.merchant] || 0) + 1;
    }
  });

  const frequentMerchant = Object.entries(merchantCounts).sort((a, b) => b[1] - a[1])[0];
  if (frequentMerchant && frequentMerchant[1] >= 3) {
    const merchantTotal = monthExpenses
      .filter(e => e.merchant === frequentMerchant[0])
      .reduce((sum, e) => sum + e.amount, 0);

    insights.push({
      id: 'frequent_merchant',
      type: 'info',
      icon: 'Repeat',
      title: 'Frequent Spending Spot',
      message: `You've visited **${frequentMerchant[0]}** ${frequentMerchant[1]} times this month, spending ₹${merchantTotal.toLocaleString('en-IN')} total. Consider alternatives?`,
      amount: merchantTotal,
    });
  }

  // 5. Daily average
  const totalDays = Math.max(1, Math.ceil((thisMonth.end - thisMonth.start) / (1000 * 60 * 60 * 24)));
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAvg = monthTotal / totalDays;

  if (dailyAvg > 0) {
    const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
    const projectedTotal = monthTotal + (dailyAvg * daysLeft);

    insights.push({
      id: 'projected_spending',
      type: dailyAvg > 2000 ? 'warning' : 'info',
      icon: 'Calculator',
      title: 'Monthly Projection',
      message: `At your current pace (₹${dailyAvg.toFixed(0)}/day), you'll spend around **₹${projectedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}** this month.`,
      amount: projectedTotal,
    });
  }

  // 6. Weekend vs weekday spending
  const weekdaySpend = monthExpenses
    .filter(e => { const d = new Date(e.date).getDay(); return d > 0 && d < 6; })
    .reduce((sum, e) => sum + e.amount, 0);

  const weekendSpend = monthExpenses
    .filter(e => { const d = new Date(e.date).getDay(); return d === 0 || d === 6; })
    .reduce((sum, e) => sum + e.amount, 0);

  if (weekendSpend > weekdaySpend * 0.6) {
    insights.push({
      id: 'weekend_spending',
      type: 'info',
      icon: 'Calendar',
      title: 'Weekend Spender',
      message: `You spend disproportionately more on weekends (₹${weekendSpend.toLocaleString('en-IN')}) vs weekdays (₹${weekdaySpend.toLocaleString('en-IN')}). Plan weekend budgets!`,
      amount: weekendSpend,
    });
  }

  // 7. Savings opportunity
  const smallExpenses = monthExpenses.filter(e => e.amount < 200);
  const smallTotal = smallExpenses.reduce((sum, e) => sum + e.amount, 0);
  if (smallExpenses.length > 10 && smallTotal > 2000) {
    insights.push({
      id: 'small_expenses',
      type: 'tip',
      icon: 'Lightbulb',
      title: 'Small Expenses Add Up',
      message: `You have **${smallExpenses.length} transactions** under ₹200 totaling ₹${smallTotal.toLocaleString('en-IN')}. Small, frequent expenses can quietly drain your budget.`,
      amount: smallTotal,
    });
  }

  return insights;
}

export function getSpendingSummary(expenses) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  return {
    today: expenses.filter(e => new Date(e.date) >= today).reduce((s, e) => s + e.amount, 0),
    week: expenses.filter(e => new Date(e.date) >= weekAgo).reduce((s, e) => s + e.amount, 0),
    month: expenses.filter(e => new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0),
    year: expenses.filter(e => new Date(e.date) >= yearStart).reduce((s, e) => s + e.amount, 0),
    total: expenses.reduce((s, e) => s + e.amount, 0),
    count: expenses.length,
  };
}
