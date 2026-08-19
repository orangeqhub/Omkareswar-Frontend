import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  BadgeCheck,
  Star,
  Eye,
  Flag,
  CalendarPlus,
  HandHeart,
  ChevronRight,
  Scale,
  GraduationCap,
  HeartPulse,
  ShoppingCart,
  Bus,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { cmsService } from '../../services/cmsService';
import { enquiryService } from '../../services/enquiryService';
import { settingsService } from '../../services/settingsService';
import { CATEGORY_DYNAMIC_FIELDS } from '../../config/propertyFieldDefinitions';
import apiClient from '../../services/apiClient';
import { visitService } from '../../services/visitService';
import { useAuthStore } from '../../store/authStore';
import { useFavouritesStore } from '../../store/favouritesStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCompareStore } from '../../store/compareStore';
import { useLanguageStore } from '../../store/languageStore';
import { getLocalizedField } from '../../utils/localize';
import { buildTelLink, buildWhatsAppLink } from '../../utils/contactLinks';
import { toast } from '../../store/toastStore';
import ImageGallery from '../../components/properties/ImageGallery';
import ScheduleVisitModal from '../../components/properties/ScheduleVisitModal';
import PropertyCard from '../../components/properties/PropertyCard';
import HomeLoanCalculator from '../../components/properties/HomeLoanCalculator';
import EmptyState from '../../components/common/EmptyState';

function formatPrice(property) {
  if (!property.price || isNaN(Number(property.price))) return 'Price on Request';
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(property.price);
  return `₹${formatted}`;
}

