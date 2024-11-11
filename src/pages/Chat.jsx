// src/pages/Chat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Replace this with your actual API call
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      });

      const data = await response.json();

      // Add assistant's response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
      }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-black-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center">
          <img
            src={`${import.meta.env.BASE_URL}images/img_header_logo.png`}
            alt="Yugen Space Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-4">
          <img
            src={user?.picture}
            alt={user?.name}
            className="w-8 h-8 rounded-full"
          />
          <button
            onClick={handleLogout}
            className="text-white text-sm hover:text-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto pt-20 pb-32">
        <div className="max-w-3xl mx-auto px-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`py-6 ${
                message.role === 'user' ? 'bg-transparent' : 'bg-gray-900/50'
              }`}
            >
              <div className="max-w-3xl mx-auto px-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  {message.role === 'user' ? (
                    <img
                      src={user?.picture}
                      alt="User"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <img
                        src={`${import.meta.env.BASE_URL}images/img_header_logo.png`}
                        alt="Assistant"
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="text-white min-h-[20px] flex-1">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="py-6 bg-gray-900/50">
              <div className="max-w-3xl mx-auto px-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <img
                    src={`${import.meta.env.BASE_URL}images/img_header_logo.png`}
                    alt="Assistant"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="text-white">Thinking...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-black-900/80 backdrop-blur-sm border-t border-gray-800">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto p-4"
        >
          <div className="relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:hover:text-gray-400 transition-colors"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;