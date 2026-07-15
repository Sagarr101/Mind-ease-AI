"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { INotification } from '../../types';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Heart, 
  BarChart3, 
  FileText, 
  LogOut, 
  Flame, 
  Bell, 
  Menu, 
  X,
  Check,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Therapist', path: '/chat', icon: MessageSquare },
  { label: 'Mood Tracker', path: '/mood', icon: Calendar },
  { label: 'Journal', path: '/journal', icon: BookOpen },
  { label: 'Meditation Center', path: '/meditation', icon: Heart },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Wellness Reports', path: '/reports', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get<{ success: boolean; notifications: INotification[] }>('/api/notification');
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 45 seconds
      const interval = setInterval(fetchNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // If loading or no user, redirect to login (safeguard)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Sync user theme preference
  useEffect(() => {
    if (user && user.settings && user.settings.theme) {
      if (user.settings.theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await api.put<{ success: boolean; notification: INotification }>(`/api/notification/${id}/read`, {});
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put<{ success: boolean; message: string }>('/api/notification/mark-all-read', {});
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090e12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Restoring wellness space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090e12] text-[#f3f4f6] flex flex-col md:flex-row relative">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[150px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-white/5 py-6 px-4 z-20 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-indigo-300 bg-clip-text text-transparent">MindEase AI</span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 border-l-4 border-teal-500 text-white font-medium shadow-md shadow-teal-500/5' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-gray-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER PROFILE INFO */}
        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border border-white/10 uppercase">
              {user.username.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 glass-panel border-b border-white/5 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-teal-400 to-indigo-300 bg-clip-text text-transparent">MindEase</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* STREAK */}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-500">{user.streak.current}d</span>
          </div>

          {/* MOBILE NOTIFICATION TOGGLE */}
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full animate-ping"></span>}
          </button>

          {/* MENU BUTTON */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU NAVIGATION */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-[57px] left-0 right-0 glass-panel border-b border-white/5 flex flex-col p-4 z-20 space-y-2 shadow-2xl"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 border-l-4 border-teal-500 text-white font-medium' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold uppercase text-xs">
                  {user.username.charAt(0)}
                </div>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/5 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT SIDE MAIN CONTENT LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* DESKTOP HEADER */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 glass-panel border-b border-white/5 z-10 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {NAV_ITEMS.find(n => n.path === pathname)?.label || 'MindEase Space'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* WELLNESS STREAK */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full shadow-inner">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-sm font-bold text-amber-500">{user.streak.current} Day Streak</span>
            </div>

            {/* NOTIFICATION DROP-DOWN */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 relative transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-teal-500 rounded-full border-2 border-[#090e12] animate-bounce"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    {/* Backdrop cover click handler */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-80 glass-panel border border-white/10 rounded-2xl shadow-2xl p-4 z-50"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                        <span className="font-semibold text-sm">Notifications ({unreadCount})</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-center text-xs text-gray-500 py-6">No new notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n._id} 
                              className={`p-2.5 rounded-xl border text-xs transition-all relative ${
                                n.read 
                                  ? 'bg-transparent border-white/5 text-gray-400' 
                                  : 'bg-white/5 border-white/10 text-white font-medium'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <span className="font-bold">{n.title}</span>
                                {!n.read && (
                                  <button 
                                    onClick={() => handleMarkAsRead(n._id)}
                                    className="p-0.5 hover:bg-white/10 rounded text-teal-400"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="leading-relaxed pr-3">{n.message}</p>
                              <span className="text-[10px] text-gray-500 block mt-1">
                                {new Date(n.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* SEPARATING HEADER BAR */}
            <div className="w-px h-6 bg-white/5"></div>

            {/* USER ICON */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white uppercase text-sm border border-white/10 shadow-inner">
                {user.username.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-white">{user.username}</span>
            </div>
          </div>
        </header>

        {/* PAGE BODY VIEW */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};
