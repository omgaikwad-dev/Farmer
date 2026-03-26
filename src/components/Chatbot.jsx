import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiGlobe } from 'react-icons/fi';
import './Chatbot.css';

const botResponses = {
  english: {
    greeting: "Hello! I am your AI assistant. How can I help you today?",
    default: "I understand you need help. Can you provide more details?",
    price: "Prices vary based on market conditions. Check the Price Insights page.",
    transport: "You can book transport directly from the Transport page seamlessly.",
  },
  hindi: {
    greeting: "नमस्ते! मैं आपका एआई सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    default: "मैं समझता हूं कि आपको मदद की जरूरत है। क्या आप अधिक जानकारी दे सकते हैं?",
    price: "बाजार की स्थितियों के आधार पर कीमतें भिन्न होती हैं। मूल्य अंतर्दृष्टि पृष्ठ देखें।",
    transport: "आप परिवहन पृष्ठ से निर्बाध रूप से परिवहन बुक कर सकते हैं।",
  },
  marathi: {
    greeting: "नमस्कार! मी तुमचा एआय सहाय्यक आहे. मी तुम्हाला आज कशी मदत करू शकतो?",
    default: "मला समजले की तुम्हाला मदतीची आवश्यकता आहे. तुम्ही अधिक माहिती देऊ शकता का?",
    price: "बाजाराच्या परिस्थितीनुसार किमती बदलतात. 'किंमत अंतर्दृष्टी' पृष्ठ तपासा.",
    transport: "तुम्ही ट्रान्सपोर्ट पेजवरून थेट ट्रान्सपोर्ट बुक करू शकता.",
  }
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('english');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ text: botResponses[lang].greeting, isBot: true }]);
    }
  }, [isOpen, lang, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    setMessages(prev => [...prev, { text: `Language changed to ${newLang.charAt(0).toUpperCase() + newLang.slice(1)}`, isBot: true }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { text: botResponses[newLang].greeting, isBot: true }]);
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = botResponses[lang].default;
      const lowerReq = userMsg.toLowerCase();
      if (lowerReq.includes('price') || lowerReq.includes('किंमत') || lowerReq.includes('मूल्य')) {
        reply = botResponses[lang].price;
      } else if (lowerReq.includes('transport') || lowerReq.includes('परिवहन') || lowerReq.includes('वाहतूक')) {
        reply = botResponses[lang].transport;
      }

      setMessages(prev => [...prev, { text: reply, isBot: true }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      <button className="chatbot-floating-btn" onClick={toggleChat}>
        <FiMessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-title">
                🤖 AI Assistant
              </div>
              <div className="chatbot-controls">
                <div className="lang-selector">
                  <FiGlobe />
                  <select value={lang} onChange={handleLanguageChange}>
                    <option value="english">ENG</option>
                    <option value="hindi">हिंदी</option>
                    <option value="marathi">मराठी</option>
                  </select>
                </div>
                <button className="chatbot-close" onClick={toggleChat}>
                  <FiX />
                </button>
              </div>
            </div>

            <div className="chatbot-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.isBot ? 'bot' : 'user'}`}>
                  {m.text}
                </div>
              ))}
              {isTyping && (
                <div className="chat-msg bot typing-indicator">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input">
              <input
                type="text"
                placeholder={lang === 'english' ? "Type a message..." : lang === 'hindi' ? "संदेश लिखें..." : "संदेश टाइप करा..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} disabled={!input.trim()}>
                <FiSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
