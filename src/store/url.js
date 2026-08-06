const UPLOAD_URL =
  import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads';

export function resolveMediaUrl(value) {
  if (!value) {
    return '';
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  const normalizedPath = value
    .replace(/^\/+/, '')
    .replace(/^uploads\/+/, '');

  return `${UPLOAD_URL}/${normalizedPath}`;
}