# Component Library - BUILDWHILEBLEEDING Studio

This document provides detailed documentation for all React components used in the BUILDWHILEBLEEDING Studio application.

## Overview

The component library follows a modular architecture, with each component designed to be reusable and maintainable. Components are built using React 19 with TypeScript, and styled using Tailwind CSS v4.

## Component Categories

### 1. Atomic Components

#### Screw Component

**Purpose**: Decorative screw element for the retro console aesthetic.

**File**: `index.tsx`

**Props**:
```typescript
interface ScrewProps {
  className?: string; // Additional CSS classes for positioning
}
```

**Usage**:
```tsx
import { Screw } from './index';

// Usage with custom positioning
<Screw className="top-2 left-2" />
```

**Styling**:
```css
.screw {
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #555 0%, #333 100%);
  border-radius: 50%;
  border: 1px solid #111;
  box-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  position: absolute;
}
```

#### VU Meter Component

**Purpose**: Visualizes audio levels using vertical LED segments.

**File**: `index.tsx`

**Props**:
```typescript
interface VUMeterProps {
  level: number; // 0-1 range
}
```

**Usage**:
```tsx
import { VUMeter } from './index';

// Usage with dynamic level
<VUMeter level={0.7} />
```

**Styling**:
```css
.vu-meter-container {
  height: 80px;
  width: 10px;
  background: #111;
  border-radius: 2px;
  padding: 1px;
  display: flex;
  flex-direction: column-reverse;
  overflow: hidden;
  border: 1px solid #333;
}

.vu-segment {
  width: 100%;
  height: 3px;
  margin-bottom: 1px;
  background: #222;
  transition: background 0.1s ease;
}

.vu-segment-green { background: #054d1a; }
.vu-segment-green.active { background: #22c55e; box-shadow: 0 0 5px #22c55e; }
.vu-segment-yellow { background: #4d4305; }
.vu-segment-yellow.active { background: #eab308; box-shadow: 0 0 5px #eab308; }
.vu-segment-red { background: #4d0505; }
.vu-segment-red.active { background: #ef4444; box-shadow: 0 0 5px #ef4444; }
```

### 2. Main Application Component

#### App Component

**Purpose**: The main application component that orchestrates all functionality.

**File**: `index.tsx`

**State Management**:
```typescript
interface AppState {
  // Recording state
  isRecording: boolean;
  pipelineStatus: string;
  messages: { type: 'user' | 'ai'; content: string }[];
  currentMessage: string;
  
  // Audio state
  uploadedFile: File | null;
  isProcessing: boolean;
  processingProgress: number;
  audioLoaded: boolean;
  isPlaying: boolean;
  masterLevel: number;
  
  // Volume controls
  volumes: { [key: string]: number };
}
```

**Key Features**:
- Audio file upload and playback
- Real-time audio visualization (oscilloscope)
- Volume controls for individual stems
- AI assistant integration (text and voice commands)
- System status monitoring
- VU meters for audio levels

**Structure**:
```tsx
const App: React.FC = () => {
  // State hooks...
  
  // Handlers...
  
  return (
    <div className="flex flex-col md:flex-row flex-grow w-full max-w-screen-2xl mx-auto p-6 md:space-x-6 bg-primary font-mono">
      {/* Left Panel: Studio Console Stacks */}
      <div className="flex flex-col w-full md:w-3/4 space-y-6">
        {/* Tape Deck Section */}
        {/* Mixer Console Section */}
        {/* Oscilloscope / Waveform */}
      </div>
      
      {/* Right Panel: Rack Mount Gear */}
      <div className="flex flex-col w-full md:w-1/4 space-y-6">
        {/* Rack AI Unit */}
        {/* System Status Rack */}
      </div>
    </div>
  );
};
```

### 3. Section Components

#### Tape Deck Section

**Purpose**: Handles audio file upload, playback controls, and audio processing.

**Key Features**:
- File upload button with visual feedback
- Play/stop/eject controls
- De-mix processing button with progress indicator
- Tape deck visual representation

