import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

// --- Main App Component ---
const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<string>('Idle');
  const [messages, setMessages] = useState<{ type: 'user' | 'ai'; content: string }[]>([]);
  const [currentInputTranscription, setCurrentInputTranscription] = useState<string>('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState<string>('');
  
  // Drum Separation State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  // Mixer State
  const [kickVolume, setKickVolume] = useState(75);
  const [snareVolume, setSnareVolume] = useState(75);
  const [hiHatVolume, setHiHatVolume] = useState(75);
  const [overheadsVolume, setOverheadsVolume] = useState(75);
  
  // Audio Context
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementSourceNode | null>(null);
  const gainNodesRef = useRef<{[key: string]: GainNode}>({});
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file);
      setPipelineStatus('Audio file uploaded. Loading...');
      loadAudioFile(file);
    }
  };

  const loadAudioFile = async (file: File) => {
    try {
      // Create audio context if not already created
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Create audio element
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.controls = false;
      audio.preload = 'auto';
      
      // Create audio source node
      const source = audioContextRef.current.createMediaElementSource(audio);
      audioSourceRef.current = source;
      
      // Create gain nodes for each drum channel
      const kickGain = audioContextRef.current.createGain();
      const snareGain = audioContextRef.current.createGain();
      const hiHatGain = audioContextRef.current.createGain();
      const overheadsGain = audioContextRef.current.createGain();
      
      gainNodesRef.current = {
        kick: kickGain,
        snare: snareGain,
        hiHat: hiHatGain,
        overheads: overheadsGain
      };
      
      // Set initial volumes (convert 0-100 to 0-1)
      kickGain.gain.value = kickVolume / 100;
      snareGain.gain.value = snareVolume / 100;
      hiHatGain.gain.value = hiHatVolume / 100;
      overheadsGain.gain.value = overheadsVolume / 100;
      
      // Connect nodes (simple pass-through for now)
      source.connect(kickGain);
      source.connect(snareGain);
      source.connect(hiHatGain);
      source.connect(overheadsGain);
      
      kickGain.connect(audioContextRef.current.destination);
      snareGain.connect(audioContextRef.current.destination);
      hiHatGain.connect(audioContextRef.current.destination);
      overheadsGain.connect(audioContextRef.current.destination);
      
      setAudioLoaded(true);
      setPipelineStatus('Audio loaded. Ready to process.');
    } catch (error) {
      console.error('Error loading audio file:', error);
      setPipelineStatus('Error loading audio file');
    }
  };

  const processSeparation = () => {
    if (!uploadedFile || !audioLoaded) return;
    
    setIsProcessing(true);
    setPipelineStatus('Processing drum separation...');
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setPipelineStatus('Drum separation complete!');
    }, 2000);
  };

  const handleVolumeChange = (drum: string, value: number) => {
    const volume = parseInt(value);
    const gainNode = gainNodesRef.current[drum.toLowerCase()];
    
    if (gainNode) {
      gainNode.gain.value = volume / 100;
    }
    
    // Update state
    switch (drum) {
      case 'Kick':
        setKickVolume(volume);
        break;
      case 'Snare':
        setSnareVolume(volume);
        break;
      case 'Hi-Hat':
        setHiHatVolume(volume);
        break;
      case 'Overheads':
        setOverheadsVolume(volume);
        break;
    }
  };

  const startRecording = async () => {
    if (isRecording) return;

    setPipelineStatus('AI Voice Assistant is currently unavailable');
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');
    setMessages([]);
    
    setMessages([
      { 
        type: 'ai', 
        content: 'AI Voice Assistant is currently unavailable. Please use the drum separation and mixer features.' 
      }
    ]);
  };

  const stopAudioProcessing = useCallback(() => {
    // Cleanup audio resources
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  }, []);

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setPipelineStatus('Stopping session...');
    stopAudioProcessing();
  };

  useEffect(() => {
    return () => {
      stopAudioProcessing();
    };
  }, [stopAudioProcessing]);

  return (
    <div className="flex flex-col md:flex-row flex-grow w-full max-w-screen-2xl mx-auto p-4 md:space-x-4">
      {/* Left Panel: Drum Separation, Mixer, Waveform */}
      <div className="flex flex-col w-full md:w-1/2 space-y-4 mb-4 md:mb-0">
        {/* Drum Separation Module */}
        <section className="bg-secondary p-6 rounded-lg shadow-xl flex-grow">
          <h2 className="text-2xl font-bold text-accent mb-4">Drum Separation</h2>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-textdark p-8 rounded-md h-48">
            {!uploadedFile ? (
              <>
                <p className="text-lg text-textdark mb-4">Upload a drum track for separation</p>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  id="audio-upload"
                  aria-label="Upload audio file"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="audio-upload"
                  className="px-5 py-2 bg-buttonbg hover:bg-buttonhover text-textlight font-semibold rounded-lg cursor-pointer transition-colors duration-200"
                >
                  Choose File
                </label>
              </>
            ) : (
              <>
                <p className="text-lg text-textdark mb-4">{uploadedFile.name}</p>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="px-5 py-2 bg-error hover:bg-red-700 text-textlight font-semibold rounded-lg transition-colors duration-200"
                >
                  Remove File
                </button>
              </>
            )}
          </div>
          <button
            onClick={processSeparation}
            disabled={!uploadedFile || isProcessing}
            className={`mt-4 w-full px-5 py-2 font-semibold rounded-lg transition-colors duration-200 ${
              !uploadedFile || isProcessing
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-buttonbg hover:bg-buttonhover text-textlight'
            }`}
            aria-label="Process Drum Separation"
          >
            {isProcessing ? 'Processing...' : 'Process Separation'}
          </button>
        </section>

        {/* Mixer Module */}
        <section className="bg-secondary p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-accent mb-4">Mixer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Kick', 'Snare', 'Hi-Hat', 'Overheads'].map(drum => (
              <div key={drum} className="flex flex-col items-center">
                <label htmlFor={`slider-${drum.toLowerCase()}`} className="text-textlight mb-2">
                  {drum}
                </label>
                <input
                  type="range"
                  id={`slider-${drum.toLowerCase()}`}
                  min="0"
                  max="100"
                  value={
                    drum === 'Kick' ? kickVolume :
                    drum === 'Snare' ? snareVolume :
                    drum === 'Hi-Hat' ? hiHatVolume : overheadsVolume
                  }
                  onChange={(e) => handleVolumeChange(drum, e.target.value)}
                  className="w-full h-2 bg-textdark rounded-lg appearance-none cursor-pointer accent-accent"
                  aria-label={`${drum} volume slider`}
                />
                <span className="text-sm text-textdark mt-1">{
                  drum === 'Kick' ? kickVolume :
                  drum === 'Snare' ? snareVolume :
                  drum === 'Hi-Hat' ? hiHatVolume : overheadsVolume
                }%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Waveform Display */}
        <section className="bg-secondary p-6 rounded-lg shadow-xl flex-grow">
          <h2 className="text-2xl font-bold text-accent mb-4">Waveform Display</h2>
          <div
            className="w-full h-48 bg-gray-700 rounded-md flex items-center justify-center text-textdark italic"
            aria-label="Audio waveform visualization area"
          >
            {audioLoaded ? (
              <div className="w-full h-full flex items-center justify-center">
                <canvas className="w-full h-full bg-black"></canvas>
              </div>
            ) : (
              'No audio loaded'
            )}
          </div>
        </section>
      </div>

      {/* Right Panel: AI Voice Conversation, Pipeline Status */}
      <div className="flex flex-col w-full md:w-1/2 space-y-4">
        {/* AI Voice Conversation Module */}
        <section className="bg-secondary p-6 rounded-lg shadow-xl flex-grow">
          <h2 className="text-2xl font-bold text-accent mb-4">AI Voice Assistant</h2>
          <div className="flex flex-col h-full max-h-80 overflow-y-auto mb-4 bg-primary p-4 rounded-md border border-textdark">
            {messages.length === 0 && (
              <p className="text-textdark italic text-center">AI Voice Assistant is currently unavailable</p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                  msg.type === 'user' ? 'bg-buttonbg self-end' : 'bg-gray-700 self-start'
                }`}
                role="status"
                aria-live="polite"
              >
                <span className="font-bold capitalize">{msg.type}: </span>
                {msg.content}
              </div>
            ))}
            {currentInputTranscription && (
              <div className="mb-2 p-2 rounded-lg max-w-[80%] bg-buttonbg self-end animate-pulse" role="status" aria-live="polite">
                <span className="font-bold">You (transcribing): </span>
                {currentInputTranscription}
              </div>
            )}
            {currentOutputTranscription && (
              <div className="mb-2 p-2 rounded-lg max-w-[80%] bg-gray-700 self-start animate-pulse" role="status" aria-live="polite">
                <span className="font-bold">AI (transcribing): </span>
                {currentOutputTranscription}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-auto p-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300 shadow-lg ${
                isRecording
                  ? 'bg-error hover:bg-red-700 animate-pulse'
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
              disabled={!isRecording}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-textlight"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </section>

        {/* Pipeline Status Module */}
        <section className="bg-secondary p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-accent mb-4">Pipeline Status</h2>
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isRecording ? 'bg-success' : 'bg-textdark'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isRecording ? 'bg-success' : 'bg-textdark'
                }`}
              ></span>
            </span>
            <p className="text-lg text-textlight" aria-live="polite">
              {pipelineStatus}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Render the App ---
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element to mount the React application.');
}