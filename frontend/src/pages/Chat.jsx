// pages/Chat.jsx - Completely Fixed Version
import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import "../styles/Chat.css";

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Safe user object with all required properties
  const user = JSON.parse(localStorage.getItem("user")) || { 
    name: "LPU Student", 
    role: "student",
    avatar: "🎓"
  };
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  useEffect(() => {
    // Fetch existing messages
    fetch("http://localhost:5001/api/users/messages")
      .then(res => res.json())
      .then(messages => setChat(messages))
      .catch(err => console.error("Error fetching messages:", err));

    // Socket event listeners
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
      setIsTyping(false);
    });

    socket.on("user_typing", (data) => {
      setIsTyping(data.typing);
    });

    socket.on("online_users", (users) => {
      // Safe processing of online users
      const safeUsers = (users || []).map(user => ({
        name: user?.name || "Anonymous User",
        role: user?.role || "student",
        avatar: user?.avatar || "👤"
      }));
      setOnlineUsers(safeUsers);
    });

    socket.on("user_joined", (userData) => {
      setChat(prev => [...prev, {
        sender: "System",
        text: `🎉 ${userData?.name || "Someone"} joined the chat`,
        timestamp: new Date(),
        type: "system"
      }]);
    });

    socket.on("user_left", (userData) => {
      setChat(prev => [...prev, {
        sender: "System",
        text: `👋 ${userData?.name || "Someone"} left the chat`,
        timestamp: new Date(),
        type: "system"
      }]);
    });

    // Join chat room
    socket.emit("join_chat", user);

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("online_users");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, []);

  // Completely safe avatar color function
  const getAvatarColor = (sender) => {
    try {
      // Handle all possible undefined/null cases
      if (!sender || typeof sender !== 'string' || sender.trim() === '') {
        return "#FF6B6B";
      }
      
      const firstChar = sender.charAt(0);
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];
      const index = firstChar.charCodeAt(0) % colors.length;
      return colors[index];
    } catch (error) {
      console.error("Error in getAvatarColor:", error);
      return "#FF6B6B";
    }
  };

  // Safe character getter for avatars
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
        sender: user?.name || "LPU Student",
        text: message,
        timestamp: new Date(),
        avatar: user?.avatar || "🎓",
        role: user?.role || "student"
      };
      
      socket.emit("send_message", messageData);
      setMessage("");
      socket.emit("typing", { typing: false });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { typing: true });
    setTimeout(() => {
      socket.emit("typing", { typing: false });
    }, 2000);
  };

  const getMessageStyle = (msg) => {
    if (msg.sender === user.name) return "message own-message";
    if (msg.type === "system") return "message system-message";
    return "message other-message";
  };

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
            <span>{user.name}</span>
          </div>
        </div>
      </div>

      <div className="chat-content">
        {/* Online Users Sidebar */}
        <div className="online-users-sidebar">
          <h3>👥 Online Users</h3>
          <div className="users-list">
            {onlineUsers.map((onlineUser, index) => (
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
                </div>
                <div className="status-dot"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="main-chat">
          <div className="chat-messages" id="chat-messages">
            {chat.map((msg, index) => (
              <div key={index} className={getMessageStyle(msg)}>
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
                      <span className="user-role-badge">{msg.role || "user"}</span>
                      <small className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  )}
                  <div className="message-text">{msg.text}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Someone is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-container">
            <div className="input-wrapper">
              <textarea
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
              <button onClick={sendMessage} className="send-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <div className="input-features">
              <div className="quick-actions">
                <button className="quick-btn" onClick={() => setMessage("Hello! 👋")}>
                  👋 Hello
                </button>
                <button className="quick-btn" onClick={() => setMessage("Any LPU updates?")}>
                  📢 Updates
                </button>
                <button className="quick-btn" onClick={() => setMessage("Need help with...")}>
                  ❓ Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;