"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Heart, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login('seeker', 'password123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090e12] px-4 relative overflow-hidden">
      
      {/* GLOWING AMBIENT BACKGROUNDS */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[180px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[180px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl relative z-10 border border-white/10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-3">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Welcome to MindEase AI</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to your mental wellness space</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Username or Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or email address"
                className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Password</label>
              <Link href="/forgot-password" className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Securing wellness link...</span>
              </div>
            ) : (
              "Sign In to Space"
            )}
          </button>

          <button 
            type="button" 
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full py-3.5 mt-3 rounded-xl border border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 text-teal-400 font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-teal-500/5 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            🌿 Demo Quick Login
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <span>New to MindEase AI? </span>
          <Link href="/register" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
