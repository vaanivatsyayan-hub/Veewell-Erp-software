
import React from 'react';
import { useERP } from '../store/context';
import { AccountType } from '../types';
import { Printer, Download } from 'lucide-react';

export const Reports: React.FC = () => {
  const { accounts, invoices } = useERP();

  const totalSales = invoices.filter(i => i.type === 'Sales').reduce((sum, i) => sum + i.total, 0);
  const totalPurchases = invoices.filter(i => i.type === 'Purchase').reduce((sum, i) => sum + i.total, 0);
  
  // Simulated P&L
  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit * 0.8; // Simulated expenses impact

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-slate-800">Financial Statements</h2>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-white border border-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50">
            <Printer size={18}/> Print
          </button>
          <button className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800">
            <Download size={18}/> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Trial Balance Simplified */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black uppercase text-slate-400 mb-6 border-b pb-2 tracking-widest">Trial Balance</h3>
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase font-bold text-slate-400">
                <tr>
                  <th className="text-left pb-4">Particulars</th>
                  <th className="text-right pb-4">Debit (₹)</th>
                  <th className="text-right pb-4">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {accounts.map(acc => (
                  <tr key={acc.id}>
                    <td className="py-2 text-slate-600">{acc.name}</td>
                    <td className="py-2 text-right">{acc.balance >= 0 ? acc.balance.toLocaleString() : '-'}</td>
                    <td className="py-2 text-right">{acc.balance < 0 ? Math.abs(acc.balance).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-900 pt-4">
                <tr className="font-black text-slate-900">
                  <td className="py-4">TOTAL</td>
                  <td className="py-4 text-right">₹{accounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0).toLocaleString()}</td>
                  <td className="py-4 text-right">₹{accounts.reduce((sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0), 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* P&L Statement */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black uppercase text-slate-400 mb-6 border-b pb-2 tracking-widest">Profit & Loss</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center text-lg">
              <span className="text-slate-600">Trading Sales</span>
              <span className="font-bold text-emerald-600">₹{totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-slate-600">Cost of Goods Sold (COGS)</span>
              <span className="font-bold text-rose-600">₹{totalPurchases.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-black border-y py-4">
              <span>GROSS PROFIT</span>
              <span className={grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>₹{grossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Operating Expenses (Est.)</span>
              <span>₹{(grossProfit * 0.2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-black bg-slate-900 text-white p-4 rounded-lg mt-8">
              <span>NET PROFIT</span>
              <span>₹{netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
