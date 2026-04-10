import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass-card" style={{
      padding: '10px 14px',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-md)',
    }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function SpendingChart({ data }) {
  return (
    <div className="spending-chart glass-card" id="spending-trend-chart" style={{ padding: 'var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Spending Trend</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 30 days</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#5a5a7a' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#5a5a7a' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#a855f7"
            strokeWidth={2.5}
            fill="url(#spendGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
