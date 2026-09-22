# AgroMind ML (Machine Learning & AI Engine)

This directory contains AgroMind's machine learning pipelines, trained models, training scripts, and notebooks.

## Directory Structure
```
AgroMind/
├── data/
│   ├── original/          # Raw collected datasets (e.g. government mandi snapshots)
│   └── cleaned/           # Preprocessed, normalized, and validated datasets
├── ml/
│   ├── notebooks/         # Jupyter / exploratory data analysis & training notebooks
│   ├── models/            # Exported model weights, ONNX, or serialized artifacts
│   ├── pipelines/         # Feature engineering & training pipelines
│   └── README.md
├── server/                # Backend API & edge functions
└── src/                   # Frontend React + TypeScript application
```

## Planned & Supported Models
1. **Crop Recommendation Engine**:
   - Inputs: N-P-K soil nutrients, pH, rainfall, temperature, humidity, district/state.
   - Output: Ranked optimal crops with confidence scores.
2. **Crop Health & Disease Diagnostic**:
   - Computer vision model for leaf pathology classification.
3. **Mandi Price Forecasting**:
   - Time-series price projections combining arrival patterns and seasonal historical trends.
