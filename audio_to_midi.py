import librosa
import numpy as np
import mido
from mido import Message, MidiFile, MidiTrack

def auto_detect_bpm(audio_path):
    """
    Automatically detects BPM of the audio file.
    """
    y, sr = librosa.load(audio_path)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    if isinstance(tempo, np.ndarray):
        return float(tempo[0])
    return float(tempo)

def generate_midi(audio_path, output_path, bpm=120, midi_note=36, velocity=90, dynamic_velocity=False):
    # Load audio
    y, sr = librosa.load(audio_path)

    # HPSS to isolate percussive track
    y_harmonic, y_percussive = librosa.effects.hpss(y)

    # Onset detection on percussive track
    onset_frames = librosa.onset.onset_detect(y=y_percussive, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    # Create MIDI
    mid = MidiFile()
    track = MidiTrack()
    mid.tracks.append(track)

    ticks_per_beat = mid.ticks_per_beat

    # FIX: duration_ticks is now tempo-aware (e.g., 1/64th note for fast drum sync)
    # ticks_per_beat is one quarter note. 1/16 of that is a 1/64th note.
    duration_ticks = ticks_per_beat // 16

    last_total_ticks = 0
    for onset_time in onset_times:
        # Convert time to total ticks from start
        # ticks = seconds * (ticks_per_beat * bpm / 60)
        total_ticks = int(onset_time * (ticks_per_beat * bpm / 60))

        delta_time = total_ticks - last_total_ticks
        if delta_time < 0:
            delta_time = 0

        current_velocity = velocity
        if dynamic_velocity:
            start_sample = int(onset_time * sr)
            end_sample = min(len(y_percussive), start_sample + int(0.05 * sr))
            if start_sample < end_sample:
                peak = np.max(np.abs(y_percussive[start_sample:end_sample]))
                current_velocity = int(min(127, max(1, peak * 127 * 1.5)))
            else:
                current_velocity = velocity

        track.append(Message('note_on', note=midi_note, velocity=current_velocity, time=delta_time))
        track.append(Message('note_off', note=midi_note, velocity=0, time=duration_ticks))

        last_total_ticks = total_ticks + duration_ticks

    mid.save(output_path)
    return len(onset_times)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python audio_to_midi.py <input_audio> <output_midi> [bpm]")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]

        # Simple validation/auto-detection logic for CLI
        detected_bpm = auto_detect_bpm(input_file)
        print(f"Detected BPM: {detected_bpm:.2f}")

        provided_bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 120
        if abs(provided_bpm - detected_bpm) > 10:
            print(f"Warning: Provided BPM ({provided_bpm}) differs significantly from detected BPM ({detected_bpm:.2f})")

        count = generate_midi(input_file, output_file, bpm=provided_bpm)
        print(f"Generated MIDI with {count} notes.")
