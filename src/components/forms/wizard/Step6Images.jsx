import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateImageSlots } from '../../../utils/mediaSlotGenerator';
import { validateImageFile, compressImageToFile } from '../../../utils/imageValidation';
import { validateDocumentFile } from '../../../utils/documentValidation';
import apiClient from '../../../services/apiClient';
import { resolveSlotLabel } from '../../../utils/mediaLabel';
import { isBuildingType } from '../../../utils/wizardDefaults';
import { mediaRuleService } from '../../../services/mediaRuleService';
import { useLanguageStore } from '../../../store/languageStore';
import { toast } from '../../../store/toastStore';
import ImageSlotUploader from '../ImageSlotUploader';
import DocumentUploader from '../DocumentUploader';

export default function Step6Images({ data, onChange }) {
  const { t } = useTranslation('forms');
  const language = useLanguageStore((s) => s.language);
  const [errors, setErrors] = useState({});
  const [rule, setRule] = useState(null);
  const building = isBuildingType(data.ruleKey);

  useEffect(() => {
    if (!data.ruleKey) return;
    mediaRuleService.getRules().then((rules) => setRule(rules[data.ruleKey] || null));
  }, [data.ruleKey]);

  const slots = useMemo(() => {
    if (!rule) return [];
    const structureCounts = building
      ? {
          bedrooms: data.structure.bedrooms,
          bathrooms: data.structure.bathrooms,
          halls: data.structure.halls,
          balconies: data.structure.balconies,
          kitchens: data.structure.kitchens,
        }
      : {};
    return generateImageSlots(rule, structureCounts, data.extraSpaces);
  }, [rule, data.structure, data.extraSpaces, building]);

  const imagesBySlot = useMemo(() => {
    const map = {};
    for (const img of data.images) map[img.slotId] = img;
    return map;
  }, [data.images]);

  const completedCount = slots.filter((s) => imagesBySlot[s.id]).length;
  const hasPrimary = data.images.some((img) => img.isPrimary);

  async function handleUpload(slot, file) {
    const existingFingerprints = data.images.filter((i) => i.slotId !== slot.id).map((i) => i.fingerprint);
    // Override maxFileSizeMb to 30 to support up to 30 MB raw size
    const result = validateImageFile(file, existingFingerprints, {
      maxFileSizeMb: 30,
      allowedExtensions: slot.allowedExtensions,
    });
    if (!result.valid) {
      setErrors((e) => ({ ...e, [slot.id]: t(result.errorKey, result.errorParams) }));
      return;
    }
    setErrors((e) => ({ ...e, [slot.id]: null }));

    toast.info('Compressing and uploading image, please wait...');

    let url;
    try {
      // Compress the image down to good quality on client side before upload
      const compressedFile = await compressImageToFile(file, 1600, 1600, 0.8);
      const fd = new FormData();
      fd.append('file', compressedFile);
      fd.append('slotId', slot.id);

      const response = await apiClient.post('/uploads/property-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      url = response.data?.data?.url || response.data?.url;
    } catch (err) {
      console.error('Image compression/upload failed:', err);
      toast.error('Failed to compress or upload image.');
      return;
    }

    const nextImages = data.images.filter((i) => i.slotId !== slot.id);
    const isFirstImage = data.images.length === 0;
    const isPrimary = isFirstImage && slot.primaryEligible;
    nextImages.push({ slotId: slot.id, url, caption: '', isPrimary, fingerprint: result.fingerprint, fileName: file.name });
    onChange({ images: nextImages });
  }

  function handleRemove(slotId) {
    onChange({ images: data.images.filter((i) => i.slotId !== slotId) });
  }

  function handleCaptionChange(slotId, caption) {
    onChange({ images: data.images.map((i) => (i.slotId === slotId ? { ...i, caption } : i)) });
  }

  function handleSetPrimary(slotId) {
    onChange({ images: data.images.map((i) => ({ ...i, isPrimary: i.slotId === slotId })) });
  }

  async function handleUploadDocument(kind, file) {
    const result = validateDocumentFile(file);
    if (!result.valid) {
      setErrors((e) => ({ ...e, [kind]: t(result.errorKey, result.errorParams) }));
      return;
    }
    setErrors((e) => ({ ...e, [kind]: null }));

    toast.info('Uploading document, please wait...');

    let url;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', kind);

      const response = await apiClient.post('/uploads/property-document', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      url = response.data?.data?.url || response.data?.url;
    } catch (err) {
      console.error('Document upload failed:', err);
      toast.error('Failed to upload document.');
      return;
    }

    onChange({ documents: { ...data.documents, [kind]: { url, fileName: file.name } } });
  }

  const structureSummary = building
    ? `${data.structure.bedrooms} Bedrooms · ${data.structure.bathrooms} Bathrooms · ${data.structure.halls} Halls · ${data.structure.balconies} Balconies`
    : `${data.area || '-'} ${data.areaUnit}`;

  return (
    <div>
      <div className="rounded-xl bg-brand-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{t('media.summaryTitle')}</p>
        <p className="mt-1 text-sm text-gray-700">{structureSummary}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-700">{t('media.progressTitle')}</p>
        <p className="mt-1 text-sm text-gray-700">{t('media.progress', { completed: completedCount, total: slots.length })}</p>
        <p className="mt-2 text-xs text-gray-500">{t('media.noExtraLimitNotice')}</p>
        {!hasPrimary && data.images.length > 0 && (
          <p className="mt-2 text-xs font-medium text-red-600">{t('media.error.primaryRequired')}</p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => (
          <ImageSlotUploader
            key={slot.id}
            label={resolveSlotLabel(slot, language, t, slot.index ?? undefined)}
            required={slot.required}
            captionRequired={slot.captionRequired}
            primaryEligible={slot.primaryEligible}
            image={imagesBySlot[slot.id]}
            isPrimary={Boolean(imagesBySlot[slot.id]?.isPrimary)}
            onUpload={(file) => handleUpload(slot, file)}
            onRemove={() => handleRemove(slot.id)}
            onCaptionChange={(caption) => handleCaptionChange(slot.id, caption)}
            onSetPrimary={() => handleSetPrimary(slot.id)}
            error={errors[slot.id]}
          />
        ))}
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-700">{t('documents.title')}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DocumentUploader
            label={t('documents.identityProof')}
            document={data.documents?.identityProof}
            onUpload={(file) => handleUploadDocument('identityProof', file)}
            error={errors.identityProof}
          />
          <DocumentUploader
            label={t('documents.ownershipProof')}
            document={data.documents?.ownershipProof}
            onUpload={(file) => handleUploadDocument('ownershipProof', file)}
            error={errors.ownershipProof}
          />
        </div>
      </div>
    </div>
  );
}
