import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Trash2, ArrowRight, Save, UserSearch, Clock3, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';
import { db } from '../../lib/firebase';
import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where, writeBatch } from 'firebase/firestore';

export default function Prescriptions({ user, onLogout }) {
  const [saved, setSaved] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [sosAlert, setSosAlert] = useState(false);
  const [doctorQueue, setDoctorQueue] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const navigate = useNavigate();

  const [localMeds, setLocalMeds] = useState([{ name: '', dosage: '', days: '', instruction: 'After meals' }]);
  const [localPatientInfo, setLocalPatientInfo] = useState({ email: '', name: '', diagnosis: '', symptoms: '' });

  const normalizeDoctorName = (value = '') =>
    value.toLowerCase().replace(/^dr\.?\s+/i, '').replace(/\s+/g, ' ').trim();

  useEffect(() => {
    const queueQuery = query(collection(db, 'queue_entries'));

    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {
      const normalizedUserName = normalizeDoctorName(user?.name || user?.email || '');
      const nextQueue = snapshot.docs
        .map((entry) => ({ id: entry.id, ...entry.data() }))
        .filter((entry) => {
          if (entry.status !== 'scheduled') return false;

          const entryDoctorId = entry.doctorId || '';
          const entryDoctorEmail = (entry.doctorEmail || '').toLowerCase().trim();
          const entryDoctorName = normalizeDoctorName(entry.doctorName || '');
          const userEmail = (user?.email || '').toLowerCase().trim();
          const userUid = user?.uid || '';

          return (
            entryDoctorId === userUid ||
            entryDoctorEmail === userEmail ||
            (normalizedUserName && entryDoctorName === normalizedUserName)
          );
        })
        .sort((a, b) => {
          const aTime = new Date(a.approvedAt || a.timestamp || 0).getTime();
          const bTime = new Date(b.approvedAt || b.timestamp || 0).getTime();
          return aTime - bTime;
        });

      setDoctorQueue(nextQueue);
      setSelectedQueueId((current) => {
        if (current && nextQueue.some((entry) => entry.id === current)) return current;
        return nextQueue[0]?.id || '';
      });
    });

    return () => unsubscribe();
  }, [user]);

  const selectedQueuePatient = useMemo(
    () => doctorQueue.find((entry) => entry.id === selectedQueueId) || null,
    [doctorQueue, selectedQueueId]
  );

  useEffect(() => {
    if (!selectedQueuePatient) return;

    setLocalPatientInfo((prev) => ({
      email: selectedQueuePatient.patientEmail || prev.email,
      name: selectedQueuePatient.patientName || prev.name,
      diagnosis: prev.diagnosis,
      symptoms: Array.isArray(selectedQueuePatient.symptoms)
        ? selectedQueuePatient.symptoms.join(', ')
        : selectedQueuePatient.symptoms || prev.symptoms
    }));
  }, [selectedQueuePatient]);

  const addMed = () => setLocalMeds(prev => [...prev, { name: '', dosage: '', days: '', instruction: 'After meals' }]);
  const updateMed = (i, field, val) => {
    const newMeds = [...localMeds];
    newMeds[i] = { ...newMeds[i], [field]: val };
    setLocalMeds(newMeds);
  };
  const removeMed = (i) => setLocalMeds(prev => prev.filter((_, mi) => mi !== i));

  const handleSave = async () => {
    // Validate
    const validMeds = localMeds.filter(m => m.name.trim());
    if (!localPatientInfo.email.trim() || validMeds.length === 0) {
      alert('Please enter patient email and at least one medication.');
      return;
    }

    setSaved(true);

    try {
      const patientEmail = localPatientInfo.email.trim().toLowerCase();

      // Archive any currently active prescriptions for this patient so the new doctor's plan is the only active one
      const activeQ = query(
        collection(db, 'prescriptions'),
        where('patientEmail', '==', patientEmail),
        where('status', '==', 'active')
      );
      const activeSnap = await getDocs(activeQ);
      if (!activeSnap.empty) {
        const batch = writeBatch(db);
        activeSnap.docs.forEach((d) => {
          batch.update(d.ref, {
            status: 'archived',
            archivedAt: new Date().toISOString(),
            archiveReason: 'Replaced by new prescription'
          });
        });
        await batch.commit();
      }

      // Create a prescription document in Firestore
      const prescriptionData = {
        doctorId: user.uid,
        doctorName: user.name || user.email,
        patientEmail: patientEmail,
        patientName: localPatientInfo.name.trim(),
        patientId: selectedQueuePatient?.patientId || '',
        diagnosis: localPatientInfo.diagnosis.trim(),
        symptoms: localPatientInfo.symptoms.trim(),
        queueEntryId: selectedQueuePatient?.id || '',
        medications: validMeds.map(m => ({
          name: m.name,
          dosage: m.dosage,
          days: parseInt(m.days) || 1,
          instruction: m.instruction,
          times: [],      // Will be set in Timings page
          taken: []       // Will be populated when times are set
        })),
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);

      if (selectedQueuePatient?.id) {
        await updateDoc(doc(db, 'queue_entries', selectedQueuePatient.id), {
          status: 'completed',
          prescriptionId: docRef.id,
          prescriptionCreatedAt: new Date().toISOString(),
          attendedByDoctorId: user.uid,
          attendedByDoctorName: user.name || user.email
        });
      }

      // Navigate to timings page with the prescription ID
      setTimeout(() => {
        setSaved(false);
        navigate('/doctor/timings', { state: { prescriptionId: docRef.id, meds: validMeds } });
      }, 800);
    } catch (err) {
      console.error('Error saving prescription:', err);
      alert('Failed to save prescription. Please try again.');
      setSaved(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* SOS Alert */}
      {sosAlert && (
        <div className="fade-in" style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1500, maxWidth: 340, width: 'calc(100% - 32px)',
          background: 'var(--bg-white)', border: '2px solid var(--danger)', borderRadius: 'var(--radius-lg)',
          padding: '16px', boxShadow: 'var(--shadow-lg)',
        }}>
          <div className="flex items-start justify-between mb-2">
            <div className="font-bold text-sm" style={{ color: 'var(--danger)' }}>🚨 SOS Alert Received</div>
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => setSosAlert(false)}
              style={{ color: 'var(--text-muted)', fontSize: 14 }}
            >
              ✕
            </button>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A patient has sent an emergency alert.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-danger btn-sm flex-1" onClick={() => setSosAlert(false)}>Respond</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSosAlert(false)}>Dismiss</button>
          </div>
        </div>
      )}

      <Navbar user={user} currentStep={1} onLogout={onLogout} />

      <div className="page-container">
        <div className="section-header fade-in">
          <h1>Write Prescription</h1>
          <p>Review your accepted patients in queue order, then prescribe medications</p>
        </div>

        <div className="med-card card-pad-md mb-5 fade-in" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="card-head-left mb-4">
            <Clock3 size={18} color="var(--warning)" />
            <h3 className="font-bold">Accepted Patient Queue</h3>
          </div>

          {doctorQueue.length === 0 ? (
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No admin-approved patients are waiting for you right now.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {doctorQueue.map((queueItem, index) => {
                const isActive = queueItem.id === selectedQueueId;
                return (
                  <button
                    key={queueItem.id}
                    type="button"
                    className="text-left p-4 rounded-xl"
                    onClick={() => setSelectedQueueId(queueItem.id)}
                    style={{
                      background: isActive ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-section)',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="font-bold">
                        #{index + 1} {queueItem.patientName || queueItem.patientEmail || 'Unknown Patient'}
                      </div>
                      {isActive && (
                        <span className="badge badge-primary">Selected</span>
                      )}
                    </div>
                    <div className="text-sm flex flex-col gap-1" style={{ color: 'var(--text-muted)' }}>
                      <div>{queueItem.patientEmail || 'No email provided'}</div>
                      <div>Appointment: {queueItem.appointmentTime || 'Time not assigned'}</div>
                      <div>
                        Symptoms:{' '}
                        {Array.isArray(queueItem.symptoms)
                          ? queueItem.symptoms.join(', ')
                          : queueItem.symptoms || 'Not recorded'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div className="med-card card-pad-md mb-5 fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="card-head-left mb-4">
            <UserSearch size={18} color="var(--primary)" />
            <h3 className="font-bold">Patient Information</h3>
          </div>
          {selectedQueuePatient && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Patient details loaded from the admin-approved doctor queue.
              </span>
            </div>
          )}
          <div className="grid-2">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Patient Email</label>
              <input value={localPatientInfo.email} onChange={e => setLocalPatientInfo(p => ({ ...p, email: e.target.value }))} placeholder="patient@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Patient Name</label>
              <input value={localPatientInfo.name} onChange={e => setLocalPatientInfo(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
            </div>
          </div>
          <div className="grid-2 mt-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Diagnosis</label>
              <input value={localPatientInfo.diagnosis} onChange={e => setLocalPatientInfo(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Primary diagnosis / condition" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Symptoms</label>
              <input value={localPatientInfo.symptoms} onChange={e => setLocalPatientInfo(p => ({ ...p, symptoms: e.target.value }))} placeholder="e.g. Fever, Cough, Fatigue..." />
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="med-card card-pad-md mb-5 fade-in">
          <div className="card-head mb-4">
            <div className="card-head-left">
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
                    <button className="btn btn-sm btn-soft-danger" onClick={() => removeMed(i)}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
                <div className="meds-grid">
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

        <button className="btn btn-primary btn-lg btn-full" onClick={handleSave} disabled={saved}>
          {saved ? (<><Save size={18} /> Saved! Moving to Timings...</>) : (<>Save & Set Timings <ArrowRight size={18} /></>)}
        </button>
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} doctorName="Emergency Services" />}
    </div>
  );
}

