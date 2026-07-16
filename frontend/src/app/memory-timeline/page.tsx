"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { Clock, MessageSquare, User, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Conversation {
  _id: string;
  userId: string;
  title?: string;
  lastActivity?: Date;
  updatedAt?: Date;
}

export default function MemoryTimelinePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<{ success: boolean; conversations: Conversation[] }>('/api/conversations');
        if (res.success) {
          setConversations(res.conversations);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Memory Timeline</h1>
          <p className="text-gray-400">Your conversation history and wellness journey</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 glass-panel rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="glass-panel border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="glass-panel border border-white/5 rounded-2xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-teal-500/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No conversations yet</h3>
            <p className="text-gray-500">Start a conversation with the AI therapist to build your wellness journey.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv, idx) => (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => router.push(`/conversation-history?id=${conv._id}`)}
                className="glass-panel border border-white/5 rounded-2xl p-6 hover:border-teal-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-teal-400 transition-colors">{conv.title || 'Therapy Session'}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(conv.lastActivity || conv.updatedAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg group-hover:bg-teal-500/20 transition-all">
                    <ExternalLink className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-xs text-teal-400 font-medium">View</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
