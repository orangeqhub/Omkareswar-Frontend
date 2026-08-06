import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';

import { userService } from '../../services/userService';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { toast } from '../../store/toastStore';
import { exportSingleSheetXlsx } from '../../utils/xlsxExport';

const ROLES = [
  'buyer',
  'seller',
  'mediator',
  'employee',
  'admin',
];

export default function Users() {
  const { t } = useTranslation([
    'dashboard',
    'common',
  ]);

  const [users, setUsers] = useState([]);
  const [mediators, setMediators] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setPageError('');

    try {
      const [userList, mediatorList] =
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

      toast.success(
        t('toast.userStatusUpdated', {
          ns: 'dashboard',
          status: t(
            `status.${nextStatus}`,
            {
              ns: 'common',
              defaultValue: nextStatus,
            }
          ),
        })
      );

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
        'Mediator unassign API will be added in the next step'
      );
      return;
    }

    try {
      await userService.assignMediator(
        user.id,
        mediatorId
      );

      toast.success(
        t('toast.assignmentUpdated', {
          ns: 'dashboard',
        })
      );

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

  function handleExport() {
    if (users.length === 0) {
      toast.info(
        t('toast.exportEmpty', {
          ns: 'dashboard',
        })
      );
      return;
    }

    const sheetLabel = roleFilter
      ? t(`export.${roleFilter}s`, {
          ns: 'dashboard',
          defaultValue: 'Users',
        })
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
        {
          header: 'Assigned Mediator',
          value: (row) =>
            row.assignedMediatorId || '-',
        },
      ]
    );

    toast.success(
      t('toast.exportSuccess', {
        ns: 'dashboard',
      })
    );
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
            {t('filters.role', {
              ns: 'dashboard',
            })}
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
              {t('filters.all', {
                ns: 'dashboard',
              })}
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

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white"
        >
          <Download size={16} />
          {t('export.exportToExcel', {
            ns: 'dashboard',
          })}
        </button>
      </div>

      {users.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">
                  {t('table.name', {
                    ns: 'dashboard',
                  })}
                </th>

                <th className="px-4 py-3">
                  {t('table.role', {
                    ns: 'dashboard',
                  })}
                </th>

                <th className="px-4 py-3">
                  {t('table.memberId', {
                    ns: 'dashboard',
                  })}
                </th>

                <th className="px-4 py-3">
                  {t('table.status', {
                    ns: 'dashboard',
                  })}
                </th>

                {(roleFilter === 'buyer' ||
                  roleFilter === 'seller') && (
                  <th className="px-4 py-3">
                    {t(
                      'table.assignedMediator',
                      {
                        ns: 'dashboard',
                      }
                    )}
                  </th>
                )}

                <th className="px-4 py-3">
                  {t('table.actions', {
                    ns: 'dashboard',
                  })}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {user.name || '-'}
                    </p>

                    <p className="text-xs text-gray-500">
                      {user.mobile || '-'}
                    </p>
                  </td>

                  <td className="px-4 py-3 capitalize">
                    {user.role || '-'}
                  </td>

                  <td className="px-4 py-3">
                    {user.memberId || '-'}
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

                  <td className="px-4 py-3">
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
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                        >
                          {user.status ===
                          'inactive'
                            ? 'Reactivate'
                            : 'Deactivate'}
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}