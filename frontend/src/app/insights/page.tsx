"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { TrendingUp, RefreshCw, Zap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Insight {
  _id: string;
  title: string;
  description: string;
  metric?: string;
  value?: any;
  generatedAt: Date;
}

export default function InsightsDashboardPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<{ success: boolean; insights: Insight[] }>('/api/insights/user-insights');
        if (res.success) {
          setInsights(res.insights);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load insights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [user]);

  const generateWeeklyInsights = async () => {
    try {
      const res = await api.post<{ success: boolean }>('/api/insights/generate-weekly', {});
      if (res.success) {
        // Refetch insights
        const updated = await api.get<{ success: boolean; insights: Insight[] }>('/api/insights/user-insights');
        if (updated.success) {
          setInsights(updated.insights);
        }
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
    }
  };

  const getIconForMetric = (metric?: string) => {
    switch (metric) {
      case 'mood_trend':
      case 'meditation_minutes':
      case 'journal_count':
        return <TrendingUp className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">AI Insights Dashboard</h1>
            <p className="text-gray-400">Personalized wellness recommendations</p>
          </div>
          <button
            onClick={generateWeeklyInsights}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Insights
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 glass-panel rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="glass-panel border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="glass-panel border border-white/5 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-teal-500/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No insights yet</h3>
            <p className="text-gray-500 mb-6">Generate weekly insights to see personalized recommendations.</p>
            <button
              onClick={generateWeeklyInsights}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-all"
            >
              Generate Insights
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, idx) => (
              <motion.div
                key={insight._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel border border-white/5 rounded-2xl p-6 hover:border-teal-500/30 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
                    {getIconForMetric(insight.metric)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{insight.title}</h3>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">{insight.description}</p>
                <div className="text-xs text-gray-500">
                  {new Date(insight.generatedAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
