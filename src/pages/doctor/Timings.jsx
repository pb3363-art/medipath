import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Plus, X, ArrowRight, Save, Bell, Pill } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Timings({ user, onLogout }) {
  const [saved, setSaved] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the prescription ID and meds from the navigation state
  const prescriptionId = location.state?.prescriptionId;
  const meds = location.state?.meds || [];

  const [timings, setTimings] = useState({});

  const setMedTimes = (medName, times) => setTimings(prev => ({ ...prev, [medName]: times }));

  const handleSave = async () => {
    if (!prescriptionId) {
      alert('No prescription found. Please go back and create one first.');
      return;
    }

    setSaved(true);

    try {
      // Build updated medications array with times and taken arrays
      const updatedMeds = meds.filter(m => m.name).map(m => {
        const medTimes = (timings[m.name] || []).filter(Boolean);
        return {
          name: m.name,
          dosage: m.dosage,
          days: parseInt(m.days) || 1,
          instruction: m.instruction,
          times: medTimes,
          taken: medTimes.map(() => false) // Initialize all as not taken
        };
      });

      // Update the Firestore prescription document with timings
      const prescRef = doc(db, 'prescriptions', prescriptionId);
      await updateDoc(prescRef, { medications: updatedMeds });

      setTimeout(() => {
        setSaved(false);
        navigate('/doctor/diet', { state: { prescriptionId } });
      }, 1000);
    } catch (err) {
      console.error('Error saving timings:', err);
      alert('Failed to save timings. Please try again.');
      setSaved(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} currentStep={2} onLogout={onLogout} />

      <div className="page-container">
        <div className="section-header fade-in">
          <h1>Set Medication Timings</h1>
          <p>Configure exact reminder times for each medication</p>
        </div>

        {!prescriptionId && (
          <div className="med-card card-pad-md mb-5 fade-in" style={{ borderLeft: '4px solid var(--warning)' }}>
            <p className="text-sm" style={{ color: 'var(--warning)' }}>
              ⚠️ No prescription found. Please <button onClick={() => navigate('/doctor/prescribe')} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>write a prescription</button> first.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8 mb-8">
          {meds.filter(m => m.name).map((med, i) => {
            const times = timings[med.name] || [''];
            return (
              <div key={i} className="med-card card-pad-md fade-in" style={{ borderLeft: '4px solid var(--primary)', animationDelay: `${i * 0.1}s` }}>
                <div className="card-head mb-4">
                  <div className="card-head-left">
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
                          style={{ paddingLeft: 36, width: 'min(160px, 42vw)' }}
                        />
                      </div>
                      {times.length > 1 && (
                        <button className="btn btn-sm btn-soft-danger" onClick={() => setMedTimes(med.name, times.filter((_, xi) => xi !== ti))}>
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

        <button className="btn btn-primary btn-lg btn-full" onClick={handleSave} disabled={saved || !prescriptionId}>
          {saved ? (<><Save size={18} /> Timings Saved!</>) : (<>Confirm Timings & Set Diet Plan <ArrowRight size={18} /></>)}
        </button>
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} doctorName="Emergency Services" />}
    </div>
  );
}
