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
        <span className="font-extrabold text-lg tracking-tight">MediPath</span>
        <span className={`badge ${isDoctor ? 'badge-primary' : 'badge-success'}`}>
          {isDoctor ? 'Doctor Portal' : 'Patient Portal'}
        </span>
      </div>

      <StepProgress current={currentStep} role={user.role} />

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <div className="text-sm font-bold leading-tight">{isDoctor ? 'Dr. ' : ''}{user.name}</div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono nav-user-email">{user.email}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { onLogout(); navigate('/'); }}>
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  );
}
