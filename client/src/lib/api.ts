export interface NewsItem {
    title: string;
    link: string;
    summary: string;
    published: string;
    source: string;
    image: string | null;
    category?: string;
    is_breaking?: boolean;
    is_trending?: boolean;
    ai_score?: number;
    ai_status?: 'verified' | 'manipulated' | 'uncertain';
}

export interface FeedResponse {
    status: string;
    source: string;
    count: number;
    sections?: Record<string, NewsItem[]>;
    data: NewsItem[];
}

const API_BASE_URL = 'http://localhost:8000';

export async function fetchLiveFeed(): Promise<FeedResponse | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/feed`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch live feed:", error);
        return null;
    }
}

export async function analyzeImage(imageUrl: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze-image?url=${encodeURIComponent(imageUrl)}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        return { status: "error", message: String(error) };
    }
}

// Text Forensic AI Types
export interface TextForensicResult {
    prediction: string;
    truth_score: number;
    ai_pattern_score: number;
    source_credibility: number;
    details: {
        url: { verdict: string; trust_score: number; metadata?: { protocol: string; domain: string; suffix: string; full_host: string; is_secure: boolean } };
        title: { verdict: string; trust_score: number; metrics: { linguistic: number; clickbait: number; sentiment: number; tone: number } };
        description: { verdict: string; trust_score: number; metrics: { alignment: number; density: number; sentiment: number; quality: number } };
        ai_engine: string;
    };
    status: string;
}

export async function verifyNews(title: string, url: string, description: string): Promise<TextForensicResult | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/verify-news?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}`
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return null;
    }
}
