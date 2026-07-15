"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Heart, Mail, ArrowLeft, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedLink, setSimulatedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSimulatedLink(null);

    if (!email.trim()) {
      setError('Please fill in the email/username field');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; message: string; token: string }>('/api/auth/forgot-password', {
        email: email.trim(),
      });

      if (res.success) {
        // Construct the reset url locally for direct browser access
        const resetUrl = `${window.location.origin}/reset-password?token=${res.token}`;
        setSimulatedLink(resetUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Check username/email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!simulatedLink) return;
    navigator.clipboard.writeText(simulatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090e12] px-4 relative overflow-hidden">
      
      {/* GLOW EFFECTS */}
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Recover Space</h2>
          <p className="text-gray-400 text-sm mt-1 text-center">We will generate a simulated link to reset your wellness credentials.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {simulatedLink ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-3 text-teal-400 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>Link successfully generated! Click below to access the reset form directly.</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Simulated Reset Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={simulatedLink}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-teal-300 select-all focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl transition-all flex items-center justify-center"
                  title="Copy Link"
                >
                  {copied ? <span className="text-[10px] text-teal-400 font-bold">Copied!</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <a 
              href={simulatedLink} 
              className="w-full block text-center py-3.5 mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-sm transition-all"
            >
              Go to Reset Form
            </a>
          </div>
        ) : (
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

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? "Generating Link..." : "Retrieve Access Link"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm">
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
