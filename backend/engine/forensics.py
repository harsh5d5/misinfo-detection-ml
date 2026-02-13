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

        # 4. Predict
        probability = self.model.predict_proba(X)[0] # [Prob_Real, Prob_Fake]
        
        # CALIBRATION LAYER:
        # Web images are almost always "filtered" or compressed.
        # If the model is too strict, we adjust the probability curve.
        raw_trust = float(probability[0])
        
        # If the image has high FFT but low ELA variance, it's likely just "Sharpened" (Real)
        # rather than "Spliced" (Fake).
        is_sharpened_only = combined_features.get('ela_mean', 0) < 5.0 and combined_features.get('fft_mean', 0) > 100
        
        if is_sharpened_only:
            # Boost the trust score for sharpened but otherwise clean images
            calibrated_trust = min(0.95, raw_trust + 0.3)
        else:
            calibrated_trust = raw_trust

        # Determine final verdict based on calibrated score
        if calibrated_trust > 0.7:
            verdict = "REAL"
        elif calibrated_trust > 0.4:
            verdict = "PROCESSED / EDITED"
        else:
            verdict = "FAKE / MANIPULATED"

        return {
            "prediction": verdict,
            "trust_score": calibrated_trust,
            "metrics": combined_features,
            "raw_probability": [float(p) for p in probability],
            "status": "success"
        }
