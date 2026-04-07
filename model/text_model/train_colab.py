# ============================================================
# NeuralTrust AI - Fake News Detection Model
# Google Colab Training Script
# Dataset: labeled_training_data.csv (117,248 rows)
# Labels: 0 = REAL, 1 = FAKE
# ============================================================

# ─── CELL 1: Install Dependencies ───────────────────────────
# Run this cell first!
# !pip install xgboost scikit-learn pandas numpy matplotlib seaborn


# ─── CELL 2: Upload Dataset ─────────────────────────────────
# Run this cell to upload your labeled_training_data.csv from your PC
from google.colab import files
print("Please upload: labeled_training_data.csv")
uploaded = files.upload()


# ─── CELL 3: Load and Explore the Dataset ───────────────────
import pandas as pd
import numpy as np

print("Loading dataset...")
df = pd.read_csv('labeled_training_data.csv')

# Quick sanity check
print(f"\n Total Rows: {len(df):,}")
print(f" Columns: {df.columns.tolist()}")
print(f"\n Label Distribution:")
print(df['label_name'].value_counts())
print(f"\n Real News %: {(df['label'] == 0).sum() / len(df) * 100:.1f}%")
print(f" Fake News %: {(df['label'] == 1).sum() / len(df) * 100:.1f}%")
print("\n Sample rows:")
df[['title', 'label', 'label_name']].head(10)


# ─── CELL 4: Clean and Prepare Features ─────────────────────
print("Cleaning data...")

# Drop any rows with missing values
df = df.dropna(subset=['title', 'description'])

# Combine title + description for better AI accuracy
df['combined_text'] = df['title'].astype(str) + " " + df['description'].astype(str)

# Features and Labels
X_raw = df['combined_text']
y = df['label']  # 0 = REAL, 1 = FAKE

print(f" Clean rows ready: {len(df):,}")
print(f" Real: {(y == 0).sum():,} | Fake: {(y == 1).sum():,}")


# ─── CELL 5: Convert Text to Numbers (TF-IDF) ───────────────
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

print("Converting text to numbers (TF-IDF)...")

# TF-IDF Vectorizer — finds the most important 10,000 words
tfidf = TfidfVectorizer(
    max_features=10000,
    stop_words='english',
    ngram_range=(1, 2),  # Includes single words AND word pairs (e.g. "fake news")
    min_df=2             # Only use words that appear at least twice
)

X = tfidf.fit_transform(X_raw)
print(f" Feature matrix shape: {X.shape}")

# Split into Training (80%) and Testing (20%)
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y  # Ensures both splits have same Real/Fake ratio
)

print(f" Training Set: {X_train.shape[0]:,} rows")
print(f" Testing Set:  {X_test.shape[0]:,} rows")


# ─── CELL 6: Train the XGBoost AI Model ─────────────────────
from xgboost import XGBClassifier
import time

print("Training XGBoost AI Model...")
print("(This may take 2-5 minutes depending on Colab GPU)")

start_time = time.time()

model = XGBClassifier(
    n_estimators=200,        # 200 decision trees
    max_depth=6,             # Tree depth
    learning_rate=0.1,       # How fast it learns
    eval_metric='logloss',
    use_label_encoder=False,
    tree_method='hist',      # Fastest method in Colab
    random_state=42
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=50  # Print progress every 50 rounds
)

elapsed = time.time() - start_time
print(f"\n Training complete in {elapsed:.1f} seconds!")


# ─── CELL 7: Evaluate Model Accuracy ────────────────────────
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    confusion_matrix
)
import matplotlib.pyplot as plt
import seaborn as sns

y_pred = model.predict(X_test)

acc = accuracy_score(y_test, y_pred)
print(f"\n ACCURACY: {acc * 100:.2f}%")
print("\n Full Classification Report:")
print(classification_report(y_test, y_pred, target_names=['REAL', 'FAKE']))

# Plot Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6, 5))
sns.heatmap(
    cm, annot=True, fmt='d',
    xticklabels=['REAL', 'FAKE'],
    yticklabels=['REAL', 'FAKE'],
    cmap='Blues'
)
plt.title('NeuralTrust AI - Confusion Matrix')
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.tight_layout()
plt.savefig('confusion_matrix.png')
plt.show()
print(" Confusion matrix saved!")


# ─── CELL 8: Save the Trained Model Files ───────────────────
import pickle

print("Saving model files...")

# Save the XGBoost Model
with open('text_forensic_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print(" text_forensic_model.pkl saved!")

# Save the TF-IDF Vectorizer
with open('tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(tfidf, f)
print(" tfidf_vectorizer.pkl saved!")


# ─── CELL 9: Download Files to Your PC ──────────────────────
from google.colab import files

print("Downloading to your PC...")
files.download('text_forensic_model.pkl')
files.download('tfidf_vectorizer.pkl')
files.download('confusion_matrix.png')

print("""
============================================================
 TRAINING COMPLETE!
============================================================
 Next Steps:
  1. Move text_forensic_model.pkl to:
     model/text_model/text_forensic_model.pkl

  2. Move tfidf_vectorizer.pkl to:
     model/text_model/tfidf_vectorizer.pkl

  3. Restart your backend:
     python main.py

 Your AI is now trained on 117,248 real-world examples!
============================================================
""")
