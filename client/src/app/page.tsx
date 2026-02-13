import PillNav from "@/components/PillNav";
import NetworkNodes from "@/components/NetworkNodes";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Live Feed', href: '/feed' },
    { label: 'Analyze', href: '/analytics' },
    { label: 'Activity', href: '#' }
  ];

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <PillNav
        logo="/next.svg"
        items={navItems}
        activeHref="/"
        baseColor="#3b82f6" // Professional Cyber Blue
        pillColor="#05070a"
        pillTextColor="#3b82f6"
        hoveredPillTextColor="white"
      />
      {/* Background Layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
        <NetworkNodes
          color="#3b82f6"
          nodeCount={100}
          connectionDistance={150}
          speed={0.3}
        />
      </div>

      {/* Content Layer */}
      <section style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div className="animate-fade-in" style={{ zIndex: 1, maxWidth: '900px' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: 'white',
            textShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          }}>
            TRUSTED INSIGHT <br />
            <span style={{ color: 'var(--accent-primary)' }}>FROM DATA STREAMS</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            marginBottom: '3rem',
            maxWidth: '600px',
            marginInline: 'auto',
            fontFamily: 'monospace'
          }}>
            An intelligent framework for real-time collection and analysis of misinformation from streaming data sources.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href="/feed" style={{
              background: 'white',
              color: 'black',
              padding: '1.2rem 2.5rem',
              borderRadius: '4px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              INITIALIZE FEED
              <ArrowRight size={20} />
            </Link>

            <Link href="/analytics" style={{
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '1.2rem 2.5rem',
              borderRadius: '4px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              backdropFilter: 'blur(10px)'
            }}>
              NETWORK TREE
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative Bottom Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: '1rem 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontFamily: 'monospace',
        zIndex: 10
      }}>
        <span>STATUS: ACTIVE_MONITORING</span>
        <span>LOCATION: GLOBAL_NODES</span>
        <span>ENCRYPTION: AES-256</span>
      </div>
    </main>
  );
}
