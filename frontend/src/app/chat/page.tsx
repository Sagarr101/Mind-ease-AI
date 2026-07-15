"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../lib/api';
import { IChatMessage } from '../../types';
import { Send, Trash2, Heart, RefreshCw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "I am feeling very stressed about work today.",
  "Can you help me reframe a negative thought?",
  "Suggest a quick mindfulness grounding exercise.",
  "I'm feeling lonely and just need someone to listen."
];

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.get<{ success: boolean; messages: IChatMessage[] }>('/api/chat/history');
      if (res.success) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: IChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTypingStart = () => {
      setIsTyping(true);
    };

    const handleTypingStop = () => {
      setIsTyping(false);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket]);

  // Autoscroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text || !socket) return;

    socket.emit('send_message', { content: text });
    if (textToSend === inputText) {
      setInputText('');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history? This cannot be undone.')) {
      return;
    }

    try {
      const res = await api.delete<{ success: boolean; message: string; welcomeMessage: IChatMessage }>('/api/chat/history');
      if (res.success) {
        setMessages([res.welcomeMessage]);
      }
    } catch (err) {
      console.error('Error clearing chat history:', err);
    }
  };

  const handleDownloadConversation = () => {
    if (messages.length === 0) return;

    let content = `# MindEase AI Therapist Chat Session\n`;
    content += `Exported on: ${new Date().toLocaleString()}\n`;
    content += `User: ${user?.username || 'Wellness Seeker'}\n\n`;
    content += `---\n\n`;

    messages.forEach((msg) => {
      const role = msg.sender === 'user' ? 'User' : 'MindEase Therapist';
      const time = new Date(msg.createdAt).toLocaleTimeString();
      const date = new Date(msg.createdAt).toLocaleDateString();
      content += `### [${date} ${time}] ${role}\n`;
      content += `${msg.content}\n\n`;
      if (msg.sentiment) {
        content += `*Sentiment: ${msg.sentiment}*\n\n`;
      }
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mindease_chat_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] max-w-5xl mx-auto rounded-3xl glass-panel border border-white/5 overflow-hidden shadow-2xl relative">
        
        {/* HEADER BAR */}
        <div className="px-6 py-4 glass-panel border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center">
              <Heart className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">MindEase AI Therapist</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-teal-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {isConnected ? 'Real-Time Link Protected' : 'Connection offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleDownloadConversation}
              disabled={messages.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 text-gray-400 hover:text-teal-400 hover:bg-teal-500/5 transition-all text-xs font-semibold disabled:opacity-50 disabled:pointer-events-none"
              title="Download Conversation"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Chat</span>
            </button>

            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs font-semibold"
              title="Clear Chat Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          </div>
        </div>

        {/* MESSAGES DISPLAY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingHistory ? (
            <div className="h-full flex items-center justify-center flex-col gap-3">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
              <p className="text-xs text-gray-500">Retrieving secure logs...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6 gap-2">
              <Heart className="w-12 h-12 text-teal-500/20" />
              <h4 className="text-sm font-bold text-gray-400">Establish dialogue link</h4>
              <p className="text-xs max-w-xs text-gray-500">Send a message or select a suggestion below to begin therapy consultation.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg._id || index}
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
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* TYPING LOADER */}
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start"
              >
                <div className="glass-card border-white/5 p-4 rounded-2xl rounded-bl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTION PANEL & CHIPS */}
        {messages.length <= 1 && !isTyping && (
          <div className="px-6 py-3 border-t border-white/5 shrink-0">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Suggested entry points</span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSendMessage(sug)}
                  className="text-xs px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-teal-500/30 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT INPUT CONTROLS */}
        <div className="p-4 bg-black/20 border-t border-white/5 shrink-0">
          <div className="flex gap-2.5 max-w-4xl mx-auto">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share what's on your mind... (e.g. 'I feel anxious today')"
              className="flex-1 px-4 py-3 rounded-xl glass-input text-sm"
              disabled={isTyping || !isConnected}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping || !isConnected}
              className="p-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
