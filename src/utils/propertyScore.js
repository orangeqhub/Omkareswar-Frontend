const BUILDING_RULE_KEYS = ['apartment', 'independentHouse', 'gatedCommunity'];

export function isBuildingType(ruleKey) {
  return BUILDING_RULE_KEYS.includes(ruleKey);
}

const BUILDING_STRUCTURE_FIELDS = [
  'bedrooms',
  'bathrooms',
  'halls',
  'kitchens',
  'balconies',
  'floors',
  'propertyFloor',
  'furnishing',
  'parking',
  'ageOfProperty',
];

const PLOT_STRUCTURE_FIELDS = [
  'plotLength',
  'plotWidth',
  'roadWidth',
  'boundary',
  'soilType',
  'waterSource',
  'electricity',
  'irrigation',
  'existingStructures',
  'approvals',
];

function isFilled(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !Number.isNaN(value) && value > 0;
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return false;
    return keys.some((k) => isFilled(value[k]));
  }
  return Boolean(value);
}

function countFilled(source, keys) {
  let filled = 0;
  for (const key of keys) {
    if (isFilled(source[key])) filled += 1;
  }
  return filled;
}

function hasDocument(documents, kind) {
  if (Array.isArray(documents)) {
    return documents.some((d) => String(d.type || d.kind || '').toLowerCase() === kind.toLowerCase());
  }
  if (documents && typeof documents === 'object') {
    return isFilled(documents[kind]);
  }
  return false;
}

function pct(filled, total) {
  if (!total) return 0;
  return Math.round((filled / total) * 100);
}

const SECTION_LABELS = {
  basic: 'Basic Details',
  location: 'Location',
  price_size: 'Price & Size',
  structure: 'Structure',
  plot: 'Land / Plot Details',
  amenities: 'Amenities',
  media: 'Images & Documents',
  contact: 'Contact Details',
};

export function sectionLabel(key) {
  return SECTION_LABELS[key] || key;
}

/**
 * Mirror of the backend property-score logic. Accepts wizard form data or an
 * API property object so the score can be shown live while filling the form.
 */
export function computePropertyScore(data) {
  const source = data || {};
  const building = isBuildingType(source.ruleKey);
  const sections = [];

  const basicKeys = ['titleEn', 'descriptionEn', 'ventureName'];
  const basicFilled = countFilled(source, basicKeys);
  sections.push({ key: 'basic', label: sectionLabel('basic'), filled: basicFilled, total: basicKeys.length, percentage: pct(basicFilled, basicKeys.length) });

  const city = isFilled(source.city) ? source.city : source.cityVillage;
  const hasMap = (isFilled(source.mapLat) && isFilled(source.mapLng)) || isFilled(source.mapLocation);
  const locationFields = [
    { key: 'state', value: source.state },
    { key: 'district', value: source.district },
    { key: 'mandal', value: source.mandal },
    { key: 'city', value: city },
    { key: 'locality', value: source.locality },
    { key: 'pincode', value: source.pincode },
    { key: 'address', value: source.address },
    { key: 'map', value: hasMap },
  ];
  const locationFilled = locationFields.filter((f) => isFilled(f.value)).length;
  sections.push({ key: 'location', label: sectionLabel('location'), filled: locationFilled, total: locationFields.length, percentage: pct(locationFilled, locationFields.length) });

  const priceKeys = ['price', 'area', 'areaUnit'];
  const priceFilled = countFilled(source, priceKeys);
  sections.push({ key: 'price_size', label: sectionLabel('price_size'), filled: priceFilled, total: priceKeys.length, percentage: pct(priceFilled, priceKeys.length) });

  const structureSource = building ? source.structure || {} : source.plotDetails || {};
  const structureKeys = building ? BUILDING_STRUCTURE_FIELDS : PLOT_STRUCTURE_FIELDS;
  let structureFilled = countFilled(structureSource, structureKeys);
  let structureTotal = structureKeys.length;
  const dynamic = source.dynamicFields || {};
  Object.keys(dynamic).forEach((k) => {
    structureTotal += 1;
    if (isFilled(dynamic[k])) structureFilled += 1;
  });
  sections.push({ key: building ? 'structure' : 'plot', label: sectionLabel(building ? 'structure' : 'plot'), filled: structureFilled, total: structureTotal, percentage: pct(structureFilled, structureTotal) });

  const amenitiesFilled = Array.isArray(source.amenities) && source.amenities.length > 0 ? 1 : 0;
  sections.push({ key: 'amenities', label: sectionLabel('amenities'), filled: amenitiesFilled, total: 1, percentage: amenitiesFilled ? 100 : 0 });

  const images = Array.isArray(source.images) ? source.images : [];
  const hasImages = images.length > 0;
  const hasPrimary = images.some((i) => i.isPrimary);
  const hasSite = hasDocument(source.documents, 'site');
  const hasLink = hasDocument(source.documents, 'link');
  const hasIdentityProof = hasDocument(source.documents, 'identityProof');
  const mediaValues = [hasImages, hasPrimary, hasSite, hasLink, hasIdentityProof];
  const mediaFilled = mediaValues.filter(Boolean).length;
  sections.push({ key: 'media', label: sectionLabel('media'), filled: mediaFilled, total: mediaValues.length, percentage: pct(mediaFilled, mediaValues.length) });

  const contactKeys = ['contactName', 'contactPhone'];
  const contactFilled = countFilled(source, contactKeys);
  sections.push({ key: 'contact', label: sectionLabel('contact'), filled: contactFilled, total: contactKeys.length, percentage: pct(contactFilled, contactKeys.length) });

  const overall = sections.length ? Math.round(sections.reduce((sum, s) => sum + s.percentage, 0) / sections.length) : 0;
  return { overall, sections };
}

export function scoreTone(score) {
  if (score >= 80) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}