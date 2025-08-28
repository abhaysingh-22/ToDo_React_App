import React, { useState, useRef, useEffect } from 'react';
import { BsChatDotsFill } from 'react-icons/bs';
import { RxCross2 } from 'react-icons/rx';
import { FaRegCommentDots } from 'react-icons/fa';
import { FaRegPaperPlane } from 'react-icons/fa';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const apiKey = import.meta.env.VITE_GEMENI_API_KEY;

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: inputMessage }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        // Extract text from response
        const botText = data.candidates[0].content.parts[0].text;

        // Add bot message to chat
        setMessages(prevMessages => [
          ...prevMessages,
          { text: botText, sender: 'bot' }
        ]);
      } else {
        // Handle error
        setMessages(prevMessages => [
          ...prevMessages,
          { text: "I'm sorry, I couldn't process that request. Please try again.", sender: 'bot' }
        ]);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: "Sorry, there was an error connecting to the service. Please try again later.", sender: 'bot' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-2 right-3 z-50">
      {/* Toggle Button */}
      <button
        onClick={toggleChatbot}
        className={`bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen ? 'hidden' : ''}`}
        aria-label="Toggle chatbot"
        style={{ position: 'fixed', bottom: '0', right: 0, zIndex: 1000 }}
      >
        <BsChatDotsFill className="h-5 w-5" />
      </button>

      {/* Chatbot Interface */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-80 sm:w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2"><FaRegCommentDots />Assistant</h3>
            <button
              onClick={toggleChatbot}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close chatbot"
            >
              <RxCross2 className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <FaRegCommentDots className="h-12 w-12 mx-auto mb-4" />
                  <p>How can I assist you today?</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 focus:outline-none bg-transparent text-gray-900 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FaRegPaperPlane className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot
