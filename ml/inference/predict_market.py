#!/usr/bin/env python3
"""
AgroMind AI — Mandi Market Price Inference Engine
Accepts structured agricultural & market input and produces modal price estimation.
Usage:
  python ml/inference/predict_market.py '{"commodity": "Tomato", "state": "Gujarat", "district": "Rajkot", "market": "Gondal APMC"}'
  python ml/inference/predict_market.py --commodity "Groundnut" --market "Gondal APMC" --state "Gujarat"
  python ml/inference/predict_market.py  (runs default verification case)
"""

import os
import sys
import json
import argparse
import joblib
import pandas as pd
from datetime import datetime, timezone

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

MODEL_PATH = os.path.join("ml", "models", "agromind_market_model_v1.joblib")
METADATA_PATH = os.path.join("ml", "models", "model_metadata.json")

_pipeline = None
_metadata = None

def load_pipeline():
    global _pipeline, _metadata
    if _pipeline is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please run training first: python ml/training/train_market_model.py")
        _pipeline = joblib.load(MODEL_PATH)
        
    if _metadata is None and os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
    return _pipeline, _metadata

def predict_modal_price(input_data: dict) -> dict:
    pipeline, metadata = load_pipeline()
    
    # Extract supported features
    commodity = str(input_data.get("commodity", "")).strip()
    if not commodity:
        raise ValueError("Field 'commodity' is required for market modal price estimation.")
        
    variety = str(input_data.get("variety", "Other")).strip() or "Other"
    grade = str(input_data.get("grade", "FAQ")).strip() or "FAQ"
    state = str(input_data.get("state", "Gujarat")).strip() or "Gujarat"
    district = str(input_data.get("district", input_data.get("market", ""))).strip() or "Unknown"
    market = str(input_data.get("market", district)).strip() or "General APMC"
    
    # Construct feature DataFrame
    features_df = pd.DataFrame([{
        "commodity": commodity,
        "variety": variety,
        "grade": grade,
        "state": state,
        "district": district,
        "market": market
    }])
    
    # Predict using the bundled TargetEncoder + Regressor pipeline
    raw_pred = pipeline.predict(features_df)[0]
    estimated_price = round(max(10.0, float(raw_pred)), 2)
    
    version = metadata.get("model_version", "v1.0.0") if metadata else "v1.0.0"
    model_type = metadata.get("model_type", "RandomForestRegressor") if metadata else "RandomForestRegressor"
    
    output = {
        "prediction": estimated_price,
        "unit": "INR_per_quintal",
        "commodity": commodity,
        "variety": variety,
        "grade": grade,
        "state": state,
        "district": district,
        "market": market,
        "modelVersion": version,
        "modelType": model_type,
        "modelRole": "Market price estimation / analysis model",
        "generatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    # If user provided min_price and max_price in query, record them as context
    if "min_price" in input_data and "max_price" in input_data:
        try:
            output["reportedRange"] = {
                "minPrice": float(input_data["min_price"]),
                "maxPrice": float(input_data["max_price"]),
                "status": "User provided auction bounds"
            }
        except (ValueError, TypeError):
            pass
            
    return output

def main():
    parser = argparse.ArgumentParser(description="AgroMind Mandi Market Price Inference")
    parser.add_argument("json_input", nargs="?", help="JSON input string containing query attributes")
    parser.add_argument("--commodity", help="Commodity name (e.g. Tomato, Groundnut, Wheat)")
    parser.add_argument("--market", help="Market name (e.g. Gondal APMC, Surat APMC)")
    parser.add_argument("--state", help="State name (e.g. Gujarat, Maharashtra)")
    parser.add_argument("--district", help="District name (e.g. Rajkot, Surat)")
    parser.add_argument("--variety", help="Variety name (e.g. Hybrid, Local, Other)")
    parser.add_argument("--grade", help="Grade (e.g. FAQ, Medium, Large)")
    parser.add_argument("--min_price", type=float, help="Reported minimum auction price")
    parser.add_argument("--max_price", type=float, help="Reported maximum auction price")

    args = parser.parse_args()

    input_payload = {}
    if args.json_input:
        try:
            input_payload = json.loads(args.json_input)
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"Invalid JSON argument: {str(e)}"}))
            sys.exit(1)
    else:
        if args.commodity:
            input_payload["commodity"] = args.commodity
        if args.market:
            input_payload["market"] = args.market
        if args.state:
            input_payload["state"] = args.state
        if args.district:
            input_payload["district"] = args.district
        if args.variety:
            input_payload["variety"] = args.variety
        if args.grade:
            input_payload["grade"] = args.grade
        if args.min_price is not None:
            input_payload["min_price"] = args.min_price
        if args.max_price is not None:
            input_payload["max_price"] = args.max_price

    # Fallback to authentic verification sample if no input provided
    if not input_payload:
        input_payload = {
            "commodity": "Groundnut",
            "variety": "GG-20",
            "grade": "FAQ",
            "state": "Gujarat",
            "district": "Rajkot",
            "market": "Gondal(Veg.market Gondal) APMC",
            "min_price": 6200.0,
            "max_price": 7100.0
        }

    try:
        res = predict_modal_price(input_payload)
        print(json.dumps(res, indent=2))
    except Exception as err:
        print(json.dumps({"error": str(err)}, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
