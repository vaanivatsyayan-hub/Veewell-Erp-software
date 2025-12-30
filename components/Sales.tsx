
import React, { useState, useMemo } from 'react';
import { useERP } from '../store/context';
import { Item, Account, Invoice, InvoiceItem } from '../types';
import { Plus, Trash2, Save, Printer, ArrowLeft, MapPin, Building2, CreditCard, Edit, Hash, Info } from 'lucide-react';

export const Sales: React.FC = () => {
  const { items, accounts, addInvoice, updateInvoice, deleteInvoice, invoices, companySettings } = useERP();
  const [view, setView] = useState<'list' | 'create' | 'view' | 'edit'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [manualInvoiceNo, setManualInvoiceNo] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<Partial<InvoiceItem>[]>([]);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);

  const selectedCustomer = useMemo(() => accounts.find(a => a.id === customerId), [customerId, accounts]);
  
  // Normalized state comparison to handle whitespace/case sensitivity
  const isInterstate = useMemo(() => {
    if (!selectedCustomer || !companySettings.state) return false;
    return selectedCustomer.state?.trim().toLowerCase() !== companySettings.state.trim().toLowerCase();
  }, [selectedCustomer, companySettings.state]);

  const addItemRow = () => {
    setInvoiceItems([...invoiceItems, { itemId: '', qty: 1, rate: 0, amount: 0, gstRate: 0, name: '', hsn: '' }]);
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
      } else {
        row.itemId = '';
        row.name = '';
        row.hsn = '';
        row.rate = 0;
        row.gstRate = 0;
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
    if (!manualInvoiceNo.trim()) return alert('Please enter an Invoice Number');
    if (!customerId) return alert('Please select a customer');
    
    const validItems = invoiceItems.filter(item => item.itemId && item.itemId !== '') as InvoiceItem[];
    if (validItems.length === 0) return alert('Please add at least one valid item');

    const invoiceData: Invoice = {
      id: editInvoiceId || Date.now().toString(),
      invoiceNo: manualInvoiceNo.trim(),
      date: selectedInvoice?.date || new Date().toISOString().split('T')[0],
      accountId: customerId,
      accountName: selectedCustomer?.name || 'Unknown Customer',
      items: validItems,
      subTotal,
      cgst,
      sgst,
      igst,
      roundOff: 0,
      total,
      status: 'Unpaid',
      type: 'Sales'
    };

    try {
      if (view === 'edit' && editInvoiceId) {
        updateInvoice(invoiceData);
      } else {
        addInvoice(invoiceData);
      }
      resetForm();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving invoice.");
    }
  };

  const resetForm = () => {
    setView('list');
    setInvoiceItems([]);
    setCustomerId('');
    setManualInvoiceNo('');
    setEditInvoiceId(null);
    setSelectedInvoice(null);
  };

  const handleEdit = (inv: Invoice) => {
    setEditInvoiceId(inv.id);
    setCustomerId(inv.accountId);
    setManualInvoiceNo(inv.invoiceNo);
    setInvoiceItems([...inv.items]);
    setSelectedInvoice(inv);
    setView('edit');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("CAUTION: Deleting this sales invoice will PERMANENTLY revert stock quantities and customer balances. Do you wish to proceed?")) {
      deleteInvoice(id);
    }
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={resetForm} className="p-2 hover:bg-slate-100 rounded"><ArrowLeft size={20}/></button>
            <h2 className="text-xl font-bold">{view === 'edit' ? 'Edit Sales Invoice' : 'New Sales Invoice'}</h2>
          </div>
          <button type="button" onClick={handleSave} className="bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 transition-all shadow-md">
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
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2 font-bold"
              >
                <option value="">Select Customer</option>
                {accounts.filter(a => a.type === 'Customer').map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.state})</option>
                ))}
              </select>
            </label>
            {selectedCustomer && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-3 animate-in slide-in-from-left-2">
                <Info size={18} className="text-blue-600 shrink-0"/>
                <div className="text-xs">
                  <p className="font-bold text-slate-800 tracking-wide uppercase">Tax Profile: {isInterstate ? 'Inter-state (IGST)' : 'Intra-state (CGST+SGST)'}</p>
                  <p className="text-slate-500 mt-0.5">Place of Supply: {selectedCustomer.state}</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4 md:text-right">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 flex items-center md:justify-end gap-1"><Hash size={14}/> Invoice Number</span>
              <input 
                type="text" 
                value={manualInvoiceNo}
                onChange={(e) => setManualInvoiceNo(e.target.value)}
                placeholder="VWL/24-25/001"
                className="mt-1 block w-full md:w-64 md:ml-auto rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2 font-black"
              />
            </label>
            <p className="text-xs text-slate-400 font-medium">Invoice Date: {new Date().toLocaleDateString('en-IN')}</p>
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
                <th className="p-3 border w-32 text-right">Amount</th>
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
                  <td className="p-2 border"><input type="number" value={row.qty} onChange={(e) => updateItemRow(idx, 'qty', parseFloat(e.target.value) || 0)} className="w-full p-1 border-none text-center focus:ring-0"/></td>
                  <td className="p-2 border"><input type="number" value={row.rate} onChange={(e) => updateItemRow(idx, 'rate', parseFloat(e.target.value) || 0)} className="w-full p-1 border-none text-right focus:ring-0"/></td>
                  <td className="p-2 border text-center text-slate-500 text-xs font-bold">{row.gstRate}%</td>
                  <td className="p-2 border text-right font-black">₹{(row.amount || 0).toLocaleString()}</td>
                  <td className="p-2 border text-center"><button type="button" onClick={() => removeItemRow(idx)} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addItemRow} className="mt-4 flex items-center gap-2 text-blue-700 font-bold hover:underline"><Plus size={18}/> Add Item Line</button>
        </div>

        <div className="p-6 bg-slate-50 flex flex-col items-end gap-2 border-t">
          <div className="flex justify-between w-64 text-sm font-medium text-slate-600"><span>Taxable Value:</span><span>₹{subTotal.toLocaleString()}</span></div>
          {!isInterstate ? (
            <>
              <div className="flex justify-between w-64 text-sm font-medium text-slate-600"><span>CGST:</span><span>₹{cgst.toLocaleString()}</span></div>
              <div className="flex justify-between w-64 text-sm font-medium text-slate-600"><span>SGST:</span><span>₹{sgst.toLocaleString()}</span></div>
            </>
          ) : (
            <div className="flex justify-between w-64 text-sm font-bold text-purple-700"><span>IGST (Output):</span><span>₹{igst.toLocaleString()}</span></div>
          )}
          <div className="flex justify-between w-64 text-xl font-black text-slate-900 border-t border-slate-300 pt-3 mt-2"><span>Total Amount:</span><span>₹{total.toLocaleString()}</span></div>
        </div>
      </div>
    );
  }

  if (view === 'view' && selectedInvoice) {
    const custAcc = accounts.find(a => a.id === selectedInvoice.accountId);
    const invoiceIsInterstate = selectedInvoice.igst > 0;
    
    return (
      <div className="max-w-4xl mx-auto bg-white p-12 shadow-2xl rounded-xl border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-blue-700 mb-2 uppercase tracking-tighter">{companySettings.name}</h1>
            <p className="text-sm font-black uppercase tracking-widest text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">Tax Invoice</p>
            <p className="text-xs text-slate-500 mt-4 max-w-sm leading-relaxed font-medium">{companySettings.address}</p>
            <div className="text-xs font-black mt-4 space-y-1.5 text-slate-700">
              <p className="flex items-center gap-2">GSTIN: <span className="text-blue-700">{companySettings.gstin}</span> | State: {companySettings.state}</p>
              <p>Email: {companySettings.email} | Mob: {companySettings.contact}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-200 mb-6">Original</h2>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400">Invoice No</p>
              <p className="text-xl font-black text-slate-900">{selectedInvoice.invoiceNo}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Dated</p>
              <p className="font-bold text-slate-800">{selectedInvoice.date}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="border-l-4 border-blue-700 pl-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Consignee (Billed To)</p>
            <p className="font-black text-2xl text-slate-900">{selectedInvoice.accountName}</p>
            <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">{custAcc?.address}</p>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-black text-slate-900">GSTIN: <span className="text-blue-700">{custAcc?.gstin || 'UNREGISTERED'}</span></p>
              <p className="text-xs font-bold text-slate-500">State: {custAcc?.state} (Place of Supply)</p>
            </div>
          </div>
          <div className="text-right bg-slate-50 p-6 rounded-xl border border-slate-100 self-start">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transaction Type</p>
            <p className="text-sm text-slate-900 font-black uppercase tracking-wider">
              {invoiceIsInterstate ? 'Inter-state Sale (IGST)' : 'Intra-state Sale (CGST/SGST)'}
            </p>
            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold">POS Code: {custAcc?.state?.substring(0,2).toUpperCase() || 'NA'}</p>
          </div>
        </div>

        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-y-4 border-slate-900 text-left text-[10px] font-black uppercase tracking-[0.1em]">
              <th className="py-4 px-2 w-12">#</th>
              <th className="py-4 px-2">Description of Goods</th>
              <th className="py-4 px-2 w-24">HSN/SAC</th>
              <th className="py-4 px-2 w-24 text-right">Quantity</th>
              <th className="py-4 px-2 w-24 text-right">Rate</th>
              <th className="py-4 px-2 w-32 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {selectedInvoice.items.map((it, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-5 px-2 text-xs font-bold text-slate-400">{idx + 1}</td>
                <td className="py-5 px-2 text-sm font-black text-slate-800">{it.name}</td>
                <td className="py-5 px-2 text-xs text-slate-500 font-mono font-bold tracking-tighter">{it.hsn}</td>
                <td className="py-5 px-2 text-sm text-right font-bold">{it.qty}</td>
                <td className="py-5 px-2 text-sm text-right font-bold">₹{it.rate.toLocaleString()}</td>
                <td className="py-5 px-2 text-sm text-right font-black">₹{it.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><CreditCard size={12}/> Bank Account for Settlement</p>
              <div className="text-xs space-y-1.5 text-slate-700 font-bold">
                <p>Bank: <span className="text-blue-700">{companySettings.bankName}</span></p>
                <p>A/c No: {companySettings.bankAccNo}</p>
                <p>IFSC: {companySettings.bankIfsc}</p>
                <p>Branch: {companySettings.bankBranch}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms & Declaration</p>
              <p className="text-[9px] text-slate-500 whitespace-pre-line leading-relaxed italic">{companySettings.terms}</p>
            </div>
          </div>
          <div className="space-y-3 bg-white p-6 rounded-xl border-2 border-slate-900 shadow-xl relative -top-6">
            <div className="flex justify-between text-xs font-bold"><span className="text-slate-500 uppercase">Taxable Value</span><span>₹{selectedInvoice.subTotal.toLocaleString()}</span></div>
            {!invoiceIsInterstate ? (
              <>
                <div className="flex justify-between text-xs font-bold"><span className="text-slate-500 uppercase">CGST</span><span>₹{selectedInvoice.cgst.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs font-bold"><span className="text-slate-500 uppercase">SGST</span><span>₹{selectedInvoice.sgst.toLocaleString()}</span></div>
              </>
            ) : (
              <div className="flex justify-between text-xs font-bold border-y border-purple-100 py-1"><span className="text-purple-700 uppercase">IGST (Inter-state)</span><span className="text-purple-900">₹{selectedInvoice.igst.toLocaleString()}</span></div>
            )}
            <div className="flex justify-between text-3xl font-black border-t-2 border-slate-200 pt-4 mt-4 text-blue-700">
              <span className="text-xs self-center text-slate-400 tracking-tighter">TOTAL PAYABLE</span>
              <span>₹{selectedInvoice.total.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-right font-bold text-slate-400 uppercase tracking-[0.2em] pt-4">Subject to {companySettings.state} Jurisdiction</p>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-slate-100 flex justify-between items-center text-center">
          <div className="w-48 border-t-2 border-slate-900 pt-2 text-[9px] font-black text-slate-900 uppercase">Receiver's Seal & Sign</div>
          <div className="w-64">
            <p className="text-[9px] font-black text-slate-900 uppercase mb-12 italic">For {companySettings.name}</p>
            <div className="border-t-2 border-slate-900 pt-2 text-[9px] font-black text-slate-900 uppercase">Authorised Signatory</div>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-slate-200 pt-12 no-print">
          <button type="button" onClick={resetForm} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-all"><ArrowLeft size={18}/> Back to Register</button>
          <div className="flex gap-4">
            <button type="button" onClick={() => handleEdit(selectedInvoice)} className="bg-slate-100 text-slate-700 px-6 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"><Edit size={18}/> Modify Entry</button>
            <button type="button" onClick={() => window.print()} className="bg-blue-700 text-white px-10 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-blue-100"><Printer size={18}/> Print Tax Invoice</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Sales Register</h2>
        <button type="button" onClick={() => setView('create')} className="bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 shadow-md transition-all font-bold"><Plus size={20}/> New Invoice</button>
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
                <td className="p-4 text-sm font-medium">{inv.date}</td>
                <td className="p-4 font-black text-slate-900">{inv.invoiceNo}</td>
                <td className="p-4 text-sm font-bold text-slate-700">{inv.accountName}</td>
                <td className="p-4 text-right font-black text-blue-700">₹{inv.total.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${inv.igst > 0 ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {inv.igst > 0 ? 'IGST (Inter)' : 'CGST/SGST'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(inv); }} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleDelete(inv.id, e)} 
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors" 
                      title="Delete"
                    >
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
