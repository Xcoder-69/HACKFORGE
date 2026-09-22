import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChatMessage } from '../../types';
import { aiAssistantService } from '../../services/aiAssistantService';

export const AiAdvisoryChat: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(aiAssistantService.getMessages());
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setMessages(aiAssistantService.getMessages());
    const unsub = aiAssistantService.subscribeToMessages((newMsgs) => {
      setMessages(newMsgs);
    });
    return unsub;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    setInputText('');
    setIsTyping(true);

    try {
      await aiAssistantService.sendMessage(text);
    } catch (err) {
      console.error('Failed to send advisory message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    aiAssistantService.clearChat();
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] flex flex-col justify-between pb-28 md:pb-8">
      {/* Header */}
      <div className="bg-[#163A2D] text-white py-3 sm:py-5 px-3 sm:px-6 md:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-sm sm:text-lg md:text-xl font-extrabold">AgroMind AI Assistant</h1>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200 truncate">
                AI Agronomist • Gemini & KVK Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleClearChat}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Reset Chat History"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">refresh</span>
            </button>
            <button
              onClick={() => navigate('/ai-camera')}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">photo_camera</span>
              <span>Camera</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[75%] rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm space-y-1 sm:space-y-1.5 ${
                m.sender === 'user'
                  ? 'bg-[#163A2D] text-white rounded-tr-none'
                  : 'bg-white text-[#1C1C17] border border-[#E5E2DA] rounded-tl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs opacity-75 pb-1 border-b border-white/10">
                <span className="font-bold">
                  {m.sender === 'user' ? 'You' : 'AgroMind AI'}
                </span>
                <span>{m.time}</span>
              </div>

              <p className="text-xs sm:text-sm md:text-base leading-relaxed font-semibold">
                {language === 'gu' ? m.textGu : m.textEn}
              </p>
            </div>

            {/* Suggestions buttons if any */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 max-w-full">
                {m.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => {
                      if (sug.includes('Camera')) navigate('/ai-camera');
                      else if (sug.includes('Mandi')) navigate('/market');
                      else if (sug.includes('weather')) navigate('/weather-soil');
                      else handleSendMessage(sug);
                    }}
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-emerald-50 text-[#163A2D] text-[11px] sm:text-xs font-bold border border-[#E5E2DA] shadow-xs transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-[#717974] p-2.5 sm:p-3 bg-white rounded-xl sm:rounded-2xl w-32 sm:w-36 border border-[#E5E2DA]">
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-emerald-700 animate-spin">
              autorenew
            </span>
            <span>AI Analyzing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock - Elevated above fixed bottom nav bar on mobile */}
      <div className="sticky bottom-15 md:bottom-0 bg-white/95 backdrop-blur-md border-t border-[#E5E2DA] p-2.5 sm:p-4 z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => navigate('/ai-camera')}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#F6F3EA] text-[#163A2D] hover:bg-emerald-100 flex items-center justify-center transition-colors shrink-0"
            title="Attach Leaf Photo"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">add_a_photo</span>
          </button>

          <input
            type="text"
            placeholder="ખેતી સવાલ પૂછો (Ask farm question)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 h-10 sm:h-11 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-[#C1C8C3] focus:border-emerald-600 focus:outline-none text-xs sm:text-sm font-semibold"
          />

          <button
            onClick={() => handleSendMessage()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#163A2D] hover:bg-emerald-950 text-white flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
