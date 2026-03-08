import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Clock, CheckCircle2, Bell, MessageCircle, ArrowRight, Activity } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';
import ChatPanel from '../../components/ChatPanel';

export default function Medications({ user, onLogout, selectedDoctor, prescriptions, setPrescriptions }) {
  const [showSOS, setShowSOS] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  const markTaken = (pIdx, tIdx) => {
    setPrescriptions(prev => prev.map((p, pi) =>
      pi === pIdx ? { ...p, taken: p.taken.map((t, ti) => ti === tIdx ? true : t) } : p
    ));
  };

  const totalDoses = prescriptions.flatMap(p => p.taken).length;
  const takenDoses = prescriptions.flatMap(p => p.taken).filter(Boolean).length;
  const compliance = totalDoses > 0 ? Math.round(takenDoses / totalDoses * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} currentStep={2} onLogout={onLogout} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <h1>Your Medications</h1>
            <p>Prescribed by Dr. {selectedDoctor?.name}</p>
          </div>
        </div>

        {/* Compliance Card */}
        <div className="med-card mb-6 fade-in" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(0,102,204,0.05) 100%)', border: '2px solid rgba(0,102,204,0.15)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={20} color="var(--primary)" />
              <h3 className="font-bold">Today's Progress</h3>
            </div>
            <span className="text-2xl font-black" style={{ color: compliance >= 60 ? 'var(--success)' : 'var(--warning)' }}>
              {compliance}%
            </span>
          </div>
          <div className="compliance-bar-track">
            <div className="compliance-bar-fill" style={{ width: `${compliance}%` }}></div>
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {takenDoses} of {totalDoses} doses taken
          </div>
        </div>

        {/* Medication Cards */}
        <div className="flex flex-col gap-5 mb-8">
          {prescriptions.map((p, pi) => (
            <div key={p.id} className="med-card fade-in" style={{ animationDelay: `${pi * 0.1}s`, padding: '24px' }}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--primary-light)' }}>
                    <Pill size={22} color="var(--primary)" />
                  </div>
                  <div>
                    <div className="font-bold text-lg mb-1">{p.name}</div>
                    <div className="flex gap-2">
                      <span className="badge badge-primary">{p.instruction}</span>
                      <span className="badge badge-neutral">{p.days} days course</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                {p.times.map((time, ti) => (
                  <div key={ti}
                    className={`med-time-slot ${p.taken[ti] ? 'taken' : ''}`}
                    onClick={() => markTaken(pi, ti)}
                    style={{ padding: '16px', cursor: 'pointer' }}>
                    <div className="text-2xl mb-2">
                      {p.taken[ti] ? <CheckCircle2 size={28} color="var(--success)" /> : <Clock size={28} color="var(--text-muted)" />}
                    </div>
                    <div className="font-bold mb-1" style={{ color: p.taken[ti] ? 'var(--success)' : 'var(--text-primary)', fontSize: '1rem' }}>
                      {time}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {p.taken[ti] ? 'Completed ✓' : 'Tap to mark'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Continue */}
        <button className="btn btn-primary btn-lg btn-full fade-in" onClick={() => navigate('/patient/recovery')} style={{ padding: '16px' }}>
          Continue to Recovery Plan <ArrowRight size={20} />
        </button>

        {/* Chat */}
        <ChatPanel doctorName={selectedDoctor?.name} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} doctorName={selectedDoctor?.name} />}
    </div>
  );
}
