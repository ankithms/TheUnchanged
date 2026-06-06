import React from 'react';
import { Sparkles, Shield, ShieldCheck, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="container animate-fade-in" style={{ marginTop: '60px', paddingBottom: '80px', maxWidth: '800px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Our Story</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', lineHeight: '1.6' }}>
          At The Unchanged, we believe fashion should resist the temporary. Built once. Built right.
        </p>
      </div>

      {/* Main Image */}
      <div style={{
        width: '100%',
        height: 'clamp(200px, 40vh, 360px)',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        marginBottom: '48px'
      }}>
        <img 
          src="/manifesto_fabric.png" 
          alt="The Unchanged Atelier" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
        
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Who We Are</h2>
          <p>
            The Unchanged was founded to resist the fleeting. We craft garments from heavyweight textiles using traditional techniques, ensuring every piece earns its character through the passage of time. Our real-time inventory tracking means you only see what's truly available.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          marginTop: '16px'
        }}>
          
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Sparkles size={24} style={{ color: 'var(--accent-light)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Minimal Aesthetics</h3>
            <p style={{ fontSize: '0.85rem' }}>No clutter, no popups. A focused shopping flow designed for clarity.</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ShieldCheck size={24} style={{ color: 'var(--accent-light)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Quality First</h3>
            <p style={{ fontSize: '0.85rem' }}>Sourced from hand-selected local fabrics to guarantee comfort and longevity.</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Heart size={24} style={{ color: 'var(--accent-light)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Customer Centric</h3>
            <p style={{ fontSize: '0.85rem' }}>50-day return policy and friendly support because your trust matters.</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default About;
