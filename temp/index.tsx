
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface Stem {
  id: string;
  label: string;
  group: 'drum' | 'instrument';
}

const STEMS: Stem[] = [
  { id: 'kick', label: 'Kick', group: 'drum' },
  { id: 'snare', label: 'Snare', group: 'drum' },
  { id: 'hats', label: 'Hats', group: 'drum' },
  { id: 'overhead', label: 'OH', group: 'drum' },
  { id: 'bass', label: 'Bass', group: 'instrument' },
  { id: 'vocal', label: 'Vocal', group: 'instrument' },
  { id: 'other', label: 'Extra', group: 'instrument' },
];

// --- Atomic Components ---

const HexBolt: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`absolute w-2.5 h-2.5 bg-neutral-800 rounded-sm rotate-45 border border-white/5 shadow-inner ${className}`}>
    <div className="w-1 h-1 bg-black/40 rounded-full m-auto mt-0.5" />
  </div>
);

const DigitalRadialGauge: React.FC<{ level: number; label: string; color?: string }> = ({ level, label, color = "#FF4D00" }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (level * circumference);

  return (
    <div className="relative w-24 h-24 flex flex-col items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle 
          cx="50" cy="50" r={radius} fill="transparent" 
          stroke={color} strokeWidth="4" strokeDasharray={circumference} 
          strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-300 ease-out"
          style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
        <span className="text-[14px] font-black tracking-tighter" style={{ color }}>{Math.round(level * 100)}%</span>
        <span className="text-[7px] text-white/30 uppercase font-bold tracking-widest">{label}</span>
      </div>
    </div>
  );
};

const HighResVUMeter: React.FC<{ level: number }> = ({ level }) => {
  const bars = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="flex flex-col-reverse gap-[1.5px] h-32 w-1.5 bg-black/40 p-[1px] rounded-full border border-white/5">
      {bars.map((i) => {
        const active = i < Math.floor(level * bars.length);
        const isPeak = i > 18;
        return (
          <div 
            key={i} 
            className={`flex-grow w-full rounded-full transition-all duration-75 ${
              active 
                ? (isPeak ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-[#00F3FF] shadow-[0_0_5px_rgba(0,243,255,0.5)]') 
                : 'bg-white/5'
            }`} 
          />
        );
      })}
    </div>
  );
};

const OLEDScribbleStrip: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <div className={`
    scribble-strip px-3 py-1.5 rounded-sm transition-all duration-300
    ${active ? 'border-orange-500/50 scale-105' : 'border-white/5 opacity-60'}
  `}>
    <span className={`text-[11px] font-bold tracking-[0.2em] font-mono ${active ? 'text-orange-500 neon-text-orange' : 'text-cyan-500/80'}`}>
      {label.toUpperCase()}
    </span>
  </div>
);

const ModernFader: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="relative h-44 w-10 flex flex-col items-center group">
    <div className="absolute h-full w-1.5 bg-black rounded-full border border-white/5 shadow-inner" />
    <input
      type="range"
      min="0" max="100" value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="absolute h-full w-full opacity-0 cursor-pointer z-20"
      style={{ appearance: 'slider-vertical' } as any}
    />
    <div 
      className="absolute w-8 h-10 bg-gradient-to-b from-[#333] to-[#111] rounded-sm border border-white/10 shadow-2xl flex flex-col items-center justify-center transition-all duration-100 z-10"
      style={{ bottom: `${value}%`, transform: 'translateY(50%)' }}
    >
      <div className="w-full h-px bg-orange-500 shadow-[0_0_5px_orange]" />
      <div className="flex-grow w-full flex items-center justify-center space-x-0.5 opacity-20 group-hover:opacity-100 transition-opacity">
        <div className="w-[1px] h-3 bg-white" />
        <div className="w-[1px] h-3 bg-white" />
        <div className="w-[1px] h-3 bg-white" />
      </div>
    </div>
  </div>
);

