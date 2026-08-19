import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KeyRound, CheckCircle2, X } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import PortalLoginCard from '../../components/auth/PortalLoginCard';

const ERROR_KEYS = {
  INVALID_CREDENTIALS: 'portal.invalidEmployeeCredentials',
  ACCOUNT_PENDING: 'portal.employeeAccountPending',
  ACCOUNT_REJECTED: 'portal.employeeAccountRejected',
  ACCOUNT_INACTIVE: 'portal.employeeAccountInactive',
  UNAUTHORIZED: 'portal.unauthorized',
};

export default function EmployeeLogin() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [employeeId, setEmployeeId] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetId, setResetId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  async function handleSubmit({ id, password }) {
    setError('');
    setSubmitting(true);
    try {
      const user = await authService.loginEmployee(id, password, rememberMe);
      setUser(user);
      navigate('/employee/dashboard', { replace: true });
    } catch (err) {
     setError(
  t(
    ERROR_KEYS[err.code] ||
      'portal.invalidEmployeeCredentials'
  )
);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenForgotModal() {
    setResetId(employeeId || '');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess(false);
    setShowForgotModal(true);
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setResetError('');

    if (!resetId.trim()) {
      setResetError('Please enter your Employee ID or Mobile Number.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please try again.');
      return;
    }

    setResetSubmitting(true);
    try {
      await authService.resetEmployeePassword(resetId.trim(), newPassword);
      setResetSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => {
        setEmployeeId(resetId.trim());
        setShowForgotModal(false);
      }, 1500);
    } catch (err) {
      setResetError(err.message || 'Failed to update password. Please verify your Employee ID.');
    } finally {
      setResetSubmitting(false);
    }
  }

  return (
    <>
      <PortalLoginCard
        heading={t('portal.employeePortalHeading')}
        secureMessage={t('portal.secureEmployeeAccess')}
        idLabel={t('portal.employeeId')}
        idValue={employeeId}
        onIdChange={setEmployeeId}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        rememberMe={rememberMe}
        onRememberChange={setRememberMe}
        onForgotPassword={handleOpenForgotModal}
        registerPath="/employee/register"
      />

      {showForgotModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-warm-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-900">Reset Employee Password</h2>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="mt-6 text-center">
                <CheckCircle2 size={48} className="mx-auto text-green-600" />
                <p className="mt-3 font-semibold text-gray-800">Password Reset Complete!</p>
                <p className="mt-1 text-xs text-gray-500">
                  Your password has been successfully updated. You can now login with your new credentials.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Employee ID / Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-2026-0001 or 9000000002"
                    value={resetId}
                    onChange={(e) => setResetId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {resetError && (
                  <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 font-medium">
                    {resetError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-warm-white hover:bg-brand-700 disabled:opacity-60"
                  >
                    {resetSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
