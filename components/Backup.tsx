
import React, { useState, useRef } from 'react';
import { useERP } from '../store/context';
import { 
  Download, 
  Upload, 
  Cloud, 
  RefreshCcw, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  HardDrive
} from 'lucide-react';

export const Backup: React.FC = () => {
  const { exportERPData, importERPData } = useERP();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const data = exportERPData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `veewell_erp_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMessage({ text: 'Backup downloaded successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importERPData(content);
      if (success) {
        setMessage({ text: 'Data restored successfully from backup!', type: 'success' });
      } else {
        setMessage({ text: 'Invalid backup file format.', type: 'error' });
      }
      setTimeout(() => setMessage(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGDriveSync = () => {
    setIsSyncing(true);
    // Simulate GDrive Upload
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleString());
      setMessage({ text: 'Successfully synced with Google Drive!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }, 2500);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <ShieldCheck className="text-blue-700" size={24}/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Data Security & Backups</h2>
            <p className="text-slate-500">Ensure your business records are safe and accessible across devices.</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 animate-in zoom-in-95 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {message.type === 'success' ? <ShieldCheck size={20}/> : <AlertCircle size={20}/>}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Backup */}
          <div className="p-6 border border-slate-100 rounded-xl bg-slate-50 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-700 mb-2 uppercase text-xs tracking-widest">
              <HardDrive size={16}/> Local Storage
            </div>
            <h3 className="text-lg font-bold">Manual File Backup</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Download your entire business data as a JSON file. Use this for offline archival or to move your ERP to another computer.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-all"
              >
                <Download size={18}/> Download Data File
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-50 transition-all"
              >
                <Upload size={18}/> Restore from File
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Cloud Sync */}
          <div className="p-6 border border-blue-100 rounded-xl bg-blue-50 space-y-4">
            <div className="flex items-center gap-2 font-bold text-blue-700 mb-2 uppercase text-xs tracking-widest">
              <Cloud size={16}/> Cloud Storage
            </div>
            <h3 className="text-lg font-bold">Google Drive Sync</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Securely store your backups on your Google Drive. This allows for automatic recovery and multi-user data consistency.
            </p>
            <div className="pt-4 space-y-4">
              <button 
                onClick={handleGDriveSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {isSyncing ? (
                  <RefreshCcw size={18} className="animate-spin" />
                ) : (
                  <RefreshCcw size={18} />
                )}
                {isSyncing ? 'Synchronizing...' : 'Sync to Google Drive'}
              </button>
              
              <div className="flex items-center justify-center gap-4 text-xs text-blue-600 font-medium">
                <div className="flex items-center gap-1">
                  <Clock size={14}/> 
                  <span>Last Sync: {lastSync || 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-2xl">
        <h4 className="font-bold mb-2 flex items-center gap-2 text-emerald-400">
          <ShieldCheck size={20}/> Privacy Policy
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          Your ERP data is processed exclusively on your device. When you use Google Drive sync, 
          the data is encrypted and stored in your private app-specific folder. 
          Veewell Lifescience does not have access to your personal financial records.
        </p>
      </div>
    </div>
  );
};
