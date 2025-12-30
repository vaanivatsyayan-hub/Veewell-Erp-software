
export enum GSTType {
  CGST_SGST = 'CGST_SGST',
  IGST = 'IGST'
}

export enum AccountType {
  CUSTOMER = 'Customer',
  SUPPLIER = 'Supplier',
  BANK = 'Bank',
  CASH = 'Cash',
  EXPENSE = 'Expense',
  EMPLOYEE = 'Employee',
  TAX = 'Tax'
}

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry"
];

export interface CompanySettings {
  name: string;
  address: string;
  email: string;
  contact: string;
  gstin: string;
  state: string;
  bankName: string;
  bankAccNo: string;
  bankIfsc: string;
  bankBranch: string;
  invoicePrefix: string;
  terms: string;
}

export interface Item {
  id: string;
  name: string;
  code: string;
  hsn: string;
  gstRate: number;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  balance: number;
  gstin?: string;
  contact?: string;
  email?: string;
  creditPeriod?: number;
  address?: string;
  state?: string;
}

export interface InvoiceItem {
  itemId: string;
  name: string;
  hsn: string;
  qty: number;
  rate: number;
  gstRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  accountId: string;
  accountName: string;
  items: InvoiceItem[];
  subTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
  type: 'Sales' | 'Purchase' | 'Proforma';
}

export interface Voucher {
  id: string;
  date: string;
  vchNo: string;
  drAccountId: string;
  crAccountId: string;
  amount: number;
  narration: string;
  type: 'Receipt' | 'Payment' | 'Journal';
}

export interface BOM {
  id: string;
  name: string;
  finishedItemId: string;
  components: {
    itemId: string;
    qty: number;
  }[];
}
