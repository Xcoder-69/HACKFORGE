import os
import json
import pandas as pd
import numpy as np

def run_audit():
    clean_path = os.path.join('data', 'cleaned', 'mandi_data_cleaned.csv')
    orig_path = os.path.join('data', 'original', 'Current Daily Price of Various Commodities from Various Markets (Mandi).csv')
    
    print("=" * 60)
    print("AGROMIND AI — MANDI DATASET IN-DEPTH AUDIT REPORT")
    print("=" * 60)
    
    # 1. Existence
    print("\n[1] FILE EXISTENCE & INTEGRITY")
    print(f"  Original CSV exists: {os.path.exists(orig_path)} ({os.path.getsize(orig_path):,} bytes)")
    print(f"  Cleaned CSV exists:  {os.path.exists(clean_path)} ({os.path.getsize(clean_path):,} bytes)")
    
    df_orig = pd.read_csv(orig_path)
    df = pd.read_csv(clean_path)
    
    print(f"  Original shape: {df_orig.shape}")
    print(f"  Cleaned shape:  {df.shape}")
    print(f"  Row consistency: {'MATCH' if len(df_orig) == len(df) else 'MISMATCH'}")
    
    # 2. Schema
    print("\n[2] DATASET SCHEMA & DATA TYPES")
    print(f"  Total Rows:    {len(df):,}")
    print(f"  Total Columns: {len(df.columns)}")
    print("  Columns & Types:")
    for col in df.columns:
        print(f"    - {col:15s} : {str(df[col].dtype):10s} (non-null: {df[col].count():,})")
        
    # 3. Missing Values & Duplicates
    print("\n[3] MISSING VALUES & DUPLICATES")
    missing = df.isnull().sum()
    print(f"  Missing values per column:\n{missing.to_string()}")
    dup_count = df.duplicated().sum()
    print(f"  Exact Duplicates: {dup_count}")
    
    # 4. Cardinality / Unique Counts
    print("\n[4] CATEGORICAL CARDINALITY & UNIQUE COUNTS")
    cat_cols = ['state', 'district', 'market', 'commodity', 'variety', 'grade']
    for c in cat_cols:
        print(f"  - {c:12s}: {df[c].nunique():,} unique values")
        
    # 5. Date Analysis
    print("\n[5] TEMPORAL / DATE ANALYSIS")
    dates = df['arrival_date'].unique()
    print(f"  Unique arrival dates: {dates.tolist()}")
    print(f"  Total distinct dates: {len(dates)}")
    
    # 6. Numerical Price Analysis
    print("\n[6] NUMERICAL PRICE STATISTICS (Rs/Quintal)")
    price_cols = ['min_price', 'max_price', 'modal_price']
    stats = df[price_cols].describe().T[['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']]
    print(stats.to_string())
    
    # Negative / Zero prices
    print("\n[7] DATA QUALITY & BUSINESS CONSTRAINT CHECKS")
    for col in price_cols:
        neg = (df[col] < 0).sum()
        zero = (df[col] == 0).sum()
        print(f"  {col:12s}: Negative={neg}, Zero={zero}")
        
    violations = ((df['min_price'] > df['modal_price']) | (df['modal_price'] > df['max_price'])).sum()
    print(f"  Ordering constraint (min <= modal <= max) violations: {violations} ({violations/len(df)*100:.2f}%)")
    
    # 8. Leakage / Price Relationships
    print("\n[8] DATA LEAKAGE & ECONOMIC RELATIONSHIP ANALYSIS")
    corr = df[price_cols].corr()
    print("  Correlation Matrix:")
    print(corr.round(4).to_string())
    
    mid_price = (df['min_price'] + df['max_price']) / 2.0
    exact_mid = (df['modal_price'] == mid_price).sum()
    exact_min = (df['modal_price'] == df['min_price']).sum()
    exact_max = (df['modal_price'] == df['max_price']).sum()
    min_eq_max = (df['min_price'] == df['max_price']).sum()
    
    print(f"  Rows where min_price == max_price:       {min_eq_max:,} ({min_eq_max/len(df)*100:.2f}%)")
    print(f"  Rows where modal_price == (min+max)/2:   {exact_mid:,} ({exact_mid/len(df)*100:.2f}%)")
    print(f"  Rows where modal_price == min_price:     {exact_min:,} ({exact_min/len(df)*100:.2f}%)")
    print(f"  Rows where modal_price == max_price:     {exact_max:,} ({exact_max/len(df)*100:.2f}%)")
    print("  => CRITICAL INSIGHT: Predicting modal_price using min_price & max_price is tautological data leakage!")
    print("     The real ML challenge is estimating prevailing market price from commodity, variety, grade, market & state.")
    
    # 9. Top Entities
    print("\n[9] TOP STATES & COMMODITIES")
    print("  Top 5 States by record count:")
    for state, cnt in df['state'].value_counts().head(5).items():
        print(f"    - {state:20s}: {cnt:,} records")
        
    print("  Top 5 Commodities by record count:")
    for comm, cnt in df['commodity'].value_counts().head(5).items():
        print(f"    - {comm:20s}: {cnt:,} records")
        
    print(f"  Gujarat records count: {(df['state'] == 'Gujarat').sum()}")

if __name__ == '__main__':
    run_audit()
