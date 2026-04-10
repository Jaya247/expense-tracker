// Sample data generator - creates 3 months of realistic expenses

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities',
  'Entertainment', 'Health', 'Education', 'Travel', 'Other'
];

const MERCHANTS = {
  'Food & Dining': ['Swiggy', 'Zomato', 'Dominos', 'KFC', 'Starbucks', 'Local Restaurant', 'BigBazaar', 'DMart', 'More Supermarket', 'Chai Point'],
  'Transport': ['Uber', 'Ola', 'Rapido', 'Metro', 'Petrol Pump', 'FastTag Toll'],
  'Shopping': ['Amazon', 'Flipkart', 'Myntra', 'Reliance Digital', 'Decathlon', 'Croma'],
  'Bills & Utilities': ['Electricity Board', 'Jio', 'Airtel', 'ACT Fibernet', 'Society Maintenance', 'Water Board'],
  'Entertainment': ['Netflix', 'PVR Cinemas', 'Spotify', 'BookMyShow', 'Steam'],
  'Health': ['Apollo Pharmacy', 'MedPlus', 'Cult.fit', 'Dr. Sharma Clinic', 'Practo'],
  'Education': ['Udemy', 'Amazon Books', 'Coursera', 'Stationery Shop'],
  'Travel': ['IRCTC', 'MakeMyTrip', 'OYO Rooms', 'RedBus'],
  'Other': ['ATM Withdrawal', 'Gift Shop', 'Dry Cleaning', 'Courier', 'Charity'],
};

const AMOUNT_RANGES = {
  'Food & Dining': [50, 2500],
  'Transport': [30, 3000],
  'Shopping': [200, 15000],
  'Bills & Utilities': [100, 8000],
  'Entertainment': [99, 3000],
  'Health': [50, 5000],
  'Education': [100, 5000],
  'Travel': [500, 20000],
  'Other': [50, 5000],
};

const PAYMENT_METHODS = ['UPI', 'UPI', 'UPI', 'Card', 'Card', 'Cash', 'Net Banking', 'Wallet'];

const DESCRIPTIONS = {
  'Food & Dining': ['Lunch', 'Dinner', 'Groceries', 'Snacks', 'Coffee', 'Breakfast', 'Weekly groceries', 'Office lunch', 'Weekend treat'],
  'Transport': ['Cab to office', 'Auto ride', 'Metro card recharge', 'Fuel', 'Uber ride', 'Toll charges'],
  'Shopping': ['Online order', 'New clothes', 'Electronics', 'Kitchen items', 'Home decor', 'Shoes'],
  'Bills & Utilities': ['Electricity bill', 'Mobile recharge', 'Internet bill', 'Society maintenance', 'Gas cylinder', 'Water bill'],
  'Entertainment': ['Movie tickets', 'Subscription renewal', 'Gaming purchase', 'Concert tickets', 'Weekend outing'],
  'Health': ['Medicines', 'Doctor visit', 'Gym membership', 'Health checkup', 'Supplements'],
  'Education': ['Online course', 'Books', 'Study materials', 'Exam fees'],
  'Travel': ['Train tickets', 'Hotel booking', 'Flight tickets', 'Bus fare'],
  'Other': ['ATM withdrawal', 'Gift', 'Dry cleaning', 'Miscellaneous', 'Donation'],
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function generateSampleData() {
  const expenses = [];
  const now = new Date();

  // Generate expenses for the last 90 days
  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(randomBetween(7, 22), randomBetween(0, 59), 0, 0);

    // 2-5 expenses per day
    const expensesPerDay = randomBetween(2, 5);

    for (let j = 0; j < expensesPerDay; j++) {
      // Weight categories: food & transport more frequent
      const weightedCategories = [
        ...Array(4).fill('Food & Dining'),
        ...Array(3).fill('Transport'),
        ...Array(2).fill('Shopping'),
        ...Array(2).fill('Bills & Utilities'),
        ...Array(1).fill('Entertainment'),
        ...Array(1).fill('Health'),
        ...Array(1).fill('Education'),
        ...Array(1).fill('Other'),
      ];

      // Add Travel less frequently
      if (Math.random() < 0.05) weightedCategories.push('Travel');

      const category = randomItem(weightedCategories);
      const [minAmt, maxAmt] = AMOUNT_RANGES[category];

      // Make most expenses smaller, with occasional bigger ones
      let amount;
      if (Math.random() < 0.7) {
        amount = randomBetween(minAmt, Math.min(maxAmt, minAmt * 5));
      } else {
        amount = randomBetween(minAmt * 2, maxAmt);
      }

      // Round to nearest 10 for realism
      amount = Math.round(amount / 10) * 10;
      if (amount === 0) amount = minAmt;

      const expenseDate = new Date(date);
      expenseDate.setHours(randomBetween(7, 22), randomBetween(0, 59));

      expenses.push({
        id: generateId(),
        amount,
        category,
        merchant: randomItem(MERCHANTS[category]),
        description: randomItem(DESCRIPTIONS[category]),
        date: expenseDate.toISOString().split('T')[0],
        time: expenseDate.toTimeString().slice(0, 5),
        paymentMethod: randomItem(PAYMENT_METHODS),
        createdAt: expenseDate.toISOString(),
      });
    }
  }

  // Sort by date descending
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

  return expenses;
}

export function getDefaultCategories() {
  return [
    { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#fb923c' },
    { id: 'transport', name: 'Transport', icon: 'Car', color: '#60a5fa' },
    { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#a855f7' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'Zap', color: '#fbbf24' },
    { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#fb7185' },
    { id: 'health', name: 'Health', icon: 'Heart', color: '#34d399' },
    { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#22d3ee' },
    { id: 'travel', name: 'Travel', icon: 'Plane', color: '#c084fc' },
    { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#9d9db8' },
  ];
}

export function getDefaultBudgets() {
  return {
    'Food & Dining': 15000,
    'Transport': 5000,
    'Shopping': 10000,
    'Bills & Utilities': 8000,
    'Entertainment': 3000,
    'Health': 3000,
    'Education': 5000,
    'Travel': 10000,
    'Other': 3000,
  };
}
