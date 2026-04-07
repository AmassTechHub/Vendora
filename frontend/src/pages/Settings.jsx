import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Store, Phone, Mail, MapPin, Save, Printer, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULTS = {
  storeName: 'My Store',
  storePhone: '',
  storeEmail: '',
  storeAddress: '',
  receiptFooter: 'Thank you for your business!',
  currency: 'GH₵',
  taxRate: '0',
  lowStockDefault: '10',
  primaryColor: '#2563EB',
};

const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white transition";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vendora-settings');
    if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
  }, []);

  const save = () => {
    localStorage.setItem('vendora-settings', JSON.stringify(settings));
    setSaved(true);
    toast.success('Settings saved');
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500">Configure your store and receipt preferences</p>
      </div>

      {/* Store Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Store size={16} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Store Information</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Store Name</label>
            <input className={inputClass} placeholder="e.g. Amass Tech Hub"
              value={settings.storeName} onChange={e => set('storeName', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className={`${inputClass} pl-9`} placeholder="0244123456"
                  value={settings.storePhone} onChange={e => set('storePhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className={`${inputClass} pl-9`} placeholder="store@email.com"
                  value={settings.storeEmail} onChange={e => set('storeEmail', e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
              <textarea rows={2} className={`${inputClass} pl-9 resize-none`} placeholder="Store address"
                value={settings.storeAddress} onChange={e => set('storeAddress', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Receipt */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <Printer size={16} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Receipt Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Receipt Footer Message</label>
            <input className={inputClass} placeholder="Thank you for your business!"
              value={settings.receiptFooter} onChange={e => set('receiptFooter', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Currency Symbol</label>
              <input className={inputClass} placeholder="GH₵"
                value={settings.currency} onChange={e => set('currency', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.1" className={inputClass} placeholder="0"
                value={settings.taxRate} onChange={e => set('taxRate', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Set to 0 to disable tax</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <SettingsIcon size={16} className="text-amber-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Inventory Defaults</h3>
        </div>
        <div>
          <label className={labelClass}>Default Low Stock Threshold</label>
          <input type="number" min="0" className={inputClass} placeholder="10"
            value={settings.lowStockDefault} onChange={e => set('lowStockDefault', e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">Alert when any product falls below this quantity</p>
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Palette size={16} className="text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Receipt Preview</h3>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-700 dark:text-gray-300 border border-dashed border-gray-200 dark:border-gray-700 max-w-xs mx-auto">
          <div className="text-center mb-3">
            <p className="font-bold text-sm">{settings.storeName || 'My Store'}</p>
            {settings.storePhone && <p>{settings.storePhone}</p>}
            {settings.storeAddress && <p className="text-[10px]">{settings.storeAddress}</p>}
          </div>
          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
          <div className="space-y-1">
            <div className="flex justify-between"><span>Product A x2</span><span>{settings.currency}20.00</span></div>
            <div className="flex justify-between"><span>Product B x1</span><span>{settings.currency}15.00</span></div>
          </div>
          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
          {parseFloat(settings.taxRate) > 0 && (
            <div className="flex justify-between text-[10px]"><span>Tax ({settings.taxRate}%)</span><span>{settings.currency}{(35 * parseFloat(settings.taxRate) / 100).toFixed(2)}</span></div>
          )}
          <div className="flex justify-between font-bold"><span>TOTAL</span><span>{settings.currency}{(35 + (parseFloat(settings.taxRate || 0) / 100 * 35)).toFixed(2)}</span></div>
          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
          <p className="text-center text-[10px]">{settings.receiptFooter}</p>
        </div>
      </div>

      <button onClick={save}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm">
        <Save size={16} />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
