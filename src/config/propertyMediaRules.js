/**
 * Default configuration-driven image slot rules per property category.
 * This module is only ever read by mediaRuleService — as the seed data on
 * first load and as the "restore defaults" source. Everything else (the
 * seller wizard, the admin editor) reads rules exclusively through
 * mediaRuleService, never from this file directly.
 *
 * commonSlots: always-generated slots, independent of structure counts.
 * countBasedSlots: maps a numeric structure field to a slot group; one slot
 *   is generated per unit (e.g. bedrooms: 3 -> Bedroom 1, Bedroom 2, Bedroom 3).
 * allowedExtraSpaces: features the seller may explicitly declare via "Add Extra
 *   Space or Feature" — only once declared does a slot for that feature exist.
 *
 * Each slot/group carries: required, order, maxFileSizeMb, allowedExtensions,
 * captionRequired, primaryEligible, plus a labelKey (i18n fallback) and
 * optional labelEn/labelTe overrides that admins can set per rule.
 */

const DEFAULT_MAX_FILE_SIZE_MB = 5;
const DEFAULT_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

function slot(id, labelKey, required, order, overrides = {}) {
  return {
    id,
    labelKey,
    labelEn: '',
    labelTe: '',
    required,
    order,
    maxFileSizeMb: DEFAULT_MAX_FILE_SIZE_MB,
    allowedExtensions: DEFAULT_EXTENSIONS,
    captionRequired: false,
    primaryEligible: true,
    ...overrides,
  };
}

function countGroup(groupLabelKey, required, order) {
  return {
    groupLabelKey,
    groupLabelEn: '',
    groupLabelTe: '',
    required,
    order,
    maxFileSizeMb: DEFAULT_MAX_FILE_SIZE_MB,
    allowedExtensions: DEFAULT_EXTENSIONS,
    captionRequired: false,
    primaryEligible: true,
  };
}

function extra(key, labelKey, order) {
  return { key, labelKey, labelEn: '', labelTe: '', order };
}

const buildingStructureRules = {
  commonSlots: [
    slot('buildingExterior', 'media.slot.buildingExterior', true, 0),
    slot('floorPlan', 'media.slot.floorPlan', true, 1, { captionRequired: true, primaryEligible: false }),
    slot('amenities', 'media.slot.amenities', false, 2),
    slot('locationExterior', 'media.slot.locationExterior', false, 3),
  ],
  countBasedSlots: {
    bedrooms: countGroup('media.slot.bedroom', true, 4),
    bathrooms: countGroup('media.slot.bathroom', true, 5),
    halls: countGroup('media.slot.hall', true, 6),
    balconies: countGroup('media.slot.balcony', false, 7),
    kitchens: countGroup('media.slot.kitchen', true, 8),
  },
  allowedExtraSpaces: [
    extra('poojaRoom', 'media.extra.poojaRoom', 0),
    extra('utilityRoom', 'media.extra.utilityRoom', 1),
    extra('storeRoom', 'media.extra.storeRoom', 2),
    extra('officeRoom', 'media.extra.officeRoom', 3),
    extra('servantRoom', 'media.extra.servantRoom', 4),
    extra('terrace', 'media.extra.terrace', 5),
  ],
};

const landStructureRules = {
  commonSlots: [
    slot('frontView', 'media.slot.frontView', true, 0),
    slot('fullLandView', 'media.slot.fullLandView', true, 1),
    slot('roadAccess', 'media.slot.roadAccess', true, 2),
    slot('boundaryView', 'media.slot.boundaryView', false, 3),
    slot('layoutPlan', 'media.slot.layoutPlan', false, 4, { captionRequired: true, primaryEligible: false }),
    slot('locationMap', 'media.slot.locationMap', false, 5, { primaryEligible: false }),
    slot('nearbyLandmark', 'media.slot.nearbyLandmark', false, 6),
    slot('approvalDocument', 'media.slot.approvalDocument', false, 7, { primaryEligible: false }),
  ],
  countBasedSlots: {},
  allowedExtraSpaces: [
    extra('borewell', 'media.extra.borewell', 0),
    extra('fencing', 'media.extra.fencing', 1),
    extra('shed', 'media.extra.shed', 2),
    extra('farmhouse', 'media.extra.farmhouse', 3),
    extra('irrigationArea', 'media.extra.irrigationArea', 4),
    extra('cropArea', 'media.extra.cropArea', 5),
  ],
};

export const PROPERTY_MEDIA_RULES = {
  apartment: buildingStructureRules,
  independentHouse: buildingStructureRules,
  gatedCommunity: buildingStructureRules,
  residentialPlot: landStructureRules,
  openPlot: landStructureRules,
  commercialPlot: landStructureRules,
  venture: landStructureRules,
  agriculturalLand: {
    ...landStructureRules,
    commonSlots: [
      ...landStructureRules.commonSlots,
      slot('waterSource', 'media.slot.waterSource', false, 8),
      slot('electricityAccess', 'media.slot.electricityAccess', false, 9),
    ],
  },
};
