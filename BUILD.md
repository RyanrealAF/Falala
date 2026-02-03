# Build Instructions

Follow these steps to build the `audio_to_midi` Windows EXE.

## 1. Install Dependencies

Ensure you have Python 10 or 11 installed. Then run:

```bash
pip install -r requirements.txt
```

## 2. Run PyInstaller

Use the provided `.spec` file to build the single-file executable:

```bash
pyinstaller build.spec
```

## 3. Output Location

The packaged executable will be located in the `dist/` directory:

`dist/audio_to_midi.exe`

---
**Note:** Ensure `icon.ico` is present in the root directory before running the build command.
