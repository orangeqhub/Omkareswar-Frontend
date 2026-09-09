import { useCallback, lazy, Suspense } from 'react';
import HeroCarousel from '../../components/home/HeroCarousel';
import CategoryStrip from '../../components/home/CategoryStrip';
import TrustStrip from '../../components/home/TrustStrip';
import PropertySectionGrid from '../../components/home/PropertySectionGrid';
import PopupGate from '../../components/home/PopupGate';
import { PropertyCardSkeleton } from '../../components/common/Skeleton';
import { propertyService } from '../../services/propertyService';
import { useLocationStore } from '../../store/locationStore';

// Below-the-fold homepage sections are code-split so they (and their heavier
// dependencies, e.g. react-hook-form/zod in ContactSection) are fetched after
// paint. Height-reserving placeholders keep CLS at zero until they mount.
const LatestGrid = lazy(() => import('../../components/home/PropertySectionGrid'));
const PopularLocations = lazy(() => import('../../components/home/PopularLocations'));
const VenturesSection = lazy(() => import('../../components/home/VenturesSection'));
const AboutSection = lazy(() => import('../../components/home/AboutSection'));
const WhyChooseUs = lazy(() => import('../../components/home/WhyChooseUs'));
const HowItWorks = lazy(() => import('../../components/home/HowItWorks'));
const ContactSection = lazy(() => import('../../components/home/ContactSection'));

function SectionSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function SectionPlaceholder({ className = '', mobileMinH = 'min-h-[480px]', desktopMinH = '' }) {
  return <div className={`w-full ${mobileMinH} ${desktopMinH} ${className}`} aria-hidden="true" />;
}

export default function Home() {
  const selectedLocation = useLocationStore((s) => s.selectedLocation);
  const fetchFeatured = useCallback(() => propertyService.getFeatured(8, selectedLocation || undefined), [selectedLocation]);
  const fetchLatest = useCallback(() => propertyService.getLatest(8, selectedLocation || undefined), [selectedLocation]);

  return (
    <>
      <PopupGate />
      <HeroCarousel />
      <CategoryStrip />
      <TrustStrip />
      <PropertySectionGrid titleKey="sections.featured" fetcher={fetchFeatured} viewAllTo="/properties" />

      <Suspense fallback={<SectionSkeleton />}>
        <LatestGrid titleKey="sections.latest" fetcher={fetchLatest} viewAllTo="/properties" />
      </Suspense>

      <Suspense fallback={<SectionPlaceholder mobileMinH="min-h-[520px]" desktopMinH="md:min-h-[300px]" className="mx-auto max-w-7xl" />}>
        <PopularLocations />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <VenturesSection />
      </Suspense>

      <Suspense fallback={<SectionPlaceholder mobileMinH="min-h-[520px]" desktopMinH="md:min-h-[400px]" className="bg-brand-50" />}>
        <AboutSection />
      </Suspense>

      <Suspense fallback={<SectionPlaceholder mobileMinH="min-h-[820px]" desktopMinH="md:min-h-[300px]" className="mx-auto max-w-7xl" />}>
        <WhyChooseUs />
      </Suspense>

      <Suspense fallback={<SectionPlaceholder mobileMinH="min-h-[820px]" desktopMinH="md:min-h-[300px]" className="bg-gray-50" />}>
        <HowItWorks />
      </Suspense>

      <Suspense fallback={<SectionPlaceholder mobileMinH="min-h-[900px]" desktopMinH="md:min-h-[600px]" className="mx-auto max-w-7xl" />}>
        <ContactSection />
      </Suspense>
    </>
  );
}