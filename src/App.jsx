import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DoctorMatch from './pages/patient/DoctorMatch';
import Medications from './pages/patient/Medications';
import Recovery from './pages/patient/Recovery';
import Prescriptions from './pages/doctor/Prescriptions';
import Timings from './pages/doctor/Timings';
import DietPlan from './pages/doctor/DietPlan';

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: 'Paracetamol 500mg', times: ['08:00 AM', '02:00 PM', '09:00 PM'], instruction: 'After meals', days: 5, taken: [false, false, false] },
    { id: 2, name: 'Amoxicillin 250mg', times: ['07:00 AM', '07:00 PM'], instruction: 'Before meals', days: 7, taken: [false, false] },
    { id: 3, name: 'Vitamin C 1000mg', times: ['09:00 AM'], instruction: 'After breakfast', days: 14, taken: [false] },
  ]);

  // Doctor state
  const [meds, setMeds] = useState([{ name: '', dosage: '', days: '', instruction: 'After meals' }]);
  const [timings, setTimings] = useState({});
  const [patientInfo, setPatientInfo] = useState({ id: '', name: '', diagnosis: '' });

  const handleLogout = () => {
    setUser(null);
    setSelectedDoctor(null);
  };

  // Route guard
  const RequireAuth = ({ children, requiredRole }) => {
    if (!user) return <Navigate to="/" replace />;
    if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          user ? <Navigate to={user.role === 'patient' ? '/patient/match' : '/doctor/prescribe'} replace /> :
          <LoginPage onLogin={setUser} />
        } />

        {/* Patient Routes */}
        <Route path="/patient/match" element={
          <RequireAuth requiredRole="patient">
            <DoctorMatch user={user} onLogout={handleLogout} onSelectDoctor={setSelectedDoctor} />
          </RequireAuth>
        } />
        <Route path="/patient/medications" element={
          <RequireAuth requiredRole="patient">
            <Medications user={user} onLogout={handleLogout} selectedDoctor={selectedDoctor}
              prescriptions={prescriptions} setPrescriptions={setPrescriptions} />
          </RequireAuth>
        } />
        <Route path="/patient/recovery" element={
          <RequireAuth requiredRole="patient">
            <Recovery user={user} onLogout={handleLogout} selectedDoctor={selectedDoctor} />
          </RequireAuth>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor/prescribe" element={
          <RequireAuth requiredRole="doctor">
            <Prescriptions user={user} onLogout={handleLogout}
              meds={meds} setMeds={setMeds} patientInfo={patientInfo} setPatientInfo={setPatientInfo} />
          </RequireAuth>
        } />
        <Route path="/doctor/timings" element={
          <RequireAuth requiredRole="doctor">
            <Timings user={user} onLogout={handleLogout}
              meds={meds} timings={timings} setTimings={setTimings} />
          </RequireAuth>
        } />
        <Route path="/doctor/diet" element={
          <RequireAuth requiredRole="doctor">
            <DietPlan user={user} onLogout={handleLogout} />
          </RequireAuth>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
