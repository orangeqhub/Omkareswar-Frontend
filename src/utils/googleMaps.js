export function loadGoogleMapsScript(callback) {
  if (typeof window === 'undefined') return;

  if (window.google && window.google.maps) {
    callback();
    return;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key (VITE_GOOGLE_MAPS_API_KEY) is missing in environment.');
    callback(new Error('Missing API Key'));
    return;
  }

  const existingScript = document.getElementById('google-maps-script');
  if (existingScript) {
    // If script is already in the document, attach listeners
    const handleLoad = () => {
      cleanup();
      callback();
    };
    const handleError = () => {
      cleanup();
      callback(new Error('Google Maps script failed to load'));
    };
    const cleanup = () => {
      existingScript.removeEventListener('load', handleLoad);
      existingScript.removeEventListener('error', handleError);
    };
    existingScript.addEventListener('load', handleLoad);
    existingScript.addEventListener('error', handleError);
    return;
  }

  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;

  // Add timeout fallback in case of slow/offline network
  const timeoutId = setTimeout(() => {
    script.onerror = null;
    script.onload = null;
    console.error('Google Maps load timed out.');
    callback(new Error('Timeout'));
  }, 8000);

  script.onload = () => {
    clearTimeout(timeoutId);
    callback();
  };
  script.onerror = () => {
    clearTimeout(timeoutId);
    console.error('Failed to load Google Maps script.');
    callback(new Error('Failed to load'));
  };
  document.head.appendChild(script);
}
