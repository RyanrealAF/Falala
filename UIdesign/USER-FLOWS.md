# User Flow Diagrams - BUILDWHILEBLEEDING Studio

This document outlines the main user flows and interactions within the BUILDWHILEBLEEDING Studio application.

## Overview

The application is designed for audio engineers to separate and mix drum stems from master audio files, with the assistance of an AI processor. The main workflows revolve around audio file management, stem separation, mixing, and AI interaction.

## Main User Flows

### 1. Audio File Upload Flow

```mermaid
graph TD
    A[Application Loads] --> B{File Uploaded?}
    B -->|No| C[Show 'No reel loaded' message]
    B -->|Yes| D[Display file name and playback controls]
    
    C --> E[Click 'LOAD MASTER REEL' button]
    E --> F[Open file picker dialog]
    F --> G[Select audio file]
    G --> H[File loads and audio context initializes]
    H --> I[Display file name and playback controls]
    
    I --> J[Click 'PLAY' button]
    J --> K[Audio starts playing]
    K --> L[Waveform visualizes in oscilloscope]
    L --> M[VU meters respond to audio levels]
    
    I --> N[Click 'STOP' button]
    N --> O[Audio stops]
    O --> P[Waveform and VU meters stop]
    
    I --> Q[Click 'EJECT' button]
    Q --> R[File is removed]
    R --> C
```

### 2. Audio Processing Flow

```mermaid
graph TD
    A[File Uploaded and Loaded] --> B[Click 'DE-MIX MASTER TO MULTI-TRACK' button]
    B --> C[Processing starts]
    C --> D[Show processing progress bar]
    D --> E[Status updates: 'Decoding stems...']
    E --> F[Processing completes]
    F --> G[Show 'De-mixing complete' status]
    G --> H[Enable mixing controls]
```

### 3. Mixing Console Flow

```mermaid
graph TD
    A[Stems Decoded] --> B[Display mixing console sections]
    B --> C[Drum Bus section active]
    C --> D[Kick channel with VU meter and fader]
    C --> E[Snare channel with VU meter and fader]
    C --> F[High-hat channel with VU meter and fader]
    C --> G[Overheads channel with VU meter and fader]
    
    B --> H[Aux Bus section active]
    H --> I[Vocal channel with VU meter and fader]
    H --> J[Bass channel with VU meter and fader]
    H --> K[Other channel with VU meter and fader]
    
    D --> L[Adjust Kick fader]
    L --> M[Volume level updates]
    M --> N[VU meter responds]
    
    E --> O[Adjust Snare fader]
    O --> P[Volume level updates]
    P --> Q[VU meter responds]
    
    I --> R[Adjust Vocal fader]
    R --> S[Volume level updates]
    S --> T[VU meter responds]
```

### 4. AI Assistant Text Command Flow

```mermaid
graph TD
    A[Terminal Ready] --> B[Type command in input field]
    B --> C[Press Enter or click 'EXEC' button]
    C --> D[Command sent to AI processor]
    D --> E[Show user message in terminal]
    E --> F[AI processes command]
    F --> G[Display AI response in terminal]
    
    G --> H[Command execution complete]
    H --> I[System status updated]
```

### 5. AI Assistant Voice Command Flow

```mermaid
graph TD
    A[Voice button inactive] --> B[Click voice command button]
    B --> C[Button animates with pulse effect]
    C --> D[Mic access requested]
    D --> E{Mic access granted?}
    E -->|No| F[Show VOX ERROR status]
    E -->|Yes| G[Recording starts for 3 seconds]
    G --> H[Recording stops automatically]
    H --> I[Speech processed]
    I --> J[Show AI response in terminal]
    J --> K[System status updated]
```

### 6. System Status Flow

```mermaid
graph TD
    A[Application Loads] --> B[Show 'System Idle' status]
    B --> C{User Actions}
    
    C -->|No reel loaded| D[Display red status indicator]
    C -->|File loading| E[Display 'Tape loaded' status]
    C -->|Audio loaded| F[Display green status indicator]
    C -->|Playing| G[Display 'Ready for tracking' status]
    C -->|Processing| H[Display 'Decoding stems...' status]
    C -->|Voice active| I[Display 'VOX COMMS ACTIVE' status]
    
    I --> J[Show VOX ERROR if mic denied]
    H --> K[Show 'De-mixing complete' when finished]
    G --> L[Show 'STOP' button active]
```

### 7. Audio Visualization Flow

