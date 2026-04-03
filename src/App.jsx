import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DoctorMatch from './pages/patient/DoctorMatch';
import Medications from './pages/patient/Medications';
import Recovery from './pages/patient/Recovery';
import Prescriptions from './pages/doctor/Prescriptions';
import Timings from './pages/doctor/Timings';
import DietPlan from './pages/doctor/DietPlan';
import QueueStatus from './pages/patient/QueueStatus';
import AdminDashboard from './pages/admin/AdminDashboard';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Route guard — must be declared outside App to avoid re-creation on each render
function RequireAuth({ children, requiredRole, user, loadingAuth }) {
  if (loadingAuth) return null;
  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

// Special guard to auto-redirect patients if they already have an active prescription
function PatientFlowGuard({ children, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || user.role !== 'patient') return;

    const email = (user.email || '').toLowerCase().trim();
    const uid = user.uid;
    const qEmail = query(collection(db, 'prescriptions'), where('patientEmail', '==', email), where('status', '==', 'active'));
    const qUid = query(collection(db, 'prescriptions'), where('patientId', '==', uid), where('status', '==', 'active'));

    const checkAndRedirect = (snapshot) => {
      if (!snapshot.empty) {
        // If they have an active prescription but are NOT on medications or recovery page
        const isOnTreatment = location.pathname.includes('/patient/medications') || location.pathname.includes('/patient/recovery');
        if (!isOnTreatment) {
          console.log('PatientFlowGuard: Active treatment found. Redirecting to Medications...');
          localStorage.removeItem('medai_current_queue');
          navigate('/patient/medications', { replace: true });
        }
      }
    };

    const unsubEmail = onSnapshot(qEmail, checkAndRedirect);
    const unsubUid = onSnapshot(qUid, checkAndRedirect);

    return () => {
      unsubEmail();
      unsubUid();
    };
  }, [user, location.pathname, navigate]);

  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          const localRole = localStorage.getItem('medai_role');
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({ 
              id: firebaseUser.uid, 
              uid: firebaseUser.uid, 
              email: firebaseUser.email, 
              name: userData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0], 
              role: localRole || userData.role || 'patient' 
            });
          } else {
            console.warn('No user document found in Firestore. Defaulting to local role.');
            setUser({ 
              id: firebaseUser.uid, 
              uid: firebaseUser.uid, 
              email: firebaseUser.email, 
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0], 
              role: localRole || 'patient' 
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({ 
            id: firebaseUser.uid, 
            uid: firebaseUser.uid, 
            email: firebaseUser.email, 
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0], 
            role: 'patient' 
          });
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setSelectedDoctor(null);
    localStorage.removeItem('medai_current_queue');
    localStorage.removeItem('medai_role');
  };


  if (loadingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin"></div>
          <div className="text-[var(--text-muted)] font-semibold text-sm">Initializing MedAI...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          user ? <Navigate to={user.role === 'admin' ? '/admin/queue' : user.role === 'patient' ? '/patient/match' : '/doctor/prescribe'} replace /> :
            <LoginPage />
        } />

        {/* Admin Routes */}
        <Route path="/admin/queue" element={
          <RequireAuth requiredRole="admin" user={user} loadingAuth={loadingAuth}>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </RequireAuth>
        } />

        {/* Patient Routes */}
        <Route path="/patient/match" element={
          <RequireAuth requiredRole="patient" user={user} loadingAuth={loadingAuth}>
            <PatientFlowGuard user={user}>
              <DoctorMatch user={user} onLogout={handleLogout} onSelectDoctor={setSelectedDoctor} />
            </PatientFlowGuard>
          </RequireAuth>
        } />
        <Route path="/patient/queue-status" element={
          <RequireAuth requiredRole="patient" user={user} loadingAuth={loadingAuth}>
            <PatientFlowGuard user={user}>
              <QueueStatus user={user} onLogout={handleLogout} />
            </PatientFlowGuard>
          </RequireAuth>
        } />
        <Route path="/patient/medications" element={
          <RequireAuth requiredRole="patient" user={user} loadingAuth={loadingAuth}>
            <Medications user={user} onLogout={handleLogout} selectedDoctor={selectedDoctor} />
          </RequireAuth>
        } />
        <Route path="/patient/recovery" element={
          <RequireAuth requiredRole="patient" user={user} loadingAuth={loadingAuth}>
            <Recovery user={user} onLogout={handleLogout} />
          </RequireAuth>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor/prescribe" element={
          <RequireAuth requiredRole="doctor" user={user} loadingAuth={loadingAuth}>
            <Prescriptions user={user} onLogout={handleLogout} />
          </RequireAuth>
        } />
        <Route path="/doctor/timings" element={
          <RequireAuth requiredRole="doctor" user={user} loadingAuth={loadingAuth}>
            <Timings user={user} onLogout={handleLogout} />
          </RequireAuth>
        } />
        <Route path="/doctor/diet" element={
          <RequireAuth requiredRole="doctor" user={user} loadingAuth={loadingAuth}>
            <DietPlan user={user} onLogout={handleLogout} />
          </RequireAuth>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
