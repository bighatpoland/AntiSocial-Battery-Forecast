
import React from 'react';
import { BatteryMedium, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="relative space-y-4">
      {user && (
        <div className="absolute top-0 right-0 flex items-center gap-4 bg-white p-2 pl-4 rounded-full shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-gray-600 truncate max-w-[120px]">
              {user.email}
            </span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-2">
          <BatteryMedium className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Social <span className="text-emerald-600">Battery</span> Forecast
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Recharge Your Social Energy – Forecast, Track, and Thrive with 
          <span className="font-semibold text-gray-700"> AI-Powered Satirical Insights.</span>
        </p>
      </div>
    </header>
  );
};

export default Header;
