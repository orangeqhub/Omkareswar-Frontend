import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { registrationService } from '../../services/registrationService';
import { registrationSchema } from '../../utils/validationSchemas';
import { DISTRICTS, CITIES } from '../../data/locations';
import { toast } from '../../store/toastStore';

const ROLES = ['buyer', 'seller', 'mediator'];

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation('forms');
  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pendingData, setPendingData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registrationSchema), defaultValues: { role: 'buyer' } });

  const selectedRole = watch('role') || 'buyer';
  const roleDetailLabel = t(`registration.roleDetail${selectedRole[0].toUpperCase()}${selectedRole.slice(1)}`);

  function onSubmitForm(data) {
    setPendingData(data);
    setStep('otp');
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(otp)) {
      setOtpError(t('registration.otpHint'));
      return;
    }
    setSubmitting(true);
    try {
      const { acceptTerms: _acceptTerms, confirmPassword: _confirmPassword, role, ...rest } = pendingData;
      await registrationService.register(role, rest);
      toast.success(t('registration.success'));
      navigate('/application-status', { state: { mobile: pendingData.mobile } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'otp') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-xl font-bold text-brand-800">{t('registration.otpTitle')}</h1>
        <p className="mt-2 text-sm text-gray-500">{t('registration.otpHint')}</p>
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('registration.otpLabel')}
            </label>
            <input
              id="otp"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-center text-lg tracking-widest"
              maxLength={6}
            />
            {otpError && <p className="mt-1 text-xs text-red-600">{otpError}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700 disabled:opacity-60"
          >
            {t('registration.verify')}
          </button>
          <button type="button" onClick={() => setStep('form')} className="w-full text-sm text-gray-500 hover:underline">
            {t('buttons.back', { ns: 'common' })}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-800">{t('registration.title')}</h1>
      <form onSubmit={handleSubmit(onSubmitForm)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.fullName')}</label>
          <input id="name" {...register('name')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{t(errors.name.message)}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="mobile" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.mobile')}</label>
            <input id="mobile" inputMode="numeric" {...register('mobile')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
            {errors.mobile && <p className="mt-1 text-xs text-red-600">{t(errors.mobile.message)}</p>}
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.email')}</label>
            <input id="email" type="email" {...register('email')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{t(errors.email.message)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.password')}</label>
            <input id="password" type="password" {...register('password')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
            {errors.password && <p className="mt-1 text-xs text-red-600">{t(errors.password.message)}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.confirmPassword')}</label>
            <input id="confirmPassword" type="password" {...register('confirmPassword')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{t(errors.confirmPassword.message)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="district" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.district')}</label>
            <select id="district" {...register('district')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
              <option value="">-</option>
              {Object.values(DISTRICTS).flat().map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.district && <p className="mt-1 text-xs text-red-600">{t(errors.district.message)}</p>}
          </div>
          <div>
            <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.city')}</label>
            <select id="city" {...register('city')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
              <option value="">-</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.city && <p className="mt-1 text-xs text-red-600">{t(errors.city.message)}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.address')}</label>
          <textarea id="address" rows={2} {...register('address')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
          {errors.address && <p className="mt-1 text-xs text-red-600">{t(errors.address.message)}</p>}
        </div>

        <div>
          <label htmlFor="roleDetail" className="mb-1.5 block text-sm font-medium text-gray-700">{roleDetailLabel}</label>
          <input id="roleDetail" {...register('roleDetail')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
        </div>

        <div>
          <label htmlFor="profilePhoto" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.profilePhoto')}</label>
          <input id="profilePhoto" type="file" accept="image/*" className="w-full text-sm" />
        </div>

        <div>
          <label htmlFor="identityProof" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.identityProof')}</label>
          <input id="identityProof" type="file" className="w-full text-sm" />
        </div>

        <div>
          <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-gray-700">{t('registration.role')}</label>
          <select id="role" {...register('role')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`nav.registerAs${role[0].toUpperCase()}${role.slice(1)}`, { ns: 'common' })}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register('acceptTerms')} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600" />
          {t('registration.termsLabel')}
        </label>
        {errors.acceptTerms && <p className="text-xs text-red-600">{t(errors.acceptTerms.message)}</p>}

        <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700">
          {t('registration.submit')}
        </button>
      </form>
    </div>
  );
}
