import { useState } from 'react';
import { UtensilsCrossed, Dumbbell, PlayCircle, TrendingUp, X, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SOSButton from '../../components/SOSButton';
import SOSModal from '../../components/SOSModal';
import { DIET_PLANS } from '../../data/diets';
import { getVideosForSpecialty, getVideoCategories, RECOVERY_VIDEOS } from '../../data/videos';

export default function Recovery({ user, onLogout, selectedDoctor }) {
  const [showSOS, setShowSOS] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [videoFilter, setVideoFilter] = useState('All');
  const [exerciseDone, setExerciseDone] = useState([true, false, false]);

  const specialty = selectedDoctor?.specialty || 'General Medicine';
  const dietPlan = DIET_PLANS[specialty] || DIET_PLANS.default;
  
  // Get videos for this specialty, fall back to all if too few
  let videos = getVideosForSpecialty(specialty);
  if (videos.length < 4) {
    videos = RECOVERY_VIDEOS;
  }
  
  const categories = ['All', ...new Set(videos.map(v => v.category))];
  const filteredVideos = videoFilter === 'All' ? videos : videos.filter(v => v.category === videoFilter);

  const exercises = [
    { time: '7:00 AM', activity: 'Morning Walk', duration: '20 mins', intensity: 'Low' },
    { time: '11:00 AM', activity: 'Light Stretching', duration: '10 mins', intensity: 'Low' },
    { time: '5:00 PM', activity: 'Breathing Exercises', duration: '15 mins', intensity: 'Low' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} currentStep={3} onLogout={onLogout} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
        <div className="section-header fade-in">
          <h1>Recovery Plan</h1>
          <p>Your personalized health journey</p>
        </div>

        {/* Diet Plan */}
        <div className="med-card mb-6 fade-in" style={{ borderLeft: '4px solid var(--success)', padding: '28px' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--success-light)' }}>
              <UtensilsCrossed size={22} color="var(--success)" />
            </div>
            <h2 className="text-xl font-bold">Diet Plan</h2>
          </div>

          <div className="grid gap-8 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div className="text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--success)' }}>
                <span>✅</span> Recommended Foods
              </div>
              {dietPlan.foods.map((f, i) => (
                <div key={i} className="flex items-center gap-3 py-3 text-sm"
                  style={{ borderBottom: i < dietPlan.foods.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--success)' }}></span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--danger)' }}>
                <span>❌</span> Avoid These
              </div>
              {dietPlan.avoid.map((f, i) => (
                <div key={i} className="flex items-center gap-3 py-3 text-sm"
                  style={{ borderBottom: i < dietPlan.avoid.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--danger)' }}></span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl text-sm flex items-start gap-3"
            style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <span className="text-lg">💡</span>
            <span>{dietPlan.tip}</span>
          </div>
        </div>

        {/* Exercise Plan */}
        <div className="med-card mb-6 fade-in" style={{ borderLeft: '4px solid var(--primary)', padding: '28px' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
              <Dumbbell size={22} color="var(--primary)" />
            </div>
            <h2 className="text-xl font-bold">Exercise Plan</h2>
          </div>

          <div className="flex flex-col gap-3">
            {exercises.map((e, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                onClick={() => setExerciseDone(prev => prev.map((d, di) => di === i ? !d : d))}
                style={{
                  background: exerciseDone[i] ? 'var(--success-light)' : 'white',
                  border: `2px solid ${exerciseDone[i] ? 'var(--success)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                <div className="text-2xl">{exerciseDone[i] ? '✅' : '⏱️'}</div>
                <div className="flex-1">
                  <div className="font-bold mb-1">{e.activity}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{e.time} · {e.duration}</div>
                </div>
                <span className="badge badge-primary" style={{ padding: '6px 12px' }}>{e.intensity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Videos */}
        <div className="med-card mb-6 fade-in" style={{ borderLeft: '4px solid var(--warning)', padding: '28px' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,193,7,0.1)' }}>
                <PlayCircle size={22} color="var(--warning)" />
              </div>
              <h2 className="text-xl font-bold">Video Library</h2>
            </div>
            <span className="badge badge-neutral" style={{ padding: '6px 12px' }}>{filteredVideos.length} videos</span>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button key={cat} className="btn btn-sm"
                onClick={() => setVideoFilter(cat)}
                style={{
                  background: videoFilter === cat ? 'var(--warning)' : 'transparent',
                  color: videoFilter === cat ? 'white' : 'var(--text-secondary)',
                  border: `2px solid ${videoFilter === cat ? 'var(--warning)' : 'var(--border)'}`,
                  whiteSpace: 'nowrap',
                  padding: '8px 16px',
                  fontWeight: 500,
                }}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filteredVideos.map(v => (
              <div key={v.id} className="video-card">
                {activeVideoId === v.id ? (
                  <div style={{ position: 'relative' }}>
                    <iframe
                      width="100%"
                      style={{ aspectRatio: '16/9', border: 'none', borderRadius: '12px 12px 0 0' }}
                      src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <button className="btn btn-sm"
                      onClick={() => setActiveVideoId(null)}
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(0,0,0,0.8)', color: 'white',
                        borderRadius: '50%', padding: '6px',
                      }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="video-thumb" onClick={() => setActiveVideoId(v.id)}>
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                      alt={v.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button className="video-play-btn">
                      <PlayCircle size={32} />
                    </button>
                    <span className="badge" style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(0,0,0,0.8)', color: 'white',
                      padding: '4px 10px',
                    }}>{v.duration}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="font-bold text-sm mb-2">{v.title}</div>
                  <div className="text-xs mb-3" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {v.description}
                  </div>
                  <div className="flex gap-2">
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{v.category}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{v.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Score */}
        <div className="med-card fade-in text-center mb-6"
          style={{ background: 'linear-gradient(135deg, var(--success-light) 0%, rgba(40,167,69,0.05) 100%)', border: '2px solid rgba(40,167,69,0.2)', padding: '32px' }}>
          <TrendingUp size={32} color="var(--success)" className="mx-auto mb-3" />
          <div className="text-6xl font-black mb-2" style={{ color: 'var(--success)' }}>78%</div>
          <div className="font-bold text-lg mb-1">Recovery Progress</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Day 5 of 14 · Keep going! 🎯</div>
        </div>
      </div>

      <SOSButton onPress={() => setShowSOS(true)} />
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} doctorName={selectedDoctor?.name} />}
    </div>
  );
}
