import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Power, Lock, Eye, EyeOff, Pencil, Trash2, X, Calendar, FileText, Briefcase, Activity, Clock, Building2, Users, Inbox, PhoneCall } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import EmptyState from '../../components/common/EmptyState';
import { exportSingleSheetXlsx } from '../../utils/xlsxExport';
import apiClient from '../../services/apiClient';
import { registrationFormService } from '../../services/registrationFormService';
import { toTitleCase } from '../../utils/registrationForm';
import { formatActivityDetails, useEntityMaps } from '../../utils/entityIdLabels';

const emptyEmployeeForm = () => ({
  name: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  district: '',
  city: '',
  address: '',
});

const SYSTEM_FIELD_KEYS = ['name', 'firstName', 'lastName', 'mobile', 'email', 'password', 'confirmPassword', 'district', 'city', 'address', 'aadhaarCard', 'panCard', 'certificate10th', 'certificates'];

const EMPLOYEE_PERMISSION_OPTIONS = [
  { value: 'EMPLOYEE_DASHBOARD_VIEW', label: 'Dashboard view' },
  { value: 'USER_VERIFICATION_VIEW', label: 'Verifications: view' },
  { value: 'USER_VERIFICATION_RECOMMEND', label: 'Verifications: recommend' },
  { value: 'USER_VERIFICATION_CORRECTION_REQUEST', label: 'Verifications: request correction' },
  { value: 'PROPERTY_MODERATION_VIEW', label: 'Properties: view' },
  { value: 'PROPERTY_MODERATION_RECOMMEND', label: 'Properties: recommend' },
  { value: 'PROPERTY_MODERATION_CORRECTION_REQUEST', label: 'Properties: request correction' },
  { value: 'ENQUIRY_VIEW', label: 'Enquiries: view' },
  { value: 'ENQUIRY_UPDATE', label: 'Enquiries: update' },
  { value: 'CALL_NOTES_MANAGE', label: 'Call notes: manage' },
  { value: 'VISIT_VIEW', label: 'Visits: view' },
  { value: 'VISIT_UPDATE', label: 'Visits: update' },
  { value: 'FOLLOWUP_VIEW', label: 'Follow-ups: view' },
  { value: 'FOLLOWUP_MANAGE', label: 'Follow-ups: manage' },
  { value: 'NOTIFICATIONS_VIEW', label: 'Notifications: view' },
  { value: 'INTERNAL_NOTES_VIEW', label: 'Internal notes: view' },
  { value: 'INTERNAL_NOTES_MANAGE', label: 'Internal notes: manage' },
  { value: 'REPORTS_VIEW', label: 'Reports: view' },
  { value: 'VIEW_UNASSIGNED_RECORDS', label: 'View unassigned records' },
  { value: 'EMPLOYEE_MANAGE', label: 'Manage employees' },
];

