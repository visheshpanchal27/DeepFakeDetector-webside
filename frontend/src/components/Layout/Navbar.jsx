import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, ScanSearch, History, Settings, LogOut, Bot, User, Sparkles, ChevronDown, Menu, X, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  const NavLink = ({ to, children, className = '', onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`${className} ${isActiveRoute(to) ? 'text-blue-600 bg-blue-50' : ''}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className={`bg-white/80 backdrop-blur-md shadow-xl border-b border-white/20 sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-2xl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                <Bot className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">DeepFake</span>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium -mt-1">
                  <ScanSearch className="w-3 h-3" />
                  <span>Advanced AI Detection</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/50 ${isActiveRoute('/dashboard') ? 'scale-110 shadow-blue-500/50' : ''}`}>
                    <LayoutDashboard className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="relative">Dashboard</span>
                  {isActiveRoute('/dashboard') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
                </NavLink>
                
                <NavLink to="/analyze" className="relative flex items-center gap-2 text-gray-700 hover:text-purple-600 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/50 ${isActiveRoute('/analyze') ? 'scale-110 shadow-purple-500/50' : ''}`}>
                    <ScanSearch className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="relative">Analyze</span>
                  {isActiveRoute('/analyze') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></div>}
                </NavLink>
                
                <NavLink to="/history" className="relative flex items-center gap-2 text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-emerald-500/50 ${isActiveRoute('/history') ? 'scale-110 shadow-emerald-500/50' : ''}`}>
                    <History className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="relative">History</span>
                  {isActiveRoute('/history') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>}
                </NavLink>

                
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-4 py-2.5 rounded-xl text-base font-bold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group ${showUserMenu ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600' : ''}`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all ${showUserMenu ? 'scale-105 shadow-xl' : 'group-hover:scale-105'}`}>
                      <span className="text-white text-base font-bold">
                        {(user?.display_name || user?.email)?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden lg:block">{user?.display_name || user?.name || user?.email?.split('@')[0] || 'User'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl py-2 z-50 border border-white/20 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {(user?.display_name || user?.email)?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.display_name || user?.name || user?.email?.split('@')[0] || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate" title={user?.email}>{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link to="/settings" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group" onClick={() => setShowUserMenu(false)}>
                          <Settings className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group">
                          <LogOut className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink to="/#features" className="relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 group">
                  <span>Features</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"></div>
                </NavLink>
                <NavLink to="/#how-it-works" className="relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 group">
                  <span>How It Works</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"></div>
                </NavLink>
                <NavLink to="/#performance" className="relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 group">
                  <span>Performance</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"></div>
                </NavLink>
                <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-3"></div>
                <Link to="/login" className="relative text-gray-700 hover:text-blue-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center space-x-2 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform relative z-10" />
                  <span className="relative z-10">Sign In</span>
                </Link>
                <Link to="/register" className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center space-x-2 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity"></div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Sparkles className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />
                  <span className="relative z-10">Get Started</span>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="relative text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 group"
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"></div>
              {isOpen ? 
                <X className="w-6 h-6 relative z-10 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" /> : 
                <Menu className="w-6 h-6 relative z-10 transform rotate-0 group-hover:rotate-180 transition-transform duration-300" />
              }
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="px-4 pt-4 pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all" onClick={() => setIsOpen(false)}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <LayoutDashboard className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  Dashboard
                </Link>
                <Link to="/analyze" className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all" onClick={() => setIsOpen(false)}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <ScanSearch className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  Analyze
                </Link>
                <Link to="/history" className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all" onClick={() => setIsOpen(false)}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 flex items-center justify-center shadow-lg">
                    <History className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  History
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-xl transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <LogOut className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/#features" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md" onClick={() => setIsOpen(false)}>
                  <Sparkles className="w-4 h-4" />
                  Features
                </Link>
                <Link to="/#how-it-works" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md" onClick={() => setIsOpen(false)}>
                  <Settings className="w-4 h-4" />
                  How It Works
                </Link>
                <Link to="/#performance" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md" onClick={() => setIsOpen(false)}>
                  <BarChart3 className="w-4 h-4" />
                  Performance
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md" onClick={() => setIsOpen(false)}>
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
                <Link to="/register" className="flex items-center gap-2 px-3 py-2 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-md" onClick={() => setIsOpen(false)}>
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;