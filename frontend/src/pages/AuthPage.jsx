import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoginTab, setIsLoginTab] = useState(true);
  
  // Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    if (isLoginTab) {
      if (!username || !password) {
        setFormError('Fill in all fields.');
        setSubmitting(false);
        return;
      }

      const result = await login(username, password);
      setSubmitting(false);
      if (result.success) {
        navigate(-1);
      } else {
        setFormError(result.error);
      }
    } else {
      if (!name || !username || !email || !password) {
        setFormError('Fill in all fields.');
        setSubmitting(false);
        return;
      }

      if (username.includes(' ')) {
        setFormError('Username cannot contain spaces.');
        setSubmitting(false);
        return;
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_-]{8,}$/;
      if (!passwordRegex.test(password)) {
        setFormError('Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.');
        setSubmitting(false);
        return;
      }

      const result = await register(name, username, email, password);
      setSubmitting(false);
      if (result.success) {
        navigate('/');
      } else {
        setFormError(result.error);
      }
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        padding: '40px 32px'
      }}>
        
        {/* Toggle tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-primary)',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => {
              setIsLoginTab(true);
              setFormError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: isLoginTab ? '2px solid var(--border-primary)' : 'none',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setFormError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: !isLoginTab ? '2px solid var(--border-primary)' : 'none',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', textAlign: 'center' }}>
          {isLoginTab ? 'Established Access' : 'Create Identity'}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center' }}>
          {isLoginTab ? 'Sign in to access your bag and archives.' : 'Create an account to join the Timeless Rebellion.'}
        </p>

        {/* Error Alert */}
        {formError && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '12px',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLoginTab && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Username</label>
            <input
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {!isLoginTab && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', height: '48px', marginTop: '12px', fontSize: '0.8rem' }}
          >
            {submitting ? (
              <Loader2 size={16} className="spinner" />
            ) : isLoginTab ? (
              'ENTER ARCHIVES'
            ) : (
              'ESTABLISH ACCOUNT'
            )}
          </button>
        </form>
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

export default AuthPage;
