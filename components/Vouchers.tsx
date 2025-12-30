
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { Account, Voucher, AccountType } from '../types';
import { Plus, CreditCard, ArrowRightLeft, Save, Trash2, Edit, X } from 'lucide-react';

export const Vouchers: React.FC = () => {
  const { accounts, vouchers, addVoucher, updateVoucher, deleteVoucher } = useERP();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [type, setType] = useState<'Receipt' | 'Payment'>('Receipt');
  const [drAccountId, setDrAccountId] = useState('');
  const [crAccountId, setCrAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [narration, setNarration] = useState('');
  const [vchNo, setVchNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!drAccountId || !crAccountId || amount <= 0) return alert("Please fill all details and ensure amount is greater than 0");
    if (drAccountId === crAccountId) return alert("Debit and Credit accounts cannot be the same");

    const voucherData: Voucher = {
      id: editingId || Date.now().toString(),
      date,
      vchNo: vchNo || `VCH-${vouchers.length + 101}`,
      drAccountId,
      crAccountId,
      amount,
      narration,
      type: 'Journal' // Standard journal entry type for ledger posting
    };

    if (editingId) {
      updateVoucher(voucherData);
    } else {
      addVoucher(voucherData);
    }
    
    resetForm();
  };

  const handleEdit = (vch: Voucher) => {
    setEditingId(vch.id);
    setDrAccountId(vch.drAccountId);
    setCrAccountId(vch.crAccountId);
    setAmount(vch.amount);
    setNarration(vch.narration);
    setVchNo(vch.vchNo);
    setDate(vch.date);
    // Infer the UI type based on common account usage
    const drAcc = accounts.find(a => a.id === vch.drAccountId);
    if (drAcc?.type === AccountType.CASH || drAcc?.type === AccountType.BANK) {
      setType('Receipt');
    } else {
      setType('Payment');
    }
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Warning: Deleting this voucher will revert the corresponding ledger balances. Do you wish to proceed?")) {
      deleteVoucher(id);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setDrAccountId('');
    setCrAccountId('');
    setAmount(0);
    setNarration('');
    setVchNo('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const initiateAdd = (vchType: 'Receipt' | 'Payment') => {
    resetForm();
    setType(vchType);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Vouchers</h2>
          <p className="text-sm text-slate-500">Post and manage ledger adjustments, payments, and receipts.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => initiateAdd('Receipt')} 
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md font-semibold"
          >
            <Plus size={18}/> Receipt
          </button>
          <button 
            onClick={() => initiateAdd('Payment')} 
            className="bg-rose-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-all shadow-md font-semibold"
          >
            <Plus size={18}/> Payment
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-xl border-2 border-slate-200 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className={type === 'Receipt' ? 'text-emerald-600' : 'text-rose-600'} />
              {editingId ? 'Edit Voucher' : `${type} Entry`}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Voucher Date</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md p-2 bg-slate-50 shadow-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Reference No</span>
              <input type="text" value={vchNo} onChange={e => setVchNo(e.target.value)} placeholder="Auto-generated if empty" className="mt-1 block w-full border-slate-300 rounded-md p-2 bg-slate-50 shadow-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                {type === 'Receipt' ? 'Debit Account (Cash/Bank)' : 'Debit Account (Party/Expense)'}
              </span>
              <select value={drAccountId} onChange={e => setDrAccountId(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md p-2 bg-slate-50 shadow-sm font-medium">
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bal: ₹{a.balance.toLocaleString()})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                {type === 'Receipt' ? 'Credit Account (Party)' : 'Credit Account (Cash/Bank)'}
              </span>
              <select value={crAccountId} onChange={e => setCrAccountId(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md p-2 bg-slate-50 shadow-sm font-medium">
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bal: ₹{a.balance.toLocaleString()})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Amount (₹)</span>
              <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="mt-1 block w-full border-slate-300 rounded-md p-2 bg-slate-50 shadow-sm font-bold text-lg" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Narration / Remarks</span>
              <input type="text" value={narration} onChange={e => setNarration(e.target.value)} placeholder="Being amount received/paid..." className="mt-1 block w-full border-slate-300 rounded-md p-2 bg-slate-50 shadow-sm" />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={resetForm} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">Cancel</button>
            <button 
              onClick={handleSave} 
              className="bg-slate-900 text-white px-10 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg"
            >
              <Save size={18}/> {editingId ? 'Update Voucher' : 'Post Voucher'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b">Vch No / Date</th>
              <th className="p-4 border-b">Account Particulars</th>
              <th className="p-4 border-b">Narration</th>
              <th className="p-4 border-b text-right">Debit (₹)</th>
              <th className="p-4 border-b text-right">Credit (₹)</th>
              <th className="p-4 border-b text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vouchers.slice().reverse().map(vch => (
              <tr key={vch.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4">
                  <p className="font-bold text-slate-900">{vch.vchNo}</p>
                  <p className="text-xs text-slate-400 font-medium">{vch.date}</p>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <p className="font-bold text-blue-700 flex items-center gap-1">
                      <span className="w-6 text-[10px] text-slate-400 font-black">Dr</span> 
                      {accounts.find(a => a.id === vch.drAccountId)?.name}
                    </p>
                    <p className="font-bold text-slate-600 pl-6 flex items-center gap-1">
                      <span className="w-6 text-[10px] text-slate-400 font-black">To</span> 
                      {accounts.find(a => a.id === vch.crAccountId)?.name}
                    </p>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500 italic max-w-xs truncate" title={vch.narration}>
                  {vch.narration || '--'}
                </td>
                <td className="p-4 text-right font-black text-slate-900">
                  ₹{vch.amount.toLocaleString('en-IN')}
                </td>
                <td className="p-4 text-right font-black text-slate-900">
                  ₹{vch.amount.toLocaleString('en-IN')}
                </td>
                <td className="p-4 text-center no-print">
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(vch)} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                      title="Edit Voucher"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(vch.id)} 
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                      title="Delete Voucher"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vouchers.length === 0 && (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <ArrowRightLeft size={48} className="opacity-10"/>
            <p className="font-bold">No voucher entries recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
