import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Send, XCircle } from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { useLanguageStore } from '../../store/languageStore';
import { getLocalizedField } from '../../utils/localize';
import { toast } from '../../store/toastStore';
import { enquiryService } from '../../services/enquiryService';

const schema = z.object({
  name: z.string().min(1, 'error.requiredField'),
  phone: z.string().regex(/^\d{10}$/, 'error.requiredField'),
  message: z.string().min(1, 'error.requiredField'),
});

export default function ContactSection() {
  const { t } = useTranslation('common');
  const language = useLanguageStore((s) => s.language);
  const [cms, setCms] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle' | 'sending' | 'flying' | 'success' | 'error'
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    cmsService.getCms().then(setCms);
  }, []);

  async function onSubmit(values) {
    setSubmissionStatus('sending');
    try {
      await enquiryService.create({
        buyerName: values.name,
        buyerPhone: values.phone,
        message: values.message,
        channel: 'contact',
      });

      setSubmissionStatus('flying');
      
      // Wait for flying animation
      await new Promise((resolve) => setTimeout(resolve, 2500));

      setSubmissionStatus('success');
      toast.success(t('contact.sentSuccess'));
      reset();
    } catch (error) {
      console.error('Contact enquiry submission failed:', error);
      setSubmissionStatus('error');
      toast.error(error.message || 'Unable to send message');
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <style>{`
        @keyframes fly-wind {
          to { stroke-dashoffset: -40; }
        }
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes float-plane {
          0%, 100% { transform: translateY(0) rotate(315deg); }
          50% { transform: translateY(-6px) rotate(315deg); }
        }
        .animate-wind { animation: fly-wind 1s linear infinite; }
        .animate-draw-check { animation: draw-check 0.6s ease-out forwards; }
        .animate-scale { animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-float-plane { animation: float-plane 2s ease-in-out infinite; }
      `}</style>
      <h2 className="text-xl font-bold text-brand-800 sm:text-2xl">{t('sections.contact')}</h2>
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <ul className="space-y-4 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <MapPin size={18} className="mt-0.5 shrink-0 text-brand-600" />
            <span className="lang-te">{cms ? getLocalizedField(cms, 'contactAddress', language) : ''}</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone size={18} className="shrink-0 text-brand-600" />
            <a href={`tel:${cms?.contactPhone}`} className="hover:underline">{cms?.contactPhone}</a>
          </li>
          <li className="flex items-center gap-2">
            <Mail size={18} className="shrink-0 text-brand-600" />
            <a href={`mailto:${cms?.contactEmail}`} className="hover:underline">{cms?.contactEmail}</a>
          </li>
        </ul>

        {submissionStatus === 'idle' || submissionStatus === 'sending' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-gray-200 p-5 shadow-sm transition-all duration-300">
            <h3 className="font-semibold text-gray-800">{t('contact.formTitle')}</h3>
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-gray-700">
                {t('contact.nameLabel')}
              </label>
              <input id="contact-name" {...register('name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{t(errors.name.message)}</p>}
            </div>
            <div>
              <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium text-gray-700">
                {t('contact.phoneFieldLabel')}
              </label>
              <input id="contact-phone" {...register('phone')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{t(errors.phone.message)}</p>}
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-gray-700">
                {t('contact.messageLabel')}
              </label>
              <textarea id="contact-message" rows={3} {...register('message')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              {errors.message && <p className="mt-1 text-xs text-red-600">{t(errors.message.message)}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || submissionStatus === 'sending'}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-warm-white hover:bg-brand-700 disabled:opacity-60"
            >
              {isSubmitting || submissionStatus === 'sending' ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-warm-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                t('contact.sendButton')
              )}
            </button>
          </form>
        ) : submissionStatus === 'flying' ? (
          <div className="rounded-xl border border-gray-200 p-5 shadow-sm min-h-[350px] flex flex-col items-center justify-center text-center animate-scale bg-warm-white">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-brand-50/50">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-brand-200 animate-spin" style={{ animationDuration: '8s' }}></div>
              <svg className="absolute bottom-3 left-1/2 h-7 w-20 -translate-x-1/2 opacity-10 text-brand-800" viewBox="0 0 100 30" fill="currentColor">
                <path d="M0 30h100V15H80l-5-5-5 5H60l-5-5-5 5H40l-5-5-5 5H20l-5-5-5 5H0z" />
              </svg>
              <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 128 128">
                <path
                  d="M30 90 C 40 60, 80 40, 95 35"
                  fill="none"
                  stroke="#6b8e23"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-wind"
                />
              </svg>
              <div className="animate-float-plane">
                <Send className="h-9 w-9 text-brand-600" />
              </div>
            </div>
            <h3 className="mt-5 text-lg font-bold text-brand-800">Sending your message...</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-xs">
              Please wait while we send your message.
            </p>
          </div>
        ) : submissionStatus === 'success' ? (
          <div className="rounded-xl border border-gray-200 p-5 shadow-sm min-h-[350px] flex flex-col items-center justify-center text-center animate-scale bg-warm-white">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg className="h-14 w-14" viewBox="0 0 52 52">
                <circle className="stroke-green-600 fill-none animate-draw-check" cx="26" cy="26" r="25" strokeWidth="3" strokeDasharray="157" strokeDashoffset="157" />
                <path className="stroke-green-600 fill-none animate-draw-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="48" strokeDashoffset="48" style={{ animationDelay: '0.4s' }} />
              </svg>
              <span className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="absolute bottom-1 right-0.5 h-2.5 w-2.5 rounded-full bg-blue-400 animate-ping" style={{ animationDelay: '0.3s' }}></span>
              <span className="absolute top-3 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" style={{ animationDelay: '0.6s' }}></span>
            </div>
            <h3 className="mt-5 text-lg font-bold text-brand-800">Message Sent Successfully!</h3>
            <p className="mt-1.5 text-xs text-gray-500 max-w-sm">
              Thank you for contacting us. Our team will get back to you shortly.
            </p>
            <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setSubmissionStatus('idle')}
                className="rounded-lg border border-brand-500 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                Send Another Message
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-warm-white hover:bg-brand-700"
              >
                Back to Top
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 p-5 shadow-sm min-h-[350px] flex flex-col items-center justify-center text-center animate-scale bg-warm-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <XCircle className="h-10 w-10" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-red-800">Message Could Not Be Sent</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-xs">
              Message could not be sent. Please try again.
            </p>
            <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setSubmissionStatus('idle')}
                className="rounded-lg bg-brand-600 px-5 py-2 text-xs font-semibold text-warm-white hover:bg-brand-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