function maskContactDetails(text, isTelugu) {
  if (!text) return '';
  const phoneRegex = /(\+?91[ \-.]?)?[0]?[6-9]\d{9}|(\+?91[ \-.]?)?[0]?[6-9]\d{2}[ \-.]?\d{3}[ \-.]?\d{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  const phoneReplacement = isTelugu ? '[సంప్రదింపు నంబర్ దాచబడింది]' : '[Contact Support]';
  const emailReplacement = isTelugu ? '[ఇమెయిల్ దాచబడింది]' : '[Email Hidden]';
  
  return text
    .replace(phoneRegex, phoneReplacement)
    .replace(emailRegex, emailReplacement);
}

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function getCalculatedDistanceString(propLat, propLng, landmarkLat, landmarkLng) {
  const lat1 = Number(propLat);
  const lng1 = Number(propLng);
  const lat2 = Number(landmarkLat);
  const lng2 = Number(landmarkLng);

  if (isNaN(lat1) || isNaN(lng1) || lat1 === 0 || lng1 === 0) return null;

  const straightLineDistance = getHaversineDistance(lat1, lng1, lat2, lng2);
  // Estimate road driving distance (x1.25 layout factor)
  const drivingDistance = straightLineDistance * 1.25;
  // Estimate driving time at 40 km/h average (1.5 mins per km)
  const drivingTime = Math.max(1, Math.round(drivingDistance * 1.5));

  return `${drivingDistance.toFixed(1)} km (${drivingTime} mins)`;
}

const LOCALITY_COORDINATES = {
  // Hyderabad localities
  'kokapeta': { lat: 17.3980, lng: 78.3300 },
  'gachibowli': { lat: 17.4401, lng: 78.3489 },
  'madhapur': { lat: 17.4483, lng: 78.3915 },
  'kondapur': { lat: 17.4622, lng: 78.3568 },
  'jubilee hills': { lat: 17.4312, lng: 78.4014 },
  'kukatpally': { lat: 17.4875, lng: 78.3953 },
  // Guntur localities
  'brodipet': { lat: 16.3130, lng: 80.4370 },
  'arundelpet': { lat: 16.3090, lng: 80.4430 },
  'gorantla': { lat: 16.3390, lng: 80.4140 },
  'lakshmipuram': { lat: 16.3070, lng: 80.4280 },
  // Vijayawada localities
  'benz circle': { lat: 16.5010, lng: 80.6480 },
  'kanuru': { lat: 16.4880, lng: 80.6860 },
  'patamata': { lat: 16.4970, lng: 80.6720 },
};

const CITY_COORDINATES = {
  guntur: { lat: 16.3067, lng: 80.4365 },
  vijayawada: { lat: 16.5062, lng: 80.6480 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
};

export default function PropertyDetail() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('properties');
  const language = useLanguageStore((s) => s.language);
  const { user } = useAuthStore();
  const isFavourite = useFavouritesStore((s) => s.isFavourite(propertyId));
  const toggleFavourite = useFavouritesStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(propertyId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const isComparing = useCompareStore((s) => s.isSelected(propertyId));
  const toggleCompare = useCompareStore((s) => s.toggle);

  const [property, setProperty] = useState(null);
  const [related, setRelated] = useState([]);
  const [cms, setCms] = useState(null);
  const [visitOpen, setVisitOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [hasEnquired, setHasEnquired] = useState(false);
  const [hasRequestedVisit, setHasRequestedVisit] = useState(false);
  const [fields, setFields] = useState([]);
  const [enquiryCooldown, setEnquiryCooldown] = useState(0);
  const [visitCooldown, setVisitCooldown] = useState(0);

  const dynamicFacts = useMemo(() => {
    if (!property || !property.dynamicFields) return [];
    const list = [];
    fields.forEach((field) => {
      const val = property.dynamicFields[field.id];
      if (field.type === 'direction') {
        const bVal = property.dynamicFields[field.boundaryId];
        const fVal = property.dynamicFields[field.feetId];
        if ((bVal && bVal.trim()) || (fVal && fVal !== '' && fVal !== '0')) {
          const parts = [];
          if (bVal && bVal.trim()) parts.push(bVal.trim());
          if (fVal && fVal !== '' && fVal !== '0') parts.push(`${fVal} Feet`);
          list.push([field.label, parts.join(' — ')]);
        }
      } else if (val !== undefined && val !== null && val !== '') {
        if (field.type === 'document') {
          list.push([
            field.label,
            <a key={field.id} href={val.startsWith('http') ? val : apiClient.defaults.baseURL + val} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline font-semibold">
              View Document
            </a>
          ]);
        } else if (field.type === 'checkbox') {
          list.push([field.label, val ? 'Yes' : 'No']);
        } else {
          list.push([field.label, String(val)]);
        }
      }
    });

    // Fallback in case configuration changed or dynamic fields were manually created
    Object.keys(property.dynamicFields).forEach((key) => {
      const fieldConfig = fields.find((f) => f.id === key);
      if (!fieldConfig) {
        const val = property.dynamicFields[key];
        if (val !== undefined && val !== null && val !== '') {
          if (typeof val === 'string' && (val.includes('/uploads/') || val.endsWith('.pdf') || val.endsWith('.jpg') || val.endsWith('.png'))) {
            list.push([
              key,
              <a key={key} href={val.startsWith('http') ? val : apiClient.defaults.baseURL + val} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline font-semibold">
                View File
              </a>
            ]);
          } else if (typeof val === 'boolean') {
            list.push([key, val ? 'Yes' : 'No']);
          } else {
            list.push([key, String(val)]);
          }
        }
      }
    });
    return list;
  }, [property, fields]);

  useEffect(() => {
    settingsService.getPublicSettings()
      .then((res) => {
        const customFields = res?.propertyFields || [];
        const catFields = Object.values(CATEGORY_DYNAMIC_FIELDS).flatMap((cat) => cat.fields);
        const allFieldIds = new Set(catFields.map((f) => f.id));
        const merged = [...catFields, ...customFields.filter((f) => !allFieldIds.has(f.id))];
        setFields(merged);
      })
      .catch((err) => console.error('Failed to load fields:', err));
  }, []);

  useEffect(() => {
    let active = true;
    propertyService.getPropertyById(propertyId).then((p) => {
      if (!active) return;
      if (!p) {
        setNotFound(true);
        return;
      }
      setProperty(p);
      propertyService.recordView(propertyId);
      propertyService.getRelated(p).then((r) => active && setRelated(r));
    });
    cmsService.getCms().then((c) => active && setCms(c));
    return () => {
      active = false;
    };
  }, [propertyId]);

  useEffect(() => {
    if (!user || (user.role !== 'buyer' && user.role !== 'seller') || !propertyId) return;

    const enquiryKey = `enquiry_cooldown_${propertyId}`;
    const visitKey = `visit_cooldown_${propertyId}`;

    const now = Date.now();

    const enquiryLast = localStorage.getItem(enquiryKey);
    const enquiryRemaining = enquiryLast ? Math.max(0, 300000 - (now - Number(enquiryLast))) : 0;

    const visitLast = localStorage.getItem(visitKey);
    const visitRemaining = visitLast ? Math.max(0, 300000 - (now - Number(visitLast))) : 0;

    if (enquiryRemaining > 0) {
      setEnquiryCooldown(enquiryRemaining);
      setHasEnquired(true);
    } else {
      setEnquiryCooldown(0);
      enquiryService.getForBuyer(user.mobile).then((list) => {
        if (Array.isArray(list) && list.some((e) => e.propertyId === propertyId)) {
          setHasEnquired(true);
        }
      }).catch(() => {});
    }

    if (visitRemaining > 0) {
      setVisitCooldown(visitRemaining);
      setHasRequestedVisit(true);
    } else {
      setVisitCooldown(0);
      const visitLookup = user.role === 'seller'
        ? visitService.getForSeller(user.id)
        : visitService.getForBuyer(user.id);
      visitLookup.then((list) => {
        if (Array.isArray(list) && list.some((v) => v.propertyId === propertyId)) {
          setHasRequestedVisit(true);
        }
      }).catch(() => {});
    }

    if (enquiryRemaining === 0 && visitRemaining === 0) return;

    const interval = setInterval(() => {
      const t = Date.now();
      const eLeft = enquiryLast ? Math.max(0, 300000 - (t - Number(enquiryLast))) : 0;
      const vLeft = visitLast ? Math.max(0, 300000 - (t - Number(visitLast))) : 0;
      setEnquiryCooldown(eLeft);
      setVisitCooldown(vLeft);
      if (eLeft === 0) setHasEnquired(false);
      if (vLeft === 0) setHasRequestedVisit(false);
      if (eLeft === 0 && vLeft === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [user, propertyId]);

  const handleExpressInterest = useCallback(async () => {
    if (!user) {
      toast.info('Please login to express interest.');
      navigate('/login');
      return;
    }
    try {
      await enquiryService.create({
        propertyId: property.id,
        sellerId: property.sellerId,
        buyerId: user.id,
        buyerName: user.name || user.fullName || 'Buyer',
        buyerPhone: user.mobile || user.phone || '',
        message: 'Just Enquired',
        channel: 'interest',
      });
      setHasEnquired(true);
      setEnquiryCooldown(300000);
      localStorage.setItem(`enquiry_cooldown_${property.id}`, Date.now().toString());
      toast.success(language === 'te' ? 'ఎన్‌క్వైరీ విజయవంతంగా పంపబడింది (Just Enquired).' : 'Just Enquired! Your request has been sent.');
    } catch (err) {
      toast.error(err.message || 'Failed to send enquiry. Please try again.');
    }
  }, [user, property, navigate, language]);

  async function handleScheduleVisit(date) {
    if (!user) {
      toast.info('Please login to schedule a visit.');
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer' && user.role !== 'seller') {
      toast.info('Only buyers and sellers can schedule visits.');
      return;
    }
    try {
      await visitService.schedule({
        propertyId: property.id,
        propertyTitle: title || property.titleEn || property.titleTe || property.id,
        buyerId: user.id,
        buyerName: user.name || user.fullName || user.email || user.mobile || 'User',
        buyerMobile: user.mobile || '',
        sellerId: property.sellerId || null,
        scheduledFor: date,
      });
      setVisitOpen(false);
      setHasRequestedVisit(true);
      setVisitCooldown(300000);
      localStorage.setItem(`visit_cooldown_${property.id}`, Date.now().toString());
      toast.success(language === 'te' ? 'విజిట్ రిక్వెస్ట్ పంపబడింది (Just Requested).' : 'Visit requested successfully (Just Requested)!');
    } catch (err) {
      toast.error(err.message || 'Failed to schedule visit. Please try again.');
    }
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: property.titleEn, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      toast.success('Link copied to clipboard.');
    }
  }

  function handleReport() {
    toast.success('Thank you. This property has been reported to our moderation team.');
  }

  function handleFavourite() {
    if (!user) {
      toast.info('Please login to save properties.');
      return;
    }
    toggleFavourite(user.id, property.id);
  }

  function handleCompare() {
    const result = toggleCompare(property.id);
    if (!result.ok && result.reason === 'maxReached') {
      toast.error(t('compare.maxReached', { ns: 'dashboard' }));
    } else if (!result.ok && result.reason === 'alreadyAdded') {
      toast.info(t('compare.alreadyAdded', { ns: 'dashboard' }));
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState titleKey="empty.noResults" />
      </div>
    );
  }

  if (!property) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-500">{t('loading', { ns: 'common' })}</div>;
  }

  const title = getLocalizedField(property, 'title', language);
  const location = getLocalizedField(property, 'location', language);
  const rawDescription = getLocalizedField(property, 'description', language);
  const description = maskContactDetails(rawDescription, language === 'te');

  const facts = [
    ...(property.structure
      ? [
          [t('detail.bedroomsLabel'), property.structure.bedrooms],
          [t('detail.bathroomsLabel'), property.structure.bathrooms],
          [t('detail.hallsLabel'), property.structure.halls],
          [t('detail.balconiesLabel'), property.structure.balconies],
          [t('detail.facingLabel'), property.structure.facing],
          [t('detail.furnishingLabel'), property.structure.furnishing],
          [t('detail.parkingLabel'), property.structure.parking],
          [t('detail.floorLabel'), `${property.structure.propertyFloor}/${property.structure.floors}`],
          [t('detail.ageLabel'), property.structure.ageOfProperty],
        ]
      : []),
    ...(property.plotDetails
      ? Object.entries(property.plotDetails).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v])
      : []),
    ...dynamicFacts,
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');

  const getNearbyPlaces = (city) => {
    const cityName = city || 'Guntur';
    let propLat = property.mapLat;
    let propLng = property.mapLng;

    // Fallback to known locality coordinates if null
    if ((!propLat || Number(propLat) === 0) && property.locality) {
      const normalizedLoc = property.locality.toLowerCase().trim();
      if (LOCALITY_COORDINATES[normalizedLoc]) {
        propLat = LOCALITY_COORDINATES[normalizedLoc].lat;
        propLng = LOCALITY_COORDINATES[normalizedLoc].lng;
      }
    }

    // Fallback to known city coordinates if still null
    if ((!propLat || Number(propLat) === 0) && property.city) {
      const normalizedCity = property.city.toLowerCase().trim();
      if (CITY_COORDINATES[normalizedCity]) {
        propLat = CITY_COORDINATES[normalizedCity].lat;
        propLng = CITY_COORDINATES[normalizedCity].lng;
      }
    }
    
    if (cityName.toLowerCase().includes('guntur')) {
      return [
        {
          category: language === 'te' ? 'పాఠశాలలు & విద్యా సంస్థలు' : 'Schools & Education',
          icon: GraduationCap,
          color: 'bg-blue-50 text-blue-700',
          items: [
            { name: language === 'te' ? 'గుంటూరు పబ్లిక్ స్కూల్' : 'Guntur Public School', distance: getCalculatedDistanceString(propLat, propLng, 16.3136, 80.4216) || '1.2 km (5 mins)' },
            { name: language === 'te' ? 'విజ్ఞాన్ పబ్లిక్ స్కూల్' : 'Vignan Public School', distance: getCalculatedDistanceString(propLat, propLng, 16.3262, 80.4074) || '2.5 km (8 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'ఆసుపత్రులు & వైద్య సేవలు' : 'Hospitals & Healthcare',
          icon: HeartPulse,
          color: 'bg-red-50 text-red-700',
          items: [
            { name: language === 'te' ? 'రమేష్ హాస్పిటల్స్ గుంటూరు' : 'Ramesh Hospitals Guntur', distance: getCalculatedDistanceString(propLat, propLng, 16.3197, 80.4284) || '0.8 km (3 mins)' },
            { name: language === 'te' ? 'సెయింట్ జోసెఫ్ హాస్పిటల్' : 'St. Joseph\'s Hospital', distance: getCalculatedDistanceString(propLat, propLng, 16.3022, 80.4439) || '1.5 km (5 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'షాపింగ్ & సూపర్ మార్కెట్లు' : 'Shopping & Supermarkets',
          icon: ShoppingCart,
          color: 'bg-amber-50 text-amber-700',
          items: [
            { name: language === 'te' ? 'ఎన్టీఆర్ మానస సెంటర్' : 'NTR Manasa Center Mall', distance: getCalculatedDistanceString(propLat, propLng, 16.3106, 80.4358) || '2.0 km (7 mins)' },
            { name: language === 'te' ? 'సిటీ సూపర్ మార్కెట్' : 'City Supermarket', distance: getCalculatedDistanceString(propLat, propLng, 16.3072, 80.4411) || '0.5 km (2 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'రవాణా సౌకర్యాలు' : 'Transit & Stations',
          icon: Bus,
          color: 'bg-green-50 text-green-700',
          items: [
            { name: language === 'te' ? 'గుంటూరు బస్ స్టేషన్' : 'Guntur Bus Station', distance: getCalculatedDistanceString(propLat, propLng, 16.2974, 80.4532) || '1.0 km (4 mins)' },
            { name: language === 'te' ? 'గుంటూరు జంక్షన్ రైల్వే స్టేชั่น' : 'Guntur Junction Railway', distance: getCalculatedDistanceString(propLat, propLng, 16.2996, 80.4503) || '4.5 km (15 mins)' },
          ],
        },
      ];
    }

    if (cityName.toLowerCase().includes('vijayawada')) {
      return [
        {
          category: language === 'te' ? 'పాఠశాలలు & విద్యా సంస్థలు' : 'Schools & Education',
          icon: GraduationCap,
          color: 'bg-blue-50 text-blue-700',
          items: [
            { name: language === 'te' ? 'ఢిల్లీ పబ్లిక్ స్కూల్ విజయవాడ' : 'Delhi Public School Vijayawada', distance: getCalculatedDistanceString(propLat, propLng, 16.4812, 80.6974) || '1.8 km (6 mins)' },
            { name: language === 'te' ? 'ఎన్ఎస్ఎమ్ పబ్లిక్ స్కూల్' : 'NSM Public School', distance: getCalculatedDistanceString(propLat, propLng, 16.5108, 80.6432) || '2.2 km (8 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'ఆసుపత్రులు & వైద్య సేవలు' : 'Hospitals & Healthcare',
          icon: HeartPulse,
          color: 'bg-red-50 text-red-700',
          items: [
            { name: language === 'te' ? 'ఆయుష్ హాస్పిటల్స్' : 'Ayush Hospitals', distance: getCalculatedDistanceString(propLat, propLng, 16.5054, 80.6651) || '1.1 km (4 mins)' },
            { name: language === 'te' ? 'ఆంధ్ర హాస్పిటల్స్' : 'Andhra Hospitals', distance: getCalculatedDistanceString(propLat, propLng, 16.5192, 80.6514) || '1.9 km (6 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'షాపింగ్ & సూపర్ మార్కెట్లు' : 'Shopping & Supermarkets',
          icon: ShoppingCart,
          color: 'bg-amber-50 text-amber-700',
          items: [
            { name: language === 'te' ? 'पिవిపి స్క్వేర్ మాల్' : 'PVP Square Mall', distance: getCalculatedDistanceString(propLat, propLng, 16.5074, 80.6358) || '1.5 km (5 mins)' },
            { name: language === 'te' ? 'ట్రెండ్‌సెట్ మాల్' : 'Trendset Mall', distance: getCalculatedDistanceString(propLat, propLng, 16.5036, 80.6642) || '2.4 km (8 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'రవాణా సౌకర్యాలు' : 'Transit & Stations',
          icon: Bus,
          color: 'bg-green-50 text-green-700',
          items: [
            { name: language === 'te' ? 'పండిట్ నెహ్రూ బస్ స్టేషన్' : 'Pandit Nehru Bus Station', distance: getCalculatedDistanceString(propLat, propLng, 16.5088, 80.6192) || '2.0 km (7 mins)' },
            { name: language === 'te' ? 'విజయవాడ జంక్షన్ రైల్వే స్టేషన్' : 'Vijayawada Junction Railway', distance: getCalculatedDistanceString(propLat, propLng, 16.5186, 80.6204) || '3.5 km (12 mins)' },
          ],
        },
      ];
    }

    if (cityName.toLowerCase().includes('hyderabad')) {
      return [
        {
          category: language === 'te' ? 'పాఠశాలలు & విద్యా సంస్థలు' : 'Schools & Education',
          icon: GraduationCap,
          color: 'bg-blue-50 text-blue-700',
          items: [
            { name: language === 'te' ? 'ఓక్రిడ్జ్ ఇంటర్నేషనల్ స్కూల్' : 'Oakridge International School', distance: getCalculatedDistanceString(propLat, propLng, 17.4170, 78.3418) || '2.0 km (7 mins)' },
            { name: language === 'te' ? 'చిరెక్ ఇంటర్నేషనల్ స్కూల్' : 'Chirec International School', distance: getCalculatedDistanceString(propLat, propLng, 17.4646, 78.3614) || '3.1 km (10 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'ఆసుపత్రులు & వైద్య సేవలు' : 'Hospitals & Healthcare',
          icon: HeartPulse,
          color: 'bg-red-50 text-red-700',
          items: [
            { name: language === 'te' ? 'అపోలో హాస్పిటల్స్ జూబ్లీహిల్స్' : 'Apollo Hospitals Jubilee Hills', distance: getCalculatedDistanceString(propLat, propLng, 17.4172, 78.4116) || '1.5 km (5 mins)' },
            { name: language === 'te' ? 'ఏఐజి హాస్పిటల్స్' : 'AIG Hospitals', distance: getCalculatedDistanceString(propLat, propLng, 17.4475, 78.3756) || '2.8 km (8 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'షాపింగ్ & సూపర్ మార్కెట్లు' : 'Shopping & Supermarkets',
          icon: ShoppingCart,
          color: 'bg-amber-50 text-amber-700',
          items: [
            { name: language === 'te' ? 'ఇనార్బిట్ మాల్ సైబరాబాద్' : 'Inorbit Mall Cyberabad', distance: getCalculatedDistanceString(propLat, propLng, 17.4346, 78.3831) || '1.2 km (4 mins)' },
            { name: language === 'te' ? 'శరత్ సిటీ క్యాపిటల్ మాల్' : 'Sarath City Capital Mall', distance: getCalculatedDistanceString(propLat, propLng, 17.4583, 78.3638) || '3.4 km (12 mins)' },
          ],
        },
        {
          category: language === 'te' ? 'రవాణా సౌకర్యాలు' : 'Transit & Stations',
          icon: Bus,
          color: 'bg-green-50 text-green-700',
          items: [
            { name: language === 'te' ? 'ఎంజిబిఎస్ బస్ స్టేషన్' : 'MGBS Bus Station', distance: getCalculatedDistanceString(propLat, propLng, 17.3788, 78.4812) || '4.0 km (15 mins)' },
            { name: language === 'te' ? 'సికింద్రాబాద్ రైల్వే స్టేషన్' : 'Secunderabad Railway', distance: getCalculatedDistanceString(propLat, propLng, 17.4347, 78.5015) || '6.5 km (22 mins)' },
          ],
        },
      ];
    }

    // Default for other cities
    return [
      {
        category: language === 'te' ? 'పాఠశాలలు & విద్యా సంస్థలు' : 'Schools & Education',
        icon: GraduationCap,
        color: 'bg-blue-50 text-blue-700',
        items: [
          { name: language === 'te' ? `${cityName} పబ్లిక్ స్కూల్` : `${cityName} Public School`, distance: getCalculatedDistanceString(propLat, propLng, propLat + 0.009, propLng - 0.005) || '1.2 km (5 mins)' },
          { name: language === 'te' ? 'జんばんは ఉన్నత పాఠశాల' : 'ZP High School', distance: getCalculatedDistanceString(propLat, propLng, propLat - 0.015, propLng + 0.012) || '2.5 km (8 mins)' },
        ],
      },
      {
        category: language === 'te' ? 'ఆసుపత్రులు & వైద్య సేవలు' : 'Hospitals & Healthcare',
        icon: HeartPulse,
        color: 'bg-red-50 text-red-700',
        items: [
          { name: language === 'te' ? `${cityName} ప్రభుత్వ ఆసుపత్రి` : `${cityName} Government Hospital`, distance: getCalculatedDistanceString(propLat, propLng, propLat - 0.006, propLng + 0.004) || '0.8 km (3 mins)' },
          { name: language === 'te' ? 'ఏరియా ప్రైవేట్ క్లినిక్' : 'Area Private Clinic', distance: getCalculatedDistanceString(propLat, propLng, propLat + 0.011, propLng - 0.009) || '1.5 km (5 mins)' },
        ],
      },
      {
        category: language === 'te' ? 'షాపింగ్ & సూపర్ మార్కెట్లు' : 'Shopping & Supermarkets',
        icon: ShoppingCart,
        color: 'bg-amber-50 text-amber-700',
        items: [
          { name: language === 'te' ? `${cityName} షాపింగ్ మాల్` : `${cityName} Shopping Mall`, distance: getCalculatedDistanceString(propLat, propLng, propLat + 0.014, propLng + 0.011) || '2.0 km (7 mins)' },
          { name: language === 'te' ? 'స్థానిక సూపర్ మార్కెట్' : 'Local Supermarket', distance: getCalculatedDistanceString(propLat, propLng, propLat - 0.004, propLng - 0.003) || '0.5 km (2 mins)' },
        ],
      },
      {
        category: language === 'te' ? 'రవాణా సౌకర్యాలు' : 'Transit & Stations',
        icon: Bus,
        color: 'bg-green-50 text-green-700',
        items: [
          { name: language === 'te' ? `${cityName} బస్ స్టాండ్` : `${cityName} Bus Stand`, distance: getCalculatedDistanceString(propLat, propLng, propLat + 0.007, propLng - 0.008) || '1.0 km (4 mins)' },
          { name: language === 'te' ? 'సమీప రైల్వే స్టేషన్' : 'Nearest Railway Station', distance: getCalculatedDistanceString(propLat, propLng, propLat + 0.035, propLng + 0.025) || '4.5 km (15 mins)' },
        ],
      },
    ];
  };

    const nearbyPlaces = getNearbyPlaces(property.city);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
        <Link to="/" className="hover:underline">{t('breadcrumb.home')}</Link>
        <ChevronRight size={14} />
        <Link to={`/properties/category/${property.categorySlug}`} className="hover:underline">
          {t('breadcrumb.properties')}
        </Link>
        <ChevronRight size={14} />
        <span className="line-clamp-1 font-medium text-brand-800">{title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <ImageGallery images={property.images} title={title} />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-2">
                {property.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-brand-700 px-2.5 py-1 text-xs font-semibold text-warm-white">
                    <BadgeCheck size={13} /> {t('card.verified')}
                  </span>
                )}
                {property.featured && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-warm-white">
                    <Star size={13} /> {t('card.featured')}
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-brand-800">{title}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={15} /> <span className="lang-te">{location}</span>
              </p>
            </div>
            <div className="relative flex items-center gap-2">
              <button type="button" onClick={handleFavourite} aria-pressed={isFavourite} className="rounded-full border border-gray-200 p-2.5 hover:bg-gray-50" aria-label="Save property">
                <Heart size={18} fill={isFavourite ? 'currentColor' : 'none'} className={isFavourite ? 'text-red-500' : 'text-gray-500'} />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const added = toggleWishlist(propertyId);
                    const count = useWishlistStore.getState().ids.length;
                    toast.success(added ? `Wishlisted Property (${count})` : 'Removed from wishlist');
                  }}
                  aria-pressed={isWishlisted}
                  className={`rounded-full border p-2.5 ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  aria-label="Wishlist property"
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                {isWishlisted && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-warm-white shadow">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCompare}
                aria-pressed={isComparing}
                aria-label={isComparing ? t('compare.removeFromCompare', { ns: 'dashboard' }) : t('compare.addToCompare', { ns: 'dashboard' })}
                className={`rounded-full border p-2.5 ${isComparing ? 'border-brand-600 bg-brand-600 text-warm-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Scale size={18} />
              </button>
              <button type="button" onClick={handleShare} aria-label={t('buttons.shareProperty', { ns: 'common' })} className="rounded-full border border-gray-200 p-2.5 hover:bg-gray-50">
                <Share2 size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-brand-700">
            {formatPrice(property)} {property.priceNegotiable && <span className="ml-2 text-sm font-normal text-gray-500">({t('detail.negotiable')})</span>}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <span>{t('detail.propertyId')}: {property.propertyCode}</span>
            <span>{t('detail.postedDate')}: {new Date(property.postedDate).toLocaleDateString()}</span>
            <span>{t('detail.updatedDate')}: {new Date(property.updatedDate).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {t('detail.views', { count: property.views })}</span>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-brand-800">{t('detail.description')}</h2>
            <p className="mt-2 whitespace-pre-line text-gray-700 lang-te">{description}</p>
          </section>

          {facts.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-brand-800">{t('detail.facts')}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
                    <dd className="text-sm font-medium text-gray-800">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {property.amenities?.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-brand-800">{t('detail.amenities')}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-brand-50 px-3 py-1.5 text-sm text-brand-800">{a}</span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-brand-800">{t('detail.nearbyLandmarks')}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {property.city} {t('breadcrumb.properties')} &middot; {property.district}, {property.state}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-brand-800">
              {language === 'te' ? 'దగ్గర్లోని ముఖ్య ప్రాంతాలు' : 'Nearby Places & Landmarks'}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {nearbyPlaces.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50/30 p-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${cat.color}`}>
                        <IconComponent size={18} />
                      </span>
                      <h3 className="text-sm font-bold text-gray-800">{cat.category}</h3>
                    </div>
                    <ul className="mt-3 space-y-2 border-t border-gray-100 pt-2.5">
                      {cat.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center justify-between text-xs text-gray-600">
                          <span>{item.name}</span>
                          <span className="font-medium text-brand-700">{item.distance}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="loan-calculator" className="mt-8">
            <HomeLoanCalculator property={property} />
          </section>

          <button
            type="button"
            onClick={handleReport}
            className="mt-8 flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
          >
            <Flag size={15} /> {t('buttons.reportProperty', { ns: 'common' })}
          </button>

          <p className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">{cms ? getLocalizedField(cms, 'disclaimer', language) : t('detail.disclaimer')}</p>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3 rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-brand-800">
              {property.sellerId?.startsWith('u-mediator') ? t('detail.contactMediator') : t('detail.contactSeller')}
            </h2>
            <p className="text-sm text-gray-600">
              {cms?.propertyContactPhone 
                ? (language === 'te' ? 'కార్యాలయ మద్దతు (Office Support)' : 'Office Support') 
                : property.contactName
              }
            </p>
            <a 
              href={buildTelLink(cms?.propertyContactPhone || property.contactPhone)} 
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700"
            >
              <Phone size={16} /> {t('buttons.call', { ns: 'common' })}
            </a>
            <a
              href={buildWhatsAppLink(
                { ...property, contactPhone: cms?.propertyContactWhatsapp || property.contactPhone },
                { lang: language }
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-warm-white hover:bg-green-700"
            >
              <MessageCircle size={16} /> {t('buttons.whatsapp', { ns: 'common' })}
            </a>
            <button
              type="button"
              onClick={handleExpressInterest}
              disabled={hasEnquired && enquiryCooldown > 0}
              className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                hasEnquired && enquiryCooldown > 0
                  ? 'border-green-500 bg-green-50 text-green-700 cursor-default'
                  : 'border-brand-500 text-brand-700 hover:bg-brand-50'
              }`}
            >
              <HandHeart size={16} />
              {hasEnquired && enquiryCooldown > 0
                ? (language === 'te' ? '✓ ఎన్‌క్వైరీ చేశారు' : '✓ Just Enquired')
                : hasEnquired
                  ? (language === 'te' ? '✓ ఎన్‌క్వైరీ చేశారు (Just Enquired)' : '✓ Just Enquired')
                  : t('buttons.expressInterest', { ns: 'common' })}
            </button>
            <button
              type="button"
              onClick={() => setVisitOpen(true)}
              disabled={hasRequestedVisit && visitCooldown > 0}
              className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                hasRequestedVisit && visitCooldown > 0
                  ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-default'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarPlus size={16} />
              {hasRequestedVisit && visitCooldown > 0
                ? (language === 'te' ? '✓ జస్ట్ రిక్వెస్ట్ చేసారు' : '✓ Just Requested')
                : hasRequestedVisit
                  ? (language === 'te' ? '✓ జస్ట్ రిక్వెస్ట్ చేసారు (Just Requested)' : '✓ Just Requested')
                  : t('buttons.scheduleVisit', { ns: 'common' })}
            </button>
            <a
              href="#loan-calculator"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('loan-calculator')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50/50 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100/60"
            >
              <span>{language === 'te' ? 'హోమ్ లోన్ EMI క్యాలిక్యులేటర్' : 'Home Loan EMI Calculator'}</span>
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-brand-800">{t('detail.relatedProperties')}</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-gray-200 bg-warm-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
        <a 
          href={buildTelLink(cms?.propertyContactPhone || property.contactPhone)} 
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white"
        >
          <Phone size={16} /> {t('buttons.call', { ns: 'common' })}
        </a>
        <a
          href={buildWhatsAppLink(
            { ...property, contactPhone: cms?.propertyContactWhatsapp || property.contactPhone },
            { lang: language }
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-warm-white"
        >
          <MessageCircle size={16} /> {t('buttons.whatsapp', { ns: 'common' })}
        </a>
        <button
          type="button"
          onClick={handleExpressInterest}
          disabled={hasEnquired && enquiryCooldown > 0}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-semibold ${
            hasEnquired && enquiryCooldown > 0
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-brand-500 text-brand-700'
          }`}
        >
          <HandHeart size={16} />
          {hasEnquired && enquiryCooldown > 0
            ? (language === 'te' ? '✓ ఎన్‌క్వైరీ చేశారు' : '✓ Just Enquired')
            : hasEnquired
              ? (language === 'te' ? '✓ ఎన్‌క్వైరీ చేశారు' : '✓ Just Enquired')
              : t('buttons.expressInterest', { ns: 'common' })}
        </button>
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent((language === 'te' ? 'ఓంకార్ రియల్టర్స్ లో ఈ ఆస్తిని చూడండి: ' : 'Check out this property on Omkareswar Realtors: ') + window.location.href)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-warm-white shadow-sm hover:bg-[#128C7E] active:scale-95"
        >
          <Share2 size={18} />
        </a>
      </div>

      <ScheduleVisitModal open={visitOpen} onClose={() => setVisitOpen(false)} onConfirm={handleScheduleVisit} />
    </div>
  );
}
