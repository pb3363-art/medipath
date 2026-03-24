import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('patient');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Save role to localStorage so App.jsx doesn't suffer a db race condition on route change
      localStorage.setItem('medai_role', role);
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        // Ensure role in DB matches selected prototype role
        await setDoc(doc(db, 'users', userCred.user.uid), { role: role }, { merge: true });
        // Routing handled by App.jsx onAuthStateChanged listener
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // Update display name
        await updateProfile(user, { displayName: name });

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
          role: role,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      localStorage.setItem('medai_role', role);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document already exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      // If doc doesn't exist, this is a first-time Google sign up.
      // We will assign them the currently selected role.
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          name: user.displayName,
          role: role,
          createdAt: new Date().toISOString(),
          authProvider: 'google'
        });
      } else {
        // Update existing user with selected role
        await setDoc(docRef, { role: role }, { merge: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Left: Branding sidebar */}
      <div className="login-sidebar">
        <div className="pattern-overlay"></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              <Stethoscope size={24} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>MedAI</h1>
              <div className="text-xs text-white/60 font-semibold tracking-widest uppercase">Clinical Decision Support</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4" style={{ lineHeight: 1.3 }}>
            Intelligent healthcare<br />for South Asian hospitals
          </h2>
          <p className="text-white/70 text-sm mb-8" style={{ lineHeight: 1.7, maxWidth: 380 }}>
            AI-powered symptom analysis, real-time doctor matching, medication management,
            and recovery tracking — all in one secure platform.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { icon: '🔬', label: 'Bayesian doctor matching based on symptoms' },
              { icon: '💊', label: 'Medication schedule with reminders' },
              { icon: '📊', label: 'Recovery tracking & rehab videos' },
              { icon: '🛡️', label: 'Emergency SOS with instant alerts' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80 text-sm">
                <span className="text-lg">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '32px',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '0.05em',
          fontWeight: 500,
          zIndex: 1
        }}>
          developed by pranay
        </div>
      </div>

      {/* Right: Login form */}
      <div className="login-form-section">
        <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">{isLogin ? 'Sign in to MedAI' : 'Create an Account'}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isLogin ? 'Access your healthcare portal' : 'Join the MedAI healthcare network'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl"
            style={{ background: 'var(--bg-section)', border: '1px solid var(--border)' }}>
            {[
              { val: 'patient', icon: <User size={16} />, label: 'Patient' },
              { val: 'doctor', icon: <Stethoscope size={16} />, label: 'Doctor' },
            ].map(r => (
              <button key={r.val} className="btn flex-1"
                onClick={() => setRole(r.val)}
                style={{
                  padding: '12px',
                  background: role === r.val ? (r.val === 'doctor' ? 'var(--primary)' : 'var(--success)') : 'transparent',
                  color: role === r.val ? 'white' : 'var(--text-muted)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  transition: 'all 0.25s',
                  boxShadow: role === r.val ? 'var(--shadow-sm)' : 'none',
                }}>
                {r.icon}
                {r.label} {isLogin ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4 mb-6">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm mb-4 p-3 rounded-lg"
              style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn btn-lg btn-full"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? 'var(--border)' : role === 'doctor' ? 'var(--primary)' : 'var(--success)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9375rem',
              marginBottom: '1rem'
            }}>
            {loading ? (
              <><span className="spinner"></span> {isLogin ? 'Authenticating...' : 'Creating account...'}</>
            ) : (
              <>{isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} /></>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--bg-main)] px-2 text-[var(--text-muted)]">Or continue with</span>
            </div>
          </div>

          <button
            className="btn btn-lg btn-full flex items-center justify-center gap-2 mb-4"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              background: 'white',
              color: '#333',
              border: '1px solid #ddd',
              fontWeight: 600,
              fontSize: '0.9375rem',
            }}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Continue with Google
          </button>

          <div className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ color: role === 'doctor' ? 'var(--primary)' : 'var(--success)', fontWeight: 600 }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <div className="text-center mt-6 flex items-center justify-center gap-2 text-xs"
            style={{ color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} />
            Secure Authentication powered by Firebase
          </div>
        </div>
      </div>
    </div >
  );
}
