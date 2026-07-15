"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { IUser } from '../../types';
import { User, Mail, Lock, Settings, Moon, Sun, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  // Profile Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference states
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [reminders, setReminders] = useState(true);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setTheme(user.settings?.theme || 'dark');
      setReminders(user.settings?.remindersEnabled !== false);
    }
  }, [user]);

  // Handle theme changes instantly on click
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // Apply changes locally to browser root
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (password && password.length < 6) {
      setProfileError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setProfileError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.put<{ success: boolean; user: IUser }>('/api/auth/profile', {
        username,
        email,
        password: password || undefined,
        settings: {
          theme,
          remindersEnabled: reminders,
        },
      });

      if (res.success) {
        updateUser(res.user);
        setProfileSuccess(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="w-7 h-7 text-teal-400 animate-spin-slow" />
            <span>Profile & Account Settings</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Manage your credentials, theme configuration, and wellness reminder preferences.
          </p>
        </div>

        {profileSuccess && (
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}
        {profileError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* PROFILE UPDATE FORM */}
          <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white">SaaS User Profile</h3>
            
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">New Password (Optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-xs transition-all duration-300 shadow-md active:scale-99 disabled:opacity-50"
              >
                {isSubmitting ? "Securing Preferences..." : "Save Settings"}
              </button>
            </form>
          </div>

          {/* APPLICATION CONFIGURATIONS */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white">App Configurations</h3>

            {/* THEME TOGGLE */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Color Mode</span>
              <div className="grid grid-cols-2 gap-2 bg-black/45 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-teal-500/30 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    theme === 'light' 
                      ? 'bg-white/10 text-white shadow' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* NOTIFICATION PREFERENCES */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Reminders</span>
              
              <div className="flex items-center justify-between p-3.5 bg-black/25 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-gray-400" />
                  <div>
                    <span className="text-xs text-white font-bold block">Wellness Audits</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Remind me to log daily streak</span>
                  </div>
                </div>
                
                {/* Switch checkbox */}
                <button
                  type="button"
                  onClick={() => setReminders(!reminders)}
                  className={`w-10 h-5.5 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center ${
                    reminders ? 'bg-teal-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <motion.div 
                    layout
                    className="w-3.5 h-3.5 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
