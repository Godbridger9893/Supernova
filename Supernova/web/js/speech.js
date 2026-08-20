/**
 * Speech Recognition (STT) and Speech Synthesis (TTS) Controller
 */

class SpeechController {
  constructor(onTranscript, onStateChange) {
    this.onTranscript = onTranscript || (() => {});
    this.onStateChange = onStateChange || (() => {});
    
    this.recognition = null;
    this.isListening = false;
    this.speechSynthesis = window.speechSynthesis;
    this.autoRestart = false;

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[Speech] Web Speech API not supported in this browser environment.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStateChange("LISTENING");
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        this.onTranscript(transcript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("[Speech] Recognition error:", event.error);
      this.isListening = false;
      this.onStateChange("IDLE");
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStateChange("IDLE");
      if (this.autoRestart) {
        setTimeout(() => this.startListening(), 400);
      }
    };
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!this.recognition) {
      alert("Microphone recognition is not supported in this webview. You can type commands directly!");
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("[Speech] Could not start speech recognition:", e);
    }
  }

  stopListening() {
    this.autoRestart = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  speak(text) {
    if (!text || !this.speechSynthesis) return;
    
    // Stop any ongoing speech
    this.speechSynthesis.cancel();

    // Clean text of markdown symbols
    const cleanText = text.replace(/[*_`#~\[\]\(\)>]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Daniel") || v.lang.startsWith("en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.onStateChange("SPEAKING");
    };

    utterance.onend = () => {
      this.onStateChange("IDLE");
    };

    utterance.onerror = () => {
      this.onStateChange("IDLE");
    };

    this.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    this.onStateChange("IDLE");
  }
}

window.SpeechController = SpeechController;
