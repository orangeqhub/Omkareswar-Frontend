import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Lock, Eye, EyeOff, Pencil, Power, Trash2, X, UserCog } from 'lucide-react';
import { userService } from '../../services/userService';
import { toast } from '../../store/toastStore';
import EmptyState from '../../components/common/EmptyState';

const emptyManagerForm = () => ({
  name: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  district: '',
  city: '',
  address: '',
});

const MANAGER_PERMISSION_OPTIONS = [
  { value: 'MANAGER_PROPERTIES_VIEW', label: 'Properties' },
  { value: 'MANAGER_ENQUIRIES_VIEW', label: 'Enquiries' },
  { value: 'MANAGER_CATEGORIES_VIEW', label: 'Categories' },
  { value: 'MANAGER_MEDIA_RULES_VIEW', label: 'Media Rules' },
  { value: 'MANAGER_CMS_VIEW', label: 'CMS Content' },
  { value: 'MANAGER_LOCATIONS_VIEW', label: 'Locations' },
  { value: 'MANAGER_PROPERTY_FIELDS_VIEW', label: 'Property Fields' },
  { value: 'MANAGER_REGISTRATION_FORMS_VIEW', label: 'Registration Forms' },
  { value: 'MANAGER_SETTINGS_VIEW', label: 'Settings' },
];

