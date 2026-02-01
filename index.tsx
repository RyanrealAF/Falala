import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// --- Audio Helper Functions (from guidelines) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- API Key Checker Component ---
interface ApiKeyCheckerProps {
  children: React.ReactNode;
}

const ApiKeyChecker: React.FC<ApiKeyCheckerProps> = ({ children }) => {
  const [hasKeySelected, setHasKeySelected] = useState<boolean | null>(null);
  const [loadingKeyCheck, setLoadingKeyCheck] = useState(true);

  const checkApiKey = useCallback(async () => {
    try {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKeySelected(selected);
    } catch (error) {
      console.error('Error checking API key:', error);
      setHasKeySelected(false);
    } finally {
      setLoadingKeyCheck(false);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = useCallback(async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success after opening dialog, as per guidelines
      setHasKeySelected(true);
      setLoadingKeyCheck(false);
    } catch (error) {
      console.error('Error opening key selection dialog:', error);
      // If dialog opening fails, re-check key or keep prompt visible
      setHasKeySelected(false);
      setLoadingKeyCheck(false);
    }
  }, []);

  if (loadingKeyCheck) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-textlight">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <p className="mt-4 text-lg">Checking API key...</p>
      </div>
    );
  }

  if (!hasKeySelected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-textlight bg-secondary rounded-lg shadow-lg m-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
        <p className="text-center mb-6">
          Please select a paid Gemini API key from a GCP project to use the advanced features of
          BUILDWHILEBLEEDING Studio.
        </p>
        <button
          onClick={handleSelectKey}
          className="px-6 py-3 bg-buttonbg hover:bg-buttonhover text-textlight font-semibold rounded-lg shadow-md transition-colors duration-200"
          aria-label="Select API Key"
        >
          Select API Key
        </button>
        <p className="text-sm text-textdark mt-4 text-center">
          For billing information, please refer to:{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            ai.google.dev/gemini-api/docs/billing
          </a>
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

// --- Main App Component ---
const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<string>('Idle');
  const [messages, setMessages] = useState<{ type: 'user' | 'ai'; content: string }[]>([]);
  const [currentInputTranscription, setCurrentInputTranscription] = useState<string>('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState<string>('');

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    if (isRecording) return;

    setPipelineStatus('Initializing AI Voice Session...');
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');
    setMessages([]);

    try {
      // Create a new GoogleGenAI instance on each session start to ensure latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Fix: Cast window.webkitAudioContext to any to satisfy TypeScript, as per guidelines for browser compatibility.
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Fix: Cast window.webkitAudioContext to any to satisfy TypeScript, as per guidelines for browser compatibility.
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const inputAudioContext = inputAudioContextRef.current;
      const outputAudioContext = outputAudioContextRef.current;

      const source = inputAudioContext.createMediaStreamSource(stream);
      mediaStreamSourceRef.current = source;

      const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromiseRef.current?.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputAudioContext.destination);

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.debug('Live session opened');
            setPipelineStatus('Listening...');
            setIsRecording(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setCurrentOutputTranscription(prev => prev + message.serverContent.outputTranscription.text);
            }
            if (message.serverContent?.inputTranscription) {
              setCurrentInputTranscription(prev => prev + message.serverContent.inputTranscription.text);
            }

            if (message.serverContent?.turnComplete) {
              const fullInput = currentInputTranscription;
              const fullOutput = currentOutputTranscription;

              if (fullInput.trim() !== '') {
                setMessages(prev => [...prev, { type: 'user', content: fullInput }]);
              }
              if (fullOutput.trim() !== '') {
                setMessages(prev => [...prev, { type: 'ai', content: fullOutput }]);
              }

              setCurrentInputTranscription('');
              setCurrentOutputTranscription('');
              nextStartTimeRef.current = 0; // Reset for potential new user turn
              setPipelineStatus('Listening...');
            }

            // Handle audio output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContext) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              try {
                const audioBuffer = await decodeAudioData(
                  decode(base64EncodedAudioString),
                  outputAudioContext,
                  24000,
                  1,
                );
                const sourceNode = outputAudioContext.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(outputAudioContext.destination); // Connect directly to destination
                sourceNode.addEventListener('ended', () => {
                  outputSourcesRef.current.delete(sourceNode);
                });

                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                outputSourcesRef.current.add(sourceNode);
                setPipelineStatus('Speaking...');
              } catch (audioDecodeError) {
                console.error('Error decoding audio data:', audioDecodeError);
                setPipelineStatus('Error processing audio.');
              }
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of outputSourcesRef.current.values()) {
                source.stop();
              }
              outputSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setPipelineStatus('Interrupted. Listening...');
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setPipelineStatus('Session Error! Reconnect to try again.');
            setIsRecording(false);
            stopAudioProcessing();
            // If the error indicates a bad API key, prompt user to select again.
            if (e.message.includes("Requested entity was not found.")) {
              window.aistudio.openSelectKey().then(() => console.log('API key selection requested due to error.')).catch(console.error);
            }
          },
          onclose: (e: CloseEvent) => {
            console.debug('Live session closed');
            setPipelineStatus('Session Closed.');
            setIsRecording(false);
            stopAudioProcessing();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a drum separation studio assistant. Provide helpful advice on drum mixing, separation techniques, and studio workflow. Keep responses concise and practical.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });
    } catch (error) {
      console.error('Failed to start recording or connect to Live API:', error);
      setPipelineStatus('Failed to start: ' + (error as Error).message);
      setIsRecording(false);
      stopAudioProcessing();
    }
  };

  const stopAudioProcessing = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close().catch(console.error);
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close().catch(console.error);
      outputAudioContextRef.current = null;
    }
    for (const source of outputSourcesRef.current.values()) {
      source.stop();
    }
    outputSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setPipelineStatus('Stopping session...');
    sessionPromiseRef.current?.then((session) => {
      session.close();
    });
    stopAudioProcessing();
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isRecording) {
        stopRecording();
      } else {
        stopAudioProcessing(); // Ensure all audio resources are released
      }
    };
  }, [isRecording, stopRecording, stopAudioProcessing]);

  return (
    <ApiKeyChecker>
      <div className="flex flex-col md:flex-row flex-grow w-full max-w-screen-2xl mx-auto p-4 md:space-x-4">
        {/* Left Panel: Drum Separation, Mixer, Waveform */}
        <div className="flex flex-col w-full md:w-1/2 space-y-4 mb-4 md:mb-0">
          {/* Drum Separation Module Placeholder */}
          <section className="bg-secondary p-6 rounded-lg shadow-xl flex-grow">
            <h2 className="text-2xl font-bold text-accent mb-4">Drum Separation</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-textdark p-8 rounded-md h-48">
              <p className="text-lg text-textdark mb-4">Upload a drum track for separation</p>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                id="audio-upload"
                aria-label="Upload audio file"
              />
              <label
                htmlFor="audio-upload"
                className="px-5 py-2 bg-buttonbg hover:bg-buttonhover text-textlight font-semibold rounded-lg cursor-pointer transition-colors duration-200"
              >
                Choose File
              </label>
            </div>
            <button
              className="mt-4 w-full px-5 py-2 bg-buttonbg hover:bg-buttonhover text-textlight font-semibold rounded-lg transition-colors duration-200"
              aria-label="Process Drum Separation"
            >
              Process Separation (Placeholder)
            </button>
          </section>

          {/* Mixer Module Placeholder */}
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
                    defaultValue="75"
                    className="w-full h-2 bg-textdark rounded-lg appearance-none cursor-pointer accent-accent"
                    aria-label={`${drum} volume slider`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Waveform Display Placeholder */}
          <section className="bg-secondary p-6 rounded-lg shadow-xl flex-grow">
            <h2 className="text-2xl font-bold text-accent mb-4">Waveform Display</h2>
            <div
              className="w-full h-48 bg-gray-700 rounded-md flex items-center justify-center text-textdark italic"
              aria-label="Audio waveform visualization area"
            >
              Waveform visualization here (Placeholder)
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
                <p className="text-textdark italic text-center">Start the conversation!</p>
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
                    : 'bg-success hover:bg-green-700'
                }`}
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
                    className="h-10 w-10 text-textlight"
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
    </ApiKeyChecker>
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