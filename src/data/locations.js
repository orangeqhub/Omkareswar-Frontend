export const STATES = ['Andhra Pradesh', 'Telangana'];

export const DISTRICTS = {
  'Andhra Pradesh': ['Guntur', 'Krishna', 'Visakhapatnam', 'Prakasam'],
  Telangana: ['Hyderabad', 'Rangareddy', 'Warangal', 'Nalgonda'],
};

export const CITIES = [
  'Guntur',
  'Vijayawada',
  'Visakhapatnam',
  'Ongole',
  'Hyderabad',
  'Warangal',
  'Tenali',
  'Mangalagiri',
];

// Load custom locations from localStorage immediately
if (typeof window !== 'undefined') {
  try {
    const custom = JSON.parse(localStorage.getItem('omkar_custom_locations') || '{"states":[],"districts":{},"cities":[]}');
    
    custom.states.forEach(s => {
      if (!STATES.includes(s)) STATES.push(s);
    });
    
    Object.keys(custom.districts).forEach(state => {
      if (!DISTRICTS[state]) DISTRICTS[state] = [];
      custom.districts[state].forEach(d => {
        if (!DISTRICTS[state].includes(d)) DISTRICTS[state].push(d);
      });
    });

    custom.cities.forEach(c => {
      if (!CITIES.includes(c)) CITIES.push(c);
    });
  } catch (e) {
    console.error('Failed to load custom locations', e);
  }
}

export function addCustomLocation(type, value, extraState) {
  if (typeof window === 'undefined') return;
  try {
    const custom = JSON.parse(localStorage.getItem('omkar_custom_locations') || '{"states":[],"districts":{},"cities":[]}');
    
    if (type === 'state') {
      if (!STATES.includes(value)) {
        STATES.push(value);
        custom.states.push(value);
      }
    } else if (type === 'district') {
      const stateKey = extraState || 'Andhra Pradesh';
      if (!DISTRICTS[stateKey]) DISTRICTS[stateKey] = [];
      if (!DISTRICTS[stateKey].includes(value)) {
        DISTRICTS[stateKey].push(value);
        if (!custom.districts[stateKey]) custom.districts[stateKey] = [];
        custom.districts[stateKey].push(value);
      }
    } else if (type === 'city') {
      if (!CITIES.includes(value)) {
        CITIES.push(value);
        custom.cities.push(value);
      }
    }
    
    localStorage.setItem('omkar_custom_locations', JSON.stringify(custom));
  } catch (e) {
    console.error('Failed to save custom location', e);
  }
}

export const POPULAR_LOCATIONS = [
  { city: 'Guntur', count: 42, image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=60' },
  { city: 'Vijayawada', count: 61, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=60' },
  { city: 'Hyderabad', count: 88, image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=60' },
  { city: 'Mangalagiri', count: 23, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=60' },
  { city: 'Tenali', count: 17, image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=600&q=60' },
  { city: 'Ongole', count: 12, image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=600&q=60' },
];
