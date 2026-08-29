export const CATEGORY_GROUPS = [
  {
    key: 'land',
    title: 'Land & Plots',
    slugs: ['open-plots', 'residential-plots', 'commercial-plots', 'ventures', 'agricultural-lands', 'farm-lands', 'industrial-lands', 'farm-houses'],
  },
  {
    key: 'residential',
    title: 'Houses & Apartments',
    slugs: ['apartments', 'flats', 'independent-houses', 'villas', 'gated-communities'],
  },
  {
    key: 'commercial',
    title: 'Commercial Properties',
    slugs: ['commercial-buildings', 'commercial-properties', 'warehouse-godowns'],
  },
];

export function getCategoryGroupKey(slug) {
  const group = CATEGORY_GROUPS.find((g) => g.slugs.includes(slug));
  return group ? group.key : 'other';
}

const AMENITIES_BY_CATEGORY = {
  apartments: [
    'Lift', 'Power Backup', 'Generator', 'Car Parking', 'Visitor Parking', 'Security', 'CCTV',
    'Swimming Pool', 'Gym', 'Club House', 'Children Play Area', 'Community Hall', 'Indoor Games',
    'Outdoor Games', 'Walking Track', 'Garden', 'Intercom', 'Fire Safety', 'Rainwater Harvesting',
    'Water Supply', 'Sewage Treatment Plant', 'Solar Power',
  ],
  flats: [
    'Lift', 'Power Backup', 'Generator', 'Car Parking', 'Visitor Parking', 'Security', 'CCTV',
    'Swimming Pool', 'Gym', 'Club House', 'Children Play Area', 'Community Hall', 'Indoor Games',
    'Outdoor Games', 'Walking Track', 'Garden', 'Intercom', 'Fire Safety', 'Rainwater Harvesting',
    'Water Supply', 'Sewage Treatment Plant', 'Solar Power',
  ],
  'independent-houses': [
    'Car Parking', 'Borewell', 'Municipal Water', 'Garden', 'Terrace', 'Balcony', 'Modular Kitchen',
    'Pooja Room', 'Store Room', 'Servant Room', 'CCTV', 'Solar Water Heater', 'Power Backup',
    'Compound Wall',
  ],
  villas: [
    'Car Parking', 'Borewell', 'Municipal Water', 'Garden', 'Terrace', 'Balcony', 'Modular Kitchen',
    'Pooja Room', 'Store Room', 'Servant Room', 'CCTV', 'Solar Water Heater', 'Power Backup',
    'Compound Wall',
  ],
  'gated-communities': [
    'Gated Security', 'CCTV', 'Club House', 'Swimming Pool', 'Gym', 'Children Play Area',
    'Walking Track', 'Indoor Games', 'Outdoor Games', 'Community Hall', 'Landscaped Garden',
    '24×7 Water', 'Power Backup', 'Street Lights', 'Visitor Parking', 'Supermarket', 'Temple',
    'Sports Area',
  ],
  'commercial-buildings': [
    'Lift', 'Parking', 'Power Backup', 'CCTV', 'Security', 'Fire Safety', 'Generator', 'Central AC',
    'Washrooms', 'Reception', 'Conference Room', 'Pantry', 'Internet Connectivity',
  ],
  'commercial-properties': [
    'Lift', 'Parking', 'Power Backup', 'CCTV', 'Security', 'Fire Safety', 'Generator', 'Central AC',
    'Washrooms', 'Reception', 'Conference Room', 'Pantry', 'Internet Connectivity',
  ],
  'open-plots': [
    'Gated Entrance', 'Security', 'CC Roads', 'BT Roads', 'Underground Drainage', 'Electricity',
    'Street Lights', 'Water Connection', 'Avenue Plantation', 'Children Park', 'Walking Track',
    'Compound Wall', 'CCTV', 'Club House', 'Temple', 'Community Hall',
  ],
  'residential-plots': [
    'Gated Entrance', 'Security', 'CC Roads', 'BT Roads', 'Underground Drainage', 'Electricity',
    'Street Lights', 'Water Connection', 'Avenue Plantation', 'Children Park', 'Walking Track',
    'Compound Wall', 'CCTV', 'Club House', 'Temple', 'Community Hall',
  ],
  'commercial-plots': [
    'Main Road Facing', 'Highway Access', 'Electricity', 'Water Connection', 'Drainage',
    'Parking Space', 'High Footfall Area', 'Public Transport Nearby', 'Loading / Unloading Access',
  ],
  ventures: [
    'Street Lighting', 'Underground Drainage', 'Avenue Plantation', 'Water Supply', 'Compound Wall', 'Security',
  ],
  'agricultural-lands': [
    'Borewell', 'Canal Water', 'River Nearby', 'Drip Irrigation', 'Electricity', 'Transformer Nearby',
    'Fencing', 'Farm House', 'Storage Shed', 'Motor/Pump', 'Trees / Plantation', 'Main Road Access',
    'Highway Nearby',
  ],
  'farm-lands': [
    'Borewell', 'Canal Water', 'River Nearby', 'Drip Irrigation', 'Electricity', 'Transformer Nearby',
    'Fencing', 'Farm House', 'Storage Shed', 'Motor/Pump', 'Trees / Plantation', 'Main Road Access',
    'Highway Nearby',
  ],
  'industrial-lands': [
    '3-Phase Electricity', 'Transformer', 'Borewell', 'Industrial Water', 'Highway Access',
    'Heavy Vehicle Access', 'Compound Wall', 'Security', 'Drainage', 'Loading Area',
  ],
  'warehouse-godowns': [
    'Truck Parking', 'Loading Dock', '3-Phase Power', 'CCTV', 'Security', 'Fire Safety',
    'Office Room', 'Washroom', 'Water', 'Generator',
  ],
  'farm-houses': [
    'Swimming Pool', 'Garden', 'Plantation', 'Borewell', 'Farm Shed', 'Parking', 'Servant Room',
    'Outdoor Seating', 'Compound Wall', 'CCTV',
  ],
};

