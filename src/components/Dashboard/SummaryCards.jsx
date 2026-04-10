import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

function AnimatedAmount({ value, currency = '₹' }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += stepValue;
      if (step >= steps) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{formatCurrency(displayed, currency)}</span>;
}

const cards = [
  { key: 'today', label: 'Today', icon: IndianRupee, gradient: 'var(--gradient-primary)' },
  { key: 'week', label: 'This Week', icon: TrendingUp, gradient: 'var(--gradient-secondary)' },
  { key: 'month', label: 'This Month', icon: Calendar, gradient: 'var(--gradient-cool)' },
  { key: 'year', label: 'This Year', icon: TrendingDown, gradient: 'var(--gradient-warm)' },
];

export default function SummaryCards({ summary }) {
  return (
    <div className="summary-cards">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`summary-card glass-card animate-fade-in-up stagger-${i + 1}`}
            id={`summary-card-${card.key}`}
          >
            <div className="summary-card__header">
              <span className="summary-card__label">{card.label}</span>
              <div className="summary-card__icon" style={{ background: card.gradient }}>
                <Icon size={18} />
              </div>
            </div>
            <div className="summary-card__amount">
              <AnimatedAmount value={summary[card.key]} />
            </div>
            <div className="summary-card__footer">
              <span className="summary-card__count">
                {card.key === 'today' ? `${summary.count} total expenses` : ''}
              </span>
            </div>
            <div className="summary-card__glow" style={{ background: card.gradient }} />
          </div>
        );
      })}
    </div>
  );
}
