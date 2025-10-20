const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// API Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Validate API key
if (!GROQ_API_KEY) {
  console.warn('⚠️  GROQ_API_KEY is not set - using fallback responses');
} else {
  console.log('✅ Groq API key found - using Llama for responses');
}

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready on ws://localhost:${PORT}`);
  console.log(`🌐 Using browser-only STT/TTS (Web Speech API)`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('✅ New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle different message types from browser
      switch (data.type) {
        case 'transcription':
          // Browser has transcribed speech, generate AI response
          handleTranscription(ws, data.text);
          break;
          
        case 'ping':
          // Keep connection alive
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
          
        default:
          console.log('Received message:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle transcription from browser
async function handleTranscription(ws, text) {
  console.log('🎤 Received transcription:', text);
  
  try {
    let aiResponse;
    
    if (GROQ_API_KEY) {
      // Use Groq for intelligent responses
      aiResponse = await generateGroqResponse(text);
    } else {
      // Use fallback responses
      aiResponse = generateSimpleResponse(text);
    }
    
    // Send response back to client
    ws.send(JSON.stringify({
      type: 'ai_response',
      text: aiResponse
    }));
    
    console.log('🤖 Sent AI response:', aiResponse);
  } catch (error) {
    console.error('Error generating response:', error);
    
    // Fallback to simple response
    const fallbackResponse = generateSimpleResponse(text);
    ws.send(JSON.stringify({
      type: 'ai_response',
      text: fallbackResponse
    }));
  }
}

// Generate Groq response
async function generateGroqResponse(userMessage) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful, friendly AI assistant. Keep responses concise and natural for voice conversation (2-3 sentences max). Be conversational and engaging.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);
    throw new Error('Failed to generate Groq response');
  }
}

// Generate simple AI response
function generateSimpleResponse(userMessage) {
  const responses = [
    "That's interesting! Tell me more about that.",
    "I understand what you're saying. How can I help you further?",
    "That's a great point. What would you like to know?",
    "I see. Is there anything specific you'd like to discuss?",
    "Thanks for sharing that with me. What else is on your mind?",
    "That sounds fascinating! Can you elaborate on that?",
    "I'm here to help. What else would you like to talk about?",
    "That's a good question. Let me think about that for a moment.",
    "I appreciate you sharing that with me. What's your perspective on this?",
    "That's really interesting. I'd love to hear more about your thoughts on this."
  ];
  
  // Simple keyword-based responses
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! How are you doing today?";
  }
  
  if (lowerMessage.includes('how are you')) {
    return "I'm doing great, thank you for asking! How are you feeling today?";
  }
  
  if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
    return "You're very welcome! Is there anything else I can help you with?";
  }
  
  if (lowerMessage.includes('goodbye') || lowerMessage.includes('bye')) {
    return "Goodbye! It was nice talking with you. Have a great day!";
  }
  
  if (lowerMessage.includes('help')) {
    return "I'm here to help! What would you like to know or discuss?";
  }
  
  if (lowerMessage.includes('weather')) {
    return "I don't have access to current weather data, but I hope you're having a nice day!";
  }
  
  if (lowerMessage.includes('time')) {
    return "I don't have access to the current time, but I hope you're having a good day!";
  }
  
  // Default random response
  return responses[Math.floor(Math.random() * responses.length)];
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mode: 'browser-stt-tts',
    stt: 'Web Speech API',
    tts: 'Web Speech API',
    ai: GROQ_API_KEY ? 'Groq Llama-3.1-70b' : 'Fallback responses'
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit();
});