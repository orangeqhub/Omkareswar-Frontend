import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { registrationService } from '../../services/registrationService';
import { registrationFormService } from '../../services/registrationFormService';
import {
  buildRegistrationSchema,
  buildRegistrationRefinements,
  ROLE_TO_FORM_TYPE,
} from '../../utils/registrationForm';
import { toast } from '../../store/toastStore';
import apiClient from '../../services/apiClient';
import DynamicFormFields from '../../components/forms/DynamicFormFields';

const ROLES = ['buyer', 'seller', 'mediator'];

export default function Register({ defaultRole }) {
  const navigate = useNavigate();
  const { t } = useTranslation('forms');
  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pendingData, setPendingData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formConfig, setFormConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const schema = useMemo(() => {
    const base = buildRegistrationSchema(formConfig?.fields || []);
    const refined = buildRegistrationRefinements(base, formConfig?.fields || []);
    return refined.extend({
      role: z.enum(['buyer', 'seller', 'mediator', 'employee']),
      acceptTerms: z.literal(true, { errorMap: () => ({ message: 'validation.mustAcceptTerms' }) }),
    });
  }, [formConfig]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole || 'buyer', acceptTerms: false },
  });

  const selectedRole = watch('role') || defaultRole || 'buyer';

  useEffect(() => {
    let cancelled = false;
    setLoadingConfig(true);
    setFormConfig(null);
    registrationFormService
      .getForm(ROLE_TO_FORM_TYPE[selectedRole] || String(selectedRole).toUpperCase())
      .then((form) => {
        if (!cancelled) setFormConfig(form);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Could not load the registration form');
      })
      .finally(() => {
        if (!cancelled) setLoadingConfig(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedRole]);

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiClient.post('/uploads/identity-proof', fd);
    return res.data?.data?.url || res.data?.url;
  }

  async function submitRegistration(payload, currentRole) {
    await registrationService.register(currentRole, payload);
    toast.success(t('registration.success'));
  }

  async function onSubmitForm(data) {
    const fields = formConfig?.fields || [];
    const standard = {};
    const customFields = {};
    const fileUploads = [];

    fields.forEach((field) => {
      const raw = data[field.fieldKey];
      if (field.fieldType === 'file') {
        if (raw && typeof raw.length === 'number' && raw.length) {
          fileUploads.push({ field, files: Array.from(raw) });
        }
      } else if (field.isSystemField) {
        standard[field.fieldKey] = raw;
      } else {
        customFields[field.fieldKey] = raw;
      }
    });

    setSubmitting(true);
    try {
      for (const { field, files } of fileUploads) {
        const urls = [];
        for (const file of files) {
          urls.push(await uploadFile(file));
        }
        if (field.isSystemField) {
          standard[field.fieldKey] = urls.join(',');
        } else {
          customFields[field.fieldKey] = urls.join(',');
        }
      }

      const currentRole = data.role || defaultRole || 'buyer';
      const payload = { ...standard, customFields };

      if (currentRole === 'employee') {
        await submitRegistration(payload, currentRole);
        navigate('/application-status', { state: { mobile: standard.mobile } });
        return;
      }

      setPendingData({ role: currentRole, ...payload });
      setStep('otp');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(otp)) {
      setOtpError(t('registration.otpHint'));
      return;
    }
    setSubmitting(true);
    try {
      const { role, ...payload } = pendingData;
      await submitRegistration(payload, role);
      navigate('/login', { state: { mobile: pendingData.mobile } });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
        {loadingConfig ? (
          <p className="text-sm text-gray-500">Loading registration form...</p>
        ) : formConfig && formConfig.fields.length ? (
          <DynamicFormFields fields={formConfig.fields} register={register} errors={errors} values={watch()} />
        ) : (
          <p className="text-sm text-red-600">
            {t('registration.formLoadError', {
              defaultValue: 'The registration form is currently unavailable. Please try again later.',
            })}
          </p>
        )}

        {!defaultRole && (
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('registration.role')}
            </label>
            <select id="role" {...register('role')} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`nav.registerAs${role[0].toUpperCase()}${role.slice(1)}`, {
                    ns: 'common',
                    defaultValue: `Register as ${role[0].toUpperCase()}${role.slice(1)}`,
                  })}
                </option>
              ))}
            </select>
          </div>
        )}

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register('acceptTerms')} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600" />
          {t('registration.termsLabel')}
        </label>
        {errors.acceptTerms && <p className="text-xs text-red-600">{t(errors.acceptTerms.message)}</p>}

        <button
          type="submit"
          disabled={submitting || loadingConfig}
          className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700 disabled:opacity-60"
        >
          {t('registration.submit')}
        </button>
      </form>
    </div>
  );
}
