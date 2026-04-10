import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass-card" style={{
      padding: '10px 14px',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-md)',
    }}>
      <p style={{ fontSize: '0.8rem', color: d.payload.color, fontWeight: 600 }}>{d.name}</p>
      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {formatCurrency(d.value)}
      </p>
    </div>
  );
}

export default function CategoryDonut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="category-donut glass-card" id="category-donut-chart" style={{ padding: 'var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-sm)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>By Category</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This month</p>
      </div>

      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      <div className="category-donut__legend">
        {data.slice(0, 5).map(item => (
          <div key={item.name} className="category-donut__legend-item">
            <div className="category-donut__legend-dot" style={{ background: item.color }} />
            <span className="category-donut__legend-name">{item.name}</span>
            <span className="category-donut__legend-value">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
