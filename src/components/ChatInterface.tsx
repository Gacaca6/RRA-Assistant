import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Info, Phone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { sendMessage, Message } from '../services/geminiService';

export default function ChatInterface() {
  const [language, setLanguage] = useState<'rw' | 'en'>('rw');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Muraho! Ndi umujyanama wawe mu misoro ya RRA. Nshobora kugufasha gusobanukirwa no kwishyura imisoro. Mbaze ikibazo cyose ufite!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([
        {
          role: 'model',
          text: language === 'en'
            ? 'Hello! I am your RRA Tax Assistant. I can help you understand and pay your taxes. Ask me any question!'
            : 'Muraho! Ndi umujyanama wawe mu misoro ya RRA. Nshobora kugufasha gusobanukirwa no kwishyura imisoro. Mbaze ikibazo cyose ufite!',
        },
      ]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10); // Keep last 10 messages for context
      const responseText = await sendMessage(history, input, language);
      setMessages((prev) => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: language === 'en' ? 'There was an error sending your message. Please try again later.' : 'Habaye ikibazo mu kohereza ubutumwa. Ongera ugerageze nyuma.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00529B] rounded-full flex items-center justify-center text-white shadow-md">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#00529B] tracking-tight">RRA Tax Assistant</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Umujyanama mu Misoro</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <button
            onClick={() => setLanguage(l => l === 'rw' ? 'en' : 'rw')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gray-100 hover:bg-gray-200 text-[#00529B] transition-colors"
          >
            <Globe size={14} />
            {language === 'rw' ? 'KINY' : 'ENG'}
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm">
            <Phone size={16} />
            <span className="font-medium">3999</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm">
            <Globe size={16} />
            <span className="font-medium">etax.rra.gov.rw</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
                      msg.role === 'user' ? 'bg-[#00529B] text-white' : 'bg-white border border-gray-200 text-[#00529B]'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#00529B] text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center text-gray-400 text-sm font-medium italic">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[#00529B]">
                  <Bot size={16} />
                </div>
                <div className="flex items-center gap-2">
                  <span>{language === 'en' ? 'Thinking...' : 'Ari gutekereza...'}</span>
                  <Loader2 size={16} className="animate-spin" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4 md:p-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={language === 'en' ? "Type your question here..." : "Andika ikibazo cyawe hano..."}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] focus:border-transparent transition-all resize-none min-h-[48px] max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all ${
                  !input.trim() || isLoading
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-[#00529B] hover:bg-[#00529B]/10'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <Info size={10} />
              <span>{language === 'en' ? "Information provided is for guidance only" : "Amakuru atangwa ni ay'ubufasha gusa"}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
