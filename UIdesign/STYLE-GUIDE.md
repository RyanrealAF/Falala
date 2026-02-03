# UI Style Guide - BUILDWHILEBLEEDING Studio

## Overview

This style guide documents the design system for the BUILDWHILEBLEEDING Studio application - a professional drum separation studio with AI-powered assistant. The design system follows a retro-futuristic audio engineering aesthetic, inspired by classic analog mixing consoles and modern digital interfaces.

## Design Philosophy

The UI design emphasizes:
- **Professionalism**: Clear, technical interface for audio engineers
- **Authenticity**: Retro analog console aesthetic with digital capabilities
- **Functionality**: Intuitive controls for audio processing workflows
- **Visual Hierarchy**: Clear distinction between different functional areas
- **Feedback**: Real-time visual feedback for audio levels and processing

## Color Palette

### Primary Colors

```css
--color-primary: #121212;         /* Dark background */
--color-secondary: #1e1e1e;       /* Secondary dark */
--color-accent: #ff8c00;          /* Orange accent (warm, attention-grabbing) */
--color-textlight: #dcdcdc;       /* Light text */
--color-textdark: #808080;        /* Dark text */
--color-buttonbg: #333333;        /* Button background */
--color-buttonhover: #444444;     /* Button hover */
--color-success: #22c55e;         /* Success/green */
--color-warning: #eab308;         /* Warning/yellow */
--color-error: #ef4444;           /* Error/red */
--color-wood: #3d2b1f;            /* Wood texture base */
--color-metal: #2a2a2a;           /* Metal texture base */
```

### Usage Guidelines

