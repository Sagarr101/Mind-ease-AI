"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { IMood, IMeditationSession, IJournal } from '../../types';
import { 
  Flame, 
  PlusCircle, 
  MessageSquare, 
  BookOpen, 
  Heart, 
  Calendar,
  Smile,
  Frown,
  Meh,
  SmilePlus,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOOD_OPTIONS = [
  { score: 1, label: 'Awful', emoji: '😫', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { score: 2, label: 'Bad', emoji: '😟', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { score: 3, label: 'Okay', emoji: '😐', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  { score: 4, label: 'Good', emoji: '🙂', color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
  { score: 5, label: 'Excellent', emoji: '😄', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
];

const PRESET_TAGS = ['stressed', 'anxious', 'tired', 'calm', 'happy', 'excited', 'lonely', 'motivated', 'peaceful'];

export default function DashboardPage() {
  const { user, updateUserStreak } = useAuth();
  const router = useRouter();

  const [recentMoods, setRecentMoods] = useState<IMood[]>([]);
  const [meditationsCount, setMeditationsCount] = useState(0);
  const [journalsCount, setJournalsCount] = useState(0);

  // Quick Log Form State
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch recent moods
      const moodRes = await api.get<{ success: boolean; moods: IMood[] }>('/api/mood?limit=5');
      if (moodRes.success) {
        setRecentMoods(moodRes.moods);
      }

      // 2. Fetch meditations
      const medRes = await api.get<{ success: boolean; sessions: IMeditationSession[] }>('/api/meditation');
      if (medRes.success) {
        // Calculate minutes logged in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentMeds = medRes.sessions.filter(
          s => new Date(s.completedAt) >= sevenDaysAgo
        );
        setMeditationsCount(recentMeds.reduce((acc, curr) => acc + curr.durationMinutes, 0));
      }

      // 3. Fetch journals
      const journalRes = await api.get<{ success: boolean; journals: IJournal[] }>('/api/journal');
      if (journalRes.success) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentJournals = journalRes.journals.filter(
          j => new Date(j.createdAt) >= sevenDaysAgo
        );
        setJournalsCount(recentJournals.length);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleLogMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedScore === null) {
      setLogError('Please choose a mood score.');
      return;
    }

    setIsLogging(true);
    setLogError(null);
    setLogSuccess(false);

    try {
      const res = await api.post<{ success: boolean; mood: IMood }>('/api/mood', {
        score: selectedScore,
        tags: selectedTags,
        note: note.trim() || undefined,
      });

      if (res.success) {
        setLogSuccess(true);
        setSelectedScore(null);
        setNote('');
        setSelectedTags([]);
        
        // Refresh dashboard data
        await fetchDashboardData();

        // Refresh user details (to capture streak update from express me check)
        const meRes = await api.get<{ success: boolean; user: typeof user }>('/api/auth/me');
        if (meRes.success && meRes.user && user) {
          updateUserStreak(meRes.user.streak);
        }

        // Hide success alert after 3 seconds
        setTimeout(() => setLogSuccess(false), 3000);
      }
    } catch (err: any) {
      setLogError(err.message || 'Failed to log mood.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        
        {/* WELCOME BANNER */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Hello, {user?.username}
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Your mental wellness space is ready. How are you feeling right now?
          </p>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Streak</p>
              <h3 className="text-2xl font-bold text-amber-500 mt-1">{user?.streak.current} Days</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Meditation (7d)</p>
              <h3 className="text-2xl font-bold text-teal-400 mt-1">{meditationsCount} Mins</h3>
            </div>
            <div className="p-3 bg-teal-500/10 rounded-xl">
              <Heart className="w-6 h-6 text-teal-400" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Journals (7d)</p>
              <h3 className="text-2xl font-bold text-indigo-400 mt-1">{journalsCount} Logs</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Longest Streak</p>
              <h3 className="text-2xl font-bold text-pink-400 mt-1">{user?.streak.longest} Days</h3>
            </div>
            <div className="p-3 bg-pink-500/10 rounded-xl">
              <Compass className="w-6 h-6 text-pink-400" />
            </div>
          </div>

        </div>

        {/* WORK AREA: QUICK LOG & RECENT MOOD FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* QUICK MOOD LOG */}
          <div className="lg:col-span-2 p-6 rounded-3xl glass-panel relative border border-white/5 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Daily Mood Tracker</h3>
              <p className="text-xs text-gray-400 mt-0.5">Quickly log how you feel to update your streak</p>
            </div>

            {logSuccess && (
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm">
                Mood logged successfully! Streak updated. 🎉
              </div>
            )}
            {logError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {logError}
              </div>
            )}

            <form onSubmit={handleLogMood} className="space-y-6">
              
              {/* EMOJI CHOOSER */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Mood score</span>
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setSelectedScore(opt.score)}
                      className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all duration-300 ${
                        selectedScore === opt.score
                          ? 'border-teal-500 bg-teal-500/20 scale-105 shadow-lg shadow-teal-500/15'
                          : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <span className="text-2xl md:text-3xl mb-1">{opt.emoji}</span>
                      <span className="text-[10px] md:text-xs font-medium text-gray-400">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Add a short note</span>
                <input 
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What is contributing to your mood today?"
                  className="w-full p-3 py-3.5 rounded-xl glass-input text-sm"
                />
              </div>

              {/* TAGS */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Associated Tags</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-r from-teal-500/30 to-indigo-500/30 border-teal-500 text-white' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isLogging}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {isLogging ? "Saving log..." : "Save Daily Log"}
              </button>

            </form>
          </div>

          {/* RECENT MOOD FEED */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Mood Logs</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your last few entries</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[350px]">
              {recentMoods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
                  <Calendar className="w-8 h-8 opacity-40" />
                  <p className="text-xs">No moods logged yet</p>
                </div>
              ) : (
                recentMoods.map((mood) => {
                  const opt = MOOD_OPTIONS.find(o => o.score === mood.score);
                  return (
                    <div key={mood._id} className="p-4 rounded-2xl glass-card flex flex-col gap-2 relative">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{opt?.emoji || '😐'}</span>
                          <span className="text-sm font-semibold text-white">{opt?.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {new Date(mood.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      {mood.note && <p className="text-xs text-gray-300 leading-relaxed italic">"{mood.note}"</p>}

                      <div className="flex flex-wrap gap-1 mt-1">
                        {mood.tags.map(t => (
                          <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* QUICK ACTIONS SECTION */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div 
              onClick={() => router.push('/chat')}
              className="p-5 rounded-2xl glass-card border border-white/5 cursor-pointer hover:border-teal-500/30 flex items-center gap-4 transition-all duration-300 hover:translate-y-[-2px]"
            >
              <div className="p-3 bg-teal-500/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI Therapist</h4>
                <p className="text-xs text-gray-500 mt-0.5">Start real-time CBT chat support</p>
              </div>
            </div>

            <div 
              onClick={() => router.push('/journal')}
              className="p-5 rounded-2xl glass-card border border-white/5 cursor-pointer hover:border-indigo-500/30 flex items-center gap-4 transition-all duration-300 hover:translate-y-[-2px]"
            >
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Write Journal</h4>
                <p className="text-xs text-gray-500 mt-0.5">Reflect and run automatic sentiment checks</p>
              </div>
            </div>

            <div 
              onClick={() => router.push('/meditation')}
              className="p-5 rounded-2xl glass-card border border-white/5 cursor-pointer hover:border-pink-500/30 flex items-center gap-4 transition-all duration-300 hover:translate-y-[-2px]"
            >
              <div className="p-3 bg-pink-500/10 rounded-xl">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Meditation Hub</h4>
                <p className="text-xs text-gray-500 mt-0.5">Relax with timer-guided breathing</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
