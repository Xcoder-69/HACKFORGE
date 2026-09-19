import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  textEn: string;
  textGu: string;
  time: string;
  suggestions?: string[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    textEn: 'Namaste Ramesh Patel! I am AgroMind AI, your personalized agronomist. How can I assist with your 10 Vigha farm in Kamrej today?',
    textGu: 'નમસ્તે રમેશભાઈ! હું એગ્રોમાઇન્ડ AI છું, તમારો અંગત ખેતી સલાહકાર. આજે કામરેજ સ્થિત તમારા ૧૦ વીઘા ખેતર માટે હું શું મદદ કરી શકું?',
    time: '10:00 AM',
    suggestions: [
      'Pink Bollworm symptoms in Cotton? (ગુલાબી ઈયળના ઉપાય)',
      'Should I start Drip today? (આજે પિયત આપવું?)',
      'Today Surat APMC Cotton rate? (સુરત માર્કેટ ભાવ)',
      'Soil Phosphorus deficiency treatment? (ફોસ્ફરસ ખાતર)',
    ],
  },
];

export const AiAdvisoryChat: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      textEn: text,
      textGu: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart agronomic reasoning
    setTimeout(() => {
      let replyEn = 'I have analyzed your farm telemetry in Kamrej Block A. Conditions are currently optimal with 34% soil moisture and 31°C ambient temperature.';
      let replyGu = 'તમારા બ્લોક A ના સેન્સર મુજબ જમીનમાં ૩૪% પૂરતો ભેજ છે અને ૩૧°C તાપમાન છે.';
      let suggestions: string[] = [];

      const lower = text.toLowerCase();
      if (lower.includes('bollworm') || lower.includes('ઈયળ') || lower.includes('pest')) {
        replyEn = 'For Pink Bollworm in Cotton: Install 5 pheromone traps per acre immediately with Gossyplure septa. If trap catches exceed 8 moths/day, spray Emamectin Benzoate 5% SG @ 5g per 10L water in late afternoon.';
        replyGu = 'કપાસમાં ગુલાબી ઈયળ માટે: એકરે ૫ ફેરોમોન ટ્રેપ લગાવો. જો ઉપદ્રવ વધુ હોય તો ૧૦ લીટર પાણીમાં ૫ ગ્રામ એમામેક્ટીન બેન્ઝોએટ ૫% એસજી દવા સાંજના સમયે છાંટો.';
        suggestions = ['Open Camera to scan leaf', 'Order Pheromone Traps'];
      } else if (lower.includes('drip') || lower.includes('water') || lower.includes('પિયત')) {
        replyEn = 'Soil moisture is currently at 34% (Optimal) in Block A and 38% in Block B. With rainfall expected on Monday, postpone drip irrigation for 24-48 hours to prevent root waterlogging.';
        replyGu = 'સોમવારે વરસાદની શક્યતા હોવાથી હાલ ડ્રિપ ચાલુ ન કરો જેથી કપાસના મૂળિયાંમાં પાણી ભરાઈ ન રહે.';
        suggestions = ['View 7-day weather radar', 'Check soil depth sensors'];
      } else if (lower.includes('mandi') || lower.includes('rate') || lower.includes('ભાવ')) {
        replyEn = 'Surat APMC Cotton rate today is ₹7,250/Qtl (up +₹180). Rajkot APMC is quoting ₹7,420/Qtl. We advise holding export-quality bolls for 10 more days.';
        replyGu = 'સુરત માર્કેટ યાર્ડમાં આજે કપાસનો ભાવ ₹૭,૨૫૦ પ્રતિ ક્વિન્ટલ છે. હજુ ૧૦ દિવસ માલ રોકી રાખવાની ભલામણ છે.';
        suggestions = ['Book Mandi Gate Pass', 'Compare Rajkot APMC'];
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        textEn: replyEn,
        textGu: replyGu,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] flex flex-col justify-between pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-[#163A2D] text-white py-5 px-4 md:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-lg md:text-xl font-extrabold">AgroMind AI Assistant</h1>
              </div>
              <p className="text-xs text-emerald-200">
                AI Agronomist powered by Google Gemini & KVK Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/ai-camera')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>Camera Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4 md:p-5 shadow-sm space-y-1.5 ${
                m.sender === 'user'
                  ? 'bg-[#163A2D] text-white rounded-tr-none'
                  : 'bg-white text-[#1C1C17] border border-[#E5E2DA] rounded-tl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs opacity-75 pb-1 border-b border-white/10">
                <span className="font-bold">
                  {m.sender === 'user' ? 'You (રમેશભાઈ)' : 'AgroMind AI'}
                </span>
                <span>{m.time}</span>
              </div>

              <p className="text-sm md:text-base leading-relaxed font-semibold">
                {language === 'gu' ? m.textGu : m.textEn}
              </p>
            </div>

            {/* Suggestions buttons if any */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 max-w-full">
                {m.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => {
                      if (sug.includes('Camera')) navigate('/ai-camera');
                      else if (sug.includes('Mandi')) navigate('/market');
                      else if (sug.includes('weather')) navigate('/weather-soil');
                      else handleSendMessage(sug);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-[#163A2D] text-xs font-bold border border-[#E5E2DA] shadow-xs transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#717974] p-3 bg-white rounded-2xl w-36 border border-[#E5E2DA]">
            <span className="material-symbols-outlined text-[18px] text-emerald-700 animate-spin">
              autorenew
            </span>
            <span>AI Analyzing...</span>
          </div>
        )}
      </div>

      {/* Input Dock */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#E5E2DA] p-3 md:p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/ai-camera')}
            className="w-11 h-11 rounded-2xl bg-[#F6F3EA] text-[#163A2D] hover:bg-emerald-100 flex items-center justify-center transition-colors shrink-0"
            title="Attach Leaf Photo"
          >
            <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
          </button>

          <input
            type="text"
            placeholder="Ask about fertilizer, pest diagnosis, or mandi rates in Gujarati/English..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 h-11 px-4 rounded-2xl border border-[#C1C8C3] focus:border-emerald-600 focus:outline-none text-sm font-semibold"
          />

          <button
            onClick={() => handleSendMessage()}
            className="w-11 h-11 rounded-2xl bg-[#163A2D] hover:bg-emerald-950 text-white flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