- **Primary (#121212)**: Main background color for application
- **Secondary (#1e1e1e)**: Card and section backgrounds
- **Accent (#ff8c00)**: Important buttons, highlights, and active states
- **Success (#22c55e)**: Positive feedback, active states, audio levels
- **Warning (#eab308)**: Warning states, mid-level audio indicators
- **Error (#ef4444)**: Error states, critical alerts, high audio levels
- **Wood/Metal**: Texture colors for retro console aesthetic

## Typography

### Font Families

```css
--font-sans: "Inter", ui-sans-serif, system-ui;
--font-mono: "Roboto Mono", ui-monospace, SFMono-Regular;
```

### Usage

- **Sans-serif (Inter)**: Main UI text, headings
- **Monospace (Roboto Mono)**: Technical information, console output, AI terminal

### Font Sizes & Weights

```css
/* Headings */
.text-xl: 1.25rem (20px) - font-bold
.text-lg: 1.125rem (18px) - font-bold
.text-base: 1rem (16px) - normal

/* Body Text */
.text-sm: 0.875rem (14px) - normal
.text-[10px]: 0.625rem (10px) - normal (for console/terminal)
```

### Spacing & Layout

```css
/* Base spacing */
p-1: 0.25rem (4px)
p-2: 0.5rem (8px)
p-3: 0.75rem (12px)
p-4: 1rem (16px)
p-6: 1.5rem (24px)

/* Layout */
md:space-x-6: 1.5rem (24px) - horizontal spacing on medium screens
space-y-6: 1.5rem (24px) - vertical spacing
w-full md:w-3/4: Responsive width distribution
```

## Textures & Effects

### Brushed Metal

```css
.texture-brushed-metal {
  background: linear-gradient(
    to bottom,
    #2c2c2c 0%,
    #1a1a1a 50%,
    #2c2c2c 100%
  );
  background-size: 100% 4px;
  border: 1px solid #333;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
}
```

### Wood Panel

```css
.texture-wood-panel {
  background: linear-gradient(
    90deg,
    #3d2b1f 0%,
    #4a3426 20%,
    #3d2b1f 40%,
    #5c4033 60%,
    #3d2b1f 80%,
    #4a3426 100%
  );
  border: 2px solid #2a1d15;
  box-shadow: 0 4px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1);
}
```

### Studio Border

```css
.studio-border {
  border: 1px solid #000;
  box-shadow: 1px 1px 0 rgba(255,255,255,0.05), inset 1px 1px 2px rgba(0,0,0,0.5);
}
```

## Components

### Buttons

#### Primary Button (Accent)

```html
<button class="px-8 py-3 bg-accent hover:bg-orange-400 text-black font-bold studio-border rounded-sm transition-all">
  Action
</button>
```

#### Secondary Button (Dark)

```html
<button class="px-6 py-2 bg-buttonbg hover:bg-error text-textlight font-bold studio-border rounded-sm">
  Action
</button>
```

#### Play/Stop Button

```html
<button class="px-6 py-2 ${isPlaying ? 'bg-error' : 'bg-success'} text-black font-black studio-border rounded-sm transition-colors">
  ${isPlaying ? 'STOP' : 'PLAY'}
</button>
```

### Inputs

#### File Input

```html
<input type="file" accept="audio/*" className="hidden" id="audio-upload" />
<label for="audio-upload" className="px-8 py-3 bg-buttonbg hover:bg-accent hover:text-black border border-white/10 text-textlight font-bold rounded-sm cursor-pointer transition-all duration-200">
  LOAD MASTER REEL
</label>
```

#### Text Input

```html
<input type="text" className="bg-transparent border-none outline-none text-[10px] text-success flex-grow px-2" />
```

#### Studio Fader (Vertical Slider)

```html
<input type="range" min="0" max="100" value={value} 
       className="studio-fader h-32" style={{ appearance: 'slider-vertical' }} />
```

### VU Meters

```html
<div class="vu-meter-container mx-2">
  <!-- 15 segments -->
  <div class="vu-segment vu-segment-red active"></div>
  <!-- ... more segments ... -->
</div>
```

### Screws

```html
<div class="screw ${className}"></div>
```

## Layout Structure

### Main Application Layout

```html
<div class="flex flex-col md:flex-row flex-grow w-full max-w-screen-2xl mx-auto p-6 md:space-x-6 bg-primary font-mono">
  <!-- Left Panel: Studio Console Stacks -->
  <div class="flex flex-col w-full md:w-3/4 space-y-6">
    <!-- Tape Deck Section -->
    <!-- Mixer Console Section -->
    <!-- Oscilloscope / Waveform -->
  </div>
  
  <!-- Right Panel: Rack Mount Gear -->
  <div class="flex flex-col w-full md:w-1/4 space-y-6">
    <!-- Rack AI Unit -->
    <!-- System Status Rack -->
  </div>
</div>
```

## States & Interactions

### Loading/Processing State

```html
<div class="w-full bg-black h-2 mb-2 rounded-full overflow-hidden border border-white/10">
  <div class="bg-accent h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
</div>
```

### Active States

- **Playing**: Green button background
- **Recording**: Red button background with pulse animation
- **Active Segment**: Brighter color with glow effect
- **Hover**: Lighter button background

### Animations

```css
/* Pulse Animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Ping Animation */
.animate-ping {
  animation: ping 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Accessibility

### Key Considerations

1. **Color Contrast**: Ensure sufficient contrast between text and backgrounds
2. **Keyboard Navigation**: All interactive elements must be accessible via keyboard
3. **Screen Reader Support**: Proper ARIA labels and semantic HTML
4. **Focus Indicators**: Clear focus styles for interactive elements
5. **Alternative Text**: All images and icons must have appropriate alt text

### Best Practices

- Use semantic HTML elements
- Provide descriptive labels for all inputs
- Ensure focus is manageable via keyboard
- Test with screen readers and accessibility tools

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
```

## Branding Guidelines

### Logo & Identity

- **Product Name**: BUILDWHILEBLEEDING Studio
- **Tagline**: Professional drum separation studio with AI-powered assistant
- **Visual Identity**: Retro analog console aesthetic with modern digital capabilities

### Tone of Voice

The UI should communicate:
- Professionalism
- Technical expertise
- Reliability
- Innovation

## Resources

- **Design Tool**: Figma (for mockups and prototypes)
- **CSS Framework**: Tailwind CSS v4
- **Icon Library**: Custom SVG icons (if needed)
- **Fonts**: Inter (sans-serif), Roboto Mono (monospace)

## Version History

- **1.0.0** - Initial release (current)
  - Analog tape interface section
  - Mixing console with VU meters and faders
  - Oscilloscope waveform visualization
  - AI processor with terminal interface
  - System status monitoring

## Future Enhancements

- Additional audio visualization types
- Expanded AI assistant capabilities
- Custom theme support
- Enhanced accessibility features