export default function Managers() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [managers, setManagers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [form, setForm] = useState(emptyManagerForm());
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [sessionPasswords, setSessionPasswords] = useState({});
  const [pwdTarget, setPwdTarget] = useState(null);
  const [newPwd, setNewPwd] = useState('');

  function load() {
    userService.getUsers({ role: 'manager' }).then(setManagers);
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingManager) {
        await userService.updateUser(editingManager.id, {
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          district: form.district,
          city: form.city,
          address: form.address,
        });
        toast.success('Manager updated successfully');
      } else {
        if (!form.password || form.password.length < 6) {
          toast.error('Password must be at least 6 characters long.');
          return;
        }
        if (form.password !== form.confirmPassword) {
          toast.error('Passwords do not match.');
          return;
        }
        const res = await userService.createManager({
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          password: form.password,
          district: form.district,
          city: form.city,
          address: form.address,
          permissions: selectedPermissions,
        });
        if (res?.temporaryPassword && res?.id) {
          setSessionPasswords((prev) => ({ ...prev, [res.id]: res.temporaryPassword }));
        }
        toast.success(t('toast.employeeAdded', { defaultValue: 'Manager added successfully' }));
      }

      setShowModal(false);
      load();
    } catch (err) {
      console.error('Failed to save manager:', err);
      toast.error(err.message || 'Failed to save manager. Please check inputs.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await userService.deleteUser(deleteTarget.id);
      toast.success('Manager deleted successfully');
      setDeleteTarget(null);
      load();
    } catch (err) {
      console.error('Failed to delete manager:', err);
      toast.error(err.message || 'Failed to delete manager');
    }
  }

  async function handleToggleStatus(mgr) {
    try {
      const nextStatus = mgr.status === 'inactive' ? 'active' : 'inactive';
      await userService.setManagerStatus(mgr.id, nextStatus);
      toast.success(t('toast.assignmentUpdated'));
      load();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error(err.message || 'Failed to update manager status.');
    }
  }

  async function handleUpdatePermission(mgr, permission, checked) {
    try {
      const next = checked
        ? [...(mgr.permissions || []), permission]
        : (mgr.permissions || []).filter((p) => p !== permission);
      await userService.updateManagerPermissions(mgr.id, next);
      toast.success('Manager permissions updated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update permissions.');
    }
  }

  function toggleShowPassword(id) {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (!newPwd || newPwd.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await userService.updateUser(pwdTarget.id, { password: newPwd });
      if (res?.temporaryPassword) {
        setSessionPasswords((prev) => ({ ...prev, [pwdTarget.id]: res.temporaryPassword }));
        setVisiblePasswords((prev) => ({ ...prev, [pwdTarget.id]: false }));
      }
      toast.success('Manager password updated successfully!');
      setPwdTarget(null);
      setNewPwd('');
      load();
    } catch (err) {
      console.error('Failed to update password:', err);
      toast.error(err.message || 'Failed to update password.');
    }
  }

  function handleOpenCreate() {
    setEditingManager(null);
    setForm(emptyManagerForm());
    setSelectedPermissions([]);
    setShowModal(true);
  }

  function handleOpenEdit(mgr) {
    setEditingManager(mgr);
    setForm({
      name: mgr.name || '',
      mobile: mgr.mobile || '',
      email: mgr.email || '',
      password: '',
      confirmPassword: '',
      district: mgr.district || '',
      city: mgr.city || '',
      address: mgr.address || '',
    });
    setSelectedPermissions(mgr.permissions || []);
    setShowModal(true);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-semibold text-brand-800">{t('admin.managerManagement', { defaultValue: 'Manager Management' })}</h1>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700"
        >
          <Plus size={16} /> {t('admin.addManager', { defaultValue: 'Add Manager' })}
        </button>
      </div>

      {managers.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="space-y-2">
          {managers.map((mgr) => (
            <div key={mgr.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between bg-white hover:shadow-sm">
              <div className="min-w-0">
                <p className="font-medium text-brand-700">{mgr.name}</p>
                <p className="text-sm text-gray-500">{mgr.mobile} &middot; {mgr.email}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{mgr.memberId || 'PENDING'}</span>
                  {(() => {
                    const pwd = sessionPasswords[mgr.id] || mgr.temporaryPassword || null;
                    return pwd ? (
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-mono text-gray-700">
                        <span>Password: {visiblePasswords[mgr.id] ? pwd : '••••••••'}</span>
                        <button type="button" onClick={() => toggleShowPassword(mgr.id)} className="ml-1 text-brand-700 hover:underline text-[11px] font-sans font-medium cursor-pointer" title="Show/hide password">
                          {visiblePasswords[mgr.id] ? <EyeOff size={13} className="inline" /> : <Eye size={13} className="inline" />}
                        </button>
                      </div>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Password visible after grant</span>
                    );
                  })()}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${mgr.status === 'active' || mgr.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mgr.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {MANAGER_PERMISSION_OPTIONS.map((opt) => {
                    const granted = (mgr.permissions || []).includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                          granted
                            ? 'border-brand-300 bg-brand-50 text-brand-700'
                            : 'border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                        title={granted ? 'Remove access' : 'Grant access'}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={granted}
                          onChange={(e) => handleUpdatePermission(mgr, opt.value, e.target.checked)}
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => handleOpenEdit(mgr)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 cursor-pointer">
                  <Pencil size={14} /> Edit
                </button>
                <button type="button" onClick={() => setPwdTarget(mgr)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 cursor-pointer">
                  <Lock size={14} /> Update Password
                </button>
                <button type="button" onClick={() => handleToggleStatus(mgr)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 cursor-pointer">
                  <Power size={14} className={mgr.status === 'inactive' ? 'text-gray-400' : 'text-green-600'} />
                  {mgr.status === 'inactive' ? t('common.reactivate') : t('common.deactivate')}
                </button>
                <button type="button" onClick={() => setDeleteTarget(mgr)} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MANAGER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">
                {editingManager ? 'Edit Manager Details' : 'Add New Manager'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Phone</label>
                <input type="tel" inputMode="numeric" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
              </div>

              {!editingManager && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
              </div>

              <div className="border-t pt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Portal Access (tabs this manager can use)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MANAGER_PERMISSION_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-brand-600"
                        checked={selectedPermissions.includes(opt.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions((prev) => [...prev, opt.value]);
                          } else {
                            setSelectedPermissions((prev) => prev.filter((p) => p !== opt.value));
                          }
                        }}
                      />
                      <UserCog size={14} className="text-brand-600" /> {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer">
                  {editingManager ? 'Save Changes' : 'Create Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pwdTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 py-8">
          <form onSubmit={handleUpdatePassword} className="w-full max-w-md rounded-xl bg-warm-white p-6 shadow-xl">
            <h2 className="font-semibold text-brand-800">Update Password for {pwdTarget.name}</h2>
            <p className="mt-1 text-xs text-gray-500">Manager ID: {pwdTarget.memberId}</p>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-700">New Password</label>
              <input required type="text" placeholder="Enter new password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setPwdTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white cursor-pointer hover:bg-brand-700">Save Password</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-red-700">Delete Manager Account</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to permanently delete the manager account for{' '}
              <strong className="text-gray-800">{deleteTarget.name}</strong> ({deleteTarget.mobile})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer">
                Delete Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}