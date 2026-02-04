# Pattern Library - BUILDWHILEBLEEDING Studio

This document outlines the pattern library for the BUILDWHILEBLEEDING Studio application. The pattern library contains reusable UI components and design patterns that can be used across the application.

## Overview

The pattern library is a collection of reusable UI components and design patterns that ensure consistency across the application. It provides guidelines for how to use these components and patterns effectively.

## Pattern Categories

### 1. Navigation Patterns

#### Main Navigation

**Purpose**: Provide access to main application sections.

**Implementation**:
```html
<nav class="main-nav">
  <ul class="nav-list">
    <li><a href="#" class="nav-link">Home</a></li>
    <li><a href="#" class="nav-link">Projects</a></li>
    <li><a href="#" class="nav-link">Settings</a></li>
  </ul>
</nav>
```

**CSS**:
```css
.main-nav {
  background: var(--color-secondary);
  padding: 0.5rem;
}

.nav-list {
  list-style: none;
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: var(--color-textlight);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
  transition: background 0.2s ease;
}

.nav-link:hover {
  background: var(--color-buttonbg);
}
```

#### Sidebar Navigation

**Purpose**: Provide access to secondary navigation options.

**Implementation**:
```html
<aside class="sidebar">
  <nav class="sidebar-nav">
    <ul class="nav-list">
      <li><a href="#" class="nav-link">Preferences</a></li>
      <li><a href="#" class="nav-link">Help</a></li>
      <li><a href="#" class="nav-link">About</a></li>
    </ul>
  </nav>
</aside>
```

**CSS**:
```css
.sidebar {
  background: var(--color-secondary);
  padding: 1rem;
  width: 200px;
  height: 100%;
}

.sidebar-nav {
  margin-top: 1rem;
}

.sidebar .nav-list {
  flex-direction: column;
  gap: 0.5rem;
}
```

### 2. Form Patterns

#### Text Input

**Purpose**: Allow users to enter text.

**Implementation**:
```html
<div class="form-group">
  <label for="username" class="form-label">Username</label>
  <input type="text" id="username" class="form-input" placeholder="Enter your username">
</div>
```

**CSS**:
```css
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-textlight);
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  background: var(--color-primary);
  border: 1px solid var(--color-buttonbg);
  border-radius: 2px;
  color: var(--color-textlight);
  font-family: var(--font-sans);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
}
```

#### File Input

**Purpose**: Allow users to upload files.

**Implementation**:
```html
<div class="form-group">
  <label for="file-upload" class="form-label">Select File</label>
  <input type="file" id="file-upload" class="form-input">
</div>
```

**CSS**:
```css
.form-input[type="file"] {
  padding: 0;
}
```

### 3. Button Patterns

#### Primary Button

**Purpose**: Used for primary actions.

**Implementation**:
```html
<button class="btn btn-primary">Submit</button>
```

**CSS**:
```css
.btn {
  padding: 0.5rem 1rem;
  border-radius: 2px;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-black);
  border: 1px solid var(--color-accent);
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}
```

#### Secondary Button

**Purpose**: Used for secondary actions.

**Implementation**:
```html
<button class="btn btn-secondary">Cancel</button>
```

**CSS**:
```css
.btn-secondary {
  background: var(--color-buttonbg);
  color: var(--color-textlight);
  border: 1px solid var(--color-buttonbg);
}

.btn-secondary:hover {
  background: var(--color-buttonhover);
}
```

#### Icon Button

**Purpose**: Used for actions with icons.

**Implementation**:
```html
<button class="btn btn-icon">
  <svg class="btn-icon-svg" width="16" height="16" viewBox="0 0 16 16">
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm1-9h-2v4H5V5H3v6h2V9h2v4h2V5z"/>
  </svg>
</button>
```

**CSS**:
```css
.btn-icon {
  padding: 0.25rem;
  min-width: auto;
  min-height: auto;
}

.btn-icon-svg {
  fill: var(--color-textlight);
}
```

### 4. Feedback Patterns

#### Alert

**Purpose**: Display important information.

**Implementation**:
```html
<div class="alert alert-info">
  <p class="alert-text">This is an informational alert.</p>
</div>
```

**CSS**:
```css
.alert {
  padding: 0.75rem;
  border-radius: 2px;
  margin-bottom: 1rem;
}

.alert-info {
  background: var(--color-info-bg);
  border-left: 4px solid var(--color-info);
}

.alert-text {
  margin: 0;
  color: var(--color-textlight);
  font-size: 0.875rem;
}
```

