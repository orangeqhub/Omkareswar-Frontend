export const FIELD_STEPS = {
  1: 'Basic Details',
  2: 'Location',
  3: 'Price & Size',
  4: 'Structure',
  5: 'Amenities',
  6: 'Media',
  7: 'Contact',
};

const FACING_OPTIONS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'];
const PARKING_OPTIONS = ['Covered', 'Open', 'Both', 'None'];
const CAR_PARKING_OPTIONS = ['Car', 'Bike', 'Both', 'None'];
const COMMERCIAL_PARKING_OPTIONS = ['Basement', 'Stilt', 'Open', 'Multi-level', 'None'];
const PLOT_AREA_UNITS = ['Sq. Ft', 'Sq. Yd', 'Acres', 'Cents', 'Gunta', 'Guntasha', 'Sq. M'];
const LAND_AREA_UNITS = ['Acres', 'Cents', 'Guntas', 'Sq. Yards', 'Hectares'];
const SOIL_OPTIONS = ['Red Soil', 'Black Soil', 'Sandy', 'Loamy', 'Clay', 'Other'];
const OWNERSHIP_OPTIONS = ['Freehold', 'Leasehold', 'Co-operative', 'Others'];
const REGISTRATION_OPTIONS = ['Registered', 'Unregistered', 'Registration Pending'];
const APPROVAL_PLOT_OPTIONS = ['DTCP', 'CRDA', 'RERA', 'Panchayat', 'Other'];
const POSSESSION_OPTIONS = ['Ready to Move', 'Under Construction', 'Completed (Occupation Fit)'];
const BOUNDARY_DIRECTIONS = [
  { id: 'dyn_east', label: 'East', type: 'direction', boundaryId: 'dyn_eastBoundary', feetId: 'dyn_eastFeet' },
  { id: 'dyn_south', label: 'South', type: 'direction', boundaryId: 'dyn_southBoundary', feetId: 'dyn_southFeet' },
  { id: 'dyn_west', label: 'West', type: 'direction', boundaryId: 'dyn_westBoundary', feetId: 'dyn_westFeet' },
  { id: 'dyn_north', label: 'North', type: 'direction', boundaryId: 'dyn_northBoundary', feetId: 'dyn_northFeet' },
];
const DIRECTION_FIELDS = BOUNDARY_DIRECTIONS.map((d) => ({ ...d, step: 4 }));

