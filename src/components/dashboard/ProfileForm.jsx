import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { toast } from '../../store/toastStore';

export default function ProfileForm() {
  const { t } = useTranslation(['dashboard', 'forms']);
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    altMobile: user?.altMobile || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const updated = await userService.updateUser(user.id, form);
    setUser(updated);
    setSaving(false);
    toast.success(t('toast.profileUpdated'));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-800">
        <p><strong>{t('memberId')}:</strong> {user?.memberId || '-'}</p>
        <p><strong>{t('table.mobile')}:</strong> {user?.mobile}</p>
      </div>

      <div>
        <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.fullName', { ns: 'forms' })}</label>
        <input id="profile-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.email', { ns: 'forms' })}</label>
        <input id="profile-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="profile-alt" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.altMobile', { ns: 'forms' })}</label>
        <input id="profile-alt" value={form.altMobile} onChange={(e) => setForm((f) => ({ ...f, altMobile: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="profile-address" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.address', { ns: 'forms' })}</label>
        <textarea id="profile-address" rows={2} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
      </div>
      <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-warm-white disabled:opacity-60">
        {t('buttons.save', { ns: 'common' })}
      </button>
    </form>
  );
}
