import { useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, User } from 'lucide-react';
import StepProgress from './StepProgress';

export default function Navbar({ user, currentStep, onLogout }) {
  const navigate = useNavigate();
  const isDoctor = user.role === 'doctor';

  return (
    <nav className="top-nav">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: isDoctor ? 'var(--primary)' : 'var(--success)' }}>
          <Stethoscope size={18} color="white" />
        </div>
        <span className="font-extrabold text-lg tracking-tight">MedAI</span>
        <span className={`badge ${isDoctor ? 'badge-primary' : 'badge-success'}`}>
          {isDoctor ? 'Doctor Portal' : 'Patient Portal'}
        </span>
      </div>

      <StepProgress current={currentStep} role={user.role} />

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold">{isDoctor ? 'Dr. ' : ''}{user.name}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {user.id}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { onLogout(); navigate('/'); }}>
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  );
}
