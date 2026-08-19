import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import CallNoteTimeline from '../../components/employee/CallNoteTimeline';
import InternalNotesPanel from '../../components/employee/InternalNotesPanel';

export default function EnquiryDetail() {
  const { id } = useParams();
  const { t } = useTranslation('dashboard');
  const { user } = useAuthStore();
  const [enquiry, setEnquiry] = useState(null);
  const [property, setProperty] = useState(null);

  function load() {
    enquiryService.getById(user, id).then(async (e) => {
      setEnquiry(e);
      if (e?.propertyId) setProperty(await propertyService.getPropertyById(e.propertyId));
    });
  }

  useEffect(load, [id, user]);

  if (enquiry === null) return null;
  if (!enquiry) return <div className="text-center text-sm text-gray-500">{t('empty.noData')}</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/employee/enquiries" className="mb-4 flex items-center gap-1 text-sm text-brand-700 hover:underline">
        <ChevronLeft size={16} /> {t('nav.enquiries', { ns: 'common' })}
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 p-5">
            <h1 className="font-semibold text-brand-800">{enquiry.buyerName}</h1>
            <p className="text-sm text-gray-500">{enquiry.buyerPhone}</p>
            {property && <p className="mt-2 text-sm text-gray-700">{property.titleEn} &middot; {property.locationEn}</p>}
            <p className="mt-2 text-sm text-gray-600">{enquiry.message}</p>
            <p className="mt-2 text-xs text-gray-400">{t('table.action')}: {enquiry.channel}</p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <CallNoteTimeline enquiryId={enquiry.id} />
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <InternalNotesPanel recordType="enquiry" recordId={enquiry.id} />
          </div>
        </div>

        <aside className="space-y-3">
          <span className="mb-1 block rounded-full bg-brand-50 px-3 py-1.5 text-center text-xs font-semibold text-brand-700">
            {t(`enquiryStatus.${enquiry.status}`)}
          </span>

          <div className="rounded-lg border border-gray-200 p-3 text-xs text-gray-500 space-y-1">
            <p><span className="font-medium text-gray-700">{t('table.status')}:</span> {t(`enquiryStatus.${enquiry.status}`)}</p>
            <p><span className="font-medium text-gray-700">{t('verification.priority')}:</span> {t(`priority.${enquiry.priority || 'medium'}`)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
