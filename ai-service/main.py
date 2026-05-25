from fastapi import FastAPI
import joblib
from pathlib import Path

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.pkl"
VECTORIZER_PATH = BASE_DIR / "vectorizer.pkl"

if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
    raise FileNotFoundError(
        "Model files not found. Run 'python train_model.py' in ai-service first."
    )

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


@app.get("/")
def home():
    return {
        "message": "SentinelAI FastAPI Server Running"
    }


@app.post("/predict")
def predict(data: dict):
    url = data.get("url")
    url_vector = vectorizer.transform([url])
    prediction = model.predict(url_vector)[0]
    probabilities = model.predict_proba(url_vector)[0]
    confidence = max(probabilities)

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
        "confidence": round(float(confidence), 2),
        "severity": severity
    }
