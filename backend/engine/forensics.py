import os
import sys
import cv2
import pickle
import numpy as np
from PIL import Image
import io

# Add engine/src to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, 'src')
if src_dir not in sys.path:
    sys.path.append(src_dir)

try:
    from preprocessing import ImagePreprocessor
    from extractors import ForensicExtractors
    from forgery_detectors import ForgeryDetectors
except ImportError as e:
    print(f"Error importing forensic modules: {e}")
    # Fallback paths if needed
    preprocess_path = os.path.join(src_dir, 'preprocessing.py')
    print(f"Checking {preprocess_path}: {os.path.exists(preprocess_path)}")

class ForensicAnalyzer:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(current_dir, 'forensic_model.pkl')
            
        self.model_path = model_path
        self.preprocessor = ImagePreprocessor()
        self.extractors = ForensicExtractors()
        self.detectors = ForgeryDetectors()
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Forensic model not found at {model_path}")
            
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)

    def analyze_bytes(self, image_bytes):
        """Processes image bytes and returns forensic report."""
        # 1. Load image from bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Invalid image data")

        # 2. Preprocess (Since preprocessor.process expects a path, we'll bypass or modify)
        # Looking at preprocessing.py, it calls cv2.imread(image_path)
        # We can implement a process_image version for in-memory
        
        # Standardize Size
        raw_processed = self.preprocessor.resize_with_padding(img)
        # Extract Noise Map
        noise = self.preprocessor.extract_noise_map(raw_processed)
        # Color spaces
        spaces = self.preprocessor.get_color_spaces(raw_processed)
        
        processed_data = {
            "original_standardized": raw_processed,
            "noise_map": noise,
            "gray": spaces['gray'],
            "ycbcr": spaces['ycbcr']
        }
        
        # 3. Extract Features
        forensic_features = self.extractors.extract_all_features(processed_data)
        forgery_features = self.detectors.get_forgery_report(
            processed_data['original_standardized'], 
            processed_data['noise_map']
        )
        
        combined_features = {**forensic_features, **forgery_features}
        
        # Feature order must match training
        feature_order = [
            'ela_mean', 'ela_std', 'fft_mean', 'texture_variance', 
            'noise_mean', 'copy_move_score', 'noise_inconsistency'
        ]
        
        X = [combined_features.get(f, 0.0) for f in feature_order]
        X = np.array(X).reshape(1, -1)

        # 4. Digital Graphic Detection (Poster/Synthetic Check)
        # Real photos have millions of colors. Posters have few flat colors.
        unique_colors = len(np.unique(raw_processed.reshape(-1, 3), axis=0))
        # Edge density check
        gray = processed_data['gray']
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges) / (gray.shape[0] * gray.shape[1])
        
        # A low unique color count combined with 'sharp' perfect edges = Computer Graphic
        is_synthetic_graphic = unique_colors < 50000 and edge_density < 0.05
        
        # 5. Predict
        probability = self.model.predict_proba(X)[0] # [Prob_Real, Prob_Fake]
        prediction = int(self.model.predict(X)[0])    # 0 for Real, 1 for Fake
        
        trust_score = float(probability[0]) if prediction == 0 else float(probability[1])
        
        # Mapping model labels to 3-Tier Classification
        if is_synthetic_graphic:
            verdict = "SYNTHETIC / GRAPHIC"
            trust_score = min(trust_score, 0.30) # Cap trust for graphics below FAKE threshold
        elif trust_score < 0.35:
            verdict = "FAKE / MANIPULATED"
        elif trust_score <= 0.70:
            verdict = "PROCESSED / EDITED"
        else:
            verdict = "REAL / ORIGINAL"

        return {
            "prediction": verdict,
            "trust_score": trust_score,
            "metrics": combined_features,
            "raw_probability": [float(p) for p in probability],
            "status": "success"
        }
