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

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Set up Groq API key:**
   ```bash
   # Create .env file with your Groq API key
   echo "GROQ_API_KEY=your_groq_api_key_here" > .env
   ```

3. **Start the application:**
   ```bash
   # Terminal 1: Start server
   npm start
   
   # Terminal 2: Start client
   cd client && npm run dev
   ```

4. **Open your browser:**
   - Go to `http://localhost:5173`
   - Click "Press to Speak" and start talking!

## 🎯 How It Works

1. **Speech Recognition**: Browser captures your voice using Web Speech API
2. **Text Processing**: Server generates AI responses using simple logic
3. **Speech Synthesis**: Browser speaks the response using Web Speech API
4. **Real-time Chat**: WebSocket enables instant communication

## 🌐 Browser Support

- ✅ **Chrome** (recommended)
- ✅ **Edge** 
- ✅ **Safari**
- ❌ **Firefox** (limited support)

## 📱 Usage

1. **Allow microphone access** when prompted
2. **Click "Press to Speak"** and start talking
3. **Click "Stop Recording"** when done
4. **Listen to the AI response** automatically

## 🔧 Configuration

The chatbot uses simple keyword-based responses. You can customize the AI responses by editing the `generateSimpleResponse` function in `server/server.js`.

## 🚀 Deployment

For production deployment:

1. **Build the client:**
   ```bash
   cd client && npm run build
   ```

2. **Serve static files:**
   ```bash
   npm start
   ```

3. **Configure your hosting platform** to serve the built files

## 📝 Notes

- All speech processing happens in the browser
- No external APIs or billing required
- Works offline after initial page load
- Perfect for development and testing
- Easy to customize and extend

## 🎉 Enjoy Your Voice Chatbot!

This is a clean, simple implementation that focuses on browser-based voice interaction without any external dependencies.
