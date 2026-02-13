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
        console.error("Deep analysis failed:", error);
        return { status: "error", message: String(error) };
    }
}
