import { Check, X } from 'lucide-react';

export default function WizardStepper({ steps, current, completed = {} }) {
  return (
    <div className="mb-8 overflow-x-auto scrollbar-none">
      <ol className="flex min-w-max gap-2">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const done = stepNum < current;
          const active = stepNum === current;
          const isComplete = done && completed[stepNum];
          const isIncomplete = done && !completed[stepNum];
          return (
            <li key={label} className="flex items-center gap-2" title={isIncomplete ? 'This step is incomplete' : undefined}>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isIncomplete
                    ? 'bg-red-100 text-red-600 ring-2 ring-red-500'
                    : isComplete
                    ? 'bg-green-600 text-warm-white'
                    : active
                    ? 'bg-brand-100 text-brand-800 ring-2 ring-brand-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isComplete ? <Check size={14} /> : isIncomplete ? <X size={14} /> : stepNum}
              </span>
              <span className={`text-xs font-medium ${active ? 'text-brand-800' : isIncomplete ? 'text-red-500' : 'text-gray-400'}`}>{label}</span>
              {stepNum < steps.length && <span className="mx-1 h-px w-6 bg-gray-200" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}