**Implementation**:
```tsx
<section className="texture-wood-panel p-4 rounded-sm relative overflow-hidden">
  <Screw className="top-2 left-2" />
  <Screw className="top-2 right-2" />
  <Screw className="bottom-2 left-2" />
  <Screw className="bottom-2 right-2" />

  <div className="texture-brushed-metal p-6 rounded-sm studio-border">
    <h2 className="text-xl font-bold text-accent mb-4 tracking-tighter">ANALOG TAPE INTERFACE</h2>
    
    {/* File upload and playback controls */}
  </div>
</section>
```

#### Mixing Console Section

**Purpose**: Provides volume controls and VU meters for individual audio stems.

**Key Features**:
- Drum bus section (Kick, Snare, High-hat, Overheads)
- Auxiliary bus section (Vocal, Bass, Other)
- Vertical faders (0-100%) with visual feedback
- VU meters for each stem
- Grouped by drum and instrument categories

**Implementation**:
```tsx
<section className="texture-wood-panel p-4 rounded-sm relative">
  <Screw className="top-2 left-2" />
  <Screw className="top-2 right-2" />
  <Screw className="bottom-2 left-2" />
  <Screw className="bottom-2 right-2" />

  <div className="texture-brushed-metal p-6 rounded-sm studio-border">
    <h2 className="text-xl font-bold text-accent mb-6 tracking-tighter uppercase">Mixing Console v4.0</h2>
    
    {/* Drum Group */}
    <div>
      <h3 className="text-sm font-black text-textdark mb-4 bg-black/50 px-2 py-1 inline-block border-l-4 border-accent">DRUM BUS</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {drumStems.map(stem => (
          <div key={stem} className="flex flex-col items-center bg-black/20 p-4 rounded-sm studio-border">
            <label className="text-[10px] font-black text-textlight mb-3 uppercase tracking-widest">{stem}</label>
            <div className="flex h-40 items-center justify-center">
              <VUMeter level={masterLevel * (volumes[stem.toLowerCase()] / 100)} />
              <div className="h-full flex flex-col justify-between py-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes[stem.toLowerCase()]}
                  onChange={(e) => handleVolumeChange(stem, e.target.value)}
                  className="studio-fader h-32"
                  style={{ appearance: 'slider-vertical' } as any}
                />
              </div>
            </div>
            <span className="text-[10px] text-accent mt-3 bg-black px-2">{volumes[stem.toLowerCase()]}%</span>
          </div>
        ))}
      </div>
    </div>
    
    {/* Instruments Group */}
    {/* Similar structure for other stems */}
  </div>
</section>
```

#### Oscilloscope Section

**Purpose**: Visualizes audio waveform using canvas.

**Key Features**:
- Real-time waveform display
- Grid background for technical feel
- No signal detected indicator
- Responsive canvas sizing

**Implementation**:
```tsx
<section className="texture-wood-panel p-4 rounded-sm relative">
  <Screw className="top-2 left-2" />
  <Screw className="top-2 right-2" />
  <Screw className="bottom-2 left-2" />
  <Screw className="bottom-2 right-2" />

  <div className="texture-brushed-metal p-6 rounded-sm studio-border">
    <h2 className="text-xl font-bold text-accent mb-4 tracking-tighter uppercase">Oscilloscope Output</h2>
    <div className="w-full h-48 bg-[#0a0a0a] rounded-sm border-2 border-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
           style={{backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className={`w-full h-full bg-transparent z-10 ${audioLoaded ? '' : 'hidden'}`}
      ></canvas>
      {!audioLoaded && (
        <span className="text-success animate-pulse font-bold tracking-[0.2em]">NO SIGNAL DETECTED</span>
      )}
    </div>
  </div>
</section>
```

#### AI Processor Unit

**Purpose**: Provides AI assistant interface for text and voice commands.

**Key Features**:
- Terminal-style message display
- Text input field for commands
- Execute button for text commands
- Voice command button with visual feedback
- Message history with user/AI distinction

