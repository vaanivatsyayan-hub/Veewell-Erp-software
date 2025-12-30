
import React, { useState } from 'react';
import { ERPProvider, useERP } from './store/context';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Ledgers } from './components/Ledgers';
import { Customers } from './components/Customers';
import { Suppliers } from './components/Suppliers';
import { Sales } from './components/Sales';
import { Reports } from './components/Reports';
import { ItemMaster } from './components/ItemMaster';
import { Purchases } from './components/Purchases';
import { Vouchers } from './components/Vouchers';
import { BOM } from './components/BOM';
import { GSTReports } from './components/GSTReports';
import { Backup } from './components/Backup';
import { Login } from './components/Login';
import { Settings } from './components/Settings';

const AuthenticatedApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'items': return <ItemMaster />;
      case 'customers': return <Customers />;
      case 'suppliers': return <Suppliers />;
      case 'ledgers': return <Ledgers />;
      case 'sales': return <Sales />;
      case 'purchases': return <Purchases />;
      case 'vouchers': return <Vouchers />;
      case 'bom': return <BOM />;
      case 'reports': return <Reports />;
      case 'gst': return <GSTReports />;
      case 'backup': return <Backup />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
};

const AuthGate: React.FC = () => {
  const { isAuthenticated } = useERP();
  return isAuthenticated ? <AuthenticatedApp /> : <Login />;
};

const App: React.FC = () => {
  return (
    <ERPProvider>
      <AuthGate />
    </ERPProvider>
  );
};

export default App;
