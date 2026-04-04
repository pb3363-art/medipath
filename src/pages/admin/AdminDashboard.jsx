import { useState, useEffect } from 'react';
import { LogOut, Calendar, Clock, CheckCircle, Activity, UserSearch } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { DOCTORS_DB } from '../../data/doctors';

export default function AdminDashboard({ user, onLogout }) {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [timeInput, setTimeInput] = useState('');

  useEffect(() => {
    // Listen to queue_entries sorted by oldest first
    const q = query(collection(db, 'queue_entries'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(d => {
        data.push({ id: d.id, ...d.data() });
      });
      setQueues(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAssignSlot = async (queueId) => {
    try {
      const dummyTime = "11:45 AM";

      await updateDoc(doc(db, 'queue_entries', queueId), {
        status: 'scheduled',
        appointmentTime: dummyTime
      });
    } catch (err) {
      console.error(err);
      alert("Failed to assign slot");
    }
  };

  const waitingQueues = queues.filter(q => q.status === 'waiting');
  const scheduledQueues = queues.filter(q => q.status === 'scheduled');

  // Compute doctor loads
  const doctorLoad = {};
  queues.filter(q => q.status === 'waiting').forEach(q => {
    doctorLoad[q.doctorId] = (doctorLoad[q.doctorId] || 0) + 1;
  });

  // Map to full doctor list logic
  const allDoctors = DOCTORS_DB.map(d => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty || d.specialization,
    waitCount: doctorLoad[d.id] || 0
  })).sort((a, b) => b.waitCount - a.waitCount).slice(0, 8); // Top 8 doctors for brevity

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>
      {/* Admin Navbar */}
      <nav style={{ background: '#8b5cf6', color: 'white', padding: '16px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-2 font-bold text-xl">
            <Activity color="rgba(255,255,255,0.9)" /> MedAI Admin Console
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span>Welcome, {user?.name || 'Administrator'}</span>
            <button className="btn" onClick={onLogout} style={{ background: 'rgba(0,0,0,0.2)', color: 'white', padding: '8px 16px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 340px' }}>
          
          {/* Main Panel: Queue List */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock size={20} color="#8b5cf6" /> Pending Patient Queues
            </h2>

            {loading ? (
              <div className="text-center p-8 text-[var(--text-muted)]">Loading queues...</div>
            ) : waitingQueues.length === 0 ? (
              <div className="med-card text-center p-12 text-[var(--text-muted)] font-medium">
                No patients waiting in queue.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {waitingQueues.map(q => (
                  <div key={q.id} className="med-card fade-in p-5 flex items-center justify-between" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div>
                      <div className="font-bold text-lg">{q.patientName}</div>
                      <div className="text-sm text-[var(--text-muted)] mt-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2"><UserSearch size={14} /> Requested Doctor: <span className="font-semibold text-black">{q.doctorName}</span></div>
                        <div className="flex items-center gap-2 text-[11px] font-mono"><span className="text-[var(--text-muted)]">📧 Linking Email:</span> <span className="text-[var(--primary)]">{q.patientEmail || q.patientName || 'Email not provided'}</span></div>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-2">
                        Joined: {new Date(q.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <button className="btn" 
                        onClick={() => handleAssignSlot(q.id)}
                        style={{ background: '#8b5cf6', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>
                        Assign Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="text-xl font-bold mt-10 mb-4 flex items-center gap-2">
              <CheckCircle size={20} color="var(--success)" /> Recently Scheduled
            </h2>
            <div className="flex flex-col gap-3">
              {scheduledQueues.slice(0, 5).map(q => (
                <div key={q.id} className="p-4 rounded-xl flex justify-between" style={{ background: 'var(--bg-section)', border: '1px solid var(--border)' }}>
                  <div>
                    <span className="font-semibold">{q.patientName}</span> with <span className="font-semibold">{q.doctorName}</span>
                  </div>
                  <div className="font-bold" style={{ color: 'var(--success)' }}>{q.appointmentTime}</div>
                </div>
              ))}
              {scheduledQueues.length === 0 && (
                <div className="text-sm text-[var(--text-muted)]">No appointments scheduled yet.</div>
              )}
            </div>
          </div>

          {/* Right Panel: Doctor Loads */}
          <div>
            <div className="med-card p-6" style={{ position: 'sticky', top: '24px' }}>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity size={18} color="#8b5cf6"/> Doctor Workloads
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Current count of waiting patients per doctor.
              </p>
              
              <div className="flex flex-col gap-3">
                {allDoctors.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: doc.waitCount > 0 ? 'rgba(139, 92, 246, 0.05)' : 'transparent', border: '1px solid var(--border)' }}>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{doc.name}</div>
                      <div className="text-xs text-[var(--text-muted)] truncate">{doc.specialty}</div>
                    </div>
                    {doc.waitCount > 0 ? (
                      <span className="badge" style={{ background: '#8b5cf6', color: 'white' }}>{doc.waitCount} waiting</span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">Idle</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
