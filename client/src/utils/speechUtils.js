// Web Speech API utilities for fallback STT/TTS
export class SpeechUtils {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && 
           !!window.speechSynthesis;
  }

  // Initialize speech recognition
  initRecognition(onResult, onError) {
    if (!this.isSupported) {
      onError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
    };
  }

  // Start speech recognition
  startListening() {
    if (this.recognition) {
      this.recognition.start();
    }
  }

  // Stop speech recognition
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Text-to-Speech using Web Speech API
  speak(text, onEnd) {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a female voice
    const voices = this.synthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Zira') || 
      voice.name.includes('Susan')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    this.synthesis.speak(utterance);
  }

  // Stop current speech
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Check if currently speaking
  isSpeaking() {
    return this.synthesis && this.synthesis.speaking;
  }
}
