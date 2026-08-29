import { scoreTone } from '../../utils/propertyScore';

const TONE_CLASSES = {
  green: 'bg-green-100 text-green-800 border-green-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
};

export default function CompletionBadge({ score = 0, label, size = 'sm' }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const tone = TONE_CLASSES[scoreTone(clamped)] || TONE_CLASSES.red;
  const sizeCls = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-semibold ${sizeCls} ${tone}`}
      title={`${clamped}% completed`}
    >
      {label && <span className="font-medium opacity-70">{label}:</span>}
      {clamped}%
    </span>
  );
}