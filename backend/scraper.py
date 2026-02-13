import asyncio
import feedparser
import httpx
from bs4 import BeautifulSoup
import os
from datetime import datetime
import time

import re

# Path to the feeds file
FEEDS_FILE = os.path.join(os.path.dirname(__file__), '..', 'scrap', 'xml_feeds.txt')

def upscale_image_url(url):
    """
    Transforms common news thumbnail URLs into high-resolution versions 
    to provide better pixel data for the Forensic AI.
    """
    if not url:
        return url
        
    # 1. Daily Mail: Replace -m- (medium) or -a- (article) with -v- (very large)
    if "dailymail.co.uk" in url:
        url = re.sub(r'-(image|article)-[ma]-', r'-\1-v-', url)
        
    # 2. Guardian: Force width and higher quality
    elif "guim.co.uk" in url:
        url = re.sub(r'width=\d+', 'width=1200', url)
        url = re.sub(r'quality=\d+', 'quality=100', url)
        
    # 3. NY Times: Squashed thumbnails to superJumbo
    elif "nyt.com" in url:
        url = url.replace("mediumSquareAt3X", "superJumbo")
        url = url.replace("thumbStandard", "superJumbo")
        
    # 4. Mirror / Reach PLC (Alternates)
    elif "i2-prod" in url:
        url = re.sub(r'/ALTERNATES/s\d+/', '/ALTERNATES/s1200/', url)
        
    # 5. WordPress / Generic Cloudfront (Dimension strip)
    # Replaces things like image-150x150.jpg with image.jpg
    url = re.sub(r'-\d+x\d+(\.(jpg|jpeg|png|webp))', r'\1', url)
    
    # 6. Yahoo / Yahoo Finance
    if "s.yimg.com" in url:
        url = re.sub(r'--/.*--/', '--/resizer/2.0/--/', url) # Reset resizer if present
        
    # 7. BBC News
    if "bbci.co.uk" in url:
        url = re.sub(r'/standard/\d+/', '/standard/1200/', url)
        
    return url

async def fetch_feed(client, url):
    """Asynchronously fetch a single RSS feed."""
    try:
        response = await client.get(url, timeout=8.0)
        if response.status_code == 200:
            return response.text
        else:
            print(f"Fetch failed for {url}: Status {response.status_code}")
    except Exception as e:
        print(f"Error fetching {url}: {type(e).__name__} - {str(e)}")
    return None

def extract_image(entry):
    """
    Extract the best possible image from an RSS entry with enhanced robustness.
    """
    # 1. Direct 'image' or 'links' check
    if 'image' in entry and isinstance(entry.image, dict):
        return entry.image.get('href') or entry.image.get('url')

    # 2. Check enclosures
    if 'enclosures' in entry:
        for enclosure in entry.enclosures:
            if enclosure.get('type', '').startswith('image/'):
                return enclosure.get('href')

    # 3. Check media content/thumbnails (common in media RSS)
    if 'media_content' in entry:
        for content in entry.media_content:
            if 'url' in content and (content.get('medium') == 'image' or content.get('type', '').startswith('image/')):
                return content['url']
            elif 'url' in content: # Default to any URL if no medium specified
                return content['url']
    
    if 'media_thumbnail' in entry:
        for thumb in entry.media_thumbnail:
            if 'url' in thumb:
                return thumb['url']

    # 4. Parse description or summary HTML for <img> tags
    for field in ['description', 'summary', 'content']:
        content_val = ""
        if field == 'content' and 'content' in entry:
            content_val = "".join([c.value for c in entry.content])
        elif field in entry:
            content_val = entry[field]
            
        if content_val:
            soup = BeautifulSoup(content_val, 'lxml')
            img = soup.find('img')
            if img and img.get('src'):
                src = img.get('src')
                # Ignore small tracking pixels or icons
                if not any(x in src.lower() for x in ['pixel', 'tracker', 'icon', 'logo.png']):
                    return src

    return None

# Category Mappings
CATEGORY_MAP = {
    "finance": ["business", "finance", "marketwatch", "bloomberg", "forbes", "fortune", "economist", "inc.com", "fastcompany", "qz.com", "entrepreneur"],
    "sports": ["espn", "sport", "skysports", "foxsports", "bleacherreport", "talksport"],
    "tech": ["tech", "verge", "wired", "arstechnica", "engadget", "gizmodo", "cnet", "zdnet", "venturebeat", "thenextweb", "9to5mac", "hacker-news", "slashdot"],
    "science": ["science", "nature.com", "nasa", "space.com", "technologyreview"],
}

def get_category(url, title, summary):
    """Determine category based on URL and content."""
    url_lower = url.lower()
    text_lower = (title + " " + summary).lower()
    
    for category, keywords in CATEGORY_MAP.items():
        if any(kw in url_lower for kw in keywords):
            return category
    
    # Default is 'general'
    return "general"

