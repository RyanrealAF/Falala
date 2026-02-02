import sys
import os
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                             QHBoxLayout, QLabel, QLineEdit, QPushButton,
                             QFileDialog, QCheckBox, QSpinBox, QDoubleSpinBox,
                             QFrame)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QSize
from PyQt6.QtGui import QFont, QDragEnterEvent, QDropEvent, QPixmap
from PyQt6.QtSvgWidgets import QSvgWidget

# Import conversion engine
from audio_to_midi import generate_midi, auto_detect_bpm

STYLESHEET = """
QMainWindow {
    background-color: #0a0a0a;
}
QWidget {
    background-color: #0a0a0a;
    color: #00ff41;
    font-family: 'Courier New', monospace;
}
QLabel {
    font-weight: bold;
}
QLineEdit, QSpinBox, QDoubleSpinBox {
    background-color: #1a1a1a;
    border: 1px solid #333;
    color: #00ff41;
    padding: 5px;
    selection-background-color: #00ff41;
    selection-color: #0a0a0a;
}
QPushButton {
    background-color: #00ff41;
    color: #0a0a0a;
    border: none;
    padding: 10px;
    font-weight: bold;
}
QPushButton:hover {
    background-color: #00cc33;
}
QPushButton:disabled {
    background-color: #004411;
    color: #0a0a0a;
}
QCheckBox {
    spacing: 5px;
}
QCheckBox::indicator {
    width: 18px;
    height: 18px;
    background-color: #1a1a1a;
    border: 1px solid #333;
}
QCheckBox::indicator:checked {
    background-color: #00ff41;
}
#status_area {
    padding: 10px;
    margin-top: 20px;
    background-color: #111;
}
"""

