#!/usr/bin/env python3
"""
AgroMind AI — Mandi Dataset Preprocessor
Clean and standardize raw daily mandi market records.
Preserves data/original/ unmodified.
Outputs:
  - data/cleaned/mandi_data_cleaned.csv
  - data/cleaned/mandi_data_metadata.json
  - data/cleaned/mandi_data_cleaning_report.md
"""

import os
import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime

# Configure UTF-8 stdout for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ORIGINAL_CSV_PATH = os.path.join("data", "original", "Current Daily Price of Various Commodities from Various Markets (Mandi).csv")
CLEANED_DIR = os.path.join("data", "cleaned")
CLEANED_CSV_PATH = os.path.join(CLEANED_DIR, "mandi_data_cleaned.csv")
METADATA_JSON_PATH = os.path.join(CLEANED_DIR, "mandi_data_metadata.json")
REPORT_MD_PATH = os.path.join(CLEANED_DIR, "mandi_data_cleaning_report.md")

COLUMN_RENAME_MAP = {
    "State": "state",
    "District": "district",
    "Market": "market",
    "Commodity": "commodity",
    "Variety": "variety",
    "Grade": "grade",
    "Arrival_Date": "arrival_date",
    "Min_x0020_Price": "min_price",
    "Max_x0020_Price": "max_price",
    "Modal_x0020_Price": "modal_price"
}

