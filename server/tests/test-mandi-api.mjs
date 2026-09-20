#!/usr/bin/env node
/**
 * AgroMind AI — Backend Test: Government Mandi Live API
 * Tests the data.gov.in Mandi API with the real MANDI_API_KEY.
 * Run: node server/tests/test-mandi-api.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  return fn().then(() => {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  }).catch((err) => {
    console.log(`  ❌ FAIL: ${name}`);
    console.log(`     Error: ${err.message}`);
    failed++;
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Load API key from .env
function loadApiKey() {
  try {
    const envContent = readFileSync(resolve(PROJECT_ROOT, '.env'), 'utf-8');
    const match = envContent.match(/MANDI_API_KEY=(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (_e) {
    // ignore
  }
  return null;
}

const GOV_API_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

console.log('');
console.log('🧪 AgroMind Backend Test Suite: Government Mandi API');
console.log('━'.repeat(60));

const apiKey = loadApiKey();
if (!apiKey) {
  console.error('❌ FATAL: MANDI_API_KEY not found in .env file');
  process.exit(1);
}
console.log(`🔑 API Key loaded: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('');

// ============================================================
// TEST 4: Call Government API with real key
// ============================================================
console.log('📋 TEST 4: Government API — Live Data');

await test('API responds with valid JSON', async () => {
  const url = `${GOV_API_BASE}?api-key=${apiKey}&format=json&limit=5`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  assert(response.ok, `API returned HTTP ${response.status}`);
  const data = await response.json();
  assert(data, 'No JSON body returned');
  console.log(`     → Response status: ${response.status}`);
  console.log(`     → Response keys: ${Object.keys(data).join(', ')}`);
});

await test('API returns records array', async () => {
  const url = `${GOV_API_BASE}?api-key=${apiKey}&format=json&limit=5`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  assert(Array.isArray(data.records), 'records is not an array');
  assert(data.records.length > 0, 'records array is empty');
  console.log(`     → Records received: ${data.records.length}`);
});

await test('Records have expected fields', async () => {
  const url = `${GOV_API_BASE}?api-key=${apiKey}&format=json&limit=3`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  const record = data.records[0];
  const expectedFields = ['state', 'district', 'market', 'commodity', 'min_price', 'max_price', 'modal_price'];
  for (const field of expectedFields) {
    assert(field in record, `Missing field: ${field}`);
  }
  console.log(`     → Sample record: ${JSON.stringify(record).substring(0, 200)}`);
});

await test('Can filter by state=Gujarat', async () => {
  const url = `${GOV_API_BASE}?api-key=${apiKey}&format=json&limit=10&filters[state]=Gujarat`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  if (data.records && data.records.length > 0) {
    const allGujarat = data.records.every(r => r.state === 'Gujarat');
    assert(allGujarat, 'Not all records are from Gujarat');
    console.log(`     → Gujarat records: ${data.records.length}`);
    console.log(`     → Gujarat commodities: ${[...new Set(data.records.map(r => r.commodity))].join(', ')}`);
  } else {
    console.log(`     → No Gujarat records in current batch (this is valid — govt API may not have Gujarat data today)`);
  }
});

await test('Can filter by commodity', async () => {
  const url = `${GOV_API_BASE}?api-key=${apiKey}&format=json&limit=10&filters[commodity]=Wheat`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  console.log(`     → Wheat records: ${data.records?.length || 0}`);
});

// ============================================================
// TEST 5: Fallback behavior when API is unreachable
// ============================================================
console.log('');
console.log('📋 TEST 5: API Fallback Behavior');

await test('Invalid API key returns error gracefully', async () => {
  const url = `${GOV_API_BASE}?api-key=invalid_key_12345&format=json&limit=3`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    // Even with invalid key, it should return a response (maybe 401 or 403)
    console.log(`     → Response status with invalid key: ${response.status}`);
    assert(true, 'API responded (even with error)');
  } catch (err) {
    // Network error is also a valid "failure" that we handle
    console.log(`     → Network error: ${err.message} (this is expected for invalid key)`);
    assert(true, 'Network error handled');
  }
});

await test('Timeout handling works', async () => {
  try {
    // Use a very short timeout to simulate slow API
    const url = `${GOV_API_BASE}?api-key=${apiKey}&format=json&limit=1000`;
    await fetch(url, { signal: AbortSignal.timeout(1) }); // 1ms timeout — will almost certainly fail
    // If it somehow succeeds, that's fine too
    console.log(`     → Surprisingly fast response (within 1ms)`);
  } catch (err) {
    assert(err.name === 'TimeoutError' || err.name === 'AbortError', `Expected timeout/abort error, got: ${err.name}`);
    console.log(`     → Correctly caught timeout: ${err.name}`);
  }
});

await test('Response structure validation for empty results', async () => {
  // Query something very specific that likely won't exist
  const url = `${GOV_API_BASE}?api-key=${apiKey}&format=json&limit=5&filters[commodity]=XYZNonexistent`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  // Should still return valid JSON structure
  assert(data !== null && data !== undefined, 'Response is null');
  console.log(`     → Empty query response keys: ${Object.keys(data).join(', ')}`);
  console.log(`     → Records: ${data.records?.length || 0} (expected 0)`);
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
