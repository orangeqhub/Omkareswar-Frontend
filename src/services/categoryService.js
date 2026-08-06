import apiClient from './apiClient';
import { PROPERTY_MEDIA_RULES } from '../config/propertyMediaRules';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function unwrapList(response) {
  const data = unwrap(response);
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

async function getCategories() {
  const response = await apiClient.get('/admin/categories');
  return unwrapList(response);
}

async function getPublicCategories() {
  const response = await apiClient.get('/categories');
  return unwrapList(response);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function createCategory(data) {
  const slug = slugify(data.slug || data.nameEn);
  if (!slug) throw new Error('category.error.slugRequired');
  
  const ruleKey = data.ruleKey || slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  await apiClient.post('/admin/categories', {
    ...data,
    slug,
    ruleKey,
  });
  return getCategories();
}

async function updateCategory(slug, patch) {
  let updatedSlug = slug;
  if (patch.slug && patch.slug !== slug) {
    updatedSlug = slugify(patch.slug);
  }
  await apiClient.patch(`/admin/categories/${slug}`, {
    ...patch,
    slug: updatedSlug,
  });
  return getCategories();
}

async function deleteCategory(slug) {
  await apiClient.delete(`/admin/categories/${slug}`);
  return getCategories();
}

async function reorder(slug, direction) {
  await apiClient.patch(`/admin/categories/${slug}/reorder`, {
    direction,
  });
  return getCategories();
}

function getMediaRuleKeys() {
  return Object.keys(PROPERTY_MEDIA_RULES);
}

export const categoryService = {
  getCategories,
  getPublicCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorder,
  getMediaRuleKeys,
};
