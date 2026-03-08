import { AlertTriangle, Phone, X } from 'lucide-react';

export default function SOSModal({ onClose, doctorName }) {
  const helplines = [
    { label: '1122', country: 'Pakistan' },
    { label: '112', country: 'India' },
    { label: '119', country: 'Bangladesh' },
    { label: '1990', country: 'Sri Lanka' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()}
        style={{ border: '2px solid var(--danger)', textAlign: 'center' }}>
        
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'var(--danger-light)' }}>
            <AlertTriangle size={32} color="var(--danger)" />
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--danger)' }}>
          Emergency SOS Sent
        </h2>

        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Your emergency alert has been sent to{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{doctorName || 'your assigned doctor'}</strong>.{' '}
          They will contact you within minutes. If this is a life-threatening emergency, please also call emergency services immediately.
        </p>

        <div className="med-card-flat mb-5" style={{ background: 'var(--bg-section)' }}>
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Emergency Helplines
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {helplines.map(h => (
              <div key={h.label} className="flex items-center gap-2">
                <Phone size={14} color="var(--danger)" />
                <span className="font-bold text-sm" style={{ color: 'var(--danger)' }}>{h.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({h.country})</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-danger btn-full" onClick={onClose}>
          <X size={16} />
          Close
        </button>
      </div>
    </div>
  );
}
