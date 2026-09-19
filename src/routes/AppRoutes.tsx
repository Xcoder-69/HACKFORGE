import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WelcomeLanguageSelector } from '../pages/farmer/WelcomeLanguageSelector';
import { Login } from '../pages/auth/Login';
import { Onboarding } from '../pages/farmer/Onboarding';
import { MyFarm } from '../pages/farmer/MyFarm';
import { FarmerLayout } from '../layouts/FarmerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { RoutePlaceholder } from '../pages/shared/RoutePlaceholder';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Screen 1: Welcome & Interactive Language Selector (Implemented) */}
      <Route path="/" element={<WelcomeLanguageSelector />} />

      {/* Screen 2: Unified Login & Registration (Implemented) */}
      <Route path="/login" element={<Login />} />

      {/* Screen 4: Consolidated Farmer Onboarding (Implemented) */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Farmer Core Application Routes (wrapped in FarmerLayout) */}
      <Route element={<FarmerLayout />}>
        {/* Home & Screen 3: My Farm & Plot Management (Implemented) */}
        <Route path="/home" element={<MyFarm />} />
        <Route path="/my-farm" element={<MyFarm />} />

        {/* Screen 6: Weather & Soil */}
        <Route
          path="/weather-soil"
          element={
            <RoutePlaceholder
              title="Weather & Soil Intelligence"
              subtitle="Live Open-Meteo forecasts, soil moisture indices, and N-P-K status"
              icon="wb_sunny"
              screenId="c8f5b5c5bf644d22aa214abc56edb004"
            />
          }
        />

        {/* AI Assistant */}
        <Route
          path="/ai-assistant"
          element={
            <RoutePlaceholder
              title="AI Advisory - Ask About Your Farm"
              subtitle="Conversational agronomy advice powered by Google Gemini"
              icon="forum"
              screenId="0a5faf558559405bbecbcd328d0e31db"
            />
          }
        />

        {/* Screen 9: AI Camera (Center Action) */}
        <Route
          path="/ai-camera"
          element={
            <RoutePlaceholder
              title="Crop Health Scanner"
              subtitle="Capture foliage photos for instant pest, disease, and nutrient stress diagnosis"
              icon="photo_camera"
              screenId="93efd68da4a84c3b85bca120cdff5416"
            />
          }
        />

        {/* Diagnosis Results */}
        <Route
          path="/diagnosis"
          element={
            <RoutePlaceholder
              title="Crop Diagnostic Results"
              subtitle="Detailed visual pathology symptoms, confidence scores, and safe remedies"
              icon="biotech"
              screenId="cd018a71945c4657b061db7c9e393ef1"
            />
          }
        />

        {/* Screen 5: Crop Recommendations */}
        <Route
          path="/recommendations"
          element={
            <RoutePlaceholder
              title="Crop Recommendations & Cultivation Planning"
              subtitle="Seasonal crop suitability scoring matching soil, climate, and market trends"
              icon="eco"
              screenId="b3b928fd1f964a04b28f929d25b75866"
            />
          }
        />

        {/* Market */}
        <Route
          path="/market"
          element={
            <RoutePlaceholder
              title="Mandi Market Intelligence"
              subtitle="Live APMC market prices, modal rates, and nearby mandi trends"
              icon="storefront"
              screenId="d9dd28d5b1654276bbd15610406ab2f4"
            />
          }
        />

        {/* Screen 7: Expenses */}
        <Route
          path="/expenses"
          element={
            <RoutePlaceholder
              title="Farm Expense Tracker"
              subtitle="Track seeds, fertilizers, labor, machinery, and operational expenses"
              icon="receipt_long"
              screenId="1de9af41a0ea447c9bac0a11c0750e13"
            />
          }
        />

        {/* Screen 8: Profit & Revenue */}
        <Route
          path="/profit"
          element={
            <RoutePlaceholder
              title="Profit, Yield & Revenue Overview"
              subtitle="Yield projections, cultivation OpEx versus expected mandi return"
              icon="trending_up"
              screenId="546c97a7f77a401e927911a565268806"
            />
          }
        />

        {/* Screen 10: Alerts */}
        <Route
          path="/alerts"
          element={
            <RoutePlaceholder
              title="Alerts & Recommended Action Center"
              subtitle="Prioritized daily tasks, weather precautions, and agronomist escalations"
              icon="notifications"
              screenId="1afdd99d24c843c9ab051e751553e428"
            />
          }
        />

        {/* Screen 11: Profile */}
        <Route
          path="/profile"
          element={
            <RoutePlaceholder
              title="Farmer Profile & Settings"
              subtitle="Personal details, preferred language, notifications, and security"
              icon="person"
              screenId="30b5304864444383867755b37981f5d8"
            />
          }
        />
      </Route>

      {/* Screen 12: Admin / KVK Enterprise Command Center */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin"
          element={
            <RoutePlaceholder
              title="AgroMind Enterprise / KVK Admin Dashboard"
              subtitle="Regional farmer telemetry, outbreak heatmaps, and agricultural officer dispatch"
              icon="admin_panel_settings"
              screenId="d280f34a680841c7a682e8b9033c08b5"
            />
          }
        />
      </Route>

      {/* Default Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
