
# UI Style Guide - BUILDWHILEBLEEDING Studio

## Overview

The "Master Console" aesthetic transitions from a software dashboard to high-fidelity boutique hardware. It emphasizes physicality, depth, and focused control.

## Design Philosophy

- **Physicality**: Use recessed panels, inner shadows, and real material textures (wood, brushed metal).
- **Tube Warmth**: Active elements should emit a soft amber glow (#ff8c00 at low opacity).
- **Authentic Labeling**: Use "Masking Tape" elements with monospace handwritten fonts for track labels.
- **Contextual Focus**: Hide advanced settings behind physical "Flip Switches" or within dedicated modules to reduce clutter.

## Color Palette Refinement

```css
--color-primary: #0a0a0a;         /* Deep studio black */
--color-wood-frame: #2d1b0f;      /* Mahogany/Walnut rack frame */
--color-metal-panel: #222222;     /* Brushed aluminum gear face */
--color-tape-beige: #f5f5dc;      /* Masking tape for track labeling */
--color-tube-glow: #ff8c00;       /* Amber warmth */
```

## Key Components

### The Boutique Strip
A vertical hardware module containing:
- Mini VU Meter (LED style).
- Masking Tape label.
- High-fidelity motor-style fader.
- Signal LED indicator.

### The Drum Map
A minimalist schematic view of a drum kit used for contextual selection, replacing standard text buttons for drum channels.

### Analog Voltage Meter
Circular needle-based meters for "Power" and "System Health" instead of progress bars where appropriate.

## Visual Effects

### Recessed Panel
Use `inset` box shadows to create the feeling that control plates are mounted inside the wood frame.
```css
box-shadow: inset 4px 4px 12px rgba(0,0,0,0.9);
```

### Tube Glow
Subtle Gaussian blurs behind active controls.
```css
box-shadow: 0 0 20px 2px rgba(255, 140, 0, 0.25);
```
