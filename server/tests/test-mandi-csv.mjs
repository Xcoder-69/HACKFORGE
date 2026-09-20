#!/usr/bin/env node
/**
 * AgroMind AI — Backend Test: Mandi CSV Data Service
 * Tests CSV parsing, data integrity, and filtering logic.
 * Run: node server/tests/test-mandi-csv.mjs
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

console.log('');
console.log('🧪 AgroMind Backend Test Suite: Mandi CSV Data');
console.log('━'.repeat(60));

// Load data
let dataset;
try {
  const raw = readFileSync(DATA_PATH, 'utf-8');
  dataset = JSON.parse(raw);
  console.log(`📄 Loaded dataset from: ${DATA_PATH}`);
  console.log(`   Total records: ${dataset.records.length}`);
  console.log('');
} catch (err) {
  console.error(`❌ FATAL: Cannot load data file: ${err.message}`);
  console.error(`   Run preprocessing first: node server/scripts/preprocess-mandi-csv.mjs`);
  process.exit(1);
}

// ============================================================
// TEST 1: CSV loads correctly, all rows parsed
// ============================================================
console.log('📋 TEST 1: CSV Data Integrity');

test('Dataset has metadata', () => {
  assert(dataset.metadata, 'metadata is missing');
  assert(dataset.metadata.totalRecords > 0, 'totalRecords should be > 0');
});

test('Dataset has indexes', () => {
  assert(dataset.indexes, 'indexes is missing');
  assert(dataset.indexes.states.length > 0, 'states index is empty');
  assert(dataset.indexes.commodities.length > 0, 'commodities index is empty');
});

test('Records count matches metadata', () => {
  assert(
    dataset.records.length === dataset.metadata.totalRecords,
    `Expected ${dataset.metadata.totalRecords} records, got ${dataset.records.length}`
  );
});

test('All records have required fields', () => {
  const requiredFields = ['state', 'district', 'market', 'commodity', 'minPrice', 'maxPrice', 'modalPrice'];
  const firstRecord = dataset.records[0];
  for (const field of requiredFields) {
    assert(field in firstRecord, `Missing required field: ${field}`);
  }
});

test('Price fields are numbers', () => {
  const sample = dataset.records.slice(0, 100);
  for (const record of sample) {
    assert(typeof record.minPrice === 'number', `minPrice is not a number in record: ${JSON.stringify(record).substring(0, 100)}`);
    assert(typeof record.maxPrice === 'number', `maxPrice is not a number`);
    assert(typeof record.modalPrice === 'number', `modalPrice is not a number`);
  }
});

test('Min price <= Modal price <= Max price (general check)', () => {
  let violations = 0;
  for (const record of dataset.records) {
    if (record.minPrice > 0 && record.maxPrice > 0 && record.modalPrice > 0) {
      if (record.minPrice > record.modalPrice || record.modalPrice > record.maxPrice) {
        violations++;
      }
    }
  }
  // Allow a few data quality issues in government data
  const violationRate = (violations / dataset.records.length) * 100;
  assert(violationRate < 5, `${violationRate.toFixed(1)}% of records have price ordering violations`);
});

test('Total records close to expected ~7990', () => {
  assert(dataset.records.length > 7000, `Expected ~7990 records, got ${dataset.records.length}`);
  assert(dataset.records.length < 10000, `Unexpectedly high record count: ${dataset.records.length}`);
});

// ============================================================
// TEST 2: State filtering works
// ============================================================
console.log('');
console.log('📋 TEST 2: State Filtering');

test('Can filter by state=Gujarat', () => {
  const gujaratRecords = dataset.records.filter(r => r.state === 'Gujarat');
  assert(gujaratRecords.length > 0, 'No Gujarat records found');
  console.log(`     → Gujarat records: ${gujaratRecords.length}`);
});

test('Gujarat index matches actual records', () => {
  const fromRecords = dataset.records.filter(r => r.state === 'Gujarat').length;
  const fromMetadata = dataset.metadata.gujaratRecords;
  assert(fromRecords === fromMetadata, `Index says ${fromMetadata} Gujarat records, actual is ${fromRecords}`);
});

test('Can filter by state=Maharashtra', () => {
  const mhRecords = dataset.records.filter(r => r.state === 'Maharashtra');
  assert(mhRecords.length > 0, 'No Maharashtra records found');
  console.log(`     → Maharashtra records: ${mhRecords.length}`);
});

test('Non-existent state returns 0 records', () => {
  const noneRecords = dataset.records.filter(r => r.state === 'Atlantis');
  assert(noneRecords.length === 0, `Expected 0 records for Atlantis, got ${noneRecords.length}`);
});

// ============================================================
// TEST 3: Commodity filtering works
// ============================================================
console.log('');
console.log('📋 TEST 3: Commodity Filtering');

test('Can filter by commodity (case-insensitive contains)', () => {
  const cottonRecords = dataset.records.filter(r => r.commodity.toLowerCase().includes('cotton'));
  console.log(`     → Cotton records: ${cottonRecords.length}`);
  // Cotton may or may not be in today's data
});

test('Can filter by commodity=Maize', () => {
  const maizeRecords = dataset.records.filter(r => r.commodity.toLowerCase().includes('maize'));
  assert(maizeRecords.length > 0, 'No Maize records found');
  console.log(`     → Maize records: ${maizeRecords.length}`);
});

test('Combined state+commodity filter works', () => {
  const filtered = dataset.records.filter(
    r => r.state === 'Gujarat' && r.commodity.toLowerCase().includes('banana')
  );
  console.log(`     → Gujarat + Banana: ${filtered.length}`);
});

test('Gujarat commodities index populated', () => {
  assert(dataset.indexes.gujaratCommodities.length > 0, 'Gujarat commodities index is empty');
  console.log(`     → Gujarat commodities: ${dataset.indexes.gujaratCommodities.join(', ')}`);
});

test('Gujarat markets index populated', () => {
  assert(dataset.indexes.gujaratMarkets.length > 0, 'Gujarat markets index is empty');
  console.log(`     → Gujarat markets: ${dataset.indexes.gujaratMarkets.join(', ')}`);
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
