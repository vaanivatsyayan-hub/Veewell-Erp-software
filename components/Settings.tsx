
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { INDIAN_STATES, CompanySettings } from '../types';
import { Save, Building2, MapPin, Receipt, CreditCard, Info, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { companySettings, updateCompanySettings } = useERP();
  const [form, setForm] = useState<CompanySettings>({ ...companySettings });
  const [activeTab, setActiveTab] = useState<'profile' | 'tax' | 'bank'>('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    updateCompanySettings(form);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'profile' ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Building2 size={18}/> Business Profile
          </button>
          <button 
            onClick={() => setActiveTab('tax')}
            className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'tax' ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Receipt size={18}/> Taxation & GST
          </button>
          <button 
            onClick={() => setActiveTab('bank')}
            className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'bank' ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <CreditCard size={18}/> Bank Account
          </button>
        </div>

        <div className="p-8">
          {showSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3 animate-in zoom-in-95">
              <CheckCircle2 size={20}/>
              <span className="font-bold">Company profile updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeTab === 'profile' && (
              <>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Company Name (As per GST)</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-semibold"
                    placeholder="Enter full legal name"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Billing Address</label>
                  <textarea 
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    rows={3}
                    placeholder="Shop/Office No, Street, City, ZIP"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
                    placeholder="billing@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Contact Number</label>
                  <input 
                    type="text" 
                    value={form.contact}
                    onChange={e => setForm({...form, contact: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </>
            )}

            {activeTab === 'tax' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Company GSTIN</label>
                  <input 
                    type="text" 
                    value={form.gstin}
                    onChange={e => setForm({...form, gstin: e.target.value.toUpperCase()})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-mono tracking-widest"
                    placeholder="27AABCV..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Registered State</label>
                  <select 
                    value={form.state}
                    onChange={e => setForm({...form, state: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
                  >
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Invoice Terms & Conditions</label>
                  <textarea 
                    value={form.terms}
                    onChange={e => setForm({...form, terms: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm"
                    rows={5}
                  />
                </div>
              </>
            )}

            {activeTab === 'bank' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Bank Name</label>
                  <input 
                    type="text" 
                    value={form.bankName}
                    onChange={e => setForm({...form, bankName: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
                    placeholder="SBI, HDFC, etc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Account Number</label>
                  <input 
                    type="text" 
                    value={form.bankAccNo}
                    onChange={e => setForm({...form, bankAccNo: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">IFSC Code</label>
                  <input 
                    type="text" 
                    value={form.bankIfsc}
                    onChange={e => setForm({...form, bankIfsc: e.target.value.toUpperCase()})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Branch Name</label>
                  <input 
                    type="text" 
                    value={form.bankBranch}
                    onChange={e => setForm({...form, bankBranch: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-12 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-blue-700 text-white px-10 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-blue-800 shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
              <Save size={20}/> Save Business Profile
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 text-white flex gap-6 items-center">
        <div className="p-4 bg-slate-800 rounded-2xl">
          <Info size={32} className="text-blue-400"/>
        </div>
        <div>
          <h4 className="font-black text-lg mb-1">Invoice Preview Logic</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            All changes made here are instantly applied to the print view of your Sales Invoices and Purchase Bills. 
            Ensure your GSTIN is accurate for GSTR-1 compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
