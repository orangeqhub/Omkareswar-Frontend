import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function mapCommonSlots(slots = []) {
  return [...slots].sort((a, b) => a.order - b.order).map(s => ({
    id: s.slotKey,
    dbId: s.id,
    slotKey: s.slotKey,
    labelKey: `media.slot.${s.slotKey}`,
    labelEn: s.labelEn,
    labelTe: s.labelTe,
    required: Boolean(s.required),
    order: s.order,
    maxFileSizeMb: s.maxFileSizeMb,
    allowedExtensions: s.allowedExtensions,
    captionRequired: Boolean(s.captionRequired),
    primaryEligible: s.primaryEligible !== false,
  }));
}

function transformRules(rulesArray) {
  const result = {};
  if (!Array.isArray(rulesArray)) return result;
  for (const rule of rulesArray) {
    result[rule.ruleKey] = {
      id: rule.id,
      ruleKey: rule.ruleKey,
      countBasedSlots: rule.countBasedSlots || [],
      commonSlots: mapCommonSlots(rule.commonSlots),
      allowedExtraSpaces: (rule.extraSpaces || []).sort((a, b) => a.order - b.order).map(s => ({
        id: s.id,
        key: s.key,
        labelKey: s.labelKey,
        labelEn: s.labelEn,
        labelTe: s.labelTe,
        order: s.order
      })),
    };
  }
  return result;
}

async function getRules() {
  const response = await apiClient.get('/media-rules');
  return transformRules(unwrap(response));
}

async function getRuleForCategory(ruleKey) {
  const response = await apiClient.get(`/media-rules/${ruleKey}`);
  const rule = unwrap(response);
  if (!rule) return null;
  
  return {
    id: rule.id,
    ruleKey: rule.ruleKey,
    countBasedSlots: rule.countBasedSlots || [],
    commonSlots: mapCommonSlots(rule.commonSlots),
    allowedExtraSpaces: (rule.extraSpaces || []).sort((a, b) => a.order - b.order).map(s => ({
      id: s.id,
      key: s.key,
      labelKey: s.labelKey,
      labelEn: s.labelEn,
      labelTe: s.labelTe,
      order: s.order
    })),
  };
}

async function updateRule(ruleKey, patch) {
  await apiClient.patch(`/admin/media-rules/${ruleKey}`, patch);
  return getRules();
}

async function restoreDefaults(ruleKey) {
  await apiClient.post(`/admin/media-rules/${ruleKey}/restore-defaults`);
  return getRules();
}

async function addCommonSlot(ruleKey, slot) {
  await apiClient.post(`/admin/media-rules/${ruleKey}/common-slots`, {
    id: slot.id,
    labelEn: slot.labelEn || slot.id,
    labelTe: slot.labelTe || '',
    required: Boolean(slot.required),
    maxFileSizeMb: slot.maxFileSizeMb || 5,
    allowedExtensions: slot.allowedExtensions || ['jpg', 'jpeg', 'png', 'webp'],
    captionRequired: Boolean(slot.captionRequired),
    primaryEligible: slot.primaryEligible !== false,
  });
  return getRules();
}

async function removeCommonSlot(ruleKey, slotId) {
  await apiClient.delete(`/admin/media-rules/${ruleKey}/common-slots/${slotId}`);
  return getRules();
}

async function addExtraFeature(ruleKey, feature) {
  await apiClient.post(`/admin/media-rules/${ruleKey}/extra-spaces`, {
    key: feature.key,
    labelEn: feature.labelEn || feature.key,
    labelTe: feature.labelTe || '',
  });
  return getRules();
}

async function removeExtraFeature(ruleKey, key) {
  await apiClient.delete(`/admin/media-rules/${ruleKey}/extra-spaces/${key}`);
  return getRules();
}

async function reorderCommonSlot(ruleKey, slotId, direction) {
  await apiClient.patch(`/admin/media-rules/${ruleKey}/common-slots/${slotId}`, {
    direction,
  });
  return getRules();
}

export const mediaRuleService = {
  getRules,
  getRuleForCategory,
  updateRule,
  restoreDefaults,
  addCommonSlot,
  removeCommonSlot,
  addExtraFeature,
  removeExtraFeature,
  reorderCommonSlot,
};
