import os
import requests
import pandas as pd
import numpy as np
import statsmodels.api as sm
from statsmodels.genmod.generalized_estimating_equations import GEE
from statsmodels.genmod.families import Gaussian
from statsmodels.genmod.cov_struct import Autoregressive, Exchangeable
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error

print("==================================================")
print(" Taiwan Stock MMR Replication: GEE & Machine Learning ")
print(" Model: An Explanatory Sequential Mixed-Methods Design")
print(" Using a Follow-up Explanations Model (QUAN -> qual)")
print("==================================================\n")

# 1. Generate or simulate Taiwan stock panel dataset aligned with FinMind structure
np.random.seed(42)
n_firms = 50
n_periods = 8

firm_ids = [f"TW_{2300 + i}" for i in range(n_firms)]
periods = list(range(1, n_periods + 1))

data_records = []
for fid in firm_ids:
    base_roe = np.random.normal(0.12, 0.03)
    base_tech = np.random.uniform(0.05, 0.40)
    for p in periods:
        ai_cap_ex = max(0, np.random.normal(base_tech, 0.05) + p * 0.01)
        blockchain_adopt = np.random.binomial(1, 0.4 + p * 0.03)
        env_dynamism = np.random.uniform(1.0, 3.5)
        # Financial resilience (ROA / Cash conversion cycle index)
        fin_resilience = base_roe + 0.35 * ai_cap_ex + 0.42 * blockchain_adopt - 0.15 * (ai_cap_ex * env_dynamism) + np.random.normal(0, 0.02)
        
        data_records.append({
            'firm_id': fid,
            'period': p,
            'ai_cap_ex': ai_cap_ex,
            'blockchain_adopt': blockchain_adopt,
            'env_dynamism': env_dynamism,
            'fin_resilience': fin_resilience,
            'sentiment_score': np.random.normal(0.2, 0.3)
        })

df = pd.DataFrame(data_records)
print(f"[QUAN Phase] Simulated panel dataset constructed: {df.shape[0]} observations across {n_firms} firms.\n")

# 2. Fit GEE Model (Generalized Estimating Equations) with Autoregressive Covariance
print("[QUAN Phase] Fitting GEE Panel Regression Model (statsmodels)...")
X = df[['ai_cap_ex', 'blockchain_adopt', 'env_dynamism']]
X['ai_x_ed'] = X['ai_cap_ex'] * X['env_dynamism'] # Interaction term (testing H4a anomaly)
X = sm.add_constant(X)
y = df['fin_resilience']
groups = df['firm_id']

cov_struct = Autoregressive()
model = GEE(y, X, groups=groups, cov_struct=cov_struct, family=Gaussian())
result = model.fit()
print(result.summary())

# 3. Identify anomalous / unexpected residuals for Purposeful Case Selection (QUAL follow-up phase)
df['predicted_resilience'] = result.fittedvalues
df['residual'] = df['fin_resilience'] - df['predicted_resilience']
df['abs_residual'] = df['residual'].abs()

# Select top 5 anomalous firms with highest residuals for qualitative MOPS / annual report thematic analysis
top_anomalous_firms = df.groupby('firm_id')['abs_residual'].mean().nlargest(5)
print("\n[QUAL Phase] Purposeful Case Selection (Top 5 Anomalous Residual Firms for MOPS / 法說會重訊 tracking):")
print(top_anomalous_firms)

# 4. Machine Learning classification for financial distress / resilience tier prediction
print("\n[ML Phase] Training Random Forest & Gradient Boosting Classifiers...")
df['high_resilience'] = (df['fin_resilience'] > df['fin_resilience'].median()).astype(int)
X_ml = df[['ai_cap_ex', 'blockchain_adopt', 'env_dynamism', 'sentiment_score']]
y_ml = df['high_resilience']

X_train, X_test, y_train, y_test = train_test_split(X_ml, y_ml, test_size=0.25, random_state=42)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
rf_preds = rf.predict(X_test)
print(f"Random Forest Accuracy: {accuracy_score(y_test, rf_preds):.4f}")

gb = GradientBoostingClassifier(n_estimators=100, random_state=42)
gb.fit(X_train, y_train)
gb_preds = gb.predict(X_test)
print(f"Gradient Boosting Accuracy: {accuracy_score(y_test, gb_preds):.4f}")

print("\n==================================================")
print(" Execution Completed Successfully! Meta-inference ready.")
print("==================================================")
