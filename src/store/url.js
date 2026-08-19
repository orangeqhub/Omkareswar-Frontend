const UPLOAD_URL =
  import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads';

export function resolveMediaUrl(value) {
  if (!value) {
    return '';
  }

  // Handle legacy DB paths missing /uploads/ due to older backend configuration
  let cleanValue = value;
  if (cleanValue.includes('/properties/') && !cleanValue.includes('/uploads/properties/')) {
    cleanValue = cleanValue.replace('/properties/', '/uploads/properties/');
  }

  if (
    cleanValue.startsWith('http://') ||
    cleanValue.startsWith('https://') ||
    cleanValue.startsWith('data:') ||
    cleanValue.startsWith('blob:')
  ) {
    return cleanValue;
  }

  const normalizedPath = cleanValue
    .replace(/^\/+/, '')
    .replace(/^uploads\/+/, '');

  return `${UPLOAD_URL}/${normalizedPath}`;
}