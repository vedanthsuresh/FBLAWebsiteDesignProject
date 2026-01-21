import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI } from '@google/genai';
import { MessageCircle, X, Send } from 'lucide-react';
import './ChatBot.css';

const ChatBot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const genAI = useRef(null);

  // Initialize GoogleGenAI
  useEffect(() => {
    const apiKey = import.meta.env.GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenAI({ apiKey });
      console.log('GoogleGenAI initialized successfully');
    } else {
      console.error('GEMINI_API_KEY is not defined');
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'user',
          parts: [{ text: t('chatbot.welcome') }],
          isWelcome: true,
        },
      ]);
    }
  }, [isOpen, t, messages.length]);

  const getSystemPrompt = () => {
    const language = i18n.language;
    const languageNames = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
    };

    return 
  };

  const handleSend = async () => {
    if (!input.trim() || !genAI.current) return;

    const userMessage = {
      role: 'user',
      parts: [{ text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history (all messages including the new user message)
      const contents = [...messages, userMessage]
        .filter((msg) => !msg.isWelcome)
        .map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        }));

      // Call the model using the official pattern
      const response = await genAI.current.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: contents,
        config: {
          systemInstruction: getSystemPrompt(),
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      // Extract the response text
      const responseText = response.text || '';

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: responseText }],
        },
      ]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage =
        i18n.language === 'es'
          ? 'Lo siento, hubo un error. Por favor, inténtalo de nuevo.'
          : i18n.language === 'fr'
            ? 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
            : 'Sorry, there was an error. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: errorMessage }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <h3>{t('chatbot.title')}</h3>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label={t('chatbot.close')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'
                  }`}
              >
                <div className="message-content">
                  {msg.parts?.[0]?.text || ''}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message assistant-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-container">
            <input
              type="text"
              className="chatbot-input"
              placeholder={t('chatbot.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="chatbot-send"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label={t('chatbot.send')}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
