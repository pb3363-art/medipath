import { useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut } from 'lucide-react';
import StepProgress from './StepProgress';

export default function Navbar({ user, currentStep, onLogout }) {
  const navigate = useNavigate();
  const isDoctor = user.role === 'doctor';

  return (
    <nav className="top-nav">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shadow-sm"
          style={{ background: isDoctor ? 'linear-gradient(135deg, var(--primary), var(--primary-strong))' : 'linear-gradient(135deg, var(--success), #059669)' }}>
          <Stethoscope size={20} color="white" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-[17px] tracking-tight text-gray-900 leading-tight">MediPath</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
            {isDoctor ? 'Clinical' : 'Patient'} Portal
          </span>
        </div>
      </div>

      <StepProgress current={currentStep} role={user.role} />

      <div className="flex items-center gap-5">
        <div className="flex flex-col items-end hidden sm:flex">
          <div className="text-[13px] font-bold leading-tight text-gray-800">
            {isDoctor ? 'Dr. ' : ''}{user.name}
          </div>
          <div className="text-[11px] font-mono font-medium text-gray-400 tracking-tight">
            {user.email}
          </div>
        </div>
        <button 
          className="btn btn-ghost !px-3 !py-2 hover:bg-gray-100/50 hover:text-red-500 transition-colors rounded-xl" 
          onClick={() => { onLogout(); navigate('/'); }}>
          <LogOut size={16} />
          <span className="text-sm font-semibold hidden sm:inline-block">Logout</span>
        </button>
      </div>
    </nav>
  );
}
