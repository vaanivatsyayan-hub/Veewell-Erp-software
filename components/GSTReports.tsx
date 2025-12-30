
import React from 'react';
import { useERP } from '../store/context';
import { ClipboardList, TrendingUp, Download, Printer } from 'lucide-react';

export const GSTReports: React.FC = () => {
  const { invoices } = useERP();

  const sales = invoices.filter(i => i.type === 'Sales');
  const purchases = invoices.filter(i => i.type === 'Purchase');

  const totalSalesTax = sales.reduce((sum, i) => sum + i.cgst + i.sgst + i.igst, 0);
  const totalPurchaseTax = purchases.reduce((sum, i) => sum + i.cgst + i.sgst + i.igst, 0);
  const netGstPayable = totalSalesTax - totalPurchaseTax;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">GST Compliance Dashboard</h2>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50">
            <Download size={18}/> Export GSTR-1
          </button>
          <button className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800">
            <Printer size={18}/> Print Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
          <p className="text-emerald-700 text-sm font-bold uppercase mb-1">Total Output Tax (Sales)</p>
          <h3 className="text-3xl font-black text-emerald-900">₹{totalSalesTax.toLocaleString()}</h3>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl">
          <p className="text-rose-700 text-sm font-bold uppercase mb-1">Input Tax Credit (Purchases)</p>
          <h3 className="text-3xl font-black text-rose-900">₹{totalPurchaseTax.toLocaleString()}</h3>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
          <p className="text-blue-700 text-sm font-bold uppercase mb-1">Net GST Payable / (Credit)</p>
          <h3 className="text-3xl font-black text-blue-900">₹{netGstPayable.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <ClipboardList className="text-blue-700"/> HSN-wise Sales Summary
        </h3>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
            <tr>
              <th className="p-4">HSN/SAC</th>
              <th className="p-4">Taxable Value</th>
              <th className="p-4">CGST</th>
              <th className="p-4">SGST</th>
              <th className="p-4">IGST</th>
              <th className="p-4 text-right">Total Tax</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Aggregated view logic could be added here for a real system */}
            {sales.map(inv => (
              <tr key={inv.id} className="text-sm">
                <td className="p-4 font-mono">{inv.items[0]?.hsn || 'VARIOUS'}</td>
                <td className="p-4">₹{inv.subTotal.toLocaleString()}</td>
                <td className="p-4">₹{inv.cgst.toLocaleString()}</td>
                <td className="p-4">₹{inv.sgst.toLocaleString()}</td>
                <td className="p-4">₹{inv.igst.toLocaleString()}</td>
                <td className="p-4 text-right font-bold">₹{(inv.cgst + inv.sgst + inv.igst).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
