
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { Item } from '../types';
import { Plus, Package, Edit, Trash2, Search, X } from 'lucide-react';

export const ItemMaster: React.FC = () => {
  const { items, addItem, updateItem, deleteItem } = useERP();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<Item>>({ 
    gstRate: 12, 
    unit: 'PCS', 
    stock: 0,
    purchasePrice: 0,
    salePrice: 0
  });

  const handleSave = () => {
    if (!newItem.name || !newItem.code) return alert("Name and Code are required");
    
    const itemData: Item = {
      id: editingId || Date.now().toString(),
      name: newItem.name!,
      code: newItem.code!,
      hsn: newItem.hsn || '',
      gstRate: newItem.gstRate || 0,
      unit: newItem.unit || 'PCS',
      purchasePrice: newItem.purchasePrice || 0,
      salePrice: newItem.salePrice || 0,
      stock: newItem.stock || 0
    };

    if (editingId) {
      updateItem(itemData);
    } else {
      addItem(itemData);
    }

    resetForm();
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setNewItem(item);
    setIsAdding(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item? This will remove the item from current stock records.")) {
      deleteItem(id);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewItem({ gstRate: 12, unit: 'PCS', stock: 0, purchasePrice: 0, salePrice: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Items</h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 shadow-md">
            <Plus size={20}/> Add New Item
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-xl border-2 border-blue-100 shadow-xl space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-bold">{editingId ? 'Edit Inventory Item' : 'Add Inventory Item'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Item Name</span>
              <input type="text" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Item Code / SKU</span>
              <input type="text" value={newItem.code || ''} onChange={e => setNewItem({...newItem, code: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">HSN Code</span>
              <input type="text" value={newItem.hsn || ''} onChange={e => setNewItem({...newItem, hsn: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">GST Rate (%)</span>
              <select value={newItem.gstRate} onChange={e => setNewItem({...newItem, gstRate: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500">
                <option value="0">0% (Exempt)</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Purchase Price (₹)</span>
              <input type="number" value={newItem.purchasePrice} onChange={e => setNewItem({...newItem, purchasePrice: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Sale Price (₹)</span>
              <input type="number" value={newItem.salePrice} onChange={e => setNewItem({...newItem, salePrice: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Opening Stock</span>
              <input type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Unit</span>
              <select value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500">
                <option value="PCS">Pieces (PCS)</option>
                <option value="BOX">Box</option>
                <option value="KG">Kilogram (KG)</option>
                <option value="ML">Milliliter (ML)</option>
                <option value="MTR">Meter (MTR)</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={resetForm} className="px-6 py-2 text-slate-600 font-medium">Cancel</button>
            <button onClick={handleSave} className="bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all">
              {editingId ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase">
            <tr>
              <th className="p-4">Item Name</th>
              <th className="p-4">HSN</th>
              <th className="p-4">GST</th>
              <th className="p-4 text-right">Purchase ₹</th>
              <th className="p-4 text-right">Sale ₹</th>
              <th className="p-4 text-right">Current Stock</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors"><Package size={16} className="text-slate-500 group-hover:text-blue-600"/></div>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{item.code}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm font-mono text-slate-500">{item.hsn || '---'}</td>
                <td className="p-4 text-sm font-semibold">{item.gstRate}%</td>
                <td className="p-4 text-right text-slate-600">₹{item.purchasePrice.toLocaleString()}</td>
                <td className="p-4 text-right font-bold text-blue-700">₹{item.salePrice.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <span className={`font-bold inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${item.stock < 10 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {item.stock} {item.unit}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(item.id, e)} 
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
        {items.length === 0 && (
          <div className="p-12 text-center text-slate-400">
             <Package size={48} className="mx-auto mb-4 opacity-20" />
             <p className="font-medium">No items in inventory. Click "Add New Item" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
};
