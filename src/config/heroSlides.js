// Hero carousel slide data. Shaped so this can move to an admin-managed
// service later without changing HeroCarousel's rendering logic — each
// slide already carries everything an admin editor would need (bilingual
// heading/subtitle, an optional active-date window, and a status flag).
export const HERO_SLIDES = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=70',
    headingEn: 'Find the Right Property. Build Your Future.',
    headingTe: 'సరైన ఆస్తిని కనుగొనండి. మీ భవిష్యత్తును నిర్మించండి.',
    subtitleEn: 'Verified plots, apartments and ventures across Andhra Pradesh and Telangana.',
    subtitleTe: 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణలో ధృవీకరించబడిన ప్లాట్లు, అపార్ట్‌మెంట్లు మరియు వెంచర్లు.',
    status: 'active',
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=70',
    headingEn: 'Verified Listings You Can Trust',
    headingTe: 'మీరు విశ్వసించగల ధృవీకరించబడిన లిస్టింగ్‌లు',
    subtitleEn: 'Every property is reviewed by our team before it goes live.',
    subtitleTe: 'ప్రతి ఆస్తిని లైవ్ కావడానికి ముందు మా బృందం సమీక్షిస్తుంది.',
    status: 'active',
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=70',
    headingEn: 'Buyers, Sellers and Mediators — Connected',
    headingTe: 'కొనుగోలుదారులు, విక్రేతలు మరియు మధ్యవర్తులు — అనుసంధానించబడ్డారు',
    subtitleEn: 'A transparent marketplace built for every side of a property transaction.',
    subtitleTe: 'ఆస్తి లావాదేవీలోని ప్రతి పక్షం కోసం నిర్మించిన పారదర్శక మార్కెట్‌ప్లేస్.',
    status: 'active',
  },
  {
    id: 'slide-4',
    image: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=1600&q=70',
    headingEn: 'Ventures Designed for Tomorrow',
    headingTe: 'రేపటి కోసం రూపొందించిన వెంచర్లు',
    subtitleEn: 'Explore our curated open-plot ventures with clear titles and approvals.',
    subtitleTe: 'స్పష్టమైన టైటిల్స్ మరియు అనుమతులతో మా వెంచర్లను అన్వేషించండి.',
    status: 'active',
  },
];

export function getActiveHeroSlides(now = new Date()) {
  return HERO_SLIDES.filter((s) => {
    if (s.status !== 'active') return false;
    if (s.activeFrom && now < new Date(s.activeFrom)) return false;
    if (s.activeTo && now > new Date(s.activeTo)) return false;
    return true;
  });
}
