'use client';

import React from 'react';
import { Shield, Activity, Share2, Search } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000,
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'inherit' }}>
                <div style={{
                    background: 'var(--accent-primary)',
                    padding: '0.4rem',
                    borderRadius: '0px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Shield size={24} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1, letterSpacing: '0.05em' }}>VERINODE</h1>
                    <span style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'monospace' }}>[CORE_OS]</span>
                </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <Link href="/feed" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Activity size={16} />
                    <span>Live Feed</span>
                </Link>

                <Link href="/analytics" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Share2 size={16} />
                    <span>Tree View</span>
                </Link>
            </div>

        </nav >
    );
};

export default Navbar;
