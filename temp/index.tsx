import React, { useState, useEffect, useRef } from 'react'; 
import {  
  Activity,  
  Power,  
  Download,  
  Music,  
  Mic2,  
  Upload,  
  Play,  
  Pause,  
  Square, 
  Settings, 
  Waves, 
  AudioLines, 
  Maximize2, 
  Volume2, 
  Cpu 
} from 'lucide-react'; 
 
// --- SUB-COMPONENTS --- 
 
// Screw Head UI Element 
const Screw = ({ className }) => ( 
  <div className={`screw ${className}`} /> 
); 
 
// VU Meter using style.css classes 
const VuMeter = ({ value, isPlaying }) => { 
  // Simulate bounce based on value 
  const displayValue = isPlaying ? Math.min(100, Math.max(0, value + (Math.random() * 20 - 10))) : 0; 
   
  // 20 Segments total: 12 Green, 5 Yellow, 3 Red 
  const segments = [ 
    ...Array(3).fill('red'), 
    ...Array(5).fill('yellow'), 
    ...Array(12).fill('green') 
  ]; 
 
  return ( 
    <div className="vu-meter-container w-4 bg-[var(--color-primary)] border border-[var(--color-buttonbg)]"> 
      {segments.map((color, i) => { 
        // Calculate threshold for this segment (reverse index because rendering top-down in array, but css 
        // flex-reverse handles bottom-up) 
        // Actually style.css says flex-direction: column-reverse, so first in DOM is bottom. 
        // Wait, array map produces DOM order.  
        // Index 0 in array = Top of visual stack (Red) if standard column.  
        // Style.css: flex-direction: column-reverse.  
        // So DOM Element 0 is at the BOTTOM.  
        // We need to reverse our array to match visual stack (Green at bottom/DOM 0). 
         
        // Let's reverse the array for mapping: 
        // DOM 0: Green (Low) -> DOM 19: Red (High) 
        const threshold = (i / 20) * 100;  
        const isActive = displayValue > threshold; 
         
        return ( 
          <div  
            key={i}  
            className={`vu-segment vu-segment-${color} ${isActive ? 'active' : ''}`}  
          /> 
        ); 
      }).reverse()}  
    </div> 
  ); 
}; 
 
