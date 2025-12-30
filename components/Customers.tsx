
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { Account, AccountType, INDIAN_STATES } from '../types';
import { Plus, Search, ShieldCheck, ShieldAlert, Edit, Trash2, X, MapPin, UserPlus } from 'lucide-react';
import { verifyGSTIN } from '../services/geminiService';

export const Customers: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useERP();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAcc, setNewAcc] = useState<Partial<Account>>({ type: AccountType.CUSTOMER, state: 'Maharashtra' });
  const [gstLoading, setGstLoading] = useState(false);
  const [gstResult, setGstResult] = useState<any>(null);

  const customers = accounts.filter(a => a.type === AccountType.CUSTOMER);

  const handleVerifyGST = async () => {
    if (!newAcc.gstin) return;
    setGstLoading(true);
    const result = await verifyGSTIN(newAcc.gstin);
    setGstResult(result);
    if (result?.isValid) {
      setNewAcc(prev => ({ ...prev, name: result.legalName || prev.name }));
    }
    setGstLoading(false);
  };

  const handleSave = () => {
    if (!newAcc.name || !newAcc.state) return alert("Customer Name and State are required");
    
    if (editingId) {
      const existing = accounts.find(a => a.id === editingId);
      if (existing) {
        updateAccount({
          ...existing,
          name: newAcc.name!,
          type: AccountType.CUSTOMER,
          openingBalance: newAcc.openingBalance || 0,
          balance: (newAcc.openingBalance || 0) + (existing.balance - existing.openingBalance),
          gstin: newAcc.gstin,
          contact: newAcc.contact,
          email: newAcc.email,
          address: newAcc.address,
          state: newAcc.state,
          creditPeriod: newAcc.creditPeriod
        });
      }
    } else {
      addAccount({
        id: Date.now().toString(),
        name: newAcc.name!,
        type: AccountType.CUSTOMER,
        openingBalance: newAcc.openingBalance || 0,
        balance: newAcc.openingBalance || 0,
        gstin: newAcc.gstin,
        contact: newAcc.contact,
        email: newAcc.email,
        address: newAcc.address,
        state: newAcc.state!,
        creditPeriod: newAcc.creditPeriod
      });
    }
    resetForm();
  };

  const handleEdit = (acc: Account) => {
    setEditingId(acc.id);
    setNewAcc(acc);
    setIsAdding(true);
    setGstResult(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this customer? All balance history will be lost.")) {
      deleteAccount(id);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewAcc({ type: AccountType.CUSTOMER, state: 'Maharashtra' });
    setGstResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customer Master</h2>
          <p className="text-sm text-slate-500">Manage your buyers and their credit limits.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 shadow-md">
            <UserPlus size={20}/> Add Customer
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-xl border-2 border-blue-100 shadow-xl space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-bold">{editingId ? 'Edit Customer' : 'New Customer Registration'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">GSTIN (Optional)</span>
              <div className="flex gap-2">
                <input 
                  type="text" value={newAcc.gstin || ''} onChange={(e) => setNewAcc({ ...newAcc, gstin: e.target.value.toUpperCase() })}
                  className="mt-1 flex-1 rounded-md border-slate-300 shadow-sm p-2 bg-slate-50"
                  placeholder="27AAACG..."
                />
                <button onClick={handleVerifyGST} disabled={gstLoading} className="mt-1 bg-slate-900 text-white px-3 py-2 rounded-md text-xs font-bold disabled:opacity-50">
                  {gstLoading ? '...' : 'VERIFY'}
                </button>
              </div>
              {gstResult && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${gstResult.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {gstResult.isValid ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>}
                  {gstResult.isValid ? `Verified: ${gstResult.legalName}` : gstResult.errorMessage}
                </p>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Legal/Business Name</span>
              <input 
                type="text" value={newAcc.name || ''} onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Billing State</span>
              <select 
                value={newAcc.state} onChange={(e) => setNewAcc({ ...newAcc, state: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50"
              >
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Opening Balance (₹)</span>
              <input type="number" value={newAcc.openingBalance || 0} onChange={(e) => setNewAcc({ ...newAcc, openingBalance: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Contact Number</span>
              <input type="text" value={newAcc.contact || ''} onChange={(e) => setNewAcc({ ...newAcc, contact: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Credit Period (Days)</span>
              <input type="number" value={newAcc.creditPeriod || 0} onChange={(e) => setNewAcc({ ...newAcc, creditPeriod: parseInt(e.target.value) })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block md:col-span-3">
              <span className="text-sm font-semibold text-slate-700">Full Billing Address</span>
              <input type="text" value={newAcc.address || ''} onChange={(e) => setNewAcc({ ...newAcc, address: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={resetForm} className="px-6 py-2 text-slate-600 font-medium">Cancel</button>
            <button onClick={handleSave} className="bg-blue-700 text-white px-8 py-2 rounded-lg font-bold">
              {editingId ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm uppercase font-semibold">
            <tr>
              <th className="p-4">Customer Name</th>
              <th className="p-4">State</th>
              <th className="p-4">GSTIN</th>
              <th className="p-4 text-right">Balance Due</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50 group transition-colors">
                <td className="p-4">
                   <div className="font-semibold text-slate-900">{acc.name}</div>
                   <div className="text-xs text-slate-500">{acc.contact || 'No Contact'}</div>
                </td>
                <td className="p-4 text-sm"><div className="flex items-center gap-1"><MapPin size={14}/> {acc.state}</div></td>
                <td className="p-4 text-sm text-slate-500 font-mono">{acc.gstin || 'N/A'}</td>
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
        {customers.length === 0 && <div className="p-12 text-center text-slate-400">No customers registered yet.</div>}
      </div>
    </div>
  );
};
