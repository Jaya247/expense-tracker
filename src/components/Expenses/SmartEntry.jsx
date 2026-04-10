import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../../contexts/ExpenseContext';
import { parseExpense } from '../../utils/aiParser';
import {
  Sparkles, Send, Mic, ArrowRight, Check, AlertCircle,
  UtensilsCrossed, Car, ShoppingBag, Zap, Film, Heart,
  GraduationCap, Plane, MoreHorizontal
} from 'lucide-react';
import './SmartEntry.css';

const categoryIcons = {
  'Food & Dining': UtensilsCrossed,
  'Transport': Car,
  'Shopping': ShoppingBag,
  'Bills & Utilities': Zap,
  'Entertainment': Film,
  'Health': Heart,
  'Education': GraduationCap,
  'Travel': Plane,
  'Other': MoreHorizontal,
};

const quickEntries = [
  { label: 'Coffee ☕', text: 'Spent 150 on coffee today' },
  { label: 'Lunch 🍛', text: 'Spent 250 on lunch at restaurant today' },
  { label: 'Uber 🚗', text: 'Spent 200 on uber cab ride today' },
  { label: 'Groceries 🛒', text: 'Spent 1500 on groceries at DMart today' },
  { label: 'Netflix 🎬', text: 'Spent 649 on Netflix subscription today' },
  { label: 'Petrol ⛽', text: 'Spent 2000 on petrol today' },
];

export default function SmartEntry() {
  const { state, dispatch, addToast } = useExpenses();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    category: 'Food & Dining',
    description: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
  });
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleParse = () => {
    if (!input.trim()) return;
    const result = parseExpense(input);
    setParsed(result);
    if (result.isParsed) {
      setForm({
        amount: result.amount?.toString() || '',
        category: result.category,
        description: result.description,
        merchant: result.merchant,
        date: result.date,
        paymentMethod: result.paymentMethod,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleParse();
  };

  const handleQuickEntry = (text) => {
    setInput(text);
    const result = parseExpense(text);
    setParsed(result);
    if (result.isParsed) {
      setForm({
        amount: result.amount?.toString() || '',
        category: result.category,
        description: result.description,
        merchant: result.merchant,
        date: result.date,
        paymentMethod: result.paymentMethod,
      });
    }
  };

  const handleSave = () => {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    const expense = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      amount: Number(form.amount),
      category: form.category,
      description: form.description || form.category,
      merchant: form.merchant,
      date: form.date,
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: form.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    addToast(`Added ₹${expense.amount.toLocaleString('en-IN')} for ${expense.category}`, 'success');

    // Reset
    setInput('');
    setParsed(null);
    setForm({
      amount: '',
      category: 'Food & Dining',
      description: '',
      merchant: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
    });

    inputRef.current?.focus();
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="smart-entry animate-fade-in">
      {/* AI Input Section */}
      <div className="smart-entry__hero glass-card">
        <div className="smart-entry__hero-header">
          <div className="smart-entry__ai-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <h2>Smart Expense Entry</h2>
            <p>Type naturally — AI will parse your expense automatically</p>
          </div>
        </div>

        <div className="smart-entry__input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="smart-entry__input"
            placeholder='Try: "Spent 500 on lunch at Zomato yesterday"'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="smart-expense-input"
          />
          <button
            className="smart-entry__send btn btn-primary"
            onClick={handleParse}
            id="parse-expense-btn"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Quick entry chips */}
        <div className="smart-entry__quick">
          <span className="smart-entry__quick-label">Quick add:</span>
          <div className="smart-entry__quick-chips">
            {quickEntries.map(q => (
              <button
                key={q.label}
                className="smart-entry__chip"
                onClick={() => handleQuickEntry(q.text)}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parsed Result */}
      {parsed && (
        <div className="smart-entry__result glass-card animate-scale-in">
          <div className="smart-entry__result-header">
            {parsed.isParsed ? (
              <>
                <Check size={20} className="smart-entry__result-icon smart-entry__result-icon--success" />
                <span>AI parsed your expense successfully!</span>
              </>
            ) : (
              <>
                <AlertCircle size={20} className="smart-entry__result-icon smart-entry__result-icon--error" />
                <span>Couldn't detect amount. Please fill in manually.</span>
              </>
            )}
            {parsed.isParsed && parsed.categoryConfidence && (
              <span className="badge badge-purple">
                {Math.round(parsed.categoryConfidence * 100)}% confidence
              </span>
            )}
          </div>

          {/* Editable form */}
          <div className="smart-entry__form">
            <div className="smart-entry__form-row">
              <div className="input-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.amount}
                  onChange={e => handleFormChange('amount', e.target.value)}
                  placeholder="0"
                  id="expense-amount-input"
                />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={e => handleFormChange('category', e.target.value)}
                  id="expense-category-select"
                >
                  {state.categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="smart-entry__form-row">
              <div className="input-group">
                <label>Description</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  placeholder="What was it for?"
                  id="expense-description-input"
                />
              </div>
              <div className="input-group">
                <label>Merchant</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.merchant}
                  onChange={e => handleFormChange('merchant', e.target.value)}
                  placeholder="Where?"
                  id="expense-merchant-input"
                />
              </div>
            </div>

            <div className="smart-entry__form-row">
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={e => handleFormChange('date', e.target.value)}
                  id="expense-date-input"
                />
              </div>
              <div className="input-group">
                <label>Payment Method</label>
                <select
                  className="input-field"
                  value={form.paymentMethod}
                  onChange={e => handleFormChange('paymentMethod', e.target.value)}
                  id="expense-payment-select"
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Wallet">Wallet</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={handleSave} id="save-expense-btn">
              <Check size={18} /> Save Expense
            </button>
          </div>
        </div>
      )}

      {/* Manual entry toggle */}
      {!parsed && (
        <div className="smart-entry__manual">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setParsed({ isParsed: false });
              setForm(prev => ({ ...prev }));
            }}
            id="manual-entry-btn"
          >
            Or enter manually <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