#### Modal

**Purpose**: Display content in a modal window.

**Implementation**:
```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">Modal Title</h2>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <p>Modal content goes here.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Submit</button>
    </div>
  </div>
</div>
```

**CSS**:
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: var(--color-primary);
  border: 1px solid var(--color-buttonbg);
  border-radius: 4px;
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-buttonbg);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-textlight);
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-textlight);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1rem;
  color: var(--color-textlight);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--color-buttonbg);
}
```

### 5. Data Visualization Patterns

#### VU Meter

**Purpose**: Display audio levels.

**Implementation**:
```html
<div class="vu-meter">
  <div class="vu-segment"></div>
  <div class="vu-segment"></div>
  <div class="vu-segment"></div>
  <div class="vu-segment"></div>
  <div class="vu-segment"></div>
</div>
```

**CSS**:
```css
.vu-meter {
  width: 10px;
  height: 80px;
  background: var(--color-primary);
  border: 1px solid var(--color-buttonbg);
  border-radius: 2px;
  display: flex;
  flex-direction: column-reverse;
  padding: 1px;
}

.vu-segment {
  width: 100%;
  height: 3px;
  margin-bottom: 1px;
  background: var(--color-buttonbg);
  border-radius: 1px;
}

.vu-segment.active {
  background: var(--color-success);
}

.vu-segment.active.warning {
  background: var(--color-warning);
}

.vu-segment.active.error {
  background: var(--color-error);
}
```

#### Oscilloscope

**Purpose**: Display audio waveform.

**Implementation**:
```html
<div class="oscilloscope">
  <canvas class="oscilloscope-canvas"></canvas>
</div>
```

**CSS**:
```css
.oscilloscope {
  width: 100%;
  height: 150px;
  background: var(--color-primary);
  border: 1px solid var(--color-buttonbg);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.oscilloscope-canvas {
  width: 100%;
  height: 100%;
}
```

### 6. Typography Patterns

#### Headings

**Purpose**: Used for section titles and headings.

**Implementation**:
```html
<h1 class="heading-1">Main Heading</h1>
<h2 class="heading-2">Secondary Heading</h2>
<h3 class="heading-3">Tertiary Heading</h3>
```

**CSS**:
```css
.heading-1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-textlight);
  margin-bottom: 1rem;
}

.heading-2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-textlight);
  margin-bottom: 0.75rem;
}

.heading-3 {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-textlight);
  margin-bottom: 0.5rem;
}
```

#### Body Text

**Purpose**: Used for paragraph text.

**Implementation**:
```html
<p class="body-text">This is a paragraph of body text.</p>
```

**CSS**:
```css
.body-text {
  font-size: 0.875rem;
  color: var(--color-textlight);
  line-height: 1.5;
  margin-bottom: 1rem;
}
```

#### Terminal Text

**Purpose**: Used for technical information in the AI processor.

**Implementation**:
```html
<pre class="terminal-text">[AI] > Hello, how can I assist you today?</pre>
```

**CSS**:
```css
.terminal-text {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  color: var(--color-textlight);
  line-height: 1.4;
  margin: 0;
}
```

### 7. Layout Patterns

#### Container

**Purpose**: Wrap content for consistent spacing.

**Implementation**:
```html
<div class="container">
  <!-- Content -->
</div>
```

**CSS**:
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

#### Section

**Purpose**: Group related content.

**Implementation**:
```html
<section class="section">
  <h2 class="section-title">Section Title</h2>
  <!-- Content -->
</section>
```

**CSS**:
```css
.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-textlight);
  margin-bottom: 1rem;
}
```

#### Grid

**Purpose**: Create responsive grid layouts.

**Implementation**:
```html
<div class="grid grid-2">
  <div class="grid-item">Item 1</div>
  <div class="grid-item">Item 2</div>
  <div class="grid-item">Item 3</div>
  <div class="grid-item">Item 4</div>
</div>
```

**CSS**:
```css
.grid {
  display: grid;
  gap: 1rem;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

### 8. Card Patterns

#### Info Card

**Purpose**: Display information in a card format.

**Implementation**:
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p class="card-text">Card content goes here.</p>
  </div>
</div>
```

**CSS**:
```css
.card {
  background: var(--color-secondary);
  border: 1px solid var(--color-buttonbg);
  border-radius: 2px;
  padding: 1rem;
}

.card-header {
  margin-bottom: 0.75rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-textlight);
}

.card-body {
  color: var(--color-textlight);
}

