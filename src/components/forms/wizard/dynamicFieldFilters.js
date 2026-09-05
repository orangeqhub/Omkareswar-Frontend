export const DYNAMIC_DUPLICATES = {
  dyn_bedrooms: 'bedrooms',
  dyn_bathrooms: 'bathrooms',
  dyn_balconies: 'balconies',
  dyn_floorNumber: 'propertyFloor',
  dyn_totalFloors: 'floors',
  dyn_numberOfFloors: 'floors',
  dyn_furnishing: 'furnishing',
  dyn_parking: 'parking',
  dyn_propertyAge: 'ageOfProperty',
  dyn_plotArea: 'area',
  dyn_areaUnit: 'areaUnit',
  dyn_landArea: 'area',
  dyn_landUnit: 'areaUnit',
  dyn_totalArea: 'area',
  dyn_length: 'plotLength',
  dyn_width: 'plotWidth',
  dyn_roadWidth: 'roadWidth',
  dyn_ventureName: 'ventureName',
  dyn_projectName: 'ventureName',
  dyn_pricePerUnit: 'pricePerUnit',
  dyn_pricePerSqyd: 'pricePerUnit',
  dyn_ventureAmenities: 'amenities',
};

// Legacy seeded custom-field ids that duplicate the modern dyn_* category fields.
// Used to drop/skin legacy values still stored inside existing properties' dynamicFields.
export const LEGACY_DUPLICATE_ALIASES = {
  f_survey: 'dyn_surveyNumber',
  f_facing: 'dyn_facing',
  f_acres: 'dyn_landArea',
  f_road_facing: 'dyn_roadFacing',
  f_built_up: 'dyn_builtUpArea',
};

export const LEGACY_DUPLICATE_LABELS = {
  f_lift: 'Lift',
  f_ground_yards: 'Ground Yards',
  f_total_value: 'Total Value',
  f_valuation: 'Valuation',
  dyn_lift: 'Lift',
};

// Resolves any field id (dyn_* or legacy f_*) to the canonical attribute name it
// represents, so duplicate renderings can be collapsed across structure/plotDetails/
// dynamicFields and across the flattened category-field list.
export function canonicalFieldId(fieldId) {
  const dynamic = DYNAMIC_DUPLICATES[fieldId];
  if (dynamic) return dynamic;
  const alias = LEGACY_DUPLICATE_ALIASES[fieldId];
  if (alias) return DYNAMIC_DUPLICATES[alias] || alias;
  return fieldId;
}

export const WIZARD_FIELD_IDS = new Set([
  'titleEn', 'descriptionEn', 'ventureName',
  'state', 'district', 'mandal', 'cityVillage', 'locality', 'landmark', 'pincode', 'address', 'mapLocation',
  'price', 'priceNegotiable', 'area', 'areaUnit', 'dimensions', 'pricePerUnit',
  'bedrooms', 'bathrooms', 'halls', 'kitchens', 'balconies', 'floors', 'propertyFloor', 'furnishing', 'parking', 'ageOfProperty',
  'plotLength', 'plotWidth', 'roadWidth', 'boundary',
  'amenities', 'contactName', 'contactPhone', 'preferWhatsapp', 'preferCall', 'hidePhone',
]);

export function isDuplicateField(fieldId) {
  if (WIZARD_FIELD_IDS.has(fieldId)) return true;
  return DYNAMIC_DUPLICATES[fieldId] ? true : false;
}

export function matchesFieldCategory(field, categorySlug, building) {
  const cat = field.category || 'both';
  if (cat === 'both') return true;
  if (cat === categorySlug) return true;
  if (building && cat === 'residential') return true;
  if (!building && cat === 'land') return true;
  if (Array.isArray(cat) && cat.includes(categorySlug)) return true;
  return false;
}

// Companionship rules: Land Conversion is only meaningful for plot categories,
// and only when the seller picks an approval type that still requires land
// conversion (Panchayat / Municipality / Non-Approval).
export const LAND_CONVERSION_FIELD_ID = 'f_conversion';
export const PLOT_APPROVAL_CATEGORIES = ['open-plots', 'residential-plots', 'commercial-plots'];

// Agricultural & Commercial lands: area stays in Sq.Ft and price is calculated
// from Acres (Sq.Ft ÷ 9 = Sq.Yds, Sq.Yds ÷ 48 = Cents, Cents ÷ 100 = Acres).
export const LAND_PRICE_CATEGORIES = ['agricultural-lands', 'commercial-plots'];

export function isLandConversionField(field) {
  return field.id === LAND_CONVERSION_FIELD_ID || /conversion/i.test(String(field.label || ''));
}

export function isApprovalTriggerForConversion(value) {
  const key = String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return key.includes('panchayat') || key.includes('municipality') || key.includes('nonapproval') || key.includes('unapproved') || key === 'other';
}

export function shouldShowLandConversion(categorySlug, approvalValue) {
  return PLOT_APPROVAL_CATEGORIES.includes(categorySlug) && isApprovalTriggerForConversion(approvalValue);
}