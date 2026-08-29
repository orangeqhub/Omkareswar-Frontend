import { useTranslation } from 'react-i18next';
import { scoreTone } from '../../utils/propertyScore';

const TONE_STYLES = {
  green: {
    bar: 'bg-green-500',
    text: 'text-green-700',
    ring: '#22c55e',
  },
  amber: {
    bar: 'bg-amber-500',
    text: 'text-amber-700',
    ring: '#f59e0b',
  },
  red: {
    bar: 'bg-red-500',
    text: 'text-red-600',
    ring: '#ef4444',
  },
};

export default function CompletionScoreCard({ score = 0, sections = [], title, showHeader = true }) {
  const { t } = useTranslation('common');
  const tone = TONE_STYLES[scoreTone(score)] || TONE_STYLES.red;
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * clamped) / 100;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {title || t('scorecard.title', { defaultValue: 'Property Completion Score' })}
            </h3>
            <p className="text-xs text-gray-500">
              {t('scorecard.subtitle', { defaultValue: 'Details filled in by the poster' })}
            </p>
          </div>
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
              <circle cx="32" cy="32" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke={tone.ring}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${tone.text}`}>
              {clamped}%
            </span>
          </div>
        </div>
      )}

      {sections.length > 0 && (
        <div className={`space-y-2 ${showHeader ? 'mt-4 border-t border-gray-100 pt-4' : ''}`}>
          {sections.map((s) => {
            const p = Math.max(0, Math.min(100, Number(s.percentage) || 0));
            return (
              <div key={s.key} className="flex items-center gap-2">
                <span className="w-40 shrink-0 truncate text-xs font-medium text-gray-600">{s.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${TONE_STYLES[scoreTone(p)].bar}`} style={{ width: `${p}%` }} />
                </div>
                <span className="w-9 shrink-0 text-right text-xs font-semibold text-gray-700">
                  {s.filled}/{s.total}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}