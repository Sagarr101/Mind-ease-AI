"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { IJournal } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Smile, 
  AlertCircle, 
  Calendar,
  Frown,
  Meh,
  Search,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SENTIMENT_STYLES = {
  Positive: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  Negative: 'bg-red-500/10 border-red-500/20 text-red-400',
  Neutral: 'bg-gray-500/10 border-white/10 text-gray-400',
};

const MOOD_EMOJIS = ['😫', '😟', '😐', '🙂', '😄'];

export default function JournalPage() {
  const { user } = useAuth();
  
  const [journals, setJournals] = useState<IJournal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<IJournal | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchJournals = async (autoSelectFirst = false) => {
    setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; journals: IJournal[] }>('/api/journal');
      if (res.success) {
        setJournals(res.journals);
        if (autoSelectFirst && res.journals.length > 0) {
          setSelectedJournal(res.journals[0]);
          setIsCreating(false);
        }
      }
    } catch (err) {
      console.error('Error fetching journals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJournals(true);
    }
  }, [user]);

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Please fill in both title and content fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await api.post<{ success: boolean; journal: IJournal }>('/api/journal', {
        title: title.trim(),
        content: content.trim(),
        moodScore,
      });

      if (res.success) {
        // Clear form
        setTitle('');
        setContent('');
        setMoodScore(3);
        
        // Refresh journal logs
        await fetchJournals(false);
        
        // Open newly created journal
        setSelectedJournal(res.journal);
        setIsCreating(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create journal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      const res = await api.delete<{ success: boolean; message: string }>(`/api/journal/${id}`);
      if (res.success) {
        setJournals(prev => prev.filter(j => j._id !== id));
        if (selectedJournal?._id === id) {
          setSelectedJournal(null);
        }
      }
    } catch (err) {
      console.error('Error deleting journal:', err);
    }
  };

  // Filter journals based on search query
  const filteredJournals = journals.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] max-w-6xl mx-auto rounded-3xl glass-panel border border-white/5 overflow-hidden shadow-2xl">
        
        {/* LEFT COLUMN: LIST INDEX */}
        <div className="w-full md:w-80 border-r border-white/5 flex flex-col shrink-0">
          
          <div className="p-4 border-b border-white/5 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Reflective Journals</span>
              <button 
                onClick={() => {
                  setIsCreating(true);
                  setSelectedJournal(null);
                }}
                className="p-1.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-lg text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                title="Create New Entry"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090e12]/60 border border-white/5 text-xs focus:outline-none focus:border-teal-500 focus:bg-[#090e12]/80 transition-all text-white"
              />
            </div>
          </div>

          {/* LIST ITEMS */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-black/10">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 text-teal-500 animate-spin" />
                <span className="text-[10px] text-gray-500">Retrieving journals...</span>
              </div>
            ) : filteredJournals.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-xs px-4">
                No entries found. Click the + button above to write your first reflection!
              </div>
            ) : (
              filteredJournals.map((j) => {
                const isSelected = selectedJournal?._id === j._id;
                return (
                  <div
                    key={j._id}
                    onClick={() => {
                      setSelectedJournal(j);
                      setIsCreating(false);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-3 text-left ${
                      isSelected 
                        ? 'bg-gradient-to-r from-teal-500/15 to-indigo-500/10 border-teal-500/30' 
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-white truncate block">{j.title}</span>
                        {j.moodScore && <span className="text-xs">{MOOD_EMOJIS[j.moodScore - 1]}</span>}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate block leading-normal">{j.content}</p>
                      
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${SENTIMENT_STYLES[j.sentiment]}`}>
                          {j.sentiment}
                        </span>
                        <span className="text-[9px] text-gray-600">
                          {new Date(j.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isSelected ? 'translate-x-0.5 text-teal-400' : ''}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE */}
        <div className="flex-1 flex flex-col bg-[#0b1218]/45 relative">
          
          <AnimatePresence mode="wait">
            
            {/* 1. CREATION WORKSPACE */}
            {isCreating ? (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSaveJournal}
                className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">Create Self-Reflection Entry</h3>
                  <p className="text-xs text-gray-400">Pour your thoughts onto paper. We will automatically analyze their emotional sentiment.</p>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Entry Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Grateful for minor wins today..."
                    className="w-full p-3 rounded-xl glass-input text-sm"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Associated Mood Rating</label>
                  <div className="flex gap-2">
                    {MOOD_EMOJIS.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setMoodScore(index + 1)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg transition-all ${
                          moodScore === index + 1
                            ? 'bg-teal-500/20 border-teal-500 scale-105'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-1 min-h-[150px]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Journal Text</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Woke up feeling..."
                    className="w-full flex-1 p-3.5 rounded-xl glass-input text-sm resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-99 disabled:opacity-50"
                  >
                    {isSubmitting ? "Running Sentiment Audit..." : "Save Reflection"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      if (journals.length > 0) setSelectedJournal(journals[0]);
                    }}
                    className="px-5 py-3 border border-white/5 text-gray-400 hover:text-white rounded-xl text-xs hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            ) : 
            
            // 2. READER WORKSPACE
            selectedJournal ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col p-6 overflow-y-auto"
              >
                
                {/* TOOLBAR */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full border uppercase tracking-wider font-bold ${SENTIMENT_STYLES[selectedJournal.sentiment]}`}>
                      {selectedJournal.sentiment} Sentiment
                    </span>
                    {selectedJournal.moodScore && (
                      <span className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-gray-300">
                        Mood: {MOOD_EMOJIS[selectedJournal.moodScore - 1]}
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => handleDeleteJournal(selectedJournal._id)}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* CONTENTS */}
                <div className="space-y-4 flex-1">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-white leading-tight">{selectedJournal.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(selectedJournal.createdAt).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap pt-4">
                    {selectedJournal.content}
                  </p>
                </div>

              </motion.div>
            ) : (
              // 3. EMPTY BASELINE
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-6 gap-3">
                <BookOpen className="w-12 h-12 text-teal-500/10" />
                <h4 className="text-sm font-bold text-gray-400">Welcome to reflection center</h4>
                <p className="text-xs max-w-xs leading-relaxed">Select a journal from the list or click the + icon to record a new journal entry.</p>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </DashboardLayout>
  );
}
