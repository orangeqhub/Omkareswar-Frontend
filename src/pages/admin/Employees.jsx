import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, ShieldCheck, Power, Key, Eye, EyeOff, Lock } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import EmptyState from '../../components/common/EmptyState';
import { exportSingleSheetXlsx } from '../../utils/xlsxExport';
import { ASSIGNABLE_EMPLOYEE_PERMISSIONS } from '../../config/employeePermissions';

export default function Employees() {
  const { t } = useTranslation(['dashboard', 'forms', 'common']);
  const { user: admin } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '' });
  const [permTarget, setPermTarget] = useState(null);
  const [permDraft, setPermDraft] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [pwdTarget, setPwdTarget] = useState(null);
  const [newPwd, setNewPwd] = useState('');

  function load() {
    userService.getUsers({ role: 'employee' }).then(setEmployees);
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      const cleanedPhone = form.mobile.replace(/[\s\-\+\(\)]/g, '').replace(/^91/, '');
      await userService.createEmployee(admin, { ...form, mobile: cleanedPhone });
      toast.success(t('toast.employeeAdded'));
      setForm({ name: '', mobile: '', email: '', password: '' });
      setShowForm(false);
      load();
    } catch (err) {
      console.error('Failed to create employee:', err);
      toast.error(err.message || 'Failed to add employee. Please check your inputs.');
    }
  }

  async function handleToggleStatus(emp) {
    try {
      const nextStatus = emp.status === 'inactive' ? 'approved' : 'inactive';
      await userService.setEmployeeStatus(admin, emp.id, nextStatus);
      toast.success(t('toast.assignmentUpdated'));
      load();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error(err.message || 'Failed to update employee status.');
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
      await userService.updateUser(pwdTarget.id, { password: newPwd });
      toast.success('Employee password updated successfully!');
      setPwdTarget(null);
      setNewPwd('');
      load();
    } catch (err) {
      console.error('Failed to update password:', err);
      toast.error(err.message || 'Failed to update password.');
    }
  }

  function openPermissions(emp) {
    setPermTarget(emp);
    setPermDraft(emp.permissions || []);
  }

  function togglePermission(p) {
    setPermDraft((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));
  }

  async function handleSavePermissions(e) {
    e.preventDefault();
    try {
      await userService.updatePermissions(admin, permTarget.id, permDraft);
      toast.success(t('toast.assignmentUpdated'));
      setPermTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update permissions');
    }
  }

  function handleExport() {
    if (employees.length === 0) {
      toast.info(t('toast.exportEmpty'));
      return;
    }
    exportSingleSheetXlsx('employees-export.xlsx', t('export.employees'), employees, [
      { header: 'Name', value: 'name' },
      { header: 'Mobile', value: 'mobile' },
      { header: 'Email', value: 'email' },
      { header: 'Member ID', value: 'memberId' },
      { header: 'Password', value: (row) => row.password || 'Employee@123' },
      { header: 'Status', value: 'status' },
      { header: 'Permissions', value: (row) => (row.permissions || []).join(', ') },
    ]);
    toast.success(t('toast.exportSuccess'));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-semibold text-brand-800">{t('admin.employeeManagement')}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={handleExport} className="flex items-center gap-1.5 rounded-lg border border-brand-300 px-3 py-2 text-sm font-semibold text-brand-700">
            <Download size={16} /> {t('export.exportToExcel')}
          </button>
          <button type="button" onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-warm-white">
            <Plus size={16} /> {t('admin.addEmployee')}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <input required placeholder={t('placeholders.fullName')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder={t('placeholders.mobile')} value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required type="email" placeholder={t('placeholders.email')} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required type="password" placeholder="Assign Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-warm-white sm:col-span-2 lg:col-span-4">
            {t('registration.submit', { ns: 'forms' })}
          </button>
        </form>
      )}

      {employees.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="space-y-2">
          {employees.map((emp) => (
            <div key={emp.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-800">{emp.name}</p>
                <p className="text-sm text-gray-500">{emp.mobile} &middot; {emp.email}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{emp.memberId}</span>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-mono text-gray-700">
                    <Key size={12} className="text-gray-500" />
                    <span>Password: {visiblePasswords[emp.id] ? (emp.password || 'Employee@123') : '••••••••'}</span>
                    <button type="button" onClick={() => toggleShowPassword(emp.id)} className="ml-1 text-brand-700 hover:underline text-[11px] font-sans font-medium">
                      {visiblePasswords[emp.id] ? <EyeOff size={13} className="inline" /> : <Eye size={13} className="inline" />}
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{(emp.permissions || []).length} {t('employeePermissions.assigned')}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setPwdTarget(emp)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  <Lock size={14} /> Update Password
                </button>
                <button type="button" onClick={() => openPermissions(emp)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  <ShieldCheck size={14} /> {t('employeePermissions.manage')}
                </button>
                <button type="button" onClick={() => handleToggleStatus(emp)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  <Power size={14} className={emp.status === 'inactive' ? 'text-gray-400' : 'text-green-600'} />
                  {emp.status === 'inactive' ? t('common.reactivate') : t('common.deactivate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pwdTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 py-8">
          <form onSubmit={handleUpdatePassword} className="w-full max-w-md rounded-xl bg-warm-white p-6 shadow-xl">
            <h2 className="font-semibold text-brand-800">Update Password for {pwdTarget.name}</h2>
            <p className="mt-1 text-xs text-gray-500">Employee ID: {pwdTarget.memberId}</p>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-700">New Password</label>
              <input
                required
                type="text"
                placeholder="Enter new password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setPwdTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white">Save Password</button>
            </div>
          </form>
        </div>
      )}

      {permTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 py-8">
          <form onSubmit={handleSavePermissions} className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-warm-white p-6 shadow-xl">
            <h2 className="font-semibold text-brand-800">{t('employeePermissions.title', { name: permTarget.name })}</h2>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ASSIGNABLE_EMPLOYEE_PERMISSIONS.map((p) => (
                <label key={p} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs">
                  <input type="checkbox" checked={permDraft.includes(p)} onChange={() => togglePermission(p)} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
                  {t(`permissionLabels.${p}`)}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setPermTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">{t('buttons.cancel', { ns: 'common' })}</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white">{t('buttons.save', { ns: 'common' })}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
