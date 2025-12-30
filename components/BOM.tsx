
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { Factory, Plus, Zap, ArrowRight, Play } from 'lucide-react';

export const BOM: React.FC = () => {
  const { items, boms, addBOM, updateItemStock } = useERP();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [finishedItem, setFinishedItem] = useState('');
  const [components, setComponents] = useState<{itemId: string, qty: number}[]>([]);

  const handleProduce = (bomId: string) => {
    const bom = boms.find(b => b.id === bomId);
    if (!bom) return;
    
    // Check stock for all components first
    const canProduce = bom.components.every(c => {
      const item = items.find(i => i.id === c.itemId);
      return item && item.stock >= c.qty;
    });

    if (!canProduce) return alert("Insufficient Raw Material Stock!");

    // Consume raw materials
    bom.components.forEach(c => updateItemStock(c.itemId, -c.qty));
    // Produce finished good
    updateItemStock(bom.finishedItemId, 1);
    alert("Production Complete! Finished good added to stock.");
  };

  const handleSaveBOM = () => {
    if (!name || !finishedItem || components.length === 0) return alert("Fill all details");
    addBOM({
      id: Date.now().toString(),
      name,
      finishedItemId: finishedItem,
      components
    });
    setIsAdding(false);
    setComponents([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bill of Materials (BOM)</h2>
        <button onClick={() => setIsAdding(true)} className="bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-md">
          <Plus size={20}/> Define New BOM
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-xl border-2 border-blue-100 shadow-xl space-y-6">
          <h3 className="text-lg font-bold">BOM Definition Wizard</h3>
          <div className="grid grid-cols-2 gap-6">
            <input type="text" placeholder="BOM Name (e.g., Paracetamol Production)" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded-md" />
            <select value={finishedItem} onChange={e => setFinishedItem(e.target.value)} className="p-2 border rounded-md">
              <option value="">Select Finished Item</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-sm text-slate-500 uppercase">Ingredients / Components</p>
            {components.map((c, idx) => (
              <div key={idx} className="flex gap-4">
                <select value={c.itemId} onChange={e => {
                  const updated = [...components];
                  updated[idx].itemId = e.target.value;
                  setComponents(updated);
                }} className="flex-1 p-2 border rounded-md">
                  <option value="">Select Raw Material</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input type="number" placeholder="Qty" value={c.qty} onChange={e => {
                   const updated = [...components];
                   updated[idx].qty = parseFloat(e.target.value);
                   setComponents(updated);
                }} className="w-32 p-2 border rounded-md" />
              </div>
            ))}
            <button onClick={() => setComponents([...components, {itemId: '', qty: 0}])} className="text-blue-700 font-bold">+ Add Material</button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2">Cancel</button>
            <button onClick={handleSaveBOM} className="bg-blue-700 text-white px-8 py-2 rounded-lg font-bold">Save BOM</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boms.map(bom => (
          <div key={bom.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-4 uppercase tracking-wider text-xs">
                <Factory size={16}/> Production Rule
              </div>
              <h4 className="text-lg font-bold mb-2">{bom.name}</h4>
              <p className="text-sm text-slate-500 mb-4">Produces: <span className="text-slate-900 font-bold">{items.find(i => i.id === bom.finishedItemId)?.name}</span></p>
              <div className="space-y-1">
                {bom.components.map((c, i) => (
                  <div key={i} className="flex justify-between text-sm text-slate-600">
                    <span>{items.find(it => it.id === c.itemId)?.name}</span>
                    <span className="font-mono">{c.qty} units</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => handleProduce(bom.id)}
              className="mt-6 w-full bg-slate-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              <Play size={16}/> Start Production
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