const RESIDENTIAL_PLOT_FIELDS = [
  { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
  { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: PLOT_AREA_UNITS },
  { id: 'dyn_pricePerSqyd', label: 'Price per Sq.Yard', type: 'number', step: 3 },
  { id: 'dyn_length', label: 'Length', type: 'number', step: 4 },
  { id: 'dyn_width', label: 'Width', type: 'number', step: 4 },
  { id: 'dyn_plotNumber', label: 'Plot Number', type: 'text', step: 4 },
  { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: FACING_OPTIONS },
  { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
  { id: 'dyn_cornerPlot', label: 'Corner Plot', type: 'checkbox', step: 4 },
  { id: 'dyn_boundaryWall', label: 'Boundary Wall', type: 'checkbox', step: 4 },
  { id: 'dyn_approvalType', label: 'Approval Type', type: 'select', step: 4, options: APPROVAL_PLOT_OPTIONS },
  { id: 'dyn_layoutName', label: 'Layout Name', type: 'text', step: 4 },
  { id: 'dyn_surveyNumber', label: 'Survey Number', type: 'text', step: 4 },
  { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
  { id: 'dyn_registrationStatus', label: 'Registration Status', type: 'select', step: 4, options: REGISTRATION_OPTIONS },
  { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
];

const COMMERCIAL_BUILDING_FIELDS = [
  { id: 'dyn_commercialType', label: 'Property Type', type: 'select', step: 4, options: ['Shop', 'Office', 'Showroom', 'Complex', 'Other'] },
  { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 3 },
  { id: 'dyn_carpetArea', label: 'Carpet Area', type: 'number', step: 3 },
  { id: 'dyn_floorNumber', label: 'Floor Number', type: 'number', step: 4 },
  { id: 'dyn_totalFloors', label: 'Total Floors', type: 'number', step: 4 },
  { id: 'dyn_frontage', label: 'Frontage', type: 'text', step: 4 },
  { id: 'dyn_ceilingHeight', label: 'Ceiling Height', type: 'text', step: 4 },
  { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: FURNISHING_OPTIONS },
  { id: 'dyn_washrooms', label: 'Washrooms', type: 'number', step: 4 },
  { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: COMMERCIAL_PARKING_OPTIONS },
  { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: FACING_OPTIONS },
  { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
  { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
  { id: 'dyn_maintenance', label: 'Maintenance Charges', type: 'text', step: 3 },
  { id: 'dyn_suitableBusinessType', label: 'Suitable Business Type', type: 'select', step: 4, options: ['Office', 'Retail', 'Food', 'Healthcare', 'Education', 'Bank', 'Showroom', 'Warehouse', 'Other'] },
  { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
  { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
];

export const CATEGORY_DYNAMIC_FIELDS = {
  'residential-plots': {
    label: 'Residential Plots',
    fields: [...RESIDENTIAL_PLOT_FIELDS, ...DIRECTION_FIELDS],
  },
  'commercial-plots': {
    label: 'Commercial Plots',
    fields: [
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: PLOT_AREA_UNITS },
      { id: 'dyn_pricePerSqyd', label: 'Price per Sq.Yard', type: 'number', step: 3 },
      { id: 'dyn_length', label: 'Length', type: 'number', step: 4 },
      { id: 'dyn_width', label: 'Width', type: 'number', step: 4 },
      { id: 'dyn_frontage', label: 'Frontage', type: 'text', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: FACING_OPTIONS },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_cornerPlot', label: 'Corner Plot', type: 'checkbox', step: 4 },
      { id: 'dyn_commercialApproval', label: 'Commercial Approval', type: 'select', step: 4, options: ['DTCP', 'CRDA', 'RERA', 'Panchayat', 'Municipality', 'Other'] },
      { id: 'dyn_suitableFor', label: 'Suitable For', type: 'select', step: 4, options: ['Shop', 'Office', 'Hotel', 'Hospital', 'Showroom', 'Warehouse', 'Other'] },
      { id: 'dyn_surveyNumber', label: 'Survey Number', type: 'text', step: 4 },
      { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
      { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
      ...DIRECTION_FIELDS,
    ],
  },
  'apartments': {
    label: 'Apartments',
    fields: [
      { id: 'dyn_bhk', label: 'BHK', type: 'select', step: 4, options: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'] },
      { id: 'dyn_bedrooms', label: 'Bedrooms (BHK)', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_carpetArea', label: 'Carpet Area', type: 'number', step: 3 },
      { id: 'dyn_superBuiltUpArea', label: 'Super Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_floorNumber', label: 'Floor Number', type: 'number', step: 4 },
      { id: 'dyn_totalFloors', label: 'Total Floors', type: 'number', step: 4 },
      { id: 'dyn_totalFlats', label: 'Total Flats', type: 'number', step: 4 },
      { id: 'dyn_towerBlockName', label: 'Tower / Block Name', type: 'text', step: 4, placeholder: 'e.g. Block A, Tower 2' },
      { id: 'dyn_flatNumber', label: 'Flat Number', type: 'text', step: 4, adminOnly: true },
      { id: 'dyn_flatsPerFloor', label: 'Flats per Floor', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: FACING_OPTIONS },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: FURNISHING_OPTIONS },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
      { id: 'dyn_constructionYear', label: 'Construction Year', type: 'number', step: 4 },
      { id: 'dyn_possessionStatus', label: 'Possession Status', type: 'select', step: 4, options: POSSESSION_OPTIONS },
      { id: 'dyn_possessionDate', label: 'Possession Date', type: 'text', step: 4 },
      { id: 'dyn_propertyStatus', label: 'Property Status', type: 'select', step: 4, options: ['New Property', 'Resale'] },
      { id: 'dyn_waterSource', label: 'Water Source', type: 'select', step: 4, options: ['Municipal Water', 'Borewell', 'Both', 'Other'] },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: CAR_PARKING_OPTIONS },
      { id: 'dyn_parkingCount', label: 'Parking Count', type: 'number', step: 4 },
      { id: 'dyn_maintenance', label: 'Maintenance Charges (Monthly)', type: 'text', step: 3 },
      { id: 'dyn_approvalDetails', label: 'Approval Details', type: 'text', step: 4 },
      { id: 'dyn_reraNumber', label: 'RERA Number', type: 'text', step: 4 },
      { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
      { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
      ...DIRECTION_FIELDS,
    ],
  },
  'independent-houses': {
    label: 'Independent Houses',
    fields: [
      { id: 'dyn_bedrooms', label: 'Bedrooms', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_carpetArea', label: 'Carpet Area', type: 'number', step: 3 },
      { id: 'dyn_numberOfFloors', label: 'Number of Floors', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: FACING_OPTIONS },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: FURNISHING_OPTIONS },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
      { id: 'dyn_constructionYear', label: 'Construction Year', type: 'number', step: 4 },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: PARKING_OPTIONS },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_cornerPlot', label: 'Corner Property', type: 'checkbox', step: 4 },
      { id: 'dyn_waterSource', label: 'Water Source', type: 'select', step: 4, options: ['Municipal', 'Borewell', 'Well', 'Tanker', 'Multiple'] },
      { id: 'dyn_electricity', label: 'Electricity', type: 'checkbox', step: 4 },
      { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
      { id: 'dyn_registrationStatus', label: 'Registration Status', type: 'select', step: 4, options: REGISTRATION_OPTIONS },
      { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
      ...DIRECTION_FIELDS,
    ],
  },
  'open-plots': {
    label: 'Open Plots',
    fields: [...RESIDENTIAL_PLOT_FIELDS, ...DIRECTION_FIELDS],
  },
  'gated-communities': {
    label: 'Gated Communities',
    fields: [
      { id: 'dyn_projectName', label: 'Project Name', type: 'text', step: 1 },
      { id: 'dyn_propertyType', label: 'Property Type', type: 'select', step: 4, options: ['Villa', 'Duplex', 'Triplex', 'Row House'] },
      { id: 'dyn_bedrooms', label: 'Bedrooms', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_numberOfFloors', label: 'Number of Floors', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: FACING_OPTIONS },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: FURNISHING_OPTIONS },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: PARKING_OPTIONS },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
      { id: 'dyn_possessionStatus', label: 'Possession Status', type: 'select', step: 4, options: POSSESSION_OPTIONS },
      { id: 'dyn_maintenance', label: 'Maintenance Charges', type: 'text', step: 3 },
      { id: 'dyn_approvalType', label: 'Approval Type', type: 'select', step: 4, options: APPROVAL_PLOT_OPTIONS },
      { id: 'dyn_reraNumber', label: 'RERA Number', type: 'text', step: 4 },
      { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
      ...DIRECTION_FIELDS,
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
      { id: 'dyn_approvalType', label: 'Approval Type', type: 'select', step: 4, options: APPROVAL_PLOT_OPTIONS },
      { id: 'dyn_reraNumber', label: 'RERA Number', type: 'text', step: 4 },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_ventureAmenities', label: 'Amenities', type: 'textarea', step: 5 },
      ...DIRECTION_FIELDS,
    ],
  },
  'agricultural-lands': {
    label: 'Agricultural Lands',
    fields: [
      { id: 'dyn_landArea', label: 'Land Area', type: 'number', step: 3 },
      { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: LAND_AREA_UNITS },
      { id: 'dyn_priceType', label: 'Price Type', type: 'select', step: 3, options: ['Total Price', 'Per Acre', 'Per Cent'] },
      { id: 'dyn_nearbyCity', label: 'Nearby City', type: 'text', step: 2 },
      { id: 'dyn_surveyNumber', label: 'Survey Number', type: 'text', step: 4 },
      { id: 'dyn_landType', label: 'Land Type', type: 'select', step: 4, options: ['Wet Land', 'Dry Land', 'Farm Land', 'Garden', 'Plantation', 'Other'] },
      { id: 'dyn_soilType', label: 'Soil Type', type: 'select', step: 4, options: SOIL_OPTIONS },
      { id: 'dyn_roadFacing', label: 'Road Facing', type: 'text', step: 4 },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_facing', label: 'Land Facing', type: 'select', step: 4, options: FACING_OPTIONS },
      { id: 'dyn_waterAvailability', label: 'Water Availability', type: 'select', step: 4, options: ['Canal', 'River', 'Borewell', 'Well', 'Pond', 'Good', 'Moderate', 'Scarce'] },
      { id: 'dyn_electricity', label: 'Electricity Availability', type: 'checkbox', step: 4 },
      { id: 'dyn_borewellCount', label: 'Borewell Count', type: 'number', step: 4 },
      { id: 'dyn_agriElectricity', label: 'Agricultural Electricity Connection', type: 'checkbox', step: 4 },
      { id: 'dyn_fencing', label: 'Boundary / Fencing', type: 'checkbox', step: 4 },
      { id: 'dyn_landShape', label: 'Land Shape', type: 'select', step: 4, options: ['Square', 'Rectangular', 'Regular', 'Irregular'] },
      { id: 'dyn_approachRoad', label: 'Approach Road Type', type: 'select', step: 4, options: ['BT Road', 'CC Road', 'Mud Road', 'Other'] },
      { id: 'dyn_distanceFromRoad', label: 'Distance from Main Road', type: 'text', step: 4 },
      { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
      { id: 'dyn_registrationStatus', label: 'Registration Status', type: 'select', step: 4, options: REGISTRATION_OPTIONS },
      { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
      ...DIRECTION_FIELDS,
    ],
  },
  'flats': {
    label: 'Flats',
    fields: [
      { id: 'dyn_bhk', label: 'BHK', type: 'select', step: 4, options: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'] },
      { id: 'dyn_bedrooms', label: 'Bedrooms (BHK)', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_carpetArea', label: 'Carpet Area', type: 'number', step: 3 },
      { id: 'dyn_superBuiltUpArea', label: 'Super Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_floorNumber', label: 'Floor Number', type: 'number', step: 4 },
      { id: 'dyn_totalFloors', label: 'Total Floors', type: 'number', step: 4 },
      { id: 'dyn_totalFlats', label: 'Total Flats', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: FACING_OPTIONS },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: FURNISHING_OPTIONS },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
      { id: 'dyn_possessionStatus', label: 'Possession Status', type: 'select', step: 4, options: POSSESSION_OPTIONS },
      { id: 'dyn_possessionDate', label: 'Possession Date', type: 'text', step: 4 },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: CAR_PARKING_OPTIONS },
      { id: 'dyn_parkingCount', label: 'Parking Count', type: 'number', step: 4 },
      { id: 'dyn_maintenance', label: 'Maintenance Charges (Monthly)', type: 'text', step: 3 },
      { id: 'dyn_approvalDetails', label: 'Approval Details', type: 'text', step: 4 },
      { id: 'dyn_reraNumber', label: 'RERA Number', type: 'text', step: 4 },
      { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
      { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
    ],
  },
  'villas': {
    label: 'Villas',
    fields: [
      { id: 'dyn_bedrooms', label: 'Bedrooms', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_balconies', label: 'Balconies', type: 'number', step: 4 },
      { id: 'dyn_plotArea', label: 'Plot Area', type: 'number', step: 3 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_carpetArea', label: 'Carpet Area', type: 'number', step: 3 },
      { id: 'dyn_numberOfFloors', label: 'Number of Floors', type: 'number', step: 4 },
      { id: 'dyn_facing', label: 'Facing', type: 'select', step: 4, options: FACING_OPTIONS },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: FURNISHING_OPTIONS },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
      { id: 'dyn_constructionYear', label: 'Construction Year', type: 'number', step: 4 },
      { id: 'dyn_parking', label: 'Parking', type: 'select', step: 4, options: PARKING_OPTIONS },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_cornerPlot', label: 'Corner Property', type: 'checkbox', step: 4 },
      { id: 'dyn_waterSource', label: 'Water Source', type: 'select', step: 4, options: ['Municipal', 'Borewell', 'Well', 'Tanker', 'Multiple'] },
      { id: 'dyn_electricity', label: 'Electricity', type: 'checkbox', step: 4 },
      { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
      { id: 'dyn_registrationStatus', label: 'Registration Status', type: 'select', step: 4, options: REGISTRATION_OPTIONS },
      { id: 'dyn_loanAvailability', label: 'Loan Availability', type: 'checkbox', step: 4 },
      ...DIRECTION_FIELDS,
    ],
  },
  'farm-lands': {
    label: 'Farm Lands',
    fields: [
      { id: 'dyn_landArea', label: 'Land Area', type: 'number', step: 3 },
      { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: LAND_AREA_UNITS },
      { id: 'dyn_farmType', label: 'Farm Type', type: 'select', step: 4, options: ['Organic', 'Traditional', 'Plantation', 'Horticulture', 'Mixed', 'Other'] },
      { id: 'dyn_soilType', label: 'Soil Type', type: 'select', step: 4, options: SOIL_OPTIONS },
      { id: 'dyn_waterSource', label: 'Water Source', type: 'select', step: 4, options: ['Well', 'Borewell', 'Canal', 'River', 'Pond', 'Multiple'] },
      { id: 'dyn_borewell', label: 'Borewell', type: 'checkbox', step: 4 },
      { id: 'dyn_electricity', label: 'Electricity', type: 'checkbox', step: 4 },
      { id: 'dyn_roadAccess', label: 'Road Access', type: 'checkbox', step: 4 },
      { id: 'dyn_fencing', label: 'Fencing', type: 'checkbox', step: 4 },
      { id: 'dyn_farmHouse', label: 'Farm House', type: 'checkbox', step: 4 },
      { id: 'dyn_cropsTrees', label: 'Crops/Trees', type: 'text', step: 4 },
      { id: 'dyn_surveyNumber', label: 'Survey Number', type: 'text', step: 4 },
      ...DIRECTION_FIELDS,
    ],
  },
  'commercial-buildings': {
    label: 'Commercial Buildings',
    fields: [...COMMERCIAL_BUILDING_FIELDS, ...DIRECTION_FIELDS],
  },
  'commercial-properties': {
    label: 'Commercial Properties',
    fields: [...COMMERCIAL_BUILDING_FIELDS, ...DIRECTION_FIELDS],
  },
  'industrial-lands': {
    label: 'Industrial Lands',
    fields: [
      { id: 'dyn_landArea', label: 'Land Area', type: 'number', step: 3 },
      { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: LAND_AREA_UNITS },
      { id: 'dyn_pricePerUnit', label: 'Price per Acre / Sq.Yard', type: 'number', step: 3 },
      { id: 'dyn_industrialApproval', label: 'Industrial Approval', type: 'select', step: 4, options: ['DTCP', 'APIIC', 'HMDA', 'CRDA', 'RERA', 'Other'] },
      { id: 'dyn_surveyNumber', label: 'Survey Number', type: 'text', step: 4 },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_highwayDistance', label: 'Highway Distance', type: 'text', step: 4 },
      { id: 'dyn_facing', label: 'Land Facing', type: 'select', step: 4, options: FACING_OPTIONS },
      { id: 'dyn_electricityCapacity', label: 'Electricity Capacity', type: 'text', step: 4 },
      { id: 'dyn_waterAvailability', label: 'Water Availability', type: 'select', step: 4, options: ['Industrial Water', 'Borewell', 'Municipal', 'Well', 'River', 'Scarce'] },
      { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
      { id: 'dyn_registrationStatus', label: 'Registration Status', type: 'select', step: 4, options: REGISTRATION_OPTIONS },
      { id: 'dyn_suitableIndustry', label: 'Suitable Industry Type', type: 'text', step: 4 },
      ...DIRECTION_FIELDS,
    ],
  },
  'warehouse-godowns': {
    label: 'Warehouses / Godowns',
    fields: [
      { id: 'dyn_totalArea', label: 'Total Area', type: 'number', step: 3 },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_openArea', label: 'Open Area', type: 'number', step: 3 },
      { id: 'dyn_ceilingHeight', label: 'Ceiling Height', type: 'text', step: 4 },
      { id: 'dyn_entryGateWidth', label: 'Entry Gate Width', type: 'text', step: 4 },
      { id: 'dyn_floorLoad', label: 'Floor Load Capacity', type: 'text', step: 4 },
      { id: 'dyn_parkingArea', label: 'Parking Area', type: 'text', step: 4 },
      { id: 'dyn_loadingArea', label: 'Loading / Unloading Area', type: 'text', step: 4 },
      { id: 'dyn_roadWidth', label: 'Road Width', type: 'text', step: 4 },
      { id: 'dyn_powerAvail', label: 'Power Availability', type: 'checkbox', step: 4 },
      { id: 'dyn_securityDeposit', label: 'Security Deposit', type: 'text', step: 3 },
      { id: 'dyn_propertyAge', label: 'Property Age', type: 'text', step: 4 },
      ...DIRECTION_FIELDS,
    ],
  },
  'farm-houses': {
    label: 'Farm Houses',
    fields: [
      { id: 'dyn_landArea', label: 'Total Land Area', type: 'number', step: 3 },
      { id: 'dyn_areaUnit', label: 'Area Unit', type: 'select', step: 3, options: LAND_AREA_UNITS },
      { id: 'dyn_builtUpArea', label: 'Built-up Area', type: 'number', step: 3 },
      { id: 'dyn_bedrooms', label: 'Bedrooms', type: 'number', step: 4 },
      { id: 'dyn_bathrooms', label: 'Bathrooms', type: 'number', step: 4 },
      { id: 'dyn_furnishing', label: 'Furnishing', type: 'select', step: 4, options: FURNISHING_OPTIONS },
      { id: 'dyn_landType', label: 'Land Type', type: 'select', step: 4, options: ['Wet Land', 'Dry Land', 'Farm Land', 'Garden', 'Plantation', 'Other'] },
      { id: 'dyn_waterSource', label: 'Water Source', type: 'select', step: 4, options: ['Borewell', 'Well', 'Canal', 'River', 'Pond', 'Municipal', 'Multiple'] },
      { id: 'dyn_borewell', label: 'Borewell', type: 'checkbox', step: 4 },
      { id: 'dyn_electricity', label: 'Electricity', type: 'checkbox', step: 4 },
      { id: 'dyn_roadAccess', label: 'Road Access', type: 'checkbox', step: 4 },
      { id: 'dyn_fencing', label: 'Boundary / Fencing', type: 'checkbox', step: 4 },
      { id: 'dyn_ownershipType', label: 'Ownership Type', type: 'select', step: 4, options: OWNERSHIP_OPTIONS },
      { id: 'dyn_registrationStatus', label: 'Registration Status', type: 'select', step: 4, options: REGISTRATION_OPTIONS },
      ...DIRECTION_FIELDS,
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
