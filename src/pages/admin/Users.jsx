import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Plus, Pencil, Trash2, X, FileText, Activity, Clock, MapPin, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

import { userService } from '../../services/userService';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { toast } from '../../store/toastStore';
import { exportSingleSheetXlsx } from '../../utils/xlsxExport';
import apiClient from '../../services/apiClient';
import { toTitleCase } from '../../utils/registrationForm';
import { formatActivityDetails, useEntityMaps } from '../../utils/entityIdLabels';

const ROLES = [
  'buyer',
  'seller',
  'mediator',
];

const emptyUserForm = () => ({
  name: '',
  mobile: '',
  altMobile: '',
  email: '',
  district: '',
  city: '',
  address: '',
  role: 'buyer',
  roleDetail: '',
});

export default function Users() {
  const { t } = useTranslation([
    'dashboard',
    'common',
  ]);

  const [users, setUsers] = useState([]);
  const [mediators, setMediators] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const maps = useEntityMaps();

  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyUserForm());
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Detail State
  const [detailTarget, setDetailTarget] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setPageError('');

    try {
      const [userList, mediatorList, employeeList] =
        await Promise.all([
          userService.getUsers(
            roleFilter
              ? { role: roleFilter }
              : {}
          ),
          userService.getUsers({
            role: 'mediator',
            status: 'approved',
          }),
          userService.getUsers({
            role: 'employee',
          }),
        ]);

      setUsers(
        Array.isArray(userList)
          ? userList
          : []
      );

      setMediators(
        Array.isArray(mediatorList)
          ? mediatorList
          : []
      );

      setEmployees(
        Array.isArray(employeeList)
          ? employeeList.filter((e) => e.status !== 'rejected' && e.status !== 'inactive')
          : []
      );
    } catch (error) {
      console.error(
        'Users page load failed:',
        error
      );

      setUsers([]);
      setMediators([]);

      setPageError(
        error.message ||
          'Unable to load users'
      );
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleViewDetails(u) {
    setDetailTarget(u);
    setLoadingDetails(true);
    setDetailData(null);
    try {
      const res = await apiClient.get(`/admin/users/${u.id}/details`);
      setDetailData(res.data?.data);
    } catch (err) {
      toast.error('Failed to load user details');
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleToggleStatus(user) {
    try {
      const enabledStatus =
        user.role === 'admin' ||
        user.role === 'employee'
          ? 'active'
          : 'approved';

      const nextStatus =
        user.status === 'inactive'
          ? enabledStatus
          : 'inactive';

      await userService.setStatus(
        user.id,
        nextStatus
      );

      toast.success('User status updated successfully');
      await load();
    } catch (error) {
      console.error(
        'User status update failed:',
        error
      );
      toast.error(
        error.message ||
          'Unable to update user status'
      );
    }
  }

  async function handleAssignMediator(
    user,
    mediatorId
  ) {
    if (!mediatorId) {
      toast.info(
        'Mediator unassign API is not supported.'
      );
      return;
    }

    try {
      await userService.assignMediator(
        user.id,
        mediatorId
      );

      toast.success('Mediator assigned successfully');
      await load();
    } catch (error) {
      console.error(
        'Mediator assignment failed:',
        error
      );
      toast.error(
        error.message ||
          'Unable to assign mediator'
      );
    }
  }

  function handleOpenCreate() {
    setEditingUser(null);
    setForm(emptyUserForm());
    setShowModal(true);
  }

  function handleOpenEdit(user) {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      mobile: user.mobile || '',
      altMobile: user.altMobile || '',
      email: user.email || '',
      district: user.district || '',
      city: user.city || '',
      address: user.address || '',
      role: user.role || 'buyer',
      roleDetail: typeof user.roleDetail === 'string' ? user.roleDetail : '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (!form.name || !form.mobile) {
        toast.error('Name and Mobile number are required');
        return;
      }

      if (editingUser) {
        // Edit User
        await userService.updateUser(editingUser.id, form);
        toast.success('User updated successfully');
      } else {
        // Create User
        await userService.createUser(form);
        toast.success('User created successfully');
      }
      setShowModal(false);
      load();
    } catch (err) {
      console.error('Failed to save user:', err);
      toast.error(err.message || 'Failed to save user');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await userService.deleteUser(deleteTarget.id);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      load();
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(err.message || 'Failed to delete user');
    }
  }

  function handleExport() {
    if (users.length === 0) {
      toast.info('Export list is empty');
      return;
    }

    const sheetLabel = roleFilter
      ? `${roleFilter.toUpperCase()}s`
      : 'Users';

    exportSingleSheetXlsx(
      `${roleFilter || 'users'}-export.xlsx`,
      sheetLabel,
      users,
      [
        {
          header: 'Name',
          value: 'name',
        },
        {
          header: 'Role',
          value: 'role',
        },
        {
          header: 'Mobile',
          value: 'mobile',
        },
        {
          header: 'Email',
          value: 'email',
        },
        {
          header: 'Member ID',
          value: (row) =>
            row.memberId || '-',
        },
        {
          header: 'Status',
          value: 'status',
        },
        {
          header: 'City',
          value: 'city',
        },
        {
          header: 'District',
          value: 'district',
        },
      ]
    );

    toast.success('Export downloaded successfully');
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading users...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load users
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {pageError}
        </p>

        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label
            htmlFor="role-filter"
            className="text-sm text-gray-600"
          >
            Filter by Role
          </label>

          <select
            id="role-filter"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">
              All Roles
            </option>

            {ROLES.map((role) => (
              <option
                key={role}
                value={role}
              >
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
          >
            <Plus size={16} />
            Add User
          </button>
          
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
          >
            <Download size={16} />
            Export to Excel
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">
                  Name / Phone
                </th>

                <th className="px-4 py-3">
                  Role
                </th>

                <th className="px-4 py-3">
                  Member ID
                </th>

                <th className="px-4 py-3">
                  Location
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                {(roleFilter === 'buyer' ||
                  roleFilter === 'seller') && (
                  <th className="px-4 py-3">
                    Assigned Mediator
                  </th>
                )}

                <th className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(user)}
                      className="font-medium text-brand-700 hover:underline cursor-pointer text-left"
                    >
                      {user.name || '-'}
                    </button>

                    <p className="text-xs text-gray-500">
                      {user.mobile || '-'}
                    </p>
                  </td>

                  <td className="px-4 py-3 capitalize font-semibold text-gray-700">
                    {user.role || '-'}
                  </td>

                  <td className="px-4 py-3">
                    {user.memberId || '-'}
                  </td>

                  <td className="px-4 py-3">
                    <p className="text-gray-800">{user.city || '-'}</p>
                    <p className="text-xs text-gray-500">{user.district || '-'}</p>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      status={user.status}
                    />
                  </td>

                  {(roleFilter === 'buyer' ||
                    roleFilter === 'seller') && (
                    <td className="px-4 py-3">
                      <select
                        aria-label="Assign mediator"
                        value={
                          user.assignedMediatorId ||
                          ''
                        }
                        onChange={(event) =>
                          handleAssignMediator(
                            user,
                            event.target.value
                          )
                        }
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                      >
                        <option value="">
                          Unassigned
                        </option>

                        {mediators.map(
                          (mediator) => (
                            <option
                              key={mediator.id}
                              value={mediator.id}
                            >
                              {mediator.name}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  )}

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="rounded-lg border border-gray-300 p-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                        title="Edit Details"
                      >
                        <Pencil size={14} />
                      </button>

                      {user.status !== 'pending' &&
                        user.status !==
                          'rejected' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                user
                              )
                            }
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-medium hover:bg-gray-100 cursor-pointer"
                          >
                            {user.status ===
                            'inactive'
                              ? 'Activate'
                              : 'Deactivate'}
                          </button>
                        )}

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(user)}
                        className="rounded-lg border border-red-200 p-1.5 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE & EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">
                {editingUser ? 'Edit User Details' : 'Add New User'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Phone</label>
                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Alternative Phone</label>
                  <input
                    type="text"
                    value={form.altMobile}
                    onChange={(e) => setForm({ ...form, altMobile: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    placeholder="Enter District"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">City / Village</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Enter City/Town/Village"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none uppercase font-semibold text-gray-700"
                    disabled={!!editingUser}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Member Type Detail</label>
                  <input
                    type="text"
                    value={form.roleDetail}
                    onChange={(e) => setForm({ ...form, roleDetail: e.target.value })}
                    placeholder="e.g. Builder, Agent"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DETAILS OVERLAY */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-white rounded-l-2xl p-6 shadow-2xl overflow-y-auto h-full flex flex-col animate-slide-in">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-brand-800">{detailTarget.name}</h2>
                <p className="text-sm text-gray-500">Client Details Profile</p>
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
              <div className="flex-1 space-y-6 mt-4">
                {/* Profile Details */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><ShieldCheck size={16} /> General Info</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div>
                      <span className="text-gray-400 block text-xs uppercase">User ID / Member ID</span>
                      <span className="font-medium text-gray-700">{detailData.profile.memberId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase">Registration Date</span>
                      <span className="font-medium text-gray-700">{new Date(detailData.profile.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase">Phone</span>
                      <span className="font-medium text-gray-700">{detailData.profile.mobile}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase">Email</span>
                      <span className="font-medium text-gray-700">{detailData.profile.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase">Role</span>
                      <span className="font-semibold text-brand-700 capitalize">{detailData.profile.role} ({typeof detailData.profile.roleDetail === 'string' ? detailData.profile.roleDetail : 'General'})</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase">Status</span>
                      <span className="font-semibold text-gray-700 uppercase">{detailData.profile.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs uppercase">Assigned Employee</span>
                      <select
                        aria-label="Assign employee"
                        value={detailData.profile.assignedEmployeeId || ''}
                        onChange={async (event) => {
                          const empId = event.target.value;
                          try {
                            await userService.assignEmployee(detailData.profile.id, empId || null, 'Changed via user details panel');
                            toast.success('Employee assigned successfully');
                            const res = await apiClient.get(`/admin/users/${detailData.profile.id}/details`);
                            setDetailData(res.data?.data);
                            load();
                          } catch (err) {
                            toast.error(err.message || 'Unable to assign employee');
                          }
                        }}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs mt-1 w-full bg-white font-medium text-gray-700 focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-sm mt-3 pt-2 border-t">
                    <span className="text-gray-400 block text-xs uppercase">Address</span>
                    <span className="font-medium text-gray-700">{detailData.profile.address || 'N/A'}</span>
                  </div>
                  {detailData.profile.customFields && Object.keys(detailData.profile.customFields).length > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-2 border-t">
                      {Object.entries(detailData.profile.customFields).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-gray-400 block text-xs uppercase">{toTitleCase(k)}</span>
                          <span className="font-medium text-gray-700">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Properties */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><MapPin size={16} /> Related Properties</h3>
                  {detailData.properties.length === 0 ? (
                    <p className="text-gray-400 text-sm">No properties associated with this user</p>
                  ) : (
                    <div className="space-y-2">
                      {detailData.properties.map(p => (
                        <div key={p.id} className="border rounded-xl p-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-gray-800">{p.titleEn || p.titleTe || 'Untitled Property'}</p>
                            <p className="text-gray-500">{p.propertyCode} &middot; {p.city}, {p.district}</p>
                          </div>
                          <span className="rounded bg-brand-50 px-2 py-0.5 font-medium text-brand-700 uppercase">{p.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related Enquiries & Visits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Mail size={15} /> Related Enquiries</h3>
                    {detailData.enquiries.length === 0 ? (
                      <p className="text-gray-400 text-xs">No enquiries recorded</p>
                    ) : (
                      <div className="space-y-1.5">
                        {detailData.enquiries.map(enq => (
                          <div key={enq.id} className="border rounded-lg p-2 text-xs">
                            <span className="font-mono text-brand-700 font-semibold">{enq.enquiryCode}</span>
                            <p className="text-gray-600 truncate">{enq.message}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">Status: <span className="uppercase font-semibold">{enq.status}</span></p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Calendar size={15} /> Related Visits</h3>
                    {detailData.visits.length === 0 ? (
                      <p className="text-gray-400 text-xs">No visits scheduled</p>
                    ) : (
                      <div className="space-y-1.5">
                        {detailData.visits.map(v => (
                          <div key={v.id} className="border rounded-lg p-2 text-xs">
                            <span className="font-mono text-brand-700 font-semibold">{v.visitCode}</span>
                            <p className="text-gray-600">Date: {new Date(v.scheduledFor).toLocaleDateString()}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">Status: <span className="uppercase font-semibold">{v.status}</span></p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Change & Activity History */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-1.5"><Clock size={16} /> Activity & Profile Change History</h3>
                  {detailData.activityHistory.length === 0 ? (
                    <p className="text-gray-400 text-sm">No activity history logs found</p>
                  ) : (
                    <div className="border rounded-xl overflow-hidden bg-white">
                      <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="px-4 py-2">Date & Time</th>
                            <th className="px-4 py-2">Action / Field</th>
                            <th className="px-4 py-2">Change details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-700">
                          {detailData.activityHistory.map((log) => {
                            const isProfileChange = log.action.includes('profileChanged');
                            const isPwdChange = log.action.includes('passwordChanged');
                            
                            let actionLabel = log.action;
                            let changeDetail = '';

                            if (isProfileChange) {
                              actionLabel = `Changed: ${log.details?.field || 'profile'}`;
                              changeDetail = `${log.details?.oldValue || 'N/A'} → ${log.details?.newValue || 'N/A'}`;
                            } else if (isPwdChange) {
                              actionLabel = 'Security Update';
                              changeDetail = log.details?.message || 'Password changed';
                            } else {
                              changeDetail = formatActivityDetails(log.action, log.details, maps);
                            }

                            return (
                              <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="px-4 py-2 font-semibold text-brand-800">{actionLabel}</td>
                                <td className="px-4 py-2 max-w-xs truncate">{changeDetail}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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
            <h3 className="text-lg font-semibold text-red-700">Delete Account</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to permanently delete the user account for{' '}
              <strong className="text-gray-800">{deleteTarget.name}</strong> ({deleteTarget.mobile})? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}