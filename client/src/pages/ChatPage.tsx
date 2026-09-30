import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  MessageSquareText,
  Send,
  Plus,
  Trash2,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Calendar,
  Languages,
} from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  language: 'en' | 'hi';
  updatedAt: string;
  lastMessage?: string | null;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const ChatPage: React.FC = () => {
  const { t, language: currentLang } = useLanguage();
  const { error } = useToast();
  const location = useLocation();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatLang, setChatLang] = useState<'en' | 'hi'>(currentLang);
  const [useFarmContext, setUseFarmContext] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions
  const samplePrompts = [
    t('sampleQ1'),
    t('sampleQ2'),
    t('sampleQ3'),
    t('sampleQ4'),
  ];

  const fetchSessions = async (targetSessionId?: string) => {
    try {
      const res = await api.get('/chat/sessions');
      const fetched: ChatSession[] = res.data.sessions || [];
      setSessions(fetched);

      if (targetSessionId) {
        setActiveSessionId(targetSessionId);
      } else if (fetched.length > 0 && !activeSessionId) {
        setActiveSessionId(fetched[0].id);
      }
    } catch {
      // Ignore initial load error
    }
  };

  useEffect(() => {
    const passedSessionId = (location.state as any)?.sessionId;
    fetchSessions(passedSessionId);
  }, [location.state]);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) return;
    setLoadingMessages(true);

    api
      .get(`/chat/sessions/${activeSessionId}/messages`)
      .then((res) => {
        setMessages(res.data.messages || []);
      })
      .catch((err) => {
        error('Chat Load Error', err.response?.data?.error || 'Failed to load conversation');
      })
      .finally(() => setLoadingMessages(false));
  }, [activeSessionId]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Handle passed initial query if any
  useEffect(() => {
    const initialQuery = (location.state as any)?.initialQuery;
    if (initialQuery) {
      handleCreateNewSession(initialQuery);
    }
  }, [location.state]);

  const handleCreateNewSession = async (presetText?: string) => {
    try {
      const res = await api.post('/chat/sessions', {
        title: presetText ? presetText.slice(0, 30) : undefined,
        language: chatLang,
      });
      const newSession = res.data.session;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);

      if (presetText) {
        sendMessage(newSession.id, presetText);
      }
    } catch (err: any) {
      error('Error', 'Could not create new consultation session');
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;

    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
        setMessages([]);
      }
    } catch (err: any) {
      error('Error', 'Could not delete chat session');
    }
  };

  const sendMessage = async (sessionId: string, text: string) => {
    if (!text.trim() || sending) return;

    const trimmed = text.trim();
    setInputText('');
    setSending(true);

    // Optimistic UI push for user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/chat/sessions/${sessionId}/messages`, {
        content: trimmed,
        language: chatLang,
        useFarmContext,
      });

      const { userMessage, assistantMessage } = res.data;

      // Replace optimistic message with confirmed server message & append assistant reply
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        userMessage,
        assistantMessage,
      ]);

      // Update session title in sidebar
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, lastMessage: trimmed, updatedAt: new Date().toISOString() }
            : s
        )
      );
    } catch (err: any) {
      error('Message Failed', err.response?.data?.error || 'Agronomist AI could not reply at this time.');
      // Remove temporary message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!activeSessionId) {
      handleCreateNewSession(inputText);
    } else {
      sendMessage(activeSessionId, inputText);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-emerald-600" />
            {t('chatTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{t('chatSubtitle')}</p>
        </div>

        {/* Controls: Language and Context toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useFarmContext}
              onChange={(e) => setUseFarmContext(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>{t('useFarmContext')}</span>
          </label>

          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setChatLang('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                chatLang === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setChatLang('hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                chatLang === 'hi' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleCreateNewSession()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('newChatBtn')}
          </button>
        </div>
      </div>

      {/* Main Chat Workspace: Sessions Sidebar + Chat Thread */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 min-h-0">
        {/* Sessions Sidebar (Desktop) */}
        <div className="hidden md:flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-400">
            Consultation Threads ({sessions.length})
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs truncate">{s.title}</p>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                      {s.language === 'hi' ? '🇮🇳 हिन्दी' : '🇬🇧 EN'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    className="p-1 text-slate-300 hover:text-red-600 rounded transition opacity-0 group-hover:opacity-100"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Conversation Pane */}
        <div className="md:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && !loadingMessages ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Bot className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    CropPilot AI Agronomist is Ready
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Ask questions about plant diseases, bio-fertilizer recipes, weed control, or seasonal planting schedules.
                  </p>
                </div>

                {/* Prompt Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full pt-4">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!activeSessionId) {
                          handleCreateNewSession(p);
                        } else {
                          sendMessage(activeSessionId, p);
                        }
                      }}
                      className="p-2.5 text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 rounded-xl border border-slate-200 transition"
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        isAssistant
                          ? 'bg-slate-50 text-slate-900 border border-slate-200/90 shadow-2xs font-normal'
                          : 'bg-emerald-600 text-white font-medium shadow-xs'
                      }`}
                    >
                      {m.content}
                    </div>

                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        U
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></div>
                  Agronomist is formulating expert response...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 sm:p-4 bg-slate-50/80 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('chatPlaceholder')}
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm bg-white shadow-inner transition"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition flex-shrink-0"
              title={t('sendMessage')}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
