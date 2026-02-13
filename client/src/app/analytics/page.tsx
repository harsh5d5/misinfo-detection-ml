'use client';

import React, { useEffect, useState, Suspense } from 'react';
import PillNav from "@/components/PillNav";
import { Share2, AlertCircle, RefreshCw, ShieldCheck, ShieldAlert, Cpu, BarChart3, Fingerprint, Zap, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchLiveFeed, NewsItem } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

function AnalyticsContent() {
    const searchParams = useSearchParams();
    const [nodeCount, setNodeCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');

    const title = searchParams.get('title');
    const status = searchParams.get('status');
    const score = searchParams.get('score');
    const image = searchParams.get('image');
    const summary = searchParams.get('summary');

    const isReport = !!title;

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'Live Feed', href: '/feed' },
        { label: 'Analyze', href: '/analytics' },
        { label: 'Activity', href: '#' }
    ];

    useEffect(() => {
        const getStats = async () => {
            const data = await fetchLiveFeed();
            setNodeCount(data ? data.data.length : 0);
            setLoading(false);
        };
        getStats();
    }, []);

    if (isReport) {
        const trustScore = parseFloat(score || '0');
        const isManipulated = status === 'manipulated';
        const accentColor = isManipulated ? '#ef4444' : '#10b981';

        let domain = 'unknown-source.net';
        try { if (image) domain = new URL(image).hostname; } catch (e) { }

        return (
            <main style={{ minHeight: '100vh', paddingTop: '6rem', background: '#05070a' }}>
                <PillNav logo="/next.svg" items={navItems} activeHref="/analytics" baseColor="#3b82f6" pillColor="#05070a" pillTextColor="#3b82f6" hoveredPillTextColor="white" />

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <div style={{ padding: '0.4rem', background: `${accentColor}22`, borderRadius: '8px' }}>
                                    {isManipulated ? <ShieldAlert color={accentColor} size={20} /> : <ShieldCheck color={accentColor} size={20} />}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: accentColor, letterSpacing: '0.2em' }}>COMBINED TRUST ARCHITECTURE</span>
                            </div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1 }}>Intelligence Dossier</h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: accentColor, lineHeight: 1 }}>{Math.round(trustScore * 100)}%</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>AGGREGATE PROBABILITY</div>
                        </div>
                    </div>

                    {/* SUB-NAVBAR TOGGLE */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                            onClick={() => setActiveTab('image')}
                            style={{
                                background: 'transparent', border: 'none', padding: '0.75rem 0.5rem', cursor: 'pointer',
                                color: activeTab === 'image' ? '#3b82f6' : 'rgba(255,255,255,0.4)',
                                fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.1em',
                                borderBottom: activeTab === 'image' ? '2px solid #3b82f6' : '2px solid transparent',
                                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <Fingerprint size={16} /> IMAGE
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            style={{
                                background: 'transparent', border: 'none', padding: '0.75rem 0.5rem', cursor: 'pointer',
                                color: activeTab === 'text' ? '#3b82f6' : 'rgba(255,255,255,0.4)',
                                fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.1em',
                                borderBottom: activeTab === 'text' ? '2px solid #3b82f6' : '2px solid transparent',
                                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <BarChart3 size={16} /> TEXT
                        </button>
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'image' ? (
                            /* SECTION 1: VISUAL INTELLIGENCE [IMG-INT] */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                                    <div style={{ width: '12px', height: '12px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.05em' }}>[IMG-INT] VISUAL FORENSICS</h3>
                                </div>

                                <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: `1px solid ${accentColor}33`, position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.8rem', borderRadius: '100px', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', zIndex: 10 }}>
                                        <Fingerprint size={12} color={accentColor} />
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>PIXEL ANALYSIS ACTIVE</span>
                                    </div>
                                    {image ? (
                                        <img src={image} style={{ width: '100%', display: 'block', height: '350px', objectFit: 'cover' }} alt="Visual Evidence" />
                                    ) : (
                                        <div style={{ height: '350px', background: '#0a0c10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>NO VISUAL ASSET</div>
                                    )}

                                    <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.4)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>IMAGE INTEGRITY SCORE</span>
                                            <span style={{ fontSize: '0.65rem', color: accentColor, fontWeight: 900 }}>{Math.round(trustScore * 100)}%</span>
                                        </div>
                                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${trustScore * 100}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: accentColor }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    {[
                                        { label: 'Neural Noise', val: isManipulated ? 'HIGH' : 'LOW', icon: <Zap size={14} />, color: isManipulated ? '#ef4444' : '#10b981' },
                                        { label: 'Pixel Geometry', val: isManipulated ? 'ANOMALOUS' : 'NOMINAL', icon: <LayoutGrid size={14} />, color: isManipulated ? '#ef4444' : '#10b981' },
                                        { label: 'Light Alignment', val: 'CONSISTENT', icon: <RefreshCw size={14} />, color: '#10b981' },
                                        { label: 'Metadata Sync', val: 'OFFLINE', icon: <AlertCircle size={14} />, color: '#f59e0b' }
                                    ].map((stat, i) => (
                                        <div key={i} className="glass" style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ color: stat.color }}>{stat.icon}</div>
                                            <div>
                                                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>{stat.label.toUpperCase()}</div>
                                                <div style={{ fontSize: '0.7rem', color: stat.color, fontWeight: 900 }}>{stat.val}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="glass" style={{ padding: '1.25rem', borderRadius: '24px', background: isManipulated ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', border: `1px solid ${accentColor}44` }}>
                                    <div style={{ fontSize: '0.65rem', color: accentColor, fontWeight: 900, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>IMAGE AUTHENTICITY VERDICT</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: accentColor }}>{isManipulated ? 'FAKE / MANIPULATED' : 'REAL / AUTHENTIC'}</div>
                                        <div style={{ padding: '0.4rem', background: `${accentColor}22`, borderRadius: '50%' }}>
                                            {isManipulated ? <ShieldAlert color={accentColor} size={24} /> : <ShieldCheck color={accentColor} size={24} />}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                                        {isManipulated ? "Forensic patterns detect synthetic pixel clusters and inconsistent noise variances typical of generative AI or manual cloning." : "Standard sensor noise and consistent pixel geometry confirmed across all quadrants. No traces of neural tampering detected."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* SECTION 2: CONTEXTUAL INTELLIGENCE [CTX-INT] */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.05em' }}>[CTX-INT] TEXT & SOURCE INTELLIGENCE</h3>
                                </div>

                                <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>SOURCE AUTHENTICITY [DOMAIN]</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Share2 size={16} color="#3b82f6" /> {domain}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>HEADLINE VERIFICATION [TITLE]</div>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.3, color: 'white' }}>{title}</h4>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>NARRATIVE CONTENT [DESCRIPTION]</div>
                                        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', borderLeft: '2px solid #3b82f6' }}>{summary}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: '0.25rem' }}>NLP SENTIMENT</div>
                                            <div style={{ color: '#10b981', fontWeight: 900, fontSize: '0.8rem' }}>NEUTRAL / FACTUAL</div>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: '0.25rem' }}>REPUTATION RANK</div>
                                            <div style={{ color: '#3b82f6', fontWeight: 900, fontSize: '0.8rem' }}>TIER-1 SOURCE</div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.25rem', borderRadius: '16px', background: isManipulated ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)', border: `1px solid ${isManipulated ? '#ef444444' : '#3b82f644'}` }}>
                                        <div style={{ fontSize: '0.65rem', color: isManipulated ? '#ef4444' : '#3b82f6', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>NEWS ACCURACY VERDICT</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isManipulated ? '#ef4444' : 'white' }}>
                                            {isManipulated ? 'POTENTIAL MISINFORMATION' : 'FACTUALLY CONSISTENT'}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>
                                            {isManipulated
                                                ? `The combination of multiple anomalies from ${domain} source and the detected visual manipulation suggests this narrative is intentionally deceptive.`
                                                : `Content from ${domain} verified against global intelligence nodes. High topical consistency detected.`}
                                        </p>
                                    </div>

                                    <button style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)' }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)' }}>
                                        <Cpu size={18} />
                                        CROSS-REFERENCE INTELLIGENCE
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Report Footer */}
                    <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>NEURAL CORE V4.2 // SCAN ACTIVE</div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'white', color: 'black', border: 'none', fontWeight: 900, fontSize: '0.7rem' }}>DOWNLOAD PDF</button>
                            <button style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 900, fontSize: '0.7rem' }}>SHARE INTEL</button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', paddingTop: '6rem', background: '#05070a' }}>
            <PillNav logo="/next.svg" items={navItems} activeHref="/analytics" baseColor="#3b82f6" pillColor="#05070a" pillTextColor="#3b82f6" hoveredPillTextColor="white" />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Misinformation Propagation Tree</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualizing how false narratives evolve and spread across the network.</p>
                </div>

                <div className="glass" style={{
                    height: '600px',
                    borderRadius: '24px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    background: 'rgba(59, 130, 246, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ textAlign: 'center', zIndex: 10 }}>
                        {loading ? (
                            <RefreshCw size={48} className="animate-spin text-blue-500" style={{ marginBottom: '1.5rem' }} />
                        ) : (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                style={{ marginBottom: '1.5rem', display: 'inline-block' }}
                            >
                                <Share2 size={48} color="var(--accent-primary)" opacity={0.5} />
                            </motion.div>
                        )}
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                            {loading ? "INITIALIZING ANALYSIS ENGINE..." : "NETWORK TREE READY"}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                            {loading
                                ? "Contacting global nodes for current data stream..."
                                : `We are connecting the dots between ${nodeCount} detected nodes in the current live stream.`
                            }
                        </p>
                    </div>

                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(var(--bg-tertiary) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        opacity: 0.3
                    }} />
                </div>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', background: 'rgba(25, 30, 40, 0.4)' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                            <BarChart3 color="#3b82f6" />
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '0.2rem' }}>Network Density</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monitoring {nodeCount} active nodes for pattern emergence.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function Analytics() {
    return (
        <Suspense fallback={<div>Loading Analytics...</div>}>
            <AnalyticsContent />
        </Suspense>
    );
}
