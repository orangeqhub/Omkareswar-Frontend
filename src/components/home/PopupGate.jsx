import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  CheckCircle2,
  Landmark,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { landingLeadService } from '../../services/landingLeadService';

const POPUP_DONE_KEY = 'popup-done';
const CLOSE_DELAY_MS = 60000;
const CLOSE_AFTER_SUCCESS_MS = 1800;

const POPUP_RING_STYLE = `
@property --popup-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
.popup-progress-border {
  --popup-edge: #f59e0b;
  background: conic-gradient(
    from var(--popup-angle),
    transparent 0deg,
    transparent 240deg,
    rgba(245, 158, 11, 0.35) 300deg,
    var(--popup-edge) 355deg,
    var(--popup-edge) 360deg
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: popup-border-scroll 60s linear forwards;
}
@keyframes popup-border-scroll {
  from { --popup-angle: 0deg; }
  to { --popup-angle: 360deg; }
}
.popup-progress-border.done {
  opacity: 0;
}
`;

const ROLE_OPTIONS = [
  { value: 'buyer', label: 'Buyer', icon: Building2 },
  { value: 'seller', label: 'Seller', icon: Landmark },
  { value: 'mediator', label: 'Mediator', icon: Users },
];

const FEATURES = [
  { icon: Building2, title: 'Premium Properties', text: 'Verified plots, homes and commercial spaces across the region.' },
  { icon: Users, title: 'Trusted Mediators', text: 'A dedicated team that connects buyers, sellers and mediators.' },
  { icon: CheckCircle2, title: 'End-to-End Support', text: 'From search to registration, we stay with you at every step.' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

function LogoMark({ className }) {
  return <img src="/logo.png" alt="" onError={(ev) => { ev.currentTarget.style.display = 'none'; }} className={className} />;
}

export default function PopupGate() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(() => sessionStorage.getItem(POPUP_DONE_KEY) !== '1');
  const [showClose, setShowClose] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', cityVillage: '', role: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const showCloseRef = useRef(showClose);
  showCloseRef.current = showClose;

  useEffect(() => {
    if (!open) return undefined;

    const closeTimer = setTimeout(() => setShowClose(true), CLOSE_DELAY_MS);
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape' && showCloseRef.current) {
        sessionStorage.setItem(POPUP_DONE_KEY, '1');
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(closeTimer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const contact = form.contact.trim();
    if (!/^[6-9]\d{9}$/.test(contact)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!form.cityVillage.trim()) {
      setError('Please enter your city or village.');
      return;
    }
    if (!form.role) {
      setError('Please select your role.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await landingLeadService.createLead({
        name: form.name.trim(),
        contact,
        cityVillage: form.cityVillage.trim(),
        role: form.role,
      });
      sessionStorage.setItem(POPUP_DONE_KEY, '1');
      setSubmitted(true);
      setTimeout(() => setOpen(false), CLOSE_AFTER_SUCCESS_MS);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!showClose || submitting) return;
    sessionStorage.setItem(POPUP_DONE_KEY, '1');
    setOpen(false);
  }

  if (!open) return null;

  const ringVisible = !submitted && !showClose;
  const closeButtonClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
      <style>{POPUP_RING_STYLE}</style>

      <div className="relative flex max-h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div
          className={`pointer-events-none absolute inset-0 rounded-2xl p-[3px] ${ringVisible ? 'popup-progress-border' : ''} ${
            showClose && !submitted ? 'popup-progress-border done' : ''
          }`}
          onAnimationEnd={() => setShowClose(true)}
          aria-hidden="true"
        />

        <div className="flex shrink-0 items-center justify-between gap-2 bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-3 md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoMark className="h-9 w-9 shrink-0 rounded-full ring-2 ring-white/40" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{t('brand.name')}</p>
              <p className="truncate text-[11px] font-medium text-brand-100">{t('brand.tagline')}</p>
            </div>
          </div>
          {showClose && (
            <button type="button" onClick={handleClose} aria-label="Close popup" className={closeButtonClass}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="hidden w-full flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-6 md:flex md:w-[42%]">
            <div>
              <div className="flex items-center gap-3">
                <LogoMark className="h-10 w-10 rounded-full ring-2 ring-white/40" />
                <div>
                  <p className="text-sm font-bold text-white">{t('brand.name')}</p>
                  <p className="text-[11px] font-medium text-brand-100">{t('brand.tagline')}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex items-start gap-2.5">
                    <div className="rounded-lg bg-white/15 p-1.5 text-white">
                      <f.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.title}</p>
                      <p className="text-[11px] leading-snug text-brand-100">{f.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white">
              <ShieldCheck size={13} />
              Safe &amp; secure — no OTP, no login needed
            </div>
          </aside>

          <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
            {showClose && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close popup"
                className="absolute right-3 top-3 hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 md:flex"
              >
                <X size={18} />
              </button>
            )}

            {submitted ? (
              <div className="flex h-full min-h-40 flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={40} className="text-brand-600" />
                <h2 className="mt-3 text-xl font-bold text-brand-800">Thank You!</h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Your details have been received. Our property experts will reach out to you soon.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-brand-800 sm:text-2xl">Get Started Now</h2>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Share your details and let our property experts guide you to the best plots, homes and ventures in
                  Telangana &amp; Andhra Pradesh.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 sm:text-sm" htmlFor="popup-name">
                      <User size={13} className="text-brand-600" /> Name
                    </label>
                    <input
                      id="popup-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 sm:text-sm" htmlFor="popup-contact">
                      <Phone size={13} className="text-brand-600" /> Contact Number
                    </label>
                    <input
                      id="popup-contact"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={form.contact}
                      onChange={(e) => handleChange('contact', e.target.value.replace(/\D/g, ''))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 sm:text-sm" htmlFor="popup-city">
                      <MapPin size={13} className="text-brand-600" /> City / Village
                    </label>
                    <input
                      id="popup-city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="e.g. Karimnagar, Hyderabad, …"
                      value={form.cityVillage}
                      onChange={(e) => handleChange('cityVillage', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 sm:text-sm">
                      <User size={13} className="text-brand-600" /> Role
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLE_OPTIONS.map((opt) => {
                        const active = form.role === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-[11px] font-medium transition-colors sm:text-xs ${
                              active
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-gray-200 text-gray-500 hover:border-brand-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="popup-role"
                              value={opt.value}
                              className="sr-only"
                              checked={active}
                              onChange={(e) => handleChange('role', e.target.value)}
                            />
                            <opt.icon size={16} />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 sm:text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-2.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Submitting…
                      </>
                    ) : (
                      'Submit Details'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}