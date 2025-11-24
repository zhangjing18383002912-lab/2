import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Settings, Save, RotateCcw } from 'lucide-react';
import { askMedicalAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AssistantChatProps {
  context: string;
}

export interface AssistantChatRef {
  sendMessage: (text: string) => void;
  open: () => void;
}

// Default configuration
const DEFAULT_CONFIG = {
  apiKey: "", 
  model: "gemini-2.5-flash"
};

const AssistantChat = forwardRef<AssistantChatRef, AssistantChatProps>(({ context }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '您好！我是您的胃癌科普助手。如有疑问请随时提问。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    sendMessage: (text: string) => {
      setIsOpen(true);
      // Ensure UI is rendered before processing
      setTimeout(() => {
        handleSendInternal(text);
      }, 50);
    }
  }));

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('ai_config', JSON.stringify(config));
    setShowSettings(false);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text: `配置已更新。\n模型: ${config.model}`
    }]);
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendInternal = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Pass the current config to the service
      const answer = await askMedicalAssistant(textToSend, context, config);
      
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: answer };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "发生错误，请稍后再试。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    handleSendInternal(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 mb-4 animate-in slide-in-from-bottom-10 fade-in duration-300 relative">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">Dr. AI 科普助手</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                title="设置 API"
              >
                <Settings size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1.5 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Settings Overlay */}
          {showSettings && (
            <div className="absolute inset-0 top-[60px] bg-white z-20 p-5 overflow-y-auto animate-in fade-in duration-200">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Settings size={18} className="text-teal-600"/>
                    设置 API Key
                  </h3>
                  <button onClick={resetConfig} className="text-xs text-teal-600 flex items-center gap-1 hover:underline">
                    <RotateCcw size={12}/> 重置默认
                  </button>
               </div>
               
               <div className="space-y-4">
                 <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-2">
                    由于这是一个纯前端演示，请填写您的 Google Gemini API Key 以启用对话功能。
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">API Key</label>
                   <input 
                     type="password" 
                     value={config.apiKey}
                     onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                     placeholder="sk-..."
                     className="w-full text-sm p-2 border border-slate-300 rounded focus:border-teal-500 focus:outline-none placeholder:text-slate-400"
                   />
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">模型名称 (Model)</label>
                   <input 
                     type="text" 
                     value={config.model}
                     onChange={(e) => setConfig({...config, model: e.target.value})}
                     placeholder="gemini-2.5-flash"
                     className="w-full text-sm p-2 border border-slate-300 rounded focus:border-teal-500 focus:outline-none"
                   />
                 </div>

                 <button 
                   onClick={saveConfig}
                   className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-4"
                 >
                   <Save size={16} /> 保存配置
                 </button>
               </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-teal-500 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border flex items-center gap-2">
                    <Loader2 className="animate-spin text-teal-500" size={16} />
                    <span className="text-xs text-slate-400">正在思考...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入您的问题..."
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full p-2 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && <span className="font-semibold hidden md:block">咨询助手</span>}
      </button>
    </div>
  );
});

export default AssistantChat;