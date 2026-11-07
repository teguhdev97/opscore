import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { LogOut } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (token: string, email: string) => void;
}

export function AuthForm({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => apiClient.login(email, password),
    onSuccess: (data) => {
      onAuthSuccess(data.token, data.user.email);
      setError('');
    },
    onError: (err: any) => {
      setError(err.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: () => apiClient.register(email, password),
    onSuccess: (data) => {
      onAuthSuccess(data.token, data.user.email);
      setError('');
    },
    onError: (err: any) => {
      setError(err.message || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isLogin ? 1 : 8}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loginMutation.isPending || registerMutation.isPending}>
          {isLogin ? 'Login' : 'Register'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          {isLogin ? 'Need account? Register' : 'Have account? Login'}
        </button>
      </form>
    </div>
  );
}

export function AuthStatus({ user, onLogout }: { user: string | null; onLogout: () => void }) {
  if (!user) return null;
  return (
    <div className="auth-status">
      <span>{user}</span>
      <button onClick={onLogout}>
        <LogOut size={16} />
      </button>
    </div>
  );
}