// Rotary Knob with Metal Texture context 
const RotaryKnob = ({ label, value, isActive, onToggle, onChange, size = 'large', isPeaking }) => { 
  const rotation = (value / 100) * 270 - 135; 
  const dragInfo = useRef({ startY: 0, startValue: 0, isDragging: false, didDrag: false });

  const outerSize = size === 'large' ? 'w-24 h-24' : 'w-16 h-16';
  const innerSize = size === 'large' ? 'w-16 h-16' : 'w-10 h-10';

  const handleMouseMove = (e) => {
    if (!dragInfo.current.isDragging) return;

    const deltaY = dragInfo.current.startY - e.clientY; // Drag up increases value

    if (Math.abs(deltaY) > 3) {
      dragInfo.current.didDrag = true;
    }

    const newValue = Math.round(dragInfo.current.startValue + deltaY * 0.5);
    const clampedValue = Math.max(0, Math.min(100, newValue));

    if (clampedValue !== value && onChange) {
      onChange(clampedValue);
    }
  };

  const handleMouseUp = () => {
    if (dragInfo.current.isDragging && !dragInfo.current.didDrag) {
      onToggle();
    }

    dragInfo.current.isDragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    dragInfo.current = {
      startY: e.clientY,
      startValue: value,
      isDragging: true,
      didDrag: false
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
   
  const activeClasses = 'border-[var(--color-accent)] shadow-[0_0_15px_rgba(255,140,0,0.2)]';
  const peakingClasses = 'border-[var(--color-error)] shadow-[0_0_15px_var(--color-error)] animate-pulse';
  const inactiveClasses = 'border-[var(--color-buttonbg)]';
   
  return ( 
    <div className="flex flex-col items-center gap-4 group relative z-10"> 
      <div className="flex flex-col items-center"> 
        <span className="font-mono text-[10px] text-[var(--color-textdark)] uppercase tracking-widest group-hover:text-[var(--color-accent)] transition-colors">{label}</span> 
        <div className={`h-[1px] w-8 mt-1 transition-all duration-500 ${isActive ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-buttonbg)]'}`} /> 
      </div> 
       
      <div className="relative cursor-pointer" onMouseDown={handleMouseDown}> 
        {/* Outer Ring */} 
        <div className={`${outerSize} rounded-full bg-[var(--color-metal)] border-[2px] flex items-center justify-center shadow-xl transition-all duration-300 ${isPeaking ? peakingClasses : (isActive ? activeClasses : inactiveClasses)}`}> 
          {/* Inner Knob */} 
          <div  
            className={`${innerSize} rounded-full bg-gradient-to-br from-[#444] to-[#111] shadow-inner relative transition-transform duration-300 border border-[#222]`} 
            style={{ transform: `rotate(${rotation}deg)` }} 
          > 
            {/* Indicator */} 
            <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full ${isActive ? 'bg-[var(--color-accent)] shadow-[0_0_5px_var(--color-accent)]' : 'bg-[#555]'}`} /> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
// Fader utilizing .studio-fader class 
const ConsoleFader = ({ label, value, icon: Icon, isPlaying, onChange }) => { 
  // Map dB value (-60 to +12) to slider 0-100 range roughly 
  const sliderValue = (value + 60) * (100 / 72);  

  const handleSliderChange = (e) => {
    if (!onChange) return;
    const newSliderValue = e.target.value;
    // convert back to dB
    const newDbValue = (newSliderValue * 72 / 100) - 60;
    onChange(parseFloat(newDbValue.toFixed(1))); // Pass dB value back up
  };
 
  return ( 
    <div className="flex flex-col items-center gap-4 bg-[var(--color-secondary)] p-4 rounded border border-[var(--color-buttonbg)] relative"> 
      {/* Screws */} 
      <Screw className="top-2 left-2" /> 
      <Screw className="top-2 right-2" /> 
      <Screw className="bottom-2 left-2" /> 
      <Screw className="bottom-2 right-2" /> 
 
      <div className="flex items-center gap-2 mb-2"> 
        <Icon size={14} className="text-[var(--color-textdark)]" /> 
        <span className="font-mono text-[9px] text-[var(--color-textlight)] uppercase tracking-widest">{label}</span> 
      </div> 
 
      <div className="flex gap-4 h-64"> 
        {/* VU Meter Side */} 
        <VuMeter value={isPlaying ? Math.random() * (sliderValue) : 0} isPlaying={isPlaying} /> 
 
        {/* Fader Track */} 
        <div className="relative w-12 flex items-center justify-center bg-[#111] rounded-md border border-[#333]"> 
          {/* Using rotation for vertical fader */} 
          <input  
            type="range"  
            className="studio-fader absolute w-56 -rotate-90" 
            min="0" 
            max="100" 
            value={sliderValue} 
            onChange={handleSliderChange} 
          /> 
        </div> 
      </div> 
 
      <div className="font-mono text-[10px] text-[var(--color-textdark)] mt-2"> 
        {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)} dB 
      </div> 
    </div> 
  ); 
}; 
 
// Pattern Definition 
const ConcreteGospelPattern = () => ( 
  <svg width="0" height="0" className="absolute"> 
    <defs> 
      <pattern id="concrete-gospel-pattern" x="0" y="0" width="600" height="800" patternUnits="userSpaceOnUse"> 
        <rect width="600" height="800" fill="transparent"/> 
        <g className="stencil-group opacity-[0.03]"> 
          <style> 
            {`.stencil-text { font-family: 'Impact', sans-serif; font-weight: 900; font-size: 32px; text-anchor: middle; fill: #dcdcdc; letter-spacing: 4px; text-transform: uppercase; }`} 
          </style> 
          {[ 
            "Concrete Gospel", "Voice of the Voiceless", "Survival as Strategy",  
            "Embrace the Suck", "Grit & Grace", "Digital Nomad Vibes",  
            "Flip Da Script", "Build While Bleeding", "Poetic Survival",  
            "Purpose Over Pretend", "Urban Mythmaker", "Concrete Lament",  
            "Raw Redemption", "Faith in the Filth", "Messy But Sacred" 
          ].map((text, i) => ( 
            <text key={i} x="300" y={50 + (i * 50)} className="stencil-text">{text}</text> 
          ))} 
        </g> 
      </pattern> 
    </defs> 
  </svg> 
); 
 
// --- MAIN APP --- 
 
const App = () => { 
  const [file, setFile] = useState(null); 
  const [isPlaying, setIsPlaying] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false); 
  
  // Load initial state from localStorage or use defaults
  const [stems, setStems] = useState(() => {
    const defaultStems = { 
      kick: { active: true, vol: 80, threshold: 50 }, 
      snare: { active: true, vol: 70, threshold: 50 }, 
      hats: { active: true, vol: 60, threshold: 50 } 
    };
    try {
      const saved = localStorage.getItem('stems');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge to ensure new properties (like threshold) exist if loading old state
        return {
          kick: { ...defaultStems.kick, ...parsed.kick },
          snare: { ...defaultStems.snare, ...parsed.snare },
          hats: { ...defaultStems.hats, ...parsed.hats }
        };
      }
    } catch (e) {
      console.error("Failed to load stems from storage", e);
    }
    return defaultStems;
  }); 

  const [mixer, setMixer] = useState(() => {
    const defaultMixer = { vox: -1.5, bass: 0.0, fx: -12.0, main: -0.5 };
    try {
      const saved = localStorage.getItem('mixer');
      return saved ? JSON.parse(saved) : defaultMixer;
    } catch (e) {
      console.error("Failed to load mixer from storage", e);
      return defaultMixer;
    }
  }); 

  const [stemPeaks, setStemPeaks] = useState({ kick: false, snare: false, hats: false });
  const peakTimers = useRef({});

  // Persist state changes
  useEffect(() => { localStorage.setItem('stems', JSON.stringify(stems)); }, [stems]);
  useEffect(() => { localStorage.setItem('mixer', JSON.stringify(mixer)); }, [mixer]);
 
  // Effect for simulating audio and checking thresholds
  useEffect(() => {
    if (!isPlaying) {
        setStemPeaks({ kick: false, snare: false, hats: false });
        Object.values(peakTimers.current).forEach(timer => timer && clearTimeout(timer));
        peakTimers.current = {};
        return;
    }

    const audioInterval = setInterval(() => {
        Object.keys(stems).forEach(key => {
            if (stems[key].active) {
                const randomLevel = Math.random() * stems[key].vol;
                if (randomLevel > stems[key].threshold) {
                    setStemPeaks(prevPeaks => prevPeaks[key] ? prevPeaks : { ...prevPeaks, [key]: true });
                    if (peakTimers.current[key]) clearTimeout(peakTimers.current[key]);
                    peakTimers.current[key] = setTimeout(() => {
                        setStemPeaks(prevPeaks => ({ ...prevPeaks, [key]: false }));
                    }, 500); // Peak hold time
                }
            }
        });
    }, 100); // How often to check for peaks

    return () => { clearInterval(audioInterval); Object.values(peakTimers.current).forEach(timer => timer && clearTimeout(timer)); };
  }, [isPlaying, stems]);

  const toggleStem = (key) => { 
    setStems(prev => ({ 
      ...prev, 
      [key]: { ...prev[key], active: !prev[key].active } 
    })); 
  }; 

  const handleStemVolumeChange = (key, newVolume) => {
    setStems(prev => ({
      ...prev,
      [key]: { ...prev[key], vol: newVolume }
    }));
  };

  const handleStemThresholdChange = (key, newThreshold) => {
    setStems(prev => ({
      ...prev,
      [key]: { ...prev[key], threshold: newThreshold }
    }));
  };

  const handleMixerChange = (channel, newValue) => {
    setMixer(prev => ({
        ...prev,
        [channel.toLowerCase()]: newValue
    }));
  };
 
  const handleUpload = (e) => { 
    const f = e.target.files[0]; 
    if (f) { 
      setFile(f); 
      setIsProcessing(true); 
      setTimeout(() => setIsProcessing(false), 2000); 
    } 
  }; 
 
  return ( 
    <div className="min-h-screen bg-[var(--color-primary)] text-[var(--color-textlight)] font-sans relative overflow-x-hidden flex flex-col"> 
      <ConcreteGospelPattern /> 
       
      {/* Background Texture Overlay */} 
      <div  
        className="fixed inset-0 pointer-events-none opacity-20" 
        style={{ fill: 'url(#concrete-gospel-pattern)' }}  
      > 
        <svg width="100%" height="100%"> 
           <rect width="100%" height="100%" fill="url(#concrete-gospel-pattern)" /> 
        </svg> 
      </div> 
 
      {/* Main Header */} 
      <header className="w-full border-b border-[#333] bg-[var(--color-secondary)] relative z-20 shadow-lg"> 
        <div className="max-w-[1600px] mx-auto p-6 flex justify-between items-center"> 
          <div className="flex items-center gap-4"> 
            <div className="w-10 h-10 bg-[var(--color-accent)] rounded flex items-center justify-center shadow-lg"> 
              <Volume2 size={20} className="text-[#000]" /> 
            </div> 
            <div> 
              <h1 className="text-xl font-bold tracking-tight text-[var(--color-textlight)] flex items-center gap-2"> 
                BUILDWHILEBLEEDING <span className="text-[var(--color-textdark)] font-light italic">STUDIO</span> 
              </h1> 
              <p className="font-mono text-[10px] text-[var(--color-accent)] tracking-widest uppercase"> 
                Concrete Gospel Edition // v2.0 
              </p> 
            </div> 
          </div> 
           
          <div className="flex items-center gap-6"> 
             <div className="hidden lg:flex gap-8 font-mono text-[10px] text-[var(--color-textdark)]"> 
                <span>CPU: 12%</span> 
                <span>MEM: 4.2GB</span> 
                <span>DSP: ACTIVE</span> 
             </div> 
             <button  
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`px-8 py-3 rounded font-mono text-xs font-bold tracking-widest transition-all border border-[#000] shadow-lg ${isPlaying ? 'bg-[var(--color-error)] text-white' : 'bg-[var(--color-buttonbg)] text-[var(--color-textlight)] hover:bg-[var(--color-buttonhover)]'}`} 
             > 
               {isPlaying ? 'CUT SIGNAL' : 'ENGAGE'} 
             </button> 
          </div> 
        </div> 
      </header> 
 
      {/* Rack Mount Container */} 
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-8 relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8"> 
         
        {/* Left: Percussion Triangle Console */} 
        <section className="xl:col-span-8 texture-brushed-metal rounded-lg p-1 relative shadow-2xl flex flex-col"> 
          {/* Wood Side Cheeks */} 
          <div className="absolute top-0 bottom-0 -left-4 w-4 texture-wood-panel rounded-l-md border-r border-[#000]" /> 
          <div className="absolute top-0 bottom-0 -right-4 w-4 texture-wood-panel rounded-r-md border-l border-[#000] z-20" /> 
 
          {/* Console Face */} 
          <div className="h-full w-full border border-[#444] rounded p-8 relative flex items-center justify-center bg-gradient-to-b from-transparent to-[#000]/30"> 
            <Screw className="top-4 left-4" /> 
            <Screw className="top-4 right-4" /> 
            <Screw className="bottom-4 left-4" /> 
            <Screw className="bottom-4 right-4" /> 
 
            {/* Top Snare */} 
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"> 
              <RotaryKnob 
                label="SNARE / SNAP" 
                value={stems.snare.vol} 
                isActive={stems.snare.active} 
                onToggle={() => toggleStem('snare')} 
                onChange={(newVol) => handleStemVolumeChange('snare', newVol)} 
                isPeaking={stemPeaks.snare}
              /> 
              <RotaryKnob 
                label="THRESH" 
                value={stems.snare.threshold} 
                isActive={true} 
                size="small"
                onToggle={() => {}} 
                onChange={(newVal) => handleStemThresholdChange('snare', newVal)} 
              />
            </div> 
 
            {/* Bottom Left Kick */} 
            <div className="absolute bottom-12 left-12 flex flex-row items-end gap-4"> 
              <RotaryKnob 
                label="THRESH" 
                value={stems.kick.threshold} 
                isActive={true} 
                size="small"
                onToggle={() => {}} 
                onChange={(newVal) => handleStemThresholdChange('kick', newVal)} 
              />
              <RotaryKnob 
                label="KICK / SUB" 
                value={stems.kick.vol} 
                isActive={stems.kick.active} 
                onToggle={() => toggleStem('kick')} 
                onChange={(newVol) => handleStemVolumeChange('kick', newVol)} 
                isPeaking={stemPeaks.kick}
              /> 
            </div> 
 
            {/* Bottom Right Hats */} 
            <div className="absolute bottom-12 right-12 flex flex-row items-end gap-4"> 
              <RotaryKnob 
                label="HATS / AIR" 
                value={stems.hats.vol} 
                isActive={stems.hats.active} 
                onToggle={() => toggleStem('hats')} 
                onChange={(newVol) => handleStemVolumeChange('hats', newVol)} 
                isPeaking={stemPeaks.hats}
              /> 
              <RotaryKnob 
                label="THRESH" 
                value={stems.hats.threshold} 
                isActive={true} 
                size="small"
                onToggle={() => {}} 
                onChange={(newVal) => handleStemThresholdChange('hats', newVal)} 
              />
            </div> 
 
            {/* Center Upload Hub */} 
            <div className="relative z-30"> 
              <div className={`w-40 h-40 rounded-full border-4 ${isProcessing ? 'border-[var(--color-accent)]' : 'border-[#333]'} bg-[#1a1a1a] flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)]`}> 
                {!file ? ( 
                  <label className="cursor-pointer flex flex-col items-center group"> 
                    <Upload size={24} className="text-[var(--color-textdark)] group-hover:text-[var(--color-accent)] transition-colors mb-2" /> 
                    <span className="font-mono text-[9px] text-[var(--color-textdark)] uppercase text-center">Load<br/>Source</span> 
                    <input type="file" className="hidden" onChange={handleUpload} /> 
                  </label> 
                ) : ( 
                   <div className="text-center"> 
                      <Activity size={32} className={`${isProcessing ? 'text-[var(--color-accent)] animate-pulse' : 'text-[var(--color-success)]'}`} /> 
                      <p className="font-mono text-[9px] text-[var(--color-textlight)] mt-2">LINKED</p> 
                   </div> 
                )} 
              </div> 
              {/* Connector Lines */} 
              <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none -z-10 opacity-30"> 
                 <line x1="50%" y1="50%" x2="50%" y2="20%" stroke="var(--color-textdark)" strokeWidth="2" /> 
                 <line x1="50%" y1="50%" x2="25%" y2="80%" stroke="var(--color-textdark)" strokeWidth="2" /> 
                 <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="var(--color-textdark)" strokeWidth="2" /> 
              </svg> 
            </div> 
          </div> 
        </section> 
 
        {/* Right: Mixing Desk */} 
        <section className="xl:col-span-4 flex flex-col gap-6"> 
          <div className="texture-brushed-metal rounded-lg p-6 relative shadow-2xl flex-1 border border-[#000]"> 
             <div className="flex items-center justify-between mb-6 border-b border-[#333] pb-2"> 
                <h3 className="font-mono text-[11px] text-[var(--color-textlight)] tracking-[0.2em] uppercase flex items-center gap-2"> 
                  <Waves size={14} className="text-[var(--color-accent)]" /> Stem Mixer 
                </h3> 
                <div className="flex gap-1"> 
                   <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" /> 
                   <div className="w-2 h-2 rounded-full bg-[var(--color-buttonbg)]" /> 
                </div> 
             </div> 
 
             <div className="grid grid-cols-4 gap-2 h-full pb-4"> 
                <ConsoleFader label="VOX" value={mixer.vox} icon={Mic2} isPlaying={isPlaying} onChange={(val) => handleMixerChange('vox', val)} /> 
                <ConsoleFader label="BASS" value={mixer.bass} icon={Waves} isPlaying={isPlaying} onChange={(val) => handleMixerChange('bass', val)} /> 
                <ConsoleFader label="FX" value={mixer.fx} icon={Music} isPlaying={isPlaying} onChange={(val) => handleMixerChange('fx', val)} /> 
                <ConsoleFader label="MAIN" value={mixer.main} icon={AudioLines} isPlaying={isPlaying} onChange={(val) => handleMixerChange('main', val)} /> 
             </div> 
          </div> 
 
          {/* System Readout */} 
          <div className="bg-[#000] border border-[#333] rounded p-4 h-40 font-mono text-[10px] overflow-y-auto"> 
             <div className="flex flex-col gap-1"> 
                <span className="text-[var(--color-textdark)]">:: SYSTEM BOOT_SEQ COMPLETE</span> 
                <span className="text-[var(--color-textdark)]">:: AUDIO_ENGINE: 96kHz / 32-bit Float</span> 
                {file && <span className="text-[var(--color-success)]">:: MEDIA_LOADED: {file.name.toUpperCase()}</span>} 
                {isProcessing && <span className="text-[var(--color-accent)]">:: ANALYZING TRANSIENTS...</span>} 
                {isPlaying && <span className="text-[var(--color-textlight)]">:: PLAYBACK ACTIVE</span>} 
             </div> 
          </div> 
        </section> 
 
      </main> 
 
      <footer className="w-full border-t border-[#333] bg-[var(--color-secondary)] p-6 relative z-20"> 
         <div className="max-w-[1600px] mx-auto flex justify-between items-center opacity-50"> 
            <div className="flex gap-8"> 
               <span className="font-mono text-[9px] text-[var(--color-textdark)] cursor-pointer hover:text-[var(--color-textlight)] flex items-center gap-2" onClick={() => alert('Preferences panel not implemented.')}> 
                 <Settings size={12} /> PREFS 
               </span> 
               <span className="font-mono text-[9px] text-[var(--color-textdark)] cursor-pointer hover:text-[var(--color-textlight)] flex items-center gap-2" onClick={() => window.confirm('Are you sure you want to shut down?')}> 
                 <Power size={12} /> SHUTDOWN 
               </span> 
            </div> 
            <div className="font-mono text-[9px] text-[var(--color-textdark)] tracking-[0.5em] uppercase"> 
               RyanrealAF // 2026 // No Compromise 
            </div> 
         </div> 
      </footer> 
    </div> 
  ); 
}; 
 
export default App;
