import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { CATEGORIES } from '../../config/categories';
import { CITIES } from '../../data/locations';
import { getActiveHeroSlides } from '../../config/heroSlides';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { useUserLocationStore } from '../../store/userLocationStore';
import { toast } from '../../store/toastStore';
import { resolvePostPropertyAction } from '../../utils/postPropertyAccess';
import { settingsService } from '../../services/settingsService';
import { loadGoogleMapsScript } from '../../utils/googleMaps';

function getGoogleString(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    if (typeof obj.text === 'string') return obj.text;
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].length > 4) {
        return obj[key];
      }
    }
    for (const key in obj) {
      if (typeof obj[key] === 'string') return obj[key];
    }
    return typeof obj.toString === 'function' ? obj.toString() : '';
  }
  return String(obj);
}

const POPULAR_LOCALITIES = [
  // Districts
  'Anantapur District', 'Chittoor District', 'East Godavari District', 'Guntur District', 'Krishna District', 
  'Kurnool District', 'Prakasam District', 'Srikakulam District', 'Nellore District', 'Visakhapatnam District', 
  'Vizianagaram District', 'West Godavari District', 'Kadapa District', 'Anakapalli District', 'Kakinada District', 
  'Konaseema District', 'Eluru District', 'NTR District', 'Bapatla District', 'Palnadu District', 'Nandyal District', 
  'Sri Sathya Sai District', 'Annamayya District', 'Tirupati District', 'Alluri Sitharama Raju District', 
  'Parvathipuram Manyam District',

  // Guntur & Palnadu & Bapatla (Towns/Mandals/Villages)
  'Brodipet, Guntur', 'Arundelpet, Guntur', 'Gorantla, Guntur', 'Lakshmipuram, Guntur', 'Tenali, Guntur', 
  'Mangalagiri, Guntur', 'Tadepalli, Guntur', 'Ponnur, Guntur', 'Chebrolu, Guntur', 'Pedakakani, Guntur',
  'Narasaraopet, Palnadu', 'Sattenapalli, Palnadu', 'Chilakaluripet, Palnadu', 'Macherla, Palnadu', 
  'Piduguralla, Palnadu', 'Gurazala, Palnadu', 'Dachepalli, Palnadu', 'Karempudi, Palnadu',
  'Bapatla, Bapatla', 'Chirala, Bapatla', 'Repalle, Bapatla', 'Vemuru, Bapatla', 'Karlapalem, Bapatla',

  // Krishna & NTR (Towns/Mandals/Villages)
  'Benz Circle, Vijayawada', 'Kanuru, Vijayawada', 'Patamata, Vijayawada', 'Gudavalli, Vijayawada',
  'Machilipatnam, Krishna', 'Gudivada, Krishna', 'Pamarru, Krishna', 'Penamaluru, Krishna',
  'Vijayawada, NTR', 'Ibrahimpatnam, NTR', 'Kanchikacherla, NTR', 'Nandigama, NTR', 'Jaggayyapeta, NTR', 
  'Mylavaram, NTR', 'Tiruvuru, NTR',

  // Visakhapatnam & Anakapalli (Towns/Mandals/Villages)
  'Gajuwaka, Visakhapatnam', 'MVP Colony, Visakhapatnam', 'Rushikonda, Visakhapatnam', 'MVP Colony, Visakhapatnam', 
  'Pendurthi, Visakhapatnam', 'Bheemunipatnam, Visakhapatnam', 'Anakapalli, Anakapalli', 'Chodavaram, Anakapalli', 
  'Narsipatnam, Anakapalli',

  // Godavari regions (Kakinada, East, West, Eluru, Konaseema)
  'Rajahmundry, East Godavari', 'Kadiam, East Godavari', 'Kovvur, East Godavari',
  'Kakinada, Kakinada', 'Pithapuram, Kakinada', 'Samalkot, Kakinada', 'Tuni, Kakinada',
  'Amalapuram, Konaseema', 'Ravulapalem, Konaseema', 'Razole, Konaseema', 'Mummidivaram, Konaseema',
  'Bhimavaram, West Godavari', 'Tadepalligudem, West Godavari', 'Tanuku, West Godavari', 'Palakollu, West Godavari', 
  'Narasapuram, West Godavari', 'Eluru, Eluru', 'Jangareddygudem, Eluru', 'Chintalapudi, Eluru',

  // Rayalaseema & Nellore/Prakasam
  'Nellore, Nellore', 'Kavali, Nellore', 'Gudur, Nellore', 'Naidupeta, Nellore', 'Venkatagiri, Nellore',
  'Ongole, Prakasam', 'Kandukur, Prakasam', 'Podili, Prakasam', 'Kanigiri, Prakasam', 'Markapur, Prakasam', 
  'Giddalur, Prakasam', 'Kurnool, Kurnool', 'Adoni, Kurnool', 'Yemmiganur, Kurnool', 'Kodumur, Kurnool',
  'Nandyal, Nandyal', 'Dhone, Nandyal', 'Allagadda, Nandyal', 'Banaganapalle, Nandyal', 'Srisailam, Nandyal',
  'Anantapur, Anantapur', 'Tadipatri, Anantapur', 'Gooty, Anantapur', 'Rayadurg, Anantapur',
  'Dharmavaram, Sri Sathya Sai', 'Penukonda, Sri Sathya Sai', 'Hindupur, Sri Sathya Sai', 'Puttaparthi, Sri Sathya Sai', 
  'Kadiri, Sri Sathya Sai', 'Kadapa, YSR Kadapa', 'Proddatur, YSR Kadapa', 'Pulivendula, YSR Kadapa', 
  'Badvel, YSR Kadapa', 'Madanapalle, Annamayya', 'Rayachoti, Annamayya', 'Rajampet, Annamayya',
  'Chittoor, Chittoor', 'Kuppam, Chittoor', 'Palamaner, Chittoor', 'Nagari, Chittoor',
  'Tirupati, Tirupati', 'Srikalahasti, Tirupati', 'Renigunta, Tirupati', 'Puttur, Tirupati',
  
  // North Coast (Srikakulam, Vizianagaram, Manyam)
  'Vizianagaram, Vizianagaram', 'Bobbili, Vizianagaram', 'Salur, Vizianagaram',
  'Srikakulam, Srikakulam', 'Palasa, Srikakulam', 'Tekkali, Srikakulam', 'Ichchapuram, Srikakulam',
  'Parvathipuram, Parvathipuram Manyam', 'Paderu, Alluri Sitharama Raju', 'Araku Valley, Alluri Sitharama Raju'
];

