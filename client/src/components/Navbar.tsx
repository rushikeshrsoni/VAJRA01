import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { LanguageToggle } from './LanguageToggle.js';
import {
  LayoutDashboard,
  Sprout,
  ShieldAlert,
  FileSpreadsheet,
  MessageSquareText,
  History,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/farms', label: t('navFarms'), icon: Sprout },
    { to: '/diagnose', label: t('navDiagnose'), icon: ShieldAlert },
    { to: '/advice', label: t('navAdvice'), icon: FileSpreadsheet },
    { to: '/chat', label: t('navChat'), icon: MessageSquareText },
    { to: '/history', label: t('navHistory'), icon: History },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                CropPilot <span className="text-emerald-600 font-black">AI</span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> PRO
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageToggle />

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/profile'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title={user.fullName}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate hidden md:inline text-xs font-semibold">
                    {user.fullName.split(' ')[0]}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                  title={t('navLogout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <LanguageToggle compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-1 shadow-xl animate-fade-in">
          {user ? (
            <>
              <div className="p-3 mb-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-emerald-950 truncate">{user.fullName}</p>
                  <p className="text-xs text-emerald-700 truncate">{user.email}</p>
                </div>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <User className="w-5 h-5 flex-shrink-0" />
                {t('navProfile')}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 mt-2"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {t('navLogout')}
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                {t('navLogin')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                {t('navRegister')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
