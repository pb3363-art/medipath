import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, X, ArrowRight, Save, Bell, Pill } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';

export default function Timings({ user, onLogout, meds, timings, setTimings }) {
  const [saved, setSaved] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const navigate = useNavigate();

  const setMedTimes = (medName, times) => setTimings(prev => ({ ...prev, [medName]: times }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/doctor/diet'); }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} currentStep={2} onLogout={onLogout} />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>
        <div className="section-header fade-in">
          <h1>Set Medication Timings</h1>
          <p>Configure exact reminder times for each medication</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {meds.filter(m => m.name).map((med, i) => {
            const times = timings[med.name] || [''];
            return (
              <div key={i} className="med-card fade-in" style={{ borderLeft: '4px solid var(--primary)', animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--primary-light)' }}>
                      <Pill size={18} color="var(--primary)" />
                    </div>
                    <div>
                      <div className="font-bold text-base">{med.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {med.instruction} · {med.days} days · {med.dosage}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => setMedTimes(med.name, [...times, ''])}>
                    <Plus size={14} /> Add Time
                  </button>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {times.map((t, ti) => (
                    <div key={ti} className="flex items-center gap-2">
                      <div className="relative">
                        <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="time"
                          value={t}
                          onChange={e => {
                            const newTimes = [...times];
                            newTimes[ti] = e.target.value;
                            setMedTimes(med.name, newTimes);
                          }}
                          style={{ paddingLeft: 36, width: 160 }}
                        />
                      </div>
                      {times.length > 1 && (
                        <button className="btn btn-sm" onClick={() => setMedTimes(med.name, times.filter((_, xi) => xi !== ti))}
                          style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '8px 10px' }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {times.filter(Boolean).length > 0 && (
                  <div className="mt-3 p-3 rounded-lg text-xs flex items-center gap-2"
                    style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(40,167,69,0.15)' }}>
                    <Bell size={14} />
                    {times.filter(Boolean).length} reminder{times.filter(Boolean).length > 1 ? 's' : ''} set — notifications will be sent to patient automatically
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary btn-lg btn-full" onClick={handleSave}>
          {saved ? (<><Save size={18} /> Timings Saved!</>) : (<>Confirm Timings & Set Diet Plan <ArrowRight size={18} /></>)}
        </button>
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} doctorName="Emergency Services" />}
    </div>
  );
}
