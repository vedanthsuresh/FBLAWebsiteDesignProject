import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send } from 'lucide-react';
import './ChatBot.css';

const ChatBot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pre-warm the model on mount AND when language changes
  useEffect(() => {
    const preWarmModel = async () => {
      try {
        await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'phi3',
            messages: [
              { role: 'system', content: getSystemPrompt() },
              { role: 'user', content: ' ' }
            ],
            stream: false,
          }),
        });
        console.log('Ollama model pre-warmed for language:', i18n.language);
      } catch (error) {
        console.error('Failed to pre-warm Ollama model:', error);
      }
    };
    preWarmModel();
  }, [i18n.language]);

  // Clear chat when language changes to prevent language mixing
  useEffect(() => {
    setMessages([]);
  }, [i18n.language]);

  // Add welcome message when chat opens or language changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: t('chatbot.welcome'),
          id: 'welcome',
        },
      ]);
    }
  }, [isOpen, t, messages.length, i18n.language]);

  const getSystemPrompt = () => {
    const language = i18n.language;
    const languageNames = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
    };
    const langName = languageNames[language] || 'English';

    return `### ROLE
You are a helpful, professional, and friendly assistant for the High Museum of Art in Atlanta, Georgia.

### CRITICAL INSTRUCTION
YOU MUST RESPOND ENTIRELY IN THE ${langName.toUpperCase()} LANGUAGE. 
DO NOT USE ANY ENGLISH UNLESS IT IS A PROPER NOUN OR A DIRECT QUOTE.
IF THE USER SPEAKS ANOTHER LANGUAGE, YOU STILL RESPOND IN ${langName.toUpperCase()}.

### CONCISENESS RULES
- GIVE VERY CONCISE ANSWERS.
- AVOID LONG EXPLANATIONS OR FLUFF.
- GET STRAIGHT TO THE POINT.
- STILL USE FULL SENTENCES, NOT BULLET POINTS.

### MUSEUM INFORMATION
About the High Museum of Art:
- Founded in 1905 as the Atlanta Art Association
- Premier art institution in the Southeastern United States
- Over 18,000 works in the permanent collection
- Seven dedicated curatorial departments: African Art, American Art, Decorative Arts, European Art, Folk Art, Modern & Contemporary Art, and Photography
- Features buildings by Pritzker Prize-winning architects Richard Meier (1983) and Renzo Piano (2005)
- Over 312,000 square feet of gallery space
- Location: 1280 Peachtree Street NE, Atlanta, GA 30309
- Accessible via MARTA Arts Center Station

Hours:
- Tuesday - Saturday: 10:00 AM - 5:00 PM
- Sunday: 12:00 PM - 5:00 PM
- Monday: Closed
- Free admission on the second Sunday of each month

Notable Collections:
- One of the nation's leading collections of Southern and African American folk art
- Significant African art collection
- American art spanning multiple centuries
- European masterworks including Impressionist paintings
- Contemporary and modern art

Answer questions about the museum, its collections, visiting information, exhibitions, and general art-related topics. Be extremely brief, friendly, and straight to the point. If you don't know something specific about the museum, acknowledge it honestly and suggest contacting the museum directly.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add a placeholder message for the assistant that we will update with the stream
      const assistantMessageId = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          id: assistantMessageId
        },
      ]);

      // Build conversation history for Ollama
      const conversationHistory = messages
        .filter((msg) => !msg.isWelcome)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const payload = {
        model: 'phi3',
        messages: [
          { role: 'system', content: getSystemPrompt() },
          ...conversationHistory,
          userMessage
        ],
        stream: true, // Enable streaming
      };

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Ollama');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Ollama sends multiple JSON objects in one chunk sometimes
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              fullResponse += data.message.content;

              // Update the specific assistant message by its ID
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullResponse }
                    : msg
                )
              );
            }
            if (data.done) break;
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }

    } catch (error) {
      console.error('Error calling Ollama API:', error);
      const errorMessage =
        i18n.language === 'es'
          ? 'Lo siento, hubo un error de conexión local. Por favor, asegúrate de que Ollama esté funcionando.'
          : i18n.language === 'fr'
            ? 'Désolé, une erreur de connexion locale s\'est produite. Veuillez vous assurer qu\'Ollama est en cours d\'exécution.'
            : 'Sorry, there was a local connection error. Please ensure Ollama is running correctly on this tablet.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
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
            <div className="chatbot-header-text">
              <h3>{t('chatbot.title')}</h3>
              <span className="chatbot-subtitle mt-2">Powered by Local AI (Ollama)</span>
            </div>
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
              msg.content && (
                <div
                  key={index}
                  className={`chatbot-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'
                    }`}
                >
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              )
            ))}
            {isLoading && (!messages[messages.length - 1] || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content) && (
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
