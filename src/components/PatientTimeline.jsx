import { CheckCircle2, AlertTriangle, CircleDot } from 'lucide-react';

const TYPE_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    markerClass: 'bg-emerald-500 ring-emerald-100',
    cardClass: 'border-emerald-200'
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    markerClass: 'bg-amber-500 ring-amber-100',
    cardClass: 'border-amber-300 shadow-amber-100/80 ring-1 ring-amber-200'
  },
  normal: {
    icon: CircleDot,
    iconClass: 'text-blue-600',
    markerClass: 'bg-blue-500 ring-blue-100',
    cardClass: 'border-blue-200'
  }
};

function getTypeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.normal;
}

export default function PatientTimeline({ timeline = [] }) {
  return (
    <section className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Patient Journey Timeline</h2>
        <p className="mt-1 text-sm text-slate-500">Continuity of care events in chronological order</p>
      </div>

      <ol className="relative space-y-4">
        {timeline.map((item, index) => {
          const style = getTypeStyle(item.type);
          const Icon = style.icon;
          const isLast = index === timeline.length - 1;

          return (
            <li key={`${item.date}-${item.title}-${index}`} className="relative">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr] md:gap-5">
                <div className="pt-1 text-sm font-medium text-slate-500 md:text-right">{item.date}</div>

                <div className="relative pl-8">
                  {!isLast && (
                    <span
                      className="absolute left-[11px] top-8 h-[calc(100%+0.75rem)] w-px bg-slate-200"
                      aria-hidden="true"
                    />
                  )}

                  <span
                    className={`absolute left-0 top-1 h-6 w-6 rounded-full ring-4 ${style.markerClass}`}
                    aria-hidden="true"
                  />

                  <article
                    className={`rounded-xl border bg-white p-4 shadow-sm transition-shadow ${style.cardClass} hover:shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.iconClass}`} />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
