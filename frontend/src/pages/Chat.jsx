// pages/Chat.jsx - Vite compatible
import React, { useEffect, useState } from "react";
import socket from "../socket"; // Vite handles this import

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Fetch existing messages
    fetch("http://localhost:5001/api/users/messages")
      .then(res => res.json())
      .then(messages => setChat(messages))
      .catch(err => console.error("Error fetching messages:", err));

    // Socket event listeners
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      const messageData = {
        sender: user?.name || "Anonymous",
        text: message,
        timestamp: new Date()
      };
      
      socket.emit("send_message", messageData);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <h2>💬 Live Chat</h2>
      <div style={styles.chatBox}>
        {chat.map((msg, index) => (
          <div key={index} style={styles.message}>
            <strong>{msg.sender}:</strong> {msg.text}
            <small style={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </small>
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    height: "80vh",
    display: "flex",
    flexDirection: "column",
  },
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    height: "400px",
    overflowY: "auto",
    padding: "15px",
    marginBottom: "15px",
    backgroundColor: "#f9f9f9",
  },
  message: {
    marginBottom: "10px",
    padding: "8px",
    backgroundColor: "white",
    borderRadius: "5px",
    border: "1px solid #e0e0e0",
  },
  timestamp: {
    color: "#666",
    fontSize: "0.8em",
    marginLeft: "10px",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  sendButton: {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Chat;