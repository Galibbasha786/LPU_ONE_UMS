// src/pages/LPUChatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../styles/LPUChatbot.css";

const LPUChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Namaste! 🙏 I'm your dedicated LPU AI Assistant, powered by Google Gemini AI. I specialize in providing accurate information about Lovely Professional University.\n\nWhat would you like to know about LPU today?",
      sender: "ai",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const [debugInfo, setDebugInfo] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI("AIzaSyDcZiTCaDym0znJlr4rgy-6HfAaR28nF2c");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        setDebugInfo("🎤 Voice input received");
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setDebugInfo(`🎤 Error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setDebugInfo("🎤 Speech recognition not supported in this browser");
    }

    // Initialize Speech Synthesis
    speechSynthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API connection on component mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    setDebugInfo("Checking Gemini AI connection...");
    
    try {
      setDebugInfo("Testing Gemini AI API...");
      
      const result = await model.generateContent("Hello");
      const response = await result.response;
      const text = response.text();
      
      setApiStatus("valid");
      setDebugInfo("✅ Gemini AI connected successfully!");
      console.log("✅ Gemini AI connection successful");
      
    } catch (error) {
      console.error("❌ Gemini AI connection failed:", error);
      setApiStatus("invalid");
      setDebugInfo(`❌ Error: ${error.message}`);
    }
  };

  const systemPrompt = `You are an AI assistant exclusively for Lovely Professional University (LPU). Your role is to provide accurate, helpful information about LPU including:

- Courses and programs offered
- Admission procedures and requirements
- Campus facilities and infrastructure
- Placement statistics and companies
- Scholarship opportunities
- Fee structure
- Campus life and activities
- Academic departments
- International collaborations

Important guidelines:
1. Only answer questions related to LPU
2. If asked about unrelated topics, politely redirect to LPU subjects
3. Be professional, friendly, and informative
4. Provide factual information based on LPU's official data
5. Keep responses concise but comprehensive
6. Use bullet points for lists when appropriate
7. Always maintain a helpful and positive tone
8. Format your responses clearly with proper spacing and structure
9. Use emojis where appropriate to make responses engaging
10. Always end with helpful suggestions or next steps

Current date: ${new Date().toLocaleDateString()}`;

  const speakText = (text) => {
    if (!speechEnabled) return;

    // Clean text for speech (remove markdown, URLs, etc.)
    const cleanText = text
      .replace(/[**]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\n/g, '. ')
      .trim();

    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setDebugInfo("🎤 Listening... Speak now");
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setDebugInfo("🎤 Error starting voice input");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || apiStatus !== "valid") return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setDebugInfo("Generating response with Gemini AI...");

    try {
      const prompt = `${systemPrompt}\n\nUser Question: "${inputMessage}"\n\nPlease provide a helpful, accurate response about LPU:`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
        type: "text"
      };

      setMessages(prev => [...prev, aiMessage]);
      setDebugInfo("✅ Response generated successfully");
      
      // Speak the AI response
      if (speechEnabled) {
        setTimeout(() => speakText(aiText), 500);
      }
      
    } catch (error) {
      console.error("Gemini AI Error:", error);
      setDebugInfo(`❌ API Error: ${error.message}`);
      
      let errorText = "I apologize, but I'm experiencing technical difficulties. ";
      
      if (error.message.includes("quota")) {
        errorText += "API quota exceeded. Please try again later.";
      } else if (error.message.includes("model")) {
        errorText += "Model unavailable. Please check the model name.";
      } else if (error.message.includes("safety")) {
        errorText += "Content safety settings prevented the response.";
      } else {
        errorText += `Error: ${error.message}. Please try again.`;
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: "ai",
        timestamp: new Date(),
        type: "error"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What courses does LPU offer?",
    "Tell me about LPU admissions process",
    "What are the hostel facilities at LPU?",
    "How are placements at LPU?",
    "What scholarships are available?",
    "Tell me about LPU campus life",
    "What are the fees for engineering?",
    "How to apply for LPU?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    // Auto-send after a short delay
    setTimeout(() => {
      if (!isLoading) {
        handleSendMessage();
      }
    }, 100);
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={index} style={{display: 'flex', alignItems: 'flex-start', margin: '0.25rem 0'}}>
            <span style={{marginRight: '0.5rem', color: '#8B0000'}}>•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <div key={index} style={{display: 'flex', alignItems: 'flex-start', margin: '0.25rem 0'}}>
            <span style={{marginRight: '0.5rem', color: '#8B0000', fontWeight: 'bold'}}>{line.match(/^\d+/)[0]}.</span>
            <span>{line.substring(line.indexOf('.') + 1)}</span>
          </div>
        );
      }
      return <p key={index} style={{ margin: '0.5rem 0', lineHeight: '1.6' }}>{line}</p>;
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Namaste! 🙏 I'm your dedicated LPU AI Assistant, powered by Google Gemini AI. I specialize in providing accurate information about Lovely Professional University.\n\nWhat would you like to know about LPU today?",
        sender: "ai",
        timestamp: new Date(),
        type: "text"
      }
    ]);
    setDebugInfo("Chat cleared. Ready for new conversation.");
    stopSpeaking();
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setSpeechEnabled(!speechEnabled);
    setDebugInfo(speechEnabled ? "🔇 Speech disabled" : "🔊 Speech enabled");
  };

  return (
    <div className="lpu-chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-content">
          <div className="header-left">
            <div className="ai-avatar">🎓</div>
            <div className="header-text">
              <h2>LPU AI Assistant</h2>
              <p>Powered by Google Gemini AI • gemini-2.0-flash-exp</p>
            </div>
          </div>
          <div className="header-right">
            <div className="voice-controls">
              <button
                className={`voice-btn ${speechEnabled ? 'active' : ''}`}
                onClick={toggleSpeech}
                title={speechEnabled ? "Disable speech" : "Enable speech"}
              >
                {speechEnabled ? '🔊' : '🔇'}
              </button>
              {isSpeaking && (
                <button
                  className="voice-btn stop-btn"
                  onClick={stopSpeaking}
                  title="Stop speaking"
                >
                  ⏹️
                </button>
              )}
            </div>
            <div className="header-actions">
              <button className="clear-chat-btn" onClick={clearChat}>
                Clear Chat
              </button>
            </div>
            <div className={`status-indicator ${isLoading ? 'loading' : apiStatus === 'valid' ? 'online' : 'offline'}`}>
              {isLoading ? 'Thinking...' : apiStatus === 'valid' ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div className="debug-section">
        <div className="debug-info">
          <strong>API Status:</strong> {debugInfo}
        </div>
        {apiStatus === "invalid" && (
          <button 
            onClick={checkApiConnection}
            className="retry-connection-btn"
          >
            🔄 Retry Connection
          </button>
        )}
      </div>

      {/* API Instructions */}
      {apiStatus === "invalid" && (
        <div className="api-instructions">
          <h4>🔧 Gemini AI Setup Required</h4>
          <p>To use this chatbot, you need a valid Gemini AI configuration:</p>
          
          <div style={{marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px'}}>
            <h5>📋 Current Configuration:</h5>
            <ul>
              <li><strong>API Key:</strong> ✅ Configured</li>
              <li><strong>Model:</strong> gemini-2.0-flash-exp</li>
              <li><strong>Status:</strong> {apiStatus === 'valid' ? 'Connected' : 'Failed'}</li>
            </ul>
            <button 
              onClick={checkApiConnection}
              style={{
                background: '#10a37f',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Quick Questions */}
      {apiStatus === "valid" && (
        <div className="quick-questions-section">
          <h4>💡 Quick Questions About LPU</h4>
          <div className="quick-questions-grid">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="quick-question-btn"
                onClick={() => handleQuickQuestion(question)}
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender} ${message.type}`}
          >
            <div className="message-avatar">
              {message.sender === 'ai' ? '🎓' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">
                {formatMessage(message.text)}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              {message.sender === 'ai' && speechEnabled && (
                <button
                  className="speak-btn"
                  onClick={() => speakText(message.text)}
                  title="Speak this message"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-avatar">🎓</div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-text">Gemini AI is thinking</div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-section">
        <div className="input-container">
          <div className="voice-input-container">
            <button
              className={`voice-input-btn ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={!recognitionRef.current}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? '⏹️' : '🎤'}
            </button>
          </div>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              apiStatus === "valid" 
                ? "Ask me anything about Lovely Professional University..."
                : "Waiting for API connection..."
            }
            className="chat-input"
            rows="1"
            disabled={isLoading || apiStatus !== "valid"}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || apiStatus !== "valid"}
            className="send-button"
            title="Send message"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              '🚀'
            )}
          </button>
        </div>
        <div className="input-hint">
          {apiStatus === "valid" 
            ? "💡 Press Enter to send • Shift+Enter for new line • Click 🎤 for voice input"
            : "🔧 Please check your API configuration..."
          }
        </div>
      </div>

      {/* Footer */}
      <div className="chatbot-footer">
        <p>
          🎓 <strong>LPU AI Assistant</strong> • Powered by Google Gemini AI • 
          Voice Features: {speechEnabled ? '🔊 ON' : '🔇 OFF'} • 
          For official information visit: {" "}
          <a href="https://www.lpu.in" target="_blank" rel="noopener noreferrer">
            www.lpu.in
          </a>
        </p>
      </div>
    </div>
  );
};

export default LPUChatbot;
