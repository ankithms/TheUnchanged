import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [comments, setComments] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, subject, comments })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setName('');
        setEmail('');
        setSubject('');
        setComments('');
      } else {
        setError(data.error || 'Failed to send message.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '60px', paddingBottom: '80px', maxWidth: '640px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>Contact Us</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Have a question about sizes, styles, or shipping? Drop us a line!
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '40px 32px' }}>
        
        {success ? (
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 0'
          }}>
            <CheckCircle size={48} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Message Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px', lineHeight: '1.5' }}>
              Thank you for reaching out. Our customer success team will review your comments and get back to you shortly.
            </p>
            <button onClick={() => setSuccess(false)} className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                fontSize: '0.85rem'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="How can we help?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Comments / Message</label>
              <textarea
                className="form-input"
                placeholder="Type your message here..."
                rows={5}
                style={{ resize: 'none', fontFamily: 'inherit' }}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', marginTop: '12px' }}
            >
              {loading ? (
                <Loader2 size={18} className="spinner" />
              ) : (
                <>
                  <Send size={16} /> Send Message
                </>
              )}
            </button>
          </form>
        )}

      </div>
      
      <style>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Contact;
