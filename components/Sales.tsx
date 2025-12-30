
import React, { useState, useMemo } from 'react';
import { useERP } from '../store/context';
import { Item, Account, Invoice, InvoiceItem } from '../types';
import { Plus, Trash2, Save, Printer, ArrowLeft, MapPin, Building2, CreditCard, Edit } from 'lucide-react';

export const Sales: React.FC = () => {
  const { items, accounts, addInvoice, updateInvoice, deleteInvoice, invoices, companySettings } = useERP();
  const [view, setView] = useState<'list' | 'create' | 'view' | 'edit'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<Partial<InvoiceItem>[]>([]);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);

  const selectedCustomer = useMemo(() => accounts.find(a => a.id === customerId), [customerId, accounts]);
  const isInterstate = selectedCustomer && selectedCustomer.state !== companySettings.state;

  const addItemRow = () => {
    setInvoiceItems([...invoiceItems, { itemId: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    const updated = [...invoiceItems];
    const row = { ...updated[index] } as any;
    
    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      if (item) {
        row.itemId = item.id;
        row.name = item.name;
        row.hsn = item.hsn;
        row.rate = item.salePrice;
        row.gstRate = item.gstRate;
      }
    } else {
      row[field] = value;
    }
    
    row.amount = (row.qty || 0) * (row.rate || 0);
    updated[index] = row;
    setInvoiceItems(updated);
  };

  const removeItemRow = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const subTotal = invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalGST = invoiceItems.reduce((sum, item) => sum + ((item.amount || 0) * (item.gstRate || 0) / 100), 0);
  
  const cgst = isInterstate ? 0 : totalGST / 2;
  const sgst = isInterstate ? 0 : totalGST / 2;
  const igst = isInterstate ? totalGST : 0;
  const total = subTotal + totalGST;

  const handleSave = () => {
    if (!selectedCustomer) return alert('Select a customer');
    if (invoiceItems.length === 0) return alert('Add at least one item');

    const invoiceData: Invoice = {
      id: editInvoiceId || Date.now().toString(),
      invoiceNo: selectedInvoice?.invoiceNo || `${companySettings.invoicePrefix}-${invoices.filter(i => i.type === 'Sales').length + 1001}`,
      date: selectedInvoice?.date || new Date().toISOString().split('T')[0],
      accountId: customerId,
      accountName: selectedCustomer.name,
      items: invoiceItems as InvoiceItem[],
      subTotal,
      cgst,
      sgst,
      igst,
      roundOff: 0,
      total,
      status: 'Unpaid',
      type: 'Sales'
    };

    if (view === 'edit') {
      updateInvoice(invoiceData);
    } else {
      addInvoice(invoiceData);
    }

    resetForm();
  };

  const resetForm = () => {
    setView('list');
    setInvoiceItems([]);
    setCustomerId('');
    setEditInvoiceId(null);
    setSelectedInvoice(null);
  };

  const handleEdit = (inv: Invoice) => {
    setEditInvoiceId(inv.id);
    setCustomerId(inv.accountId);
    setInvoiceItems([...inv.items]);
    setSelectedInvoice(inv);
    setView('edit');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Warning: Deleting this sales invoice will revert stock quantities (add back to inventory) and reduce customer outstanding balance. Do you want to continue?")) {
      deleteInvoice(id);
    }
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded"><ArrowLeft size={20}/></button>
            <h2 className="text-xl font-bold">{view === 'edit' ? 'Edit Sales Invoice' : 'New Sales Invoice'}</h2>
          </div>
          <button onClick={handleSave} className="bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 transition-all">
            <Save size={18}/> {view === 'edit' ? 'Update Invoice' : 'Save Invoice'}
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Customer</span>
              <select 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2"
              >
                <option value="">Select Customer</option>
                {accounts.filter(a => a.type === 'Customer').map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.state})</option>
                ))}
              </select>
            </label>
            {selectedCustomer && (
              <div className="text-xs text-slate-500 flex gap-4 animate-in fade-in">
                <span className="flex items-center gap-1"><MapPin size={12}/> {selectedCustomer.state}</span>
                <span className="font-bold uppercase text-blue-700">GST: {isInterstate ? 'IGST (Inter-state)' : 'CGST/SGST (Intra-state)'}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm">Invoice Details</p>
            <p className="font-bold text-lg">{view === 'edit' ? selectedInvoice?.invoiceNo : 'AUTO-GENERATE'}</p>
            <p className="text-xs text-slate-400 font-medium">{view === 'edit' ? `Dated: ${selectedInvoice?.date}` : `Date: ${new Date().toLocaleDateString('en-IN')}`}</p>
          </div>
        </div>

        <div className="p-6">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-left text-sm uppercase font-semibold">
              <tr>
                <th className="p-3 border">Item</th>
                <th className="p-3 border w-24">HSN</th>
                <th className="p-3 border w-24">Qty</th>
                <th className="p-3 border w-32">Rate</th>
                <th className="p-3 border w-20">GST%</th>
                <th className="p-3 border w-32">Amount</th>
                <th className="p-3 border w-12"></th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((row, idx) => (
                <tr key={idx} className="animate-in fade-in">
                  <td className="p-2 border">
                    <select value={row.itemId} onChange={(e) => updateItemRow(idx, 'itemId', e.target.value)} className="w-full p-1 border-none focus:ring-0">
                      <option value="">Select Item</option>
                      {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2 border text-center text-slate-500 font-mono text-xs">{row.hsn}</td>
                  <td className="p-2 border"><input type="number" value={row.qty} onChange={(e) => updateItemRow(idx, 'qty', parseFloat(e.target.value))} className="w-full p-1 border-none text-center focus:ring-0"/></td>
                  <td className="p-2 border"><input type="number" value={row.rate} onChange={(e) => updateItemRow(idx, 'rate', parseFloat(e.target.value))} className="w-full p-1 border-none text-right focus:ring-0"/></td>
                  <td className="p-2 border text-center text-slate-500 text-xs">{row.gstRate}%</td>
                  <td className="p-2 border text-right font-medium">₹{(row.amount || 0).toLocaleString()}</td>
                  <td className="p-2 border text-center"><button onClick={() => removeItemRow(idx)} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItemRow} className="mt-4 flex items-center gap-2 text-blue-700 font-semibold hover:underline"><Plus size={18}/> Add Item Line</button>
        </div>

        <div className="p-6 bg-slate-50 flex flex-col items-end gap-2">
          <div className="flex justify-between w-64 text-sm text-slate-600"><span>Sub Total:</span><span>₹{subTotal.toLocaleString()}</span></div>
          {!isInterstate ? (
            <>
              <div className="flex justify-between w-64 text-sm text-slate-600"><span>CGST:</span><span>₹{cgst.toLocaleString()}</span></div>
              <div className="flex justify-between w-64 text-sm text-slate-600"><span>SGST:</span><span>₹{sgst.toLocaleString()}</span></div>
            </>
          ) : (
            <div className="flex justify-between w-64 text-sm text-slate-600"><span>IGST:</span><span>₹{igst.toLocaleString()}</span></div>
          )}
          <div className="flex justify-between w-64 text-lg font-bold text-slate-900 border-t border-slate-300 pt-2 mt-2"><span>Net Payable:</span><span>₹{total.toLocaleString()}</span></div>
        </div>
      </div>
    );
  }

  if (view === 'view' && selectedInvoice) {
    const custAcc = accounts.find(a => a.id === selectedInvoice.accountId);
    const invoiceIsInterstate = selectedInvoice.igst > 0;
    
    return (
      <div className="max-w-4xl mx-auto bg-white p-12 shadow-2xl rounded-xl border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-blue-700 mb-2 uppercase tracking-tight">{companySettings.name}</h1>
            <p className="text-sm font-black uppercase tracking-widest text-slate-500">Tax Invoice</p>
            <p className="text-xs text-slate-500 mt-2 max-w-xs">{companySettings.address}</p>
            <div className="text-xs font-bold mt-2 space-y-1">
              <p>GSTIN: {companySettings.gstin} | State: {companySettings.state}</p>
              <p>Email: {companySettings.email} | Mob: {companySettings.contact}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-300 mb-4">Invoice</h2>
            <p className="text-sm"><span className="text-slate-500">Invoice No:</span> <span className="font-bold">{selectedInvoice.invoiceNo}</span></p>
            <p className="text-sm"><span className="text-slate-500">Date:</span> <span className="font-bold">{selectedInvoice.date}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Billed To</p>
            <p className="font-black text-xl text-slate-900">{selectedInvoice.accountName}</p>
            <p className="text-sm text-slate-600 mt-1">{custAcc?.address}</p>
            <p className="text-sm text-slate-600 font-bold mt-2">GSTIN: {custAcc?.gstin || 'Unregistered'}</p>
            <p className="text-sm text-slate-600">State: {custAcc?.state}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Place of Supply</p>
            <p className="text-sm text-slate-900 font-bold">{custAcc?.state}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold">{invoiceIsInterstate ? 'IGST (Inter-state)' : 'CGST/SGST (Intra-state)'}</p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-y-2 border-slate-900 text-left text-xs font-black uppercase tracking-widest">
              <th className="py-3 px-2">#</th>
              <th className="py-3 px-2">Description</th>
              <th className="py-3 px-2">HSN</th>
              <th className="py-3 px-2 text-right">Qty</th>
              <th className="py-3 px-2 text-right">Rate</th>
              <th className="py-3 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {selectedInvoice.items.map((it, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-4 px-2 text-sm">{idx + 1}</td>
                <td className="py-4 px-2 text-sm font-bold">{it.name}</td>
                <td className="py-4 px-2 text-sm text-slate-500 font-mono">{it.hsn}</td>
                <td className="py-4 px-2 text-sm text-right">{it.qty}</td>
                <td className="py-4 px-2 text-sm text-right">₹{it.rate.toLocaleString()}</td>
                <td className="py-4 px-2 text-sm text-right font-black">₹{it.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><CreditCard size={12}/> Bank Details</p>
              <div className="text-xs space-y-1 text-slate-600 font-medium">
                <p>Bank: <span className="font-bold">{companySettings.bankName}</span></p>
                <p>A/c No: <span className="font-bold">{companySettings.bankAccNo}</span></p>
                <p>IFSC: <span className="font-bold">{companySettings.bankIfsc}</span></p>
                <p>Branch: {companySettings.bankBranch}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</p>
              <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">{companySettings.terms}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold uppercase">Sub-Total</span><span className="font-bold">₹{selectedInvoice.subTotal.toLocaleString()}</span></div>
            {!invoiceIsInterstate ? (
              <>
                <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold uppercase text-[10px]">CGST</span><span className="font-bold">₹{selectedInvoice.cgst.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold uppercase text-[10px]">SGST</span><span className="font-bold">₹{selectedInvoice.sgst.toLocaleString()}</span></div>
              </>
            ) : (
              <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold uppercase text-[10px]">IGST</span><span className="font-bold">₹{selectedInvoice.igst.toLocaleString()}</span></div>
            )}
            <div className="flex justify-between text-2xl font-black border-t-4 border-slate-900 pt-4 mt-4"><span>TOTAL</span><span className="text-blue-700">₹{selectedInvoice.total.toLocaleString()}</span></div>
            <p className="text-[10px] text-right font-bold text-slate-400 uppercase tracking-widest italic pt-2">E. & O.E.</p>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-slate-100 flex justify-between items-center text-center">
          <div className="w-48 border-t border-slate-300 pt-2 text-[10px] font-bold text-slate-400 uppercase">Receiver's Signature</div>
          <div className="w-64">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-8">For {companySettings.name}</p>
            <div className="border-t border-slate-300 pt-2 text-[10px] font-bold text-slate-400 uppercase">Authorised Signatory</div>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-slate-200 pt-12 no-print">
          <button onClick={resetForm} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800"><ArrowLeft size={18}/> Back to List</button>
          <div className="flex gap-3">
            <button onClick={() => handleEdit(selectedInvoice)} className="bg-slate-100 text-slate-700 px-6 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200"><Edit size={18}/> Edit Invoice</button>
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200"><Printer size={18}/> Print Tax Invoice</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Sales Register</h2>
        <button onClick={() => setView('create')} className="bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 shadow-md transition-all"><Plus size={20}/> New Invoice</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm uppercase font-semibold">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Invoice No</th>
              <th className="p-4">Customer</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4">Tax Type</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.filter(i => i.type === 'Sales').map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => { setSelectedInvoice(inv); setView('view'); }}>
                <td className="p-4 text-sm">{inv.date}</td>
                <td className="p-4 font-bold text-slate-900">{inv.invoiceNo}</td>
                <td className="p-4 text-sm font-semibold">{inv.accountName}</td>
                <td className="p-4 text-right font-black text-blue-700">₹{inv.total.toLocaleString()}</td>
                <td className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">{inv.igst > 0 ? 'IGST' : 'CGST/SGST'}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(inv); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={(e) => handleDelete(inv.id, e)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.filter(i => i.type === 'Sales').length === 0 && (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <Building2 size={48} className="opacity-20"/>
            <p className="font-bold">No sales records found. Start by creating an invoice.</p>
          </div>
        )}
      </div>
    </div>
  );
};
