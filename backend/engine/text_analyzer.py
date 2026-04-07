import tldextract
from urllib.parse import urlparse
import difflib
from textblob import TextBlob
import pickle
import os
import xgboost
import numpy as np

class TextForensics:
    def __init__(self):
        # Step 2: Initialize Credibility Lists
        self.TRUSTED_DOMAINS = {
            "reuters.com", "bbc.co.uk", "bbc.com", "apnews.com", 
            "nytimes.com", "theguardian.com", "aljazeera.com", 
            "bloomberg.com", "forbes.com", "wsj.com", "thehindu.com", 
            "indianexpress.com", "ndtv.com", "timesofindia.indiatimes.com",
            "dw.com", "france24.com", "cnn.com", "nbcnews.com"
        }
        
        self.UNTRUSTED_DOMAINS = {
            "theonion.com", "worldnewsdailyreport.com", "naturalnews.com", 
            "infowars.com", "beforeitsnews.com", "thegatewaypundit.com",
            "dailywire.com", "breitbart.com"
        }
        
        # Load the Real-World AI Model (Trained in Colab)
        self.model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'model', 'text_model', 'text_forensic_model.pkl')
        self.vectorizer_path = os.path.join(os.path.dirname(__file__), '..', '..', 'model', 'text_model', 'tfidf_vectorizer.pkl')
        
        self.ai_model = None
        self.vectorizer = None
        
        try:
            with open(self.model_path, 'rb') as f:
                self.ai_model = pickle.load(f)
            with open(self.vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            print("🏆 Hybrid AI Text Core Loaded (Real-World Patterns Active)")
        except Exception as e:
            print(f"⚠️ Warning: Real-World AI offline (using rules only): {e}")

        self.CLICKBAIT_SIGNALS = {
            "shocking", "unbelievable", "sensational", "won't believe", "wont believe",
            "miracle", "secret", "reveal", "exposed", "urgent", "warning", "gone wrong",
            "mystery", "discovery", "insane", "miraculous", "must-see", "must see"
        }
        
        print("Text Forensics Core Initialized with Clickbait Shield")

    def decompose_url(self, url: str):
        """
        Step 1: URL Decomposition
        Splits a URL into Protocol, Subdomain, Domain, and Suffix/TLD.
        """
        try:
            # 1. Parse Protocol using urllib
            parsed_url = urlparse(url)
            protocol = parsed_url.scheme # http or https
            
            # 2. Parse Domain parts using tldextract (more accurate for .co.uk, etc.)
            ext = tldextract.extract(url)
            
            decomposition = {
                "protocol": protocol,
                "subdomain": ext.subdomain,
                "domain": ext.domain,
                "suffix": ext.suffix, # This is the Top Level Domain (TLD)
                "full_host": f"{ext.domain}.{ext.suffix}",
                "is_secure": protocol == "https"
            }
            
            print(f"DEBUG: Decomposed URL: {decomposition['full_host']} (Secure: {decomposition['is_secure']})")
            return decomposition
            
        except Exception as e:
            print(f"ERROR: URL Decomposition failed for {url}: {e}")
            return None

    def check_domain_credibility(self, decomposition):
        """
        Step 2: Credibility Mapping
        Matches decomposed URL against high-trust and low-trust lists.
        """
        if not decomposition:
            return 0.5 # Default neutral score

        full_host = decomposition['full_host'].lower()
        
        # 1. Exact Match in Trusted List
        if full_host in self.TRUSTED_DOMAINS:
            return 1.0
            
        # 2. Check for subdomains of trusted domains (e.g., news.bbc.co.uk)
        for trusted in self.TRUSTED_DOMAINS:
            if full_host.endswith("." + trusted):
                return 1.0
        
        # 3. Exact Match in Untrusted/Satire List
        if full_host in self.UNTRUSTED_DOMAINS:
            return 0.0
            
        # 4. Check for Typosquatting (Step 4)
        if self.is_typosquatting(full_host):
            print(f"SECURITY ALERT: Typosquatting detected for {full_host}!")
            return 0.1 # Very low trust if spoofing
            
        # 5. If not found, use Heuristics (Step 3)
        return self.analyze_domain_heuristics(decomposition)

    def is_typosquatting(self, full_host):
        """
        Step 4: Lookalike / Typosquatting Analysis
        Checks if full_host is "dangerously similar" to any trusted domain.
        """
        for trusted in self.TRUSTED_DOMAINS:
            # Calculate similarity ratio (0.0 to 1.0)
            similarity = difflib.SequenceMatcher(None, full_host, trusted).ratio()
            
            # If 85% to 99% similar (Not exact match, already handled in Step 2)
            if 0.85 <= similarity < 1.0:
                return True
        return False

    def analyze_domain_heuristics(self, decomp):
        """
        Step 3: Domain Structure Heuristics
        Analyzes unknown domains for suspicious patterns.
        """
        score = 0.5 # Start neutral
        
        # 1. TLD Trust Check
        high_trust_tlds = {"gov", "edu", "mil", "ac", "gov.in", "gov.uk"}
        suspicious_tlds = {"xyz", "top", "pw", "tk", "date", "online", "click", "club", "live"}
        
        suffix = decomp['suffix'].lower()
        if any(tld in suffix for tld in high_trust_tlds):
            score += 0.3
        elif any(tld in suffix for tld in suspicious_tlds):
            score -= 0.2
            
        # 2. Security (HTTPS) Check
        if decomp['is_secure']:
            score += 0.1
        else:
            score -= 0.2 # HTTP is very suspicious for news
            
        # 3. Complexity Check (Dashes and Digits)
        domain = decomp['domain'].lower()
        # Count dashes and digits
        complexity = domain.count('-') + sum(c.isdigit() for c in domain)
        
        if complexity > 2:
            score -= 0.1
        if complexity > 4:
            score -= 0.2
            
        # 4. Subdomain check (Deep subdomains like bbc.news.site.com)
        if decomp['subdomain'].count('.') > 1:
            score -= 0.1
            
        # Clamp score between 0.1 and 0.9 (Leave 0.0 and 1.0 for manual lists)
        return round(max(0.1, min(0.9, score)), 2)

    def analyze_url(self, url: str):
        """
        Step 5: Final Trust Score Calculation
        Runs all steps and returns the ultimate forensic report for the URL.
        """
        # 1. Step 1: Decomposition
        decomp = self.decompose_url(url)
        if not decomp:
            return {"verdict": "ERROR", "score": 0.0, "details": "Invalid URL"}
            
        # 2. Steps 2, 3, & 4: Credibility + Heuristics + Typosquatting
        trust_score = self.check_domain_credibility(decomp)
        
        # 3. Final Verdict Mapping (Aligning with your ForensicAnalyzer 3-tier style)
        if trust_score >= 0.8:
            verdict = "REAL / ORIGINAL"
        elif trust_score >= 0.4:
            verdict = "PROCESSED / EDITED"
        else:
            verdict = "FAKE / MANIPULATED"
            
        return {
            "verdict": verdict,
            "trust_score": trust_score,
            "metadata": decomp,
            "status": "success"
        }

    def analyze_with_ai(self, title: str, description: str):
        """
        New Method: Direct AI Prediction using XGBoost
        """
        if not self.ai_model or not self.vectorizer:
            return 0.5 # Return neutral if model not loaded
            
        try:
            combined_text = f"{title} {description}"
            # Transform text using the same TF-IDF vectorizer from Colab
            vector = self.vectorizer.transform([combined_text])
            
            # Predict (0 = REAL, 1 = FAKE in most datasets)
            prediction = self.ai_model.predict(vector)[0]
            probability = self.ai_model.predict_proba(vector)[0]
            
            # Convert to trust score (1.0 = Real, 0.0 = Fake)
            # Probability[0] is trust in 'Class 0' (Real)
            # Probability[1] is trust in 'Class 1' (Fake)
            trust_score = float(probability[0])
            return round(trust_score, 2)
        except Exception as e:
            print(f"AI Prediction Error: {e}")
            return 0.5

    def get_truth_score(self, url: str, title: str, description: str):
        """
        Unified Truth Model (Enhanced with AI)
        Combines URL, Title, Description, and AI patterns.
        """
        # 1. Run Analysis Engines
        url_report = self.analyze_url(url)
        title_report = self.analyze_title(title)
        desc_report = self.analyze_description(title, description)
        
        # 2. Run the Real-World AI Prediction
        ai_pattern_score = self.analyze_with_ai(title, description)
        
        # 3. Weighted Aggregation (Hybrid)
        # Hierarchy: 40% URL (Source), 30% AI Pattern, 15% Title rules, 15% Desc rules.
        url_score = url_report.get('trust_score', 0.5)
        title_score = title_report.get('trust_score', 0.5)
        desc_score = desc_report.get('trust_score', 0.5)
        
        final_truth_score = (url_score * 0.40) + (ai_pattern_score * 0.30) + (title_score * 0.15) + (desc_score * 0.15)
        final_truth_score = round(final_truth_score, 2)
        
        # 4. Final Truth Mapping
        if final_truth_score >= 0.8:
            verdict = "REAL / ORIGINAL"
        elif final_truth_score >= 0.45:
            verdict = "PROCESSED / EDITED"
        else:
            verdict = "FAKE / MANIPULATED"
            
        return {
            "prediction": verdict,
            "truth_score": final_truth_score,
            "ai_pattern_score": ai_pattern_score,
            "source_credibility": url_score,
            "details": {
                "url": url_report,
                "title": title_report,
                "description": desc_report,
                "ai_engine": "XGBoost + TF-IDF"
            },
            "status": "success"
        }

    def analyze_title_linguistics(self, title: str):
        """
        Step 1: Linguistic Flagging
        Checks Title for "Shouting" (ALL CAPS) and Sensational Punctuation.
        """
        if not title:
            return 0.5
            
        score = 1.0 # Start perfect
        
        # 1. ALL CAPS Detection (Shouting)
        words = title.split()
        if len(words) > 0:
            caps_count = sum(1 for w in words if w.isupper() and len(w) > 1)
            caps_ratio = caps_count / len(words)
            
            if caps_ratio > 0.3: # More than 30% shouting
                score -= 0.2
            if caps_ratio > 0.6: # Most of it is shouting
                score -= 0.3
                
        # 2. Sensational Punctuation (!!!, ???)
        if "!!!" in title or "???" in title:
            score -= 0.2
        elif "!" in title or "?" in title:
            score -= 0.05
            
        # 3. Length Check
        if len(title) < 15 or len(title) > 200:
            score -= 0.1
            
        return round(max(0.1, score), 2)

    def analyze_title_clickbait(self, title: str):
        """
        Step 2: Clickbait Keyword Filtering
        Scans title for sensationalist trigger words.
        """
        if not title:
            return 1.0
            
        score = 1.0
        title_lower = title.lower()
        
        # Count matches
        match_count = 0
        for signal in self.CLICKBAIT_SIGNALS:
            if signal in title_lower:
                match_count += 1
                
        if match_count > 0:
            score -= 0.2
        if match_count > 2:
            score -= 0.3
            
        return round(max(0.1, score), 2)

    def analyze_title_sentiment(self, title: str):
        """
        Step 3: Sentiment Extremity (Emotion/Opinion Check)
        Neutral titles are more likely to be original facts.
        """
        if not title:
            return 1.0
            
        score = 1.0
        blob = TextBlob(title)
        polarity = blob.sentiment.polarity       # Range: -1.0 to 1.0 (Most extreme emotions)
        subjectivity = blob.sentiment.subjectivity # Range: 0.0 to 1.0 (Most opinionated)
        
        # 1. Subjectivity (Does it sound like an opinion?)
        if subjectivity > 0.5: # More than 50% opinion
            score -= 0.2
        if subjectivity > 0.8: # Purely opinionated
            score -= 0.3
            
        # 2. Polarity (Is it extremely angry/happy?)
        # Original news is usually neutral (near 0)
        if abs(polarity) > 0.6:
            score -= 0.2
        if abs(polarity) > 0.8:
            score -= 0.3
            
        return round(max(0.1, score), 2)

    def analyze_title_tone(self, title: str):
        """
        Step 4: AI Tone Consistency (Grammatical Forensics)
        Checks for Personal Pronouns, Modal Verbs, and Superlatives.
        """
        if not title:
            return 1.0
            
        score = 1.0
        blob = TextBlob(title)
        
        # 1. Personal Pronouns (I, You, Me, My) - Very rare in professional news
        # POS Tag 'PRP' = Personal Pronoun
        personal_pronouns = [word for word, tag in blob.tags if tag == 'PRP' or tag == 'PRP$']
        if personal_pronouns:
            score -= 0.2
            
        # 2. Superlatives (Best, Greatest, Worst) - Indicates bias
        # POS Tag 'JJS' = Superlative Adjective, 'RBS' = Superlative Adverb
        superlatives = [word for word, tag in blob.tags if tag in ['JJS', 'RBS']]
        if superlatives:
            score -= 0.1
            
        # 3. Speculative Modal Verbs (Could, Might, May)
        speculative_words = {"could", "might", "may", "maybe", "possibly"}
        words_lower = set(title.lower().split())
        if speculative_words.intersection(words_lower):
            score -= 0.1
            
        return round(max(0.1, score), 2)

    def analyze_title(self, title: str):
        """
        Step 5: Final Title Trust Score Calculation
        Combines Linguistics, Clickbait, Sentiment, and Tone.
        """
        if not title:
            return {"verdict": "ERROR", "score": 0.0, "details": "No title provided"}

        # 1. Run all analysis modules
        ling_score = self.analyze_title_linguistics(title)
        click_score = self.analyze_title_clickbait(title)
        sent_score = self.analyze_title_sentiment(title)
        tone_score = self.analyze_title_tone(title)
        
        # 2. Weighted Average
        # Hierarchy: Clickbait & Linguistics are strongest signals, Sentiment & Tone are supporting.
        final_score = (ling_score * 0.35) + (click_score * 0.35) + (sent_score * 0.15) + (tone_score * 0.15)
        final_score = round(final_score, 2)
        
        # 3. Decision Logic
        if final_score >= 0.8:
            verdict = "REAL / ORIGINAL"
        elif final_score >= 0.45:
            verdict = "PROCESSED / EDITED"
        else:
            verdict = "FAKE / MANIPULATED"
            
        return {
            "verdict": verdict,
            "trust_score": final_score,
            "metrics": {
                "linguistic": ling_score,
                "clickbait": click_score,
                "sentiment": sent_score,
                "tone": tone_score
            }
        }

    def analyze_description_alignment(self, title: str, description: str):
        """
        Step 1: Title-Description Alignment
        Checks if the description keywords match the title keywords.
        """
        if not title or not description:
            return 0.5
            
        # 1. Extract Keywords (Filtering common 'stop' words)
        stop_words = {"a", "the", "is", "in", "at", "of", "and", "for", "with", "to", "on", "it", "by"}
        
        title_set = {w.lower().strip(",.:?!") for w in title.split() if w.lower() not in stop_words}
        desc_set = {w.lower().strip(",.:?!") for w in description.split() if w.lower() not in stop_words}
        
        if not title_set:
            return 1.0
            
        # 2. Check for intersection (Shared keywords)
        shared = title_set.intersection(desc_set)
        alignment_ratio = len(shared) / len(title_set)
        
        # 3. Decision
        score = 0.5 + (0.5 * alignment_ratio) # Normalize to 0.5 - 1.0 range
        
        # If no shared words at all, it's a huge red flag
        if len(shared) == 0:
            score = 0.1
            
        return round(score, 2)

    def analyze_description_density(self, description: str):
        """
        Step 2: Information Density (Fact/Noun Count)
        Measures the concentration of nouns and proper nouns.
        """
        if not description:
            return 1.0
            
        blob = TextBlob(description)
        words = blob.words
        if len(words) == 0:
            return 1.0
            
        # Count Nouns (NN) and Proper Nouns (NNP)
        # NNP: Names, Places, Organizations
        # NN: Objects, Concepts
        fact_tags = {'NN', 'NNP', 'NNPS', 'NNS'}
        fact_count = sum(1 for word, tag in blob.tags if tag in fact_tags)
        
        density_ratio = fact_count / len(words)
        
        # Mapping Score
        # Typically, a real news article has 20% - 40% nouns.
        if density_ratio > 0.20:
            return 1.0
        elif density_ratio > 0.10:
            return 0.7
        else:
            return 0.3 # Very low density (likely fluff or generic text)

    def analyze_description_sentiment(self, description: str):
        """
        Step 3: Description Sentiment (Subjectivity Check)
        Checks if the description body is objective or purely opinionated.
        """
        if not description:
            return 1.0
            
        blob = TextBlob(description)
        sentiment = blob.sentiment
        
        score = 1.0
        
        # 1. Subjectivity (Opinion Check)
        # > 0.5 means it is more of an opinion than a fact.
        if sentiment.subjectivity > 0.4:
            score -= 0.2
        if sentiment.subjectivity > 0.7:
            score -= 0.3
            
        # 2. Polarity (Extreme Emotion Check)
        if abs(sentiment.polarity) > 0.5:
            score -= 0.2
            
        return round(max(0.1, score), 2)

    def analyze_description_quality(self, description: str):
        """
        Step 4: Linguistic Quality (Repetition & Robotic Detection)
        Checks if the text is repetitive or lacks structure.
        """
        if not description:
            return 1.0
            
        words = description.lower().split()
        if len(words) < 10:
            return 0.7 # Too short to be a quality description
            
        # 1. Unique Word Ratio (Detects spammy repetition)
        unique_words = set(words)
        repetition_ratio = len(unique_words) / len(words)
        
        score = 1.0
        
        if repetition_ratio < 0.6: # High repetition
            score -= 0.2
        if repetition_ratio < 0.4: # Extreme repetition (spam)
            score -= 0.4
            
        # 2. Average Sentence Length
        sentences = description.split('.')
        clean_sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
        
        if len(clean_sentences) > 0:
            avg_len = len(words) / len(clean_sentences)
            if avg_len < 5: # Very choppy/robotic
                score -= 0.1
                
        return round(max(0.1, score), 2)

    def analyze_description(self, title: str, description: str):
        """
        Step 5: Final Description Trust Score Calculation
        Combines Alignment, Density, Sentiment, and Quality.
        """
        if not description:
            return {"verdict": "ERROR", "score": 0.0, "details": "No description provided"}

        # 1. Run all analysis modules
        align_score = self.analyze_description_alignment(title, description)
        dens_score = self.analyze_description_density(description)
        sent_score = self.analyze_description_sentiment(description)
        qual_score = self.analyze_description_quality(description)
        
        # 2. Weighted Average
        # Alignment & Density are our strongest "Fake News" signals for descriptions.
        final_score = (align_score * 0.40) + (dens_score * 0.30) + (sent_score * 0.15) + (qual_score * 0.15)
        final_score = round(final_score, 2)
        
        # 3. Decision Logic
        if final_score >= 0.8:
            verdict = "REAL / ORIGINAL"
        elif final_score >= 0.55:
            verdict = "PROCESSED / EDITED"
        else:
            verdict = "FAKE / MANIPULATED"
            
        return {
            "verdict": verdict,
            "trust_score": final_score,
            "metrics": {
                "alignment": align_score,
                "density": dens_score,
                "sentiment": sent_score,
                "quality": qual_score
            }
        }

if __name__ == "__main__":
    # Test Step 1
    tf = TextForensics()
    test_urls = [
        "https://www.bbc.co.uk/news/world",
        "https://bbcc.co.uk/fake-link", # Typosquatting
        "https://nytiimes.com/article", # Typosquatting
        "https://report.gov.in/latest",
        "http://free-news-fast.club/fake"
    ]
    
    # Test Title Analysis (Step 1)
    print("\n" + "="*30)
    print("Testing Title Analysis (Step 1)")
    print("="*30)
    
    test_titles = [
        "Breaking: US Scientists Discover New Potential Renewable Energy Source",
        "YOU WON'T BELIEVE WHAT JUST HAPPENED!!! SHOCKING NEWS",
        "The current weather in New York is partly cloudy.",
        "URGENT: EVERYTHING YOU KNOW IS A LIE ???"
    ]
    
    # Test Unified Truth Model (The Final Result)
    print("\n" + "="*35)
    print("TESTING UNIFIED TRUTH MODEL (Step 5)")
    print("="*35)
    
    sample_news = {
        "u": "https://www.reuters.com/business/finance/us-treasury-yields",
        "t": "US Treasury Yields Hit New 10-Year High",
        "d": "Investors are reacting to new economic data as Treasury yields rose again today."
    }
    
    final_report = tf.get_truth_score(sample_news['u'], sample_news['t'], sample_news['d'])
    print(f"URL: {sample_news['u']}")
    print(f"TITLE: {sample_news['t']}")
    print(f"FINAL VERDICT: {final_report['prediction']}")
    print(f"TOTAL TRUTH SCORE: {final_report['truth_score']}")
    print(f"BREAKDOWN: Source: {final_report['source_credibility']} | AI Pattern: {final_report['ai_pattern_score']}")
    print(f"DETAILS: {final_report['details']['ai_engine']}")