class ConversionThread(QThread):
    finished = pyqtSignal(int)
    error = pyqtSignal(str)

    def __init__(self, audio_path, output_path, bpm, midi_note, velocity, dynamic_velocity):
        super().__init__()
        self.audio_path = audio_path
        self.output_path = output_path
        self.bpm = bpm
        self.midi_note = midi_note
        self.velocity = velocity
        self.dynamic_velocity = dynamic_velocity

    def run(self):
        try:
            count = generate_midi(
                self.audio_path,
                self.output_path,
                self.bpm,
                self.midi_note,
                self.velocity,
                self.dynamic_velocity
            )
            self.finished.emit(count)
        except Exception as e:
            self.error.emit(str(e))

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Audio → MIDI | buildwhilebleeding.com")
        self.setMinimumSize(600, 700)
        self.setStyleSheet(STYLESHEET)
        self.setAcceptDrops(True)

        self.audio_path = ""

        self.init_ui()

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setSpacing(15)
        layout.setContentsMargins(30, 30, 30, 30)

        # Logo
        if os.path.exists("logo.svg"):
            logo_container = QWidget()
            logo_layout = QHBoxLayout(logo_container)
            self.logo_widget = QSvgWidget("logo.svg")
            self.logo_widget.setFixedSize(200, 200)
            logo_layout.addStretch()
            logo_layout.addWidget(self.logo_widget)
            logo_layout.addStretch()
            layout.addWidget(logo_container)

        # File Picker
        file_layout = QVBoxLayout()
        self.file_label = QLabel("NO FILE SELECTED")
        self.file_label.setStyleSheet("color: #666; font-size: 10px;")

        pick_btn = QPushButton("CHOOSE AUDIO FILE (WAV/MP3)")
        pick_btn.clicked.connect(self.browse_file)

        file_layout.addWidget(pick_btn)
        file_layout.addWidget(self.file_label)
        layout.addLayout(file_layout)

        # BPM Input
        bpm_layout = QHBoxLayout()
        bpm_layout.addWidget(QLabel("BPM:"))
        self.bpm_input = QDoubleSpinBox()
        self.bpm_input.setRange(1, 999)
        self.bpm_input.setValue(120)
        bpm_layout.addWidget(self.bpm_input)

        auto_bpm_btn = QPushButton("AUTO-DETECT")
        auto_bpm_btn.clicked.connect(self.detect_bpm)
        bpm_layout.addWidget(auto_bpm_btn)
        layout.addLayout(bpm_layout)

        # MIDI Note Input
        note_layout = QHBoxLayout()
        note_layout.addWidget(QLabel("MIDI NOTE (36=Kick, 38=Snare):"))
        self.note_input = QSpinBox()
        self.note_input.setRange(0, 127)
        self.note_input.setValue(36)
        note_layout.addWidget(self.note_input)
        layout.addLayout(note_layout)

        # Velocity Input
        vel_layout = QHBoxLayout()
        vel_layout.addWidget(QLabel("VELOCITY (1-127):"))
        self.vel_input = QSpinBox()
        self.vel_input.setRange(1, 127)
        self.vel_input.setValue(90)
        vel_layout.addWidget(self.vel_input)
        layout.addLayout(vel_layout)

        # Dynamic Velocity
        self.dynamic_cb = QCheckBox("DYNAMIC VELOCITY")
        layout.addWidget(self.dynamic_cb)

        # Output Filename
        out_layout = QHBoxLayout()
        out_layout.addWidget(QLabel("OUTPUT FILENAME:"))
        self.out_input = QLineEdit("output.mid")
        out_layout.addWidget(self.out_input)
        layout.addLayout(out_layout)

        # Convert Button
        self.convert_btn = QPushButton("CONVERT TO MIDI")
        self.convert_btn.setEnabled(False)
        self.convert_btn.setFixedHeight(50)
        self.convert_btn.clicked.connect(self.start_conversion)
        layout.addWidget(self.convert_btn)

        # Status Area
        self.status_frame = QFrame()
        self.status_frame.setObjectName("status_area")
        self.status_frame.setFrameShape(QFrame.Shape.StyledPanel)
        status_layout = QVBoxLayout(self.status_frame)
        self.status_text = QLabel("STATUS: IDLE")
        status_layout.addWidget(self.status_text)
        layout.addWidget(self.status_frame)

    def browse_file(self):
        path, _ = QFileDialog.getOpenFileName(self, "Open Audio File", "", "Audio Files (*.wav *.mp3)")
        if path:
            self.set_audio_path(path)

    def set_audio_path(self, path):
        self.audio_path = path
        self.file_label.setText(os.path.basename(path).upper())
        self.convert_btn.setEnabled(True)
        self.update_status("LOADED: " + os.path.basename(path))

    def detect_bpm(self):
        if not self.audio_path:
            self.update_status("ERROR: LOAD A FILE FIRST", error=True)
            return

        self.update_status("DETECTING BPM...")
        try:
            bpm = auto_detect_bpm(self.audio_path)
            self.bpm_input.setValue(bpm)
            self.update_status(f"BPM DETECTED: {bpm:.2f}")
        except Exception as e:
            self.update_status(f"ERROR: {str(e)}", error=True)

    def start_conversion(self):
        self.convert_btn.setEnabled(False)
        self.update_status("PROCESSING...")

        output_name = self.out_input.text()
        if not output_name.endswith(".mid"):
            output_name += ".mid"

        self.thread = ConversionThread(
            self.audio_path,
            output_name,
            self.bpm_input.value(),
            self.note_input.value(),
            self.vel_input.value(),
            self.dynamic_cb.isChecked()
        )
        self.thread.finished.connect(self.on_finished)
        self.thread.error.connect(self.on_error)
        self.thread.start()

    def on_finished(self, count):
        self.convert_btn.setEnabled(True)
        self.update_status(f"SUCCESS: {count} NOTES GENERATED")
        self.status_frame.setStyleSheet("border-left: 4px solid #00ff41;")

    def on_error(self, message):
        self.convert_btn.setEnabled(True)
        self.update_status(f"ERROR: {message}", error=True)

    def update_status(self, text, error=False):
        self.status_text.setText("STATUS: " + text.upper())
        if error:
            self.status_frame.setStyleSheet("border-left: 4px solid #ff0000; color: #ff4444;")
        else:
            self.status_frame.setStyleSheet("border-left: 4px solid #00ff41;")

    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.accept()
        else:
            event.ignore()

    def dropEvent(self, event: QDropEvent):
        files = [u.toLocalFile() for u in event.mimeData().urls()]
        if files:
            path = files[0]
            if path.lower().endswith(('.wav', '.mp3')):
                self.set_audio_path(path)
            else:
                self.update_status("ERROR: INVALID FILE TYPE", error=True)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
