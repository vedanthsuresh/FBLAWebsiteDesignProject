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
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenAI({ apiKey });
      console.log('GoogleGenAI initialized successfully');
    } else {
      console.error('VITE_GEMINI_API_KEY is not defined');
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
          role: 'model',
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

    return `You are a helpful assistant for the High Museum of Art in Atlanta, Georgia. 
You should respond in ${languageNames[language] || 'English'} language.

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

Answer questions about the museum, its collections, visiting information, exhibitions, and general art-related topics. Be friendly, informative, and concise. If you don't know something specific about the museum, acknowledge it honestly and suggest contacting the museum directly.`;
  };

  // Define function declarations for the chatbot
  const getMuseumInfoFunctionDeclaration = {
    name: 'get_museum_info',
    description: 'Retrieves specific information about the High Museum of Art, such as hours, location, admission prices, or collection highlights.',
    parameters: {
      type: 'object',
      properties: {
        info_type: {
          type: 'string',
          enum: ['hours', 'location', 'admission', 'collections', 'exhibitions', 'accessibility'],
          description: 'The type of information requested about the museum.',
        },
      },
      required: ['info_type'],
    },
  };

  // Mock function to get museum information
  const getMuseumInfo = (info_type) => {
    const info = {
      hours: 'Tuesday - Saturday: 10:00 AM - 5:00 PM, Sunday: 12:00 PM - 5:00 PM, Monday: Closed. Free admission on the second Sunday of each month.',
      location: '1280 Peachtree Street NE, Atlanta, GA 30309. Accessible via MARTA Arts Center Station.',
      admission: 'General admission prices vary. Free admission on the second Sunday of each month. Please check the museum website for current pricing.',
      collections: 'The museum has over 18,000 works across seven curatorial departments: African Art, American Art, Decorative Arts, European Art, Folk Art, Modern & Contemporary Art, and Photography.',
      exhibitions: 'The museum regularly hosts rotating exhibitions. Please visit the museum website or contact them directly for current exhibition information.',
      accessibility: 'The museum is accessible via MARTA Arts Center Station and provides full accessibility accommodations for visitors.',
    };
    return info[info_type] || 'Information not available. Please contact the museum directly.';
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
      // Build conversation history
      const contents = [...messages, userMessage]
        .filter((msg) => !msg.isWelcome)
        .map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        }));

      // Configuration with function declarations
      const config = {
        systemInstruction: getSystemPrompt(),
        temperature: 0.7,
        maxOutputTokens: 500,
        tools: [{
          functionDeclarations: [getMuseumInfoFunctionDeclaration]
        }],
      };

      // Call the model with function declarations
      let response = await genAI.current.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: contents,
        config: config,
      });

      // Check if the model wants to call a function
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        console.log(`Function to call: ${functionCall.name}`);
        console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);

        // Execute the function
        let functionResult;
        if (functionCall.name === 'get_museum_info') {
          functionResult = getMuseumInfo(functionCall.args.info_type);
        }

        // Add the function call to conversation history
        const functionCallMessage = {
          role: 'model',
          parts: [{
            functionCall: {
              name: functionCall.name,
              args: functionCall.args,
            }
          }],
        };

        // Add the function response to conversation history
        const functionResponseMessage = {
          role: 'user',
          parts: [{
            functionResponse: {
              name: functionCall.name,
              response: {
                result: functionResult,
              }
            }
          }],
        };

        // Update contents with function call and response
        const updatedContents = [
          ...contents,
          functionCallMessage,
          functionResponseMessage,
        ];

        // Call the model again with the function result
        response = await genAI.current.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: updatedContents,
          config: config,
        });
      }

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
            <div className="chatbot-header-text">
              <h3>{t('chatbot.title')}</h3>
              <span className="chatbot-subtitle mt-2">Powered by Gemini</span>
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
