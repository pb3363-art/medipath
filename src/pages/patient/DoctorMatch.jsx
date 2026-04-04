import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Award, Plus, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';
import { SYMPTOM_DOCTOR_MAP, SYMPTOM_CATEGORIES } from '../../data/symptoms';
import { matchDoctors } from '../../utils/bayesian';

export default function DoctorMatch({ user, onLogout, onSelectDoctor }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [matchedDoctors, setMatchedDoctors] = useState([]);
  const [searching, setSearching] = useState(false);
  const [customSymptom, setCustomSymptom] = useState('');
  const [showSOS, setShowSOS] = useState(false);
  const [activeCategory, setActiveCategory] = useState('General');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('medipath_current_queue')) {
      navigate('/patient/queue-status');
      return;
    }

    // Check if user already got past Phase 1 and has medications
    // const checkUserPrescriptions = async () => {
    //   if (user?.email) {
    //     try {
    //       const q = query(
    //         collection(db, 'prescriptions'),
    //         where('patientEmail', '==', user.email.toLowerCase()),
    //         where('status', '==', 'active')
    //       );
    //       const snap = await getDocs(q);
    //       if (!snap.empty) {
    //         navigate('/patient/medications');
    //       }
    //     } catch (e) {
    //       console.error('Error checking active prescriptions:', e);
    //     }
    //   }
    // };
    // checkUserPrescriptions();
  }, [navigate, user?.email]);

  const toggleSymptom = (s) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const searchDoctors = async () => {
    if (!selectedSymptoms.length) return;
    setSearching(true);
    try {
      const matched = await matchDoctors(selectedSymptoms, SYMPTOM_DOCTOR_MAP);
      setMatchedDoctors(matched);
    } catch (err) {
      console.error("Match error:", err);
    } finally {
      setSearching(false);
    }
  };

  const [loadingDoctor, setLoadingDoctor] = useState(false);

  const selectDoctor = async (doc) => {
    setLoadingDoctor(true);
    onSelectDoctor(doc);
    navigate('/patient/select-slot', { state: { doctor: doc, symptoms: selectedSymptoms } });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} currentStep={1} onLogout={onLogout} />

      <div className="page-container">
        <div className="section-header fade-in">
          <h1>Find Your Specialist</h1>
          <p>Select your symptoms — our AI matches you with the best available doctor.</p>
        </div>

        {/* Symptom Selector */}
        <div className="med-card card-pad-lg mb-6 fade-in">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-5" style={{ color: 'var(--text-muted)', letterSpacing: '2px' }}>
            Select Symptoms
          </h3>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
            {Object.keys(SYMPTOM_CATEGORIES).map(cat => (
              <button key={cat} className="btn btn-sm"
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? 'var(--primary)' : 'transparent',
                  color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  borderRadius: '8px',
                }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Symptom Pills */}
          <div className="flex flex-wrap gap-3 mb-5">
            {(SYMPTOM_CATEGORIES[activeCategory] || []).map(s => {
              const active = selectedSymptoms.includes(s);
              return (
                <button key={s} className="btn btn-pill"
                  onClick={() => toggleSymptom(s)}
                  style={{
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? 'white' : 'var(--text-secondary)',
                    border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                  }}>
                  {active && '✓ '}{s}
                </button>
              );
            })}
          </div>

          {/* Custom Symptom Input */}
          <div className="input-action-row mb-5">
            <input
              value={customSymptom}
              onChange={e => setCustomSymptom(e.target.value)}
              placeholder="Add custom symptom..."
              onKeyDown={e => e.key === 'Enter' && addCustomSymptom()}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '25px',
                border: '2px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            />
            <button
              className="btn btn-primary btn-pill"
              onClick={addCustomSymptom}
              style={{
                fontWeight: 600,
              }}>
              Add
            </button>
          </div>

          {/* Selected Summary */}
          {selectedSymptoms.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(0,102,204,0.08)', border: '2px solid rgba(0,102,204,0.15)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Selected:</span>
                <span className="badge badge-primary">{selectedSymptoms.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map(s => (
                  <span key={s} className="badge badge-primary flex items-center gap-2"
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      borderRadius: '20px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                    {s}
                    <X size={14} className="cursor-pointer" onClick={() => toggleSymptom(s)} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button className="btn btn-primary btn-lg btn-full mb-8 fade-in"
          onClick={searchDoctors}
          disabled={!selectedSymptoms.length || searching}
          style={{
            opacity: selectedSymptoms.length ? 1 : 0.5,
            fontSize: '1rem',
          }}>
          {searching ? (
            <><span className="spinner"></span> Running AI Analysis...</>
          ) : (
            <><Search size={20} /> Find Best Matched Doctors</>
          )}
        </button>

        {/* Results */}
        {matchedDoctors.length > 0 && (
          <div className="fade-in">
            <h3 className="font-bold text-lg mb-5">Recommended Doctors</h3>

            <div className="flex flex-col gap-4">
              {matchedDoctors.map((doc, i) => (
                <div key={doc.id} className={`doctor-card card-pad-md ${i === 0 ? 'best-match' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s`, position: 'relative' }}>
                  {i === 0 && (
                    <span className="badge badge-primary" style={{
                      position: 'absolute', top: -10, left: 20,
                      background: 'var(--primary)', color: 'white',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}>⭐ Best Match</span>
                  )}

                  <div className="doctor-result-row">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                      style={{
                        background: i === 0 ? 'var(--primary)' : 'var(--bg-section)',
                        color: i === 0 ? 'white' : 'var(--text-secondary)',
                      }}>
                      {doc.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg mb-1">{doc.name}</div>
                      <div className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                        {doc.specialty}
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {doc.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={14} color="var(--warning)" fill="var(--warning)" /> {doc.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award size={14} /> {doc.yearsExperience} years
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <span className={`badge ${doc.available ? 'badge-success' : 'badge-danger'}`}>
                          {doc.available ? '● Available Now' : '● Busy'}
                        </span>
                        <span className="badge badge-neutral">₹{doc.consultationFee}</span>
                      </div>
                    </div>

                    {/* Score + Select */}
                    <div className="doctor-score-col flex-shrink-0">
                      <div className="text-3xl font-black mb-1" style={{ color: doc.score > 80 ? 'var(--success)' : 'var(--primary)' }}>
                        {doc.score}%
                      </div>
                      <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>match</div>
                      <button className="btn btn-primary" onClick={() => selectDoctor(doc)} disabled={loadingDoctor}>
                        {loadingDoctor ? 'Wait...' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} />}
    </div>
  );
}

