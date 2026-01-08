
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Info,
  Coffee,
  Battery as BatteryIcon,
  Lightbulb,
  ShieldAlert,
  RefreshCw,
  Skull
} from 'lucide-react';
import { UserInput, AIInsights, User } from './types';
import { generateSocialForecast } from './services/geminiService';
import Header from './components/Header';
import BatteryDisplay from './components/BatteryDisplay';
import ForecastChart from './components/ForecastChart';
import InputForm from './components/InputForm';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('sbf_current_session');
    if (savedSession) {
      const usersRaw = localStorage.getItem('sbf_users');
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      const user = users.find(u => u.email === savedSession);
      if (user) {
        setCurrentUser(user);
        if (user.data?.lastInsights) {
          setInsights(user.data.lastInsights);
        }
      }
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sbf_current_session', user.email);
    if (user.data?.lastInsights) {
      setInsights(user.data.lastInsights);
    } else {
      handleForecastUpdate(user.data?.input || {
        currentBattery: 75,
        eyeContactFactor: 5,
        smallTalkDensity: 5,
        events: []
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setInsights(null);
    localStorage.removeItem('sbf_current_session');
  };

  const handleForecastUpdate = async (input: UserInput) => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateSocialForecast(input);
      setInsights(data);
      
      const usersRaw = localStorage.getItem('sbf_users');
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      const updatedUsers = users.map(u => {
        if (u.email === currentUser.email) {
          return { ...u, data: { input, lastInsights: data } };
        }
        return u;
      });
      localStorage.setItem('sbf_users', JSON.stringify(updatedUsers));
      setCurrentUser(prev => prev ? ({ ...prev, data: { input, lastInsights: data } }) : null);

    } catch (err) {
      console.error(err);
      setError("Social sensors temporarily saturated. Recharge manually or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFooter = () => (
    <footer className="text-center pt-12 pb-8 space-y-2">
      {currentUser && (
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Aura Identifier: {currentUser.email}</p>
      )}
      <p className="text-xs font-bold text-gray-400">Created with 😖 by Konstancja Tanjga in 2026</p>
      <p className="text-[11px] font-medium text-gray-300 italic">"Because some emails should have stayed as thoughts."</p>
    </footer>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f9fafb] py-12 px-4 selection:bg-emerald-100 selection:text-emerald-900">
        <div className="max-w-5xl mx-auto">
          <Header user={null} onLogout={() => {}} />
          <Auth onAuthSuccess={handleAuthSuccess} />
          {renderFooter()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] py-8 px-4 md:px-8 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <Header user={currentUser} onLogout={handleLogout} />

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 rounded-[2rem] flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-rose-100 p-2 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white p-2 md:p-4 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="p-6 md:p-8 space-y-8">
                <div className="flex items-center gap-3 text-gray-800">
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Vulnerability Parameters</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Define your social exposure</p>
                  </div>
                </div>
                <InputForm 
                  onSubmit={handleForecastUpdate} 
                  isLoading={isLoading} 
                  initialData={currentUser.data?.input}
                />
              </div>
            </section>

            {insights && (
              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all duration-700 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-gray-800">
                    <div className="bg-emerald-50 p-2 rounded-xl">
                      <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">Social Volatility Chart</h2>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">24-hour energy projection</p>
                    </div>
                  </div>
                </div>
                <ForecastChart data={insights.forecast} />
              </section>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            {insights && (
              <>
                <section>
                   <div className="flex items-center gap-2 mb-4 px-4">
                    <BatteryIcon className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Live Status</h2>
                  </div>
                  <BatteryDisplay 
                    percentage={insights.currentLevel} 
                    label={insights.label} 
                    statusTag={insights.statusTag}
                  />
                </section>

                {/* Collapse Moment Callout */}
                <section className="bg-rose-600 p-8 rounded-[2.5rem] shadow-xl text-white group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform">
                     <Skull className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-rose-500/50 p-2 rounded-xl">
                        <ShieldAlert className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black tracking-tight">Breakdown Alert</h2>
                        <p className="text-[10px] text-rose-200 font-black uppercase tracking-widest">Calculated Collapse</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black leading-tight tracking-tight mb-2">
                      {insights.collapseMoment?.split(' - ')[0]}
                    </p>
                    <p className="text-sm font-medium text-rose-100 leading-relaxed italic">
                      {insights.collapseMoment?.split(' - ')[1] || "The moment humanity becomes unbearable."}
                    </p>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-50 p-2 rounded-xl group-hover:scale-110 transition-transform">
                      <Coffee className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight">Core Insight</h2>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">AI Perception</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium italic bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    "{insights.insightText}"
                  </p>
                </section>

                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-amber-50 p-2 rounded-xl group-hover:scale-110 transition-transform">
                      <Lightbulb className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight">Survival Tips</h2>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Damage Control</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {insights.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs font-bold text-gray-600 group/item">
                        <span className="mt-0.5 flex-shrink-0 bg-amber-100 text-amber-700 w-6 h-6 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform">💡</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
            
            {!insights && isLoading && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] h-64 border border-gray-100 animate-pulse flex items-center justify-center">
                   <RefreshCw className="w-8 h-8 text-emerald-200 animate-spin" />
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] h-32 border border-gray-100 animate-pulse"></div>
              </div>
            )}
          </div>
        </main>

        {renderFooter()}
      </div>
    </div>
  );
};

export default App;
