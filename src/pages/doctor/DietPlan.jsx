import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Dumbbell, Send, CheckCircle2, PlayCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { RECOVERY_VIDEOS, getVideosForSpecialty } from '../../data/videos';

export default function DietPlan({ user, onLogout }) {
  const [diet, setDiet] = useState({ foods: '', avoid: '', notes: '' });
  const [exercise, setExercise] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [saved, setSaved] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const prescriptionId = location.state?.prescriptionId;
  
  const recommendedVideos = getVideosForSpecialty(user?.specialty || 'General Medicine');
  const availableVideos = recommendedVideos.length > 0 ? recommendedVideos : RECOVERY_VIDEOS.slice(0, 5);

  const handleToggleVideo = (vidId) => {
    setSelectedVideos(prev => 
      prev.includes(vidId) ? prev.filter(id => id !== vidId) : [...prev, vidId]
    );
  };

  const handleSubmit = async () => {
    if (!prescriptionId) {
      alert("No prescription found. Cannot save plan. Please go back.");
      return;
    }
    setSaved(true);
    try {
      const prescRef = doc(db, 'prescriptions', prescriptionId);
      await updateDoc(prescRef, { 
        diet: diet, 
        exercise: exercise,
        recoveryVideos: selectedVideos
      });
      setTimeout(() => navigate('/doctor/prescribe'), 3000);
    } catch (err) {
      console.error(err);
      alert("Error saving diet and recovery plan.");
      setSaved(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} currentStep={3} onLogout={onLogout} />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>
        <div className="section-header fade-in">
          <h1>Recovery & Diet Plan</h1>
          <p>Provide dietary guidelines and recovery instructions for the patient</p>
        </div>

        {/* Diet */}
        <div className="med-card mb-5 fade-in" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed size={18} color="var(--success)" />
            <h3 className="font-bold">Dietary Recommendations</h3>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--success)' }}>
                ✅ Recommended Foods (comma separated)
              </label>
              <textarea value={diet.foods} onChange={e => setDiet(d => ({ ...d, foods: e.target.value }))}
                placeholder="e.g. Fruits, vegetables, lean protein, whole grains, plenty of water..."
                rows={3} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--danger)' }}>
                ❌ Foods to Avoid
              </label>
              <textarea value={diet.avoid} onChange={e => setDiet(d => ({ ...d, avoid: e.target.value }))}
                placeholder="e.g. Spicy foods, fried items, excess salt, alcohol..."
                rows={3} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                💡 Special Notes / Instructions
              </label>
              <textarea value={diet.notes} onChange={e => setDiet(d => ({ ...d, notes: e.target.value }))}
                placeholder="Any specific dietary notes, hydration requirements, meal timing..."
                rows={3} />
            </div>
          </div>
        </div>

        <div className="med-card mb-6 fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={18} color="var(--primary)" />
            <h3 className="font-bold">Exercise & Activity Plan</h3>
          </div>
          <textarea value={exercise} onChange={e => setExercise(e.target.value)}
            placeholder="e.g. 20-min light walk morning, avoid strenuous exercise for 7 days, breathing exercises 2x daily..."
            rows={4} />
        </div>

        {/* Recovery Videos */}
        <div className="med-card mb-6 fade-in" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle size={18} color="var(--warning)" />
            <h3 className="font-bold">Recommended Recovery Videos</h3>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Select rehabilitation videos to include in the patient's recovery portal.</p>
          <div className="flex flex-col gap-3">
            {availableVideos.slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-section)', border: '1px solid var(--border)' }}>
                <div>
                  <div className="font-bold text-sm">{v.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.duration} · {v.category}</div>
                </div>
                <button className={`btn btn-sm ${selectedVideos.includes(v.id) ? 'btn-danger' : 'btn-outline'}`}
                  onClick={() => handleToggleVideo(v.id)}>
                  {selectedVideos.includes(v.id) ? 'Remove' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button className="btn btn-success btn-lg btn-full" onClick={handleSubmit}>
          {saved ? (<><CheckCircle2 size={18} /> Plan Submitted to Patient!</>) : (<><Send size={18} /> Submit Full Treatment Plan</>)}
        </button>

        {saved && (
          <div className="fade-in mt-4 p-4 rounded-xl text-center"
            style={{ background: 'var(--success-light)', border: '1px solid rgba(40,167,69,0.2)' }}>
            <div className="font-bold" style={{ color: 'var(--success)' }}>Treatment Plan Submitted ✓</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Patient will receive notifications, reminders & recovery guidance automatically.
            </div>
          </div>
        )}
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} doctorName="Emergency Services" />}
    </div>
  );
}
