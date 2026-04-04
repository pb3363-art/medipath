import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Clock, CheckCircle2, Bell, MessageCircle, ArrowRight, Activity, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';
import ChatPanel from '../../components/ChatPanel';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Medications({ user, onLogout, selectedDoctor }) {
  const [showSOS, setShowSOS] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notifiedSet = useRef(new Set());

  // Real-time listener for prescriptions assigned to this patient
  useEffect(() => {
    const email = (user?.email || '').toLowerCase().trim();
    const uid = user?.uid;
    if (!email && !uid) return;

    console.log('Listening for prescriptions for:', email, uid);

    const q = query(
      collection(db, 'prescriptions'),
      where('status', '==', 'active')
    );

    const handleSnapshot = (snapshot) => {
      const activeForPatient = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .filter((presc) => {
          const prescEmail = (presc.patientEmail || '').toLowerCase().trim();
          const prescUid = presc.patientId || '';
          return (email && prescEmail === email) || (uid && prescUid === uid);
        })
        .map((presc) => ({
          ...presc,
          medications: (presc.medications || []).filter(
            (med) => !/^demo\b/i.test((med.name || '').trim())
          )
        }));

      setPrescriptions(activeForPatient);
      setLoading(false);
    };

    const unsubscribe = onSnapshot(q, (s) => handleSnapshot(s));

    return () => unsubscribe();
  }, [user?.email, user?.uid]);

  // Notification setup and polling
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      if ('Notification' in window && Notification.permission === 'granted' && prescriptions.length > 0) {
        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;
        const today = now.toDateString();

        prescriptions.forEach(p => {
          p.medications.forEach((med, mi) => {
            if (med.times && med.taken) {
              med.times.forEach((time, ti) => {
                const key = `${p.id}-${mi}-${ti}-${today}`;
                if (time === currentTime && !med.taken[ti] && !notifiedSet.current.has(key)) {
                  notifiedSet.current.add(key);
                  new Notification('MedAI Reminder: Time for your medicine', {
                    body: `Please take ${med.dosage} of ${med.name} (${med.instruction}).`,
                  });
                }
              });
            }
          });
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [prescriptions]);

  // Mark a dose as taken — writes directly to Firestore
  const markTaken = async (prescriptionId, medIndex, timeIndex) => {
    const presc = prescriptions.find(p => p.id === prescriptionId);
    if (!presc) return;

    const updatedMeds = [...presc.medications];
    updatedMeds[medIndex] = {
      ...updatedMeds[medIndex],
      taken: updatedMeds[medIndex].taken.map((t, i) => i === timeIndex ? true : t)
    };

    try {
      const prescRef = doc(db, 'prescriptions', prescriptionId);
      await updateDoc(prescRef, { medications: updatedMeds });
    } catch (err) {
      console.error('Error marking dose:', err);
    }
  };

  // Advance the day for a prescription
  const advanceDay = async (prescriptionId) => {
    const presc = prescriptions.find(p => p.id === prescriptionId);
    if (!presc) return;

    const nextDay = (presc.currentDay || 1) + 1;
    const maxDays = presc.medications.length ? Math.max(...presc.medications.map(m => parseInt(m.days) || 1)) : 1;

    // Reset taken array for the next active day
    const updatedMeds = presc.medications.map(m => ({
      ...m,
      taken: (nextDay <= maxDays && m.times) ? m.times.map(() => false) : m.taken
    }));

    try {
      const prescRef = doc(db, 'prescriptions', prescriptionId);
      await updateDoc(prescRef, { 
        currentDay: nextDay,
        medications: updatedMeds 
      });
    } catch (err) {
      console.error('Error advancing day:', err);
    }
  };

  const allCoursesFinished = prescriptions.length > 0 && prescriptions.every(presc => {
    const maxDays = presc.medications.length ? Math.max(...presc.medications.map(m => parseInt(m.days) || 1)) : 1;
    return (presc.currentDay || 1) > maxDays;
  });

  // Archive a completed course so it disappears from active dashboard
  const archiveCourse = async (prescriptionId) => {
    try {
      const prescRef = doc(db, 'prescriptions', prescriptionId);
      await updateDoc(prescRef, { status: 'archived' });
    } catch (err) {
      console.error('Error archiving course:', err);
    }
  };

  // Compute compliance for today's active doses only
  const todaysDoseStates = prescriptions.flatMap((presc) => {
    const currentDay = presc.currentDay || 1;

    return (presc.medications || []).flatMap((med) => {
      const medDays = parseInt(med.days) || 1;
      const isActiveToday = currentDay <= medDays;
      if (!isActiveToday || !med.times || med.times.length === 0) return [];

      return med.times.map((_, timeIndex) => Boolean(med.taken?.[timeIndex]));
    });
  });

  const totalDoses = todaysDoseStates.length;
  const takenDoses = todaysDoseStates.filter(Boolean).length;
  const compliance = totalDoses > 0 ? Math.round(takenDoses / totalDoses * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} currentStep={2} onLogout={onLogout} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <h1>Your Medications</h1>
            <p>{selectedDoctor ? `Prescribed by Dr. ${selectedDoctor.name}` : 'Your active prescriptions'}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <span className="ml-3" style={{ color: 'var(--text-muted)' }}>Loading prescriptions...</span>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="med-card fade-in text-center" style={{ padding: '48px 24px' }}>
            <Pill size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 className="font-bold mb-2">No Active Prescriptions</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              No treatments found for <strong>{(user?.email || '').toLowerCase()}</strong>.
              Please ensure your doctor has prescribed medicines specifically to this email address.
            </p>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={() => window.location.reload()}
              style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
              Check for Updates
            </button>
          </div>
        ) : (
          <>
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

            {/* Prescription Cards */}
            {prescriptions.map((presc) => {
              const currentDay = presc.currentDay || 1;
              const maxDays = presc.medications.length ? Math.max(...presc.medications.map(m => parseInt(m.days) || 1)) : 1;
              const isFinished = currentDay > maxDays;
              const allTakenToday = !isFinished && presc.medications.every(m => !m.times || m.times.length === 0 || (m.taken && m.taken.every(t => t)));

              return (
              <div key={presc.id} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary">Dr. {presc.doctorName}</span>
                    <span className="badge badge-neutral">{presc.diagnosis}</span>
                  </div>
                  {isFinished ? (
                    <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)', fontWeight: 'bold' }}>✓ Course Complete</span>
                  ) : (
                    <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 'bold' }}>Day {currentDay} of {maxDays}</span>
                  )}
                </div>

                <div className={`flex flex-col gap-5 mb-4 ${isFinished ? 'opacity-60' : ''}`}>
                  {presc.medications.map((med, mi) => (
                    <div key={mi} className="med-card fade-in" style={{ animationDelay: `${mi * 0.1}s`, padding: '24px' }}>
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: 'var(--primary-light)' }}>
                            <Pill size={22} color="var(--primary)" />
                          </div>
                          <div>
                            <div className="font-bold text-lg mb-1">{med.name}</div>
                            <div className="flex gap-2">
                              <span className="badge badge-primary">{med.instruction}</span>
                              <span className="badge badge-neutral">{med.days} days course</span>
                              {med.dosage && <span className="badge badge-neutral">{med.dosage}</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {med.times && med.times.length > 0 ? (
                        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                          {med.times.map((time, ti) => (
                            <div key={ti}
                              className={`med-time-slot ${med.taken?.[ti] ? 'taken' : ''}`}
                              onClick={() => !med.taken?.[ti] && markTaken(presc.id, mi, ti)}
                              style={{ padding: '16px', cursor: med.taken?.[ti] ? 'default' : 'pointer' }}>
                              <div className="text-2xl mb-2">
                                {med.taken?.[ti] ? <CheckCircle2 size={28} color="var(--success)" /> : <Clock size={28} color="var(--text-muted)" />}
                              </div>
                              <div className="font-bold mb-1" style={{ color: med.taken?.[ti] ? 'var(--success)' : 'var(--text-primary)', fontSize: '1rem' }}>
                                {time}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {med.taken?.[ti] ? 'Completed ✓' : 'Tap to mark'}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm p-3 rounded-lg" style={{ background: 'var(--bg-section)', color: 'var(--text-muted)' }}>
                          ⏳ Timings not yet set by your doctor
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Complete Day Button */}
                  {!isFinished && allTakenToday && (
                    <button className="btn btn-primary btn-full fade-in" onClick={() => advanceDay(presc.id)} style={{ padding: '16px', fontWeight: 'bold' }}>
                      Complete Day {currentDay} & Advance to Day {currentDay + 1} <ArrowRight size={18} />
                    </button>
                  )}
                  {isFinished && (
                    <div className="flex flex-col gap-3 fade-in">
                      <div className="p-4 rounded-xl text-center" style={{ border: '2px solid rgba(40,167,69,0.2)', color: 'var(--success)', fontWeight: 'bold' }}>
                        Great job! You have fully completed the {maxDays}-day course for this prescription.
                      </div>
                      <button className="btn btn-outline btn-full" onClick={() => archiveCourse(presc.id)} style={{ padding: '12px', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
                        Archive & Hide from Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </>
        )}

        {/* Continue */}
        {prescriptions.length > 0 && (
          <div className="mt-8">
            {allCoursesFinished ? (
              <button className="btn btn-success btn-lg btn-full fade-in" onClick={() => navigate('/patient/recovery')} style={{ padding: '16px', fontSize: '1.05rem', boxShadow: 'var(--shadow-lg)' }}>
                All Courses Complete! Unlock Phase 3 <ArrowRight size={20} />
              </button>
            ) : (
              <button className="btn btn-lg btn-full fade-in flex items-center justify-center gap-2" disabled style={{ padding: '16px', background: 'var(--bg-section)', color: 'var(--text-muted)', border: '2px dashed var(--border)', cursor: 'not-allowed' }}>
                🔒 Complete your full prescribed course to unlock Phase 3
              </button>
            )}
          </div>
        )}

        {/* Chat */}
        <ChatPanel doctorName={selectedDoctor?.name} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} doctorName={selectedDoctor?.name} />}
    </div>
  );
}
