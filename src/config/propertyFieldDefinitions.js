export const FIELD_STEPS = {
  1: 'Basic Details',
  2: 'Location',
  3: 'Price & Size',
  4: 'Structure',
  5: 'Amenities',
  6: 'Media',
  7: 'Contact',
};

export const CATEGORY_DYNAMIC_FIELDS = {
  'residential-plots': {
    label: 'Residential Plots',
    fields: [
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: ['Sq. Ft', 'Sq. Yd', 'Acres', 'Cents', 'Gunta', 'Guntasha'] },
      { id: 'dyn_length', label: 'Length', type: 'number', step: 4 },
      { id: 'dyn_width', label: 'Width', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_cornerPlot', label: 'Corner Plot', type: 'checkbox', step: 4 },
      { id: 'dyn_boundaryWall', label: 'Boundary Wall', type: 'checkbox', step: 4 },
      { id: 'dyn_approvalType', label: 'Approval Type', type: 'select', step: 4, options: ['Municipality', 'Gram Panchayat', 'DTCP', 'RERA', 'Other'] },
      { id: 'dyn_plotNumber', label: 'Plot Number', type: 'text', step: 4 },
    ],
  },
  'commercial-plots': {
    label: 'Commercial Plots',
    fields: [
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: ['Sq. Ft', 'Sq. Yd', 'Acres', 'Cents'] },
      { id: 'dyn_length', label: 'Length', type: 'number', step: 4 },
      { id: 'dyn_width', label: 'Width', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_frontage', label: 'Frontage', type: 'text', step: 4 },
      { id: 'dyn_cornerPlot', label: 'Corner Plot', type: 'checkbox', step: 4 },
      { id: 'dyn_commercialApproval', label: 'Commercial Approval', type: 'select', step: 4, options: ['Municipality', 'DTCP', 'RERA', 'Other'] },
      { id: 'dyn_suitableFor', label: 'Suitable For', type: 'select', step: 4, options: ['Shop', 'Office', 'Warehouse', 'Showroom', 'Restaurant', 'Hospital', 'School', 'Other'] },
    ],
  },
  'apartments': {
    label: 'Apartments',
    fields: [
      { id: 'dyn_bedrooms', label: 'Bedrooms (BHK)', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 4 },
      { id: 'dyn_carpetArea', label: 'Carpet Area', type: 'number', step: 4 },
      { id: 'dyn_floorNumber', label: 'Floor Number', type: 'number', step: 4 },
      { id: 'dyn_totalFloors', label: 'Total Floors', type: 'number', step: 4 },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'] },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: ['Covered', 'Open', 'Both', 'None'] },
      { id: 'dyn_lift', label: 'Lift', type: 'checkbox', step: 4 },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
    ],
  },
  'independent-houses': {
    label: 'Independent Houses',
    fields: [
      { id: 'dyn_bedrooms', label: 'Bedrooms', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 4 },
      { id: 'dyn_numberOfFloors', label: 'Number of Floors', type: 'number', step: 4 },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'] },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: ['Covered', 'Open', 'Both', 'None'] },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
      { id: 'dyn_waterSource', label: 'Water Source', type: 'select', step: 4, options: ['Municipal', 'Borewell', 'Well', 'Tanker', 'Multiple'] },
    ],
  },
  'open-plots': {
    label: 'Open Plots',
    fields: [
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: ['Sq. Ft', 'Sq. Yd', 'Acres', 'Cents', 'Gunta', 'Guntasha'] },
      { id: 'dyn_length', label: 'Length', type: 'number', step: 4 },
      { id: 'dyn_width', label: 'Width', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_cornerPlot', label: 'Corner Plot', type: 'checkbox', step: 4 },
      { id: 'dyn_boundaryWall', label: 'Boundary Wall', type: 'checkbox', step: 4 },
      { id: 'dyn_approvalType', label: 'Approval Type', type: 'select', step: 4, options: ['Municipality', 'Gram Panchayat', 'DTCP', 'RERA', 'Other'] },
      { id: 'dyn_plotNumber', label: 'Plot Number', type: 'text', step: 4 },
      { id: 'dyn_north', label: 'North', type: 'direction', step: 4, boundaryId: 'dyn_northBoundary', feetId: 'dyn_northFeet' },
      { id: 'dyn_south', label: 'South', type: 'direction', step: 4, boundaryId: 'dyn_southBoundary', feetId: 'dyn_southFeet' },
      { id: 'dyn_east', label: 'East', type: 'direction', step: 4, boundaryId: 'dyn_eastBoundary', feetId: 'dyn_eastFeet' },
      { id: 'dyn_west', label: 'West', type: 'direction', step: 4, boundaryId: 'dyn_westBoundary', feetId: 'dyn_westFeet' },
    ],
  },
  'gated-communities': {
    label: 'Gated Communities',
    fields: [
      { id: 'dyn_propertyType', label: 'Property Type', type: 'select', step: 4, options: ['Apartment', 'Villa', 'Plot', 'Row House'] },
      { id: 'dyn_plotBuiltUpArea', label: 'Plot/Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_bedrooms', label: 'Bedrooms', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: ['Covered', 'Open', 'Both', 'None'] },
      { id: 'dyn_clubhouse', label: 'Clubhouse', type: 'checkbox', step: 5 },
      { id: 'dyn_swimmingPool', label: 'Swimming Pool', type: 'checkbox', step: 5 },
      { id: 'dyn_gym', label: 'Gym', type: 'checkbox', step: 5 },
      { id: 'dyn_security', label: 'Security', type: 'checkbox', step: 5 },
      { id: 'dyn_maintenance', label: 'Maintenance', type: 'text', step: 4 },
    ],
  },
  'ventures': {
    label: 'Ventures',
    fields: [
      { id: 'dyn_ventureName', label: 'Venture Name', type: 'text', step: 1 },
      { id: 'dyn_totalArea', label: 'Total Area', type: 'number', step: 3 },
      { id: 'dyn_availablePlotSizes', label: 'Available Plot Sizes', type: 'text', step: 3 },
      { id: 'dyn_totalPlots', label: 'Total Plots', type: 'number', step: 4 },
      { id: 'dyn_availablePlots', label: 'Available Plots', type: 'number', step: 4 },
      { id: 'dyn_approvalType', label: 'Approval Type', type: 'select', step: 4, options: ['Municipality', 'Gram Panchayat', 'DTCP', 'RERA', 'Other'] },
      { id: 'dyn_reraNumber', label: 'RERA Number', type: 'text', step: 4 },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_ventureAmenities', label: 'Amenities', type: 'textarea', step: 5 },
    ],
  },
  'agricultural-lands': {
    label: 'Agricultural Lands',
    fields: [
      { id: 'dyn_landArea', label: 'Land Area', type: 'number', step: 3 },
      { id: 'dyn_landUnit', label: 'Unit (Acres/Cents)', type: 'select', step: 3, options: ['Acres', 'Cents', 'Gunta', 'Guntasha', 'Hectares'] },
      { id: 'dyn_landType', label: 'Land Type', type: 'select', step: 4, options: ['Dry Land', 'Wet Land', 'Garden', 'Plantation', 'Other'] },
      { id: 'dyn_soilType', label: 'Soil Type', type: 'select', step: 4, options: ['Red Soil', 'Black Soil', 'Sandy', 'Loamy', 'Clay', 'Other'] },
      { id: 'dyn_waterSource', label: 'Water Source', type: 'select', step: 4, options: ['Well', 'Borewell', 'Canal', 'River', 'Pond', 'Multiple'] },
      { id: 'dyn_borewell', label: 'Borewell', type: 'checkbox', step: 4 },
      { id: 'dyn_electricity', label: 'Electricity', type: 'checkbox', step: 4 },
      { id: 'dyn_roadAccess', label: 'Road Access', type: 'checkbox', step: 4 },
      { id: 'dyn_cropType', label: 'Crop Type', type: 'text', step: 4 },
      { id: 'dyn_irrigation', label: 'Irrigation', type: 'select', step: 4, options: ['Drip', 'Sprinkler', 'Flood', 'None', 'Other'] },
      { id: 'dyn_fencing', label: 'Fencing', type: 'checkbox', step: 4 },
      { id: 'dyn_surveyNumber', label: 'Survey Number', type: 'text', step: 4 },
    ],
  },
  'flats': {
    label: 'Flats',
    fields: [
      { id: 'dyn_bedrooms', label: 'Bedrooms (BHK)', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 4 },
      { id: 'dyn_carpetArea', label: 'Carpet Area', type: 'number', step: 4 },
      { id: 'dyn_floorNumber', label: 'Floor Number', type: 'number', step: 4 },
      { id: 'dyn_totalFloors', label: 'Total Floors', type: 'number', step: 4 },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'] },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: ['Covered', 'Open', 'Both', 'None'] },
      { id: 'dyn_lift', label: 'Lift', type: 'checkbox', step: 4 },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
    ],
  },
  'villas': {
    label: 'Villas',
    fields: [
      { id: 'dyn_bedrooms', label: 'Bedrooms', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 4 },
      { id: 'dyn_numberOfFloors', label: 'Number of Floors', type: 'number', step: 4 },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'] },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: ['Covered', 'Open', 'Both', 'None'] },
      { id: 'dyn_garden', label: 'Garden', type: 'checkbox', step: 5 },
      { id: 'dyn_terrace', label: 'Terrace', type: 'checkbox', step: 5 },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
    ],
  },
  'farm-lands': {
    label: 'Farm Lands',
    fields: [
      { id: 'dyn_landArea', label: 'Land Area', type: 'number', step: 3 },
      { id: 'dyn_landUnit', label: 'Unit (Acres/Cents)', type: 'select', step: 3, options: ['Acres', 'Cents', 'Gunta', 'Guntasha', 'Hectares'] },
      { id: 'dyn_farmType', label: 'Farm Type', type: 'select', step: 4, options: ['Organic', 'Traditional', 'Plantation', 'Horticulture', 'Mixed', 'Other'] },
      { id: 'dyn_soilType', label: 'Soil Type', type: 'select', step: 4, options: ['Red Soil', 'Black Soil', 'Sandy', 'Loamy', 'Clay', 'Other'] },
      { id: 'dyn_waterSource', label: 'Water Source', type: 'select', step: 4, options: ['Well', 'Borewell', 'Canal', 'River', 'Pond', 'Multiple'] },
      { id: 'dyn_borewell', label: 'Borewell', type: 'checkbox', step: 4 },
      { id: 'dyn_electricity', label: 'Electricity', type: 'checkbox', step: 4 },
      { id: 'dyn_roadAccess', label: 'Road Access', type: 'checkbox', step: 4 },
      { id: 'dyn_fencing', label: 'Fencing', type: 'checkbox', step: 4 },
      { id: 'dyn_farmHouse', label: 'Farm House', type: 'checkbox', step: 4 },
      { id: 'dyn_cropsTrees', label: 'Crops/Trees', type: 'text', step: 4 },
      { id: 'dyn_surveyNumber', label: 'Survey Number', type: 'text', step: 4 },
    ],
  },
  'commercial-buildings': {
    label: 'Commercial Buildings',
    fields: [
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 4 },
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_numberOfFloors', label: 'Number of Floors', type: 'number', step: 4 },
      { id: 'dyn_availableFloor', label: 'Available Floor', type: 'text', step: 4 },
      { id: 'dyn_washrooms', label: 'Washrooms', type: 'number', step: 4 },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: ['Basement', 'Stilt', 'Open', 'Multi-level', 'None'] },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'] },
      { id: 'dyn_lift', label: 'Lift', type: 'checkbox', step: 4 },
      { id: 'dyn_powerBackup', label: 'Power Backup', type: 'checkbox', step: 4 },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_frontage', label: 'Frontage', type: 'text', step: 4 },
      { id: 'dyn_suitableFor', label: 'Suitable For', type: 'select', step: 4, options: ['Office', 'Retail', 'Showroom', 'Warehouse', 'Restaurant', 'Hospital', 'School', 'Bank', 'Other'] },
    ],
  },
  'commercial-properties': {
    label: 'Commercial Properties',
    fields: [
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 4 },
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_numberOfFloors', label: 'Number of Floors', type: 'number', step: 4 },
      { id: 'dyn_availableFloor', label: 'Available Floor', type: 'text', step: 4 },
      { id: 'dyn_washrooms', label: 'Washrooms', type: 'number', step: 4 },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: ['Basement', 'Stilt', 'Open', 'Multi-level', 'None'] },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'] },
      { id: 'dyn_lift', label: 'Lift', type: 'checkbox', step: 4 },
      { id: 'dyn_powerBackup', label: 'Power Backup', type: 'checkbox', step: 4 },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_frontage', label: 'Frontage', type: 'text', step: 4 },
      { id: 'dyn_suitableFor', label: 'Suitable For', type: 'select', step: 4, options: ['Office', 'Retail', 'Showroom', 'Warehouse', 'Restaurant', 'Hospital', 'School', 'Bank', 'Other'] },
    ],
  },
};

