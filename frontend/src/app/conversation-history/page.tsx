"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { useSearchParams } from 'next/navigation';
import { Download, MessageSquare, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessage {
  _id: string;
  userId: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: string;
  emotions?: Record<string, number>;
}

function ConversationHistoryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !conversationId) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<{ success: boolean; messages: ChatMessage[] }>(`/api/conversations/${conversationId}/messages`);
        if (res.success) {
          setMessages(res.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [user, conversationId]);

  const downloadTranscript = () => {
    let content = `# MindEase Conversation Transcript\n`;
    content += `Exported on: ${new Date().toLocaleString()}\n`;
    content += `User: ${user?.username || 'Wellness Seeker'}\n\n`;
    content += `---\n\n`;

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'You' : 'MindEase Therapist';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const date = new Date(msg.timestamp).toLocaleDateString();
      content += `### [${date} ${time}] ${role}\n`;
      content += `${msg.content}\n\n`;
      if (msg.sentiment) {
        content += `*Sentiment: ${msg.sentiment}*\n\n`;
      }
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `conversation_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Conversation History</h1>
            <p className="text-gray-400">{messages.length} messages in this conversation</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={downloadTranscript}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-400 rounded-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 glass-panel rounded-2xl border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="glass-panel border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="glass-panel border border-white/5 rounded-2xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-teal-500/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No messages in this conversation</h3>
            <p className="text-gray-500">Messages from this conversation will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed border transition-all ${
                      isUser
                        ? 'bg-gradient-to-tr from-teal-500/20 to-indigo-600/30 border-teal-500/20 text-white rounded-br-none shadow-md shadow-indigo-500/5'
                        : 'glass-card border-white/5 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <div className={`flex items-center gap-2 mt-2 text-[9px] text-gray-500 font-medium ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && msg.sentiment && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-teal-400 uppercase tracking-wider">
                          {msg.sentiment}
                        </span>
                      )}
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ConversationHistoryPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 glass-panel rounded-2xl border border-white/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    }>
      <ConversationHistoryContent />
    </Suspense>
  );
}
