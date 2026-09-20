#!/usr/bin/env node
/**
 * AgroMind AI — Backend Test: ML Price Forecast Model
 * Tests the linear regression + moving average forecast engine.
 * Run: node server/tests/test-forecast.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = resolve(__dirname, '..', 'data', 'mandi_data.json');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ FAIL: ${name}`);
    console.log(`     Error: ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ============================================================
// ML ENGINE (duplicated from Edge Function for standalone testing)
// ============================================================

function linearRegression(xValues, yValues) {
  const n = xValues.length;
  if (n < 2) return { slope: 0, intercept: yValues[0] || 0, rSquared: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumX2 += xValues[i] * xValues[i];
    sumY2 += yValues[i] * yValues[i];
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n, rSquared: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const ssTot = sumY2 - (sumY * sumY) / n;
  const ssRes = yValues.reduce((acc, y, i) => {
    const predicted = slope * xValues[i] + intercept;
    return acc + (y - predicted) ** 2;
  }, 0);
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared: Math.max(0, rSquared) };
}

function movingAverage(prices, window) {
  if (prices.length === 0) return 0;
  const slice = prices.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function stdDev(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function generateRecommendation(currentPrice, avgPrice, trend, volatilityLabel, forecast7dPrice) {
  const priceVsAvg = ((currentPrice - avgPrice) / avgPrice) * 100;
  const forecastVsCurrent = ((forecast7dPrice - currentPrice) / currentPrice) * 100;

  if (priceVsAvg > 5 && (trend === 'down' || volatilityLabel === 'High')) {
    return { recommendation: 'SELL NOW', reason: 'Price above average with declining trend' };
  }
  if (priceVsAvg > 8) {
    return { recommendation: 'SELL NOW', reason: 'Price significantly above average' };
  }
  if (trend === 'up' && forecastVsCurrent > 2) {
    return { recommendation: 'HOLD', reason: 'Upward trend with positive forecast' };
  }
  if (trend === 'stable' && volatilityLabel === 'Low') {
    return { recommendation: 'HOLD', reason: 'Stable market with low volatility' };
  }
  return { recommendation: 'FAIR', reason: 'Moderate conditions' };
}

function runForecast(commodity, records) {
  const filtered = records.filter(r =>
    r.commodity.toLowerCase().includes(commodity.toLowerCase())
  );

  if (filtered.length < 2) {
    return { dataAvailable: false, reason: `Insufficient data for ${commodity}: ${filtered.length} records` };
  }

  const modalPrices = filtered.map(r => r.modalPrice).filter(p => p > 0);
  if (modalPrices.length < 2) {
    return { dataAvailable: false, reason: `No valid prices for ${commodity}` };
  }

  const currentPrice = modalPrices[modalPrices.length - 1];
  const avgPrice = modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length;
  const minRange = Math.min(...filtered.map(r => r.minPrice).filter(p => p > 0));
  const maxRange = Math.max(...filtered.map(r => r.maxPrice).filter(p => p > 0));

  const ma3 = Math.round(movingAverage(modalPrices, 3));
  const ma7 = Math.round(movingAverage(modalPrices, 7));
  const ma14 = Math.round(movingAverage(modalPrices, 14));

  const xValues = modalPrices.map((_, i) => i);
  const regression = linearRegression(xValues, modalPrices);

  const forecastX = modalPrices.length + 7;
  const forecast7dPrice = Math.round(regression.slope * forecastX + regression.intercept);
  const forecastError = stdDev(modalPrices) * 0.5;

  let trend;
  const avgStdDev = stdDev(modalPrices);
  if (regression.slope > avgStdDev * 0.05) trend = 'up';
  else if (regression.slope < -avgStdDev * 0.05) trend = 'down';
  else trend = 'stable';

  const priceStdDev = stdDev(modalPrices);
  const coeffVar = avgPrice > 0 ? (priceStdDev / avgPrice) * 100 : 0;
  let volatilityLabel;
  if (coeffVar < 5) volatilityLabel = 'Low';
  else if (coeffVar < 15) volatilityLabel = 'Medium';
  else volatilityLabel = 'High';

  const { recommendation, reason } = generateRecommendation(
    currentPrice, avgPrice, trend, volatilityLabel, forecast7dPrice
  );

  return {
    dataAvailable: true,
    commodity,
    currentModalPrice: currentPrice,
    avgModalPrice: Math.round(avgPrice),
    minPriceRange: minRange,
    maxPriceRange: maxRange,
    forecast7d: {
      predictedPrice: forecast7dPrice,
      lowerBound: Math.round(forecast7dPrice - forecastError),
      upperBound: Math.round(forecast7dPrice + forecastError),
    },
    trend,
    volatility: { stdDev: Math.round(priceStdDev), coeffOfVariation: Math.round(coeffVar * 10) / 10, label: volatilityLabel },
    movingAverage: { ma3, ma7, ma14 },
    regression: { slope: Math.round(regression.slope * 100) / 100, rSquared: Math.round(regression.rSquared * 1000) / 1000 },
    recommendation,
    recommendationReason: reason,
    dataPoints: modalPrices.length,
  };
}

// ============================================================
// TESTS
// ============================================================

console.log('');
console.log('🧪 AgroMind Backend Test Suite: ML Forecast Engine');
console.log('━'.repeat(60));

// Load data
let dataset;
try {
  const raw = readFileSync(DATA_PATH, 'utf-8');
  dataset = JSON.parse(raw);
  console.log(`📄 Loaded ${dataset.records.length} records from: ${DATA_PATH}`);
  console.log('');
} catch (err) {
  console.error(`❌ FATAL: Cannot load data: ${err.message}`);
  process.exit(1);
}

// ============================================================
// TEST 6: ML Model Output Validation
// ============================================================
console.log('📋 TEST 6: ML Forecast Model');

test('Linear regression with known data', () => {
  const x = [0, 1, 2, 3, 4];
  const y = [100, 200, 300, 400, 500]; // Perfect linear: y = 100x + 100
  const result = linearRegression(x, y);
  assert(Math.abs(result.slope - 100) < 0.01, `Expected slope 100, got ${result.slope}`);
  assert(Math.abs(result.intercept - 100) < 0.01, `Expected intercept 100, got ${result.intercept}`);
  assert(result.rSquared > 0.99, `Expected R² ≈ 1.0, got ${result.rSquared}`);
  console.log(`     → Slope: ${result.slope}, Intercept: ${result.intercept}, R²: ${result.rSquared}`);
});

test('Moving average correctness', () => {
  const prices = [100, 200, 300, 400, 500];
  const ma3 = movingAverage(prices, 3);
  assert(Math.abs(ma3 - 400) < 0.01, `Expected MA3=400, got ${ma3}`); // (300+400+500)/3
  const ma5 = movingAverage(prices, 5);
  assert(Math.abs(ma5 - 300) < 0.01, `Expected MA5=300, got ${ma5}`); // (100+200+300+400+500)/5
  console.log(`     → MA3: ${ma3}, MA5: ${ma5}`);
});

test('Standard deviation correctness', () => {
  const values = [10, 10, 10, 10, 10];
  const sd = stdDev(values);
  assert(Math.abs(sd) < 0.01, `Expected stdDev=0 for uniform data, got ${sd}`);
  
  const values2 = [2, 4, 4, 4, 5, 5, 7, 9];
  const sd2 = stdDev(values2);
  assert(sd2 > 1.5 && sd2 < 3, `Expected stdDev between 1.5 and 3, got ${sd2}`);
  console.log(`     → Uniform: ${sd.toFixed(2)}, Varied: ${sd2.toFixed(2)}`);
});

test('Recommendation engine returns valid values', () => {
  const result1 = generateRecommendation(7500, 7000, 'up', 'Low', 7800);
  assert(['SELL NOW', 'HOLD', 'FAIR'].includes(result1.recommendation), `Invalid recommendation: ${result1.recommendation}`);

  const result2 = generateRecommendation(7500, 6500, 'down', 'High', 7000);
  assert(result2.recommendation === 'SELL NOW', `Expected SELL NOW for above-avg + declining, got ${result2.recommendation}`);

  const result3 = generateRecommendation(5000, 5100, 'up', 'Low', 5500);
  assert(result3.recommendation === 'HOLD', `Expected HOLD for uptrend, got ${result3.recommendation}`);
  
  console.log(`     → Up trend, below avg: ${result1.recommendation}`);
  console.log(`     → Down trend, above avg: ${result2.recommendation}`);
  console.log(`     → Up trend, near avg: ${result3.recommendation}`);
});

// Run forecast on actual data
console.log('');
console.log('📋 TEST 6b: Forecast on Real Mandi Data');

// Find commodities with enough data for meaningful forecast
const commodityCounts = {};
for (const r of dataset.records) {
  commodityCounts[r.commodity] = (commodityCounts[r.commodity] || 0) + 1;
}
const topCommodities = Object.entries(commodityCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

console.log(`   Top 5 commodities by data volume: ${topCommodities.map(c => `${c[0]} (${c[1]})`).join(', ')}`);

for (const [commodity, count] of topCommodities) {
  test(`Forecast for ${commodity} (${count} records)`, () => {
    const forecast = runForecast(commodity, dataset.records);
    assert(forecast.dataAvailable, `Forecast unavailable: ${forecast.reason}`);
    assert(forecast.currentModalPrice > 0, `Current price must be > 0`);
    assert(forecast.forecast7d.predictedPrice > 0, `Forecast price must be > 0`);
    assert(['up', 'down', 'stable'].includes(forecast.trend), `Invalid trend: ${forecast.trend}`);
    assert(['SELL NOW', 'HOLD', 'FAIR'].includes(forecast.recommendation), `Invalid recommendation: ${forecast.recommendation}`);
    
    console.log(`     → Current: ₹${forecast.currentModalPrice}, Avg: ₹${forecast.avgModalPrice}`);
    console.log(`     → Forecast 7d: ₹${forecast.forecast7d.predictedPrice} [${forecast.forecast7d.lowerBound}-${forecast.forecast7d.upperBound}]`);
    console.log(`     → Trend: ${forecast.trend}, Volatility: ${forecast.volatility.label} (CV: ${forecast.volatility.coeffOfVariation}%)`);
    console.log(`     → Recommendation: ${forecast.recommendation} — ${forecast.recommendationReason}`);
    console.log(`     → Regression: slope=${forecast.regression.slope}, R²=${forecast.regression.rSquared}`);
  });
}

// Gujarat-specific forecast
test('Gujarat commodity forecast', () => {
  const gujaratRecords = dataset.records.filter(r => r.state === 'Gujarat');
  if (gujaratRecords.length < 2) {
    console.log(`     → Skipped: Only ${gujaratRecords.length} Gujarat records (need ≥2)`);
    return;
  }
  
  const gujaratCommodity = gujaratRecords[0].commodity;
  const forecast = runForecast(gujaratCommodity, gujaratRecords);
  console.log(`     → Gujarat ${gujaratCommodity}: ${forecast.dataAvailable ? `₹${forecast.currentModalPrice}, trend: ${forecast.trend}` : forecast.reason}`);
});

// ============================================================
// Summary
// ============================================================
console.log('');
console.log('━'.repeat(60));
console.log(`📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
console.log('━'.repeat(60));
console.log('');

process.exit(failed > 0 ? 1 : 0);
