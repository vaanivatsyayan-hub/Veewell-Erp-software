
import React, { useState } from 'react';
import { useERP } from '../store/context';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserPlus,
  Store,
  ShoppingCart, 
  Truck, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  PieChart,
  ClipboardList,
  Factory,
  BookOpen,
  Cloud,
  Building2
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
      active 
        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
        : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const Layout: React.FC<{ 
  children: React.ReactNode, 
  currentTab: string, 
  setCurrentTab: (tab: string) => void 
}> = ({ children, currentTab, setCurrentTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useERP();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col no-print`}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className={`flex items-center gap-2 overflow-hidden ${!sidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <span className="font-bold text-lg text-slate-800 whitespace-nowrap">Veewell ERP</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-100 rounded">
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={currentTab === 'dashboard'} onClick={() => setCurrentTab('dashboard')} />
          
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Masters</div>
          <SidebarItem icon={<Package size={20}/>} label="Inventory Items" active={currentTab === 'items'} onClick={() => setCurrentTab('items')} />
          <SidebarItem icon={<UserPlus size={20}/>} label="Customers" active={currentTab === 'customers'} onClick={() => setCurrentTab('customers')} />
          <SidebarItem icon={<Store size={20}/>} label="Suppliers" active={currentTab === 'suppliers'} onClick={() => setCurrentTab('suppliers')} />
          <SidebarItem icon={<BookOpen size={20}/>} label="General Ledgers" active={currentTab === 'ledgers'} onClick={() => setCurrentTab('ledgers')} />
          
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Transactions</div>
          <SidebarItem icon={<ShoppingCart size={20}/>} label="Sales Invoices" active={currentTab === 'sales'} onClick={() => setCurrentTab('sales')} />
          <SidebarItem icon={<Truck size={20}/>} label="Purchase Bills" active={currentTab === 'purchases'} onClick={() => setCurrentTab('purchases')} />
          <SidebarItem icon={<CreditCard size={20}/>} label="Payments / Receipts" active={currentTab === 'vouchers'} onClick={() => setCurrentTab('vouchers')} />
          <SidebarItem icon={<Factory size={20}/>} label="BOM / Production" active={currentTab === 'bom'} onClick={() => setCurrentTab('bom')} />
          
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">Reports</div>
          <SidebarItem icon={<PieChart size={20}/>} label="Financial Reports" active={currentTab === 'reports'} onClick={() => setCurrentTab('reports')} />
          <SidebarItem icon={<ClipboardList size={20}/>} label="GST Reports" active={currentTab === 'gst'} onClick={() => setCurrentTab('gst')} />
          
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">System</div>
          <SidebarItem icon={<Building2 size={20}/>} label="Business Profile" active={currentTab === 'settings'} onClick={() => setCurrentTab('settings')} />
          <SidebarItem icon={<Settings size={20}/>} label="Backup & Sync" active={currentTab === 'backup'} onClick={() => setCurrentTab('backup')} />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between no-print shrink-0">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">{currentTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.name}</p>
              <p className="text-xs text-slate-500 font-medium">{user?.role} • Veewell</p>
            </div>
            {user?.picture ? (
              <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200 text-blue-700 font-bold">
                {user?.name.charAt(0)}
              </div>
            )}
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
