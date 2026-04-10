import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate, getRelativeDate } from '../../utils/formatters';

const categoryColors = {
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

export default function RecentTransactions({ expenses }) {
  const navigate = useNavigate();

  return (
    <div className="recent-transactions glass-card" id="recent-transactions" style={{ padding: 'var(--space-lg)' }}>
      <div className="recent-transactions__header" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 'var(--space-md)',
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Transactions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest activity</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/transactions')}
          id="view-all-transactions-btn"
        >
          View all <ArrowRight size={14} />
        </button>
      </div>

      <div className="recent-transactions__list">
        {expenses.map((expense, i) => (
          <div
            key={expense.id}
            className={`recent-transactions__item animate-fade-in stagger-${Math.min(i + 1, 6)}`}
          >
            <div className="recent-transactions__category-dot"
              style={{ background: categoryColors[expense.category] || '#9d9db8' }}
            />
            <div className="recent-transactions__info">
              <span className="recent-transactions__desc">{expense.description || expense.category}</span>
              <span className="recent-transactions__meta">
                {expense.merchant && `${expense.merchant} · `}
                {getRelativeDate(expense.date)}
              </span>
            </div>
            <div className="recent-transactions__amount">
              <span className="recent-transactions__amount-value">
                -{formatCurrency(expense.amount)}
              </span>
              <span className="recent-transactions__payment">{expense.paymentMethod}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
