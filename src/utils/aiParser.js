// AI Natural Language Expense Parser
// Parses strings like "Spent 500 on groceries at BigBazaar yesterday"

const CATEGORY_KEYWORDS = {
  'Food & Dining': ['food', 'lunch', 'dinner', 'breakfast', 'snack', 'coffee', 'tea', 'restaurant', 'cafe', 'biryani', 'pizza', 'burger', 'swiggy', 'zomato', 'meal', 'eat', 'dine', 'groceries', 'grocery', 'vegetables', 'fruits', 'milk', 'bread', 'rice', 'dal', 'chicken', 'mutton', 'fish', 'egg'],
  'Transport': ['uber', 'ola', 'cab', 'taxi', 'auto', 'rickshaw', 'bus', 'train', 'metro', 'fuel', 'petrol', 'diesel', 'gas', 'parking', 'toll', 'rapido', 'transport', 'travel', 'commute', 'flight', 'airfare'],
  'Shopping': ['shopping', 'amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'electronics', 'gadget', 'phone', 'laptop', 'watch', 'bag', 'dress', 'shirt', 'jeans', 'accessories', 'mall', 'market', 'buy', 'purchase', 'order'],
  'Bills & Utilities': ['bill', 'electricity', 'electric', 'water', 'gas', 'internet', 'wifi', 'broadband', 'phone bill', 'mobile recharge', 'recharge', 'dth', 'maintenance', 'rent', 'emi', 'loan', 'insurance', 'premium'],
  'Entertainment': ['movie', 'netflix', 'spotify', 'hotstar', 'prime', 'gaming', 'game', 'concert', 'show', 'theatre', 'cinema', 'entertainment', 'youtube', 'subscription', 'outing', 'party', 'pub', 'bar'],
  'Health': ['medicine', 'medical', 'doctor', 'hospital', 'clinic', 'pharmacy', 'health', 'gym', 'fitness', 'yoga', 'dental', 'eye', 'checkup', 'lab test', 'apollo', 'medplus', 'wellness'],
  'Education': ['book', 'books', 'course', 'class', 'tuition', 'coaching', 'school', 'college', 'university', 'exam', 'fee', 'fees', 'study', 'learning', 'udemy', 'coursera', 'education'],
  'Travel': ['hotel', 'resort', 'booking', 'trip', 'vacation', 'holiday', 'stay', 'airbnb', 'oyo', 'goibibo', 'makemytrip', 'irctc', 'sight', 'tour', 'tourist'],
};

const DATE_PATTERNS = {
  'today': 0,
  'yesterday': -1,
  'day before yesterday': -2,
  'day before': -2,
  'last week': -7,
  '2 days ago': -2,
  '3 days ago': -3,
  '4 days ago': -4,
  '5 days ago': -5,
  'a week ago': -7,
};

function parseAmount(text) {
  // Match patterns like ₹500, Rs 500, Rs.500, 500 rupees, 500, 1,500, 1500.50
  const patterns = [
    /(?:₹|rs\.?|inr|rupees?)\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:₹|rs\.?|inr|rupees?)/i,
    /(?:spent|paid|cost|charged|amount|for|of)\s*(?:₹|rs\.?)?\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:spent|paid|for|on)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }

  // Fallback: find any number
  const numMatch = text.match(/([\d,]+\.?\d+)/);
  if (numMatch) {
    const num = parseFloat(numMatch[1].replace(/,/g, ''));
    if (num > 0 && num < 10000000) return num;
  }

  return null;
}

function parseCategory(text) {
  const lower = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        const score = keyword.length; // Longer match = more specific
        if (score > bestScore) {
          bestScore = score;
          bestMatch = category;
        }
      }
    }
  }

  return {
    category: bestMatch || 'Other',
    confidence: bestMatch ? Math.min(0.95, 0.5 + bestScore * 0.05) : 0.3
  };
}

function parseDate(text) {
  const lower = text.toLowerCase();

  // Check named dates
  for (const [pattern, offset] of Object.entries(DATE_PATTERNS)) {
    if (lower.includes(pattern)) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return date.toISOString().split('T')[0];
    }
  }

  // Check explicit date patterns (DD/MM, DD-MM, DD/MM/YYYY)
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{1,2})[\/\-](\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  // Check month names
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  for (let i = 0; i < monthNames.length; i++) {
    const monthPattern = new RegExp(`(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*${monthNames[i]}`, 'i');
    const match = text.match(monthPattern);
    if (match) {
      const date = new Date(new Date().getFullYear(), i, parseInt(match[1]));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  // Default: today
  return new Date().toISOString().split('T')[0];
}

function parseMerchant(text) {
  const lower = text.toLowerCase();

  // Check for "at <merchant>" pattern
  const atMatch = text.match(/\bat\s+([A-Z][A-Za-z0-9\s'&]+)/);
  if (atMatch) {
    return atMatch[1].trim();
  }

  // Check for "from <merchant>" pattern
  const fromMatch = text.match(/\bfrom\s+([A-Z][A-Za-z0-9\s'&]+)/);
  if (fromMatch) {
    return fromMatch[1].trim();
  }

  // Known merchants
  const merchants = ['swiggy', 'zomato', 'amazon', 'flipkart', 'uber', 'ola', 'bigbazaar', 'big bazaar', 'dmart', 'd-mart', 'reliance', 'myntra', 'netflix', 'spotify', 'hotstar', 'apollo', 'medplus'];
  for (const m of merchants) {
    if (lower.includes(m)) {
      return m.charAt(0).toUpperCase() + m.slice(1);
    }
  }

  return '';
}

function parsePaymentMethod(text) {
  const lower = text.toLowerCase();
  if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) return 'UPI';
  if (lower.includes('card') || lower.includes('credit') || lower.includes('debit')) return 'Card';
  if (lower.includes('cash')) return 'Cash';
  if (lower.includes('netbanking') || lower.includes('bank transfer') || lower.includes('neft')) return 'Net Banking';
  if (lower.includes('wallet')) return 'Wallet';
  return 'UPI'; // default for India
}

export function parseExpense(text) {
  const amount = parseAmount(text);
  const { category, confidence } = parseCategory(text);
  const date = parseDate(text);
  const merchant = parseMerchant(text);
  const paymentMethod = parsePaymentMethod(text);

  return {
    amount,
    category,
    categoryConfidence: confidence,
    date,
    merchant,
    paymentMethod,
    description: text,
    isParsed: amount !== null,
  };
}