const AUTOPLAY_INTERVAL = 3000;
const SLIDES = getActiveHeroSlides();
const CURRENT_LOCATION_VALUE = '__current_location__';

export default function HeroCarousel() {
  const { t } = useTranslation(['properties', 'common']);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const userLocation = useUserLocationStore();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(typeof document !== 'undefined' && document.hidden);
  const touchStartX = useRef(null);
  const [form, setForm] = useState({ location: '', categorySlug: '', minPrice: '', maxPrice: '' });
  const [locInput, setLocInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customLocs, setCustomLocs] = useState([]);
  const [googleSuggestions, setGoogleSuggestions] = useState([]);
  const containerRef = useRef(null);

  // Load custom locations from database
  useEffect(() => {
    settingsService.getPublicSettings()
      .then((res) => {
        if (res && res.customLocations) {
          setCustomLocs(res.customLocations);
        }
      })
      .catch((err) => {
        console.error('Failed to load dynamic location settings:', err);
      });
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allLocalities = useMemo(() => {
    return [...customLocs, ...POPULAR_LOCALITIES];
  }, [customLocs]);

  // Debounced Google Places API call for homepage
  useEffect(() => {
    if (!locInput.trim()) {
      setGoogleSuggestions([]);
      return;
    }

    const handler = setTimeout(() => {
      loadGoogleMapsScript(() => {
        if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.places) {
          return;
        }

        try {
          if (window.google.maps.places.AutocompleteSuggestion) {
            const apCenter = new window.google.maps.LatLng(15.9129, 79.7400);
            window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input: locInput,
              includedRegionCodes: ['in'],
              locationBias: apCenter,
            }).then(({ suggestions }) => {
              if (suggestions && suggestions.length > 0) {
                const list = suggestions.map((p) => getGoogleString(p.placePrediction.text || p.placePrediction.description));
                setGoogleSuggestions(list);
              } else {
                setGoogleSuggestions([]);
              }
            }).catch((err) => {
              console.warn('AutocompleteSuggestion failed, falling back to AutocompleteService:', err);
              fallbackToService();
            });
          } else {
            fallbackToService();
          }
        } catch (err) {
          console.warn('Places API failed, falling back to AutocompleteService:', err);
          fallbackToService();
        }

        function fallbackToService() {
          try {
            const service = new window.google.maps.places.AutocompleteService();
            const apCenter = new window.google.maps.LatLng(15.9129, 79.7400);
            service.getPlacePredictions(
              {
                input: locInput,
                types: ['(regions)'],
                componentRestrictions: { country: 'in' },
                locationBias: apCenter,
                radius: 300000,
              },
              (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                  const list = predictions.map((p) => p.description);
                  setGoogleSuggestions(list);
                } else {
                  setGoogleSuggestions([]);
                }
              }
            );
          } catch (err) {
            console.error('Legacy AutocompleteService error:', err);
            setGoogleSuggestions([]);
          }
        }
      });
    }, 250); // 250ms debounce

    return () => clearTimeout(handler);
  }, [locInput]);

  const suggestions = useMemo(() => {
    if (!locInput.trim()) return allLocalities;
    if (googleSuggestions.length > 0) return googleSuggestions;
    const query = locInput.toLowerCase().trim();
    return allLocalities.filter(loc => 
      loc.toLowerCase().includes(query)
    );
  }, [locInput, allLocalities, googleSuggestions]);

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    function handleVisibility() {
      setTabHidden(document.hidden);
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // A single effect keyed on `index` is both the autoplay timer AND the
  // reset-after-manual-navigation behaviour: every index change (whether
  // driven by this same timer ticking or by a manual prev/next/dot click)
  // tears down the previous interval and starts exactly one fresh one, so
  // there is never more than one interval alive at a time.
  useEffect(() => {
    if (paused || focused || tabHidden || SLIDES.length <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [paused, focused, tabHidden, index]);

  function goTo(i) {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  function handleFocusCapture() {
    setFocused(true);
  }

  function handleBlurCapture(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
  }

  // Once "Use My Current Location" resolves to a detected place, reflect it
  // in the search form's own location value so it's both displayed in the
  // dropdown and used as the city filter on submit.
  useEffect(() => {
    if (userLocation.label) {
      setForm((f) => ({ ...f, location: userLocation.label }));
      setLocInput(userLocation.label);
    }
  }, [userLocation.label]);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Parse locality search term vs city
    const locationValue = locInput || form.location;
    if (locationValue) {
      const parts = locationValue.split(',').map((s) => s.trim());
      if (parts.length > 1) {
        params.set('city', parts[1]);
        params.set('search', parts[0]);
      } else {
        params.set('city', parts[0]);
      }
    }
    
    params.set('transactionType', 'sale');
    if (form.minPrice) params.set('minPrice', form.minPrice);
    if (form.maxPrice) params.set('maxPrice', form.maxPrice);
    const category = CATEGORIES.find((c) => c.slug === form.categorySlug);
    if (category) {
      navigate(`/properties/category/${category.slug}?${params.toString()}`);
    } else {
      navigate(`/properties?${params.toString()}`);
    }
  }

  function handlePostProperty(e) {
    e.preventDefault();
    const action = resolvePostPropertyAction(user);
    if (action.messageKey) {
      (action.toastType === 'error' ? toast.error : toast.info)(t(action.messageKey, { ns: 'common' }));
    }
    if (action.type === 'route') navigate(action.to);
  }

  const slide = SLIDES[index] || SLIDES[0];
  const heading = slide ? (language === 'te' ? slide.headingTe : slide.headingEn) : t('hero.heading');
  const subtitle = slide ? (language === 'te' ? slide.subtitleTe : slide.subtitleEn) : '';

  return (
    <section
      className="relative h-[560px] w-full overflow-hidden sm:h-[620px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      {SLIDES.map((s, i) => (
        <img
          key={s.id}
          src={s.image}
          alt=""
          aria-hidden={i !== index}
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
            prefersReducedMotion ? 'duration-0' : 'duration-700'
          } ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label={t('hero.previousSlide', { ns: 'properties', defaultValue: 'Previous slide' })}
        className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-warm-white/20 p-2 text-warm-white hover:bg-warm-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-warm-white sm:flex"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label={t('hero.nextSlide', { ns: 'properties', defaultValue: 'Next slide' })}
        className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-warm-white/20 p-2 text-warm-white hover:bg-warm-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-warm-white sm:flex"
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-warm-white ${
              i === index ? 'w-6 bg-warm-white' : 'w-2 bg-warm-white/50'
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-4 text-center">
        <h1 className="max-w-3xl text-3xl font-bold text-warm-white drop-shadow sm:text-5xl">{heading}</h1>
        {subtitle && <p className="lang-te mt-3 max-w-2xl text-sm text-warm-white/90 drop-shadow sm:text-base">{subtitle}</p>}

        <form
          onSubmit={handleSearch}
          className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-2 rounded-2xl bg-warm-white/95 p-3 shadow-xl sm:grid-cols-2 lg:grid-cols-5"
        >
          <div ref={containerRef} className="relative flex flex-col">
            <input
              type="text"
              value={locInput}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setLocInput(e.target.value);
                setForm((f) => ({ ...f, location: e.target.value }));
              }}
              placeholder={t('hero.locationPlaceholder')}
              aria-label={t('hero.locationPlaceholder')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    userLocation.requestLocation();
                    setShowSuggestions(false);
                  }}
                  className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-semibold text-brand-700 hover:bg-brand-50"
                >
                  📍 {userLocation.status === 'loading'
                    ? t('location.detecting', { ns: 'common' })
                    : t('location.useCurrentLocation', { ns: 'common' })}
                </button>
                {suggestions.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocInput(loc);
                      setForm((f) => ({ ...f, location: loc }));
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-brand-50 hover:text-brand-800"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={form.categorySlug}
            onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
            aria-label={t('hero.categoryPlaceholder')}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700"
          >
            <option value="">{t('hero.allCategories')}</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{language === 'te' ? c.nameTe : c.nameEn}</option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            value={form.minPrice}
            onChange={(e) => setForm((f) => ({ ...f, minPrice: e.target.value }))}
            placeholder={t('hero.minPricePlaceholder')}
            aria-label={t('hero.minPricePlaceholder')}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700"
          />
          <input
            type="number"
            min="0"
            value={form.maxPrice}
            onChange={(e) => setForm((f) => ({ ...f, maxPrice: e.target.value }))}
            placeholder={t('hero.maxPricePlaceholder')}
            aria-label={t('hero.maxPricePlaceholder')}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700"
          >
            <Search size={16} /> {t('buttons.search', { ns: 'common' })}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#browse"
            onClick={(e) => { e.preventDefault(); navigate('/properties'); }}
            className="rounded-full bg-warm-white px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
          >
            {t('buttons.browseProperties', { ns: 'common' })}
          </a>
          <a
            href="#post"
            onClick={handlePostProperty}
            className="rounded-full border border-warm-white px-5 py-2.5 text-sm font-semibold text-warm-white hover:bg-warm-white/10"
          >
            {t('buttons.postYourProperty', { ns: 'common' })}
          </a>
        </div>
      </div>
    </section>
  );
}
