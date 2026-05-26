from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException

from feature_extractor import build_feature_frame, extract_url_features
from html_analyzer import analyze_website
from html_scanner import fetch_and_analyze

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        "Model files not found. Run 'python train_model.py' in ai-service first."
    )

model = joblib.load(MODEL_PATH)


@app.get("/")
def home():
    return {
        "message": "SentinelAI FastAPI Server Running"
    }


@app.post("/predict")
def predict(data: dict):
    url = data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="url is required")

    features = build_feature_frame([url])
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))

    html_analysis = analyze_website(url)

    severity = "Low"
    if confidence > 0.9:
        severity = "Critical"
    elif confidence > 0.7:
        severity = "High"
    elif confidence > 0.5:
        severity = "Medium"

    return {
        "url": url,
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "severity": severity,
        "html_analysis": html_analysis
    }


@app.post("/scan-url")
def scan_url(data: dict):
    url = data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="url is required")

    url_features = extract_url_features(url)
    feature_frame = build_feature_frame([url])

    prediction = model.predict(feature_frame)[0]
    probabilities = model.predict_proba(feature_frame)[0]
    confidence = float(max(probabilities))

    severity = "Low"
    if confidence > 0.9:
        severity = "Critical"
    elif confidence > 0.7:
        severity = "High"
    elif confidence > 0.5:
        severity = "Medium"

    html_result = fetch_and_analyze(url)
    html_analysis = html_result.get("html_analysis", {})

    return {
        "url": url,
        "domain": html_result.get("domain"),
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "severity": severity,
        "features": url_features,
        "html_analysis": html_analysis,
        "fetch_status": html_result.get("fetch_status"),
        "error": html_result.get("error"),
        "scan_duration": html_result.get("scan_duration"),
        "has_https": url_features.get("has_https"),
        "suspicious_keyword_count": url_features.get("suspicious_keyword_count"),
        "form_count": html_analysis.get("form_count", 0),
        "iframe_count": html_analysis.get("iframe_count", 0),
        "script_count": html_analysis.get("script_count", 0),
        "external_script_count": html_analysis.get("external_script_count", 0),
        "password_input_count": html_analysis.get("password_input_count", 0),
        "hidden_element_count": html_analysis.get("hidden_element_count", 0),
    }
