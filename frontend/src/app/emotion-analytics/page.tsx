"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { Zap, Heart, Frown } from 'lucide-react';

const EMOTIONS = [
  'happy', 'calm', 'excited', 'grateful', 'hopeful', 'motivated',
  'sad', 'lonely', 'angry', 'fearful', 'anxious', 'stressed',
  'burnedOut', 'overwhelmed', 'guilty', 'confused'
];

export default function EmotionAnalyticsPage() {
  const { user } = useAuth();
  const [emotionTrends, setEmotionTrends] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Placeholder: simulate emotion data aggregation
    // In production, this would call an API endpoint
    const sampleData: Record<string, number> = {};
    EMOTIONS.forEach(emotion => {
      sampleData[emotion] = Math.random() * 100;
    });
    setEmotionTrends(sampleData);
    setIsLoading(false);
  }, [user]);

  const positiveEmotions = EMOTIONS.slice(0, 6);
  const negativeEmotions = EMOTIONS.slice(6, 12);
  const stressEmotions = EMOTIONS.slice(12);

  const getColorForEmotion = (value: number) => {
    if (value > 75) return 'from-emerald-500 to-emerald-600';
    if (value > 50) return 'from-amber-500 to-amber-600';
    if (value > 25) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Emotion Analytics</h1>
          <p className="text-gray-400">Your emotional patterns and trends</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Positive Emotions */}
          <div className="glass-panel border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Positive Emotions</h2>
            </div>
            <div className="space-y-4">
              {positiveEmotions.map(emotion => (
                <div key={emotion} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white capitalize">{emotion}</span>
                    <span className="text-gray-400">{Math.round(emotionTrends[emotion] || 0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full bg-gradient-to-r ${getColorForEmotion(emotionTrends[emotion] || 0)} rounded-full transition-all duration-500`}
                      style={{ width: `${emotionTrends[emotion] || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Negative Emotions */}
          <div className="glass-panel border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Frown className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Challenging Emotions</h2>
            </div>
            <div className="space-y-4">
              {negativeEmotions.map(emotion => (
                <div key={emotion} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white capitalize">{emotion}</span>
                    <span className="text-gray-400">{Math.round(emotionTrends[emotion] || 0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full bg-gradient-to-r ${getColorForEmotion(emotionTrends[emotion] || 0)} rounded-full transition-all duration-500`}
                      style={{ width: `${emotionTrends[emotion] || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Burnout Indicators */}
          <div className="glass-panel border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Burnout Indicators</h2>
            </div>
            <div className="space-y-4">
              {stressEmotions.map(emotion => (
                <div key={emotion} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white capitalize">{emotion}</span>
                    <span className="text-gray-400">{Math.round(emotionTrends[emotion] || 0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full bg-gradient-to-r ${getColorForEmotion(emotionTrends[emotion] || 0)} rounded-full transition-all duration-500`}
                      style={{ width: `${emotionTrends[emotion] || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
