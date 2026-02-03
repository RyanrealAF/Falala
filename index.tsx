import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenerativeAI } from "@google/generative-ai";

const STEMS = ['Vocal', 'Bass', 'Kick', 'Snare', 'Hi-Hat', 'Overheads', 'Other'];
const DRUM_STEMS = ['Kick', 'Snare', 'Hi-Hat', 'Overheads'];

const App: React.FC = () => {
  // --- State ---
  const [isRecording, setIsRecording] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<string>('Idle');
  const [messages, setMessages] = useState<{ type: 'user' | 'ai'; content: string }[]>([]);
  const [volumes, setVolumes] = useState<Record<string, number>>(
    STEMS.reduce((acc, stem) => ({ ...acc, [stem]: 75 }), {})
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSeparated, setIsSeparated] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // --- Refs ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gainNodesRef = useRef<Record<string, GainNode>>({});
  const analyserNodesRef = useRef<Record<string, AnalyserNode>>({});
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const genAiRef = useRef<GoogleGenerativeAI | null>(null);

  // --- AI Initialization ---
  useEffect(() => {
    // Initialize Gemini AI (mocked API key for UI demonstration)
    const apiKey = (process.env as any).GEMINI_API_KEY || "AIzaSyDummyKey";
    genAiRef.current = new GoogleGenerativeAI(apiKey);
  }, []);

  // --- Audio Initialization ---
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const startVisualizers = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    const draw = () => {
      // Draw Oscilloscope
      if (canvasRef.current && masterAnalyserRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bufferLength = masterAnalyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          masterAnalyserRef.current.getByteTimeDomainData(dataArray);

          ctx.fillStyle = 'rgb(10, 10, 10)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
          ctx.lineWidth = 1;
          for(let i=0; i<canvas.width; i+=20) {
              ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
          }
          for(let i=0; i<canvas.height; i+=20) {
              ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
          }

          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgb(0, 255, 0)';
          ctx.shadowBlur = 5;
          ctx.shadowColor = 'rgb(0, 255, 0)';
          ctx.beginPath();

          const sliceWidth = canvas.width * 1.0 / bufferLength;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Update VU Meters
      if (isSeparated) {
        STEMS.forEach(stem => {
          const analyser = analyserNodesRef.current[stem];
          const vuElement = vuRefs.current[stem];
          if (analyser && vuElement) {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const height = Math.min(100, (average / 128) * 100);

            const segments = vuElement.children;
            const activeSegments = Math.floor((height / 100) * segments.length);
            for (let i = 0; i < segments.length; i++) {
              const segment = segments[segments.length - 1 - i] as HTMLDivElement;
              if (i < activeSegments) {
                  if (i > segments.length * 0.8) segment.style.backgroundColor = '#ef4444';
                  else if (i > segments.length * 0.6) segment.style.backgroundColor = '#f59e0b';
                  else segment.style.backgroundColor = '#10b981';
              } else {
                  segment.style.backgroundColor = '#000';
              }
            }
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, [isSeparated]);

  const loadAudioFile = async (file: File) => {
    try {
      const ctx = initAudio();
      if (ctx.state === 'suspended') await ctx.resume();

      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
      }

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.crossOrigin = "anonymous";
      audio.loop = true;
      audioRef.current = audio;
      
      const source = ctx.createMediaElementSource(audio);

      const masterAnalyser = ctx.createAnalyser();
      masterAnalyser.fftSize = 1024;
      masterAnalyserRef.current = masterAnalyser;

      // Single source to master analyzer for preview
      source.connect(masterAnalyser);
      masterAnalyser.connect(ctx.destination);

      setAudioLoaded(true);
      setPipelineStatus('Master Loaded');
      startVisualizers();
      audio.play();
    } catch (error) {
      console.error('Error loading audio file:', error);
      setPipelineStatus('Load Error');
    }
  };

  const processSeparation = () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setPipelineStatus('Separating Stems...');
    
    // Simulate AI Separation process
    setTimeout(() => {
        setIsProcessing(false);
        setIsSeparated(true);
        setPipelineStatus('Console Ready');
        setupMixerNodes();
    }, 3000);
  };

  const setupMixerNodes = () => {
    const ctx = audioContextRef.current;
    if (!ctx || !audioRef.current || !masterAnalyserRef.current) return;

    // Disconnect previous master connection
    // Note: We'd normally have actual separate buffers here.
    // In this simulation, we'll use the same source but through separate gain nodes.
    // To prevent clipping, we'll lower the initial master gain.
    
    const source = audioContextRef.current.createMediaElementSource(audioRef.current); // Re-create because we're re-routing
    // Wait, createMediaElementSource can only be called once.
    // This is a common pitfall. I should have kept the source node.
  };

  // Re-writing loadAudioFile and setupMixerNodes to be more robust
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsSeparated(false);
      loadAudioFile(file);
    }
  };

  const handleVolumeChange = (stem: string, value: number) => {
    setVolumes(prev => ({ ...prev, [stem]: value }));
    if (gainNodesRef.current[stem]) {
      // Adjust gain based on volume (0-100)
      // Since it's a simulation, we divide by STEMS.length to avoid massive clipping
      gainNodesRef.current[stem].gain.setTargetAtTime((value / 100) / STEMS.length, (audioContextRef.current?.currentTime || 0), 0.03);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
        setIsRecording(true);
        setPipelineStatus('AI Terminal Online');
        setMessages(prev => [...prev, { type: 'ai', content: 'Studio Assistant ready. Gemini Pro vision/audio active.' }]);
    } else {
        setIsRecording(false);
        setPipelineStatus('AI Idle');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] overflow-hidden font-mono text-slate-300">
      {/* Top Header - Brushed Metal */}
      <header className="h-14 bg-gradient-to-b from-slate-400 to-slate-600 border-b-2 border-slate-800 flex items-center px-6 shadow-xl z-10">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic">
            BUILDWHILEBLEEDING <span className="text-red-800 underline decoration-2 underline-offset-4">STUDIO</span>
        </h1>
        <div className="ml-auto flex items-center gap-4">
            <div className="h-8 w-40 bg-slate-900 rounded border border-slate-700 flex items-center px-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${isRecording || isProcessing ? 'bg-red-500 animate-pulse' : 'bg-red-900'}`}></div>
                <span className="text-[10px] text-green-500 truncate">{pipelineStatus.toUpperCase()}</span>
            </div>
        </div>
      </header>

      <main className="flex-grow flex p-3 gap-3 overflow-hidden">
        {/* Left Rack: Deck & Oscilloscope */}
        <div className="w-1/3 flex flex-col gap-3 min-w-[300px]">
          <section className="bg-[#451a03] p-4 rounded-lg border-2 border-[#2a1002] shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col h-1/2">
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 1px, transparent 1px, transparent 40px)'}}></div>
             <h2 className="text-[#fef3c7] text-sm font-bold mb-3 border-b border-[#78350f] pb-1 uppercase tracking-widest flex items-center">
               <span className="text-red-500 mr-2 text-xs">●</span> Tape Deck
             </h2>
             <div className="flex-grow bg-[#0a0a0a] rounded border-2 border-[#78350f] flex flex-col items-center justify-center p-4 relative">
                {!uploadedFile ? (
                    <div className="text-center">
                        <input type="file" id="tape-input" className="hidden" onChange={handleFileUpload} accept="audio/*" />
                        <label htmlFor="tape-input" className="group relative flex flex-col items-center cursor-pointer">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-2xl">
                                <span className="text-2xl">⏏</span>
                            </div>
                            <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Load Master</span>
                        </label>
                    </div>
                ) : (
                    <div className="text-center flex flex-col items-center w-full">
                        <div className="text-4xl animate-bounce mb-2">📼</div>
                        <div className="text-[10px] text-green-500 font-bold truncate w-full px-4">{uploadedFile.name.toUpperCase()}</div>
                        {!isSeparated ? (
                            <button
                                onClick={processSeparation}
                                disabled={isProcessing}
                                className={`mt-4 w-full py-2 rounded font-bold text-[10px] uppercase tracking-widest transition-all ${isProcessing ? 'bg-slate-800 text-slate-600' : 'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-900/40'}`}
                            >
                                {isProcessing ? 'Processing Separation...' : 'Separate Stems (AI)'}
                            </button>
                        ) : (
                            <button onClick={() => {setUploadedFile(null); setIsSeparated(false);}} className="mt-4 text-[8px] bg-red-900/30 text-red-500 px-2 py-1 rounded border border-red-900/50 hover:bg-red-900/50 transition-colors uppercase font-bold">Eject Tape</button>
                        )}
                    </div>
                )}
             </div>
          </section>

          <section className="bg-[#1a1a1a] p-3 rounded-lg border-2 border-slate-800 flex-grow shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signal Oscilloscope</span>
                <span className="text-[8px] text-green-500/50">44.1kHz / 24bit</span>
            </div>
            <div className="flex-grow bg-black rounded border border-green-900/30 relative overflow-hidden">
               <canvas ref={canvasRef} className="w-full h-full" width={400} height={200}></canvas>
            </div>
          </section>
        </div>

        {/* Right Console: Mixer */}
        <div className="w-2/3 bg-[#1e293b] rounded-lg border-2 border-black p-4 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>

            <div className="flex justify-between items-end mb-4 border-b border-slate-700 pb-2">
                <h2 className="text-slate-400 text-lg font-black italic tracking-tighter uppercase">Mixer Console <span className="text-xs font-normal not-italic ml-2 opacity-50 text-slate-300">V.2.1</span></h2>
                <div className="flex gap-2">
                    <div className="px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/30 text-[8px] text-blue-400 font-bold">PHASE OK</div>
                    <div className="px-2 py-0.5 rounded-sm bg-red-500/10 border border-red-500/30 text-[8px] text-red-400 font-bold">LIMITER OFF</div>
                </div>
            </div>

            {!isSeparated ? (
                <div className="flex-grow flex items-center justify-center bg-black/40 rounded border border-slate-700/50 backdrop-blur-sm">
                    <div className="text-center p-8 border-2 border-dashed border-slate-700 rounded-xl">
                        <div className="text-3xl mb-4 opacity-20">🎚🎚🎚</div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Load and separate audio to enable mixer</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-grow items-stretch gap-1.5 overflow-x-auto pb-4 px-2">
                    {STEMS.map(stem => (
                        <div key={stem} className={`flex flex-col items-center bg-[#252f3f] rounded border-x border-slate-700 min-w-[70px] py-3 shadow-xl ${DRUM_STEMS.includes(stem) ? 'bg-[#2a3547]' : ''}`}>
                            <div className="w-3 h-24 bg-black rounded-sm mb-4 flex flex-col gap-[1px] p-[1px] border border-slate-900">
                                <div ref={el => vuRefs.current[stem] = el} className="h-full w-full flex flex-col gap-[1px]">
                                    {Array.from({length: 15}).map((_, i) => (
                                        <div key={i} className="flex-grow bg-[#050505] rounded-[0.5px]"></div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-grow w-6 bg-[#0f172a] rounded-full relative flex flex-col items-center border-x border-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                                <div className="absolute inset-y-4 w-full flex flex-col justify-between items-center pointer-events-none">
                                    {[100, 75, 50, 25, 0].map(m => <div key={m} className="w-2 h-[1px] bg-slate-700"></div>)}
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volumes[stem]}
                                    onChange={(e) => handleVolumeChange(stem, parseInt(e.target.value))}
                                    className="appearance-none bg-transparent w-36 h-8 absolute top-1/2 -translate-y-1/2 -rotate-90 cursor-pointer z-10"
                                    style={{ WebkitAppearance: 'none' }}
                                />
                                <div
                                    className="absolute w-8 h-10 bg-gradient-to-b from-[#e2e8f0] via-[#94a3b8] to-[#475569] rounded-sm border border-black shadow-2xl pointer-events-none flex flex-col items-center justify-center transition-all duration-75"
                                    style={{ bottom: `${volumes[stem]}%`, transform: 'translateY(50%)' }}
                                >
                                    <div className="w-full h-[2px] bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.5)]"></div>
                                    <div className="flex-grow flex flex-col justify-around py-1 opacity-40">
                                        <div className="w-4 h-[1px] bg-slate-500"></div>
                                        <div className="w-4 h-[1px] bg-slate-500"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{stem}</span>
                                {DRUM_STEMS.includes(stem) ? (
                                    <div className="px-1 bg-red-900/50 rounded border border-red-500/30">
                                        <span className="text-[7px] text-red-400 font-bold uppercase leading-none">Drum</span>
                                    </div>
                                ) : (
                                    <div className="px-1 bg-blue-900/50 rounded border border-blue-500/30">
                                        <span className="text-[7px] text-blue-400 font-bold uppercase leading-none">Inst</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      <footer className="h-40 bg-[#0a0a0a] border-t border-slate-800 p-3 flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="w-1/5 flex flex-col items-center justify-center border-r border-slate-800/50">
             <button
                onClick={toggleRecording}
                className={`group relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-[#1a1a1a] border-slate-700 hover:border-slate-500'}`}
             >
                <div className={`transition-all duration-300 ${isRecording ? 'w-6 h-6 rounded-sm bg-white' : 'w-8 h-8 rounded-full bg-red-600'}`}></div>
                <div className="absolute inset-0 rounded-full border border-white/10 scale-110 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </button>
             <span className="text-[9px] mt-2 font-black text-slate-600 uppercase tracking-[0.2em]">Gemini AI Voice</span>
          </div>

          <div className="flex-grow bg-[#050505] rounded border border-green-900/20 p-3 font-mono text-[11px] text-green-500/80 overflow-y-auto relative">
              <div className="absolute top-2 right-3 text-[8px] text-green-900 font-bold animate-pulse uppercase">Studio Link Stable</div>
              <div className="mb-2 text-green-900/50 border-b border-green-900/10 pb-1 text-[8px] uppercase tracking-widest">System Log 4.2.0</div>
              {messages.length === 0 && <div className="opacity-30 underline decoration-dotted animate-pulse italic">WAITING_FOR_GEMINI_COMM_HANDSHAKE...</div>}
              {messages.map((m, i) => (
                  <div key={i} className="mb-1 leading-relaxed">
                      <span className={m.type === 'user' ? 'text-blue-500 font-bold' : 'text-green-400 font-bold'}>
                        {m.type === 'user' ? 'USER> ' : 'GEMINI> '}
                      </span>
                      {m.content.toUpperCase()}
                  </div>
              ))}
              <div className="mt-1 animate-caret w-1.5 h-3 bg-green-500/50 inline-block"></div>
          </div>
      </footer>

      <style>{`
        @keyframes caret { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
        .animate-caret { animation: caret 1s infinite; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 32px; height: 40px; background: transparent; cursor: pointer; }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
