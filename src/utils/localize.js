/**
 * Resolves bilingual CMS/property fields stored as `${field}En` / `${field}Te`,
 * falling back to English when the Telugu value is missing.
 */
export function getLocalizedField(obj, field, lang) {
  if (!obj) return '';
  if (lang === 'te') {
    const teValue = obj[`${field}Te`];
    if (teValue) return teValue;
  }
  return obj[`${field}En`] ?? '';
}

/**
 * Public-safe property address. Only Mandal and District are exposed to the
 * public; internal users (admin / assigned employee) use getLocalizedField for the
 * full address instead.
 */
export function getPublicAddress(property) {
  if (!property) return '';
  const parts = [property.mandal, property.district].filter(Boolean);
  return [...new Set(parts)].join(', ');
}
