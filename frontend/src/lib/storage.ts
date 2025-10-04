import { 
  Company, 
  User, 
  Session, 
  Expense, 
  Receipt, 
  ApprovalRule, 
  ApprovalAction, 
  ExchangeRate,
  SeedData 
} from './types';

const STORAGE_KEYS = {
  COMPANIES: 'ems_companies',
  USERS: 'ems_users',
  SESSIONS: 'ems_sessions',
  CURRENT_SESSION: 'ems_currentSession',
  EXPENSES: 'ems_expenses',
  RECEIPTS: 'ems_receipts',
  APPROVAL_RULES: 'ems_approvalRules',
  APPROVAL_ACTIONS: 'ems_approvalActions',
  EXCHANGE_RATES: 'ems_exchangeRates',
  SEED_DATA: 'ems_seedData',
} as const;

export const storage = {
  // Companies
  getCompanies: (): Company[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return data ? JSON.parse(data) : [];
  },
  
  setCompanies: (companies: Company[]) => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  },

  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  
  setUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Current session
  getCurrentSession: (): Session | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentSession: (session: Session | null) => {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  },

  // Expenses
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  
  setExpenses: (expenses: Expense[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  // Receipts
  getReceipts: (): Receipt[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    return data ? JSON.parse(data) : [];
  },
  
  setReceipts: (receipts: Receipt[]) => {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  },

  // Approval Rules
  getApprovalRules: (): ApprovalRule[] => {
    const data = localStorage.getItem(STORAGE_KEYS.APPROVAL_RULES);
    return data ? JSON.parse(data) : [];
  },
  
  setApprovalRules: (rules: ApprovalRule[]) => {
    localStorage.setItem(STORAGE_KEYS.APPROVAL_RULES, JSON.stringify(rules));
  },

  // Approval Actions
  getApprovalActions: (): ApprovalAction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.APPROVAL_ACTIONS);
    return data ? JSON.parse(data) : [];
  },
  
  setApprovalActions: (actions: ApprovalAction[]) => {
    localStorage.setItem(STORAGE_KEYS.APPROVAL_ACTIONS, JSON.stringify(actions));
  },

  // Exchange Rates
  getExchangeRates: (): ExchangeRate[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);
    return data ? JSON.parse(data) : [];
  },
  
  setExchangeRates: (rates: ExchangeRate[]) => {
    localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(rates));
  },

  // Import/Export
  exportAll: (): SeedData => {
    return {
      companies: storage.getCompanies(),
      users: storage.getUsers(),
      expenses: storage.getExpenses(),
      approvalRules: storage.getApprovalRules(),
      receipts: storage.getReceipts(),
      approvalActions: storage.getApprovalActions(),
      exchangeRates: storage.getExchangeRates(),
    };
  },

  importAll: (data: SeedData) => {
    storage.setCompanies(data.companies);
    storage.setUsers(data.users);
    storage.setExpenses(data.expenses);
    storage.setApprovalRules(data.approvalRules);
    storage.setReceipts(data.receipts);
    storage.setApprovalActions(data.approvalActions);
    storage.setExchangeRates(data.exchangeRates);
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
