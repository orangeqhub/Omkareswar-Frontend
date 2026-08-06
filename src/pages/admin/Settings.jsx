import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsService } from '../../services/settingsService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import { KeyRound } from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation('dashboard');
  const user = useAuthStore((s) => s.user);
  const [settings, setSettings] = useState(null);

  // Admin password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  async function handleToggle(key) {
    const updated = await settingsService.updateSettings({ [key]: !settings[key] });
    setSettings(updated);
    toast.success(t('toast.settingsUpdated'));
  }

  async function handleMaxSize(e) {
    const updated = await settingsService.updateSettings({ maxImageSizeMb: Number(e.target.value) });
    setSettings(updated);
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const adminId = user?.adminLoginId || user?.memberId || user?.mobile || 'ADMIN001';
      await authService.resetAdminPassword(adminId, newPassword);
      toast.success('Admin password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  }

  if (!settings) return null;

  return (
    <div className="max-w-lg space-y-5">
      <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
        <span className="text-sm text-gray-700">{t('settings.autoApproveRegistrations')}</span>
        <input type="checkbox" checked={settings.autoApproveRegistrations} onChange={() => handleToggle('autoApproveRegistrations')} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
      </label>
      <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
        <span className="text-sm text-gray-700">{t('settings.autoApproveProperties')}</span>
        <input type="checkbox" checked={settings.autoApproveProperties} onChange={() => handleToggle('autoApproveProperties')} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
      </label>
      <div className="rounded-xl border border-gray-200 p-4">
        <label htmlFor="max-image-size" className="mb-1.5 block text-sm text-gray-700">{t('settings.maxImageSize')}</label>
        <input id="max-image-size" type="number" min="1" max="20" value={settings.maxImageSizeMb} onChange={handleMaxSize} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {/* Change Admin Password */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={18} className="text-brand-600" />
          <h2 className="text-sm font-bold text-gray-800">Change Admin Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">New Password</label>
            <input
              type="password"
              required
              placeholder="Enter new password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={updatingPassword}
            className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 disabled:opacity-60"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
