import { useState } from 'react';
import {
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import {
  isAccountActive,
} from '../../utils/auth';

const APPLICATION_STATUS_ERRORS = [
  'ACCOUNT_PENDING',
  'ACCOUNT_REJECTED',
];

export default function Login() {
  const { t } = useTranslation('forms');
  const navigate = useNavigate();
  const location = useLocation();

  const setUser = useAuthStore((state) => state.setUser);

  const [step, setStep] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleAuthenticationError(authError) {
    if (
      APPLICATION_STATUS_ERRORS.includes(authError.code)
    ) {
      navigate('/application-status', {
        state: { mobile },
      });

      return;
    }

    const errorKeys = {
      USER_NOT_FOUND: 'error.notRegistered',
      INVALID_OTP: 'error.invalidOtp',
      OTP_EXPIRED: 'error.otpExpired',
      ROLE_NOT_ALLOWED: 'ROLE_NOT_ALLOWED',
      ACCOUNT_INACTIVE: 'error.accountInactive',
    };

    const translationKey = errorKeys[authError.code];

    if (translationKey) {
      setError(
        t(translationKey, {
          ns: 'auth',
          defaultValue: authError.message,
        })
      );
    } else {
      setError(
        authError.message || 'Unable to login'
      );
    }
  }

  async function handleRequestOtp(event) {
    event.preventDefault();
    setError('');
    setDemoOtp('');

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError(t('validation.invalidMobile'));
      return;
    }

    setSubmitting(true);

    try {
      const result = await authService.requestOtp(mobile);

      if (result?.demoOtp) {
        setDemoOtp(result.demoOtp);
      }

      setStep('otp');
    } catch (authError) {
      handleAuthenticationError(authError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError('');

    if (!/^\d{4,6}$/.test(otp)) {
      setError(
        t('error.invalidOtp', {
          ns: 'auth',
        })
      );

      return;
    }

    setSubmitting(true);

    try {
      const user =
        await authService.loginPublicWithOtp(
          mobile,
          otp,
          true
        );

      if (!isAccountActive(user)) {
        navigate('/application-status', {
          state: { mobile },
        });

        return;
      }

      setUser(user);

      let destination = location.state?.from || '/';
      if (destination === '/') {
        if (user.role === 'admin') destination = '/admin/dashboard';
        else if (user.role === 'employee') destination = '/employee/dashboard';
        else destination = '/';
      }

      navigate(destination, {
        replace: true,
      });
    } catch (authError) {
      handleAuthenticationError(authError);
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    setStep('mobile');
    setOtp('');
    setError('');
    setDemoOtp('');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-800">
        {t('login.title')}
      </h1>

      {step === 'mobile' ? (
        <form
          onSubmit={handleRequestOtp}
          className="mt-6 space-y-4"
        >
          <div>
            <label
              htmlFor="login-mobile"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              {t('login.mobile')}
            </label>

            <input
              id="login-mobile"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(event) =>
                setMobile(
                  event.target.value.replace(/\D/g, '')
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />

            {error && (
              <p className="mt-1 text-xs text-red-600">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting
              ? 'Requesting OTP...'
              : t('login.requestOtp')}
          </button>

          <p className="text-center text-xs text-gray-400">
            Demo accounts: 9000000003 Seller,
            9000000004 Buyer, 9000000005 Mediator
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleVerifyOtp}
          className="mt-6 space-y-4"
        >
          <p className="text-sm text-gray-500">
            {t('login.otpHint')}
          </p>

          {demoOtp && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm font-semibold text-amber-800">
              Demo OTP: {demoOtp}
            </div>
          )}

          <div>
            <label
              htmlFor="login-otp"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              {t('login.otpLabel')}
            </label>

            <input
              id="login-otp"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value.replace(/\D/g, '')
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-center text-lg tracking-widest"
            />

            {error && (
              <p className="mt-1 text-xs text-red-600">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting
              ? 'Verifying...'
              : t('login.login')}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="w-full text-sm text-gray-500 hover:underline"
          >
            {t('buttons.back', {
              ns: 'common',
            })}
          </button>
        </form>
      )}

      <div className="mt-6 border-t border-gray-100 pt-5 text-center">
        <p className="text-sm text-gray-500">
          {t('login.noAccount')}
        </p>

        <Link
          to="/register"
          className="mt-2 inline-block w-full rounded-lg border border-brand-300 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          {t('nav.register', {
            ns: 'common',
          })}
        </Link>
      </div>
    </div>
  );
}