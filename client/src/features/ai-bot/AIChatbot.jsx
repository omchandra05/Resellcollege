import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! How can I help you find the perfect item today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          prompt: input
        })
      });
      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I couldn\'t connect to the AI service.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div className={`fixed bottom-24 right-4 md:right-8 w-[calc(100%-2rem)] max-w-sm h-[60vh] glass-card border-white/10 shadow-2xl z-[110] flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-blue-400" /><h3 className="text-white font-bold">AI Assistant</h3></div>
          <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 self-start"><Bot size={16} className="text-blue-400" /></div>}
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-slate-300 rounded-bl-none'}`}>{msg.text}</div>
            </div>
          ))}
          {isLoading && <div className="flex gap-2 justify-start"><div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0"><Bot size={16} className="text-blue-400" /></div><div className="max-w-[80%] p-3 rounded-2xl text-sm bg-white/10 text-slate-300 rounded-bl-none flex items-center"><span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mx-1"></span><span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mx-1 delay-150"></span><span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse mx-1 delay-300"></span></div></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl p-1">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask for recommendations..." className="flex-1 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 px-3 py-2 text-sm" />
            <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50"><Send size={16} /></button>
          </div>
        </div>
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-4 md:right-8 w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center z-[120] hover:scale-110 transition-transform duration-200"><Bot size={24} /></button>
    </>
  );
}
