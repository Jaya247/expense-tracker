import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadState, saveState, STORAGE_KEYS } from '../utils/storage';
import { generateSampleData, getDefaultCategories, getDefaultBudgets } from '../utils/sampleData';

const ExpenseContext = createContext(null);

const initialState = {
  expenses: [],
  categories: getDefaultCategories(),
  budgets: getDefaultBudgets(),
  settings: {
    currency: '₹',
    dateFormat: 'short',
    theme: 'dark',
  },
  toasts: [],
};

function expenseReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
      };

    case 'EDIT_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        ),
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      };

    case 'DELETE_EXPENSES':
      return {
        ...state,
        expenses: state.expenses.filter(e => !action.payload.includes(e.id)),
      };

    case 'SET_BUDGET':
      return {
        ...state,
        budgets: { ...state.budgets, [action.payload.category]: action.payload.amount },
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'EDIT_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'IMPORT_DATA':
      return { ...state, ...action.payload };

    case 'CLEAR_ALL':
      return {
        ...initialState,
        categories: getDefaultCategories(),
        budgets: getDefaultBudgets(),
      };

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      };

    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedExpenses = loadState(STORAGE_KEYS.EXPENSES);
    const savedCategories = loadState(STORAGE_KEYS.CATEGORIES);
    const savedBudgets = loadState(STORAGE_KEYS.BUDGETS);
    const savedSettings = loadState(STORAGE_KEYS.SETTINGS);

    const payload = {};
    if (savedExpenses && savedExpenses.length > 0) {
      payload.expenses = savedExpenses;
    } else {
      // Load sample data on first visit
      payload.expenses = generateSampleData();
    }
    if (savedCategories) payload.categories = savedCategories;
    if (savedBudgets) payload.budgets = savedBudgets;
    if (savedSettings) payload.settings = { ...initialState.settings, ...savedSettings };

    dispatch({ type: 'LOAD_DATA', payload });
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (state.expenses.length > 0) {
      saveState(STORAGE_KEYS.EXPENSES, state.expenses);
    }
    saveState(STORAGE_KEYS.CATEGORIES, state.categories);
    saveState(STORAGE_KEYS.BUDGETS, state.budgets);
    saveState(STORAGE_KEYS.SETTINGS, state.settings);
  }, [state.expenses, state.categories, state.budgets, state.settings]);

  const addToast = (message, type = 'success') => {
    const id = Date.now().toString();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3500);
  };

  return (
    <ExpenseContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within ExpenseProvider');
  return context;
}
