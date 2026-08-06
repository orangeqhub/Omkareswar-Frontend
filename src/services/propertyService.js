import apiClient from './apiClient';
import { CITY_COORDINATES, haversineDistanceKm, getPropertyCoordinates } from '../utils/geo';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function processNearbyFallback(items, referenceCity) {
  const refCoords = CITY_COORDINATES[referenceCity];
  if (!refCoords) return items;

  const withDistance = items.map((p) => {
    const coords = getPropertyCoordinates(p);
    const distanceKm = coords ? haversineDistanceKm(refCoords.lat, refCoords.lng, coords.lat, coords.lng) : null;
    return distanceKm != null ? { ...p, distanceKm } : p;
  });

  const nearby = withDistance.filter((p) => p.distanceKm != null).sort((a, b) => a.distanceKm - b.distanceKm);
  const remaining = withDistance.filter((p) => p.distanceKm == null);
  return [...nearby, ...remaining];
}

async function getProperties(filters = {}) {
  const response = await apiClient.get('/properties', {
    params: filters,
  });
  const data = unwrap(response);
  const items = data?.items || [];
  if (items.length > 0) return data;

  // Fallback if city was specified and returned no results
  if (filters.city) {
    const fallbackFilters = { ...filters };
    delete fallbackFilters.city;
    const allResponse = await apiClient.get('/properties', {
      params: fallbackFilters,
    });
    const allData = unwrap(allResponse);
    const allItems = allData?.items || [];
    const processedItems = processNearbyFallback(allItems, filters.city);
    return {
      ...allData,
      items: processedItems,
    };
  }

  return data;
}

async function getPropertyById(id) {
  const response = await apiClient.get(`/properties/${id}`);
  return unwrap(response);
}

async function getFeatured(limit = 8, city) {
  const response = await apiClient.get('/properties/featured', {
    params: { limit, city },
  });
  const items = unwrap(response) || [];
  if (items.length > 0) return items;

  // Fallback if city was specified and returned no results
  if (city) {
    const allResponse = await apiClient.get('/properties/featured', {
      params: { limit },
    });
    const allItems = unwrap(allResponse) || [];
    return processNearbyFallback(allItems, city);
  }
  return items;
}

async function getLatest(limit = 8, city) {
  const response = await apiClient.get('/properties/latest', {
    params: { limit, city },
  });
  const items = unwrap(response) || [];
  if (items.length > 0) return items;

  // Fallback if city was specified and returned no results
  if (city) {
    const allResponse = await apiClient.get('/properties/latest', {
      params: { limit },
    });
    const allItems = unwrap(allResponse) || [];
    return processNearbyFallback(allItems, city);
  }
  return items;
}

async function getRelated(property, limit = 4) {
  const propertyId = typeof property === 'object' ? property.id : property;
  const response = await apiClient.get(`/properties/${propertyId}/related`, {
    params: { limit },
  });
  return unwrap(response);
}

async function recordView(id) {
  const response = await apiClient.post(`/properties/${id}/view`);
  return unwrap(response);
}

function getRecentlyViewed() {
  if (typeof window === 'undefined') return Promise.resolve([]);
  try {
    const ids = JSON.parse(localStorage.getItem('omkar_recently_viewed') || '[]');
    if (!ids.length) return Promise.resolve([]);
    
    // Fetch individual properties or all properties to match ids
    return Promise.all(
      ids.slice(0, 20).map((id) =>
        getPropertyById(id).catch(() => null)
      )
    ).then((results) => results.filter(Boolean));
  } catch (err) {
    return Promise.resolve([]);
  }
}

function addRecentlyViewed(id) {
  if (typeof window === 'undefined') return;
  try {
    const ids = JSON.parse(localStorage.getItem('omkar_recently_viewed') || '[]');
    const nextIds = [id, ...ids.filter((v) => v !== id)].slice(0, 20);
    localStorage.setItem('omkar_recently_viewed', JSON.stringify(nextIds));
  } catch (e) {
    console.warn('Failed to save recently viewed to LocalStorage:', e);
  }
}

async function toggleFavourite(userId, propertyId) {
  const response = await apiClient.post(`/users/${userId}/favourites/${propertyId}/toggle`);
  return unwrap(response);
}

async function getFavourites(userId) {
  const response = await apiClient.get(`/users/${userId}/favourites`);
  return unwrap(response);
}

async function getFavouriteIds(userId) {
  const response = await apiClient.get(`/users/${userId}/favourites/ids`);
  return unwrap(response);
}

async function createDraft(sellerId, data) {
  const response = await apiClient.post('/properties/drafts', {
    sellerId,
    ...data,
  });
  return unwrap(response);
}

async function updateDraft(id, patch) {
  const response = await apiClient.patch(`/properties/${id}`, patch);
  return unwrap(response);
}

async function submitForApproval(id) {
  const response = await apiClient.post(`/properties/${id}/submit`);
  return unwrap(response);
}

async function getBySeller(sellerId) {
  const response = await apiClient.get(`/sellers/${sellerId}/properties`);
  const data = unwrap(response);
  return Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
}

async function moderate(id, action, note) {
  const response = await apiClient.post(`/admin/properties/${id}/moderate`, {
    action,
    note,
  });
  return unwrap(response);
}

async function deleteProperty(id) {
  const response = await apiClient.delete(`/properties/${id}`);
  return unwrap(response);
}

async function assignRecord(id, data = {}) {
  const response = await apiClient.patch(`/properties/${id}/assign`, data);
  return unwrap(response);
}

async function isUsedByAnyProperty(categorySlug) {
  const response = await apiClient.get(`/categories/${categorySlug}/in-use`);
  const data = unwrap(response);
  return Boolean(data?.inUse);
}

async function getActiveListingsValue() {
  const res = await getProperties({ status: 'active', pageSize: 1000 });
  const activeProperties = res?.items || [];
  const sum = activeProperties.reduce((acc, p) => {
    const numericPrice = Number(p.price);
    return acc + (isNaN(numericPrice) ? 0 : numericPrice);
  }, 0);

  const safeTotalValue = Math.round(sum);

  const formattedFull = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safeTotalValue);

  return {
    activeCount: activeProperties.length,
    activeListingsValue: safeTotalValue,
    formattedFull,
  };
}

export const propertyService = {
  getProperties,
  getPropertyById,
  getFeatured,
  getLatest,
  getRelated,
  recordView,
  getRecentlyViewed,
  addRecentlyViewed,
  toggleFavourite,
  getFavourites,
  getFavouriteIds,
  createDraft,
  updateDraft,
  submitForApproval,
  getBySeller,
  moderate,
  deleteProperty,
  assignRecord,
  isUsedByAnyProperty,
  getActiveListingsValue,
};
