import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { landingLeadService } from '../../services/landingLeadService';
import { cmsService } from '../../services/cmsService';
import { resolveMediaUrl } from '../../store/url';

const POPUP_DONE_KEY = 'popup-done';
const CLOSE_DELAY_MS = 30000;
const CLOSE_AFTER_SUCCESS_MS = 1800;

const POPUP_STYLE = `
.popup-card-in {
  animation: popup-card-in-kf 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes popup-card-in-kf {
  from { opacity: 0; transform: translateY(24px) scale(0.95); }
  to { opacity: 1; transform: none; }
}
.popup-field-in {
  animation: popup-field-in-kf 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes popup-field-in-kf {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
.popup-success-pop {
  animation: popup-success-pop-kf 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes popup-success-pop-kf {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
`;

const fieldLabelClass =
  'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700';

const boxClass =
  'flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 transition-colors focus-within:border-[#0a6d50] focus-within:ring-2 focus-within:ring-[#0a6d50]/10';

const boxInputClass =
  'w-full border-none bg-transparent py-0.5 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-500';

export default function PopupGate() {
  const [open, setOpen] = useState(() => sessionStorage.getItem(POPUP_DONE_KEY) !== '1');
  const [showClose, setShowClose] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const showCloseRef = useRef(showClose);
  showCloseRef.current = showClose;

  useEffect(() => {
    let active = true;
    cmsService
      .getCms()
      .then((cms) => {
        if (active && cms?.popupLeftImage) {
          setPosterUrl(resolveMediaUrl(cms.popupLeftImage));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
    setSubmitting(true);
    setError('');
    try {
      await landingLeadService.createLead({
        name: form.name.trim(),
        contact,
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

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-[80] overflow-y-auto overscroll-contain bg-[#eaf4f6]/90 p-3.5 backdrop-blur-sm sm:top-20 sm:p-5">
      <style>{POPUP_STYLE}</style>

      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Omkareswar Realtors enquiry form"
          className="popup-card-in relative w-full max-w-[560px] overflow-hidden rounded-[20px] bg-[#f0fafc] shadow-2xl shadow-black/20 ring-1 ring-black/5 sm:max-w-[600px] lg:max-w-[800px]"
        >
        {showClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0a6d50] shadow ring-1 ring-black/5 transition hover:bg-[#0a6d50]/10"
          >
            <X size={18} />
          </button>
        )}

        <div className="grid md:grid-cols-[1fr_1.25fr]">
          <section className="relative hidden min-h-[420px] overflow-hidden bg-[#eaf4f6] md:block sm:min-h-[460px]">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt="Omkareswar Realtors offer"
                loading="eager"
                decoding="async"
                className="absolute inset-0 z-[1] h-full w-full object-cover object-top"
                onError={(ev) => {
                  ev.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex min-h-[420px] items-center justify-center sm:min-h-[460px]">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="Omkareswar Realtors"
                    className="h-16 w-16 rounded-full object-contain opacity-80"
                    onError={(ev) => {
                      ev.currentTarget.style.display = 'none';
                    }}
                  />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0a6d50]">
                    Omkareswar Realtors
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="relative flex flex-col justify-center bg-white p-4 sm:p-6">
            {submitted ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <div className="popup-success-pop rounded-full bg-[#0a6d50]/10 p-3">
                  <CheckCircle2 size={40} className="text-[#0a6d50]" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#12251c]">Thank You!</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Your details have been received. Our property experts will reach out to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="popup-field-in text-xl font-extrabold leading-tight text-[#12251c]">
                  Enter your mobile number
                </h3>
                <span className="popup-field-in mt-1.5 block h-[4px] w-14 rounded-full bg-[#0a6d50]" />
                <p className="popup-field-in mt-1.5 text-[13px] text-gray-500">
                  Our property experts will get back to you shortly.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="popup-field-in" style={{ animationDelay: '0.15s' }}>
                    <label className={fieldLabelClass} htmlFor="popup-name">
                      Full name *
                    </label>
                    <div className={boxClass}>
                      <User size={14} className="shrink-0 text-[#0a6d50]" />
                      <input
                        id="popup-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={boxInputClass}
                      />
                    </div>
                  </div>

                  <div className="popup-field-in" style={{ animationDelay: '0.2s' }}>
                    <label className={fieldLabelClass} htmlFor="popup-contact">
                      Mobile number *
                    </label>
                    <div className={boxClass}>
                      <Phone size={14} className="shrink-0 text-[#0a6d50]" />
                      <span className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-gray-700">
                        +91
                        <ChevronDown size={12} className="text-gray-400" />
                      </span>
                      <span aria-hidden className="h-4 w-px shrink-0 bg-gray-300" />
                      <input
                        id="popup-contact"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={form.contact}
                        onChange={(e) => handleChange('contact', e.target.value.replace(/\D/g, ''))}
                        className={boxInputClass}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="popup-field-in rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                      {error}
                    </p>
                  )}

                  <div className="popup-field-in" style={{ animationDelay: '0.3s' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0a6d50] text-sm font-bold text-white shadow-lg shadow-[#0a6d50]/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#095e44] hover:shadow-xl hover:shadow-[#095e44]/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Claiming…
                        </>
                      ) : (
                        <>
                          <MessageCircle size={16} /> Claim 0% Commission Offer{' '}
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="popup-field-in flex items-center gap-3" style={{ animationDelay: '0.4s' }}>
                    <span className="h-px flex-1 bg-gray-200" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      OR
                    </span>
                    <span className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div
                    className="popup-field-in flex items-center gap-2.5 rounded-xl border border-[#dcebe4] bg-[#eef6f3] px-3.5 py-2.5"
                    style={{ animationDelay: '0.45s' }}
                  >
                    <ShieldCheck size={18} className="shrink-0 text-[#0a6d50]" />
                    <p className="text-xs leading-snug text-gray-600">
                      Your information is safe &amp; secure. We don&rsquo;t share your details.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
      </div>
    </div>
  );
}