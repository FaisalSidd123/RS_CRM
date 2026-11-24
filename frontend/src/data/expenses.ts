import { Expense } from '@/types';
import { relativeDaysAgo } from './seedGenerator';

export function generateInitialExpenses(): Expense[] {
  const expenses: Expense[] = [];
  let expId = 1;

  // Generate 6 months of expenses
  for (let m = 0; m < 6; m++) {
    const daysOffset = m * 30;

    expenses.push({
      id: `exp-${expId++}`,
      category: 'Office rent',
      amount: 400000, // 4 Lakh
      date: relativeDaysAgo(daysOffset + 2),
      note: 'DHA Phase 6 Commercial Avenue Head Office Rent',
    });

    expenses.push({
      id: `exp-${expId++}`,
      category: 'Salaries',
      amount: 650000, // 6.5 Lakh
      date: relativeDaysAgo(daysOffset + 5),
      note: 'Base salaries for administrative, front desk, and tea staff',
    });

    expenses.push({
      id: `exp-${expId++}`,
      category: 'Marketing — Zameen package',
      amount: 250000, // 2.5 Lakh
      date: relativeDaysAgo(daysOffset + 8),
      note: 'Zameen.com Titanium agency package renewal (30 featured listings)',
    });

    expenses.push({
      id: `exp-${expId++}`,
      category: 'Facebook ads',
      amount: 145000, // 1.45 Lakh
      date: relativeDaysAgo(daysOffset + 12),
      note: 'Meta Lead Gen campaigns for DHA 6 and Bahria Karachi plots',
    });

    expenses.push({
      id: `exp-${expId++}`,
      category: 'Utilities',
      amount: 110000, // 1.1 Lakh
      date: relativeDaysAgo(daysOffset + 18),
      note: 'K-Electric bill, Generator diesel backup, PTCL optical fiber',
    });

    expenses.push({
      id: `exp-${expId++}`,
      category: 'Fuel',
      amount: 75000,
      date: relativeDaysAgo(daysOffset + 22),
      note: 'Monthly site visit fuel allowance for field agents',
    });
  }

  return expenses;
}

export const INITIAL_EXPENSES = generateInitialExpenses();

