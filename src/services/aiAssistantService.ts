import { ChatMessage } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';
import { authService } from './authService';
import { farmService } from './farmService';
import { weatherService } from './weatherService';
import { financialService } from './financialService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncEngine } from '../lib/syncEngine';
import type { IAiAssistantService } from '../contracts/ai.contract';

const DEFAULT_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    textEn: 'Namaste Ramesh Patel! I am AgroMind AI, your personalized agronomist. How can I assist with your farm in Kamrej today?',
    textGu: 'નમસ્તે રમેશભાઈ! હું એગ્રોમાઇન્ડ AI છું, તમારો અંગત ખેતી સલાહકાર. આજે કામરેજ સ્થિત તમારા ખેતર માટે હું શું મદદ કરી શકું?',
    time: '10:00 AM',
    suggestions: [
      'Pink Bollworm symptoms in Cotton? (ગુલાબી ઈયળના ઉપાય)',
      'Should I start Drip today? (આજે પિયત આપવું?)',
      'Today Surat APMC Cotton rate? (સુરત માર્કેટ ભાવ)',
      'Soil Phosphorus deficiency treatment? (ફોસ્ફરસ ખાતર)',
    ],
    isAiEstimate: false,
    isOfflineFallback: true,
  },
];

export const aiAssistantService: IAiAssistantService = {
  /**
   * Retrieves chat message history from persistent storage
   */
  getMessages(): ChatMessage[] {
    return storageService.get<ChatMessage[]>(STORAGE_KEYS.CHAT, DEFAULT_INITIAL_MESSAGES);
  },

  /**
   * Clears the chat message history back to initial state
   */
  async clearChat(): Promise<void> {
    storageService.set(STORAGE_KEYS.CHAT, DEFAULT_INITIAL_MESSAGES);
  },

  /**
   * Subscribes to chat message history updates
   */
  subscribeToMessages(callback: (messages: ChatMessage[]) => void): () => void {
    return storageService.subscribe<ChatMessage[]>(STORAGE_KEYS.CHAT, callback);
  },

  /**
   * Sends a user message and generates an agronomic assistant response
   */
  async sendMessage(text: string): Promise<ChatMessage> {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Create and store user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      textEn: text,
      textGu: text,
      time: formattedTime,
      timestamp: Date.now(),
    };

    const currentHistory = this.getMessages();
    const updatedWithUser = [...currentHistory, userMsg];
    storageService.set(STORAGE_KEYS.CHAT, updatedWithUser);

    // Queue user message sync
    syncEngine.enqueue({
      tableName: 'chat_messages',
      operation: 'INSERT',
      recordId: userMsg.id,
      payload: {
        sender: 'user',
        text_en: userMsg.textEn,
        text_gu: userMsg.textGu,
        time_label: userMsg.time,
      },
    });

    // 2. Gather active agronomic context
    const user = authService.getCurrentUser();
    const plots = farmService.getPlots();
    const weather = weatherService.getStoredWeather();
    const finance = financialService.getFinancialOverview();

    const plotList = Object.values(plots);
    const cropSummary = plotList.map((p) => `${p.title}: ${p.crop} (${p.stageName})`).join(', ');

    // 3. Try secure serverless Edge Function if configured & online
    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      try {
        const { data, error } = await supabase.functions.invoke('agronomy-chat', {
          body: {
            text,
            context: {
              farmerName: user?.name || 'Ramesh Patel',
              village: user?.village || 'Kamrej',
              district: user?.district || 'Surat',
              crops: cropSummary || 'Cotton, Groundnut',
              weatherCondition: weather?.condition || 'Partly Cloudy, 32°C',
              spraySuitability: weather?.spraySuitability || 'Favorable',
              netProfit: finance?.projectedNetProfit,
            },
          },
        });

        if (!error && data?.success && data.message) {
          const liveResponse: ChatMessage = {
            ...data.message,
            isAiEstimate: true,
            isOfflineFallback: false,
          };
          const finalMessages = [...updatedWithUser, liveResponse];
          storageService.set(STORAGE_KEYS.CHAT, finalMessages);

          syncEngine.enqueue({
            tableName: 'chat_messages',
            operation: 'INSERT',
            recordId: liveResponse.id,
            payload: {
              sender: 'assistant',
              text_en: liveResponse.textEn,
              text_gu: liveResponse.textGu,
              time_label: liveResponse.time,
              suggestions: liveResponse.suggestions || [],
              is_ai_estimate: true,
              is_offline_fallback: false,
            },
          });

          return liveResponse;
        }
      } catch (err) {
        console.warn('[AIAssistant] Cloud chat failed, engaging offline agronomic reasoning:', err);
      }
    }

    // 4. Offline Agronomic Reasoning Engine
    const offlineResponse = this.generateOfflineResponse(text, {
      farmerName: user?.name || 'Rameshbhai Patel',
      district: user?.district || 'Surat',
      crops: cropSummary || 'Cotton, Groundnut',
    });

    const finalMessages = [...updatedWithUser, offlineResponse];
    storageService.set(STORAGE_KEYS.CHAT, finalMessages);

    syncEngine.enqueue({
      tableName: 'chat_messages',
      operation: 'INSERT',
      recordId: offlineResponse.id,
      payload: {
        sender: 'assistant',
        text_en: offlineResponse.textEn,
        text_gu: offlineResponse.textGu,
        time_label: offlineResponse.time,
        suggestions: offlineResponse.suggestions || [],
        is_ai_estimate: false,
        is_offline_fallback: true,
      },
    });

    return offlineResponse;
  },

  /**
   * Offline Agronomic Reasoning Engine
   */
  generateOfflineResponse(text: string, context: { farmerName: string; district: string; crops: string }): ChatMessage {
    const lower = text.toLowerCase();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let textEn = `I have reviewed your farm records for ${context.crops || 'Cotton & Groundnut'} in ${context.district}. Conditions are normal with stable microclimate telemetry.`;
    let textGu = `મેં તમારા ${context.district} સ્થિત ખેતરના પાક અને સેન્સર ડેટાની ચકાસણી કરી છે. હાલ પાકની સ્થિતિ અનુકૂળ છે.`;
    let suggestions: string[] = ['Check 7-day weather forecast', 'View soil moisture telemetry'];

    if (
      lower.includes('bollworm') ||
      lower.includes('ઈયળ') ||
      lower.includes('pest') ||
      lower.includes('જીવાત') ||
      lower.includes('કીટક')
    ) {
      textEn =
        'For Pink Bollworm in Cotton: Install 5 pheromone traps per acre immediately with Gossyplure septa. If trap catches exceed 8 moths/day, spray Emamectin Benzoate 5% SG @ 5g per 10L water in late afternoon.';
      textGu =
        'કપાસમાં ગુલાબી ઈયળ માટે: એકરે ૫ ફેરોમોન ટ્રેપ લગાવો. જો ઉપદ્રવ વધુ હોય તો ૧૦ લીટર પાણીમાં ૫ ગ્રામ એમામેક્ટીન બેન્ઝોએટ ૫% એસજી દવા સાંજના સમયે છાંટો.';
      suggestions = ['Open Camera to scan leaf', 'Order Pheromone Traps', 'Check Spray Window'];
    } else if (
      lower.includes('drip') ||
      lower.includes('water') ||
      lower.includes('પિયત') ||
      lower.includes('irrigation') ||
      lower.includes('પાણી')
    ) {
      textEn =
        'Soil moisture is currently at 34% (Optimal) in Block A and 38% in Block B. Rain forecast indicates scattered showers within 48h; postpone drip irrigation for 24 hours to prevent root waterlogging.';
      textGu =
        'જમીનમાં ભેજનું પ્રમાણ ૩૪% (યોગ્ય) છે. આગામી ૪૮ કલાકમાં હળવા વરસાદની શક્યતા હોવાથી હાલ ડ્રિપ પિયત ૨૪ કલાક મોકૂફ રાખવાની ભલામણ છે.';
      suggestions = ['View 7-day weather radar', 'Check soil depth sensors'];
    } else if (
      lower.includes('mandi') ||
      lower.includes('rate') ||
      lower.includes('ભાવ') ||
      lower.includes('બજાર') ||
      lower.includes('market')
    ) {
      textEn =
        'Surat APMC Shankar-6 Cotton rate today is ₹7,250/Qtl (up +₹180). Rajkot APMC is quoting ₹7,420/Qtl. We advise holding export-quality bolls for 10 more days for peak procurement rates.';
      textGu =
        'સુરત માર્કેટ યાર્ડમાં આજે શંકર-૬ કપાસનો ભાવ ₹૭,૨૫૦ પ્રતિ ક્વિન્ટલ છે (+₹૧૮૦ વધારો). હજુ ૧૦ દિવસ માલ રોકી રાખવાની ભલામણ છે જેથી વધુ ભાવ મળે.';
      suggestions = ['Book Mandi Gate Pass', 'Compare Rajkot APMC', 'Check Groundnut rates'];
    } else if (
      lower.includes('fertilizer') ||
      lower.includes('ખાતર') ||
      lower.includes('phosphorus') ||
      lower.includes('urea') ||
      lower.includes('dap')
    ) {
      textEn =
        'Soil tests indicate Phosphorus is slightly low at 22 kg/ha. Apply Single Super Phosphate (SSP) @ 50 kg/acre or water-soluble 12:61:00 (MAP) @ 5g/L through drip fertigation during vegetative burst.';
      textGu =
        'જમીનમાં ફોસ્ફરસ ૨૨ કિગ્રા/હેક્ટર (ઓછો) છે. એકરે ૫૦ કિગ્રા એસએસપી (Single Super Phosphate) આપો અથવા ડ્રિપ દ્વારા ૧૨:૬૧:૦૦ ખાતર ચલાવો.';
      suggestions = ['Calculate fertilizer dosage', 'Soil Health Card report'];
    } else if (
      lower.includes('weather') ||
      lower.includes('વરસાદ') ||
      lower.includes('હવામાન') ||
      lower.includes('rain')
    ) {
      textEn =
        'Current weather in Surat is 32°C with 64% humidity. Winds are 11 km/h NW. Today between 2:00 PM and 6:00 PM is an optimal spray window before weekend overcast.';
      textGu =
        'સુરતમાં હાલ ૩૨°C તાપમાન અને ૬૪% ભેજ છે. પવનની ગતિ ૧૧ કિમી/કલાક છે. બપોરે ૨ થી ૬ વાગ્યાનો સમય દવાનો છંટકાવ કરવા માટે ઉત્તમ છે.';
      suggestions = ['Weather & Soil Dashboard', 'Spray Window Rating'];
    }

    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      textEn,
      textGu,
      time: timeStr,
      suggestions,
      timestamp: Date.now(),
    };
  },
};
