
import React from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onRoleSwitch: (role: UserRole) => void;
  onGoHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onRoleSwitch, onGoHome }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={onGoHome}>
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">SokoMetrics</span>
        </div>

        <div className="flex items-center space-x-4">
          {!user ? (
            <div className="flex space-x-2">
              <button 
                onClick={() => onRoleSwitch(UserRole.CONTRIBUTOR)}
                className="text-sm font-medium px-3 py-2 text-slate-600 hover:text-indigo-600"
              >
                Login
              </button>
              <button 
                onClick={() => onRoleSwitch(UserRole.CONTRIBUTOR)}
                className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Join Now
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
              </div>
              <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-red-600 transition"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Role Switcher Quick Bar for MVP Dev */}
      <div className="bg-slate-100 border-b border-slate-200 py-1 overflow-x-auto">
        <div className="container mx-auto px-4 flex space-x-4 text-[10px] whitespace-nowrap">
          <span className="text-slate-400 font-bold uppercase">Role Switch (MVP):</span>
          <button onClick={() => onRoleSwitch(UserRole.CONTRIBUTOR)} className="hover:text-indigo-600 font-medium">Contributor</button>
          <button onClick={() => onRoleSwitch(UserRole.ADMIN)} className="hover:text-indigo-600 font-medium">Admin</button>
          <button onClick={() => onRoleSwitch(UserRole.B2B)} className="hover:text-indigo-600 font-medium">B2B Subscriber</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
