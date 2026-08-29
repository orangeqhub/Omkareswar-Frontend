import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useDraftProperty } from '../../hooks/useDraftProperty';
import { toast } from '../../store/toastStore';
import WizardStepper from '../../components/forms/wizard/WizardStepper';
import Step1BasicDetails from '../../components/forms/wizard/Step1BasicDetails';
import Step2Location from '../../components/forms/wizard/Step2Location';
import Step3PriceSize from '../../components/forms/wizard/Step3PriceSize';
import Step4Structure from '../../components/forms/wizard/Step4Structure';
import Step5Amenities from '../../components/forms/wizard/Step5Amenities';
import Step6Images from '../../components/forms/wizard/Step6Images';
import Step7ContactPreference from '../../components/forms/wizard/Step7ContactPreference';
import Step8PreviewSubmit from '../../components/forms/wizard/Step8PreviewSubmit';
import { settingsService } from '../../services/settingsService';
import CompletionBadge from '../../components/dashboard/CompletionBadge';
import { computePropertyScore } from '../../utils/propertyScore';
import { getWizardStepStatuses } from '../../utils/wizardValidation';

const POST_SUBMIT_PATH = {
  buyer: '/buyer/my-properties',
  seller: '/seller/properties',
  mediator: '/mediator/dashboard',
  admin: '/admin/properties',
  employee: '/employee/properties',
};

export default function AddProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('forms');
  const { user } = useAuthStore();
  const { formData, updateData, saveDraft, submitForApproval, loaded } = useDraftProperty(user?.id, id);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const { categorySlug, ruleKey } = location.state || {};
    if (categorySlug && (categorySlug !== formData.categorySlug || !formData.ruleKey)) {
      updateData({ categorySlug, ruleKey, images: [], extraSpaces: [] });
    }
  }, [loaded, location.state]);

  const steps = [
    t('wizard.step1Title'),
    t('wizard.step2Title'),
    t('wizard.step3Title'),
    t('wizard.step4Title'),
    t('wizard.step5Title'),
    t('wizard.step6Title'),
    t('wizard.step7Title'),
    t('wizard.step8Title'),
  ];

  const [fieldConfig, setFieldConfig] = useState({});
  const [propertyFields, setPropertyFields] = useState([]);
  const [amenitiesByCategory, setAmenitiesByCategory] = useState({});

  useEffect(() => {
    settingsService.getPublicSettings()
      .then((res) => {
        if (res && res.fieldConfig) {
          setFieldConfig(res.fieldConfig);
        }
        if (res && res.propertyFields) {
          setPropertyFields(res.propertyFields);
        }
        if (res && res.amenitiesByCategory) {
          setAmenitiesByCategory(res.amenitiesByCategory);
        }
      })
      .catch((err) => console.error('Failed to load fields configurations:', err));
  }, []);

  const liveScore = useMemo(() => {
    const dynamic = {};
    for (const sp of formData.structure?.extraSpaces || []) {
      if (sp?.name && (sp?.value || sp?.measurement)) dynamic[sp.name] = sp;
    }
    return computePropertyScore({ ...formData, dynamicFields: dynamic });
  }, [formData]);

  const stepComplete = useMemo(
    () => getWizardStepStatuses(formData, fieldConfig),
    [formData, fieldConfig]
  );

  if (!loaded) return null;

  function handleNext() {
    setStep((s) => Math.min(8, s + 1));
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSaveDraft() {
    setSaving(true);
    try {
      await saveDraft();
      toast.success(t('buttons.saveDraft', { ns: 'common' }) + ' ✓');
    } catch (err) {
      toast.error(t(err.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      await submitForApproval();
      toast.success(t('registration.success'));
      navigate(POST_SUBMIT_PATH[user.role] || '/');
    } catch (err) {
      toast.error(t(err.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-brand-800">{steps[step - 1]}</h1>
        <CompletionBadge score={liveScore.overall} label={t('scorecard.live', { ns: 'common', defaultValue: 'Completed' })} size="lg" />
      </div>
      <WizardStepper steps={steps} current={step} completed={stepComplete} />

      {step === 1 && <Step1BasicDetails data={formData} onChange={updateData} fieldConfig={fieldConfig} propertyFields={propertyFields} />}
      {step === 2 && <Step2Location data={formData} onChange={updateData} fieldConfig={fieldConfig} propertyFields={propertyFields} />}
      {step === 3 && <Step3PriceSize data={formData} onChange={updateData} fieldConfig={fieldConfig} propertyFields={propertyFields} />}
      {step === 4 && <Step4Structure data={formData} onChange={updateData} fieldConfig={fieldConfig} propertyFields={propertyFields} />}
      {step === 5 && <Step5Amenities data={formData} onChange={updateData} fieldConfig={fieldConfig} propertyFields={propertyFields} amenitiesByCategory={amenitiesByCategory} />}
      {step === 6 && <Step6Images data={formData} onChange={updateData} propertyFields={propertyFields} />}
      {step === 7 && <Step7ContactPreference data={formData} onChange={updateData} fieldConfig={fieldConfig} propertyFields={propertyFields} />}
      {step === 8 && <Step8PreviewSubmit data={formData} />}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
        >
          {t('buttons.back', { ns: 'common' })}
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="rounded-lg border border-brand-400 px-4 py-2 text-sm font-medium text-brand-700 disabled:opacity-50"
          >
            {t('buttons.saveDraft', { ns: 'common' })}
          </button>
          {step < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700"
            >
              {t('buttons.next', { ns: 'common' })}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('buttons.submitForApproval', { ns: 'common' })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
