# UI Style Guide - AETHER-1 Neural Studio

## Overview

This style guide documents the design system for the AETHER-1 Neural Studio application - a professional drum separation studio with AI-powered assistant. The design system follows a cyberpunk-futuristic aesthetic, inspired by neon-lit interfaces and advanced neural processing technology.

## Design Philosophy

The UI design emphasizes:
- **Futuristic Technology**: Clean, advanced interface for neural audio processing
- **Neon Aesthetic**: Dual-color neon scheme with orange and cyan accents
- **Glass Interface**: Modern glass panel effects with blur and transparency
- **Digital Precision**: Precise digital controls and visualization
- **Cyberpunk Atmosphere**: Dark themes with vibrant neon highlights

## Color Palette

### Primary Colors

```css
:root {
  --obsidian: #050505;           /* Primary background */
  --nova-orange: #FF4D00;        /* Primary accent */
  --cyber-cyan: #00F3FF;         /* Secondary accent */
  --glass: rgba(20, 20, 20, 0.7); /* Glass panel background */
  --neon-text: #f0f0f0;          /* Main text color */
  --neon-muted: #808080;         /* Secondary text */
  --border-glow: rgba(255, 255, 255, 0.05); /* Border accents */
  --shadow-deep: rgba(0, 0, 0, 0.8); /* Deep shadows */
}
```

### Usage Guidelines

