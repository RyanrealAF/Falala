# Accessibility Guidelines - BUILDWHILEBLEEDING Studio

This document provides accessibility guidelines for the BUILDWHILEBLEEDING Studio application, ensuring the interface is usable by all users, including those with disabilities.

## Overview

The application should comply with WCAG 2.1 AA standards, providing a robust and accessible experience for all users. Accessibility considerations are integrated into all aspects of the UI design and development.

## Key Accessibility Principles

### 1. Perceivability

**Guideline 1.1 - Text Alternatives**: Provide text alternatives for non-text content

- **Images & Icons**: All images and icons must have appropriate alt text
- **Decorative Elements**: Use `alt=""` for purely decorative elements
- **Canvas Visualization**: Provide descriptive text about what's being visualized

### 2. Operability

**Guideline 2.1 - Keyboard Accessible**: Make all functionality available from a keyboard

- **Tab Order**: All interactive elements must be reachable via tab key
- **Focus Indicators**: Clear visual feedback for focused elements
- **Keyboard Shortcuts**: Provide accessible keyboard shortcuts

### 3. Understandability

**Guideline 3.1 - Readable**: Make text content readable and understandable

- **Text Contrast**: Ensure sufficient contrast between text and backgrounds
- **Language**: Declare page language in HTML
- **Error Handling**: Provide clear error messages and instructions

### 4. Robustness

**Guideline 4.1 - Compatible**: Maximize compatibility with current and future user agents

- **Semantic HTML**: Use appropriate HTML elements for their intended purpose
- **ARIA Attributes**: Use ARIA attributes to enhance accessibility
- **Validation**: Ensure HTML and CSS are valid

## Accessibility Implementation Details

### Semantic HTML

```html
<!-- Use semantic HTML elements -->
<main role="main" aria-label="Audio mixing console">
  <section role="region" aria-label="Tape deck interface">
    <!-- Content -->
  </section>
  
  <section role="region" aria-label="Mixing console">
    <!-- Content -->
  </section>
  
  <section role="region" aria-label="AI processor">
    <!-- Content -->
  </section>
</main>
```

### Focus Management

```css
/* Ensure all focusable elements have visible focus */
*:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Improve focus styles for interactive elements */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Keyboard Navigation

```typescript
// Add keyboard event listeners
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    // Handle activation
  }
  
  if (e.key === 'Escape') {
    // Handle dismissal
  }
  
  if (e.key.startsWith('Arrow')) {
    // Handle arrow key navigation
  }
};
```

### Screen Reader Support

```html
<!-- Add ARIA labels and roles -->
<button 
  aria-label="Play audio"
  aria-pressed="false"
  role="button"
  tabIndex="0"
>
  PLAY
</button>

<!-- Provide descriptive labels -->
<input 
  type="range" 
  aria-label="Kick volume"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="75"
  aria-valuetext="75%"
>
```

### Color Contrast

```css
/* Ensure text has sufficient contrast */
:root {
  --text-primary: #dcdcdc; /* Light text */
  --text-secondary: #808080; /* Dark text */
  --background: #121212; /* Background */
  
  /* Meets WCAG 2.1 AA standards */
  /* Primary text: 19.53:1 contrast */
  /* Secondary text: 10.02:1 contrast */
}
```

### Error Handling

```typescript
// Provide accessible error messages
const handleFileUploadError = () => {
  const errorMessage = 'Invalid audio file. Please select a valid audio format.';
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
  }
};
```

### Animation Considerations

```css
/* Reduce motion for users with vestibular disorders */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility Testing

### Automated Testing

```bash
# Using axe DevTools
npm install @axe-core/react

# Using Lighthouse
npm install lighthouse
```

### Manual Testing

- **Keyboard Navigation**: Test all functionality with tab key
- **Screen Reader Testing**: Test with NVDA, VoiceOver, or JAWS
- **Zoom Testing**: Test at 200% zoom level
- **High Contrast Testing**: Test in high contrast modes

### Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Specific Component Accessibility

### VU Meters

```tsx
// Accessible VU meter component
const VUMeter: React.FC<{ level: number }> = ({ level }) => {
  const segments = Array.from({ length: 15 }, (_, i) => i);
  const activeLevel = Math.floor(level * segments.length);

  return (
    <div 
      className="vu-meter-container mx-2"
      role="progressbar"
      aria-label="Volume level indicator"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={Math.round(level * 100)}
    >
      {segments.map((s) => {
        const isActive = s < activeLevel;
        let colorClass = 'vu-segment-green';
        if (s > 10) colorClass = 'vu-segment-red';
        else if (s > 7) colorClass = 'vu-segment-yellow';

        return (
          <div
            key={s}
            className={`vu-segment ${colorClass} ${isActive ? 'active' : ''}`}
            role="presentation"
          />
        );
      })}
    </div>
  );
};
```

### Studio Faders

```tsx
// Accessible studio fader component
const StudioFader: React.FC<{ 
  value: number; 
  onChange: (value: number) => void; 
  label: string;
}> = ({ value, onChange, label }) => {
  return (
    <div className="flex flex-col items-center">
      <label className="text-[10px] font-black text-textlight mb-3 uppercase tracking-widest">
        {label}
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="studio-fader h-32"
        style={{ appearance: 'slider-vertical' } as any}
        aria-label={`${label} volume`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={value}
        aria-valuetext={`${value}%`}
      />
      <span className="text-[10px] text-accent mt-3 bg-black px-2">{value}%</span>
    </div>
  );
};
```

### Voice Command Button

```tsx
// Accessible voice command button
const VoiceCommandButton: React.FC<{ 
  isRecording: boolean; 
  onClick: () => void;
}> = ({ isRecording, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-full texture-brushed-metal studio-border flex items-center justify-center hover:shadow-[0_0_15px_#ff8c00] transition-all group active:translate-y-1"
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      aria-pressed={isRecording}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-accent animate-ping' : 'bg-error animate-pulse'} shadow-[0_0_5px_currentColor]`}></div>
    </button>
  );
};
```

## Accessibility Checklist

### General

- [ ] All interactive elements are accessible via keyboard
- [ ] Focus is properly managed
- [ ] Sufficient color contrast
- [ ] Semantic HTML is used
- [ ] ARIA attributes are used appropriately
- [ ] All images have alt text
- [ ] Links have discernible text

### Forms

- [ ] All form controls have labels
- [ ] Error messages are accessible
- [ ] Required fields are clearly marked
- [ ] Help text is provided

### Navigation

- [ ] Clear navigation structure
- [ ] Skip to main content link
- [ ] Breadcrumb navigation (if applicable)
- [ ] Consistent navigation across pages

### Media

- [ ] Audio and video controls are accessible
- [ ] Closed captions are available (if applicable)
- [ ] Transcripts are available (if applicable)

## Future Enhancements

### Advanced Accessibility Features

- Voice control for all functionality
- Screen reader-specific instructions
- Customizable interface for users with specific needs
- Enhanced keyboard shortcuts

### Testing and Validation

- Automated accessibility testing in CI/CD pipeline
- Regular manual accessibility audits
- User testing with diverse user groups

## Version History

- **1.0.0** - Initial accessibility guidelines
  - Basic accessibility principles
  - Component-specific accessibility
  - Testing and validation strategy
  - Accessibility checklist