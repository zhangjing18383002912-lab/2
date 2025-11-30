
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Trash2, Loader2 } from 'lucide-react';
import { streamMedicalAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown'; 

export interface AssistantChatRef {
  sendMessage: (text: string) => void;
  open: () => void;
}

interface AssistantChatProps {
  context: string;
}

const AssistantChat = forwardRef<AssistantChatRef, AssistantChatProps>(({ context }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '您好！我是您的胃癌科普助手。\n\n关于确诊、治疗或康复，有什么想问的吗？' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref to track the current message being streamed to avoid closure staleness
  const currentStreamId = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    sendMessage: (text) => {
      setIsOpen(true);
      handleSend(text);
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare placeholder for bot message
    const botMsgId = (Date.now() + 1).toString();
    currentStreamId.current = botMsgId;
    
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

    try {
      await streamMedicalAssistant(text, context, (chunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, text: msg.text + chunk }
            : msg
        ));
      });
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
            ? { ...msg, text: msg.text + "\n\n[网络连接中断，请重试]" }
            : msg
      ));
    } finally {
      setIsLoading(false);
      currentStreamId.current = null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto border border-slate-200 mb-4 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot size={20} />
              </div>
              <span className="font-bold">Dr. AI 顾问</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setMessages([])} 
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                title="清空对话"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-blue-600'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  {msg.role === 'model' ? (
                     <div className="markdown-body prose prose-sm max-w-none text-slate-700 leading-relaxed">
                        <ReactMarkdown>{msg.text || (isLoading && msg.id === currentStreamId.current ? '...' : '')}</ReactMarkdown>
                     </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && !currentStreamId.current && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <Bot size={14} className="text-blue-600" />
                 </div>
                 <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl rounded-tl-none text-sm text-slate-500 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    正在思考...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入问题..."
              disabled={isLoading}
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 pointer-events-auto"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
});

export default AssistantChat;