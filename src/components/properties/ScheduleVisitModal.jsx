import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Clock } from 'lucide-react';

const TIME_SLOTS = [
  { id: '09:00', label: '09:00 AM - 10:00 AM', startTime: '09:00' },
  { id: '10:00', label: '10:00 AM - 11:00 AM', startTime: '10:00' },
  { id: '11:00', label: '11:00 AM - 12:00 PM', startTime: '11:00' },
  { id: '12:00', label: '12:00 PM - 01:00 PM', startTime: '12:00' },
  { id: '13:00', label: '01:00 PM - 02:00 PM', startTime: '13:00' },
  { id: '14:00', label: '02:00 PM - 03:00 PM', startTime: '14:00' },
  { id: '15:00', label: '03:00 PM - 04:00 PM', startTime: '15:00' },
  { id: '16:00', label: '04:00 PM - 05:00 PM', startTime: '16:00' },
  { id: '17:00', label: '05:00 PM - 06:00 PM', startTime: '17:00' },
];

export default function ScheduleVisitModal({ open, onClose, onConfirm }) {
  const { t } = useTranslation('common');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  if (!open) return null;

  // Calculate min date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) return;
    const slotObj = TIME_SLOTS.find((s) => s.id === selectedSlot);
    if (!slotObj) return;
    const combinedISO = `${selectedDate}T${slotObj.startTime}:00`;
    onConfirm(combinedISO);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-warm-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-semibold text-brand-800 flex items-center gap-2">
            <Calendar size={18} className="text-brand-600" />
            {t('buttons.scheduleVisit')}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="visit-date" className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Select Visit Date
          </label>
          <input
            id="visit-date"
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-brand-600" />
            Select Time Slot (9:00 AM - 6:00 PM)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                      : 'border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-gray-50'
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
            {t('buttons.cancel')}
          </button>
          <button
            type="button"
            disabled={!selectedDate || !selectedSlot}
            onClick={handleConfirm}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-warm-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {t('buttons.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