.card-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}
```

#### Action Card

**Purpose**: Display interactive content in a card format.

**Implementation**:
```html
<div class="card card-action">
  <div class="card-header">
    <h3 class="card-title">Action Card</h3>
  </div>
  <div class="card-body">
    <p class="card-text">This card contains an action.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Take Action</button>
  </div>
</div>
```

**CSS**:
```css
.card-action {
  border: 1px solid var(--color-accent);
}

.card-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-buttonbg);
}
```

### 9. Animation Patterns

#### Pulse

**Purpose**: Create a pulsing animation effect.

**Implementation**:
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Ping

**Purpose**: Create a ping animation effect.

**Implementation**:
```css
@keyframes ping {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.ping {
  animation: ping 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Slide In

**Purpose**: Create a slide-in animation effect.

**Implementation**:
```css
@keyframes slide-in {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slide-in 0.3s ease-out;
}
```

### 10. Responsive Patterns

#### Hidden on Mobile

**Purpose**: Hide elements on mobile devices.

**Implementation**:
```html
<div class="hidden-mobile">This content is hidden on mobile.</div>
```

**CSS**:
```css
@media (max-width: 767px) {
  .hidden-mobile {
    display: none;
  }
}
```

#### Visible on Mobile

**Purpose**: Show elements only on mobile devices.

**Implementation**:
```html
<div class="visible-mobile">This content is visible only on mobile.</div>
```

**CSS**:
```css
.visible-mobile {
  display: block;
}

@media (min-width: 768px) {
  .visible-mobile {
    display: none;
  }
}
```

## Pattern Usage Guidelines

### Accessibility

**Guideline**: Ensure all patterns are accessible.

**Implementation**:
- Use semantic HTML
- Provide meaningful labels
- Ensure sufficient color contrast
- Make all functionality accessible via keyboard

### Responsiveness

**Guideline**: Ensure all patterns are responsive.

**Implementation**:
- Use flexible layouts
- Test on different screen sizes
- Use media queries for responsive design

### Consistency

**Guideline**: Maintain consistency across the application.

**Implementation**:
- Use the same patterns in similar situations
- Follow design system guidelines
- Maintain consistent spacing and styling

## Pattern Version History

### Version 1.0 (Initial Release)

**Patterns Added**:
- Navigation patterns
- Form patterns
- Button patterns
- Feedback patterns
- Data visualization patterns
- Typography patterns
- Layout patterns
- Card patterns
- Animation patterns
- Responsive patterns

**Design**:
- Dark theme with orange accents
- Brushed metal and wood textures
- Technical typography
- Real-time visualization

## Future Enhancements

### Advanced Patterns

**Vision**: Add more advanced patterns.

**Key Features**:
- More complex data visualization patterns
- Advanced animation patterns
- Responsive grid patterns
- Customizable card patterns

**Implementation**:
```tsx
// Advanced data visualization component
const AdvancedVisualization: React.FC<{ data: any }> = ({ data }) => {
  // Implementation
};

// Customizable card component
const CustomizableCard: React.FC<{ config: any }> = ({ config }) => {
  // Implementation
};
```

### Testing and Validation

**Vision**: Improve testing and validation.

**Key Features**:
- Automated testing of patterns
- Visual regression testing
- Cross-browser testing
- User testing with diverse user groups

**Implementation**:
```markdown
# Pattern Testing Plan

## Test Scenarios
1. Navigation patterns
2. Form patterns
3. Button patterns
4. Feedback patterns
5. Data visualization patterns
6. Typography patterns
7. Layout patterns
8. Card patterns
9. Animation patterns
10. Responsive patterns

## Metrics Measured
- Accessibility
- Responsiveness
- Consistency
- Usability

## Test Participants
- Audio engineers
- Music producers
- UI/UX designers
- Developers
```

## Resources

### Pattern Libraries

- **Material Design**: UI components and guidelines
- **Ant Design**: Enterprise design system
- **Bootstrap**: Responsive design framework

### Design Tools

- **Figma**: Prototyping and design collaboration
- **Sketch**: Vector editing and design
- **Adobe XD**: Prototyping and design systems

### Testing Tools

- **UserTesting**: User testing platform
- **Lookback**: Remote user testing
- **Optimal Workshop**: Usability testing tools

## Version History

- **1.0.0** - Initial pattern library release
  - Basic navigation, form, and button patterns
  - Data visualization and typography patterns
  - Layout, card, and animation patterns
  - Responsive design patterns
  - Accessibility guidelines
  - Testing and validation strategy