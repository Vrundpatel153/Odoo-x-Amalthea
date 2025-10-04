import { create } from 'zustand';
import { User, Session, Company } from '@/lib/types';
import { storage } from '@/lib/storage';

interface AuthState {
  currentUser: User | null;
  currentCompany: Company | null;
  session: Session | null;
  isImpersonating: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (companyName: string, adminName: string, email: string, password: string, country: string) => Promise<boolean>;
  logout: () => void;
  impersonate: (userId: string) => void;
  stopImpersonation: () => void;
  refreshUser: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  currentCompany: null,
  session: null,
  isImpersonating: false,

  login: async (email: string, password: string) => {
    const users = storage.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) return false;

    const companies = storage.getCompanies();
    const company = companies.find(c => c.id === user.companyId);
    
    if (!company) return false;

    const session: Session = {
      userId: user.id,
      companyId: user.companyId,
      createdAt: new Date().toISOString(),
    };

    storage.setCurrentSession(session);
    
    set({
      currentUser: user,
      currentCompany: company,
      session,
      isImpersonating: false,
    });

    return true;
  },

  signup: async (companyName: string, adminName: string, email: string, password: string, country: string) => {
    const companies = storage.getCompanies();
    const users = storage.getUsers();

    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return false;
    }

    // Currency mapping based on country
    const currencyMap: Record<string, string> = {
      'United States': 'USD',
      'United Kingdom': 'GBP',
      'Eurozone': 'EUR',
      'Japan': 'JPY',
      'Canada': 'CAD',
      'Australia': 'AUD',
    };

    const companyId = `company-${Date.now()}`;
    const userId = `user-${Date.now()}`;

    const newCompany: Company = {
      id: companyId,
      name: companyName,
      country,
      defaultCurrency: currencyMap[country] || 'USD',
      createdAt: new Date().toISOString(),
    };

    const newUser: User = {
      id: userId,
      companyId,
      name: adminName,
      email,
      password,
      role: 'admin',
      managerId: null,
      createdAt: new Date().toISOString(),
    };

    companies.push(newCompany);
    users.push(newUser);

    storage.setCompanies(companies);
    storage.setUsers(users);

    const session: Session = {
      userId,
      companyId,
      createdAt: new Date().toISOString(),
    };

    storage.setCurrentSession(session);

    set({
      currentUser: newUser,
      currentCompany: newCompany,
      session,
      isImpersonating: false,
    });

    return true;
  },

  logout: () => {
    storage.setCurrentSession(null);
    set({
      currentUser: null,
      currentCompany: null,
      session: null,
      isImpersonating: false,
    });
  },

  impersonate: (userId: string) => {
    const { session } = get();
    if (!session) return;

    const users = storage.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newSession: Session = {
      userId: user.id,
      companyId: user.companyId,
      originalUserId: session.userId,
      createdAt: new Date().toISOString(),
    };

    storage.setCurrentSession(newSession);

    const companies = storage.getCompanies();
    const company = companies.find(c => c.id === user.companyId);

    set({
      currentUser: user,
      currentCompany: company || null,
      session: newSession,
      isImpersonating: true,
    });
  },

  stopImpersonation: () => {
    const { session } = get();
    if (!session?.originalUserId) return;

    const users = storage.getUsers();
    const originalUser = users.find(u => u.id === session.originalUserId);
    if (!originalUser) return;

    const newSession: Session = {
      userId: originalUser.id,
      companyId: originalUser.companyId,
      createdAt: new Date().toISOString(),
    };

    storage.setCurrentSession(newSession);

    const companies = storage.getCompanies();
    const company = companies.find(c => c.id === originalUser.companyId);

    set({
      currentUser: originalUser,
      currentCompany: company || null,
      session: newSession,
      isImpersonating: false,
    });
  },

  refreshUser: () => {
    const { session } = get();
    if (!session) return;

    const users = storage.getUsers();
    const user = users.find(u => u.id === session.userId);
    
    if (user) {
      const companies = storage.getCompanies();
      const company = companies.find(c => c.id === user.companyId);
      
      set({
        currentUser: user,
        currentCompany: company || null,
      });
    }
  },
}));

// Initialize from storage
const initSession = storage.getCurrentSession();
if (initSession) {
  const users = storage.getUsers();
  const user = users.find(u => u.id === initSession.userId);
  
  if (user) {
    const companies = storage.getCompanies();
    const company = companies.find(c => c.id === user.companyId);
    
    useAuthStore.setState({
      currentUser: user,
      currentCompany: company || null,
      session: initSession,
      isImpersonating: !!initSession.originalUserId,
    });
  }
}
