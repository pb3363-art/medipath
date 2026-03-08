import { useState } from 'react';
import { UtensilsCrossed, Dumbbell, Send, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';

export default function DietPlan({ user, onLogout }) {
  const [diet, setDiet] = useState({ foods: '', avoid: '', notes: '' });
  const [exercise, setExercise] = useState('');
  const [saved, setSaved] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const handleSubmit = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

        {/* Exercise */}
        <div className="med-card mb-6 fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={18} color="var(--primary)" />
            <h3 className="font-bold">Exercise & Activity Plan</h3>
          </div>
          <textarea value={exercise} onChange={e => setExercise(e.target.value)}
            placeholder="e.g. 20-min light walk morning, avoid strenuous exercise for 7 days, breathing exercises 2x daily..."
            rows={4} />
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
