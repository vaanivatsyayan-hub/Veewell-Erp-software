
import React, { useEffect, useState } from 'react';
import { useERP } from '../store/context';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react';
import { getFinancialSummary } from '../services/geminiService';

const StatCard = ({ title, amount, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">₹{amount.toLocaleString('en-IN')}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { invoices, accounts } = useERP();
  const [insight, setInsight] = useState("Loading business insights...");

  const totalSales = invoices.filter(i => i.type === 'Sales').reduce((sum, i) => sum + i.total, 0);
  const totalPurchases = invoices.filter(i => i.type === 'Purchase').reduce((sum, i) => sum + i.total, 0);
  const cashBalance = accounts.filter(a => a.type === 'Cash' || a.type === 'Bank').reduce((sum, a) => sum + a.balance, 0);
  
  const receivables = accounts.filter(a => a.type === 'Customer').reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);
  const payables = accounts.filter(a => a.type === 'Supplier').reduce((sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);

  useEffect(() => {
    const fetchInsight = async () => {
      const summary = await getFinancialSummary({ totalSales, totalPurchases, receivables, payables });
      setInsight(summary);
    };
    fetchInsight();
  }, [totalSales, totalPurchases, receivables, payables]);

  const salesData = [
    { month: 'Apr', sales: 120000, purchase: 80000 },
    { month: 'May', sales: 150000, purchase: 95000 },
    { month: 'Jun', sales: 180000, purchase: 110000 },
    { month: 'Jul', sales: totalSales / 4, purchase: totalPurchases / 4 }, // Dynamic mock
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Welcome Back, Veewell Lifescience</h2>
          <p className="text-blue-100 max-w-2xl">{insight}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-20 -mt-20 opacity-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" amount={totalSales} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Total Purchases" amount={totalPurchases} icon={TrendingDown} color="bg-rose-500" />
        <StatCard title="Cash/Bank Balance" amount={cashBalance} icon={Wallet} color="bg-blue-600" />
        <StatCard title="Total Receivables" amount={receivables} icon={Clock} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Revenue vs Expenses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchase" name="Purchases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Customers</h3>
          <div className="space-y-4">
            {accounts.filter(a => a.type === 'Customer').slice(0, 5).map(acc => (
              <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                    {acc.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{acc.name}</p>
                    <p className="text-xs text-slate-500">{acc.gstin || 'No GSTIN'}</p>
                  </div>
                </div>
                <p className="font-bold text-emerald-600">₹{acc.balance.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
