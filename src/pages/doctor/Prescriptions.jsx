import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Trash2, ArrowRight, Save, UserSearch } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';

export default function Prescriptions({ user, onLogout, meds, setMeds, patientInfo, setPatientInfo }) {
  const [saved, setSaved] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [sosAlert, setSosAlert] = useState(false); // Changed to false by default
  const navigate = useNavigate();

  // Local state for inputs to prevent re-render lag
  const [localMeds, setLocalMeds] = useState(meds);
  const [localPatientInfo, setLocalPatientInfo] = useState(patientInfo);

  // Sync local state with parent on mount
  useEffect(() => {
    setLocalMeds(meds);
  }, []);

  useEffect(() => {
    setLocalPatientInfo(patientInfo);
  }, []);

  const addMed = () => setLocalMeds(prev => [...prev, { name: '', dosage: '', days: '', instruction: 'After meals' }]);
  const updateMed = (i, field, val) => {
    const newMeds = [...localMeds];
    newMeds[i] = { ...newMeds[i], [field]: val };
    setLocalMeds(newMeds);
  };
  const removeMed = (i) => setLocalMeds(prev => prev.filter((_, mi) => mi !== i));

  const handleSave = () => {
    // Update parent state only on save
    setMeds(localMeds);
    setPatientInfo(localPatientInfo);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/doctor/timings'); }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* SOS Alert */}
      {sosAlert && (
        <div className="fade-in" style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1500, maxWidth: 340,
          background: 'var(--bg-white)', border: '2px solid var(--danger)', borderRadius: 'var(--radius-lg)',
          padding: '16px', boxShadow: 'var(--shadow-lg)',
        }}>
          <div className="flex items-start justify-between mb-2">
            <div className="font-bold text-sm" style={{ color: 'var(--danger)' }}>🚨 SOS Alert Received</div>
            <button className="btn" onClick={() => setSosAlert(false)}
              style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 14, padding: '0 4px' }}>✕</button>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Patient <strong>Ahmed Raza (P-00421)</strong> has sent an emergency alert.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-danger btn-sm flex-1" onClick={() => setSosAlert(false)}>Respond</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSosAlert(false)}>Dismiss</button>
          </div>
        </div>
      )}

      <Navbar user={user} currentStep={1} onLogout={onLogout} />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>
        <div className="section-header fade-in">
          <h1>Write Prescription</h1>
          <p>Enter patient details and prescribed medications</p>
        </div>

        {/* Patient Info */}
        <div className="med-card mb-5 fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="flex items-center gap-2 mb-4">
            <UserSearch size={18} color="var(--primary)" />
            <h3 className="font-bold">Patient Information</h3>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Patient ID</label>
              <input value={localPatientInfo.id} onChange={e => setLocalPatientInfo(p => ({ ...p, id: e.target.value }))} placeholder="e.g. P-00421" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Patient Name</label>
              <input value={localPatientInfo.name} onChange={e => setLocalPatientInfo(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Diagnosis</label>
            <input value={localPatientInfo.diagnosis} onChange={e => setLocalPatientInfo(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Primary diagnosis / condition" />
          </div>
        </div>

        {/* Medications */}
        <div className="med-card mb-5 fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} color="var(--primary)" />
              <h3 className="font-bold">Medications</h3>
            </div>
            <button className="btn btn-outline btn-sm" onClick={addMed}>
              <Plus size={14} /> Add Medicine
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {localMeds.map((med, i) => (
              <div key={i} className="p-4 rounded-lg" style={{ background: 'var(--bg-section)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-primary">Medicine #{i + 1}</span>
                  {localMeds.length > 1 && (
                    <button className="btn btn-sm" onClick={() => removeMed(i)}
                      style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '4px 10px' }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Medicine Name</label>
                    <input value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} placeholder="e.g. Paracetamol 500mg" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Dosage</label>
                    <input value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="e.g. 1 tab" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Days</label>
                    <input value={med.days} onChange={e => updateMed(i, 'days', e.target.value)} placeholder="e.g. 7" type="number" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Instruction</label>
                    <select value={med.instruction} onChange={e => updateMed(i, 'instruction', e.target.value)}>
                      <option>After meals</option>
                      <option>Before meals</option>
                      <option>With food</option>
                      <option>Empty stomach</option>
                      <option>At bedtime</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg btn-full" onClick={handleSave}>
          {saved ? (<><Save size={18} /> Saved! Moving to Timings...</>) : (<>Save & Set Timings <ArrowRight size={18} /></>)}
        </button>
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} doctorName="Emergency Services" />}
    </div>
  );
}
