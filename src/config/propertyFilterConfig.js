// Available filters on the public property listing page (FilterPanel).
// Admins can enable/disable and reorder these from the Property Fields page,
// and can define their own custom filters.
//
// Config is persisted in app settings under `filterConfig`:
//   {
//     [id]: { enabled: boolean, order: number },   // predefined filters
//     custom: [                                    // admin-created filters
//       { id, label, type, options, source, fieldKey, enabled, order }
//     ]
//   }
export const FILTER_DEFINITIONS = [
  { id: 'state', label: 'State' },
  { id: 'district', label: 'District' },
  { id: 'city', label: 'City / Location' },
  { id: 'category', label: 'Category' },
  { id: 'price', label: 'Price Range' },
  { id: 'area', label: 'Area Range' },
  { id: 'bedrooms', label: 'Bedrooms' },
  { id: 'bathrooms', label: 'Bathrooms' },
  { id: 'facing', label: 'Facing' },
  { id: 'furnishing', label: 'Furnishing' },
  { id: 'quality', label: 'Featured / Verified' },
];

// Suggested field keys shown to admins when building a custom filter, grouped
// by where the value lives on a property row.
export const CUSTOM_FILTER_SUGGESTIONS = {
  structure: [
    'bedrooms', 'bathrooms', 'halls', 'kitchens', 'balconies', 'propertyFloor',
    'floors', 'facing', 'furnishing', 'parking', 'ageOfProperty',
  ],
  dynamicFields: [
    'dyn_bhk', 'dyn_bedrooms', 'dyn_bathrooms', 'dyn_balconies',
    'dyn_builtUpArea', 'dyn_carpetArea', 'dyn_superBuiltUpArea',
    'dyn_floorNumber', 'dyn_totalFloors', 'dyn_totalFlats',
    'dyn_facing', 'dyn_furnishing', 'dyn_parking', 'dyn_parkingCount',
    'dyn_propertyAge', 'dyn_maintenance', 'dyn_possessionStatus',
    'dyn_possessionDate', 'dyn_approvalType', 'dyn_approvalDetails',
    'dyn_reraNumber', 'dyn_ownershipType', 'dyn_registrationStatus',
    'dyn_roadWidth', 'dyn_waterSource', 'dyn_soilType', 'dyn_landType',
    'dyn_projectName', 'dyn_propertyType', 'dyn_plotNumber', 'dyn_layoutName',
  ],
  column: [
    'price', 'area', 'areaUnit', 'ventureName', 'state', 'district', 'city',
    'mandal', 'locality', 'ownerName', 'builtUpArea', 'facing',
  ],
};

export function getCustomFilterDefs(filterConfig) {
  return Array.isArray(filterConfig && filterConfig.custom) ? filterConfig.custom : [];
}

export function getFilterOrder(id, filterConfig) {
  const cfg = filterConfig && filterConfig[id];
  if (cfg && typeof cfg.order === 'number') return cfg.order;
  const custom = getCustomFilterDefs(filterConfig).find((c) => c.id === id);
  if (custom && typeof custom.order === 'number') return custom.order;
  const idx = FILTER_DEFINITIONS.findIndex((d) => d.id === id);
  return idx === -1 ? 1000 : idx * 10;
}

export function isFilterEnabled(id, filterConfig) {
  const cfg = filterConfig && filterConfig[id];
  if (cfg) return cfg.enabled !== false;
  const custom = getCustomFilterDefs(filterConfig).find((c) => c.id === id);
  if (custom) return custom.enabled !== false;
  return true;
}

export function getEnabledFilters(filterConfig) {
  const predefined = FILTER_DEFINITIONS.map((d) => ({ ...d, custom: false })).filter((d) =>
    isFilterEnabled(d.id, filterConfig)
  );
  const custom = getCustomFilterDefs(filterConfig)
    .map((c) => ({ ...c, custom: true }))
    .filter((c) => c.enabled !== false);
  return [...predefined, ...custom].sort(
    (a, b) => getFilterOrder(a.id, filterConfig) - getFilterOrder(b.id, filterConfig)
  );
}