export default function Employees() {
  const { t } = useTranslation(['dashboard', 'forms', 'common']);
  const { user: admin } = useAuthStore();
  const maps = useEntityMaps();
  const [employees, setEmployees] = useState([]);
  
  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(emptyEmployeeForm());
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Dynamic employee registration form config (create modal only)
  const [employeeFields, setEmployeeFields] = useState([]);
  const [formConfigLoading, setFormConfigLoading] = useState(false);
  const [fileValues, setFileValues] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [sessionPasswords, setSessionPasswords] = useState({});
  const [pwdTarget, setPwdTarget] = useState(null);
  const [newPwd, setNewPwd] = useState('');

  // Details State
  const [detailTarget, setDetailTarget] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  function load() {
    userService.getUsers({ role: 'employee' }).then(setEmployees);
  }

  useEffect(load, []);

  async function handleViewDetails(emp) {
    setDetailTarget(emp);
    setActiveDetailTab('overview');
    setLoadingDetails(true);
    setDetailData(null);
    try {
      const res = await apiClient.get(`/admin/employees/${emp.id}/details`);
      setDetailData(res.data?.data);
    } catch (err) {
      toast.error('Failed to load employee details');
    } finally {
      setLoadingDetails(false);
    }
  }

  async function uploadIdentityProof(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiClient.post('/uploads/identity-proof', fd);
    return res.data?.data?.url || res.data?.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // Edit employee details (static fields)
        await userService.updateUser(editingEmployee.id, {
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          district: form.district,
          city: form.city,
          address: form.address,
        });
        toast.success('Employee updated successfully');
      } else {
        // Add new employee - build payload from the active EMPLOYEE form config
        const activeFields = employeeFields.filter((f) => f.isActive);
        const payload = {};
        const customFields = {};
        const fileUploads = [];

        activeFields.forEach((field) => {
          const key = field.fieldKey;
          if (field.fieldType === 'file') {
            const files = fileValues[key];
            if (files && files.length) fileUploads.push({ field, files: Array.from(files) });
            return;
          }
          let value = form[key] || '';
          if (key === 'mobile') {
            value = String(value).replace(/[\s\-\+\(\)]/g, '').replace(/^91/, '');
          }
          if (SYSTEM_FIELD_KEYS.includes(key)) {
            payload[key] = value;
          } else {
            customFields[key] = value;
          }
        });

        for (const { field, files } of fileUploads) {
          try {
            const urls = [];
            for (const file of files) {
              urls.push(await uploadIdentityProof(file));
            }
            const joined = urls.join(',');
            if (SYSTEM_FIELD_KEYS.includes(field.fieldKey)) {
              payload[field.fieldKey] = joined;
            } else {
              customFields[field.fieldKey] = joined;
            }
          } catch (err) {
            toast.error(`Failed to upload ${field.label}. Please try again.`);
            return;
          }
        }

        if (Object.keys(customFields).length > 0) payload.customFields = customFields;
        payload.permissions = selectedPermissions;

        const res = await userService.createEmployee(admin, payload);
        if (res?.temporaryPassword && res?.id) {
          setSessionPasswords((prev) => ({ ...prev, [res.id]: res.temporaryPassword }));
        }
        toast.success(t('toast.employeeAdded'));
      }
      
      setShowModal(false);
      load();
    } catch (err) {
      console.error('Failed to save employee:', err);
      toast.error(err.message || 'Failed to save employee. Please check inputs.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await userService.deleteUser(deleteTarget.id);
      toast.success('Employee deleted successfully');
      setDeleteTarget(null);
      load();
    } catch (err) {
      console.error('Failed to delete employee:', err);
      toast.error(err.message || 'Failed to delete employee');
    }
  }

  async function handleToggleStatus(emp) {
    try {
      const nextStatus = emp.status === 'inactive' ? 'active' : 'inactive';
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
      const res = await userService.updateUser(pwdTarget.id, { password: newPwd });
      if (res?.temporaryPassword) {
        setSessionPasswords((prev) => ({ ...prev, [pwdTarget.id]: res.temporaryPassword }));
        setVisiblePasswords((prev) => ({ ...prev, [pwdTarget.id]: false }));
      }
      toast.success('Employee password updated successfully!');
      setPwdTarget(null);
      setNewPwd('');
      load();
    } catch (err) {
      console.error('Failed to update password:', err);
      toast.error(err.message || 'Failed to update password.');
    }
  }

  async function handleOpenCreate() {
    setEditingEmployee(null);
    setForm(emptyEmployeeForm());
    setFileValues({});
    setSelectedPermissions([]);
    setShowModal(true);
    setFormConfigLoading(true);
    try {
      const config = await registrationFormService.getForm('EMPLOYEE');
      setEmployeeFields(config.fields || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load the employee registration form');
      setEmployeeFields([]);
    } finally {
      setFormConfigLoading(false);
    }
  }

  function handleOpenEdit(emp) {
    setEditingEmployee(emp);
    setForm({
      name: emp.name || '',
      mobile: emp.mobile || '',
      email: emp.email || '',
      password: '',
      district: emp.district || '',
      city: emp.city || '',
      address: emp.address || '',
    });
    setShowModal(true);
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
      { header: 'District', value: 'district' },
      { header: 'City', value: 'city' },
      { header: 'Status', value: 'status' },
      { header: 'Permissions', value: (row) => (row.permissions || []).join(', ') },
    ]);
    toast.success(t('toast.exportSuccess'));
  }

  const getFullDocUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const host = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return path.startsWith('/') ? `${host}${path}` : `${host}/${path}`;
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-semibold text-brand-800">{t('admin.employeeManagement')}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={handleExport} className="flex items-center gap-1.5 rounded-lg border border-brand-300 px-3 py-2 text-sm font-semibold text-brand-700 cursor-pointer hover:bg-gray-50">
            <Download size={16} /> {t('export.exportToExcel')}
          </button>
          <button type="button" onClick={handleOpenCreate} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-warm-white cursor-pointer hover:bg-brand-700">
            <Plus size={16} /> {t('admin.addEmployee')}
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="space-y-2">
          {employees.map((emp) => (
            <div key={emp.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between bg-white hover:shadow-sm">
              <div>
                <button
                  type="button"
                  onClick={() => handleViewDetails(emp)}
                  className="font-medium text-brand-700 hover:underline cursor-pointer text-left"
                >
                  {emp.name}
                </button>
                <p className="text-sm text-gray-500">{emp.mobile} &middot; {emp.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Location: {emp.district || 'N/A'}, {emp.city || 'N/A'}</p>
                {emp.customFields && Object.keys(emp.customFields).length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {Object.entries(emp.customFields).map(([k, v]) => (
                      <span key={k} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {toTitleCase(k)}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{emp.memberId || 'PENDING'}</span>
                  {(() => {
                    const pwd = admin?.role === 'admin' ? sessionPasswords[emp.id] || emp.temporaryPassword || null : null;
                    return pwd ? (
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-mono text-gray-700">
                        <span>Password: {visiblePasswords[emp.id] ? pwd : '••••••••'}</span>
                        <button type="button" onClick={() => toggleShowPassword(emp.id)} className="ml-1 text-brand-700 hover:underline text-[11px] font-sans font-medium cursor-pointer" title="Show/hide password">
                          {visiblePasswords[emp.id] ? <EyeOff size={13} className="inline" /> : <Eye size={13} className="inline" />}
                        </button>
                      </div>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Password: Set by admin</span>
                    );
                  })()}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.status === 'active' || emp.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {emp.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => handleOpenEdit(emp)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 cursor-pointer">
                  <Pencil size={14} /> Edit
                </button>
                <button type="button" onClick={() => setPwdTarget(emp)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 cursor-pointer">
                  <Lock size={14} /> Update Password
                </button>
                <button type="button" onClick={() => handleToggleStatus(emp)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 cursor-pointer">
                  <Power size={14} className={emp.status === 'inactive' ? 'text-gray-400' : 'text-green-600'} />
                  {emp.status === 'inactive' ? t('common.reactivate') : t('common.deactivate')}
                </button>
                <button type="button" onClick={() => setDeleteTarget(emp)} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT EMPLOYEE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">
                {editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {editingEmployee ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Phone</label>
                    <input type="text" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
                  </div>

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
                </>
              ) : formConfigLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading registration form configuration...</div>
              ) : employeeFields.length === 0 ? (
                <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  No active employee registration fields are configured. Please configure the Employee form in the
                  Registration Forms screen first.
                </p>
              ) : (
                <>
                  {employeeFields
                    .filter((f) => f.isActive)
                    .map((field) => {
                      const key = field.fieldKey;
                      const label = field.label || toTitleCase(key);
                      const val = form[key] || '';
                      const isSystem = SYSTEM_FIELD_KEYS.includes(key);
                      const baseClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none';
                      const setVal = (v) => setForm({ ...form, [key]: v });

                      let control = null;
                      switch (field.fieldType) {
                        case 'textarea':
                          control = <textarea rows={3} value={val} onChange={(e) => setVal(e.target.value)} className={baseClass} placeholder={field.placeholder} />;
                          break;
                        case 'number':
                          control = <input type="number" value={val} onChange={(e) => setVal(e.target.value)} className={baseClass} placeholder={field.placeholder} />;
                          break;
                        case 'email':
                          control = <input type="email" value={val} onChange={(e) => setVal(e.target.value)} className={baseClass} placeholder={field.placeholder} />;
                          break;
                        case 'phone':
                          control = <input type="tel" inputMode="numeric" maxLength={10} value={val} onChange={(e) => setVal(e.target.value)} className={baseClass} placeholder={field.placeholder} />;
                          break;
                        case 'password':
                          control = <input type="password" value={val} onChange={(e) => setVal(e.target.value)} className={baseClass} placeholder={field.placeholder} />;
                          break;
                        case 'date':
                          control = <input type="date" value={val} onChange={(e) => setVal(e.target.value)} className={baseClass} />;
                          break;
                        case 'checkbox':
                          control = (
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => setVal(e.target.checked ? 'yes' : '')} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
                              {label}
                            </label>
                          );
                          break;
                        case 'select':
                          control = (
                            <select value={val} onChange={(e) => setVal(e.target.value)} className={baseClass}>
                              <option value="">{field.placeholder || 'Select an option'}</option>
                              {(field.options || []).map((opt, i) => (
                                <option key={`${key}-${i}`} value={typeof opt === 'object' ? String(opt.value) : String(opt)}>
                                  {typeof opt === 'object' ? opt.label : String(opt)}
                                </option>
                              ))}
                            </select>
                          );
                          break;
                        case 'radio':
                          control = (
                            <div className="space-y-2">
                              {(field.options || []).map((opt, i) => (
                                <label key={`${key}-${i}`} className="flex items-center gap-2 text-sm text-gray-700">
                                  <input type="radio" checked={val === String(typeof opt === 'object' ? opt.value : opt)} onChange={() => setVal(String(typeof opt === 'object' ? opt.value : opt))} className="h-4 w-4 border-gray-300 text-brand-600" />
                                  {typeof opt === 'object' ? opt.label : String(opt)}
                                </label>
                              ))}
                            </div>
                          );
                          break;
                        case 'file':
                          control = (
                            <div>
                              <input
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                onChange={(e) => setFileValues({ ...fileValues, [key]: e.target.files })}
                                className="w-full text-sm"
                              />
                              {fileValues[key] && fileValues[key].length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {Array.from(fileValues[key]).map((f) => f.name).join(', ')}
                                </p>
                              )}
                            </div>
                          );
                          break;
                        default:
                          control = <input type="text" value={val} onChange={(e) => setVal(e.target.value)} className={baseClass} placeholder={field.placeholder} />;
                      }

                      return (
                        <div key={key}>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            {label}
                            {field.isRequired && <span className="text-red-500"> *</span>}
                          </label>
                          {control}
                          {field.helpText && <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>}
                          {!isSystem && <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">Stored as additional information</p>}
                        </div>
                      );
                    })}

                  {/* Permissions */}
                  <div className="border-t pt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Permissions</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {EMPLOYEE_PERMISSION_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-start gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600"
                            checked={selectedPermissions.includes(opt.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissions((prev) => [...prev, opt.value]);
                              } else {
                                setSelectedPermissions((prev) => prev.filter((p) => p !== opt.value));
                              }
                            }}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer">
                  {editingEmployee ? 'Save Changes' : 'Create Employee'}
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
            <p className="mt-1 text-xs text-gray-500">Employee ID: {pwdTarget.memberId}</p>
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

      {/* EMPLOYEE DETAILS OVERLAY */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-white rounded-l-2xl p-6 shadow-2xl h-full flex flex-col animate-slide-in overflow-hidden">
            <div className="flex items-center justify-between border-b pb-4 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-brand-800">{detailTarget.name}</h2>
                <p className="text-sm text-gray-500">Employee Details Profile</p>
              </div>
              <button type="button" onClick={() => setDetailTarget(null)} className="rounded-full p-2 hover:bg-gray-100 text-gray-500 cursor-pointer">
                <X size={22} />
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
              </div>
            ) : detailData ? (
              <div className="flex-1 flex flex-col min-h-0 mt-4 overflow-hidden">
                {/* Tab Bar */}
                <div className="flex gap-1.5 border-b overflow-x-auto scrollbar-none pb-2 mb-4 shrink-0">
                  {['overview', 'assignments', 'clients', 'enquiries', 'followups', 'activities'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveDetailTab(tab)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all shrink-0 capitalize ${
                        activeDetailTab === tab
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-white text-gray-500 border-gray-200 hover:text-brand-600 hover:border-gray-300'
                      }`}
                    >
                      {tab === 'followups' ? 'Follow-ups' : tab}
                    </button>
                  ))}
                </div>

                {/* Tab Panel Context */}
                <div className="flex-1 overflow-auto pr-1 space-y-6">
                  {activeDetailTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Profile Data */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 border">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Briefcase size={16} /> General Info</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                          <div>
                            <span className="text-gray-400 block text-xs uppercase font-medium">Employee ID</span>
                            <span className="font-semibold text-gray-700">{detailData.profile.memberId || 'PENDING'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-xs uppercase font-medium">Registration Date</span>
                            <span className="font-semibold text-gray-700">{new Date(detailData.profile.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-xs uppercase font-medium">Phone</span>
                            <span className="font-semibold text-gray-700">{detailData.profile.mobile}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-xs uppercase font-medium">Email</span>
                            <span className="font-semibold text-gray-700">{detailData.profile.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-xs uppercase font-medium">Location</span>
                            <span className="font-semibold text-gray-700">{detailData.profile.city || 'N/A'}, {detailData.profile.district || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-xs uppercase font-medium">Status</span>
                            <span className="font-bold text-brand-700 uppercase">{detailData.profile.status}</span>
                          </div>
                        </div>
                        <div className="text-sm mt-3 pt-2 border-t">
                          <span className="text-gray-400 block text-xs uppercase font-medium">Address</span>
                          <span className="font-semibold text-gray-700">{detailData.profile.address || 'N/A'}</span>
                        </div>
                        {detailData.profile.customFields && Object.keys(detailData.profile.customFields).length > 0 && (
                          <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-2 border-t">
                            {Object.entries(detailData.profile.customFields).map(([k, v]) => (
                              <div key={k}>
                                <span className="text-gray-400 block text-xs uppercase font-medium">{toTitleCase(k)}</span>
                                <span className="font-semibold text-gray-700">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Uploaded Documents */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><FileText size={16} /> Uploaded Documents</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {detailData.profile.roleDetail?.aadhaarCard ? (
                            <a href={getFullDocUrl(detailData.profile.roleDetail.aadhaarCard)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-gray-50 text-brand-700 font-semibold text-sm">
                              <FileText size={18} className="text-red-500" /> Aadhaar Card
                            </a>
                          ) : (
                            <div className="rounded-lg border p-3 bg-gray-50 text-gray-400 text-sm">Aadhaar Card Not Uploaded</div>
                          )}
                          {detailData.profile.roleDetail?.panCard ? (
                            <a href={getFullDocUrl(detailData.profile.roleDetail.panCard)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-gray-50 text-brand-700 font-semibold text-sm">
                              <FileText size={18} className="text-blue-500" /> PAN Card
                            </a>
                          ) : (
                            <div className="rounded-lg border p-3 bg-gray-50 text-gray-400 text-sm">PAN Card Not Uploaded</div>
                          )}
                          {(() => {
                            const certs = (detailData.profile.roleDetail?.certificates || '')
                              .split(',')
                              .map((u) => u.trim())
                              .filter(Boolean);
                            if (certs.length === 0) {
                              return (
                                <div className="rounded-lg border p-3 bg-gray-50 text-gray-400 text-sm">Certificates Not Uploaded</div>
                              );
                            }
                            return certs.map((url, i) => (
                              <a key={`${url}-${i}`} href={getFullDocUrl(url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-gray-50 text-brand-700 font-semibold text-sm">
                                <FileText size={18} className="text-green-500" /> Certificate {certs.length > 1 ? i + 1 : ''}
                              </a>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Profile Change History */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Clock size={16} /> Profile Change History</h3>
                        {detailData.profileHistory.length === 0 ? (
                          <p className="text-gray-400 text-sm">No profile updates recorded</p>
                        ) : (
                          <div className="border rounded-xl overflow-hidden bg-white">
                            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                <tr>
                                  <th className="px-4 py-2">Date & Time</th>
                                  <th className="px-4 py-2">Changed Field</th>
                                  <th className="px-4 py-2">Old Value</th>
                                  <th className="px-4 py-2">New Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 text-gray-700">
                                {detailData.profileHistory.map((log) => {
                                  const isPwd = log.action.includes('password');
                                  return (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                                      <td className="px-4 py-2 font-semibold text-gray-800">{isPwd ? 'Password' : (log.details?.field || 'N/A')}</td>
                                      <td className="px-4 py-2 text-gray-500 italic max-w-xxs truncate">{String(log.details?.oldValue || 'N/A')}</td>
                                      <td className="px-4 py-2 text-gray-900 font-semibold max-w-xxs truncate">{String(log.details?.newValue || 'N/A')}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeDetailTab === 'assignments' && (
                    <div className="space-y-6">
                      {/* Properties list */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Building2 size={16} /> Properties Assigned</h3>
                        {detailData.assignedWork.properties.length === 0 ? (
                          <p className="text-gray-400 text-sm">No properties assigned</p>
                        ) : (
                          <div className="space-y-2">
                            {detailData.assignedWork.properties.map((p) => (
                              <div key={p.id} className="border rounded-xl p-3 flex justify-between items-center text-xs bg-white">
                                <div>
                                  <p className="font-semibold text-gray-800">{p.titleEn || 'Untitled Property'}</p>
                                  <p className="text-gray-500">{p.propertyCode} &middot; {p.city}</p>
                                </div>
                                <span className="rounded bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 uppercase">{p.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Visits list */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Calendar size={16} /> Scheduled Visits</h3>
                        {detailData.assignedWork.visits.length === 0 ? (
                          <p className="text-gray-400 text-sm">No visits assigned</p>
                        ) : (
                          <div className="space-y-2">
                            {detailData.assignedWork.visits.map((v) => (
                              <div key={v.id} className="border rounded-xl p-3 flex justify-between items-center text-xs bg-white">
                                <div>
                                  <p className="font-semibold text-gray-800">{v.visitCode} &middot; {v.buyerName}</p>
                                  <p className="text-gray-500">Scheduled: {new Date(v.scheduledFor).toLocaleString()}</p>
                                </div>
                                <span className="rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-700 uppercase">{v.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeDetailTab === 'clients' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Users size={16} /> Assigned Buyers & Sellers</h3>
                      {detailData.assignedWork.buyers.length === 0 && detailData.assignedWork.sellers.length === 0 && detailData.assignedWork.mediators.length === 0 ? (
                        <p className="text-gray-400 text-sm">No clients assigned</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[...detailData.assignedWork.buyers, ...detailData.assignedWork.sellers, ...detailData.assignedWork.mediators].map((c) => (
                            <div key={c.id} className="border rounded-xl p-3 bg-white space-y-1">
                              <p className="font-semibold text-gray-800">{c.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{c.role} &middot; {c.mobile}</p>
                              <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${c.status === 'active' || c.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                {c.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailTab === 'enquiries' && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Inbox size={16} /> Enquiries Assigned</h3>
                      {detailData.assignedWork.enquiries.length === 0 ? (
                        <p className="text-gray-400 text-sm">No enquiries assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {detailData.assignedWork.enquiries.map((enq) => (
                            <div key={enq.id} className="border rounded-xl p-3 bg-white space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-mono font-bold text-brand-700">{enq.enquiryCode}</span>
                                <span className="capitalize font-semibold text-gray-500">{enq.status}</span>
                              </div>
                              <p className="text-xs font-semibold text-gray-800">{enq.buyerName} ({enq.buyerPhone})</p>
                              <p className="text-xs text-gray-600 line-clamp-2">{enq.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailTab === 'followups' && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><PhoneCall size={16} /> Follow-ups Assigned</h3>
                      {detailData.assignedWork.followUps.length === 0 ? (
                        <p className="text-gray-400 text-sm">No follow-ups assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {detailData.assignedWork.followUps.map((f) => (
                            <div key={f.id} className="border rounded-xl p-3 bg-white space-y-1">
                              <p className="font-semibold text-gray-800 text-xs">{f.reason}</p>
                              <p className="text-[11px] text-gray-500">Due: {f.dueDate} {f.dueTime || ''}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${f.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {f.priority} Priority
                                </span>
                                <span className="text-[10px] font-semibold text-brand-700 uppercase">{f.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailTab === 'activities' && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Activity size={16} /> Daily Activity Log</h3>
                      {detailData.dailyActivity.length === 0 ? (
                        <p className="text-gray-400 text-sm">No activity recorded yet</p>
                      ) : (
                        <div className="border rounded-xl overflow-hidden bg-white">
                          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                              <tr>
                                <th className="px-4 py-2">Date & Time</th>
                                <th className="px-4 py-2">Activity Action</th>
                                <th className="px-4 py-2">Details</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-700">
                              {detailData.dailyActivity.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                                  <td className="px-4 py-2 font-mono text-brand-700 font-semibold">{log.action}</td>
                                  <td className="px-4 py-2 max-w-xs truncate" title={formatActivityDetails(log.action, log.details, maps)}>{formatActivityDetails(log.action, log.details, maps)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Failed to load details.</p>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-red-700">Delete Employee Account</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to permanently delete the employee account for{' '}
              <strong className="text-gray-800">{deleteTarget.name}</strong> ({deleteTarget.mobile})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer">
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
