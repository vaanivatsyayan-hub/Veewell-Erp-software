
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { Item } from '../types';
import { Plus, Package, Edit, Trash2, Search } from 'lucide-react';

export const ItemMaster: React.FC = () => {
  const { items, addItem } = useERP();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Item>>({ 
    gstRate: 12, 
    unit: 'PCS', 
    stock: 0,
    purchasePrice: 0,
    salePrice: 0
  });

  const handleSave = () => {
    if (!newItem.name || !newItem.code) return alert("Name and Code are required");
    addItem({
      id: Date.now().toString(),
      name: newItem.name!,
      code: newItem.code!,
      hsn: newItem.hsn || '',
      gstRate: newItem.gstRate || 0,
      unit: newItem.unit || 'PCS',
      purchasePrice: newItem.purchasePrice || 0,
      salePrice: newItem.salePrice || 0,
      stock: newItem.stock || 0
    });
    setIsAdding(false);
    setNewItem({ gstRate: 12, unit: 'PCS', stock: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Items</h2>
        <button onClick={() => setIsAdding(true)} className="bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 shadow-md">
          <Plus size={20}/> Add New Item
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-xl border-2 border-blue-100 shadow-xl space-y-6 animate-in slide-in-from-top">
          <h3 className="text-lg font-bold border-b pb-4">Add Inventory Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Item Name</span>
              <input type="text" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Item Code / SKU</span>
              <input type="text" value={newItem.code || ''} onChange={e => setNewItem({...newItem, code: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">HSN Code</span>
              <input type="text" value={newItem.hsn || ''} onChange={e => setNewItem({...newItem, hsn: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">GST Rate (%)</span>
              <select value={newItem.gstRate} onChange={e => setNewItem({...newItem, gstRate: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50">
                <option value="0">0% (Exempt)</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Purchase Price (₹)</span>
              <input type="number" value={newItem.purchasePrice} onChange={e => setNewItem({...newItem, purchasePrice: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Sale Price (₹)</span>
              <input type="number" value={newItem.salePrice} onChange={e => setNewItem({...newItem, salePrice: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Opening Stock</span>
              <input type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Unit</span>
              <select value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50">
                <option value="PCS">Pieces (PCS)</option>
                <option value="BOX">Box</option>
                <option value="KG">Kilogram (KG)</option>
                <option value="ML">Milliliter (ML)</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-600">Cancel</button>
            <button onClick={handleSave} className="bg-blue-700 text-white px-8 py-2 rounded-lg font-bold">Save Item</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
            <tr>
              <th className="p-4">Item Name</th>
              <th className="p-4">HSN</th>
              <th className="p-4">GST</th>
              <th className="p-4 text-right">Purchase ₹</th>
              <th className="p-4 text-right">Sale ₹</th>
              <th className="p-4 text-right">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg"><Package size={16} className="text-slate-500"/></div>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.code}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm font-mono">{item.hsn}</td>
                <td className="p-4 text-sm">{item.gstRate}%</td>
                <td className="p-4 text-right">₹{item.purchasePrice.toLocaleString()}</td>
                <td className="p-4 text-right font-bold">₹{item.salePrice.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <span className={`font-bold ${item.stock < 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {item.stock} {item.unit}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