async def verify_image_url(client, upscaled_url, original_url):
    """
    Tries to see if the upscaled URL exists. Falls back to original if it fails.
    """
    if upscaled_url == original_url:
        return original_url
        
    try:
        # Perform a quick HEAD request to check for 404/Exists
        # We use a short timeout as this is a fallback check
        resp = await client.head(upscaled_url, timeout=3.0, follow_redirects=True)
        if resp.status_code == 200:
            return upscaled_url
    except Exception:
        pass
        
    return original_url

async def parse_feed(url, html_content, client=None):
    """Parse the RSS feed content and extract news items."""
    if not html_content:
        return []
    
    feed = feedparser.parse(html_content)
    news_items = []
    
    # Get the site name from the feed title if possible
    site_name = feed.feed.get('title', url.split('/')[2])

    for entry in feed.entries[:15]: # Slightly higher limit since we will filter
        title = entry.get('title', 'No Title')
        
        # Simple language filter: Check for Bengali characters (\u0980-\u09FF)
        is_bengali = any('\u0980' <= char <= '\u09FF' for char in title)
        if is_bengali:
            continue

        orig_image = extract_image(entry)
        
        # UPSCALE IMAGE: Convert thumbnails to High-Res for better DNA forensics
        upscaled = upscale_image_url(orig_image)
        
        # STEP 4: Smart Verification & Fallback
        if client and upscaled != orig_image:
            image_url = await verify_image_url(client, upscaled, orig_image)
        else:
            image_url = upscaled
        
        # MANDATORY IMAGE FILTER: Discard any post that doesn't have a valid image
        if not image_url or not (image_url.startswith('http')):
            continue

        # Clean up summary
        summary = ""
        if 'description' in entry:
            summary = BeautifulSoup(entry.description, 'lxml').text.strip()
        elif 'summary' in entry:
            summary = BeautifulSoup(entry.summary, 'lxml').text.strip()
            
        # Also check summary for Bengali characters
        if any('\u0980' <= char <= '\u09FF' for char in summary):
            continue

        # Format date and store as timestamp for sorting
        published = entry.get('published', '')
        if not published and 'updated' in entry:
            published = entry.updated
        
        # Parse timestamp for internal sorting
        published_parsed = entry.get('published_parsed') or entry.get('updated_parsed')
        timestamp = 0
        if published_parsed:
            try:
                import calendar
                timestamp = calendar.timegm(published_parsed)
            except (OverflowError, ValueError):
                timestamp = 0

        # Determine if it's "Breaking" (within last 2 hours)
        is_breaking = (time.time() - timestamp) < 7200 if timestamp > 0 else False

        news_items.append({
            "title": title,
            "link": entry.get('link', ''),
            "summary": summary[:200] + "..." if len(summary) > 200 else summary,
            "published": published,
            "timestamp": timestamp,
            "source": site_name,
            "image": image_url,
            "category": get_category(url, title, summary),
            "is_breaking": is_breaking
        })
    
    return news_items

async def get_all_news():
    """Returns all news from all sources (slow)."""
    with open(FEEDS_FILE, 'r') as f:
        urls = [line.strip() for line in f if line.strip().startswith('http')]
    return await scrape_subset(urls)

async def get_sampled_news(count=35):
    """Returns news from a random subset of sources (fast)."""
    if not os.path.exists(FEEDS_FILE):
        return []
    with open(FEEDS_FILE, 'r') as f:
        all_urls = [line.strip() for line in f if line.strip().startswith('http')]
    
    import random
    urls = random.sample(all_urls, min(count, len(all_urls)))
    return await scrape_subset(urls)

async def scrape_subset(urls):
    """Internal helper to scrape a specific list of URLs."""
    semaphore = asyncio.Semaphore(20)

    async def sem_fetch(client, url):
        async with semaphore:
            return await fetch_feed(client, url)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
    }

    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False, timeout=10.0) as client:
        # Create tasks for all URLs
        fetch_tasks = [sem_fetch(client, url) for url in urls]
        responses = await asyncio.gather(*fetch_tasks)
        
        # Parse all successfully fetched feeds
        parse_tasks = [parse_feed(url, content, client) for url, content in zip(urls, responses)]
        results = await asyncio.gather(*parse_tasks)
        
        # Flatten the list of lists
        all_news = [item for sublist in results for item in sublist]
        
        # De-duplication and Trending Detection
        unique_news = []
        seen_titles = {} 
        
        for item in all_news:
            title_norm = item['title'].lower().strip()
            if title_norm not in seen_titles:
                item['trending_score'] = 1
                seen_titles[title_norm] = len(unique_news)
                unique_news.append(item)
            else:
                idx = seen_titles[title_norm]
                unique_news[idx]['trending_score'] += 1
        
        # Sort by timestamp (Newest First)
        unique_news.sort(key=lambda x: x['timestamp'], reverse=True)
        
        for i, item in enumerate(unique_news):
            item['is_trending'] = item['trending_score'] > 1
            item['is_top'] = i < 20
        
        return unique_news

if __name__ == "__main__":
    # Test run
    start_time = time.time()
    news = asyncio.run(get_sampled_news(10)) # Small test
    end_time = time.time()
    print(f"Scraped {len(news)} items in {end_time - start_time:.2f} seconds.")
    if news:
        print(f"Sample Item: {news[0]}")
