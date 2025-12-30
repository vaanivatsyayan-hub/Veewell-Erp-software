
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { Account, AccountType, INDIAN_STATES } from '../types';
import { Plus, Search, ShieldCheck, ShieldAlert, Edit, Trash2, X, MapPin, BookOpen } from 'lucide-react';
import { verifyGSTIN } from '../services/geminiService';

export const Ledgers: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useERP();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAcc, setNewAcc] = useState<Partial<Account>>({ type: AccountType.CASH, state: 'Maharashtra' });

  // Filter out Customers and Suppliers for this "Internal Ledgers" view
  const internalLedgers = accounts.filter(a => 
    a.type !== AccountType.CUSTOMER && a.type !== AccountType.SUPPLIER
  );

  const handleSave = () => {
    if (!newAcc.name || !newAcc.type) return alert("Account Name and Type are required");
    
    if (editingId) {
      const existing = accounts.find(a => a.id === editingId);
      if (existing) {
        updateAccount({
          ...existing,
          name: newAcc.name!,
          type: newAcc.type!,
          openingBalance: newAcc.openingBalance || 0,
          balance: (newAcc.openingBalance || 0) + (existing.balance - existing.openingBalance),
          contact: newAcc.contact,
          email: newAcc.email,
          address: newAcc.address,
          state: newAcc.state || 'Maharashtra',
        });
      }
    } else {
      addAccount({
        id: Date.now().toString(),
        name: newAcc.name!,
        type: newAcc.type!,
        openingBalance: newAcc.openingBalance || 0,
        balance: newAcc.openingBalance || 0,
        contact: newAcc.contact,
        email: newAcc.email,
        address: newAcc.address,
        state: newAcc.state || 'Maharashtra',
      });
    }
    resetForm();
  };

  const handleEdit = (acc: Account) => {
    setEditingId(acc.id);
    setNewAcc(acc);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure? This internal ledger account is critical for accounting balance.")) {
      deleteAccount(id);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewAcc({ type: AccountType.CASH, state: 'Maharashtra' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">General Ledgers</h2>
          <p className="text-sm text-slate-500">Manage internal business accounts like Bank, Cash, and Expenses.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-slate-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-900 shadow-md">
            <Plus size={20}/> New Ledger
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-xl border-2 border-slate-100 shadow-xl space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-bold">{editingId ? 'Modify Ledger' : 'Create Internal Ledger'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Account Category</span>
              <select 
                value={newAcc.type} onChange={(e) => setNewAcc({ ...newAcc, type: e.target.value as AccountType })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50"
              >
                {Object.values(AccountType)
                  .filter(t => t !== AccountType.CUSTOMER && t !== AccountType.SUPPLIER)
                  .map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Account Name</span>
              <input type="text" value={newAcc.name || ''} onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" placeholder="e.g., Office Rent, SBI Bank" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Opening Balance (₹)</span>
              <input type="number" value={newAcc.openingBalance || 0} onChange={(e) => setNewAcc({ ...newAcc, openingBalance: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={resetForm} className="px-6 py-2 text-slate-600 font-medium">Cancel</button>
            <button onClick={handleSave} className="bg-slate-800 text-white px-8 py-2 rounded-lg font-bold">
              {editingId ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm uppercase font-semibold">
            <tr>
              <th className="p-4">Ledger Account</th>
              <th className="p-4">Type</th>
              <th className="p-4 text-right">Current Balance</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {internalLedgers.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 font-semibold text-slate-900">{acc.name}</td>
                <td className="p-4 text-sm"><span className="px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs font-bold uppercase">{acc.type}</span></td>
                <td className={`p-4 text-right font-bold ${acc.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{Math.abs(acc.balance).toLocaleString('en-IN')} {acc.balance >= 0 ? 'Dr' : 'Cr'}
                </td>
                <td className="p-4 text-center">
                   <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(acc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(acc.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 size={18} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
