export const DEFAULT_CATEGORY_ASSETS = {
  'open-plots': {
    icon: 'Trees',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=60',
  },
  'apartments': {
    icon: 'Building2',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60',
  },
  'independent-houses': {
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=60',
  },
  'gated-communities': {
    icon: 'ShieldCheck',
    image: 'https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=800&q=60',
  },
  'agricultural-lands': {
    icon: 'Wheat',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=60',
  },
  'flats': {
    icon: 'Building',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60',
  },
  'villas': {
    icon: 'Castle',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=60',
  },
  'commercial-properties': {
    icon: 'Building2',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=60',
  },
};

export function mergeCategoryDefaults(list) {
  if (!Array.isArray(list)) return [];
  return list.map((c) => {
    const defaults = DEFAULT_CATEGORY_ASSETS[c.slug] || { icon: 'Home', image: '' };
    return {
      ...c,
      icon: c.icon && c.icon.trim() !== '' ? c.icon : defaults.icon,
      image: c.image && c.image.trim() !== '' ? c.image : defaults.image,
    };
  });
}
