import React from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

export default function Toast() {
  const { state, dispatch } = useExpenses();

  if (state.toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {state.toasts.map(toast => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.type} animate-fade-in`}>
            <Icon size={18} />
            <span className="toast__message">{toast.message}</span>
            <button
              className="toast__close"
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
