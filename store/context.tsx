
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Item, Account, Invoice, Voucher, BOM, AccountType, CompanySettings } from '../types';

interface User {
  name: string;
  email: string;
  picture?: string;
  role: 'Admin' | 'Staff';
}

interface ERPContextType {
  user: User | null;
  isAuthenticated: boolean;
  companySettings: CompanySettings;
  items: Item[];
  accounts: Account[];
  invoices: Invoice[];
  vouchers: Voucher[];
  boms: BOM[];
  login: (userData: User) => void;
  logout: () => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  addItem: (item: Item) => void;
  updateItemStock: (id: string, change: number) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addVoucher: (voucher: Voucher) => void;
  addBOM: (bom: BOM) => void;
  getAccountBalance: (id: string) => number;
  importERPData: (data: string) => boolean;
  exportERPData: () => string;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const STORAGE_KEY = "VEEWELL_ERP_DATA_V1";
const AUTH_KEY = "VEEWELL_AUTH_SESSION";
const SETTINGS_KEY = "VEEWELL_COMPANY_SETTINGS";

export const COMPANY_STATE = "Maharashtra";

const defaultSettings: CompanySettings = {
  name: "Veewell Lifescience",
  address: "123, Science Park, Industrial Area, Mumbai - 400001",
  email: "billing@veewell.com",
  contact: "+91 9876543210",
  gstin: "27AABCV1234D1Z5",
  state: "Maharashtra",
  bankName: "HDFC Bank Ltd",
  bankAccNo: "50200012345678",
  bankIfsc: "HDFC0001234",
  bankBranch: "Worli, Mumbai",
  invoicePrefix: "VWL",
  terms: "1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged if payment is not made within credit period.\n3. All disputes subject to Mumbai jurisdiction."
};

export const ERPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultSettings);
  const [items, setItems] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem(AUTH_KEY);
    if (savedSession) {
      setUser(JSON.parse(savedSession));
      setIsAuthenticated(true);
    }
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setCompanySettings(JSON.parse(savedSettings));
    }
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setItems(parsed.items || []);
        setAccounts(parsed.accounts || []);
        setInvoices(parsed.invoices || []);
        setVouchers(parsed.vouchers || []);
        setBoms(parsed.boms || []);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    } else {
      setItems([
        { id: 'i1', name: 'Sample Tablet', code: 'TAB001', hsn: '3004', gstRate: 12, unit: 'BOX', purchasePrice: 80, salePrice: 120, stock: 100 },
        { id: 'i2', name: 'Vitamin Syrup', code: 'SYP001', hsn: '3004', gstRate: 5, unit: 'BTL', purchasePrice: 40, salePrice: 65, stock: 50 },
      ]);
      setAccounts([
        { id: 'acc1', name: 'Cash In Hand', type: AccountType.CASH, openingBalance: 50000, balance: 50000, state: COMPANY_STATE },
        { id: 'acc2', name: 'HDFC Bank', type: AccountType.BANK, openingBalance: 250000, balance: 250000, state: COMPANY_STATE },
        { id: 'acc3', name: 'Modern Chemist', type: AccountType.CUSTOMER, gstin: '27AAACG1234A1Z1', openingBalance: 0, balance: 0, state: COMPANY_STATE, address: 'Near Main Road, Mumbai' },
        { id: 'acc4', name: 'Sunrise Pharma', type: AccountType.SUPPLIER, gstin: '07BBBCG5678B1Z2', openingBalance: 0, balance: 0, state: 'Delhi', address: 'Okhla Industrial Area' },
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const data = { items, accounts, invoices, vouchers, boms };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [items, accounts, invoices, vouchers, boms, isLoaded]);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  };

  const addItem = (item: Item) => setItems(prev => [...prev, item]);
  const updateItemStock = (id: string, change: number) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, stock: it.stock + change } : it));
  };
  const addAccount = (account: Account) => setAccounts(prev => [...prev, account]);
  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };
  const deleteAccount = (id: string) => setAccounts(prev => prev.filter(acc => acc.id !== id));

  const addInvoice = (inv: Invoice) => {
    setInvoices(prev => [...prev, inv]);
    if (inv.type === 'Sales') {
      setAccounts(prev => prev.map(acc => acc.id === inv.accountId ? { ...acc, balance: acc.balance + inv.total } : acc));
      inv.items.forEach(item => updateItemStock(item.itemId, -item.qty));
    } else if (inv.type === 'Purchase') {
      setAccounts(prev => prev.map(acc => acc.id === inv.accountId ? { ...acc, balance: acc.balance - inv.total } : acc));
      inv.items.forEach(item => updateItemStock(item.itemId, item.qty));
    }
  };

  const deleteInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    // Revert accounting impact
    if (inv.type === 'Sales') {
      setAccounts(prev => prev.map(acc => acc.id === inv.accountId ? { ...acc, balance: acc.balance - inv.total } : acc));
      inv.items.forEach(item => updateItemStock(item.itemId, item.qty));
    } else if (inv.type === 'Purchase') {
      setAccounts(prev => prev.map(acc => acc.id === inv.accountId ? { ...acc, balance: acc.balance + inv.total } : acc));
      inv.items.forEach(item => updateItemStock(item.itemId, -item.qty));
    }

    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const updateInvoice = (updatedInv: Invoice) => {
    // To handle an update safely, we delete the old version (reverting stocks/balances) 
    // and add the new version (applying new stocks/balances)
    deleteInvoice(updatedInv.id);
    addInvoice(updatedInv);
  };

  const addVoucher = (vch: Voucher) => {
    setVouchers(prev => [...prev, vch]);
    setAccounts(prev => prev.map(acc => {
      if (acc.id === vch.drAccountId) return { ...acc, balance: acc.balance + vch.amount };
      if (acc.id === vch.crAccountId) return { ...acc, balance: acc.balance - vch.amount };
      return acc;
    }));
  };
  
  const addBOM = (bom: BOM) => setBoms(prev => [...prev, bom]);
  const getAccountBalance = (id: string) => accounts.find(a => a.id === id)?.balance || 0;
  const exportERPData = () => JSON.stringify({ items, accounts, invoices, vouchers, boms, companySettings }, null, 2);
  const importERPData = (dataStr: string) => {
    try {
      const parsed = JSON.parse(dataStr);
      setItems(parsed.items || []);
      setAccounts(parsed.accounts || []);
      setInvoices(parsed.invoices || []);
      setVouchers(parsed.vouchers || []);
      setBoms(parsed.boms || []);
      if (parsed.companySettings) {
        setCompanySettings(parsed.companySettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.companySettings));
      }
      return true;
    } catch (e) { return false; }
  };

  return (
    <ERPContext.Provider value={{ 
      user, isAuthenticated, companySettings, items, accounts, invoices, vouchers, boms,
      login, logout, updateCompanySettings, addItem, updateItemStock, addAccount, updateAccount, deleteAccount, 
      addInvoice, updateInvoice, deleteInvoice, addVoucher, addBOM, getAccountBalance,
      importERPData, exportERPData
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) throw new Error('useERP must be used within ERPProvider');
  return context;
};
