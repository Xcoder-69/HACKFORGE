import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WelcomeLanguageSelector } from '../pages/public/WelcomeLanguageSelector';
import { Login } from '../pages/auth/Login';
import { Onboarding } from '../pages/onboarding/Onboarding';
import { MyFarm } from '../pages/farmer/MyFarm';
import { CropRecommendations } from '../pages/farmer/CropRecommendations';
import { WeatherSoilIntelligence } from '../pages/farmer/WeatherSoilIntelligence';
import { CropHealthScanner } from '../pages/farmer/CropHealthScanner';
import { AlertsActionCenter } from '../pages/farmer/AlertsActionCenter';
import { FarmerProfile } from '../pages/farmer/FarmerProfile';
import { ExpenseTracker } from '../pages/farmer/ExpenseTracker';
import { ProfitYieldOverview } from '../pages/farmer/ProfitYieldOverview';
import { MarketMandi } from '../pages/farmer/MarketMandi';
import { AiAdvisoryChat } from '../pages/farmer/AiAdvisoryChat';
import { KvkAdminDashboard } from '../pages/admin/KvkAdminDashboard';
import { FarmerLayout } from '../layouts/FarmerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminRoute } from '../components/auth/AdminRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Screen 1: Welcome & Interactive Language Selector (Public) */}
      <Route path="/" element={<WelcomeLanguageSelector />} />

      {/* Screen 2: Unified Login & Registration (Public) */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Farmer Flows */}
      <Route element={<ProtectedRoute />}>
        {/* Screen 4: Consolidated Farmer Onboarding */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Farmer Core Application Routes (wrapped in FarmerLayout) */}
        <Route element={<FarmerLayout />}>
          {/* Screen 3: My Farm & Plot Management */}
          <Route path="/home" element={<MyFarm />} />
          <Route path="/my-farm" element={<MyFarm />} />

          {/* Screen 5: Crop Recommendations & Cultivation Planning */}
          <Route path="/recommendations" element={<CropRecommendations />} />

          {/* Screen 6: Weather & Soil Intelligence */}
          <Route path="/weather-soil" element={<WeatherSoilIntelligence />} />

          {/* Screen 7: Farm Expense Tracker */}
          <Route path="/expenses" element={<ExpenseTracker />} />

          {/* Screen 8: Profit, Yield & Revenue Overview */}
          <Route path="/profit" element={<ProfitYieldOverview />} />

          {/* Screen 9: Crop Health Scanner (AI Camera) */}
          <Route path="/ai-camera" element={<CropHealthScanner />} />
          <Route path="/diagnosis" element={<CropHealthScanner />} />

          {/* Screen 10: Alerts & Recommended Action Center */}
          <Route path="/alerts" element={<AlertsActionCenter />} />

          {/* Screen 11: Farmer Profile & Settings */}
          <Route path="/profile" element={<FarmerProfile />} />

          {/* Mandi Market Intelligence */}
          <Route path="/market" element={<MarketMandi />} />

          {/* Conversational AI Agronomy Advisory */}
          <Route path="/ai-assistant" element={<AiAdvisoryChat />} />
          <Route path="/chat" element={<AiAdvisoryChat />} />
        </Route>
      </Route>

      {/* Screen 12: Admin / KVK Enterprise Command Center (Protected by AdminRoute) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<KvkAdminDashboard />} />
        </Route>
      </Route>

      {/* Default Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

