import pandas as pd
import numpy as np
import random

random.seed(42)
np.random.seed(42)

dispute_types = [
    'WRONG_DEBIT',
    'DUPLICATE_TRANSACTION', 
    'BENEFICIARY_NOT_CREDITED',
    'TRANSACTION_TIMEOUT',
    'TECHNICAL_DECLINE'
]

bank_codes = ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'PNB', 'BOB']
upi_handles = ['@paytm', '@gpay', '@phonepe', '@ybl', '@okaxis', '@upi']

def generate_dispute():
    dispute_type = random.choice(dispute_types)
    
    if dispute_type == 'WRONG_DEBIT':
        amount = round(random.uniform(100, 50000), 2)
        hour = random.randint(0, 23)
        age_hours = random.uniform(0, 72)
        has_duplicate = 0
    elif dispute_type == 'DUPLICATE_TRANSACTION':
        amount = round(random.uniform(100, 10000), 2)
        hour = random.randint(8, 22)
        age_hours = random.uniform(0, 24)
        has_duplicate = 1
    elif dispute_type == 'BENEFICIARY_NOT_CREDITED':
        amount = round(random.uniform(500, 100000), 2)
        hour = random.randint(9, 18)
        age_hours = random.uniform(1, 168)
        has_duplicate = 0
    elif dispute_type == 'TRANSACTION_TIMEOUT':
        amount = round(random.uniform(100, 20000), 2)
        hour = random.randint(0, 23)
        age_hours = random.uniform(48, 200)
        has_duplicate = 0
    else:  # TECHNICAL_DECLINE
        amount = round(random.uniform(100, 5000), 2)
        hour = random.randint(0, 23)
        age_hours = random.uniform(0, 12)
        has_duplicate = 0

    bank_code = random.choice(bank_codes)
    upi_handle = random.choice(upi_handles)

    return {
        'amount': amount,
        'hour_of_day': hour,
        'age_hours': age_hours,
        'has_duplicate': has_duplicate,
        'bank_code': bank_code,
        'upi_handle': upi_handle,
        'dispute_type': dispute_type
    }

records = [generate_dispute() for _ in range(10000)]
df = pd.DataFrame(records)
df.to_csv('dispute_training_data.csv', index=False)
print(f"Generated {len(df)} training records")
print(df['dispute_type'].value_counts())