import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Settings, Save } from 'lucide-react';
import { askMedicalAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AssistantChatProps {
  context: string;
}

// Default configuration (using DeepSeek as a stable example, but user can change)
const DEFAULT_CONFIG = {
  baseUrl: "https://api.deepseek.com",
  apiKey: "",
  model: "deepseek-chat"
};

const AssistantChat: React.FC<AssistantChatProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '您好！我是您的胃癌科普助手。您可以点击右上角的设置⚙️更换 AI 模型（如 DeepSeek、Kimi 等）。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [config, setConfig] = useState(DEFAULT_CONFIG);

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
    // Add a system message indicating change
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text: `已更新配置。当前模型: ${config.model}。`
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!config.apiKey) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: '⚠️ 请先点击右上角设置图标 (⚙️) 填入您的 API Key。'
      }]);
      setShowSettings(true);
      return;
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Pass the current config to the service
    const answer = await askMedicalAssistant(userMsg.text, context, config);
    
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: answer };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
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
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Settings size={18} className="text-teal-600"/>
                 模型设置
               </h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">API 地址 (Base URL)</label>
                   <input 
                     type="text" 
                     value={config.baseUrl}
                     onChange={(e) => setConfig({...config, baseUrl: e.target.value})}
                     placeholder="https://api.deepseek.com"
                     className="w-full text-sm p-2 border border-slate-300 rounded focus:border-teal-500 focus:outline-none"
                   />
                   <p className="text-[10px] text-slate-400 mt-1">例如: https://api.deepseek.com 或 https://api.moonshot.cn/v1</p>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">API Key</label>
                   <input 
                     type="password" 
                     value={config.apiKey}
                     onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                     placeholder="sk-..."
                     className="w-full text-sm p-2 border border-slate-300 rounded focus:border-teal-500 focus:outline-none"
                   />
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">模型名称 (Model)</label>
                   <input 
                     type="text" 
                     value={config.model}
                     onChange={(e) => setConfig({...config, model: e.target.value})}
                     placeholder="deepseek-chat"
                     className="w-full text-sm p-2 border border-slate-300 rounded focus:border-teal-500 focus:outline-none"
                   />
                   <p className="text-[10px] text-slate-400 mt-1">常用: deepseek-chat, moonshot-v1-8k, gpt-4o-mini</p>
                 </div>

                 <button 
                   onClick={saveConfig}
                   className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-4"
                 >
                   <Save size={16} /> 保存配置
                 </button>
                 
                 <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-500 border border-slate-100">
                   <p>提示：您的 Key 仅保存在本地浏览器中，请放心使用。</p>
                 </div>
               </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
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
              placeholder={config.apiKey ? "输入您的问题..." : "请先配置 API Key"}
              disabled={!config.apiKey}
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !config.apiKey}
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
};

export default AssistantChat;