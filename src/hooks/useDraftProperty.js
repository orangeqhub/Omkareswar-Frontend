import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { readJSON, writeJSON, removeKey, STORAGE_KEYS } from '../utils/storage';
import { createEmptyWizardData } from '../utils/wizardDefaults';
import { propertyService } from '../services/propertyService';
import { toast } from '../store/toastStore';

export function useDraftProperty(sellerId, existingPropertyId) {
  const { t } = useTranslation('forms');
  const [formData, setFormData] = useState(() => {
    const draft = readJSON(STORAGE_KEYS.WIZARD_DRAFT, null);
    if (draft && sellerId && (!draft.sellerId || draft.sellerId !== sellerId)) {
      return createEmptyWizardData();
    }
    return draft || createEmptyWizardData();
  });
  const [draftId, setDraftId] = useState(existingPropertyId || null);
  const [loaded, setLoaded] = useState(!existingPropertyId);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    if (existingPropertyId) {
      setLoaded(false);
      propertyService.getPropertyById(existingPropertyId).then((property) => {
        if (property) {
          setFormData({ ...createEmptyWizardData(), ...property });
          setDraftId(property.id);
        }
        setLoaded(true);
      });
    } else {
      const draft = readJSON(STORAGE_KEYS.WIZARD_DRAFT, null);
      if (draft && sellerId && (!draft.sellerId || draft.sellerId !== sellerId)) {
        setFormData(createEmptyWizardData());
      } else {
        setFormData(draft || createEmptyWizardData());
      }
      setDraftId(null);
      setLoaded(true);
    }
  }, [existingPropertyId, sellerId]);

  useEffect(() => {
    if (!loaded) return;
    const ok = writeJSON(STORAGE_KEYS.WIZARD_DRAFT, { ...formData, sellerId });
    if (!ok && storageOk) {
      toast.error(t('media.error.storageQuotaExceeded'));
    }
    setStorageOk(ok);
  }, [formData, loaded, sellerId, storageOk]);

  const updateData = useCallback((patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const saveDraft = useCallback(async () => {
    if (draftId) {
      const updated = await propertyService.updateDraft(draftId, formData);
      return updated;
    }
    const created = await propertyService.createDraft(sellerId, formData);
    setDraftId(created.id);
    return created;
  }, [draftId, formData, sellerId]);

  const submitForApproval = useCallback(async () => {
    const saved = await saveDraft();
    const submitted = await propertyService.submitForApproval(saved.id);
    removeKey(STORAGE_KEYS.WIZARD_DRAFT);
    return submitted;
  }, [saveDraft]);

  const clearDraft = useCallback(() => {
    removeKey(STORAGE_KEYS.WIZARD_DRAFT);
    setFormData(createEmptyWizardData());
    setDraftId(null);
  }, []);

  return { formData, updateData, draftId, saveDraft, submitForApproval, clearDraft, loaded, storageOk };
}
