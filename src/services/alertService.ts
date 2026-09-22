// Centralized Alert & Advisory Service for AgroMind AI
// Evaluates real-time agronomic hazard detection from real data sources:
// 1. Live Open-Meteo Weather (heavy rain, heat stress, strong wind)
// 2. Real Crop Planting Date & Agronomic Growth Milestones (cropAgeDays = currentDate - plantingDate)
// 3. APMC Mandi Price Movements & Selling Windows
// 4. Farmer Uploaded Soil Lab Reports (no fake soil values)
// 5. AI Camera Crop Disease Diagnoses
// Enforces unique key-based deduplication and persistent lifecycle: NEW -> READ -> RESOLVED -> EXPIRED

import { AlertItem, AlertStatus, DiagnosisResult, SoilReportRecord } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncEngine } from '../lib/syncEngine';
import { farmService } from './farmService';
import { weatherService } from './weatherService';
import { marketService } from './marketService';
import { recommendationService } from './recommendationService';
import { notificationService } from './notificationService';
import { soilReportService } from './soilReportService';
import { isDemoUser } from '../data/demoFarmerData';
import type { AlertSummary, CreateAlertPayload, IAlertService } from '../contracts/alert.contract';

class AlertService implements IAlertService {
  /**
   * Retrieves all alerts from local reactive storage and triggers cloud sync if online
   */
  getAlerts(): AlertItem[] {
    this.expireOldAlerts();
    const cached = storageService.get<AlertItem[]>(STORAGE_KEYS.ALERTS, []);

    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      const currentUser = storageService.get<{ id?: string } | null>(STORAGE_KEYS.USER, null);
      let query = supabase.from('alerts').select('*');
      if (currentUser?.id && !isDemoUser(currentUser)) {
        query = query.or(`farmer_id.is.null,farmer_id.eq.${currentUser.id}`);
      }
      query
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const remoteAlerts: AlertItem[] = data.map((row: any) => ({
              id: row.id,
              key: row.key || `remote:${row.id}`,
              type: row.type || 'weather',
              title: row.title || row.title_en,
              titleEn: row.title_en,
              titleGu: row.title_gu,
              titleHi: row.title_hi,
              message: row.message || row.description_en,
              descriptionEn: row.description_en,
              descriptionGu: row.description_gu,
              descriptionHi: row.description_hi,
              priority: row.priority || row.severity || 'Medium',
              severity: row.severity || row.priority || 'Medium',
              severityColor: row.severity_color || this.getPriorityColor(row.priority || row.severity),
              category: row.category || 'weather',
              categoryLabel: row.category_label || 'Advisory',
              time: row.time_label || 'Recently',
              createdAt: row.created_at || new Date().toISOString(),
              expiresAt: row.expires_at,
              status: row.status || (row.is_completed ? 'RESOLVED' : row.is_read ? 'READ' : 'NEW'),
              read: !!row.is_read,
              isRead: !!row.is_read,
              isCompleted: !!row.is_completed,
              relatedCropId: row.related_crop_id,
              relatedFarmId: row.related_farm_id,
              plotId: row.plot_id,
              source: row.source || 'Open-Meteo',
              actionText: row.action_text || 'View Details',
              actionRoute: row.action_route || '/alerts',
              dataValues: row.data_values,
            }));

            // Merge avoiding overwrite of local resolved statuses
            const localMap = new Map(cached.map((a) => [a.key || a.id, a]));
            remoteAlerts.forEach((ra) => {
              const k = ra.key || ra.id;
              if (!localMap.has(k)) {
                localMap.set(k, ra);
              }
            });
            storageService.set(STORAGE_KEYS.ALERTS, Array.from(localMap.values()));
          }
        })
        .catch((err) => console.warn('[AlertService] Supabase sync error:', err));
    }

    return cached;
  }

  /**
   * Retrieves only active alerts (NEW and READ status).
   * Excludes EXPIRED and RESOLVED alerts.
   */
  getActiveAlerts(): AlertItem[] {
    return this.getAlerts().filter((a) => a.status === 'NEW' || a.status === 'READ');
  }

  /**
   * Returns a high-level summary count for UI indicators and badges
   */
  getAlertSummary(): AlertSummary {
    const all = this.getAlerts();
    const active = all.filter((a) => a.status === 'NEW' || a.status === 'READ');
    const critical = active.filter((a) => a.priority === 'Critical');
    const unread = active.filter((a) => !a.read);

    return {
      totalCount: all.length,
      activeCount: active.length,
      criticalCount: critical.length,
      unreadCount: unread.length,
    };
  }

  /**
   * Subscribes to alert list changes in storage
   */
  subscribeToAlerts(callback: (alerts: AlertItem[]) => void): () => void {
    return storageService.subscribe<AlertItem[]>(STORAGE_KEYS.ALERTS, callback);
  }

  /**
   * Auto-transitions old alerts past expiresAt into EXPIRED status
   */
  expireOldAlerts(): void {
    const cached = storageService.get<AlertItem[]>(STORAGE_KEYS.ALERTS, []);
    const now = Date.now();
    let changed = false;

    const updated = cached.map((alert) => {
      if (
        alert.expiresAt &&
        alert.status !== 'EXPIRED' &&
        alert.status !== 'RESOLVED' &&
        new Date(alert.expiresAt).getTime() < now
      ) {
        changed = true;
        return { ...alert, status: 'EXPIRED' as AlertStatus };
      }
      return alert;
    });

    if (changed) {
      storageService.set(STORAGE_KEYS.ALERTS, updated);
    }
  }

  /**
   * Marks a specific alert as READ
   */
  markAsRead(id: string): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, read: true, isRead: true, status: a.status === 'NEW' ? ('READ' as AlertStatus) : a.status } : a
    );
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'UPDATE',
      recordId: id,
      payload: { is_read: true, status: 'READ' },
    });
  }

  /**
   * Marks all active alerts as READ
   */
  markAllAsRead(): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) =>
      a.status === 'NEW' ? { ...a, read: true, isRead: true, status: 'READ' as AlertStatus } : { ...a, read: true, isRead: true }
    );
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    alerts.forEach((a) => {
      syncEngine.enqueue({
        tableName: 'alerts',
        operation: 'UPDATE',
        recordId: a.id,
        payload: { is_read: true, status: 'READ' },
      });
    });
  }

  /**
   * Toggles read state
   */
  toggleRead(id: string): void {
    const alerts = this.getAlerts();
    const target = alerts.find((a) => a.id === id);
    if (!target) return;
    const nextRead = !target.read;
    const nextStatus: AlertStatus = nextRead ? (target.status === 'NEW' ? 'READ' : target.status) : 'NEW';

    const updated = alerts.map((a) => (a.id === id ? { ...a, read: nextRead, isRead: nextRead, status: nextStatus } : a));
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'UPDATE',
      recordId: id,
      payload: { is_read: nextRead, status: nextStatus },
    });
  }

  /**
   * Resolves an alert (marks risk or recommended action completed)
   */
  resolveAlert(id: string): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, status: 'RESOLVED' as AlertStatus, isCompleted: true, read: true, isRead: true } : a
    );
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'UPDATE',
      recordId: id,
      payload: { status: 'RESOLVED', is_completed: true, is_read: true },
    });
  }

  /**
   * Adds or broadcasts an alert manually (e.g. from KVK Admin)
   */
  addAlert(payload: CreateAlertPayload): AlertItem {
    const alerts = this.getAlerts();
    const id = `alert-${Date.now()}`;
    const priority = payload.priority || payload.severity || 'Medium';

    const newAlert: AlertItem = {
      id,
      key: payload.key || `manual:${id}`,
      type: payload.type || 'weather',
      title: payload.title || payload.titleEn,
      titleEn: payload.titleEn,
      titleGu: payload.titleGu || payload.titleEn,
      titleHi: payload.titleHi || payload.titleEn,
      message: payload.message || payload.descriptionEn,
      descriptionEn: payload.descriptionEn,
      descriptionGu: payload.descriptionGu || payload.descriptionEn,
      descriptionHi: payload.descriptionHi || payload.descriptionEn,
      priority,
      severity: priority,
      severityColor: payload.severityColor || this.getPriorityColor(priority),
      createdAt: new Date().toISOString(),
      expiresAt: payload.expiresAt,
      status: payload.status || 'NEW',
      read: false,
      isRead: false,
      isCompleted: false,
      relatedCropId: payload.relatedCropId,
      relatedFarmId: payload.farmerId,
      plotId: payload.plotId,
      source: payload.source || 'Open-Meteo',
      action: {
        label: payload.actionText || 'Take Action',
        route: payload.actionRoute || '/alerts',
      },
      actionText: payload.actionText || 'Take Action',
      actionRoute: payload.actionRoute || '/alerts',
      category: payload.category || 'weather',
      categoryLabel: payload.categoryLabel || 'Advisory',
      time: payload.time || 'Just now',
      dataValues: payload.dataValues,
    };

    const updated = [newAlert, ...alerts];
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    // Trigger rich toast notification
    notificationService.notifyAlert({
      title: newAlert.title,
      titleGu: newAlert.titleGu,
      titleHi: newAlert.titleHi,
      message: newAlert.message || newAlert.descriptionEn,
      messageGu: newAlert.descriptionGu || newAlert.message,
      messageHi: newAlert.descriptionHi || newAlert.message,
      priority: newAlert.priority,
      category: newAlert.category,
      actionText: newAlert.actionText || 'View Advisory',
      actionRoute: newAlert.actionRoute || '/alerts',
      eventId: `alert:${newAlert.key || newAlert.id}`,
    });

    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);
    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'INSERT',
      recordId: newAlert.id,
      userId: currentUser?.id,
      payload: {
        id: newAlert.id,
        key: newAlert.key,
        type: newAlert.type,
        farmer_id: currentUser?.id || null,
        category: newAlert.category,
        category_label: newAlert.categoryLabel,
        title_en: newAlert.titleEn,
        title_gu: newAlert.titleGu,
        title_hi: newAlert.titleHi,
        message: newAlert.message,
        severity: newAlert.severity,
        priority: newAlert.priority,
        severity_color: newAlert.severityColor,
        time_label: newAlert.time,
        description_en: newAlert.descriptionEn,
        description_gu: newAlert.descriptionGu,
        description_hi: newAlert.descriptionHi,
        action_text: newAlert.actionText,
        action_route: newAlert.actionRoute,
        is_read: false,
        status: 'NEW',
        source: newAlert.source,
      },
    });

    return newAlert;
  }

  /**
   * Deletes an alert by ID
   */
  deleteAlert(id: string): void {
    const alerts = this.getAlerts();
    const updated = alerts.filter((a) => a.id !== id);
    storageService.set(STORAGE_KEYS.ALERTS, updated);

    syncEngine.enqueue({
      tableName: 'alerts',
      operation: 'DELETE',
      recordId: id,
      payload: { id },
    });
  }

  /**
   * Returns backward-compatible unread count
   */
  getUnreadCount(): number {
    return this.getAlertSummary().unreadCount;
  }

  /**
   * Master Evaluation Function:
   * Dynamically inspects real weather, crop age from plantingDate, APMC market data,
   * uploaded soil reports, and AI scan diagnoses.
   * Enforces deduplication via keys so alerts NEVER duplicate on refresh or navigation.
   */
  async evaluateAllAlerts(): Promise<AlertItem[]> {
    const existing = this.getAlerts();
    const existingMap = new Map<string, AlertItem>();
    existing.forEach((a) => {
      if (a.key) existingMap.set(a.key, a);
    });

    const candidates: AlertItem[] = [];
    const todayIso = new Date().toISOString().split('T')[0];

    // ------------------------------------------------------------------------
    // RULE 1: Crop Growth Days & Milestones (Using REAL plantingDate)
    // ------------------------------------------------------------------------
    try {
      const plots = farmService.getPlots();
      const cropDb = recommendationService.getCropDatabase();

      Object.keys(plots).forEach((plotKey) => {
        const plot = plots[plotKey];
        if (!plot.plantingDate) return;

        const plantTime = new Date(plot.plantingDate).getTime();
        if (isNaN(plantTime)) return;

        const cropAgeDays = Math.max(0, Math.floor((Date.now() - plantTime) / 86400000));
        const matchedCrop = cropDb.find((c) =>
          plot.crop.toLowerCase().includes(c.nameEn.toLowerCase()) ||
          c.nameEn.toLowerCase().includes(plot.crop.toLowerCase())
        );

        if (matchedCrop && matchedCrop.stages && matchedCrop.stages.length > 0) {
          // Find matching growth stage by day range
          for (const stage of matchedCrop.stages) {
            const match = stage.days.match(/Day\s*(\d+)-(\d+)/i);
            if (match) {
              const startDay = parseInt(match[1], 10);
              const endDay = parseInt(match[2], 10);

              if (cropAgeDays >= startDay && cropAgeDays <= endDay) {
                const key = `crop:milestone:${plot.id}:${matchedCrop.id}:${stage.name.replace(/\s+/g, '-').toLowerCase()}`;
                candidates.push({
                  id: `crop-${plot.id}-${stage.name.replace(/\s+/g, '-').toLowerCase()}`,
                  key,
                  type: 'crop',
                  title: `Crop Milestone: ${stage.name}`,
                  titleEn: `Crop Milestone: ${stage.name} (Day ${cropAgeDays})`,
                  titleGu: `પાક તબક્કો: ${stage.nameGu} (${cropAgeDays}મો દિવસ)`,
                  titleHi: `Fasal Avastha: ${stage.name} (${cropAgeDays}va Din)`,
                  message: `Your ${plot.crop} in ${plot.title} has reached Day ${cropAgeDays} (${stage.name}). ${stage.detail}`,
                  descriptionEn: `Your ${plot.crop} is at Day ${cropAgeDays}. Stage: ${stage.name}. ${stage.detail}`,
                  descriptionGu: `તમારો ${plot.crop} ${cropAgeDays}મા દિવસે પહોંચ્યો છે. તબક્કો: ${stage.nameGu}. ${stage.detailGu}`,
                  descriptionHi: `Aapki fasal ${cropAgeDays}ve din par hai. Avastha: ${stage.name}. ${stage.detail}`,
                  priority: 'Medium',
                  severity: 'Medium',
                  severityColor: 'bg-amber-100 text-amber-900 border-amber-300',
                  createdAt: new Date().toISOString(),
                  status: 'NEW',
                  read: false,
                  isRead: false,
                  isCompleted: false,
                  plotId: plot.id,
                  relatedCropId: matchedCrop.id,
                  source: 'Agronomic Engine',
                  actionText: 'View Crop Stage Guidance',
                  actionRoute: '/recommendations',
                  category: 'crop',
                  categoryLabel: 'Crop Milestone / પાક તબક્કો',
                  time: `Day ${cropAgeDays}`,
                  dataValues: { cropAgeDays, stageName: stage.name, plotId: plot.id },
                });
                break;
              }
            }
          }

          // Approaching Harvest Alert
          if (matchedCrop.durationDays && cropAgeDays >= matchedCrop.durationDays - 15) {
            const key = `crop:harvest:${plot.id}:${matchedCrop.id}`;
            candidates.push({
              id: `harvest-${plot.id}`,
              key,
              type: 'crop',
              title: `Approaching Harvest Window`,
              titleEn: `Approaching Harvest Window: ${plot.crop}`,
              titleGu: `${plot.crop} માટે કાપણીનો સમય નજીક છે`,
              titleHi: `${plot.crop} ki Katai ka Samay Kareeb Hai`,
              message: `Your ${plot.crop} is at Day ${cropAgeDays} (estimated maturity ~${matchedCrop.durationDays} days). Prepare harvesting equipment and compare mandi arrival rates.`,
              descriptionEn: `Your ${plot.crop} is nearing the expected harvest window (Day ${cropAgeDays}/${matchedCrop.durationDays}). Plan picking logistics.`,
              descriptionGu: `પાક પરિપક્વતાના આરે છે (${cropAgeDays}/${matchedCrop.durationDays} દિવસ). કાપણી અને મંડી પરિવહનનું આયોજન કરો.`,
              descriptionHi: `Fasal katai ke kareeb hai (${cropAgeDays}/${matchedCrop.durationDays} din). Katai aur mandi transport plan karein.`,
              priority: 'High',
              severity: 'High',
              severityColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
              createdAt: new Date().toISOString(),
              status: 'NEW',
              read: false,
              isRead: false,
              isCompleted: false,
              plotId: plot.id,
              relatedCropId: matchedCrop.id,
              source: 'Agronomic Engine',
              actionText: 'Check Mandi Rates for Harvest',
              actionRoute: '/mandi',
              category: 'crop',
              categoryLabel: 'Harvest Planning / કાપણી',
              time: `Day ${cropAgeDays}/${matchedCrop.durationDays}`,
              dataValues: { cropAgeDays, durationDays: matchedCrop.durationDays },
            });
          }
        }
      });
    } catch (err) {
      console.warn('[AlertService] Error evaluating crop growth alerts:', err);
    }

    // ------------------------------------------------------------------------
    // RULE 2: Real Open-Meteo Weather Alerts (Heavy Rain, Wind, Heat Stress)
    // ------------------------------------------------------------------------
    try {
      const weather = weatherService.getLatestWeatherData();
      if (weather && weather.current) {
        const district = weather.locationName || 'Surat';

        // 2A: Heavy Rain Risk
        const highRainDay = weather.daily?.find(
          (d) => (parseFloat(d.rainMm) >= 15 || d.rainProb >= 65)
        );
        if (highRainDay) {
          const rainVal = highRainDay.rainMm;
          const prob = highRainDay.rainProb;
          const isCritical = parseFloat(rainVal) >= 30;
          const key = `weather:heavy-rain:${district}:${highRainDay.day}`;

          candidates.push({
            id: `rain-${district}-${highRainDay.day}`,
            key,
            type: 'weather',
            title: `Heavy Rain Risk Detected`,
            titleEn: `Heavy Rain Risk Detected (${rainVal}mm)`,
            titleGu: `ભારે વરસાદનું જોખમ (${rainVal} મીમી)`,
            titleHi: `Bhaari Baarish ka Risk (${rainVal}mm)`,
            message: `Significant rainfall (${rainVal}mm, ${prob}% probability) is forecast for ${district} on ${highRainDay.day}. Review field drainage furrows and postpone foliar chemical sprays.`,
            descriptionEn: `Conditions may increase waterlogging risk. IMD/Open-Meteo forecast indicates ${rainVal}mm rain on ${highRainDay.day}. Clear drainage channels.`,
            descriptionGu: `${highRainDay.day}ના રોજ ${district} વિસ્તારમાં ${rainVal} મીમી વરસાદની શક્યતા. ખેતરના પાળા સાફ કરો જેથી પાણી ભરાઈ ન રહે.`,
            descriptionHi: `${highRainDay.day} ko ${district} mein ${rainVal}mm baarish ka anuman. Khet mein jal-bharaav se bachein.`,
            priority: isCritical ? 'Critical' : 'High',
            severity: isCritical ? 'Critical' : 'High',
            severityColor: isCritical ? 'bg-red-100 text-red-900 border-red-300' : 'bg-amber-100 text-amber-900 border-amber-300',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            status: 'NEW',
            read: false,
            isRead: false,
            isCompleted: false,
            source: 'Open-Meteo',
            actionText: 'Check Weather & Spray Window',
            actionRoute: '/weather-soil',
            category: 'weather',
            categoryLabel: 'Weather Alert / હવામાન જોખમ',
            time: `Forecast • ${highRainDay.day}`,
            dataValues: { rainMm: rainVal, rainProb: prob, district },
          });
        }

        // 2B: High Temperature / Heat Stress Risk
        const highTempDay = weather.daily?.find((d) => d.tempMax >= 38) || (weather.current.temp >= 38 ? { tempMax: weather.current.temp, day: 'Today' } : null);
        if (highTempDay) {
          const tempVal = highTempDay.tempMax;
          const key = `weather:heat-stress:${district}:${todayIso}`;

          candidates.push({
            id: `temp-${district}-${todayIso}`,
            key,
            type: 'weather',
            title: `Temperature Risk Detected`,
            titleEn: `High Temperature & Heat Stress Risk (${tempVal}°C)`,
            titleGu: `ઊંચા તાપમાન અને ગરમીનું જોખમ (${tempVal}°C)`,
            titleHi: `Adhik Tapman va Heat Stress Risk (${tempVal}°C)`,
            message: `Forecast temperature may reach ${tempVal}°C in ${district}. Conditions may increase heat stress risk for your selected crop. Ensure evening micro-irrigation.`,
            descriptionEn: `Peak temperature may hit ${tempVal}°C. High evapotranspiration rate. Ensure sufficient root-zone soil moisture.`,
            descriptionGu: `${district} માં મહત્તમ તાપમાન ${tempVal}°C પહોંચવાની શક્યતા છે. સાંજના સમયે પિયત આપવાની ભલામણ છે.`,
            descriptionHi: `${district} mein tapman ${tempVal}°C tak ja sakta hai. Shaam ko piyat karein.`,
            priority: 'High',
            severity: 'High',
            severityColor: 'bg-amber-100 text-amber-900 border-amber-300',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            status: 'NEW',
            read: false,
            isRead: false,
            isCompleted: false,
            source: 'Open-Meteo',
            actionText: 'Check Soil Moisture & Irrigation',
            actionRoute: '/weather-soil',
            category: 'weather',
            categoryLabel: 'Temperature Advisory / તાપમાન',
            time: `${tempVal}°C Forecast`,
            dataValues: { tempMax: tempVal, district },
          });
        }

        // 2C: Strong Wind Risk
        if (weather.current.windSpeed >= 24) {
          const windSpeed = weather.current.windSpeed;
          const key = `weather:strong-wind:${district}:${todayIso}`;

          candidates.push({
            id: `wind-${district}-${todayIso}`,
            key,
            type: 'weather',
            title: `Strong Wind Risk Detected`,
            titleEn: `Strong Wind Advisory (${windSpeed} km/h)`,
            titleGu: `ઝડપી પવનની ચેતવણી (${windSpeed} કિમી/કલાક)`,
            titleHi: `Tez Hawa ki Warning (${windSpeed} km/h)`,
            message: `Strong wind conditions (${windSpeed} km/h) recorded in ${district}. Chemical foliar spraying may suffer severe drift losses.`,
            descriptionEn: `Foliar spray window unsafe due to high wind speed (${windSpeed} km/h). Delay insecticide application until wind calms.`,
            descriptionGu: `${windSpeed} કિમી/કલાકની ઝડપે પવન ફૂંકાઈ રહ્યો છે. દવા છંટકાવ કરવાથી દવાનો વ્યય થશે, માટે હાલ છંટકાવ મોકૂફ રાખો.`,
            descriptionHi: `${windSpeed} km/h hawa ki gati hai. Abhi chhidkaw na karein.`,
            priority: 'Medium',
            severity: 'Medium',
            severityColor: 'bg-blue-100 text-blue-900 border-blue-300',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
            status: 'NEW',
            read: false,
            isRead: false,
            isCompleted: false,
            source: 'Open-Meteo',
            actionText: 'Check Spray Suitability',
            actionRoute: '/weather-soil',
            category: 'weather',
            categoryLabel: 'Wind Advisory / પવન',
            time: `Wind ${windSpeed} km/h`,
            dataValues: { windSpeed, district },
          });
        }
      }
    } catch (err) {
      console.warn('[AlertService] Error evaluating weather alerts:', err);
    }

    // ------------------------------------------------------------------------
    // RULE 3: Real Mandi/Market Price Alerts
    // ------------------------------------------------------------------------
    try {
      const mandiRecords = await marketService.getMarketPrices();
      if (mandiRecords && mandiRecords.length > 0) {
        // Find commodities with strong SELL NOW signals or significant price movement
        mandiRecords.slice(0, 4).forEach((rec) => {
          if (rec.recommendation === 'SELL NOW') {
            const key = `market:sell-opp:${rec.crop.replace(/\s+/g, '-').toLowerCase()}:${rec.mandi.replace(/\s+/g, '-').toLowerCase()}:${todayIso}`;
            candidates.push({
              id: `mkt-sell-${rec.id}-${todayIso}`,
              key,
              type: 'market',
              title: `Market Selling Opportunity: ${rec.crop}`,
              titleEn: `Market Selling Opportunity: ${rec.crop} at ${rec.mandi}`,
              titleGu: `બજાર વેચાણ તક: ${rec.cropGu || rec.crop} (${rec.mandi})`,
              titleHi: `Mandi Bikri Mauka: ${rec.cropHi || rec.crop} (${rec.mandi})`,
              message: `${rec.mandi} reports modal price of ₹${rec.modalPrice}/Qtl (${rec.change}). Market intelligence indicates strong demand. Review harvest logistics.`,
              descriptionEn: `Modal price: ₹${rec.modalPrice}/Qtl (${rec.change}). Arrivals: ${rec.arrivals}. Favorable price window for farmer realization.`,
              descriptionGu: `${rec.mandi} માં ભાવ ₹${rec.modalPrice}/ક્વિન્ટલ (${rec.change}) નોંધાયો છે. વેચાણ માટે સાનુકૂળ તક છે.`,
              descriptionHi: `${rec.mandi} mein bhav ₹${rec.modalPrice}/Qtl (${rec.change}) hai. Bikri ke liye accha samay hai.`,
              priority: 'Medium',
              severity: 'Medium',
              severityColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              status: 'NEW',
              read: false,
              isRead: false,
              isCompleted: false,
              source: 'Mandi/market data',
              actionText: 'Compare Mandi Rates',
              actionRoute: '/mandi',
              category: 'market',
              categoryLabel: 'Market Rate / બજાર ભાવ',
              time: `₹${rec.modalPrice}/Qtl`,
              dataValues: { crop: rec.crop, mandi: rec.mandi, currentPrice: rec.modalPrice, change: rec.change, date: todayIso },
            });
          }
        });
      }
    } catch (err) {
      console.warn('[AlertService] Error evaluating market alerts:', err);
    }

    // ------------------------------------------------------------------------
    // RULE 4: Uploaded Soil Laboratory Report Alerts (No Fake Values)
    // ------------------------------------------------------------------------
    try {
      const soilReport = soilReportService.getSoilReport();
      if (soilReport && soilReport.uploadedAt) {
        // Low Nitrogen Alert
        if (typeof soilReport.nitrogenKgHa === 'number' && soilReport.nitrogenKgHa < 140) {
          const key = `soil:low-nitrogen:${soilReport.id}`;
          candidates.push({
            id: `soil-n-${soilReport.id}`,
            key,
            type: 'soil',
            title: `Soil Report Insight: Low Nitrogen`,
            titleEn: `Soil Report Insight: Low Available Nitrogen (${soilReport.nitrogenKgHa} kg/ha)`,
            titleGu: `જમીન વિશ્લેષણ: નાઇટ્રોજનની અછત (${soilReport.nitrogenKgHa} કિગ્રા/હે)`,
            titleHi: `Mitti Report: Kam Nitrogen (${soilReport.nitrogenKgHa} kg/ha)`,
            message: `Based on your uploaded laboratory report (${soilReport.labName || 'Soil Health Lab'}), available nitrogen (${soilReport.nitrogenKgHa} kg/ha) is below recommended levels.`,
            descriptionEn: `Laboratory tested available N: ${soilReport.nitrogenKgHa} kg/ha. Review split nitrogen top-dressing or leguminous green manuring.`,
            descriptionGu: `તમારા અપલોડ કરેલા લેબ રિપોર્ટ મુજબ નાઇટ્રોજન ${soilReport.nitrogenKgHa} કિગ્રા/હેક્ટર છે જે ઓછું છે. ખાતર વ્યવસ્થાપન તપાસો.`,
            descriptionHi: `Uploaded lab report ke anusar Nitrogen ${soilReport.nitrogenKgHa} kg/ha hai jo kam hai. Khad prabandhan karein.`,
            priority: 'High',
            severity: 'High',
            severityColor: 'bg-amber-100 text-amber-900 border-amber-300',
            createdAt: new Date().toISOString(),
            status: 'NEW',
            read: false,
            isRead: false,
            isCompleted: false,
            source: 'Uploaded laboratory report',
            actionText: 'View Agronomic Nutrient Recommendations',
            actionRoute: '/recommendations',
            category: 'soil',
            categoryLabel: 'Soil Lab Insight / જમીન રિપોર્ટ',
            time: `Lab Test • ${soilReport.sampleDate || 'Recent'}`,
            dataValues: { nitrogenKgHa: soilReport.nitrogenKgHa, labName: soilReport.labName },
          });
        }

        // Soil pH Imbalance
        if (typeof soilReport.ph === 'number' && (soilReport.ph < 6.2 || soilReport.ph > 8.4)) {
          const key = `soil:ph-imbalance:${soilReport.id}`;
          const isAlkaline = soilReport.ph > 8.4;
          candidates.push({
            id: `soil-ph-${soilReport.id}`,
            key,
            type: 'soil',
            title: `Soil Report Insight: pH ${isAlkaline ? 'Alkalinity' : 'Acidity'} (${soilReport.ph})`,
            titleEn: `Soil Report Insight: pH ${isAlkaline ? 'High Alkalinity' : 'Acidity'} (${soilReport.ph})`,
            titleGu: `જમીન વિશ્લેષણ: પીએચ ${isAlkaline ? 'ક્ષારીયતા' : 'એસિડિકતા'} (${soilReport.ph})`,
            titleHi: `Mitti Report: pH ${isAlkaline ? 'Kshariya' : 'Amliya'} (${soilReport.ph})`,
            message: `Based on your uploaded laboratory report, soil pH is ${soilReport.ph}. Extreme pH limits micronutrient availability. Incorporate organic matter/gypsum.`,
            descriptionEn: `Tested soil pH of ${soilReport.ph} affects nutrient uptake. Consult agronomic guidelines for soil conditioning.`,
            descriptionGu: `જમીનનો પીએચ ${soilReport.ph} હોવાથી પોષક તત્વો મળવામાં મુશ્કેલી પડી શકે છે. સેન્દ્રિય ખાતર વાપરો.`,
            descriptionHi: `Mitti ka pH ${soilReport.ph} hai. Jaivik khad ka upyog karein.`,
            priority: 'Medium',
            severity: 'Medium',
            severityColor: 'bg-blue-100 text-blue-900 border-blue-300',
            createdAt: new Date().toISOString(),
            status: 'NEW',
            read: false,
            isRead: false,
            isCompleted: false,
            source: 'Uploaded laboratory report',
            actionText: 'Review Soil Guidelines',
            actionRoute: '/weather-soil',
            category: 'soil',
            categoryLabel: 'Soil Lab Insight / જમીન રિપોર્ટ',
            time: `pH ${soilReport.ph}`,
            dataValues: { ph: soilReport.ph, labName: soilReport.labName },
          });
        }
      }
    } catch (err) {
      console.warn('[AlertService] Error evaluating soil report alerts:', err);
    }

    // ------------------------------------------------------------------------
    // RULE 5: AI Camera Crop Diagnosis Alerts (Only Real Scans)
    // ------------------------------------------------------------------------
    try {
      const scans = storageService.get<DiagnosisResult[]>(STORAGE_KEYS.SCANS, []);
      scans.forEach((scan) => {
        if (
          scan.visibleCondition === 'At Risk' ||
          scan.severity === 'High' ||
          scan.severity === 'Severe' ||
          (scan.diseaseName && !scan.diseaseName.toLowerCase().includes('healthy'))
        ) {
          const key = `scan:disease:${scan.id}`;
          candidates.push({
            id: `scan-alert-${scan.id}`,
            key,
            type: 'diagnosis',
            title: `Crop Disease Detected: ${scan.diseaseName}`,
            titleEn: `Crop Disease Detected: ${scan.diseaseName} on ${scan.crop}`,
            titleGu: `પાક રોગની ઓળખ: ${scan.diseaseGu || scan.diseaseName} (${scan.crop})`,
            titleHi: `Fasal Rog Detect Hua: ${scan.diseaseName} (${scan.crop})`,
            message: `AI leaf diagnosis identified ${scan.diseaseName} (${scan.severity} severity) on ${scan.crop}. Review recommended remedies.`,
            descriptionEn: `AI Vision identified ${scan.diseaseName} with ${scan.confidence}% confidence. Follow certified agronomic management.`,
            descriptionGu: `AI કેમેરા તપાસમાં ${scan.crop} પર ${scan.diseaseGu || scan.diseaseName} (${scan.severity}) જણાયેલ છે. ઉપચાર જુઓ.`,
            descriptionHi: `AI camera jaanch mein ${scan.diseaseName} mila hai. Turant upchar karein.`,
            priority: scan.severity === 'Severe' || scan.severity === 'High' ? 'Critical' : 'High',
            severity: scan.severity === 'Severe' || scan.severity === 'High' ? 'Critical' : 'High',
            severityColor: 'bg-red-100 text-red-900 border-red-300',
            createdAt: scan.timestamp || new Date().toISOString(),
            status: 'NEW',
            read: false,
            isRead: false,
            isCompleted: false,
            source: 'AI crop analysis',
            actionText: 'Review AI Diagnosis & Remedies',
            actionRoute: '/ai-camera',
            category: 'urgent',
            categoryLabel: 'Crop Health / પાક રોગ',
            time: `Scan Result`,
            dataValues: { disease: scan.diseaseName, crop: scan.crop, confidence: scan.confidence },
          });
        }
      });
    } catch (err) {
      console.warn('[AlertService] Error evaluating AI diagnosis alerts:', err);
    }

    // ------------------------------------------------------------------------
    // Deduplication & Merge Engine:
    // If key exists:
    //   - If status was RESOLVED, preserve RESOLVED (never resurrect completed tasks).
    //   - If status was EXPIRED, preserve EXPIRED.
    //   - If status was NEW or READ, preserve status & read state while updating fresh details.
    // If key does not exist:
    //   - Insert as NEW and trigger temporary notification toast.
    // ------------------------------------------------------------------------
    const mergedList: AlertItem[] = [...existing];
    const newCandidates: AlertItem[] = [];

    candidates.forEach((candidate) => {
      const existingAlert = candidate.key ? existingMap.get(candidate.key) : null;

      if (existingAlert) {
        // If already resolved or expired, leave it untouched
        if (existingAlert.status === 'RESOLVED' || existingAlert.status === 'EXPIRED') {
          return;
        }

        // Update data values and keep read status
        const idx = mergedList.findIndex((a) => a.id === existingAlert.id);
        if (idx !== -1) {
          mergedList[idx] = {
            ...existingAlert,
            title: candidate.title,
            titleEn: candidate.titleEn,
            titleGu: candidate.titleGu,
            titleHi: candidate.titleHi,
            message: candidate.message,
            descriptionEn: candidate.descriptionEn,
            descriptionGu: candidate.descriptionGu,
            descriptionHi: candidate.descriptionHi,
            time: candidate.time,
            dataValues: candidate.dataValues,
          };
        }
      } else {
        // Truly brand new alert
        mergedList.unshift(candidate);
        existingMap.set(candidate.key, candidate);
        newCandidates.push(candidate);
      }
    });

    // Intelligently notify user without spamming stacked toasts
    if (newCandidates.length === 1) {
      const single = newCandidates[0];
      notificationService.notifyAlert({
        title: single.title,
        titleGu: single.titleGu,
        titleHi: single.titleHi,
        message: single.message || single.descriptionEn,
        messageGu: single.descriptionGu || single.message,
        messageHi: single.descriptionHi || single.message,
        priority: single.priority,
        category: single.category,
        actionText: single.actionText || (single.category === 'market' ? 'Check Mandi' : 'View Advisory'),
        actionRoute: single.actionRoute || (single.category === 'market' ? '/mandi' : '/alerts'),
        eventId: `alert:${single.key || single.id}`,
      });
    } else if (newCandidates.length > 1) {
      const priorityWeights: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const sorted = [...newCandidates].sort(
        (a, b) => (priorityWeights[b.priority] || 1) - (priorityWeights[a.priority] || 1)
      );
      const topAlert = sorted[0];
      const extraCount = newCandidates.length - 1;

      notificationService.notifyAlert({
        title: topAlert.title,
        titleGu: topAlert.titleGu,
        titleHi: topAlert.titleHi,
        message: extraCount > 0
          ? `${topAlert.message || topAlert.descriptionEn} (+${extraCount} more farm advisories)`
          : (topAlert.message || topAlert.descriptionEn),
        messageGu: extraCount > 0
          ? `${topAlert.descriptionGu || topAlert.message} (+${extraCount} અન્ય ચેતવણીઓ ઉપલબ્ધ)`
          : (topAlert.descriptionGu || topAlert.message),
        messageHi: extraCount > 0
          ? `${topAlert.descriptionHi || topAlert.message} (+${extraCount} aur kheti alerts)`
          : (topAlert.descriptionHi || topAlert.message),
        priority: topAlert.priority,
        category: topAlert.category,
        actionText: extraCount > 0 ? 'View All Alerts' : (topAlert.actionText || 'Take Action'),
        actionRoute: '/alerts',
        eventId: `batch_alerts:${newCandidates.map((c) => c.key || c.id).sort().join(';')}`,
      });
    }

    storageService.set(STORAGE_KEYS.ALERTS, mergedList);
    return mergedList;
  }

  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'High':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  }
}

export const alertService = new AlertService();
