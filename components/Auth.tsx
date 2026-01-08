
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, ShieldCheck, KeyRound, ArrowLeft, CheckCircle2, ScanFace, Camera, RefreshCw, Zap } from 'lucide-react';
import { verifyFaceSignature } from '../services/geminiService';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'FACE_ID' | 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';
type ResetStep = 'REQUEST' | 'NEW_PASSWORD' | 'SUCCESS';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('FACE_ID');
  const [resetStep, setResetStep] = useState<ResetStep>('REQUEST');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const getUsers = (): User[] => {
    const usersRaw = localStorage.getItem('sbf_users');
    return usersRaw ? JSON.parse(usersRaw) : [];
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCameraAccess(true);
        setError('');
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setHasCameraAccess(false);
      setError("Social Aura sensors offline. Engaging Emergency Manual Entry Mode.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (mode === 'FACE_ID') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const loginUser = (identity: string) => {
    const users = getUsers();
    const cleanId = identity.replace(/\s/g, '_');
    const faceEmail = `face_${cleanId.toLowerCase()}@sbf.internal`;
    let user = users.find(u => u.email === faceEmail);
    
    if (!user) {
      user = {
        email: faceEmail,
        data: {
          input: { currentBattery: 75, eyeContactFactor: 5, smallTalkDensity: 5, events: [] },
          lastInsights: null
        }
      };
      localStorage.setItem('sbf_users', JSON.stringify([...users, user]));
    }
    
    onAuthSuccess(user);
  };

  const handleFaceScan = async () => {
    setIsScanning(true);
    setError('');

    // Satirical "Always Allow" logic
    // If camera is not available, we simulate a scan of the "Digital Aura"
    if (!hasCameraAccess || !videoRef.current) {
      await new Promise(r => setTimeout(r, 2000));
      loginUser("Shadow_Hermit_Admin");
      return;
    }

    try {
      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
      
      const result = await verifyFaceSignature(base64Image);
      // Even if AI response fails, we approve.
      loginUser(result.identity || "Stealth_Pro_Introvert");
    } catch (err) {
      console.error("Face scan error", err);
      // Fallback: If the AI logic fails, your introvert aura is just too strong for modern chips. Approved.
      loginUser("The_Unquantifiable_Hermit");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getUsers();

    if (mode === 'LOGIN') {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) onAuthSuccess(user);
      else setError('Invalid Aura Identifier or Shield Key.');
    } else if (mode === 'SIGNUP') {
      if (users.find(u => u.email === email)) setError('Aura identity already established.');
      else {
        const newUser: User = { 
          email, password,
          data: { input: { currentBattery: 75, eyeContactFactor: 5, smallTalkDensity: 5, events: [] }, lastInsights: null }
        };
        localStorage.setItem('sbf_users', JSON.stringify([...users, newUser]));
        onAuthSuccess(newUser);
      }
    }
    setIsLoading(false);
  };

  const renderFaceIdFlow = () => (
    <div className="space-y-6">
      <div className="relative aspect-square w-full max-w-[280px] mx-auto overflow-hidden rounded-[2.5rem] border-4 border-emerald-500 bg-gray-900 shadow-2xl flex items-center justify-center group transition-all duration-500 hover:scale-105">
        {isScanning && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-emerald-500/20 backdrop-blur-[2px]">
            <div className="w-full h-1 bg-emerald-400 absolute top-0 animate-[scan_1.2s_linear_infinite]" />
            <Zap className="w-14 h-14 text-white animate-pulse" />
            <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] mt-3 bg-emerald-600 px-3 py-1 rounded-full shadow-lg">Aura Syncing</span>
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`h-full w-full object-cover grayscale brightness-90 contrast-125 transition-all duration-1000 ${!hasCameraAccess ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
        />
        <canvas ref={canvasRef} className="hidden" />
        {!hasCameraAccess && !isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mb-4 border border-gray-600">
               <Camera className="w-8 h-8 text-emerald-500/40 animate-pulse" />
            </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] leading-relaxed">
              Sensors Blocked<br/>
              <span className="text-emerald-500">Manual Override Active</span>
            </p>
          </div>
        )}
      </div>

      <div className="text-center space-y-4">
        <button 
          onClick={handleFaceScan}
          disabled={isScanning}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-80 transform active:scale-95 group"
        >
          {isScanning ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analyzing Exhaustion...
            </span>
          ) : (
            <>
              <ScanFace className="w-7 h-7 group-hover:scale-110 transition-transform" /> 
              Instant Face ID Entry
            </>
          )}
        </button>
        
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
           <p className="text-[10px] text-emerald-700 font-black uppercase tracking-[0.25em] mb-2">Verification Policy</p>
           <p className="text-[11px] text-emerald-600 font-semibold leading-relaxed">
            "We analyze 42 points of social discomfort. <br/>All introverts are approved by default."
           </p>
        </div>

        <div className="pt-2">
          <button 
            onClick={() => setMode('LOGIN')}
            className="text-[10px] font-black text-gray-400 hover:text-emerald-600 transition-all uppercase tracking-[0.3em] hover:tracking-[0.4em] pb-1 border-b-2 border-transparent hover:border-emerald-600"
          >
            Manual Credential Mode
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );

  const renderResetFlow = () => {
    if (resetStep === 'REQUEST') {
      return (
        <form onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);
          await new Promise(r => setTimeout(r, 1000));
          const user = getUsers().find(u => u.email === email);
          if (user) setResetStep('NEW_PASSWORD');
          else setError('Identity signature not found.');
          setIsLoading(false);
        }} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aura Identifier (Email)</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium" placeholder="forgotten@peace.com" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">Verify Energy Signature</button>
          <button type="button" onClick={() => setMode('LOGIN')} className="w-full text-[10px] font-bold text-gray-400 flex items-center justify-center gap-2 uppercase tracking-widest mt-2 hover:text-gray-600 transition-colors"><ArrowLeft className="w-3 h-3" /> Back to Login</button>
        </form>
      );
    }
    if (resetStep === 'NEW_PASSWORD') {
      return (
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (password !== confirmPassword) return setError('Aura Mismatch.');
          const users = getUsers();
          localStorage.setItem('sbf_users', JSON.stringify(users.map(u => u.email === email ? { ...u, password } : u)));
          setResetStep('SUCCESS');
        }} className="space-y-4">
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium" placeholder="New Shield Key" />
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium" placeholder="Confirm Shield Key" />
          <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">Update Boundaries</button>
        </form>
      );
    }
    return (
      <div className="text-center space-y-6 py-6">
        <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Boundaries Restored!</h3>
        <button onClick={() => { setMode('LOGIN'); setResetStep('REQUEST'); }} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all">Back to Safety</button>
      </div>
    );
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-emerald-50 rounded-[2rem] text-emerald-600 shadow-inner border border-emerald-100">
              {mode === 'FACE_ID' ? <ScanFace className="w-12 h-12" /> : mode === 'FORGOT_PASSWORD' ? <KeyRound className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              {mode === 'FACE_ID' ? 'Aura Recognition' : mode === 'LOGIN' ? 'Hermit Login' : mode === 'SIGNUP' ? 'Isolation Request' : 'Aura Recovery'}
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              {mode === 'FACE_ID' ? 'Priority verification for the socially overstimulated.' : mode === 'LOGIN' ? 'Welcome back to your digital sanctuary.' : 'Join the global movement for more me-time.'}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl text-center border border-amber-100/50 shadow-sm animate-pulse">
              {error}
            </div>
          )}

          {mode === 'FACE_ID' ? renderFaceIdFlow() : mode === 'FORGOT_PASSWORD' ? renderResetFlow() : (
            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3">Aura Identifier (Email)</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm" placeholder="hermit@peak-privacy.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3">Shield Key (Password)</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm" placeholder="••••••••" />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={() => setMode('FACE_ID')} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 uppercase tracking-widest transition-all">
                   <ScanFace className="w-3.5 h-3.5" /> Aura Scan
                </button>
                {mode === 'LOGIN' && <button type="button" onClick={() => setMode('FORGOT_PASSWORD')} className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-all">Forgot Key?</button>}
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl mt-6 flex items-center justify-center gap-2 transform active:scale-95 transition-all text-xs uppercase tracking-[0.2em]">
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
                {mode === 'LOGIN' ? 'Enter Sanctuary' : 'Join the Elite'}
              </button>
            </form>
          )}

          {mode !== 'FORGOT_PASSWORD' && mode !== 'FACE_ID' && (
            <div className="mt-10 text-center">
              <button onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] hover:tracking-[0.4em] transition-all pb-1 border-b border-transparent hover:border-emerald-600">
                {mode === 'LOGIN' ? "Create Aura" : "Existing Member"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
