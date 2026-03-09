import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState('patient');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!id.trim() || !name.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ role, id: id.trim(), name: name.trim() });
      navigate(role === 'patient' ? '/patient/match' : '/doctor/prescribe');
    }, 1000);
  };

  return (
    <div className="login-wrapper">
      {/* Left: Branding sidebar */}
      <div className="login-sidebar">
        <div className="pattern-overlay"></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              <Stethoscope size={24} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>MedAI</h1>
              <div className="text-xs text-white/60 font-semibold tracking-widest uppercase">Clinical Decision Support</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4" style={{ lineHeight: 1.3 }}>
            Intelligent healthcare<br />for South Asian hospitals
          </h2>
          <p className="text-white/70 text-sm mb-8" style={{ lineHeight: 1.7, maxWidth: 380 }}>
            AI-powered symptom analysis, real-time doctor matching, medication management,
            and recovery tracking — all in one secure platform.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { icon: '🔬', label: 'Bayesian doctor matching based on symptoms' },
              { icon: '💊', label: 'Medication schedule with reminders' },
              { icon: '📊', label: 'Recovery tracking & rehab videos' },
              { icon: '🛡️', label: 'Emergency SOS with instant alerts' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80 text-sm">
                <span className="text-lg">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '32px',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '0.05em',
          fontWeight: 500,
          zIndex: 1
        }}>
          developed by pranay
        </div>
      </div>

      {/* Right: Login form */}
      <div className="login-form-section">
        <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Sign in to MedAI</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Access your healthcare portal</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl"
            style={{ background: 'var(--bg-section)', border: '1px solid var(--border)' }}>
            {[
              { val: 'patient', icon: <User size={16} />, label: 'Patient' },
              { val: 'doctor', icon: <Stethoscope size={16} />, label: 'Doctor' },
            ].map(r => (
              <button key={r.val} className="btn flex-1"
                onClick={() => setRole(r.val)}
                style={{
                  padding: '12px',
                  background: role === r.val ? (r.val === 'doctor' ? 'var(--primary)' : 'var(--success)') : 'transparent',
                  color: role === r.val ? 'white' : 'var(--text-muted)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  transition: 'all 0.25s',
                  boxShadow: role === r.val ? 'var(--shadow-sm)' : 'none',
                }}>
                {r.icon}
                {r.label} Login
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                {role === 'patient' ? 'Patient ID' : 'Doctor ID'}
              </label>
              <input
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder={role === 'patient' ? 'e.g. P-00421 (Hospital ID)' : 'e.g. D-00301 (Doctor ID)'}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                Full Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm mb-4 p-3 rounded-lg"
              style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn btn-lg btn-full"
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: loading ? 'var(--border)' : role === 'doctor' ? 'var(--primary)' : 'var(--success)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9375rem',
            }}>
            {loading ? (
              <><span className="spinner"></span> Authenticating...</>
            ) : (
              <>{role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'} <ArrowRight size={18} /></>
            )}
          </button>

          <div className="text-center mt-4 flex items-center justify-center gap-2 text-xs"
            style={{ color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} />
            Hospital ID provided by your medical facility
          </div>
        </div>
      </div>
    </div>
  );
}