```mermaid
graph TD
    A[Audio Not Loaded] --> B[Show 'NO SIGNAL DETECTED' message]
    B --> C[User loads audio file]
    C --> D[Audio context initializes]
    D --> E[Canvas visualization starts]
    
    E --> F[Draw waveform in real-time]
    F --> G[Calculate RMS level]
    G --> H[Update master level state]
    H --> I[Update VU meters for each channel]
    I --> F
    
    C --> J[User clicks 'PLAY']
    J --> K[Audio starts playing]
    K --> L[Waveform visualization active]
    
    L --> M[User clicks 'STOP']
    M --> N[Audio stops]
    N --> O[Waveform stops, master level = 0]
```

## Detailed Workflow Descriptions

### Audio File Management

**Purpose**: Allow users to load and manage audio files for processing

**Steps**:
1. User clicks "LOAD MASTER REEL" button
2. File picker dialog opens
3. User selects audio file (MP3, WAV, etc.)
4. File is loaded into audio context
5. Playback controls become available
6. User can play, pause, or eject the file

**Key States**:
- No reel loaded
- Loading
- Loaded and ready
- Playing
- Stopped

### Stem Separation

**Purpose**: Process audio file to extract individual stems

**Steps**:
1. User loads and audio file
2. User clicks "DE-MIX MASTER TO MULTI-TRACK" button
3. Processing progress indicator appears
4. System decodes and separates stems
5. Mixing console becomes active
6. Stems are ready for mixing

**Key States**:
- Inactive (no file loaded)
- Loading stems
- Stems available
- Processing in progress

### Mixing Control

**Purpose**: Adjust levels of individual stems

**Steps**:
1. Stems are available after separation
2. User interacts with vertical faders
3. Fader value updates volume for that stem
4. VU meter reflects new level
5. Volume changes apply real-time to audio

**Key States**:
- Controls disabled (file not processed)
- Controls enabled (stems available)
- Active adjustment

### AI Assistant Interaction

**Purpose**: Provide intelligent assistance for audio engineering tasks

**Text Command Steps**:
1. User types command in input field
2. User presses Enter or clicks "EXEC"
3. Command is sent to AI processor
4. AI generates response
5. Terminal displays conversation history

**Voice Command Steps**:
1. User clicks voice command button
2. System requests microphone access
3. User speaks command (3 second limit)
4. Voice is processed
5. AI generates response
6. Terminal displays conversation history

### System Monitoring

**Purpose**: Provide real-time system status information

**Status Messages**:
- System Idle
- No reel loaded
- Tape loaded
- Ready for tracking
- Decoding stems
- De-mixing complete
- VOX COMMS ACTIVE
- VOX ERROR

**Indicator Colors**:
- Green: Active/ready
- Red: Inactive/error
- Orange: Processing

## Error Handling Flows

### File Upload Errors

```mermaid
graph TD
    A[File selected] --> B{File type valid?}
    B -->|Yes| C[File loaded successfully]
    B -->|No| D[Show invalid file type message]
    
    C --> E{Audio context initialized?}
    E -->|Yes| F[Ready for playback]
    E -->|No| G[Show 'Signal Error']
```

### Mic Access Errors

```mermaid
graph TD
    A[Voice button clicked] --> B{Mic access granted?}
    B -->|Yes| C[Recording starts]
    B -->|No| D[Show VOX ERROR status]
    D --> E[Display error in AI terminal]
```

### Audio Context Errors

```mermaid
graph TD
    A[Play button clicked] --> B{Audio context active?}
    B -->|Yes| C[Audio plays]
    B -->|No| D[Resume audio context]
    D --> E{Context resumes?}
    E -->|Yes| C
    E -->|No| F[Show audio context error]
```

## Responsive Behavior Flows

### Screen Size Adaptation

```mermaid
graph TD
    A[Application loads] --> B{Screen width > 768px?}
    B -->|Yes| C[Desktop layout: 3/4 + 1/4]
    B -->|No| D[Mobile layout: vertical stack]
    
    C --> E[Mixing console in left column]
    C --> F[AI unit and status in right column]
    
    D --> G[All sections stack vertically]
    D --> H[Mixing console adapts to single column]
```

## Accessibility Flows

### Keyboard Navigation

```mermaid
graph TD
    A[Focus on first interactive element] --> B[Tab to next element]
    B --> C[Shift+Tab to previous element]
    C --> D[Enter/Space to activate button]
    D --> E[Arrow keys for slider adjustment]
    E --> F[Escape to close modal]
```

## Performance Optimizations

### Canvas Visualization

```mermaid
graph TD
    A[Animation frame request] --> B{Audio playing?}
    B -->|Yes| C[Render waveform]
    B -->|No| D[Cancel animation request]
    
    C --> E[Update VU meters]
    E --> F[Animation complete]
    F --> A
```

## Version History

- **1.0.0** - Initial release
  - Basic user flows for audio management
  - Stem separation and mixing workflows
  - AI assistant interaction flows
  - Error handling and accessibility flows