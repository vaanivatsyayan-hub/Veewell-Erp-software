
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { Account, Voucher, AccountType } from '../types';
import { Plus, CreditCard, ArrowRightLeft, Save, Trash2 } from 'lucide-react';

export const Vouchers: React.FC = () => {
  const { accounts, vouchers, addVoucher } = useERP();
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<'Receipt' | 'Payment'>('Receipt');
  const [drAccountId, setDrAccountId] = useState('');
  const [crAccountId, setCrAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [narration, setNarration] = useState('');

  const handleSave = () => {
    if (!drAccountId || !crAccountId || amount <= 0) return alert("Fill all details");
    addVoucher({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      vchNo: `VCH-${vouchers.length + 101}`,
      drAccountId,
      crAccountId,
      amount,
      narration,
      type: 'Journal'
    });
    setIsAdding(false);
    setAmount(0);
    setNarration('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payments & Receipts</h2>
        <div className="flex gap-2">
          <button onClick={() => { setType('Receipt'); setIsAdding(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18}/> Receipt</button>
          <button onClick={() => { setType('Payment'); setIsAdding(true); }} className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18}/> Payment</button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-xl border-2 border-slate-200 shadow-xl space-y-6">
          <h3 className="text-lg font-bold border-b pb-2">{type} Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-semibold">{type === 'Receipt' ? 'Cash/Bank Account (Dr)' : 'Party/Expense Account (Dr)'}</span>
              <select value={drAccountId} onChange={e => setDrAccountId(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md p-2">
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bal: ₹{a.balance})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">{type === 'Receipt' ? 'Party Account (Cr)' : 'Cash/Bank Account (Cr)'}</span>
              <select value={crAccountId} onChange={e => setCrAccountId(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md p-2">
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bal: ₹{a.balance})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Amount (₹)</span>
              <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="mt-1 block w-full border-slate-300 rounded-md p-2" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Narration</span>
              <input type="text" value={narration} onChange={e => setNarration(e.target.value)} placeholder="Being amount received/paid..." className="mt-1 block w-full border-slate-300 rounded-md p-2" />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2">Cancel</button>
            <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={18}/> Post Voucher</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
            <tr>
              <th className="p-4">Vch No</th>
              <th className="p-4">Particulars</th>
              <th className="p-4">Narration</th>
              <th className="p-4 text-right">Debit</th>
              <th className="p-4 text-right">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vouchers.map(vch => (
              <tr key={vch.id}>
                <td className="p-4">
                  <p className="font-bold">{vch.vchNo}</p>
                  <p className="text-xs text-slate-400">{vch.date}</p>
                </td>
                <td className="p-4">
                  <p className="font-semibold text-blue-700">Dr {accounts.find(a => a.id === vch.drAccountId)?.name}</p>
                  <p className="font-semibold text-slate-600 pl-4">To {accounts.find(a => a.id === vch.crAccountId)?.name}</p>
                </td>
                <td className="p-4 text-sm text-slate-500 italic">{vch.narration}</td>
                <td className="p-4 text-right font-bold">₹{vch.amount.toLocaleString()}</td>
                <td className="p-4 text-right font-bold">₹{vch.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
