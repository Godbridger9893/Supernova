## 🌌 What is SUPERNOVA?

**SUPERNOVA** is an open-source, cinema-grade desktop AI copilot designed to bridge next-generation generative AI with local computer automation and real-time 3D visual intelligence.

Unlike traditional text-based chatbots, SUPERNOVA lives on your desktop with an interactive, sci-fi **Holographic 3D Particle Orb** that responds to your voice in real time, shifting visual states as it listens, reasons, and executes tasks.

### Core Highlights:
1. **Interactive Cybernetic Interface**: Features a 3D WebGL particle sphere with gyroscopic rings and audio-frequency waveforms that pulse, breathe, and rotate dynamically to speech.
2. **Action-Driven AI (Tool Protocol)**: Beyond answering questions, Supernova controls your desktop—launching applications, controlling volume and media, querying web intelligence, and generating presentations or spreadsheets on the fly.
3. **Multimodal Screen Cognition**: Gives your AI eyes to see what is on your monitor, troubleshoot errors, summarize long articles, and analyze UI designs in real-time.
4. **Privacy & Flexibility**: Toggle seamlessly between cloud multimodal models (**Google Gemini 3.6 Flash**) and 100% private, offline local LLMs (**Ollama**).


INSTALLATION


# 🌟 SUPERNOVA — Desktop AI Assistant
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-brightgreen.svg)]()
A futuristic, high-performance desktop AI assistant inspired by JARVIS and cybernetic HUD interfaces, featuring a **real-time 3D WebGL Living Particle Orb**, audio-reactive waveforms, multimodal vision, and automation tools.
---
## ⚡ Key Features
- **🌐 3D WebGL Living Particle Orb & Gyroscopic Rings**: Real-time 3D particle sphere that reacts dynamically to voice, speech frequencies, and AI thinking states (`IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, `EXECUTING`).
- **🎙️ Real-Time Voice & Audio Matrix**: Dual Speech-to-Text (STT) and Text-to-Speech (TTS) with live frequency spectrum visualizer.
- **🧠 Dual AI Engine Support**:
  - **Google Gemini 3.6 Flash**: Ultra-fast multimodal vision and cloud tool reasoning.
  - **Local Ollama**: 100% offline, private AI execution (e.g. `llama3.2`, `deepseek-r1`, `mistral`, `qwen2.5`).
- **👁️ Multimodal Screen & Vision AI**: High-resolution screen inspection for answering questions like *"What's on my screen?"* or *"Help me debug this error"*.
- **📊 Instant Office & Document Builder**: Automatically creates PowerPoint (`.pptx`) decks, Excel (`.xlsx`) spreadsheets, Word (`.docx`) documents, and Markdown reports on your Desktop.
- **🔍 Web Intelligence & Utilities**: DuckDuckGo search summaries, live weather forecasts, and instant YouTube playback.
- **🖥️ System Control**: Native application launching, volume control, media playback, and dark mode toggling.
---
## 💻 Cross-Platform Compatibility
| Feature | macOS (Native) | Windows | Linux |
| :--- | :---: | :---: | :---: |
| **3D WebGL Particle HUD & UI** | ✅ Full | ✅ Full | ✅ Full |
| **Gemini & Local Ollama AI** | ✅ Full | ✅ Full | ✅ Full |
| **Voice STT & Browser TTS** | ✅ Full | ✅ Full | ✅ Full |
| **Office Doc Builder (PPTX/XLSX/DOCX)** | ✅ Full | ✅ Full | ✅ Full |
| **Web Search & Weather** | ✅ Full | ✅ Full | ✅ Full |
| **macOS Native Voice (`say`)** | ✅ Full | 🔄 (Browser TTS) | 🔄 (Browser TTS) |
| **Native App & Media Control** | ✅ AppleScript | 🔄 Simulated / Web | 🔄 Simulated / Web |
| **Silent Screen Capture** | ✅ Native | 🔄 Cross-platform fallback | 🔄 Cross-platform fallback |
> **Note**: Supernova is optimized for macOS with native AppleScript and `screencapture` integrations. On Windows and Linux, the core AI brain, 3D WebGL interface, voice input, web tools, and document generation work out of the box.
---
## 📦 Installation & Setup
### Prerequisites
- **Python 3.10+** installed
- *(Optional)* [Ollama](https://ollama.com/) installed if running local offline models
- !AND MAKE SURE TO ADD YOUR OWN API KEYS!
---
### 🍏 macOS Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Godbridger9893/Supernova.git
   cd Supernova
Run the one-click startup script:

bash


chmod +x start.sh
./start.sh
(This automatically creates a virtual environment, installs dependencies, and boots the server).

Or launch manually with Python:

bash


python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 run.py
🪟 Windows Installation
Clone the repository:

powershell


git clone https://github.com/Godbridger9893/Supernova.git
cd Supernova
Create virtual environment and install dependencies:

powershell


python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
Launch Supernova:

powershell


python run.py
🐧 Linux Installation
Clone the repository:

bash


git clone https://github.com/Godbridger9893/Supernova.git
cd Supernova
Set up environment & install dependencies:

bash


python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
Launch Supernova:

bash


python3 run.py
⚙️ Configuration
Once Supernova launches, it will open the HUD interface in your browser at http://127.0.0.1:8765.

Click the Gear (Settings) icon in the top-right corner.
Select your preferred AI Brain Provider:
Google Gemini: Paste your Gemini API key.
Local Ollama: Select your installed local model (e.g. llama3.2, deepseek-r1).
Click Save Config.
🗣️ Example Voice & Typed Commands
"Open Spotify and Visual Studio Code"
"What is currently on my screen?"
"Set volume to 80%"
"What's the weather in Tokyo?"
"Create a presentation on Quantum Computing"
"Create a sales budget spreadsheet"
"Search the web for latest space exploration news"
"Play relaxing jazz on YouTube"
"Toggle dark mode"
