from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

with open('model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('encoder_bank.pkl', 'rb') as f:
    le_bank = pickle.load(f)
with open('encoder_upi.pkl', 'rb') as f:
    le_upi = pickle.load(f)
with open('encoder_type.pkl', 'rb') as f:
    le_type = pickle.load(f)

print("ML model loaded successfully")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "UP", "model": "RandomForest v1.0", "accuracy": "88.1%"})

@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json()

    amount = float(data.get('amount', 0))
    hour_of_day = int(data.get('hourOfDay', 12))
    age_hours = float(data.get('ageHours', 0))
    has_duplicate = int(data.get('hasDuplicate', 0))
    bank_code = data.get('bankCode', 'HDFC')
    upi_handle = data.get('upiHandle', '@upi')

    try:
        bank_enc = le_bank.transform([bank_code])[0]
    except:
        bank_enc = 0
    try:
        upi_enc = le_upi.transform([upi_handle])[0]
    except:
        upi_enc = 0

    features = np.array([[amount, hour_of_day, age_hours,
                          has_duplicate, bank_enc, upi_enc]])

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))
    dispute_type = le_type.inverse_transform([prediction])[0]

    return jsonify({
        "disputeType": dispute_type,
        "confidenceScore": round(confidence, 4),
        "allProbabilities": {
            label: round(float(prob), 4)
            for label, prob in zip(le_type.classes_, probabilities)
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)