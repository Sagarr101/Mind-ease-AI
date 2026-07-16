"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { Search, BookOpen, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface KBDoc {
  _id: string;
  title: string;
  source?: string;
  createdAt: Date;
}

export default function KnowledgeResourcesPage() {
  const [documents, setDocuments] = useState<KBDoc[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<{ success: boolean; documents: KBDoc[] }>('/api/knowledgebase');
        if (res.success) {
          setDocuments(res.documents);
        }
      } catch (err) {
        console.error('Failed to load knowledge base:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      const res = await api.get<{ success: boolean; results: string[] }>(`/api/knowledgebase/search?q=${encodeURIComponent(query)}`);
      if (res.success) {
        setSearchResults(res.results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">CBT Knowledge Resources</h1>
          <p className="text-gray-400">Learn evidence-based mental health strategies</p>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for topics like anxiety, depression, sleep..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-all"
            />
          </div>
        </form>

        {/* Search Results */}
        {query && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Search Results</h2>
            {isSearching ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 glass-panel rounded-2xl border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3 mb-8">
                {searchResults.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel border border-teal-500/20 rounded-2xl p-4 hover:border-teal-500/40 transition-all"
                  >
                    <p className="text-gray-300">{result}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-panel border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-gray-400">No results found. Try different keywords.</p>
              </div>
            )}
          </div>
        )}

        {/* All Documents */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Featured Topics</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 glass-panel rounded-2xl border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="glass-panel border border-white/5 rounded-2xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-teal-500/20 mx-auto mb-4" />
              <p className="text-gray-400">No documents available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documents.map((doc, idx) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel border border-white/5 rounded-2xl p-6 hover:border-teal-500/30 hover:bg-white/[0.02] transition-all cursor-pointer group"
                >
                  <div className="flex gap-4">
                    <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-all">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-teal-300 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-500">{doc.source || 'CBT Resource'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
