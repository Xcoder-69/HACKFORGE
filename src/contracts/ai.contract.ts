// Typed AI Intelligence Contracts for AgroMind AI
// Governs Crop Leaf Vision Diagnostics and Agronomy Advisory Chat
import type { DiagnosisResult, ChatMessage } from '../types';

export interface DiagnoseRequest {
  imageBase64?: string;
  imageFile?: File;
  crop: string;
  stage?: string;
  farmerId?: string;
}

export interface DiagnoseResponse {
  success: boolean;
  result: DiagnosisResult;
  source: 'gemini_vision_cloud' | 'local_pathology_engine';
  isOfflineFallback: boolean;
  error?: string;
}

export interface SendMessageRequest {
  text: string;
  farmerId?: string;
  context?: {
    farmerName?: string;
    village?: string;
    district?: string;
    crops?: string;
    weatherCondition?: string;
    spraySuitability?: string;
    netProfit?: number;
  };
}

export interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
  source: 'gemini_chat_cloud' | 'local_agronomy_engine';
  isOfflineFallback: boolean;
  error?: string;
}

export interface IAiVisionService {
  diagnoseLeaf(params: DiagnoseRequest): Promise<DiagnosisResult>;
  getScanHistory(): DiagnosisResult[];
  saveScan(scan: DiagnosisResult): Promise<void>;
  subscribeToScans(callback: (scans: DiagnosisResult[]) => void): () => void;
}

export interface IAiAssistantService {
  getMessages(): ChatMessage[];
  clearChat(): Promise<void>;
  sendMessage(text: string): Promise<ChatMessage>;
  subscribeToMessages(callback: (messages: ChatMessage[]) => void): () => void;
}
