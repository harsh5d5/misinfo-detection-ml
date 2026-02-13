from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper import get_sampled_news, get_all_news
import uvicorn
import time

app = FastAPI(title="Intelligence Feed API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/feed")
async def get_feed():
    try:
        # Get a fresh sample of news on every refresh
        news_items = await get_sampled_news(35)
        
        # Add dummy AI verification data
        import random
        for item in news_items:
            is_fake = random.random() < 0.05
            item['ai_score'] = round(random.uniform(0.1, 0.3) if is_fake else random.uniform(0.8, 0.99), 2)
            item['ai_status'] = "manipulated" if is_fake else "verified"

        # Categorize and limit to 20 items per section
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
        
        return {
            "status": "success",
            "source": "live-sampled",
            "count": len(news_items),
            "sections": categorized,
            "data": news_items[:20]
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/status")
async def get_status():
    return {
        "status": "online",
        "cache_age": int(time.time() - cache["last_updated"]) if cache["last_updated"] > 0 else None
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
