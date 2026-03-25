// pages/Chat.jsx - Enhanced Version
import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import "../styles/Chat.css";

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Safe user object with all required properties
  const user = JSON.parse(localStorage.getItem("user")) || { 
    name: "LPU Student", 
    role: "student",
    avatar: "🎓",
    department: "General"
  };
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // Socket connection status
  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });
    
    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });
    
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    // Fetch existing messages
    fetchMessages();

    // Socket event listeners
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("user_typing", (data) => {
      if (data.typing) {
        setTypingUsers(prev => {
          if (!prev.includes(data.user)) {
            return [...prev, data.user];
          }
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(user => user !== data.user));
      }
    });

    socket.on("online_users", (users) => {
      const safeUsers = (users || []).map(user => ({
        name: user?.name || "Anonymous User",
        role: user?.role || "student",
        avatar: user?.avatar || "👤",
        department: user?.department || "General"
      }));
      setOnlineUsers(safeUsers);
    });

    socket.on("user_joined", (userData) => {
      setChat(prev => [...prev, {
        id: Date.now(),
        sender: "System",
        text: `🎉 ${userData?.name || "Someone"} joined the chat`,
        timestamp: new Date(),
        type: "system"
      }]);
    });

    socket.on("user_left", (userData) => {
      setChat(prev => [...prev, {
        id: Date.now(),
        sender: "System",
        text: `👋 ${userData?.name || "Someone"} left the chat`,
        timestamp: new Date(),
        type: "system"
      }]);
    });

    // Join chat room
    socket.emit("join_chat", {
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      department: user.department
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("online_users");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/messages");
      const messages = await res.json();
      setChat(messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const getAvatarColor = (sender) => {
    try {
      if (!sender || typeof sender !== 'string' || sender.trim() === '') {
        return "#FF6B6B";
      }
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F39C12", "#E74C3C", "#3498DB"];
      let hash = 0;
      for (let i = 0; i < sender.length; i++) {
        hash = ((hash << 5) - hash) + sender.charCodeAt(i);
        hash = hash & hash;
      }
      const index = Math.abs(hash) % colors.length;
      return colors[index];
    } catch (error) {
      return "#FF6B6B";
    }
  };

  const getAvatarChar = (name) => {
    try {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return "U";
      }
      return name.charAt(0).toUpperCase();
    } catch (error) {
      return "U";
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      const messageData = {
        id: Date.now(),
        sender: user?.name || "LPU Student",
        text: message,
        timestamp: new Date(),
        avatar: user?.avatar || "🎓",
        role: user?.role || "student",
        department: user?.department || "General"
      };
      
      socket.emit("send_message", messageData);
      setMessage("");
      socket.emit("typing", { typing: false, user: user.name });
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { typing: true, user: user.name });
    const timeout = setTimeout(() => {
      socket.emit("typing", { typing: false, user: user.name });
    }, 2000);
    return () => clearTimeout(timeout);
  };

  const getMessageStyle = (msg) => {
    if (msg.sender === user.name) return "message own-message";
    if (msg.type === "system") return "message system-message";
    return "message other-message";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const quickMessages = [
    { text: "Hello! 👋", emoji: "👋" },
    { text: "Any LPU updates? 📢", emoji: "📢" },
    { text: "Need help with... ❓", emoji: "❓" },
    { text: "Thank you! 🙏", emoji: "🙏" },
    { text: "Great! 👍", emoji: "👍" },
    { text: "See you later 👋", emoji: "👋" }
  ];

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <div className="lpu-logo">🎓</div>
          <div className="header-info">
            <h2>LPU Live Chat</h2>
            <p>Connect with LPU Community</p>
          </div>
        </div>
        <div className="header-right">
          <div className="connection-status">
            <div className={`status-dot ${isConnected ? "connected" : "disconnected"}`}></div>
            <span>{isConnected ? "Connected" : "Connecting..."}</span>
          </div>
          <div className="online-indicator">
            <div className="online-dot"></div>
            <span>{onlineUsers.length} Online</span>
          </div>
          <div className="user-profile">
            <div 
              className="user-avatar"
              style={{ backgroundColor: getAvatarColor(user.name) }}
            >
              {getAvatarChar(user.name)}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-content">
        {/* Online Users Sidebar */}
        <div className="online-users-sidebar">
          <h3>👥 Online Users ({onlineUsers.length})</h3>
          <div className="users-list">
            {onlineUsers.length === 0 ? (
              <div className="no-users">
                <p>No other users online</p>
              </div>
            ) : (
              onlineUsers.map((onlineUser, index) => (
                <div key={index} className="online-user">
                  <div 
                    className="user-avatar small"
                    style={{ backgroundColor: getAvatarColor(onlineUser.name) }}
                  >
                    {getAvatarChar(onlineUser.name)}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{onlineUser.name}</span>
                    <span className="user-role">{onlineUser.role}</span>
                    <span className="user-dept">{onlineUser.department}</span>
                  </div>
                  <div className="status-dot online"></div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="main-chat">
          <div className="chat-messages" id="chat-messages">
            {chat.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-icon">💬</div>
                <h3>Welcome to LPU Chat!</h3>
                <p>Be the first to start a conversation. Say hello to the community!</p>
              </div>
            ) : (
              chat.map((msg, index) => (
                <div key={msg.id || index} className={getMessageStyle(msg)}>
                  {msg.type !== "system" && (
                    <div 
                      className="message-avatar"
                      style={{ backgroundColor: getAvatarColor(msg.sender) }}
                    >
                      {msg.avatar || getAvatarChar(msg.sender)}
                    </div>
                  )}
                  <div className="message-content">
                    {msg.type !== "system" && (
                      <div className="message-header">
                        <strong className="sender-name">{msg.sender || "Anonymous"}</strong>
                        {msg.role && (
                          <span className={`user-role-badge role-${msg.role}`}>
                            {msg.role === "admin" ? "👑 Admin" : msg.role === "staff" ? "👨‍🏫 Staff" : "🎓 Student"}
                          </span>
                        )}
                        <small className="message-time">
                          {formatTime(msg.timestamp)}
                        </small>
                      </div>
                    )}
                    <div className="message-text">{msg.text}</div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} is typing...` 
                    : `${typingUsers.length} people are typing...`}
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-container">
            <div className="input-wrapper">
              <button 
                className="emoji-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😊
              </button>
              
              <textarea
                ref={messageInputRef}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                className="chat-input"
                rows="1"
              />
              
              <button 
                onClick={sendMessage} 
                className="send-button"
                disabled={!message.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            
            {/* Quick Messages */}
            <div className="quick-messages">
              <span className="quick-label">Quick replies:</span>
              {quickMessages.map((quick, index) => (
                <button 
                  key={index}
                  className="quick-btn"
                  onClick={() => setMessage(quick.text)}
                >
                  {quick.emoji} {quick.text}
                </button>
              ))}
            </div>
            
            <div className="chat-footer">
              <div className="chat-tips">
                <span>💡 Tip: Press Enter to send, Shift+Enter for new line</span>
                <span>🔒 Secure end-to-end encrypted chat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker (Simple version) */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-list">
            {["😊", "😂", "❤️", "👍", "🎉", "👋", "🙏", "🔥", "💯", "✨", "🎓", "📚", "💻", "🤝", "💪"].map((emoji, i) => (
              <button
                key={i}
                className="emoji-item"
                onClick={() => {
                  setMessage(message + emoji);
                  setShowEmojiPicker(false);
                  messageInputRef.current?.focus();
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;