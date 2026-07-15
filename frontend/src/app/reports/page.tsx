"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { IWellnessReport } from '../../types';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Heart, 
  BookOpen, 
  Plus, 
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const { user } = useAuth();
  
  const [reports, setReports] = useState<IWellnessReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IWellnessReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async (selectFirst = false) => {
    setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; reports: IWellnessReport[] }>('/api/report');
      if (res.success) {
        setReports(res.reports);
        if (selectFirst && res.reports.length > 0) {
          setSelectedReport(res.reports[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports(true);
    }
  }, [user]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post<{ success: boolean; report: IWellnessReport }>('/api/report/generate', {});
      if (res.success) {
        setReports(prev => [res.report, ...prev]);
        setSelectedReport(res.report);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] max-w-6xl mx-auto rounded-3xl glass-panel border border-white/5 overflow-hidden shadow-2xl">
        
        {/* LEFT COLUMN: LIST INDEX */}
        <div className="w-full md:w-80 border-r border-white/5 flex flex-col shrink-0">
          
          <div className="p-4 border-b border-white/5 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Wellness Summaries</span>
              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="p-1.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-lg text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                title="Compile New Report"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-500 leading-normal">
              Compile your logs from the past 7 days into CBT actionable insights.
            </p>
          </div>

          {/* LIST ITEMS */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-black/10">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 text-teal-500 animate-spin" />
                <span className="text-[10px] text-gray-500">Retrieving logs...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-xs px-4">
                No reports compiled yet. Click the + button above to evaluate your logs.
              </div>
            ) : (
              reports.map((r) => {
                const isSelected = selectedReport?._id === r._id;
                return (
                  <div
                    key={r._id}
                    onClick={() => setSelectedReport(r)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-3 text-left ${
                      isSelected 
                        ? 'bg-gradient-to-r from-teal-500/15 to-indigo-500/10 border-teal-500/30' 
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <span className="text-xs font-bold text-white block truncate mb-1">
                        Report {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 leading-normal">
                        <Calendar className="w-3 h-3 text-gray-600 shrink-0" />
                        <span className="truncate">
                          {new Date(r.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(r.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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

        {/* RIGHT COLUMN: WORKSPACE VIEW */}
        <div className="flex-1 flex flex-col bg-[#0b1218]/45 relative">
          
          <AnimatePresence mode="wait">
            
            {/* 1. REPORT CONTENT */}
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                <RefreshCw className="w-10 h-10 text-teal-400 animate-spin" />
                <h4 className="text-sm font-bold text-white">Generating Diagnostic Insight...</h4>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">Evaluating daily mood averages, counting journals and meditating hours logged, and writing custom CBT guidance prompts.</p>
              </div>
            ) : selectedReport ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col p-6 overflow-y-auto"
              >
                
                {/* TOOLBAR METRICS */}
                <div className="pb-4 border-b border-white/5 mb-5 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      Wellness Period: {new Date(selectedReport.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} — {new Date(selectedReport.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Avg Mood</span>
                      <span className="text-lg font-bold text-teal-400 mt-1">{selectedReport.averageMood} / 5.0</span>
                    </div>
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Meditation</span>
                      <span className="text-lg font-bold text-indigo-400 mt-1">{selectedReport.meditationTotalMinutes} mins</span>
                    </div>
                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Journals</span>
                      <span className="text-lg font-bold text-pink-400 mt-1">{selectedReport.journalsWritten} entries</span>
                    </div>
                  </div>
                </div>

                {/* CONTENTS */}
                <div className="space-y-4 flex-1">
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                    {selectedReport.insights}
                  </div>
                </div>

              </motion.div>
            ) : (
              // 2. EMPTY BASELINE
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-6 gap-3">
                <FileText className="w-12 h-12 text-teal-500/10" />
                <h4 className="text-sm font-bold text-gray-400">Wellness Report Library</h4>
                <p className="text-xs max-w-xs leading-relaxed">Select a compiled report summary from the navigation panel or click the + icon to generate a new analysis.</p>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </DashboardLayout>
  );
}
