# Voice Chatbot - Browser STT/TTS + Groq

A voice chatbot that uses browser-based Speech-to-Text (STT) and Text-to-Speech (TTS) APIs with Groq for intelligent responses. Uses Groq's fast Llama models!

## 🚀 Features

- **Browser-Based STT/TTS** - Uses Web Speech API (completely free)
- **Groq Integration** - Fast intelligent responses with Llama-3.1-70b
- **Real-time Communication** - WebSocket connection for instant responses
- **Fallback Responses** - Works even without Groq API key
- **Modern UI** - Clean, responsive interface with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + WebSocket
- **STT/TTS**: Web Speech API (browser native)
- **Communication**: WebSocket for real-time chat

## 🎯 How It Works

1. **Speech Recognition**: Browser captures your voice using Web Speech API
2. **Text Processing**: Server generates AI responses using simple logic
3. **Speech Synthesis**: Browser speaks the response using Web Speech API
4. **Real-time Chat**: WebSocket enables instant communication

## 📱 Usage

1. **Allow microphone access** when prompted
2. **Click "Press to Speak"** and start talking
3. **Click "Stop Recording"** when done
4. **Listen to the AI response** automaticall
