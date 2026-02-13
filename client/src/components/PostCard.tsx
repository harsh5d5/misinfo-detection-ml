'use client';

import React, { useState } from 'react';
import {
    MessageSquare,
    Share2,
    AlertTriangle,
    CheckCircle,
    Flag,
    ArrowBigUp,
    ArrowBigDown,
    ShieldCheck,
    AlertOctagon
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PostProps {
    post: {
        id: string;
        content: string;
        author: string;
        timestamp: string;
        mutationScore: number;
        mutationType: string | null;
    };
}

const PostCard = ({ post }: PostProps) => {
    const [votes, setVotes] = useState(Math.floor(Math.random() * 500));
    const [voteType, setVoteType] = useState<'up' | 'down' | null>(null);

    const isHighRisk = post.mutationScore > 60;
    const isMediumRisk = post.mutationScore > 30 && post.mutationScore <= 60;
    const isFactual = post.mutationType === 'FACTUAL';

    const getStatusTheme = () => {
        if (isFactual) return { color: '#10b981', label: 'VERIFIED FACTUAL', icon: <ShieldCheck size={16} />, bg: 'rgba(16, 185, 129, 0.1)' };
        if (isHighRisk) return { color: '#ef4444', label: `HIGH RISK ${post.mutationType}`, icon: <AlertOctagon size={16} />, bg: 'rgba(239, 68, 68, 0.1)' };
        if (isMediumRisk) return { color: '#f59e0b', label: `SUSPICIOUS ${post.mutationType}`, icon: <AlertTriangle size={16} />, bg: 'rgba(245, 158, 11, 0.1)' };
        return { color: '#64748b', label: 'UNVERIFIED', icon: null, bg: 'rgba(100, 116, 139, 0.1)' };
    };

    const theme = getStatusTheme();

    const handleVote = (type: 'up' | 'down') => {
        if (voteType === type) {
            setVoteType(null);
            setVotes(v => type === 'up' ? v - 1 : v + 1);
        } else {
            if (voteType) setVotes(v => voteType === 'up' ? v - 2 : v + 2);
            else setVotes(v => type === 'up' ? v + 1 : v - 1);
            setVoteType(type);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{
                borderRadius: '12px',
                marginBottom: '1rem',
                display: 'flex',
                border: `1px solid ${voteType ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}`,
                background: 'rgba(12, 17, 26, 0.5)',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease'
            }}
        >
            {/* 1. Vote Sidebar */}
            <div style={{
                width: '48px',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.75rem 0',
                gap: '0.25rem'
            }}>
                <button
                    onClick={() => handleVote('up')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                >
                    <ArrowBigUp
                        size={28}
                        fill={voteType === 'up' ? 'var(--accent-primary)' : 'none'}
                        stroke={voteType === 'up' ? 'var(--accent-primary)' : '#64748b'}
                    />
                </button>
                <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: voteType === 'up' ? 'var(--accent-primary)' : voteType === 'down' ? '#ef4444' : 'var(--text-primary)'
                }}>
                    {votes}
                </span>
                <button
                    onClick={() => handleVote('down')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                >
                    <ArrowBigDown
                        size={28}
                        fill={voteType === 'down' ? '#ef4444' : 'none'}
                        stroke={voteType === 'down' ? '#ef4444' : '#64748b'}
                    />
                </button>
            </div>

            {/* 2. Content Area */}
            <div style={{ flex: 1, padding: '1rem' }}>
                {/* Header: User & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--accent-primary)', opacity: 0.8 }} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>u/{post.author}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>• {new Date(post.timestamp).toLocaleTimeString()}</span>
                    </div>

                    {/* Misinformation Status Badge */}
                    <div style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '4px',
                        background: theme.bg,
                        border: `1px solid ${theme.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}>
                        {theme.icon}
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: theme.color, letterSpacing: '0.05em' }}>
                            {theme.label}
                        </span>
                    </div>
                </div>

                {/* Body Content */}
                <p style={{ fontSize: '1rem', lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    {post.content}
                </p>

                {/* Analysis Breakdown (Explain why it's flagged) */}
                {isMediumRisk || isHighRisk ? (
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        borderLeft: `3px solid ${theme.color}`
                    }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.color, marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                            Pattern Analysis
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                            {isHighRisk
                                ? "Detected linguistic patterns associated with deliberate fabrication and high emotional manipulation."
                                : "Unusual propagation velocity detected. High correlation with known misinformation nodes."}
                        </div>
                    </div>
                ) : null}

                {/* Footer Interaction Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)' }}>
                    <button style={actionButtonStyle}>
                        <MessageSquare size={16} />
                        <span>{Math.floor(Math.random() * 50)} Comments</span>
                    </button>
                    <button style={actionButtonStyle}>
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>
                    <button style={actionButtonStyle}>
                        <Flag size={16} />
                        <span>Report</span>
                    </button>

                    {/* Risk Slider Preview (Compact) */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.6 }}>RISK</span>
                        <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${post.mutationScore}%`, height: '100%', background: theme.color }} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const actionButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    transition: 'background 0.2s ease'
};

export default PostCard;
