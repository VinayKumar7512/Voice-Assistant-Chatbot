import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { SpeechUtils } from './utils/speechUtils';

export default function VoiceChatbot() {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [useWebSpeech, setUseWebSpeech] = useState(true);
  
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const speechUtilsRef = useRef(new SpeechUtils());

  useEffect(() => {
    // Connect to WebSocket server
    connectWebSocket();
    
    // Initialize Web Speech API
    if (speechUtilsRef.current.isSupported) {
      speechUtilsRef.current.initRecognition(
        (transcript) => {
          setCurrentTranscript(transcript);
          setMessages(prev => [...prev, { 
            type: 'user', 
            text: transcript,
            timestamp: new Date().toLocaleTimeString()
          }]);
          // Send transcription to server for AI response
          setIsProcessing(true);
          sendTranscriptionToServer(transcript);
        },
        (error) => {
          console.error('Web Speech Recognition error:', error);
          setMessages(prev => [...prev, { 
            type: 'error', 
            text: `Speech recognition error: ${error}`,
            timestamp: new Date().toLocaleTimeString()
          }]);
          setIsProcessing(false);
        }
      );
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [useWebSpeech]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectWebSocket = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      // Attempt reconnection after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    wsRef.current = ws;
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'ai_response':
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: data.text,
          timestamp: new Date().toLocaleTimeString()
        }]);
        // Use browser TTS to speak the response
        speechUtilsRef.current.speak(data.text, () => {
          setIsProcessing(false);
        });
        break;
        
      case 'error':
        console.error('Server error:', data.message);
        setMessages(prev => [...prev, { 
          type: 'error', 
          text: `Error: ${data.message}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setIsProcessing(false);
        break;
        
      case 'pong':
        // Keep connection alive
        break;
    }
  };


  const startRecording = async () => {
    try {
      // Use Web Speech API
      speechUtilsRef.current.startListening();
      setIsRecording(true);
      setCurrentTranscript('');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    // Use Web Speech API
    speechUtilsRef.current.stopListening();
    setIsRecording(false);
  };

  // Send transcription to server
  const sendTranscriptionToServer = (text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'transcription',
        text: text
      }));
    } else {
      console.error('WebSocket is not connected');
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-900 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-t-2xl shadow-lg p-3 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src="/chatbot.jpg" alt="Chatbot" className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover shadow" />
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                  <Volume2 className="text-indigo-600" size={window.innerWidth < 640 ? 20 : 32} />
                  <span className="hidden sm:inline">AI Voice Chatbot</span>
                  <span className="sm:hidden">Voice Bot</span>
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Talk naturally, get instant responses</span>
                  <span className="text-xs sm:text-sm text-gray-600 sm:hidden">Voice chat</span>
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">● Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'error' ? 'Error' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white shadow-lg p-3 sm:p-6 flex-1 min-h-0 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <img src="/chatbot.jpg" alt="Chatbot" className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-lg mb-4" />
              <p className="text-base sm:text-lg font-medium text-gray-700">Hi! I'm your voice assistant.</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">Tap the mic and start talking.</p>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 shadow-sm">
                <Mic size={16} className="sm:hidden" />
                <Mic size={18} className="hidden sm:block" />
                <span className="text-xs sm:text-sm">Listening when you're ready</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-end gap-2 sm:gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type !== 'user' && (
                    <img src="/chatbot.jpg" alt="Bot" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shadow" />
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow ${
                      message.type === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-800 rounded-bl-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-[9px] sm:text-[10px] mt-1 ${
                      message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] sm:text-xs flex items-center justify-center shadow">You</div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="bg-white rounded-b-2xl shadow-lg p-3 sm:p-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/50'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff size={20} className="sm:hidden" />
                  <MicOff size={24} className="hidden sm:block" />
                  <span className="hidden sm:inline">Stop Recording</span>
                  <span className="sm:hidden">Stop</span>
                </>
              ) : (
                <>
                  <Mic size={20} className="sm:hidden" />
                  <Mic size={24} className="hidden sm:block" />
                  <span className="hidden sm:inline">Press to Speak</span>
                  <span className="sm:hidden">Speak</span>
                </>
              )}
            </button>
          </div>
          
          {isRecording && (
            <div className="mt-3 sm:mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 rounded-full">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-red-700">Recording...</span>
              </div>
            </div>
          )}
          
          {currentTranscript && !isRecording && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs sm:text-sm text-indigo-900">
                <strong>You said:</strong> {currentTranscript}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-2 sm:mt-4 bg-white rounded-lg shadow p-3 sm:p-4">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">How to use:</h3>
          <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
            <li>• Click "Speak" and start talking</li>
            <li>• Click "Stop" when done</li>
            <li>• Bot responds and speaks back automatically</li>
            <li>• Enable microphone permissions</li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="mt-2 sm:mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg ring-1 ring-white/40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <img src="/chatbot.jpg" alt="Chatbot" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover ring-2 ring-white/40" />
            <span className="text-[10px] sm:text-xs tracking-wide">Created by Vinay Kumar | Chatbot Project 2025</span>
          </div>
        </footer>
      </div>
    </div>
  );
}