const DEFAULT_BUILDING_AMENITIES = [
  'Lift', 'Power Backup', 'Security', 'Parking', 'Water Supply', 'Children Play Area',
];

const DEFAULT_LAND_AMENITIES = [
  'Compound Wall', 'Street Lighting', 'Underground Drainage', 'Avenue Plantation', 'Water Supply', 'Road Access',
];

const DEFAULT_GENERIC_AMENITIES = [
  'Water Supply', 'Security', 'Parking', 'Power Backup', 'Road Access', 'Compound Wall',
];

export function getAmenitiesForCategory(categorySlug, overrides = {}) {
  if (overrides && Array.isArray(overrides[categorySlug]) && overrides[categorySlug].length > 0) {
    return overrides[categorySlug];
  }
  if (AMENITIES_BY_CATEGORY[categorySlug]) return AMENITIES_BY_CATEGORY[categorySlug];
  if (!categorySlug) return DEFAULT_GENERIC_AMENITIES;
  const group = getCategoryGroupKey(categorySlug);
  if (group === 'land') return DEFAULT_LAND_AMENITIES;
  return DEFAULT_BUILDING_AMENITIES;
}

export function getAmenityCategorySlugs(overrides = {}) {
  const slugs = new Set([
    ...CATEGORY_GROUPS.flatMap((g) => g.slugs),
    ...Object.keys(AMENITIES_BY_CATEGORY),
    ...Object.keys(overrides),
  ]);
  return [...slugs];
}

export function getAmenitiesForCategoryGroup(categorySlugs) {
  const list = [];
  (categorySlugs || []).forEach((slug) => {
    getAmenitiesForCategory(slug).forEach((a) => {
      if (!list.includes(a)) list.push(a);
    });
  });
  return list;
}