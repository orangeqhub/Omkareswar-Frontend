import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { toast } from '../../store/toastStore';
import apiClient from '../../services/apiClient';
import { resolveMediaUrl } from '../../store/url';

const FIELDS = [
  { key: 'aboutEn', labelKey: 'cms.aboutEn', textarea: true },
  { key: 'aboutTe', labelKey: 'cms.aboutTe', textarea: true },
  { key: 'disclaimerEn', labelKey: 'cms.disclaimerEn', textarea: true },
  { key: 'disclaimerTe', labelKey: 'cms.disclaimerTe', textarea: true },
  { key: 'contactPhone', labelKey: 'cms.contactPhone' },
  { key: 'contactEmail', labelKey: 'cms.contactEmail' },
  { key: 'contactAddressEn', labelKey: 'cms.contactAddressEn', textarea: true },
  { key: 'contactAddressTe', labelKey: 'cms.contactAddressTe', textarea: true },
  { key: 'contactWhatsapp', labelKey: 'cms.contactWhatsapp' },
  { key: 'propertyContactPhone', labelKey: 'cms.propertyContactPhone' },
  { key: 'propertyContactWhatsapp', labelKey: 'cms.propertyContactWhatsapp' },
  { key: 'contactLandmarkEn', labelKey: 'cms.contactLandmarkEn' },
  { key: 'contactLandmarkTe', labelKey: 'cms.contactLandmarkTe' },
  { key: 'contactMapUrl', labelKey: 'cms.contactMapUrl' },
  { key: 'businessHoursWeekdayEn', labelKey: 'cms.businessHoursWeekdayEn' },
  { key: 'businessHoursWeekdayTe', labelKey: 'cms.businessHoursWeekdayTe' },
  { key: 'businessHoursSundayEn', labelKey: 'cms.businessHoursSundayEn' },
  { key: 'businessHoursSundayTe', labelKey: 'cms.businessHoursSundayTe' },
  { key: 'socialFacebook', labelKey: 'cms.socialFacebook' },
  { key: 'socialInstagram', labelKey: 'cms.socialInstagram' },
  { key: 'socialTwitter', labelKey: 'cms.socialTwitter' },
  { key: 'socialYoutube', labelKey: 'cms.socialYoutube' },
];

export default function Cms() {
  const { t } = useTranslation('dashboard');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    cmsService.getCms().then(setForm);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await cmsService.updateCms(form);
    setSaving(false);
    toast.success(t('toast.cmsUpdated'));
  }

  async function handlePosterUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.info(t('cms.posterUploading'));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/uploads/cms-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.url || res.data?.url;
      setForm((s) => ({ ...s, popupLeftImage: url }));
      toast.success(t('cms.posterUploaded'));
    } catch (err) {
      console.error(err);
      toast.error(t('cms.posterUploadFailed'));
    } finally {
      setUploading(false);
    }
  }

  function handlePosterRemove() {
    setForm((s) => ({ ...s, popupLeftImage: '' }));
  }

  if (!form) return null;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label htmlFor={f.key} className="mb-1.5 block text-sm font-medium text-gray-700">{t(f.labelKey)}</label>
          {f.textarea ? (
            <textarea
              id={f.key}
              rows={3}
              value={form[f.key] || ''}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          ) : (
            <input
              id={f.key}
              value={form[f.key] || ''}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('cms.popupPosterImage')}</label>
        <p className="mb-3 text-xs text-gray-500">{t('cms.popupPosterHint')}</p>
        {form.popupLeftImage ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <img
              src={resolveMediaUrl(form.popupLeftImage)}
              alt=""
              className="h-40 w-32 rounded-md border border-gray-200 object-cover"
            />
            <div className="flex flex-col gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <ImagePlus size={15} />
                {t('cms.replacePoster')}
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handlePosterUpload} />
              </label>
              <button
                type="button"
                onClick={handlePosterRemove}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                {t('cms.removePoster')}
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500 hover:border-brand-500 hover:bg-brand-50/40">
            {uploading ? <Loader2 size={20} className="animate-spin text-brand-600" /> : <ImagePlus size={20} className="text-brand-600" />}
            <span>{uploading ? t('cms.posterUploading') : t('cms.uploadPoster')}</span>
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handlePosterUpload} />
          </label>
        )}
      </div>
      <button type="submit" disabled={saving || uploading} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-warm-white disabled:opacity-60">
        {t('cms.saveContent')}
      </button>
    </form>
  );
}