export const FIELD_DEFINITIONS = [
  { id: 'titleEn', step: 1, label: 'Property Title', type: 'text', category: 'both' },
  { id: 'descriptionEn', step: 1, label: 'Description', type: 'textarea', category: 'both' },
  { id: 'ventureName', step: 1, label: 'Venture / Project Name', type: 'text', category: 'both' },

  { id: 'state', step: 2, label: 'State', type: 'text', category: 'both' },
  { id: 'district', step: 2, label: 'District', type: 'text', category: 'both' },
  { id: 'mandal', step: 2, label: 'Mandal', type: 'text', category: 'both' },
  { id: 'cityVillage', step: 2, label: 'City / Village', type: 'text', category: 'both' },
  { id: 'locality', step: 2, label: 'Locality', type: 'text', category: 'both' },
  { id: 'landmark', step: 2, label: 'Landmark', type: 'text', category: 'both' },
  { id: 'pincode', step: 2, label: 'Pincode', type: 'text', category: 'both' },
  { id: 'address', step: 2, label: 'Address', type: 'textarea', category: 'both' },
  { id: 'mapLocation', step: 2, label: 'Map Location', type: 'text', category: 'both' },

  { id: 'price', step: 3, label: 'Price', type: 'number', category: 'both' },
  { id: 'priceNegotiable', step: 3, label: 'Negotiable', type: 'checkbox', category: 'both' },
  { id: 'area', step: 3, label: 'Area', type: 'number', category: 'both' },
  { id: 'areaUnit', step: 3, label: 'Area Unit', type: 'select', category: 'both' },
  { id: 'dimensions', step: 3, label: 'Dimensions', type: 'text', category: 'both' },
  { id: 'pricePerUnit', step: 3, label: 'Price per Unit', type: 'number', category: 'both' },

  { id: 'bedrooms', step: 4, label: 'Bedrooms', type: 'number', category: 'residential' },
  { id: 'bathrooms', step: 4, label: 'Bathrooms', type: 'number', category: 'residential' },
  { id: 'halls', step: 4, label: 'Halls', type: 'number', category: 'residential' },
  { id: 'kitchens', step: 4, label: 'Kitchens', type: 'number', category: 'residential' },
  { id: 'balconies', step: 4, label: 'Balconies', type: 'number', category: 'residential' },
  { id: 'floors', step: 4, label: 'Total Floors', type: 'number', category: 'residential' },
  { id: 'propertyFloor', step: 4, label: 'Property Floor', type: 'number', category: 'residential' },
  { id: 'furnishing', step: 4, label: 'Furnishing', type: 'select', category: 'residential' },
  { id: 'parking', step: 4, label: 'Parking', type: 'text', category: 'residential' },
  { id: 'ageOfProperty', step: 4, label: 'Age of Property', type: 'text', category: 'residential' },
  { id: 'plotLength', step: 4, label: 'Plot Length', type: 'text', category: 'land' },
  { id: 'plotWidth', step: 4, label: 'Plot Width', type: 'text', category: 'land' },
  { id: 'roadWidth', step: 4, label: 'Road Width', type: 'text', category: 'land' },
  { id: 'boundary', step: 4, label: 'Boundary', type: 'text', category: 'land' },

  { id: 'amenities', step: 5, label: 'Amenities', type: 'checkbox', category: 'residential' },

  { id: 'contactName', step: 7, label: 'Contact Person Name', type: 'text', category: 'both' },
  { id: 'contactPhone', step: 7, label: 'Contact Phone', type: 'text', category: 'both' },
  { id: 'preferWhatsapp', step: 7, label: 'Prefer WhatsApp', type: 'checkbox', category: 'both' },
  { id: 'preferCall', step: 7, label: 'Prefer Call', type: 'checkbox', category: 'both' },
  { id: 'hidePhone', step: 7, label: 'Hide Phone from Public', type: 'checkbox', category: 'both' },
];

