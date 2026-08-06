import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { cmsService } from '../../services/cmsService';
import { enquiryService } from '../../services/enquiryService';
import { visitService } from '../../services/visitService';
import { useAuthStore } from '../../store/authStore';
import { useFavouritesStore } from '../../store/favouritesStore';
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

export default function PropertyDetail() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('properties');
  const language = useLanguageStore((s) => s.language);
  const { user } = useAuthStore();
  const isFavourite = useFavouritesStore((s) => s.isFavourite(propertyId));
  const toggleFavourite = useFavouritesStore((s) => s.toggle);
  const isComparing = useCompareStore((s) => s.isSelected(propertyId));
  const toggleCompare = useCompareStore((s) => s.toggle);

  const [property, setProperty] = useState(null);
  const [related, setRelated] = useState([]);
  const [cms, setCms] = useState(null);
  const [visitOpen, setVisitOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [hasEnquired, setHasEnquired] = useState(false);
  const [hasRequestedVisit, setHasRequestedVisit] = useState(false);

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
    if (!user || user.role !== 'buyer' || !propertyId) return;
    enquiryService.getForBuyer(user.mobile).then((list) => {
      if (Array.isArray(list) && list.some((e) => e.propertyId === propertyId)) {
        setHasEnquired(true);
      }
    });
    visitService.getForBuyer(user.id).then((list) => {
      if (Array.isArray(list) && list.some((v) => v.propertyId === propertyId)) {
        setHasRequestedVisit(true);
      }
    });
  }, [user, propertyId]);

  const handleExpressInterest = useCallback(async () => {
    if (!user) {
      toast.info('Please login to express interest.');
      navigate('/login');
      return;
    }
    await enquiryService.create({
      propertyId: property.id,
      sellerId: property.sellerId,
      buyerName: user.name || user.fullName || 'Buyer',
      buyerPhone: user.mobile || user.phone || '',
      message: 'Just Enquired',
      channel: 'interest',
    });
    setHasEnquired(true);
    toast.success(language === 'te' ? 'ఎన్‌క్వైరీ విజయవంతంగా పంపబడింది (Just Enquired).' : 'Just Enquired! Your request has been sent.');
  }, [user, property, navigate, language]);

  async function handleScheduleVisit(date) {
    if (!user) {
      toast.info('Please login to schedule a visit.');
      navigate('/login');
      return;
    }
    await visitService.schedule({
      propertyId: property.id,
      propertyTitle: title || property.titleEn || property.titleTe || property.id,
      buyerId: user.id,
      buyerName: user.name || user.fullName || user.email || user.mobile || 'Buyer',
      buyerMobile: user.mobile || '',
      sellerId: property.sellerId || null,
      scheduledFor: date,
    });
    setVisitOpen(false);
    setHasRequestedVisit(true);
    toast.success(language === 'te' ? 'విజిట్ రిక్వెస్ట్ పంపబడింది (Just Requested).' : 'Visit requested successfully (Just Requested)!');
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
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');

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
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleFavourite} aria-pressed={isFavourite} className="rounded-full border border-gray-200 p-2.5 hover:bg-gray-50" aria-label="Save property">
                <Heart size={18} fill={isFavourite ? 'currentColor' : 'none'} className={isFavourite ? 'text-red-500' : 'text-gray-500'} />
              </button>
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
            <h2 className="text-lg font-semibold text-brand-800">{t('detail.locationMap')}</h2>
            <div className="mt-3 flex h-56 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
              {t('detail.mapPlaceholder')}
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
              disabled={hasEnquired}
              className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                hasEnquired
                  ? 'border-green-500 bg-green-50 text-green-700 cursor-default'
                  : 'border-brand-500 text-brand-700 hover:bg-brand-50'
              }`}
            >
              <HandHeart size={16} />
              {hasEnquired
                ? (language === 'te' ? '✓ ఎన్‌క్వైరీ చేశారు (Just Enquired)' : '✓ Just Enquired')
                : t('buttons.expressInterest', { ns: 'common' })}
            </button>
            <button
              type="button"
              onClick={() => setVisitOpen(true)}
              disabled={hasRequestedVisit}
              className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                hasRequestedVisit
                  ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-default'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarPlus size={16} />
              {hasRequestedVisit
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

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-gray-200 bg-warm-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
        <a 
          href={buildTelLink(cms?.propertyContactPhone || property.contactPhone)} 
          className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white"
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
          className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-warm-white"
        >
          <MessageCircle size={16} /> {t('buttons.whatsapp', { ns: 'common' })}
        </a>
        <button
          type="button"
          onClick={handleExpressInterest}
          disabled={hasEnquired}
          className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-semibold ${
            hasEnquired
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-brand-500 text-brand-700'
          }`}
        >
          <HandHeart size={16} />
          {hasEnquired
            ? (language === 'te' ? '✓ ఎన్‌క్వైరీ చేశారు' : '✓ Just Enquired')
            : t('buttons.expressInterest', { ns: 'common' })}
        </button>
      </div>

      <ScheduleVisitModal open={visitOpen} onClose={() => setVisitOpen(false)} onConfirm={handleScheduleVisit} />
    </div>
  );
}
