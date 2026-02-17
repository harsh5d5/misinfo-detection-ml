from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper import get_sampled_news, get_all_news
import uvicorn
import time
import httpx
from engine.forensics import ForensicAnalyzer

app = FastAPI(title="Intelligence Feed API")

# Initialize Forensic Analyzer
analyzer = None
try:
    analyzer = ForensicAnalyzer()
    print("Forensic AI Core Loaded Successfully")
except Exception as e:
    print(f"CRITICAL: Forensic AI Core failed to load: {e}")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Cache for stability
NEWS_CACHE = {
    "data": None,
    "last_updated": 0
}
CACHE_TTL = 300 # 5 minutes

@app.get("/api/feed")
async def get_feed():
    global NEWS_CACHE
    current_time = time.time()
    
    # Return cached data if it's still fresh
    if NEWS_CACHE["data"] and (current_time - NEWS_CACHE["last_updated"]) < CACHE_TTL:
        print("DEBUG: Serving feed from cache")
        return NEWS_CACHE["data"]

    try:
        print("DEBUG: Cache expired or empty. Triggering fresh scrape...")
        # Get a fresh sample of news
        news_items = await get_sampled_news(50) 
        
        # Add deterministic AI verification data (stable across refreshes)
        import hashlib
        for item in news_items:
            # Create a unique but stable seed based on the title
            seed = int(hashlib.md5(item['title'].encode()).hexdigest(), 16) % 1000
            # 3-Tier Simulation: 5% Manipulated, 15% Edited, 80% Verified
            if (seed % 20) == 0: # 5% chance
                item['ai_score'] = round(0.1 + (seed % 20) / 100, 2) # Range 0.1 - 0.3
                item['ai_status'] = "manipulated"
            elif (seed % 5) == 0: # 20% chance (total including 5% above, so ~15% net)
                item['ai_score'] = round(0.40 + (seed % 25) / 100, 2) # Range 0.4 - 0.65
                item['ai_status'] = "uncertain"
            else: # 80% chance
                item['ai_score'] = round(0.85 + (seed % 10) / 100, 2) # Range 0.85 - 0.95
                item['ai_status'] = "verified"

        # Categorize
        categorized = {
            "trending": [item for item in news_items if item.get('is_trending')][:20],
            "breaking": [item for item in news_items if item.get('is_breaking')][:20],
            "top": [item for item in news_items if item.get('is_top')][:20],
            "finance": [item for item in news_items if item.get('category') == 'finance'][:20],
            "sports": [item for item in news_items if item.get('category') == 'sports'][:20],
            "tech": [item for item in news_items if item.get('category') == 'tech'][:20],
            "science": [item for item in news_items if item.get('category') == 'science'][:20],
            "general": [item for item in news_items if item.get('category') == 'general'][:20],
        }
        
        NEWS_CACHE["data"] = {
            "status": "success",
            "source": "live-sampled",
            "last_sync": time.strftime('%H:%M:%S'),
            "count": len(news_items),
            "sections": categorized,
            "data": news_items[:20]
        }
        NEWS_CACHE["last_updated"] = current_time
        
        return NEWS_CACHE["data"]
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/analyze-image")
async def analyze_image(url: str):
    print(f"DEBUG: Analyzing image URL: {url}")
    if not analyzer:
        print("DEBUG: Analyzer not initialized")
        return {"status": "error", "message": "Neural Core Offline"}
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {'User-Agent': 'Mozilla/5.0'}
            resp = await client.get(url, headers=headers, timeout=10)
            if resp.status_code != 200:
                print(f"DEBUG: Image fetch failed with status {resp.status_code}")
                return {"status": "error", "message": f"Source fetch failed: {resp.status_code}"}
            
            print(f"DEBUG: Image fetched ({len(resp.content)} bytes). Starting forensic pipeline...")
            result = analyzer.analyze_bytes(resp.content)
            print(f"DEBUG: Analysis complete. Result: {result['prediction']} (Score: {result['trust_score']})")
            return result
    except Exception as e:
        import traceback
        print(f"DEBUG: Analysis error: {str(e)}")
        print(traceback.format_exc())
        return {"status": "error", "message": f"Analysis crashed: {str(e)}"}

@app.get("/api/status")
async def get_status():
    return {
        "status": "online",
        "timestamp": time.time()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
