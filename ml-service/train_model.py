import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import pickle

df = pd.read_csv('dispute_training_data.csv')
print(f"Loaded {len(df)} records")

le_bank = LabelEncoder()
le_upi = LabelEncoder()
le_type = LabelEncoder()

df['bank_encoded'] = le_bank.fit_transform(df['bank_code'])
df['upi_encoded'] = le_upi.fit_transform(df['upi_handle'])
df['type_encoded'] = le_type.fit_transform(df['dispute_type'])

features = ['amount', 'hour_of_day', 'age_hours', 'has_duplicate', 'bank_encoded', 'upi_encoded']
X = df[features]
y = df['type_encoded']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
print(classification_report(y_test, y_pred, target_names=le_type.classes_))

with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('encoder_bank.pkl', 'wb') as f:
    pickle.dump(le_bank, f)
with open('encoder_upi.pkl', 'wb') as f:
    pickle.dump(le_upi, f)
with open('encoder_type.pkl', 'wb') as f:
    pickle.dump(le_type, f)

print("Model saved to model.pkl")