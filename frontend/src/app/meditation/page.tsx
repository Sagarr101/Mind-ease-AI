"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { Heart, Play, Square, Trophy, CheckCircle, RefreshCw, Volume2, VolumeX, Wind, CloudRain, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GUIDES = [
  { id: 'sleep', title: "Deep Sleep Release", duration: 15, desc: "Soothe your nervous system and prepare your mind for deep restorative sleep.", theme: 'from-indigo-600/40 to-purple-600/20 border-indigo-500/30' },
  { id: 'breathing', title: "5-Min Quick Reset", duration: 5, desc: "A brief, powerful breathing pattern to release tension and clear mental fog.", theme: 'from-teal-600/40 to-emerald-600/20 border-teal-500/30' },
  { id: 'anxiety', title: "Anxiety Grounding Guide", duration: 10, desc: "Focus on somatic anchors to pull your thoughts away from fear and panic.", theme: 'from-sky-600/40 to-blue-600/20 border-sky-500/30' },
  { id: 'focus', title: "Productivity Morning Scan", duration: 12, desc: "Establish mental alignment and energize your focus for the day ahead.", theme: 'from-amber-600/40 to-orange-600/20 border-amber-500/30' }
];

export default function MeditationPage() {
  const { user } = useAuth();
  
  const [activeSession, setActiveSession] = useState<typeof GUIDES[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  // Audio Ambience Player State
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  const SOUNDS = [
    { id: 'ocean', label: 'Ocean Waves', icon: Waves, url: 'https://actions.google.com/sounds/v1/water/sea_waves.ogg' },
    { id: 'rain', label: 'Forest Rain', icon: CloudRain, url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
    { id: 'birds', label: 'Zen Garden', icon: Wind, url: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg' },
  ];

  const handleToggleSound = (soundId: string, url: string) => {
    if (playingSound === soundId) {
      if (audioObj) {
        audioObj.pause();
      }
      setPlayingSound(null);
    } else {
      if (audioObj) {
        audioObj.pause();
      }
      
      const audio = new Audio(url);
      audio.loop = true;
      audio.play().catch(err => console.log('Audio autoplay blocked:', err));
      
      setAudioObj(audio);
      setPlayingSound(soundId);
    }
  };

  // Terminate sounds on unmount
  useEffect(() => {
    return () => {
      if (audioObj) {
        audioObj.pause();
      }
    };
  }, [audioObj]);

  // Breath guide caption: "Inhale", "Hold", "Exhale"
  const [breathState, setBreathState] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Handle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
        
        // Paced breath cycle every 10 seconds: Inhale 4s, Hold 2s, Exhale 4s
        const totalCycleSeconds = (activeSession!.duration * 60 - secondsLeft) % 10;
        if (totalCycleSeconds < 4) {
          setBreathState('Inhale');
        } else if (totalCycleSeconds < 6) {
          setBreathState('Hold');
        } else {
          setBreathState('Exhale');
        }
      }, 1000);
    } else if (secondsLeft === 0 && isPlaying) {
      handleCompleteSession();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, secondsLeft, activeSession]);

  const handleStartSession = (guide: typeof GUIDES[0]) => {
    setActiveSession(guide);
    setSecondsLeft(guide.duration * 60); // convert to seconds
    setIsPlaying(true);
    setShowCompletion(false);
    setBreathState('Inhale');
  };

  const handleCompleteSession = async () => {
    if (!activeSession) return;
    
    setIsPlaying(false);
    setIsLogging(true);

    try {
      const res = await api.post<{ success: boolean }>('/api/meditation', {
        title: activeSession.title,
        durationMinutes: activeSession.duration
      });
      if (res.success) {
        setShowCompletion(true);
      }
    } catch (err) {
      console.error('Error logging meditation session:', err);
    } finally {
      setIsLogging(false);
      setActiveSession(null);
    }
  };

  const handleQuitSession = () => {
    if (window.confirm('Do you want to end this relaxation session early? Your progress will not be logged.')) {
      setIsPlaying(false);
      setActiveSession(null);
    }
  };

  // Helper to format remaining time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-8 h-full">
        
        {/* HEADER */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Meditation Center
          </h2>
          <p className="text-gray-400 text-sm">
            Tune out the noise. Select a guided mindfulness session to restore focus and lower heart rates.
          </p>
        </div>

        <AnimatePresence mode="wait">
          
          {/* 1. COMPLETION COMPONENT */}
          {showCompletion && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 rounded-3xl glass-panel text-center flex flex-col items-center justify-center gap-5 border border-teal-500/20 shadow-2xl py-16"
            >
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10 mb-2 animate-bounce">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold text-white">Namaste, seeker</h3>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                You have successfully completed your meditation guide. Your relaxation logs have been secured in your wellness timeline.
              </p>
              <button
                onClick={() => setShowCompletion(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl text-white font-semibold text-xs hover:scale-105 active:scale-95 transition-all shadow-md mt-4"
              >
                Return to Center
              </button>
            </motion.div>
          )}

          {/* 2. TIMER SCREEN VIEW */}
          {activeSession && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 rounded-3xl glass-panel border border-white/5 shadow-2xl flex flex-col items-center justify-center gap-8 py-14"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1">{activeSession.title}</h3>
                <span className="text-xs text-teal-400 font-semibold tracking-widest uppercase">{activeSession.duration} Mins Session</span>
              </div>

              {/* PACING BREATH GUIDE ANIMATION */}
              <div className="relative w-52 h-52 flex items-center justify-center">
                {/* Expands & Contracts depending on breath stage */}
                <motion.div 
                  animate={{
                    scale: breathState === 'Inhale' ? 1.5 : breathState === 'Hold' ? 1.5 : 1,
                  }}
                  transition={{ 
                    duration: breathState === 'Hold' ? 2 : 4,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-4 rounded-full bg-gradient-to-tr from-teal-500/20 to-indigo-500/25 border border-teal-400/30 blur-[2px]"
                />
                
                {/* Inner Static circle */}
                <div className="w-36 h-36 rounded-full glass-panel border border-white/10 flex flex-col items-center justify-center z-10 shadow-2xl">
                  <span className="text-2xl font-bold text-white tracking-widest font-mono select-none">
                    {formatTime(secondsLeft)}
                  </span>
                  
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mt-1.5 select-none">
                    {breathState}
                  </span>
                </div>
              </div>

              {/* CONTROL BUTTONS */}
              <div className="flex gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-all flex items-center gap-2"
                >
                  <Play className={`w-3.5 h-3.5 ${isPlaying ? 'opacity-40' : 'text-teal-400'}`} />
                  <span>{isPlaying ? 'Pause Guide' : 'Resume Guide'}</span>
                </button>
                <button
                  onClick={handleQuitSession}
                  className="px-5 py-2.5 rounded-xl border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-red-400 font-semibold text-xs transition-all flex items-center gap-2"
                >
                  <Square className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span>Quit Session</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. CATALOG LIST VIEW */}
          {!activeSession && !showCompletion && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {GUIDES.map((g) => (
                <div 
                  key={g.id} 
                  className={`p-6 rounded-3xl border glass-panel bg-gradient-to-br ${g.theme} flex flex-col justify-between gap-5`}
                >
                  <div>
                    <h3 className="text-lg font-bold text-white">{g.title}</h3>
                    <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block mt-0.5">{g.duration} Minutes</span>
                    <p className="text-xs text-gray-400 leading-relaxed mt-3">{g.desc}</p>
                  </div>
                  
                  <button
                    onClick={() => handleStartSession(g)}
                    disabled={isLogging}
                    className="w-full py-3 bg-white/5 border border-white/10 hover:border-teal-500/30 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-inner"
                  >
                    <Play className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
                    <span>Begin Session</span>
                  </button>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>

        {/* NATURE AMBIENT PLAYER WIDGET */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-400" />
              <span>Nature Ambience Loops</span>
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Complement your breathing cycles with relaxing background noises.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SOUNDS.map((snd) => {
              const Icon = snd.icon;
              const isCurrent = playingSound === snd.id;
              return (
                <button
                  key={snd.id}
                  type="button"
                  onClick={() => handleToggleSound(snd.id, snd.url)}
                  className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border-teal-500 text-white shadow-lg' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-teal-400' : 'text-gray-400'}`} />
                    <span>{snd.label}</span>
                  </div>
                  {isCurrent ? <Volume2 className="w-4.5 h-4.5 text-teal-400 animate-pulse" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
