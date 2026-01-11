
import React, { useState } from 'react';
import { BatteryMedium, LogOut, User as UserIcon, FileText, X } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <header className="relative space-y-4">
      {user && (
        <div className="absolute top-0 right-0 flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setShowManifesto(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-full shadow-sm border border-gray-100 transition-all group"
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Protocol</span>
          </button>
          
          <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-full shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-gray-600 truncate max-w-[80px] md:max-w-[120px]">
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
        </div>
      )}

      <div className="text-center pt-12 md:pt-0">
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

      {showManifesto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col relative">
            <div className="absolute top-6 right-6">
              <button onClick={() => setShowManifesto(false)} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 md:p-16 space-y-8">
              <div className="space-y-2">
                <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Classified: Eyes Only</span>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">The SBF Manifesto</h2>
              </div>
              
              <div className="prose prose-sm text-gray-600 font-medium leading-relaxed space-y-4">
                <p>
                  In an era where "grabbing coffee" is a weaponized form of psychological warfare, the 
                  <span className="text-emerald-600 font-bold"> Social Battery Forecast</span> stands as the only barrier 
                  between you and a public meltdown.
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-emerald-500 italic">
                  "Our mission is simple: To provide you with a scientific excuse to stay in your pajamas 
                  while everyone else is discussing synergized deliverables at a networking mixer."
                </div>
                <h4 className="text-gray-900 font-black uppercase tracking-widest text-xs pt-4">Operational Directives:</h4>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Never acknowledge a 'Sync' without checking the collapse timestamp.</li>
                  <li>Eye contact is a finite resource; spend it like gold.</li>
                  <li>Small talk is a biological hazard; wear a digital mask.</li>
                </ul>
                <p className="pt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  By using this app, you agree to prioritize your peace over their 'quick catch-up.'
                </p>
              </div>
              
              <button 
                onClick={() => setShowManifesto(false)}
                className="w-full py-5 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-gray-800 transition-all"
              >
                Back to the Bunker
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
