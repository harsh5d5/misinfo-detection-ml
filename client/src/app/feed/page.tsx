'use client';

import React, { useEffect, useState } from 'react';
import PillNav from "@/components/PillNav";
import { ChevronRight, LayoutGrid, AlertCircle, CheckCircle2, Clock, RefreshCw, Image as ImageIcon, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLiveFeed, NewsItem } from '@/lib/api';

// Component for a Single News Card
const NewsCard = ({ news }: { news: NewsItem }) => {
    const trustColor = news.ai_status === 'verified' ? '#10b981' : news.ai_status === 'manipulated' ? '#ef4444' : '#f59e0b';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass"
            style={{
                borderRadius: '16px',
                padding: '0',
                background: 'rgba(25, 30, 40, 0.4)',
                border: `1px solid ${news.ai_status === 'manipulated' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                position: 'relative',
            }}
        >
            {/* Top: Thumbnail & AI Badges */}
            <div style={{
                width: '100%',
                height: '160px',
                background: '#0a0a0a',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {news.image ? (
                    <img src={news.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="News" />
                ) : (
                    <div style={{ color: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <ImageIcon size={32} />
                    </div>
                )}

                {/* Status Badges */}
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', zIndex: 20 }}>
                    {news.ai_status && (
                        <div style={{
                            background: trustColor,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: 900,
                            color: 'white',
                            boxShadow: `0 0 10px ${trustColor}88`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}>
                            {news.ai_status === 'verified' ? 'NEURAL VERIFIED' : news.ai_status === 'uncertain' ? 'PROCESSED / EDITED' : 'AI MANIPULATED'}
                        </div>
                    )}
                    {news.is_breaking && (
                        <div style={{ background: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '9px', fontWeight: 900, color: 'white' }}>LIVE</div>
                    )}
                </div>

                {/* AI Score Bubble */}
                {news.ai_score !== undefined && (
                    <div style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        border: `1px solid ${trustColor}55`,
                        color: trustColor,
                        fontSize: '10px',
                        fontWeight: 800,
                        fontFamily: 'monospace'
                    }}>
                        TRUTH: {Math.round(news.ai_score * 100)}%
                    </div>
                )}
            </div>

            {/* Bottom: Content Area */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{news.source}</span>
                    </div>
                    {news.category && (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                            {news.category}
                        </span>
                    )}
                </div>

                <a href={news.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        lineHeight: 1.3,
                        marginBottom: '0.5rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.6em'
                    }} className="hover:text-blue-400">
                        {news.title}
                    </h3>
                </a>

                {/* AI Truth Meter */}
                {news.ai_score !== undefined && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
                            <span>NEURAL AUTHENTICITY</span>
                            <span>{Math.round(news.ai_score * 100)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${news.ai_score * 100}%` }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                style={{ height: '100%', background: trustColor }}
                            />
                        </div>
                    </div>
                )}

                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '1rem'
                }}>
                    {news.summary}
                </p>

                <div style={{
                    marginTop: 'auto',
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '1rem'
                }}>
                    <Clock size={8} />
                    {news.published}
                </div>

                {/* Bottom Buttons */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
                    <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.65rem',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.05)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            letterSpacing: '0.05em'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)' }}
                    >
                        <ExternalLink size={12} />
                        SOURCE
                    </a>
                    <button
                        onClick={() => window.location.href = `/analytics?title=${encodeURIComponent(news.title)}&status=${news.ai_status}&score=${news.ai_score}&image=${encodeURIComponent(news.image || '')}&summary=${encodeURIComponent(news.summary || '')}`}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            padding: '0.65rem',
                            borderRadius: '8px',
                            background: news.ai_status === 'manipulated' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            border: `1px solid ${news.ai_status === 'manipulated' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                            color: news.ai_status === 'manipulated' ? '#ef4444' : '#10b981',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            letterSpacing: '0.05em'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.2)' }}
                        onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
                    >
                        <ShieldAlert size={12} />
                        REPORT
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function Feed() {
    const [allNews, setAllNews] = useState<NewsItem[]>([]);
    const [sections, setSections] = useState<Record<string, NewsItem[]>>({});
    const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState('all');

    const loadFeed = async () => {
        setLoading(true);
        try {
            const response = await fetchLiveFeed();
            if (response && response.data) {
                setAllNews(response.data || []);
                setSections(response.sections || {});
                setFilteredNews(response.data || []);
                setLastSync(new Date().toLocaleTimeString());
            } else {
                // Handle empty or error response
                setAllNews([]);
                setFilteredNews([]);
                setSections({});
            }
        } catch (error) {
            console.error("Feed loading error:", error);
            setAllNews([]);
            setFilteredNews([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadFeed();
    }, []);

    // Handle Category Filter
    useEffect(() => {
        if (activeCategory === 'all') {
            setFilteredNews(allNews || []);
        } else if (sections && sections[activeCategory]) {
            setFilteredNews(sections[activeCategory] || []);
        } else {
            // Fallback for categories not in sections object
            setFilteredNews((allNews || []).filter(item => item.category === activeCategory));
        }
    }, [activeCategory, allNews, sections]);

    const categories = [
        { id: 'all', label: 'All News' },
        { id: 'breaking', label: 'Breaking' },
        { id: 'trending', label: 'Trending' },
        { id: 'top', label: 'Top Stories' },
        { id: 'finance', label: 'Finance' },
        { id: 'sports', label: 'Sports' },
        { id: 'tech', label: 'Technology' },
        { id: 'science', label: 'Science' }
    ];

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'Live Feed', href: '/feed' },
        { label: 'Analyze', href: '/analytics' },
        { label: 'Activity', href: '#' }
    ];

    return (
        <main style={{ minHeight: '100vh', background: '#05070a' }}>
            <PillNav
                logo="/next.svg"
                items={navItems}
                activeHref="/feed"
                baseColor="#3b82f6"
                pillColor="#0c111a"
                pillTextColor="#3b82f6"
                hoveredPillTextColor="white"
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 1.5rem 4rem 1.5rem' }}>
                {/* Feed Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '0.1em' }}>INTELLIGENCE STREAM ACTIVE</span>
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Intelligence Feed</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
                            {activeCategory === 'all' ? 'Unified global feed' : `${activeCategory.toUpperCase()} Intel Stream`} • {(filteredNews || []).length} active nodes.
                        </p>
                    </div>

                    <button
                        onClick={loadFeed}
                        disabled={loading}
                        style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                            padding: '0.6rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 700
                        }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'SYNCING...' : 'REFRESH'}
                    </button>
                </div>

                {/* Category Selector Chips */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '3rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    scrollbarWidth: 'none'
                }}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '100px',
                                background: activeCategory === cat.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                                border: '1px solid',
                                borderColor: activeCategory === cat.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                color: activeCategory === cat.id ? 'white' : 'rgba(255,255,255,0.5)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Content: 3-Column Bento Grid */}
                {loading && filteredNews.length === 0 ? (
                    <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                        <RefreshCw size={48} className="animate-spin text-blue-500" />
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>FILTERING NEURAL NODES</h3>
                            <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>Reconfiguring feed based on category: {activeCategory}...</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="animate-fade-in"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '1.5rem'
                            }}
                        >
                            {filteredNews.map((item, i) => (
                                <NewsCard key={`${item.link}-${i}`} news={item} />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Bottom Status */}
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    marginTop: '4rem'
                }}>
                    [LAST SYNC: {lastSync}] • ALL NODES REPORTING NOMINAL
                </div>
            </div>
        </main>
    );
}
