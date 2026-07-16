"use client";

import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AlertTriangle, Phone, MessageCircle, Heart, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const CRISIS_RESOURCES = [
  {
    title: '988 Suicide & Crisis Lifeline (US)',
    description: 'Free, confidential support available 24/7.',
    number: 'Call or Text 988',
    icon: Phone,
    color: 'from-red-500 to-pink-500',
  },
  {
    title: 'Crisis Text Line',
    description: 'Text-based crisis support from trained counselors.',
    number: 'Text HOME to 741741',
    icon: MessageCircle,
    color: 'from-blue-500 to-purple-500',
  },
  {
    title: 'International Association for Suicide Prevention',
    description: 'Global database of crisis centers and helplines.',
    number: 'Visit Website',
    icon: Globe,
    color: 'from-emerald-500 to-teal-500',
  },
];

const COPING_STRATEGIES = [
  {
    title: 'When You Feel Overwhelmed',
    tips: [
      'Take slow, deep breaths (4-7-8 technique)',
      'Step outside or change your environment',
      'Contact a trusted friend or family member',
      'Engage in a grounding activity (5-4-3-2-1 technique)',
      'Listen to calming music or nature sounds',
    ],
  },
  {
    title: 'Building Your Support Network',
    tips: [
      'Identify 3-5 people you can reach out to',
      'Save crisis helpline numbers in your phone',
      'Practice what you\'ll say beforehand',
      'Consider joining support groups',
      'Schedule regular check-ins with trusted people',
    ],
  },
  {
    title: 'Daily Wellness Practices',
    tips: [
      'Start your day with 5 minutes of meditation',
      'Move your body for 30 minutes (walk, yoga, dance)',
      'Maintain a consistent sleep schedule',
      'Journal your thoughts and feelings',
      'Limit social media and screen time',
    ],
  },
];

export default function SafetyCenterPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <h1 className="text-4xl font-bold text-white">Safety Center</h1>
          </div>
          <p className="text-gray-400">Crisis resources and wellness strategies for when you need support</p>
        </div>

        {/* Crisis Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Immediate Crisis Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CRISIS_RESOURCES.map((resource, idx) => {
              const Icon = resource.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel border border-white/5 rounded-2xl p-6 hover:border-red-500/30 transition-all group"
                >
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${resource.color} bg-opacity-10 mb-4 inline-block group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{resource.description}</p>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-center">
                    <p className="text-sm font-mono text-teal-400">{resource.number}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Important Message */}
        <div className="glass-panel border border-amber-500/30 bg-amber-500/5 rounded-2xl p-8 mb-12">
          <div className="flex gap-4">
            <Heart className="w-8 h-8 text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">You Matter</h3>
              <p className="text-gray-300 mb-3">
                If you're experiencing thoughts of self-harm or suicide, please reach out to a crisis helpline immediately.
                These are trained professionals who want to help.
              </p>
              <p className="text-gray-400 text-sm italic">
                Your pain is temporary, but the help available is permanent. You deserve support.
              </p>
            </div>
          </div>
        </div>

        {/* Coping Strategies */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Coping Strategies & Wellness</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COPING_STRATEGIES.map((strategy, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15 }}
                className="glass-panel border border-white/5 rounded-2xl p-6 hover:border-teal-500/30 transition-all"
              >
                <h3 className="text-lg font-semibold text-white mb-4">{strategy.title}</h3>
                <ul className="space-y-3">
                  {strategy.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="flex gap-3">
                      <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0 mt-2" />
                      <span className="text-gray-300 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div className="mt-12 p-6 border-l-4 border-teal-500 bg-teal-500/5 rounded-lg">
          <p className="text-gray-300">
            <span className="font-semibold text-teal-400">Remember:</span> MindEase AI is a supportive tool, not a replacement for professional mental health care. 
            For serious concerns, please reach out to a licensed mental health professional or crisis service.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
