import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ArrowUp, Phone, MessageCircle } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { useAuthStore } from '../../store/authStore';

export default function PublicLayout() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const initialised = useAuthStore((s) => s.initialised);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cms, setCms] = useState(null);

  useEffect(() => {
    cmsService.getCms().then((data) => {
      if (data) setCms(data);
    });

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!loading && initialised && user && user.role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const phoneRaw = cms?.contactPhone || '+91 90000 00000';
  const cleanPhone = phoneRaw.replace(/[^+\d]/g, '');

  return (
    <div className="flex min-h-screen flex-col bg-warm-white relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl transition-all duration-300 hover:bg-brand-700 hover:-translate-y-1 active:scale-95 cursor-pointer animate-fade-in"
            title="Scroll to Top"
          >
            <ArrowUp size={20} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </button>
        )}

        <a
          href={`tel:${cleanPhone}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-800 text-white shadow-xl transition-all duration-300 hover:bg-brand-900 hover:-translate-y-1 active:scale-95 cursor-pointer"
          title={`Call Support: ${phoneRaw}`}
        >
          <Phone size={20} />
        </a>

        <a
          href={`https://wa.me/${cleanPhone.replace('+', '')}?text=Hi%2C%20I%20am%20interested%20in%20properties%20on%20Omkareswar%20Realtors.%20Please%20assist%20me.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-300 hover:bg-[#20ba5a] hover:-translate-y-1 active:scale-95 cursor-pointer"
          title="Chat on WhatsApp"
        >
          <MessageCircle size={20} />
        </a>
      </div>
    </div>
  );
}
