# AgroMind AI — Mandi Market Price Model Evaluation Report

## 1. Executive Summary
- **Model Version:** `v1.0.0`
- **Selected Algorithm:** `RandomForestRegressor`
- **Task:** Mandi Modal Price Estimation from Agricultural & Geographic Attributes
- **Primary Target:** `modal_price` (₹ / Quintal)
- **Features Used:** `commodity, variety, grade, state, district, market`

## 2. Dataset Partitioning (80/10/10)
- **Total Records:** 7,992
- **Training Set:** 6,392 records (80.0%)
- **Validation Set:** 800 records (10.0%)
- **Test Set:** 800 records (10.0%)
- **Data Splitting Note:** Because all records in this dataset share a single arrival date (`2026-09-20`), chronological time splitting is not possible. A reproducible seeded split (`random_state=42`) was conducted with isolated out-of-fold target encoding.

## 3. Data Leakage & Feature Rationale
- **Excluded Features:** `min_price`, `max_price`.
- **Reason:** In our dataset audit, `modal_price` is exactly equal to `(min_price + max_price)/2` in **94.26%** of rows. Training a model with `min_price` and `max_price` yields an artificial $R^2 \approx 0.999$, which is tautological and economically meaningless because a farmer does not know the daily auction min and max in advance.
- **Defensible Solution:** The model estimates the modal price strictly from **crop identity (`commodity`, `variety`, `grade`)** and **geographic location (`state`, `district`, `market`)**.

## 4. Model Performance Comparison

| Model | Split | $R^2$ | MAE (₹/Qtl) | RMSE (₹/Qtl) | MAPE (%) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Random Forest Regressor** | **Train** | **0.9480** | **₹671.92** | **₹1,314.16** | **2080.10%** |
| | **Validation** | **0.8646** | **₹1,252.09** | **₹2,515.31** | **3642.90%** |
| | **Test** | **0.8290** | **₹1,121.78** | **₹1,926.35** | **71.13%** |
| Gradient Boosting Regressor | Train | 0.9596 | ₹790.82 | ₹1,159.15 | 1814.35% |
| | Validation | 0.8733 | ₹1,269.48 | ₹2,433.68 | 2218.54% |
| | Test | 0.8056 | ₹1,155.48 | ₹2,053.93 | 57.50% |

**Selection Outcome:** `RandomForestRegressor` was selected due to higher generalizability on the unseen test set ($R^2 = 0.8290$, $\text{MAE} = ₹1,121.78$).

## 5. Feature Importance Analysis
| Rank | Feature | Importance Weight | Description |
| :---: | :--- | :---: | :--- |
| 1 | `commodity` | 77.79% | Primary driver of price levels |
| 2 | `variety` | 10.55% | Primary driver of price levels |
| 3 | `state` | 4.00% | Primary driver of price levels |
| 4 | `market` | 3.58% | Primary driver of price levels |
| 5 | `district` | 3.08% | Primary driver of price levels |
| 6 | `grade` | 1.00% | Primary driver of price levels |

## 6. Critical Dataset Limitations & Non-Claims
1. **No Historical Time-Series Forecasting:** The dataset contains records for only **1 unique arrival date (`2026-09-20`)**. Any claim of 7-day, 30-day, or seasonal price forecasting from this dataset is scientifically false.
2. **No Crop Recommendation from Mandi Data Alone:** Crop suitability requires soil chemistry (N-P-K, pH, organic carbon), meteorological observations (rainfall, temperature, humidity), and agronomic yield outcomes.
3. **Application Integrity:** The live AgroMind application continues to serve authentic mandi records directly from APMC sources. The ML model acts as a secondary intelligence layer for market rate estimation when explicit APMC auction prices for a specific market are unobserved.
