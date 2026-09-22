import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initializeDefaultData } from './services/dataInitializer';
import { notificationService } from './services/notificationService';

// Seed authentic offline data on first run
initializeDefaultData();

if (typeof window !== 'undefined') {
  (window as any).notificationService = notificationService;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

