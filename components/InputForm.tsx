
import React, { useState, useEffect, useCallback } from 'react';
import { SocialEvent, UserInput } from '../types';
import { 
  Plus, Trash2, Zap, Calendar, Check, Loader2, 
  AlertTriangle, Ghost, ShieldX, MessageCircleX, 
  RefreshCw, Bell, X, Info, Filter 
} from 'lucide-react';

interface InputFormProps {
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
  initialData?: UserInput;
}

const HAZARD_TYPES = [
  { label: "The Infinite Sync", color: "text-blue-500" },
  { label: "Mandatory Fun", color: "text-amber-500" },
  { label: "Surprise Small Talk", color: "text-rose-500" },
  { label: "Networking Hell", color: "text-purple-500" },
  { label: "Camera-On Zoom", color: "text-orange-500" },
  { label: "The Long Goodbye", color: "text-emerald-500" },
];

const ESCAPE_PLANS = [
  "Fake a bad internet connection.",
  "Sudden 'emergency' vet appointment for a goldfish.",
  "Nod rhythmically while slowly backing towards the exit.",
  "Develop a temporary, non-specific cough.",
  "The classic 'Irish Exit'.",
  "Checking the 'important email' on a locked screen."
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [currentBattery, setCurrentBattery] = useState(initialData?.currentBattery ?? 75);
  const [eyeContact, setEyeContact] = useState(initialData?.eyeContactFactor ?? 5);
  const [smallTalk, setSmallTalk] = useState(initialData?.smallTalkDensity ?? 5);
  const [events, setEvents] = useState<SocialEvent[]>(initialData?.events ?? []);
  const [isSyncing, setIsSyncing] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(initialData?.isGoogleCalendarConnected ?? false);
  
  // New States for Notification & Review flow
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const [pendingEvents, setPendingEvents] = useState<SocialEvent[]>([]);
  const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set());
  const [isReviewing, setIsReviewing] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newHazardType, setNewHazardType] = useState(HAZARD_TYPES[0].label);
  const [newIntensity, setNewIntensity] = useState(5);

  useEffect(() => {
    if (initialData) {
      setCurrentBattery(initialData.currentBattery);
      setEyeContact(initialData.eyeContactFactor);
      setSmallTalk(initialData.smallTalkDensity);
      setEvents(initialData.events);
      setCalendarConnected(initialData.isGoogleCalendarConnected ?? false);
    }
  }, [initialData]);

  // Simulate a "push notification" after a delay once synced
  useEffect(() => {
    if (calendarConnected && !notification && pendingEvents.length === 0) {
      const timer = setTimeout(() => {
        const newEvent: SocialEvent = { 
          id: 'g4-' + Date.now(), 
          title: 'Unavoidable Workshop', 
          time: '3:00 PM', 
          intensity: 9, 
          source: 'google_calendar', 
          hazardType: 'Networking Hell',
          escapePlan: 'Hide in the printer room.'
        };
        setPendingEvents([newEvent]);
        setNotification({
          title: "Intrusion Alert",
          message: "A new social obligation has manifested in your G-Calendar. Protocol check required."
        });
      }, 10000); // 10 seconds for simulation
      return () => clearTimeout(timer);
    }
  }, [calendarConnected, notification, pendingEvents]);

  const syncGoogleCalendar = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockGoogleEvents: SocialEvent[] = [
      { id: 'g1', title: 'Status Sync (Pointless)', time: '10:00 AM', intensity: 7, source: 'google_calendar', hazardType: 'The Infinite Sync' },
      { id: 'g2', title: '"Quick" 1:1 with Manager', time: '1:30 PM', intensity: 8, source: 'google_calendar', hazardType: 'Camera-On Zoom' },
      { id: 'g3', title: 'Family Dinner Obligation', time: '6:00 PM', intensity: 9, source: 'google_calendar', hazardType: 'The Long Goodbye' }
    ];

    setEvents(prev => {
      const manualEvents = prev.filter(e => e.source !== 'google_calendar');
      return [...manualEvents, ...mockGoogleEvents];
    });
    setCalendarConnected(true);
    setIsSyncing(false);
  };

  const applyPendingChanges = (idsToApply?: string[]) => {
    const eventsToAdd = idsToApply 
      ? pendingEvents.filter(e => idsToApply.includes(e.id))
      : pendingEvents;
    
    setEvents(prev => [...prev, ...eventsToAdd]);
    setPendingEvents([]);
    setNotification(null);
    setIsReviewing(false);
    setSelectedPendingIds(new Set());
  };

  const rejectAllPending = () => {
    setPendingEvents([]);
    setNotification(null);
    setIsReviewing(false);
  };

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventTime) return;
    const event: SocialEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEventTitle,
      time: newEventTime,
      intensity: newIntensity,
      hazardType: newHazardType,
      escapePlan: ESCAPE_PLANS[Math.floor(Math.random() * ESCAPE_PLANS.length)],
      source: 'manual'
    };
    setEvents([...events, event]);
    setNewEventTitle('');
    setNewEventTime('');
    setNewIntensity(5);
    setIsAdding(false);
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      currentBattery,
      eyeContactFactor: eyeContact,
      smallTalkDensity: smallTalk,
      events,
      isGoogleCalendarConnected: calendarConnected
    });
  };

  const togglePendingSelection = (id: string) => {
    const next = new Set(selectedPendingIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPendingIds(next);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative">
      {/* Push Notification Simulation */}
      {notification && !isReviewing && (
        <div className="fixed top-6 right-6 z-[60] max-w-sm bg-gray-900 text-white rounded-[2rem] p-6 shadow-2xl border border-gray-700 animate-in slide-in-from-right-10 duration-500 group">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-2xl animate-pulse">
              <Bell className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h5 className="font-black text-xs uppercase tracking-widest mb-1">{notification.title}</h5>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-4">{notification.message}</p>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setIsReviewing(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-full transition-all"
                >
                  Review Update
                </button>
                <button 
                  type="button"
                  onClick={() => applyPendingChanges()}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-black text-[10px] uppercase tracking-widest rounded-full transition-all"
                >
                  Quick Apply
                </button>
              </div>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Review Overlay/Modal */}
      {isReviewing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h4 className="text-2xl font-black text-gray-900 tracking-tight">Aura Threat Assessment</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">G-Calendar Synchronization Protocol</p>
              </div>
              <button onClick={() => setIsReviewing(false)} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-4">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium leading-relaxed italic">
                  "The following entities have scheduled meetings that potentially infringe upon your isolation quota. Choose which threats to acknowledge."
                </p>
              </div>

              <div className="space-y-4">
                {pendingEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => togglePendingSelection(event.id)}
                    className={`group relative flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${
                      selectedPendingIds.has(event.id) 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-gray-100 bg-white hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPendingIds.has(event.id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'
                      }`}>
                        {selectedPendingIds.has(event.id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 block text-base mb-1">{event.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.time}</span>
                          <span className="text-[10px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Intensity: {event.intensity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => applyPendingChanges()}
                className="flex-1 py-4 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95"
              >
                Accept All Obligations
              </button>
              <button 
                disabled={selectedPendingIds.size === 0}
                onClick={() => applyPendingChanges(Array.from(selectedPendingIds))}
                className="flex-1 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
              >
                Confirm Selected Hazards
              </button>
              <button 
                onClick={rejectAllPending}
                className="flex-1 py-4 bg-white border border-rose-200 text-rose-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-sm hover:bg-rose-50 transition-all active:scale-95 flex flex-col items-center justify-center leading-none"
              >
                <span>Deny</span>
                <span>Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Battery Level Slider */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            Energy Reserves: <span className="text-emerald-600 ml-2">{currentBattery}%</span>
          </label>
          <input 
            type="range" min="0" max="100" value={currentBattery}
            onChange={(e) => setCurrentBattery(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Intensity Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Eye Contact Trauma: <span className="text-emerald-600 ml-2">{eyeContact}/10</span>
            </label>
            <input 
              type="range" min="1" max="10" value={eyeContact}
              onChange={(e) => setEyeContact(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Small Talk Toxicity: <span className="text-emerald-600 ml-2">{smallTalk}/10</span>
            </label>
            <input 
              type="range" min="1" max="10" value={smallTalk}
              onChange={(e) => setSmallTalk(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Social Hazard Log</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Declare upcoming threats to your sanity</p>
          </div>
          
          <button 
            type="button"
            onClick={syncGoogleCalendar}
            disabled={isSyncing}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
              calendarConnected 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
              : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
            }`}
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : calendarConnected ? (
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            {isSyncing ? 'Accessing Archives...' : calendarConnected ? 'G-Calendar Synced (Refresh?)' : 'Import G-Calendar Hazards'}
          </button>
        </div>

        {/* Improved Hazard Declaration Flow */}
        {!isAdding ? (
          <button 
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-5 border-2 border-dashed border-gray-200 rounded-[2.5rem] text-gray-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 mb-6"
          >
            <Plus className="w-4 h-4" /> Declare New Hazard
          </button>
        ) : (
          <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-emerald-100 mb-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">New Hazard Declaration</h4>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest">Cancel Risk</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Threat Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Unannounced Birthday Party" 
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hazard Category</label>
                  <select 
                    value={newHazardType}
                    onChange={(e) => setNewHazardType(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-sm appearance-none"
                  >
                    {HAZARD_TYPES.map(type => (
                      <option key={type.label} value={type.label}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hour of Doom (Time)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 3:45 PM" 
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Drain Intensity: <span className="text-emerald-600">{newIntensity}/10</span></label>
                  <input 
                    type="range" min="1" max="10" value={newIntensity}
                    onChange={(e) => setNewIntensity(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500 mt-3"
                  />
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleAddEvent}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em]"
            >
              <Plus className="w-5 h-5" /> Log Social Threat
            </button>
          </div>
        )}

        <ul className="space-y-4">
          {events.map(event => (
            <li key={event.id} className="group relative flex items-center justify-between bg-white px-8 py-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${event.source === 'google_calendar' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                  {event.source === 'google_calendar' ? <Calendar className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-gray-900 text-base">{event.title}</span>
                    {event.hazardType && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{event.hazardType}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{event.time}</span>
                    {event.escapePlan && (
                      <span className="text-[10px] text-emerald-600 italic font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Escape: {event.escapePlan}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden md:block">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Drain Level</p>
                    <div className="flex gap-1">
                       {[...Array(10)].map((_, i) => (
                         <div key={i} className={`w-1.5 h-3 rounded-full ${i < event.intensity ? (event.intensity > 7 ? 'bg-rose-400' : 'bg-emerald-400') : 'bg-gray-100'}`} />
                       ))}
                    </div>
                 </div>
                <button 
                  type="button" 
                  onClick={() => removeEvent(event.id)} 
                  className="text-gray-200 hover:text-rose-500 transition-all p-3 hover:bg-rose-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
          {events.length === 0 && (
            <div className="text-center py-16 bg-gray-50/50 rounded-[3rem] border-4 border-dotted border-gray-100">
               <Ghost className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em]">The social horizon is eerily calm.</p>
               <p className="text-[10px] text-gray-300 font-medium mt-2">No threats detected. Isolation intact.</p>
            </div>
          )}
        </ul>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-7 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[2.5rem] shadow-2xl shadow-emerald-200 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.97]"
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm uppercase tracking-[0.2em]">Consulting Inner Monologue...</span>
          </div>
        ) : (
          <>
            <Zap className="w-8 h-8 group-hover:rotate-[15deg] transition-transform" />
            <span className="text-xl uppercase tracking-[0.05em]">Recalculate Social Fate</span>
          </>
        )}
      </button>
    </form>
  );
};

export default InputForm;
