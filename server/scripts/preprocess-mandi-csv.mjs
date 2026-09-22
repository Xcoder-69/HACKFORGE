#!/usr/bin/env node
/**
 * AgroMind AI — Mandi CSV Preprocessor
 * Converts the Government Mandi CSV to structured JSON for Edge Function consumption.
 * Run: node server/scripts/preprocess-mandi-csv.mjs
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..');

const DATA_ORIGINAL_CSV = resolve(PROJECT_ROOT, 'data', 'original', 'Current Daily Price of Various Commodities from Various Markets (Mandi).csv');
const ROOT_CSV = resolve(PROJECT_ROOT, 'Current Daily Price of Various Commodities from Various Markets (Mandi).csv');
const CSV_PATH = existsSync(DATA_ORIGINAL_CSV) ? DATA_ORIGINAL_CSV : ROOT_CSV;
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'server', 'data');
const OUTPUT_PATH = resolve(OUTPUT_DIR, 'mandi_data.json');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function main() {
  console.log('📦 AgroMind Mandi CSV Preprocessor');
  console.log('━'.repeat(50));

  // Read CSV
  console.log(`📄 Reading CSV: ${CSV_PATH}`);
  const csvContent = readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  console.log(`   Total lines (including header): ${lines.length}`);

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  console.log(`   Headers: ${headers.join(', ')}`);

  // Map header names to clean keys
  const headerMap = {
    'State': 'state',
    'District': 'district',
    'Market': 'market',
    'Commodity': 'commodity',
    'Variety': 'variety',
    'Grade': 'grade',
    'Arrival_Date': 'arrivalDate',
    'Min_x0020_Price': 'minPrice',
    'Max_x0020_Price': 'maxPrice',
    'Modal_x0020_Price': 'modalPrice',
  };

  // Parse data rows
  const records = [];
  let parseErrors = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const fields = parseCSVLine(lines[i]);
      if (fields.length < headers.length) continue;

      const record = {};
      headers.forEach((header, idx) => {
        const key = headerMap[header] || header.toLowerCase().replace(/\s+/g, '_');
        let value = fields[idx] || '';

        // Convert price fields to numbers
        if (['minPrice', 'maxPrice', 'modalPrice'].includes(key)) {
          value = parseInt(value, 10) || 0;
        }

        record[key] = value;
      });

      records.push(record);
    } catch (err) {
      parseErrors++;
    }
  }

  console.log(`   Parsed records: ${records.length}`);
  console.log(`   Parse errors: ${parseErrors}`);

  // Compute metadata
  const states = [...new Set(records.map(r => r.state))].sort();
  const commodities = [...new Set(records.map(r => r.commodity))].sort();
  const districts = [...new Set(records.map(r => r.district))].sort();
  const markets = [...new Set(records.map(r => r.market))].sort();

  console.log(`\n📊 Data Summary:`);
  console.log(`   Unique States: ${states.length}`);
  console.log(`   Unique Commodities: ${commodities.length}`);
  console.log(`   Unique Districts: ${districts.length}`);
  console.log(`   Unique Markets: ${markets.length}`);

  // Gujarat-specific stats
  const gujaratRecords = records.filter(r => r.state === 'Gujarat');
  const gujaratCommodities = [...new Set(gujaratRecords.map(r => r.commodity))].sort();
  const gujaratMarkets = [...new Set(gujaratRecords.map(r => r.market))].sort();

  console.log(`\n🏛️ Gujarat Data:`);
  console.log(`   Gujarat Records: ${gujaratRecords.length}`);
  console.log(`   Gujarat Commodities: ${gujaratCommodities.length} — ${gujaratCommodities.slice(0, 10).join(', ')}${gujaratCommodities.length > 10 ? '...' : ''}`);
  console.log(`   Gujarat Markets: ${gujaratMarkets.length} — ${gujaratMarkets.slice(0, 10).join(', ')}${gujaratMarkets.length > 10 ? '...' : ''}`);

  // Build output
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      csvFile: 'Current Daily Price of Various Commodities from Various Markets (Mandi).csv',
      totalRecords: records.length,
      uniqueStates: states.length,
      uniqueCommodities: commodities.length,
      uniqueDistricts: districts.length,
      uniqueMarkets: markets.length,
      gujaratRecords: gujaratRecords.length,
    },
    indexes: {
      states,
      commodities,
      districts,
      markets,
      gujaratCommodities,
      gujaratMarkets,
    },
    records,
  };

  // Write output
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 0)); // minified for perf

  const outputSize = readFileSync(OUTPUT_PATH).length;
  console.log(`\n✅ Output written: ${OUTPUT_PATH}`);
  console.log(`   Size: ${(outputSize / 1024).toFixed(1)} KB`);
  console.log('━'.repeat(50));
}

main();