**Implementation**:
```tsx
<section className="texture-wood-panel p-4 rounded-sm relative flex-grow">
  <Screw className="top-2 left-2" />
  <Screw className="top-2 right-2" />
  <Screw className="bottom-2 left-2" />
  <Screw className="bottom-2 right-2" />

  <div className="texture-brushed-metal p-6 h-full flex flex-col rounded-sm studio-border">
    <h2 className="text-lg font-bold text-accent mb-4 tracking-tighter uppercase">AI PROCESSOR v9000</h2>
    <div className="flex flex-col flex-grow bg-black/60 p-4 rounded-sm border border-white/5 mb-4 font-mono text-[10px] overflow-y-auto studio-border shadow-inner">
      {/* Message display */}
    </div>

    <div className="mb-4">
        <div className="flex bg-black p-1 rounded-sm studio-border">
            <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="INPUT COMMAND..."
                className="bg-transparent border-none outline-none text-[10px] text-success flex-grow px-2"
            />
            <button
                onClick={sendMessage}
                className="text-accent hover:text-white px-2 text-[10px] font-bold"
            >
                EXEC
            </button>
        </div>
    </div>

    <div className="flex justify-center mt-auto p-2 bg-black/20 rounded-sm studio-border">
      <button
        onClick={startRecording}
        className="w-16 h-16 rounded-full texture-brushed-metal studio-border flex items-center justify-center hover:shadow-[0_0_15px_#ff8c00] transition-all group active:translate-y-1"
      >
        <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-accent animate-ping' : 'bg-error animate-pulse'} shadow-[0_0_5px_currentColor]`}></div>
      </button>
    </div>
  </div>
</section>
```

#### System Status Rack

**Purpose**: Displays current system status and pipeline information.

**Key Features**:
- Status indicator (green for active, red for inactive)
- Pipeline status text with real-time updates
- Clean, focused design for quick reference

**Implementation**:
```tsx
<section className="texture-wood-panel p-4 rounded-sm relative">
  <Screw className="top-2 left-2" />
  <Screw className="top-2 right-2" />
  <Screw className="bottom-2 left-2" />
  <Screw className="bottom-2 right-2" />

  <div className="texture-brushed-metal p-6 rounded-sm studio-border">
    <h2 className="text-lg font-bold text-accent mb-4 tracking-tighter uppercase">System Status</h2>
    <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-sm studio-border">
      <div className={`w-3 h-3 rounded-full ${audioLoaded ? 'bg-success shadow-[0_0_8px_#22c55e]' : 'bg-error shadow-[0_0_8px_#ef4444]'}`}></div>
      <p className="text-[10px] text-textlight font-black uppercase tracking-widest">
        {pipelineStatus}
      </p>
    </div>
  </div>
</section>
```

## Component Tree

```
App
├── Tape Deck Section
│   ├── File Upload
│   ├── Playback Controls
│   └── Processing Button
├── Mixing Console Section
│   ├── Drum Bus
│   │   ├── Kick Channel
│   │   │   ├── VU Meter
│   │   │   └── Studio Fader
│   │   ├── Snare Channel
│   │   │   ├── VU Meter
│   │   │   └── Studio Fader
│   │   ├── High-hat Channel
│   │   │   ├── VU Meter
│   │   │   └── Studio Fader
│   │   └── Overheads Channel
│   │       ├── VU Meter
│   │       └── Studio Fader
│   └── Aux Bus
│       ├── Vocal Channel
│       │   ├── VU Meter
│       │   └── Studio Fader
│       ├── Bass Channel
│       │   ├── VU Meter
│       │   └── Studio Fader
│       └── Other Channel
│           ├── VU Meter
│           └── Studio Fader
├── Oscilloscope Section
│   └── Canvas Visualization
├── AI Processor Unit
│   ├── Message History
│   ├── Text Input
│   └── Voice Command Button
└── System Status Rack
    └── Status Indicator
```

## Component Usage Guidelines

### Reusability

- **Atomic Components**: Can be used anywhere in the application
- **Section Components**: Designed for specific functional areas but can be adapted
- **Main App**: Orchestrator component that shouldn't be reused

### Styling Best Practices

- Use Tailwind CSS utility classes for consistent styling
- Leverage design tokens from `@theme` directive
- Avoid inline styles except for dynamic values
- Use semantic HTML elements for accessibility

### Performance Considerations

- Memoize expensive components using `React.memo`
- Use `useCallback` for event handlers
- Cleanup effects in `useEffect`
- Optimize canvas rendering

## Testing Strategy

- Unit tests for atomic components
- Integration tests for section components
- E2E tests for main application flows
- Accessibility tests using tools like axe

## Version History

- **1.0.0** - Initial component library release
  - Screw and VU Meter atomic components
  - Complete section components
  - Main application component
  - Full styling and documentation