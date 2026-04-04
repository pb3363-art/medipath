import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Award, Plus, X, Loader2, Stethoscope, Activity } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';
import { SYMPTOM_DOCTOR_MAP, SYMPTOM_CATEGORIES } from '../../data/symptoms';
import { matchDoctors } from '../../utils/bayesian';

export default function DoctorMatch({ user, onLogout, onSelectDoctor }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [matchedDoctors, setMatchedDoctors] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [customSymptom, setCustomSymptom] = useState('');
  const [showSOS, setShowSOS] = useState(false);
  const [activeCategory, setActiveCategory] = useState('General');

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('medipath_current_queue')) {
      navigate('/patient/queue-status');
    }
  }, [navigate]);

  const toggleSymptom = (s) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms(prev => [...prev, trimmed]);
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
      console.error('Match error:', err);
    } finally {
      setSearching(false);
    }
  };

  const selectDoctor = (doc) => {
    setLoadingDoctor(true);
    onSelectDoctor(doc);
    navigate('/patient/select-slot', { state: { doctor: doc, symptoms: selectedSymptoms } });
  };

  const categories = Object.keys(SYMPTOM_CATEGORIES);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} currentStep={1} onLogout={onLogout} />

      <div className="page-container">

        {/* Hero Header */}
        <div className="section-header fade-in" style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(79,70,229,0.3)', flexShrink: 0,
            }}>
              <Stethoscope size={26} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', marginBottom: 6 }}>
                Find Your Specialist
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                Describe your symptoms — our AI matches you with the best available doctor.
              </p>
            </div>
          </div>
        </div>

        {/* Symptom Selector Card */}
        <div className="med-card card-pad-md fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Select Symptoms</h2>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 40,
                  border: activeCategory === cat ? '2px solid var(--primary)' : '2px solid var(--border)',
                  background: activeCategory === cat ? 'var(--primary)' : 'var(--bg-section)',
                  color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Symptom Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
            {(SYMPTOM_CATEGORIES[activeCategory] || []).map(s => {
              const active = selectedSymptoms.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 40,
                    border: active ? '2px solid var(--primary)' : '2px solid var(--border)',
                    background: active ? 'var(--primary)' : 'white',
                    color: active ? 'white' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: active ? '0 4px 12px rgba(79,70,229,0.25)' : 'var(--shadow-sm)',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {active && '✓ '}{s}
                </button>
              );
            })}
          </div>

          {/* Custom Symptom Input */}
          <div style={{ display: 'flex', gap: 12, marginBottom: selectedSymptoms.length ? 24 : 0 }}>
            <input
              value={customSymptom}
              onChange={e => setCustomSymptom(e.target.value)}
              placeholder="Add a custom symptom..."
              onKeyDown={e => e.key === 'Enter' && addCustomSymptom()}
              style={{ flex: 1, borderRadius: 40 }}
            />
            <button className="btn btn-outline" onClick={addCustomSymptom} style={{ borderRadius: 40, whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Selected Summary */}
          {selectedSymptoms.length > 0 && (
            <div style={{
              padding: '20px 24px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(237,233,254,0.5) 100%)',
              border: '2px solid rgba(79,70,229,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Activity size={16} color="var(--primary)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-strong)' }}>
                  {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {selectedSymptoms.map(s => (
                  <span key={s} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '7px 16px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: 40,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}>
                    {s}
                    <X size={14} style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => toggleSymptom(s)} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search CTA */}
        <button
          className="btn btn-primary btn-lg btn-full fade-in"
          onClick={searchDoctors}
          disabled={!selectedSymptoms.length || searching}
          style={{ fontSize: '1.05rem' }}
        >
          {searching ? (
            <><Loader2 size={20} className="animate-spin" /> Running AI Analysis...</>
          ) : (
            <><Search size={20} /> Find Best Matched Doctors</>
          )}
        </button>

        {/* Results */}
        {matchedDoctors.length > 0 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, marginTop: 8 }}>
              <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Matched Doctors</h2>
              <span className="badge badge-neutral">{matchedDoctors.length} results</span>
            </div>

            <div>
              {matchedDoctors.map((doc, i) => (
                <div
                  key={doc.id}
                  className={`doctor-card card-pad-md fade-in ${i === 0 ? 'best-match' : ''}`}
                  style={{ animationDelay: `${i * 0.06}s`, position: 'relative' }}
                >
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', top: -14, left: 24,
                      background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
                      color: 'white',
                      padding: '5px 16px',
                      borderRadius: 40,
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      letterSpacing: '0.02em',
                      boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
                    }}>
                      ⭐ Best Match
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 72, height: 72, borderRadius: 20, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.3rem',
                      background: i === 0
                        ? 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)'
                        : 'var(--bg-section)',
                      color: i === 0 ? 'white' : 'var(--text-secondary)',
                      boxShadow: i === 0 ? '0 8px 20px rgba(79,70,229,0.25)' : 'none',
                    }}>
                      {doc.avatar}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', marginBottom: 4 }}>
                        {doc.name}
                      </div>
                      <div style={{ color: 'var(--primary-strong)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>
                        {doc.specialty}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={14} /> {doc.city}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Star size={14} color="#F59E0B" fill="#F59E0B" /> {doc.rating}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Award size={14} /> {doc.yearsExperience} yrs exp
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span className={`badge ${doc.available ? 'badge-success' : 'badge-danger'}`}>
                          {doc.available ? '● Available Now' : '● Unavailable'}
                        </span>
                        <span className="badge badge-neutral">₹{doc.consultationFee}</span>
                        {doc.qualifications && (
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            {doc.qualifications.split(',')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score + CTA */}
                    <div style={{ textAlign: 'center', minWidth: 130, flexShrink: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
                        color: doc.score > 80 ? 'var(--success)' : 'var(--primary)',
                        marginBottom: 4,
                      }}>
                        {doc.score}%
                      </div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                        match score
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => selectDoctor(doc)}
                        disabled={loadingDoctor || !doc.available}
                        style={{ width: '100%' }}
                      >
                        {loadingDoctor ? 'Loading...' : 'Select Doctor'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {matchedDoctors.length === 0 && !searching && selectedSymptoms.length > 0 && (
          <div className="med-card fade-in" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <Stethoscope size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: 10 }}>No Results Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try selecting different symptoms or adding a custom one.</p>
          </div>
        )}
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} />}
    </div>
  );
}