def clean_data():
    print("=" * 60)
    print("AGROMIND AI — MANDI DATA PREPROCESSING PIPELINE")
    print("=" * 60)

    if not os.path.exists(ORIGINAL_CSV_PATH):
        raise FileNotFoundError(f"Original CSV not found at {ORIGINAL_CSV_PATH}")

    os.makedirs(CLEANED_DIR, exist_ok=True)

    print(f"[*] Loading raw dataset: {ORIGINAL_CSV_PATH}")
    # Read with utf-8-sig to handle possible BOM
    df_raw = pd.read_csv(ORIGINAL_CSV_PATH, encoding="utf-8-sig")
    raw_rows, raw_cols = df_raw.shape
    print(f"    Raw records: {raw_rows:,} rows | {raw_cols} columns")

    # 1. Normalize Column Headers
    df = df_raw.rename(columns=lambda c: c.strip())
    df = df.rename(columns=COLUMN_RENAME_MAP)
    print(f"    Normalized columns: {list(df.columns)}")

    # 2. Trim string whitespace
    str_cols = ["state", "district", "market", "commodity", "variety", "grade"]
    for col in str_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    # 3. Standardize Arrival Date to ISO (YYYY-MM-DD)
    if "arrival_date" in df.columns:
        # Convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
        df["arrival_date"] = pd.to_datetime(df["arrival_date"], dayfirst=True, errors="coerce").dt.strftime("%Y-%m-%d")

    # 4. Clean and Cast Numerical Price Fields
    price_cols = ["min_price", "max_price", "modal_price"]
    for col in price_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # 5. Handle Missing Rows (Drop rows with missing essential fields if any)
    initial_clean_rows = len(df)
    df = df.dropna(subset=["state", "commodity", "market", "modal_price"])
    dropped_nulls = initial_clean_rows - len(df)

    # 6. Quality Checks: Remove impossible / negative values
    invalid_prices = (df["min_price"] < 0) | (df["max_price"] < 0) | (df["modal_price"] < 0)
    df = df[~invalid_prices]

    # 7. Deduplication (Exact duplicates check)
    exact_dups = df.duplicated().sum()
    df = df.drop_duplicates()

    # Final dataset stats
    final_rows = len(df)
    print(f"[OK] Cleaned records: {final_rows:,} rows (0 synthetic values, 0 fabricated labels)")

    # Save cleaned CSV
    df.to_csv(CLEANED_CSV_PATH, index=False, encoding="utf-8")
    print(f"[SAVE] Saved cleaned CSV to: {CLEANED_CSV_PATH}")

    # Generate metadata
    unique_dates = sorted(df["arrival_date"].unique().tolist())
    metadata = {
        "dataset_name": "Current Daily Price of Various Commodities from Various Markets (Mandi)",
        "source_file": "data/original/Current Daily Price of Various Commodities from Various Markets (Mandi).csv",
        "cleaned_file": "data/cleaned/mandi_data_cleaned.csv",
        "version": "v1",
        "original_rows": int(raw_rows),
        "cleaned_rows": int(final_rows),
        "duplicate_rows_removed": int(exact_dups),
        "invalid_records_rejected": int(dropped_nulls + invalid_prices.sum()),
        "columns": list(df.columns),
        "distinct_counts": {
            "state": int(df["state"].nunique()),
            "district": int(df["district"].nunique()),
            "market": int(df["market"].nunique()),
            "commodity": int(df["commodity"].nunique()),
            "variety": int(df["variety"].nunique()),
            "grade": int(df["grade"].nunique()),
            "arrival_date": int(len(unique_dates))
        },
        "date_range": {
            "min": unique_dates[0] if unique_dates else None,
            "max": unique_dates[-1] if unique_dates else None,
            "distinct": len(unique_dates)
        },
        "gujarat_rows": int((df["state"] == "Gujarat").sum()),
        "potential_use": [
            "market benchmark price estimation",
            "market comparison and APMC ranking",
            "market price feature engineering"
        ],
        "not_sufficient_alone_for": [
            "crop recommendation supervised training (requires soil N-P-K, pH, weather, yield)",
            "historical time-series price forecasting (contains only 1 single arrival date)"
        ]
    }

    with open(METADATA_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[SAVE] Saved metadata JSON to: {METADATA_JSON_PATH}")

    # Generate cleaning report
    report_content = f"""# AgroMind Mandi CSV Cleaning Report

## Source Information
- Source CSV: `data/original/Current Daily Price of Various Commodities from Various Markets (Mandi).csv`
- Cleaned Output: `data/cleaned/mandi_data_cleaned.csv`
- Metadata: `data/cleaned/mandi_data_metadata.json`

## Audit & Verification Summary
- **Original Rows:** {raw_rows:,}
- **Cleaned Rows:** {final_rows:,}
- **Original Columns:** {raw_cols}
- **Cleaned Columns:** {len(df.columns)}
- **Exact Duplicates Removed:** {exact_dups}
- **Invalid / Negative Price Rows Rejected:** {int(invalid_prices.sum())}
- **Missing Value Rows Dropped:** {dropped_nulls}
- **Distinct States:** {df['state'].nunique()}
- **Distinct Districts:** {df['district'].nunique()}
- **Distinct Markets (APMCs):** {df['market'].nunique()}
- **Distinct Commodities:** {df['commodity'].nunique()}
- **Distinct Varieties:** {df['variety'].nunique()}
- **Distinct Grades:** {df['grade'].nunique()}
- **Distinct Arrival Dates:** {len(unique_dates)} ({unique_dates[0] if unique_dates else 'N/A'})
- **Gujarat Records:** {(df['state'] == 'Gujarat').sum()}

## Cleaning Operations Applied
1. Normalized column headers to clean lowercase `snake_case` tokens.
2. Trimmed leading and trailing whitespace from string attributes.
3. Converted date representations to standardized ISO format (`YYYY-MM-DD`).
4. Parsed and validated numeric price fields (`min_price`, `max_price`, `modal_price`).
5. Verified non-negative business constraints (`min_price >= 0`, `modal_price >= 0`).
6. Preserved the original raw CSV untouched.
7. Zero synthetic imputation or fabricated values introduced.

## Critical ML Feasibility Checks
- **Time-Series Forecasting:** INSUFFICIENT. All records originate from a single date snapshot ({unique_dates[0] if unique_dates else 'N/A'}). No temporal horizon exists for 7-day or 30-day forecasting.
- **Crop Recommendation:** INSUFFICIENT ALONE. Lacks soil chemistry (N-P-K, pH, OC), climatic metrics (rainfall, temperature, humidity), and agronomic outcome targets.
- **Valid ML Task:** Cross-sectional Market Price Estimation / APMC rate benchmarking using commodity, variety, grade, and geographic features.
"""

    with open(REPORT_MD_PATH, "w", encoding="utf-8") as f:
        f.write(report_content)
    print(f"[SAVE] Saved cleaning report to: {REPORT_MD_PATH}")
    print("=" * 60)
    print("[SUCCESS] PREPROCESSING COMPLETED SUCCESSFULLY")

if __name__ == "__main__":
    clean_data()