export function getDynamicFieldsForCategory(categorySlug) {
  const cat = CATEGORY_DYNAMIC_FIELDS[categorySlug];
  return cat ? cat.fields : [];
}

export function getAllDynamicFieldIds() {
  const allIds = new Set();
  Object.values(CATEGORY_DYNAMIC_FIELDS).forEach((cat) => {
    cat.fields.forEach((f) => allIds.add(f.id));
  });
  return [...allIds];
}

export function getFieldConfig(settings) {
  return settings?.fieldConfig || {};
}

export function isFieldEnabled(fieldId, settings) {
  const config = getFieldConfig(settings);
  if (config[fieldId]) return config[fieldId].enabled !== false;
  return true;
}

export function isFieldRequired(fieldId, settings) {
  const config = getFieldConfig(settings);
  if (config[fieldId]) return config[fieldId].required === true;
  return false;
}

export function getFieldLabel(fieldId, fieldConfig = {}) {
  const cfg = fieldConfig[fieldId];
  if (cfg && cfg.label) return cfg.label;
  const def = FIELD_DEFINITIONS.find((d) => d.id === fieldId);
  if (def) return def.label;
  for (const cat of Object.values(CATEGORY_DYNAMIC_FIELDS)) {
    const f = cat.fields.find((fd) => fd.id === fieldId);
    if (f) return f.label;
  }
  return fieldId;
}

export function getFieldType(fieldId, fieldConfig = {}) {
  const cfg = fieldConfig[fieldId];
  if (cfg && cfg.type) return cfg.type;
  const def = FIELD_DEFINITIONS.find((d) => d.id === fieldId);
  if (def) return def.type;
  for (const cat of Object.values(CATEGORY_DYNAMIC_FIELDS)) {
    const f = cat.fields.find((fd) => fd.id === fieldId);
    if (f) return f.type;
  }
  return 'text';
}
