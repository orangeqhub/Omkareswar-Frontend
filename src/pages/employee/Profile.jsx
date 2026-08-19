import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { toast } from '../../store/toastStore';

export default function Profile() {
  const { t } = useTranslation(['dashboard', 'forms', 'common']);
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t('validation.passwordTooShort', { ns: 'forms', defaultValue: 'Password must be at least 6 characters' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('validation.passwordMismatch', { ns: 'forms', defaultValue: 'Passwords do not match' }));
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <UserCircle size={32} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">
              {user?.memberId || t('table.memberId', { ns: 'dashboard', defaultValue: 'Member ID' })}
            </p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-400">{t('table.mobile', { ns: 'dashboard', defaultValue: 'Mobile' })}</dt>
            <dd className="font-medium text-gray-800">{user?.mobile || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-400">{t('registration.email', { ns: 'forms', defaultValue: 'Email' })}</dt>
            <dd className="font-medium text-gray-800">{user?.email || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 flex items-center gap-2 font-semibold text-gray-800">
          <KeyRound size={18} className="text-brand-700" /> Change Password
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Your new password is visible to the admin panel so support can assist you.
        </p>
        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <div>
            <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-gray-700">
              Current Password *
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-gray-700">
              New Password *
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700">
              Confirm New Password *
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
