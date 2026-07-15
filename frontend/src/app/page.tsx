"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Heart, Activity, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090e12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs font-semibold">Tuning wellness frequencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090e12] text-[#f3f4f6] relative overflow-hidden flex flex-col justify-between">
      
      {/* GLOW EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[150px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-teal-400 to-indigo-300 bg-clip-text text-transparent">MindEase AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-bold hover:bg-white/10 text-white transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 relative z-10 max-w-4xl mx-auto gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Empathetic Mental Support</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white mt-2">
            Your Personal Space for <br />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
              Mindfulness & Clarity
            </span>
          </h1>

          <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed mt-3">
            MindEase AI combines daily mood logging, cognitive journal tools, breathing guides, and an interactive AI Therapist to build mental resilience.
          </p>
        </motion.div>

        {/* HERO ACTIONS */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link 
            href="/register" 
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            <span>Begin Free Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center"
          >
            Access My Space
          </Link>
        </motion.div>

        {/* FEATURES BRIEF ROW */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 text-left"
        >
          <div className="p-6 rounded-2xl glass-card flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Daily Mood Tracker</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Map your triggers, log streaks, and view monthly trend analytics.</p>
          </div>

          <div className="p-6 rounded-2xl glass-card flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">CBT AI Therapist</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Real-time chat consultations built on cognitive reframing principles.</p>
          </div>

          <div className="p-6 rounded-2xl glass-card flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Weekly Wellness Audits</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Compile active logs into deep, personalized progress reviews.</p>
          </div>
        </motion.div>

      </main>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 py-5 text-center text-xs text-gray-600 border-t border-white/5 relative z-10">
        <span>© {new Date().getFullYear()} MindEase AI. Fully secure. Local sentiment diagnostics enabled.</span>
      </footer>

    </div>
  );
}
