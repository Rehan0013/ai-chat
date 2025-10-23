import { useState, useEffect, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket connection and event listeners
  useEffect(() => {
    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // Listen for AI responses
    socketInstance.on("ai-response", (data) => {
      console.log("AI Response:", data);
      setMessages((prev) => [
        ...prev,
        {
          text: data.response || data.text,
          sender: "bot",
        },
      ]);
    });

    socketInstance.on("ai-message-response", (data) => {
      console.log("AI Message Response:", data);
      setMessages((prev) => [
        ...prev,
        {
          text: data.response,
          sender: "bot",
        },
      ]);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "" && socket && isConnected) {
      // Add user message to UI immediately
      const userMessage = { text: inputMessage, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);

      // Send message to server
      socket.emit("ai-message", inputMessage);

      // Clear input
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Markdown components for custom styling
  const MarkdownComponents = {
    h1: ({ node, ...props }) => (
      <h1
        style={{ fontSize: "1.5em", margin: "16px 0 8px 0", color: "#1f2937" }}
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        style={{ fontSize: "1.3em", margin: "14px 0 7px 0", color: "#1f2937" }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        style={{ fontSize: "1.1em", margin: "12px 0 6px 0", color: "#1f2937" }}
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p style={{ margin: "8px 0", lineHeight: "1.5" }} {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul style={{ margin: "8px 0", paddingLeft: "20px" }} {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol style={{ margin: "8px 0", paddingLeft: "20px" }} {...props} />
    ),
    li: ({ node, ...props }) => (
      <li style={{ margin: "4px 0", lineHeight: "1.4" }} {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong style={{ fontWeight: "600", color: "#1f2937" }} {...props} />
    ),
    em: ({ node, ...props }) => (
      <em style={{ fontStyle: "italic" }} {...props} />
    ),
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code
          style={{
            backgroundColor: "#f3f4f6",
            padding: "2px 6px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "0.9em",
          }}
          {...props}
        />
      ) : (
        <code
          style={{
            backgroundColor: "#f3f4f6",
            padding: "12px",
            borderRadius: "6px",
            fontFamily: "monospace",
            display: "block",
            overflowX: "auto",
            fontSize: "0.9em",
            margin: "8px 0",
          }}
          {...props}
        />
      ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        style={{
          borderLeft: "4px solid #007bff",
          paddingLeft: "12px",
          margin: "8px 0",
          color: "#6b7280",
          fontStyle: "italic",
        }}
        {...props}
      />
    ),
  };

  return (
    <div className="chat-container">
      {/* Connection Status */}
      <div
        className={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="welcome-message">
              <h3>Welcome to AI ChatBot! 🤖</h3>
              <p>Start a conversation by sending a message below.</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <div className="message-content">
                {message.sender === "bot" ? (
                  <ReactMarkdown components={MarkdownComponents}>
                    {message.text}
                  </ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
              <div className="message-sender">
                {message.sender === "user" ? "You" : "AI Assistant"}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={!isConnected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || !isConnected}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
