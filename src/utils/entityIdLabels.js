import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { propertyService } from '../services/propertyService';
import { enquiryService } from '../services/enquiryService';
import { visitService } from '../services/visitService';

const PROPERTY_STATUSES = ['draft', 'pending', 'active', 'sold', 'rejected', 'changes_requested'];

let cachedMaps = null;
let loadPromise = null;

async function safe(promise) {
  try {
    return await promise;
  } catch {
    return [];
  }
}

function toMap(items, codeKey) {
  const map = {};
  (items || []).forEach((item) => {
    if (item?.id && item?.[codeKey]) map[item.id] = item[codeKey];
  });
  return map;
}

async function loadMaps() {
  const [users, enquiries, visits, ...statusLists] = await Promise.all([
    safe(userService.getUsers({ pageSize: 1000 })),
    safe(enquiryService.getAllEnquiries()),
    safe(visitService.getAllVisits()),
    ...PROPERTY_STATUSES.map((status) =>
      safe(propertyService.getProperties({ status, pageSize: 1000 }).then((r) => r?.items || []))
    ),
  ]);
  return {
    userById: toMap(users, 'memberId'),
    propertyById: toMap(statusLists.flat(), 'propertyCode'),
    enquiryById: toMap(enquiries, 'enquiryCode'),
    visitById: toMap(visits, 'visitCode'),
  };
}

export function getEntityMaps() {
  if (cachedMaps) return Promise.resolve(cachedMaps);
  if (!loadPromise) {
    loadPromise = loadMaps()
      .then((maps) => {
        cachedMaps = maps;
        return maps;
      })
      .catch(() => ({ userById: {}, propertyById: {}, enquiryById: {}, visitById: {} }));
  }
  return loadPromise;
}

export function useEntityMaps() {
  const [maps, setMaps] = useState({ userById: {}, propertyById: {}, enquiryById: {}, visitById: {} });
  useEffect(() => {
    let mounted = true;
    getEntityMaps().then((m) => {
      if (mounted) setMaps(m);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return maps;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DESIGNATION_BY_PREFIX = {
  'EMP-': 'Employee',
  'BUY-': 'Buyer',
  'SEL-': 'Seller',
  'MED-': 'Mediator',
  'ADM-': 'Admin',
  'AGT-': 'Agent',
};

function designationFor(value) {
  if (typeof value !== 'string' || !value) return null;
  return DESIGNATION_BY_PREFIX[value.slice(0, 4).toUpperCase()] || null;
}

export function resolveEntityLabel(value, maps = {}) {
  if (typeof value !== 'string' || !value) return null;
  return (
    maps.userById?.[value] ||
    maps.propertyById?.[value] ||
    maps.enquiryById?.[value] ||
    maps.visitById?.[value] ||
    null
  );
}

export function displayEntityValue(key, value, maps = {}) {
  if (value && typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'string') {
    if (key && /Id$/i.test(key)) {
      const label = resolveEntityLabel(value, maps);
      if (label) return label;
      if (UUID_RE.test(value)) return `${value.slice(0, 8)}…`;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value).toLocaleString();
    }
    if (value.length > 40) return `${value.slice(0, 40)}…`;
  }
  return String(value ?? '');
}

const labelOf = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

function entityKeyLabel(key, displayValue) {
  const designation = designationFor(displayValue);
  if (designation) return `${designation} Id`;
  return labelOf(key);
}

export function formatActivityDetails(action, details = {}, maps = {}) {
  const d = details || {};
  switch (action) {
    case 'enquiry.nextFollowUpUpdate':
      return `Scheduled next follow-up on: ${d.nextFollowUpAt ? new Date(d.nextFollowUpAt).toLocaleString() : 'N/A'}`;
    case 'enquiry.statusUpdate':
      return `Updated contact status to: "${d.status || 'N/A'}"`;
    case 'callNote.create':
      return `Created a new phone call note`;
    case 'userVerification.start':
      return `Initiated identity verification check`;
    case 'visit.addNote':
      return `Added inline notes to site visit`;
    case 'employee.registered':
      return `Registered employee account with ID: ${d.memberId || resolveEntityLabel(d.registrationId, maps) || 'N/A'}`;
    case 'user.assignEmployee':
      return `Assigned client to employee`;
    case 'enquiry.assignEmployee':
      return `Delegated enquiry to employee`;
    case 'property.assign':
      return `Assigned employee to moderate listing`;
    case 'visit.assign':
      return `Assigned employee to conduct site visit`;
    case 'followup.assign':
      return `Assigned employee to follow-up`;
    case 'followUp.create':
      return `Added a new CRM follow-up reminder`;
    case 'followUp.statusChange':
      return `Set follow-up status to: "${d.status || 'N/A'}"`;
    default:
      if (Object.keys(d).length === 0) return 'No details recorded';
      return Object.entries(d)
        .map(([key, val]) => {
          const display = displayEntityValue(key, val, maps);
          return `${entityKeyLabel(key, display)}: ${display}`;
        })
        .join(', ');
  }
}

export function detailEntries(details = {}, maps = {}) {
  return Object.entries(details || {}).map(([key, val]) => {
    const display = displayEntityValue(key, val, maps);
    return {
      key,
      label: entityKeyLabel(key, display),
      display,
    };
  });
}
