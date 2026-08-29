// Essential fields per wizard step. The stepper shows a cross when an
// enabled essential field for a completed step is still empty.
const STEP_CORE_FIELDS = {
  1: ['titleEn', 'categorySlug', 'descriptionEn'],
  2: ['state', 'district', 'cityVillage'],
  3: ['price', 'area'],
  4: [],
  5: [],
  6: ['__images__'],
  7: ['contactName', 'contactPhone'],
  8: [],
};

function isEmptyValue(v) {
  if (typeof v === 'string') return v.trim() === '';
  return v === undefined || v === null || v === '';
}

export function getWizardStepStatuses(data, fieldConfig = {}) {
  const statuses = {};
  for (let step = 1; step <= 8; step++) {
    const keys = STEP_CORE_FIELDS[step] || [];
    let complete = true;
    for (const key of keys) {
      if (fieldConfig[key]?.enabled === false) continue;
      if (key === '__images__') {
        if (!Array.isArray(data.images) || data.images.length === 0) {
          complete = false;
          break;
        }
        continue;
      }
      if (isEmptyValue(data[key])) {
        complete = false;
        break;
      }
    }
    statuses[step] = complete;
  }
  return statuses;
}