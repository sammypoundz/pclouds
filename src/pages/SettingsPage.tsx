// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useToast, CurrencyToggle } from '../shared';
import type { DisplayCurrency } from '../shared';

const SettingsPage = () => {
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>(
    () => (localStorage.getItem('displayCurrency') as DisplayCurrency) || 'USD'
  );
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('emailNotifications') === 'true');
  const [twoFactor, setTwoFactor] = useState(() => localStorage.getItem('twoFactor') === 'true');
  const { addToast } = useToast();

  const saveSettings = () => {
    localStorage.setItem('displayCurrency', displayCurrency);
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('twoFactor', twoFactor.toString());
    addToast('success', 'Settings saved!');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Default Currency Display</label>
          <CurrencyToggle display={displayCurrency} setDisplay={setDisplayCurrency} />
        </div>
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <div><h3 className="font-medium">Email Notifications</h3><p className="text-sm text-gray-500">Receive updates about your clusters and billing</p></div>
          <button onClick={() => setEmailNotifications(!emailNotifications)} className={`relative w-12 h-6 rounded-full transition ${emailNotifications ? 'bg-blue-600' : 'bg-gray-700'}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${emailNotifications ? 'transform translate-x-6' : ''}`} />
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <div><h3 className="font-medium">Two-Factor Authentication</h3><p className="text-sm text-gray-500">Add an extra layer of security</p></div>
          <button onClick={() => setTwoFactor(!twoFactor)} className={`relative w-12 h-6 rounded-full transition ${twoFactor ? 'bg-blue-600' : 'bg-gray-700'}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${twoFactor ? 'transform translate-x-6' : ''}`} />
          </button>
        </div>
        <button onClick={saveSettings} className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition">Save Settings</button>
      </div>
    </div>
  );
};

export default SettingsPage;