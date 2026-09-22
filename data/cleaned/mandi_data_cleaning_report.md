# AgroMind Mandi CSV Cleaning Report

## Source Information
- Source CSV: `data/original/Current Daily Price of Various Commodities from Various Markets (Mandi).csv`
- Cleaned Output: `data/cleaned/mandi_data_cleaned.csv`
- Metadata: `data/cleaned/mandi_data_metadata.json`

## Audit & Verification Summary
- **Original Rows:** 7,992
- **Cleaned Rows:** 7,992
- **Original Columns:** 10
- **Cleaned Columns:** 10
- **Exact Duplicates Removed:** 0
- **Invalid / Negative Price Rows Rejected:** 0
- **Missing Value Rows Dropped:** 0
- **Distinct States:** 21
- **Distinct Districts:** 219
- **Distinct Markets (APMCs):** 500
- **Distinct Commodities:** 151
- **Distinct Varieties:** 227
- **Distinct Grades:** 12
- **Distinct Arrival Dates:** 1 (2026-09-20)
- **Gujarat Records:** 35

## Cleaning Operations Applied
1. Normalized column headers to clean lowercase `snake_case` tokens.
2. Trimmed leading and trailing whitespace from string attributes.
3. Converted date representations to standardized ISO format (`YYYY-MM-DD`).
4. Parsed and validated numeric price fields (`min_price`, `max_price`, `modal_price`).
5. Verified non-negative business constraints (`min_price >= 0`, `modal_price >= 0`).
6. Preserved the original raw CSV untouched.
7. Zero synthetic imputation or fabricated values introduced.

## Critical ML Feasibility Checks
- **Time-Series Forecasting:** INSUFFICIENT. All records originate from a single date snapshot (2026-09-20). No temporal horizon exists for 7-day or 30-day forecasting.
- **Crop Recommendation:** INSUFFICIENT ALONE. Lacks soil chemistry (N-P-K, pH, OC), climatic metrics (rainfall, temperature, humidity), and agronomic outcome targets.
- **Valid ML Task:** Cross-sectional Market Price Estimation / APMC rate benchmarking using commodity, variety, grade, and geographic features.