// --- Main Application ---

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStem, setActiveStem] = useState<string | null>(null);
  const [volumes, setVolumes] = useState<Record<string, number>>({
    kick: 80, snare: 75, hats: 60, overhead: 50, bass: 70, vocal: 90, other: 40
  });
  const [mutes, setMutes] = useState<Set<string>>(new Set());
  const [solos, setSolos] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<{type: 'user' | 'ai', text: string}[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [busMode, setBusMode] = useState<'drums' | 'instruments'>('drums');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#FF4D00');
      gradient.addColorStop(0.5, '#00F3FF');
      gradient.addColorStop(1, '#FF4D00');

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00F3FF50';

      for (let x = 0; x < canvas.width; x++) {
        const time = Date.now() * 0.005;
        const freq1 = Math.sin(x * 0.02 + time) * 30;
        const freq2 = Math.sin(x * 0.05 - time * 0.8) * 15;
        ctx.lineTo(x, canvas.height / 2 + freq1 + freq2);
      }
      ctx.stroke();
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  const handleDeMix = () => {
    setIsProcessing(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 1.5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        setMessages(prev => [...prev, { type: 'ai', text: "Neural array initialized. Stem data projected to console." }]);
      }
    }, 40);
  };

  const handleSendMessage = () => {
    if (!currentInput) return;
    setMessages(prev => [...prev, { type: 'user', text: currentInput }]);
    setCurrentInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'ai', text: "Analyzing command structure... Parameter shift executed." }]);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      {/* Chassis */}
      <div className="unibody-frame w-full max-w-6xl bg-[#111] rounded-2xl overflow-hidden flex flex-col md:flex-row relative">
        <HexBolt className="top-4 left-4" />
        <HexBolt className="top-4 right-4" />
        <HexBolt className="bottom-4 left-4" />
        <HexBolt className="bottom-4 right-4" />

        {/* LEFT: Engine & Mixer */}
        <div className="flex-grow flex flex-col p-8 space-y-8">
          
          {/* Header Module */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">AETHER-1 <span className="text-orange-500 font-normal">Neural Studio</span></h1>
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-cyan-500 shadow-[0_0_10px_#00F3FF]' : 'bg-neutral-800'}`} />
                <span className="text-[9px] text-white/20 uppercase tracking-[0.3em]">Quantum-Bus Processor Activated</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <DigitalRadialGauge level={progress / 100} label="Core Load" />
              <DigitalRadialGauge level={isPlaying ? 0.82 : 0} label="Dynamic Range" color="#00F3FF" />
            </div>
          </div>

          {/* Main Display: Waveform Analyzer */}
          <div className="glass-panel h-56 rounded-xl relative overflow-hidden flex flex-col">
            <div className="flex-grow relative">
              <canvas ref={canvasRef} width={800} height={200} className="w-full h-full opacity-60" />
              {!isProcessing && progress < 100 && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={handleDeMix}
                      disabled={isProcessing}
                      className="px-10 py-4 glass-panel border border-orange-500/30 text-orange-500 font-black tracking-[0.4em] uppercase hover:bg-orange-500 hover:text-white transition-all duration-500"
                    >
                      {isProcessing ? `Demixing Stems ${Math.round(progress)}%` : 'Inject Neural Reel'}
                    </button>
                 </div>
              )}
            </div>
            <div className="h-10 border-t border-white/5 bg-black/40 px-4 flex items-center justify-between">
               <div className="flex items-center space-x-4">
                 <button onClick={() => setIsPlaying(!isPlaying)} className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all ${isPlaying ? 'border-red-500 bg-red-500/20 text-red-500' : 'border-white/20 text-white/40'}`}>
                    <div className={isPlaying ? "w-2 h-2 bg-current rounded-sm" : "border-l-4 border-t-4 border-b-4 border-t-transparent border-b-transparent border-l-current ml-0.5"} />
                 </button>
                 <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">04:32:00:21</span>
               </div>
               <div className="flex space-x-1">
                 {Array.from({length: 40}).map((_, i) => (
                    <div key={i} className={`w-0.5 h-1.5 ${i < progress * 0.4 ? 'bg-cyan-500' : 'bg-white/5'}`} />
                 ))}
               </div>
            </div>
          </div>

          {/* Mixer Console */}
          <div className="flex-grow flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                   <button onClick={() => setBusMode('drums')} className={`px-4 py-1.5 text-[10px] font-bold rounded-sm border transition-all ${busMode === 'drums' ? 'border-orange-500 text-orange-500' : 'border-white/5 text-white/20'}`}>DRUM ARRAY</button>
                   <button onClick={() => setBusMode('instruments')} className={`px-4 py-1.5 text-[10px] font-bold rounded-sm border transition-all ${busMode === 'instruments' ? 'border-orange-500 text-orange-500' : 'border-white/5 text-white/20'}`}>INST ARRAY</button>
                </div>
                <div className="text-[9px] text-white/10 tracking-widest">Aether Discrete Circuitry // Rev 4.02</div>
             </div>
             
             <div className="flex items-stretch space-x-6 overflow-x-auto scrollbar-hide pb-2">
                {STEMS.filter(s => (busMode === 'drums' ? s.group === 'drum' : s.group === 'instrument')).map(stem => (
                  <div 
                    key={stem.id}
                    onClick={() => setActiveStem(stem.id)}
                    className={`glass-panel min-w-[110px] p-3 flex flex-col items-center justify-between transition-all duration-300 ${activeStem === stem.id ? 'border-orange-500/40 ring-1 ring-orange-500/20' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <div className="w-full flex justify-between items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      <HighResVUMeter level={isPlaying ? Math.random() * (volumes[stem.id]/100) : 0} />
                    </div>
                    
                    <div className="my-6">
                      <OLEDScribbleStrip label={stem.label} active={activeStem === stem.id} />
                    </div>

                    <ModernFader value={volumes[stem.id]} onChange={(v) => setVolumes(prev => ({...prev, [stem.id]: v}))} />

                    <div className="mt-4 flex flex-col items-center space-y-1">
                      <span className="text-[10px] text-white/20 font-mono tracking-tighter">{volumes[stem.id]}db</span>
                      <div className="flex space-x-2">
                         <button onClick={(e) => { e.stopPropagation(); setMutes(prev => {
                           const n = new Set(prev); n.has(stem.id) ? n.delete(stem.id) : n.add(stem.id); return n;
                         })}} className={`w-4 h-1.5 rounded-full transition-all ${mutes.has(stem.id) ? 'bg-red-500' : 'bg-neutral-800'}`} />
                         <button onClick={(e) => { e.stopPropagation(); setSolos(prev => {
                           const n = new Set(prev); n.has(stem.id) ? n.delete(stem.id) : n.add(stem.id); return n;
                         })}} className={`w-4 h-1.5 rounded-full transition-all ${solos.has(stem.id) ? 'bg-orange-500 shadow-[0_0_5px_orange]' : 'bg-neutral-800'}`} />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Master Strip */}
                <div className="glass-panel min-w-[130px] p-4 bg-orange-500/[0.03] border-l-2 border-orange-500/20 flex flex-col items-center justify-between">
                   <DigitalRadialGauge level={isPlaying ? 0.78 : 0} label="Bus Output" color="#00F3FF" />
                   <div className="bg-orange-500 px-3 py-1 rounded-sm text-black font-black text-[9px] tracking-widest">MASTER SUM</div>
                   <ModernFader value={90} onChange={() => {}} />
                   <div className="text-[9px] font-black text-orange-500 opacity-50 tracking-[0.2em] mt-2">X-PROCESS</div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT: AI Unit Sidebar */}
        <div className="w-full md:w-80 bg-black/40 border-l border-white/5 p-6 flex flex-col">
           <div className="mb-6">
              <h2 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center">
                 <div className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-ping" />
                 Aether Interface
              </h2>
           </div>

           <div className="flex-grow flex flex-col overflow-hidden glass-panel rounded-lg p-4 mb-4">
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 scrollbar-hide font-mono text-[10px]">
                 {messages.length === 0 && <p className="text-white/10 uppercase tracking-widest italic animate-pulse">Awaiting command input...</p>}
                 {messages.map((m, i) => (
                   <div key={i} className={`p-3 rounded-sm ${m.type === 'user' ? 'bg-white/5 text-white/60' : 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'}`}>
                      <span className="opacity-40 mb-1 block">{m.type === 'user' ? 'USER' : 'AETHER'}</span>
                      {m.text}
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <div className="relative">
                 <input 
                   type="text"
                   value={currentInput}
                   onChange={e => setCurrentInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                   placeholder="TYPE COMMAND..."
                   className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-[11px] font-bold tracking-widest placeholder:text-white/10 focus:border-cyan-500/50 outline-none"
                 />
                 <button onClick={handleSendMessage} className="absolute right-2 top-2 px-3 py-1 bg-cyan-500 text-black font-black text-[9px] rounded-sm hover:scale-105 transition-transform">EXEC</button>
              </div>

              <div className="flex items-center justify-center pt-2">
                 <button className="w-16 h-16 rounded-full glass-panel border border-cyan-500/30 flex items-center justify-center group hover:border-cyan-500 transition-all duration-700">
                    <div className="w-4 h-4 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform shadow-[0_0_20px_#00F3FF]" />
                 </button>
              </div>
              <p className="text-center text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">Talkback Control Active</p>
           </div>
        </div>
      </div>
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
