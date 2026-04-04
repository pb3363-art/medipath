import { useState, useEffect } from 'react';
import { LogOut, Clock, CheckCircle, Activity, UserSearch } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { DOCTORS_DB } from '../../data/doctors';

export default function AdminDashboard({ user, onLogout }) {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'queue_entries'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((d) => {
        data.push({ id: d.id, ...d.data() });
      });
      setQueues(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getLiveFallbackSlot = () => {
    const dt = new Date(Date.now() + 30 * 60 * 1000);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAssignSlot = async (queueId) => {
    try {
      const queueRecord = queues.find((q) => q.id === queueId);
      const preferred = queueRecord?.preferredSlots || [];
      const chosenTime = selectedSlots[queueId] || preferred[0] || getLiveFallbackSlot();

      await updateDoc(doc(db, 'queue_entries', queueId), {
        status: 'scheduled',
        appointmentTime: chosenTime,
        approvedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      alert('Failed to assign slot');
    }
  };

  const waitingQueues = queues.filter((q) => q.status === 'waiting');
  const scheduledQueues = queues
    .filter((q) => q.status === 'scheduled')
    .sort((a, b) => {
      const aTime = new Date(a.approvedAt || a.timestamp || 0).getTime();
      const bTime = new Date(b.approvedAt || b.timestamp || 0).getTime();
      return bTime - aTime;
    });

  const doctorLoad = {};
  queues.filter((q) => q.status === 'waiting').forEach((q) => {
    doctorLoad[q.doctorId] = (doctorLoad[q.doctorId] || 0) + 1;
  });

  const allDoctors = DOCTORS_DB.map((d) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty || d.specialization,
    waitCount: doctorLoad[d.id] || 0
  })).sort((a, b) => b.waitCount - a.waitCount).slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>
      <nav style={{ background: '#8b5cf6', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div className="admin-nav-inner">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Activity color="rgba(255,255,255,0.9)" /> MediPath Admin Console
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span>Welcome, {user?.name || 'Administrator'}</span>
            <button className="btn" onClick={onLogout} style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="page-container-wide">
        <div className="admin-layout">
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
                {waitingQueues.map((q) => (
                  <div key={q.id} className="med-card card-pad-md fade-in queue-card-row" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div>
                      <div className="font-bold text-lg">{q.patientName}</div>
                      <div className="text-sm text-[var(--text-muted)] mt-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2"><UserSearch size={14} /> Requested Doctor: <span className="font-semibold text-black">{q.doctorName}</span></div>
                        <div className="flex items-center gap-2 text-[11px] font-mono"><span className="text-[var(--text-muted)]">Linking Email:</span> <span className="text-[var(--primary)]">{q.patientEmail || q.patientName || 'Email not provided'}</span></div>
                      </div>

                      <div className="mt-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                          Preferred Slots
                        </div>
                        {q.preferredSlots?.length ? (
                          <div className="meta-wrap">
                            {q.preferredSlots.map((slot) => (
                              <span key={slot} className="badge badge-primary">{slot}</span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            No preferred slots submitted.
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-[var(--text-muted)] mt-2">
                        Joined: {new Date(q.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="actions-row" style={{ minWidth: 220 }}>
                      <select
                        value={selectedSlots[q.id] || ''}
                        onChange={(e) => setSelectedSlots((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        style={{ minWidth: 150 }}
                      >
                        <option value="">Auto-pick best slot</option>
                        {(q.preferredSlots || []).map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <button className="btn" onClick={() => handleAssignSlot(q.id)} style={{ background: '#8b5cf6', color: 'white', borderRadius: '8px', fontWeight: 600 }}>
                        Approve Slot
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
              {scheduledQueues.slice(0, 5).map((q) => (
                <div key={q.id} className="p-4 rounded-xl scheduled-row" style={{ background: 'var(--bg-section)', border: '1px solid var(--border)' }}>
                  <div>
                    <span className="font-semibold">{q.patientName}</span> with <span className="font-semibold">{q.doctorName}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Scheduled: {new Date(q.approvedAt || q.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
              {scheduledQueues.length === 0 && (
                <div className="text-sm text-[var(--text-muted)]">No appointments scheduled yet.</div>
              )}
            </div>
          </div>

          <div>
            <div className="med-card card-pad-md" style={{ position: 'sticky', top: '24px' }}>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity size={18} color="#8b5cf6" /> Doctor Workloads
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Current count of waiting patients per doctor.
              </p>

              <div className="flex flex-col gap-3">
                {allDoctors.map((docItem) => (
                  <div key={docItem.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: docItem.waitCount > 0 ? 'rgba(139, 92, 246, 0.05)' : 'transparent', border: '1px solid var(--border)' }}>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{docItem.name}</div>
                      <div className="text-xs text-[var(--text-muted)] truncate">{docItem.specialty}</div>
                    </div>
                    {docItem.waitCount > 0 ? (
                      <span className="badge" style={{ background: '#8b5cf6', color: 'white' }}>{docItem.waitCount} waiting</span>
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
