"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { IMood } from '../../types';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Hash, 
  Smile, 
  Trash2, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOOD_DATA = {
  1: { emoji: '😫', label: 'Awful', color: 'text-red-400 bg-red-400/10 border-red-500/20' },
  2: { emoji: '😟', label: 'Bad', color: 'text-orange-400 bg-orange-400/10 border-orange-500/20' },
  3: { emoji: '😐', label: 'Okay', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20' },
  4: { emoji: '🙂', label: 'Good', color: 'text-teal-400 bg-teal-400/10 border-teal-500/20' },
  5: { emoji: '😄', label: 'Excellent', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' },
};

export default function MoodPage() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<IMood[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Statistics
  const [avgScore, setAvgScore] = useState(0);
  const [tagFrequencies, setTagFrequencies] = useState<{ tag: string; count: number }[]>([]);

  const fetchMoodLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; moods: IMood[] }>('/api/mood?limit=50');
      if (res.success) {
        setMoods(res.moods);
        
        // Calculate statistics
        if (res.moods.length > 0) {
          const sum = res.moods.reduce((acc, curr) => acc + curr.score, 0);
          setAvgScore(parseFloat((sum / res.moods.length).toFixed(1)));
          
          // Calculate tag frequencies
          const freqMap: Record<string, number> = {};
          res.moods.forEach(m => {
            m.tags.forEach(t => {
              freqMap[t] = (freqMap[t] || 0) + 1;
            });
          });
          const sortedTags = Object.entries(freqMap)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          setTagFrequencies(sortedTags);
        } else {
          setAvgScore(0);
          setTagFrequencies([]);
        }
      }
    } catch (err) {
      console.error('Error fetching mood history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMoodLogs();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Mood History
          </h2>
          <p className="text-gray-400 text-sm">
            Review your emotional trends, notes, and tags recorded over time.
          </p>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Average Mood Score</p>
              <h3 className="text-3xl font-bold text-teal-400 mt-1">
                {avgScore > 0 ? `${avgScore} / 5.0` : 'No logs'}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">Compiled from past logs</p>
            </div>
            <div className="p-3 bg-teal-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-teal-400" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Logs</p>
              <h3 className="text-3xl font-bold text-indigo-400 mt-1">{moods.length} Entries</h3>
              <p className="text-[10px] text-gray-500 mt-1">Tracking historical inputs</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card flex flex-col gap-2">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Top Emotional Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {tagFrequencies.length === 0 ? (
                <span className="text-xs text-gray-500 italic mt-1">No tags registered</span>
              ) : (
                tagFrequencies.map(({ tag, count }) => (
                  <span 
                    key={tag} 
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 flex items-center gap-1.5"
                  >
                    <Hash className="w-3 h-3 text-teal-400" />
                    <span>{tag} ({count})</span>
                  </span>
                ))
              )}
            </div>
          </div>

        </div>

        {/* HISTORY LIST */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Timeline Feed</h3>
            <button 
              onClick={fetchMoodLogs}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-gray-500">Loading timeline data...</p>
            </div>
          ) : moods.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
              <CalendarIcon className="w-10 h-10 opacity-30" />
              <h4 className="text-sm font-bold text-gray-400">No logs found</h4>
              <p className="text-xs max-w-xs leading-relaxed">Head back to the main dashboard to record your daily mood rating.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {moods.map((mood) => {
                const conf = MOOD_DATA[mood.score as keyof typeof MOOD_DATA] || MOOD_DATA[3];
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={mood._id} 
                    className="p-5 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner shrink-0">
                        {conf.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-sm font-bold text-white">{conf.label} Rating</h4>
                          <span className="text-[10px] text-gray-500 font-semibold">
                            {new Date(mood.loggedAt).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {mood.note && <p className="text-xs text-gray-300 mt-1.5 leading-relaxed italic">"{mood.note}"</p>}
                        
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {mood.tags.map(t => (
                            <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
