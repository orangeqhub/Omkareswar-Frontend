import { useCallback } from 'react';
import HeroCarousel from '../../components/home/HeroCarousel';
import CategoryStrip from '../../components/home/CategoryStrip';
import TrustStrip from '../../components/home/TrustStrip';
import PropertySectionGrid from '../../components/home/PropertySectionGrid';
import PopularLocations from '../../components/home/PopularLocations';
import VenturesSection from '../../components/home/VenturesSection';
import AboutSection from '../../components/home/AboutSection';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import HowItWorks from '../../components/home/HowItWorks';
import ContactSection from '../../components/home/ContactSection';
import { propertyService } from '../../services/propertyService';
import { useLocationStore } from '../../store/locationStore';

export default function Home() {
  const selectedLocation = useLocationStore((s) => s.selectedLocation);
  const fetchFeatured = useCallback(() => propertyService.getFeatured(8, selectedLocation || undefined), [selectedLocation]);
  const fetchLatest = useCallback(() => propertyService.getLatest(8, selectedLocation || undefined), [selectedLocation]);

  return (
    <>
      <HeroCarousel />
      <CategoryStrip />
      <TrustStrip />
      <PropertySectionGrid titleKey="sections.featured" fetcher={fetchFeatured} viewAllTo="/properties" />
      <PropertySectionGrid titleKey="sections.latest" fetcher={fetchLatest} viewAllTo="/properties" />
      <PopularLocations />
      <VenturesSection />
      <AboutSection />
      <WhyChooseUs />
      <HowItWorks />
      <ContactSection />
    </>
  );
}