- **Obsidian (#050505)**: Main background color, creates deep space effect
- **Nova Orange (#FF4D00)**: Primary accent for important elements, active states
- **Cyber Cyan (#00F3FF)**: Secondary accent for technical elements, progress indicators
- **Glass (rgba(20, 20, 20, 0.7))**: Semi-transparent panel backgrounds with blur
- **Neon Text (#f0f0f0)**: Primary text color for readability
- **Neon Muted (#808080)**: Secondary text and inactive elements

## Typography

### Font Families

```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
```

### Usage

- **Sans-serif (Inter)**: Main UI text, headings, interface labels
- **Monospace (JetBrains Mono)**: Technical information, terminal output, AI interface

### Font Sizes & Weights

```css
/* Headings */
.text-2xl: 1.5rem (24px) - font-black (900)
.text-xl: 1.25rem (20px) - font-black (900)
.text-lg: 1.125rem (18px) - font-bold (700)
.text-base: 1rem (16px) - font-medium (500)

/* Body Text */
.text-sm: 0.875rem (14px) - font-normal (400)
.text-xs: 0.75rem (12px) - font-bold (700)
.text-[10px]: 0.625rem (10px) - font-bold (700) (for technical labels)
.text-[9px]: 0.5625rem (9px) - font-black (900) (for status text)
.text-[8px]: 0.5rem (8px) - font-black (900) (for small labels)
```

### Spacing & Layout

```css
/* Base spacing */
p-1: 0.25rem (4px)
p-2: 0.5rem (8px)
p-3: 0.75rem (12px)
p-4: 1rem (16px)
p-6: 1.5rem (24px)
p-8: 2rem (32px)

/* Layout */
md:space-x-6: 1.5rem (24px) - horizontal spacing on medium screens
space-y-8: 2rem (32px) - vertical spacing
w-full md:w-3/4: Responsive width distribution
```

## Visual Effects & Textures

### Glass Panel Effects

```css
.glass-panel {
  background: var(--glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-glow);
  box-shadow: 0 8px 32px var(--shadow-deep);
}

.unibody-frame {
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.9);
}
```

### Neon Text Effects

```css
.neon-text-orange {
  text-shadow: 0 0 10px rgba(255, 77, 0, 0.5);
  color: #FF4D00;
}

.neon-text-cyan {
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
  color: #00F3FF;
}

.neon-text-white {
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  color: #f0f0f0;
}
```

### Scribble Strip Effects

```css
.scribble-strip {
  background: #020202;
  box-shadow: inset 0 0 10px rgba(0, 243, 255, 0.1);
  border: 1px solid rgba(0, 243, 255, 0.2);
  transition: all 0.3s ease;
}

.scribble-strip.active {
  border-color: rgba(255, 77, 0, 0.5);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 77, 0, 0.3);
}
```

## Components

### Digital Radial Gauges

```html
<div class="relative w-24 h-24 flex flex-col items-center justify-center">
  <svg class="w-full h-full -rotate-90">
    <circle cx="50" cy="50" r="35" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
    <circle 
      cx="50" cy="50" r="35" fill="transparent" 
      stroke="#FF4D00" strokeWidth="4" strokeDasharray="220" 
      strokeDashoffset="44" strokeLinecap="round"
      class="transition-all duration-300 ease-out"
      style="filter: drop-shadow(0 0 5px #FF4D0080)"
    />
  </svg>
  <div class="absolute inset-0 flex flex-col items-center justify-center pt-1">
    <span class="text-[14px] font-black tracking-tighter text-orange-500">82%</span>
    <span class="text-[7px] text-white/30 uppercase font-bold tracking-widest">CORE LOAD</span>
  </div>
</div>
```

### High-Resolution VU Meters

```html
<div class="flex flex-col-reverse gap-[1.5px] h-32 w-1.5 bg-black/40 p-[1px] rounded-full border border-white/5">
  <!-- 24 segments -->
  <div class="flex-grow w-full rounded-full bg-[#00F3FF] shadow-[0_0_5px_rgba(0,243,255,0.5)]" />
  <!-- ... more segments ... -->
</div>
```

### Modern Faders

```html
<div class="relative h-44 w-10 flex flex-col items-center group">
  <div class="absolute h-full w-1.5 bg-black rounded-full border border-white/5 shadow-inner" />
  <input
    type="range"
    min="0" max="100" value="75"
    class="absolute h-full w-full opacity-0 cursor-pointer z-20"
    style={{ appearance: 'slider-vertical' } as any}
  />
  <div 
    class="absolute w-8 h-10 bg-gradient-to-b from-[#333] to-[#111] rounded-sm border border-white/10 shadow-2xl flex flex-col items-center justify-center transition-all duration-100 z-10"
    style={{ bottom: '75%', transform: 'translateY(50%)' }}
  >
    <div class="w-full h-px bg-orange-500 shadow-[0_0_5px_orange]" />
    <div class="flex-grow w-full flex items-center justify-center space-x-0.5 opacity-20 group-hover:opacity-100 transition-opacity">
      <div class="w-[1px] h-3 bg-white" />
      <div class="w-[1px] h-3 bg-white" />
      <div class="w-[1px] h-3 bg-white" />
    </div>
  </div>
</div>
```

### Hex Bolts

```html
<div class="absolute w-2.5 h-2.5 bg-neutral-800 rounded-sm rotate-45 border border-white/5 shadow-inner">
  <div class="w-1 h-1 bg-black/40 rounded-full m-auto mt-0.5" />
</div>
```

## Layout Structure

### Main Application Layout

```html
<div class="min-h-screen flex items-center justify-center p-4">
  <div class="unibody-frame w-full max-w-6xl bg-[#111] rounded-2xl overflow-hidden flex flex-col md:flex-row relative">
    <!-- Hex bolts in corners -->
    <div class="absolute top-4 left-4 w-2.5 h-2.5 bg-neutral-800 rounded-sm rotate-45 border border-white/5 shadow-inner" />
    <div class="absolute top-4 right-4 w-2.5 h-2.5 bg-neutral-800 rounded-sm rotate-45 border border-white/5 shadow-inner" />
    <div class="absolute bottom-4 left-4 w-2.5 h-2.5 bg-neutral-800 rounded-sm rotate-45 border border-white/5 shadow-inner" />
    <div class="absolute bottom-4 right-4 w-2.5 h-2.5 bg-neutral-800 rounded-sm rotate-45 border border-white/5 shadow-inner" />

    <!-- Left: Engine & Mixer -->
    <div class="flex-grow flex flex-col p-8 space-y-8">
      <!-- Header Module -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl font-black italic tracking-tighter text-white uppercase">AETHER-1 <span class="text-orange-500 font-normal">Neural Studio</span></h1>
          <div class="flex items-center space-x-2">
            <div class="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#00F3FF]" />
            <span class="text-[9px] text-white/20 uppercase tracking-[0.3em]">Quantum-Bus Processor Activated</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-6">
          <DigitalRadialGauge level={0.82} label="Core Load" />
          <DigitalRadialGauge level={0.78} label="Dynamic Range" color="#00F3FF" />
        </div>
      </div>

      <!-- Waveform Analyzer -->
      <div class="glass-panel h-56 rounded-xl relative overflow-hidden flex flex-col">
        <!-- Canvas visualization -->
      </div>

      <!-- Mixer Console -->
      <div class="flex-grow flex flex-col">
        <!-- Bus controls and stem channels -->
      </div>
    </div>

    <!-- Right: AI Unit Sidebar -->
    <div class="w-full md:w-80 bg-black/40 border-l border-white/5 p-6 flex flex-col">
      <!-- AI Terminal and controls -->
    </div>
  </div>
</div>
```

## States & Interactions

### Active States

- **Playing**: Cyan glow effects and animated elements
- **Processing**: Orange progress indicators with pulse animations
- **Active Channel**: Scale transform and border glow
- **Hover States**: Subtle opacity changes and shadow effects

### Animations

```css
/* Pulse Animation */
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Neon Glow */
.neon-glow {
  animation: neon-flicker 0.5s ease-in-out infinite alternate;
}

/* Slide In */
.slide-in {
  animation: slide-in 0.3s ease-out;
}

@keyframes neon-flicker {
  0% { opacity: 0.8; filter: brightness(1); }
  100% { opacity: 1; filter: brightness(1.2); }
}
```

## Accessibility

### Key Considerations

1. **Color Contrast**: Ensure sufficient contrast between text and backgrounds
2. **Keyboard Navigation**: All interactive elements must be accessible via keyboard
3. **Screen Reader Support**: Proper ARIA labels and semantic HTML
4. **Focus Indicators**: Clear focus styles with neon glow effects
5. **Alternative Text**: All images and icons must have appropriate alt text

### Best Practices

- Use semantic HTML elements
- Provide descriptive labels for all inputs
- Ensure focus is manageable via keyboard
- Test with screen readers and accessibility tools
- Maintain sufficient color contrast ratios

## Responsive Design

### Breakpoints

- **Mobile**: Default styles (up to 768px)
- **Tablet**: md: prefix (768px and above)
- **Desktop**: lg: prefix (1024px and above)
- **Large Desktop**: xl: prefix (1280px and above)

### Responsive Layout

```css
/* Mobile: Vertical stack */
.flex-col

/* Tablet/Desktop: Horizontal layout */
md:flex-row

/* Responsive widths */
w-full md:w-3/4 md:w-1/4

/* Scrollable mixer on mobile */
.overflow-x-auto
```

## Branding Guidelines

### Logo & Identity

- **Product Name**: AETHER-1 Neural Studio
- **Tagline**: Professional drum separation studio with AI-powered assistant
- **Visual Identity**: Cyberpunk neon aesthetic with glass panel interfaces

### Tone of Voice

The UI should communicate:
- Futuristic technology
- Advanced neural processing
- Precision and accuracy
- Cutting-edge innovation

## Resources

- **Design Tool**: Figma (for mockups and prototypes)
- **CSS Framework**: Tailwind CSS v4
- **Icon Library**: Custom SVG icons with neon effects
- **Fonts**: Inter (sans-serif), JetBrains Mono (monospace)

## Version History

- **1.0.0** - Initial AETHER-1 release
  - Complete cyberpunk aesthetic transformation
  - New component architecture with digital effects
  - Enhanced visual feedback and animations
  - Improved accessibility with neon color coding

## Future Enhancements

- Additional neon color schemes
- Animated background elements
- Particle effects for processing states
- Holographic interface elements
- Enhanced AI visualization capabilities