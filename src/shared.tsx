// src/shared.tsx
import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiCloud, FiTerminal, FiArrowRight, FiGithub, FiCheckCircle, FiZap, 
  FiChevronUp, FiChevronLeft, FiChevronRight, FiBox, 
  FiActivity, FiCreditCard, FiCommand, FiSettings, FiUser, FiChevronDown,
  FiLogIn, FiUserPlus, FiLock, FiLoader as FiLoaderIcon,
  FiAlertCircle, FiInfo, FiServer
} from 'react-icons/fi';

// -------------------- TOAST --------------------
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const ToastContext = createContext<{
  addToast: (type: Toast['type'], message: string) => void;
} | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[300] space-y-2">
        {toasts.map(toast => (
          <motion.div key={toast.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {toast.type === 'success' && <FiCheckCircle />}
            {toast.type === 'error' && <FiAlertCircle />}
            {toast.type === 'info' && <FiInfo />}
            <span className="text-sm">{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// -------------------- PAYSTACK --------------------
declare global {
  interface Window { PaystackPop: any; }
}
const loadPaystackScript = (): Promise<void> => new Promise((resolve) => {
  if (window.PaystackPop) { resolve(); return; }
  const script = document.createElement('script');
  script.src = 'https://js.paystack.co/v1/inline.js';
  script.onload = () => resolve();
  document.body.appendChild(script);
});
const PAYSTACK_PUBLIC_KEY = 'pk_test_a2f79913f3b3607234f0aad0b6a1a69407021899'; // Replace with your key
export interface PaystackOptions {
  email: string;
  amount: number;
  currency?: 'NGN' | 'USD';
  metadata?: Record<string, any>;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}
export const initializePaystack = async (options: PaystackOptions) => {
  await loadPaystackScript();
  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: options.email,
    amount: options.amount,
    currency: options.currency || 'NGN',
    metadata: options.metadata,
    callback: (response: { reference: string; status: string }) => {
      if (response.status === 'success') options.onSuccess(response.reference);
      else options.onCancel();
    },
    onClose: () => options.onCancel(),
  });
  handler.openIframe();
};

// -------------------- API --------------------
export const API_BASE = 'https://pkluster.online/api';
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers as Record<string, string> };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API request failed');
  return data;
}
export async function updateUserProfile(data: { name?: string; email?: string }) {
  return apiRequest('/user/profile', { method: 'PUT', body: JSON.stringify(data) });
}
export async function changePassword(oldPassword: string, newPassword: string) {
  return apiRequest('/user/password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) });
}

// -------------------- EXCHANGE RATE --------------------
interface ExchangeRateState { rate: number | null; loading: boolean; error: string | null; lastUpdated: Date | null; }
const CACHE_KEY = 'usd_ngn_rate', CACHE_TIMESTAMP_KEY = 'usd_ngn_rate_ts', CACHE_DURATION = 5 * 60 * 1000;
export function useExchangeRate() {
  const [state, setState] = useState<ExchangeRateState>({ rate: null, loading: true, error: null, lastUpdated: null });
  const fetchRate = useCallback(async () => {
    const cachedRate = localStorage.getItem(CACHE_KEY), cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (cachedRate && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp) < CACHE_DURATION)) {
      setState({ rate: parseFloat(cachedRate), loading: false, error: null, lastUpdated: new Date(parseInt(cachedTimestamp)) });
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await res.json();
      const rate = data.rates['NGN'];
      if (!rate) throw new Error('NGN rate not found');
      localStorage.setItem(CACHE_KEY, rate.toString());
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      setState({ rate, loading: false, error: null, lastUpdated: new Date() });
    } catch { setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch exchange rate' })); }
  }, []);
  useEffect(() => { fetchRate(); const interval = setInterval(fetchRate, CACHE_DURATION); return () => clearInterval(interval); }, [fetchRate]);
  return state;
}

// -------------------- CURRENCY --------------------
export type DisplayCurrency = 'USD' | 'NGN' | 'BOTH';
export function formatMoneyUSD(cents: number) { return `$${(cents / 100).toFixed(2)}`; }
export function formatMoneyNGN(cents: number, rate: number | null) { return rate ? `₦${((cents * rate) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '₦???'; }
export function formatMoney(cents: number, rate: number | null, display: DisplayCurrency) {
  const usd = formatMoneyUSD(cents);
  if (display === 'USD') return usd;
  if (display === 'NGN') return formatMoneyNGN(cents, rate);
  return `${usd} (${formatMoneyNGN(cents, rate)})`;
}
export const CurrencyToggle = ({ display, setDisplay }: { display: DisplayCurrency; setDisplay: (d: DisplayCurrency) => void }) => (
  <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
    <button onClick={() => setDisplay('USD')} className={`px-3 py-1 rounded-md text-sm transition ${display === 'USD' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>USD</button>
    <button onClick={() => setDisplay('NGN')} className={`px-3 py-1 rounded-md text-sm transition ${display === 'NGN' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>NGN</button>
    <button onClick={() => setDisplay('BOTH')} className={`px-3 py-1 rounded-md text-sm transition ${display === 'BOTH' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Both</button>
  </div>
);

// -------------------- LOADER --------------------
export const Loader = ({ size = "w-8 h-8", color = "text-blue-500" }: { size?: string; color?: string }) => (
  <div className="flex justify-center items-center"><FiLoaderIcon className={`animate-spin ${size} ${color}`} /></div>
);

// -------------------- AUTH CONTEXT --------------------
export interface User {
  id: string; email: string; name: string; avatar?: string; provider: 'github' | 'email';
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean; // <-- NEW: loading state
  setUser: (user: User | null) => void;
  loginWithGitHub: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  pendingAction: (() => void) | null;
  executePendingAction: () => void;
  setPendingAction: (action: (() => void) | null) => void;
  refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; };

// Auth Modal
const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, loginWithGitHub, pendingAction, executePendingAction } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try { await loginWithGitHub(); addToast('success', 'Logged in successfully'); if (pendingAction) executePendingAction(); setShowAuthModal(false); }
    catch { addToast('error', 'GitHub login failed'); } finally { setIsLoading(false); }
  };
  const handleEmailSignIn = () => { setShowAuthModal(false); navigate('/signin'); };
  const handleSignUp = () => { setShowAuthModal(false); navigate('/signup'); };
  if (!showAuthModal) return null;
  return createPortal(
    // REMOVED onClick from the backdrop to prevent closing on outside click
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"><FiLock className="w-8 h-8 text-white" /></div>
          <h3 className="text-xl font-bold mb-2">Access Resources</h3>
          <p className="text-gray-400 text-sm mb-6">Please sign in to access detailed documentation, API keys, and cluster management.</p>
          <button onClick={handleGitHubLogin} disabled={isLoading} className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2 transition disabled:opacity-50">
            {isLoading ? <Loader size="w-5 h-5" /> : <FiGithub className="w-5 h-5" />} Continue with GitHub
          </button>
          <div className="relative my-4 w-full"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div><div className="relative flex justify-center text-xs"><span className="bg-gray-900 px-2 text-gray-500">or</span></div></div>
          <button onClick={handleEmailSignIn} className="w-full border border-gray-700 rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition"><FiLogIn className="w-5 h-5" /> Sign in with Email</button>
          <button onClick={handleSignUp} className="w-full mt-3 text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1 transition"><FiUserPlus className="w-4 h-4" /> Create a new account</button>
          <button
            onClick={() => { setShowAuthModal(false); navigate('/signin'); }}
            className="mt-4 text-sm text-gray-500 hover:text-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // <-- NEW loading state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('auth_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // invalid JSON – clear storage
        localStorage.removeItem('auth_user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false); // loading complete
  }, []);

  const loginWithGitHub = async () => { window.location.href = `${API_BASE}/auth/github`; };
  const loginWithEmail = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
  };
  const signupWithEmail = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    localStorage.setItem('token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
  };
  const refreshUser = async () => {
    try { const data = await apiRequest('/user/profile'); const updatedUser = { ...user, ...data }; localStorage.setItem('auth_user', JSON.stringify(updatedUser)); setUser(updatedUser); }
    catch (err) { console.error('Failed to refresh user', err); }
  };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('auth_user'); setUser(null); };
  const executePendingAction = () => { if (pendingAction) { pendingAction(); setPendingAction(null); } };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      setUser,
      loginWithGitHub,
      loginWithEmail,
      signupWithEmail,
      logout,
      showAuthModal,
      setShowAuthModal,
      pendingAction,
      executePendingAction,
      setPendingAction,
      refreshUser
    }}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
};

export const useRequireAuth = () => {
  const { isAuthenticated, setShowAuthModal, setPendingAction } = useAuth();
  const { addToast } = useToast();
  const requireAuth = (action: () => void) => {
    if (isAuthenticated) action();
    else { setPendingAction(() => action); setShowAuthModal(true); addToast('info', 'Please sign in to continue'); }
  };
  return { requireAuth, isAuthenticated };
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, setShowAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Only show the modal if loading is finished and user is not authenticated
    if (!loading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [loading, isAuthenticated, setShowAuthModal, location.pathname]);

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader size="w-12 h-12" /></div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};

// -------------------- GITHUB CALLBACK --------------------
export const GitHubCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (location.pathname !== '/auth/callback' || processed.current) return;

    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem('token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        setUser(user);
        addToast('success', 'Logged in with GitHub');
        processed.current = true;
        navigate('/dashboard', { replace: true });
      } catch (err) {
        addToast('error', 'Invalid user data');
        navigate('/signin', { replace: true });
      }
    } else {
      addToast('error', 'GitHub login failed – missing token or user data');
      navigate('/signin', { replace: true });
    }
  }, [navigate, addToast, setUser, location.pathname, searchParams]);

  if (location.pathname !== '/auth/callback') return null;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader size="w-12 h-12" />
    </div>
  );
};

// -------------------- PARTICLES --------------------
export const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animationId: number;
    let particles: Array<{ x: number; y: number; radius: number; alpha: number; speedX: number; speedY: number }> = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); };
    const initParticles = () => {
      particles = [];
      const count = Math.min(150, Math.floor(window.innerWidth * 0.1));
      for (let i = 0; i < count; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2 + 0.5, alpha: Math.random() * 0.5 + 0.1, speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.2 });
      }
    };
    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`; ctx.fill();
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      });
      animationId = requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize); resize(); draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationId); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ background: '#0a0a0f' }} />;
};

// -------------------- ANIMATED CODE --------------------
export const AnimatedCode = ({ lines, className = '' }: { lines: string[]; className?: string }) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  useEffect(() => { lines.forEach((_, idx) => setTimeout(() => setVisibleLines(prev => [...prev, idx]), idx * 150)); }, [lines]);
  return (
    <div className={`font-mono text-sm ${className}`}>
      {lines.map((line, idx) => (
        <div key={idx} className={`transition-all duration-300 ease-out transform ${visibleLines.includes(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <span className="text-gray-500 select-none mr-4">{String(idx + 1).padStart(2, '0')}</span>
          <span className="text-blue-400">{line}</span>
        </div>
      ))}
    </div>
  );
};

// -------------------- NAVBAR --------------------
export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { addToast } = useToast();
  useEffect(() => { const handleScroll = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []);
  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') { window.location.href = `/#${id}`; return; }
    const element = document.getElementById(id); if (element) element.scrollIntoView({ behavior: 'smooth' });
  };
  const isHome = location.pathname === '/';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleLogout = () => { logout(); addToast('success', 'Logged out successfully'); setDropdownOpen(false); };
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/90 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><FiCloud className="text-white" /></div>
          <span className="font-bold text-xl tracking-tight">PCLOUDs</span>
          <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full ml-2">pKlusters</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-gray-300">
          <Link to="/" className="hover:text-white transition">Clusters</Link>
          {isHome ? <button onClick={() => scrollToSection('features')} className="hover:text-white transition cursor-pointer">Features</button> : <Link to="/#features" className="hover:text-white transition">Features</Link>}
          {isHome ? <button onClick={() => scrollToSection('cli')} className="hover:text-white transition cursor-pointer">CLI</button> : <Link to="/#cli" className="hover:text-white transition">CLI</Link>}
          {isHome ? <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition cursor-pointer">Pricing</button> : <Link to="/#pricing" className="hover:text-white transition">Pricing</Link>}
          <a href="#" className="hover:text-white transition">Docs</a>
          {/* Only show Dashboard link if authenticated */}
          {isAuthenticated && <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 text-gray-300 hover:text-white focus:outline-none">
                <span className="text-sm">{user?.name}</span><FiChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-20">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={() => setDropdownOpen(false)}><FiUser className="inline mr-2" /> Profile</Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={() => setDropdownOpen(false)}><FiSettings className="inline mr-2" /> Settings</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin" className="text-gray-300 hover:text-white px-3 py-1.5 rounded-md transition">Sign in</Link>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-md font-medium transition shadow-lg shadow-blue-600/20">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// -------------------- FOOTER --------------------
export const Footer = () => (
  <footer className="bg-gray-950 border-t border-gray-800 pt-16 pb-8 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><FiCloud className="text-white" /></div>
            <span className="font-bold text-xl">PCLOUDs</span>
          </div>
          <p className="text-gray-500 text-sm max-w-xs">Building Africa's default infrastructure platform for developers and startups.</p>
          {/* Social icons removed */}
        </div>
        <div>
          <h4 className="font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link to="/domains" className="hover:text-gray-300">Domains</Link></li>
            <li><Link to="/hosting" className="hover:text-gray-300">Hosting</Link></li>
            <li><Link to="/api-marketplace" className="hover:text-gray-300">API Marketplace</Link></li>
            <li><Link to="/library" className="hover:text-gray-300">Library</Link></li>
            <li><a href="#" className="hover:text-gray-300">CLI</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Developers</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-gray-300">Documentation</a></li>
            <li><a href="#" className="hover:text-gray-300">API Reference</a></li>
            <li><a href="#" className="hover:text-gray-300">Status</a></li>
            <li><a href="#" className="hover:text-gray-300">GitHub</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-gray-300">About</a></li>
            <li><a href="#" className="hover:text-gray-300">Blog</a></li>
            <li><a href="#" className="hover:text-gray-300">Careers</a></li>
            <li><a href="#" className="hover:text-gray-300">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-600">&copy; 2025 PCLOUDs — Empowering African developers. All rights reserved.</div>
    </div>
  </footer>
);

// -------------------- SCROLL TO TOP --------------------
export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { const toggle = () => setIsVisible(window.scrollY > 500); window.addEventListener('scroll', toggle); return () => window.removeEventListener('scroll', toggle); }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={scrollToTop} className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg shadow-blue-600/20 transition-all">
          <FiChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// -------------------- HOMEPAGE SECTIONS (unchanged) --------------------
export const HeroKlusters = () => {
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const codeLines = ['pkluster create my-infra --region africa-west', 'pkluster add resource --type server --provider aws', 'pkluster add resource --type domain --name myapp.com', 'pkluster status', '✅ Cluster healthy | 4 resources | 99.99% uptime'];
  const handleCreateCluster = () => requireAuth(() => { addToast('info', 'Redirecting to dashboard...'); navigate('/dashboard'); });
  const handleCliHelp = () => requireAuth(() => addToast('info', 'pkluster --help\nAvailable commands: create, add, status, logs, delete'));
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg viewBox="0 0 1000 500" className="absolute right-[-200px] top-[-50px] w-[1200px]">
          <g stroke="#3b82f6" strokeWidth="1.2" fill="none" strokeDasharray="4 8">
            <path d="M120 200 Q300 100 480 180 T840 160" /><path d="M200 260 Q400 320 600 250 T900 300" /><path d="M150 120 Q350 200 520 140 T880 200" />
          </g>
          <g fill="#3b82f6"><circle cx="300" cy="180" r="4" /><circle cx="520" cy="140" r="4" /><circle cx="680" cy="260" r="4" /><circle cx="820" cy="160" r="4" /></g>
        </svg>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-full px-3 py-1 text-sm mb-6">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
              <span>Introducing pKlusters</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Orchestrate your<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> infrastructure as clusters</span></h1>
            <p className="text-gray-400 text-lg mb-8 max-w-lg">Group servers, domains, security scanners, and messaging relays into logical clusters. Unified billing, health monitoring, and live logs – built for African engineering teams.</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleCreateCluster} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition">Create your first cluster <FiArrowRight /></button>
              <button onClick={handleCliHelp} className="border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"><FiTerminal /> pkluster --help</button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1"><FiZap className="text-yellow-500" /> 99.9% uptime SLA</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
              <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                <div className="text-xs text-gray-400 font-mono">bash</div><div className="text-xs text-gray-500">pkluster</div>
              </div>
              <div className="bg-gray-900/90 p-4 overflow-x-auto"><AnimatedCode lines={codeLines} /></div>
            </div>
            <div className="absolute -top-8 -right-8 text-7xl text-blue-500/10 font-mono select-none animate-pulse-slow">{'</>'}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const ArchitectureKlusters = () => {
  const treeLines = ["pKlusters Platform","│","├── Production Cluster","│   ├── web-server (AWS)","│   ├── api-server (DO)","│   ├── myapp.com (DNS)","│   └── clamav-scanner","├── Staging Cluster","│   ├── staging-server","│   └── staging.myapp.com","└── Billing & Health per cluster"];
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div><h2 className="text-3xl font-bold mb-4">Logical grouping of your infrastructure</h2><p className="text-gray-400 mb-6">Organise resources by environment, team, or project. Each cluster has its own health dashboard, resource list, and billing.</p><ul className="space-y-2 text-sm text-gray-400"><li>✓ Mix providers (AWS, DO, Cloudflare, custom)</li><li>✓ Real‑time health checks & live logs</li><li>✓ Per‑cluster cost tracking</li><li>✓ Role‑based access (coming soon)</li></ul></div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 font-mono text-sm overflow-x-auto"><pre className="text-white">{treeLines.map((line, idx) => (<div key={idx} className={idx === 0 ? "text-white font-bold" : "text-blue-300"}>{line}</div>))}</pre></div>
      </div>
    </motion.section>
  );
};

export const GlobalReachKlusters = () => {
  const operatingCountries = ["Nigeria", "Kenya", "Ghana"];
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-24 px-6 bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
        <div><div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm mb-4"><span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" /> Distributed by design</div><h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Deploy clusters closer to your users.<br /><span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Across Africa & beyond.</span></h2><p className="text-gray-400 mb-6 max-w-md">pKlusters lets you mix resources from multiple providers and regions. Reduce latency, improve resilience, and manage everything from one control plane.</p><div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8"><span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full" /> sub‑20ms latency</span><span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full" /> cross‑provider failover</span><span className="flex items-center gap-2"><span className="w-2 h-2 bg-purple-400 rounded-full" /> auto‑healing clusters</span></div></div>
        <div className="relative flex flex-col items-center justify-center"><div className="w-full max-w-md bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm"><h3 className="text-2xl font-semibold text-white mb-6 text-center">Live clusters in</h3><div className="space-y-4">{operatingCountries.map((country, idx) => (<div key={idx} className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0"><span className="text-lg font-medium text-gray-200">{country}</span><span className="text-green-400 text-sm flex items-center gap-1"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>active</span></div>))}<p className="text-gray-500 text-xs text-center mt-6">More regions coming – join the waitlist</p></div></div></div>
      </div>
    </motion.section>
  );
};

export const KlusterFeatureCard = ({ title, description, gradient, icon: Icon }: { title: string; description: string; gradient: string; icon: any }) => {
  const tags: Record<string, string[]> = { "Cluster Management": ["Multi‑cloud", "Resource groups", "Tags"], "Health Monitoring": ["CPU/Memory", "Latency", "Custom checks"], "Live Logs": ["Real‑time", "Search", "Export"], "Unified Billing": ["Per cluster", "Invoices", "Usage alerts"], "Resource Catalog": ["Servers", "Domains", "SMTP", "Scanners"], "CLI & API": ["Automation", "Scripts", "Terraform"] };
  const featureTags = tags[title] || [];
  const { requireAuth } = useRequireAuth(); const { addToast } = useToast();
  const handleLearnMore = () => requireAuth(() => addToast('info', `Learn more about ${title} – detailed documentation would open here.`));
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl p-6 hover:border-blue-500/40 transition">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} mb-5 shadow-lg flex items-center justify-center`}><Icon className="text-white w-6 h-6" /></div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-4">{featureTags.map(tag => <span key={tag} className="text-xs px-3 py-1 rounded-full border border-gray-700 text-gray-300 bg-gray-900/50">{tag}</span>)}</div>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      <button onClick={handleLearnMore} className="mt-6 flex items-center justify-between w-full opacity-70 group-hover:opacity-100 transition"><span className="text-xs text-blue-400 font-mono">Learn more →</span><FiArrowRight className="text-gray-500 group-hover:text-blue-400 transition" /></button>
    </motion.div>
  );
};

export const KlustersModules = () => {
  const modules = [
    { title: "Cluster Management", description: "Create logical clusters, add/remove resources, and manage access  all from a single dashboard.", gradient: "from-blue-500 to-cyan-500", icon: FiBox },
    { title: "Health Monitoring", description: "Real_time CPU, memory, latency, and custom health checks per resource. Get alerts when something goes wrong.", gradient: "from-purple-500 to-pink-500", icon: FiActivity },
    { title: "Live Logs", description: "Aggregated, searchable logs from every resource in your cluster. Tail them live with our CLI or UI.", gradient: "from-green-500 to-emerald-500", icon: FiTerminal },
    { title: "Unified Billing", description: "One invoice per cluster, mixing all providers and services. No more fragmented bills.", gradient: "from-orange-500 to-red-500", icon: FiCreditCard },
    { title: "Resource Catalog", description: "Attach servers (AWS/DO), domains (Cloudflare), malware scanners, SMTP relays  any resource with an API.", gradient: "from-indigo-500 to-blue-500", icon: FiServer },
    { title: "CLI & API", description: "Automate everything: pkluster create, add, status, logs. Built for CI/CD and infrastructure as code.", gradient: "from-rose-500 to-pink-500", icon: FiCommand }
  ];
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6" id="features">
      <div className="max-w-7xl mx-auto"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage clusters</h2><p className="text-gray-400 max-w-2xl mx-auto">From resource orchestration to observability and billing – pKlusters unifies your infrastructure.</p></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">{modules.map((mod, idx) => (<KlusterFeatureCard key={idx} {...mod} />))}</div></div>
    </motion.section>
  );
};

export const CliPreviewKlusters = () => {
  const commands = ['$ pkluster create prod --region africa-west','→ Cluster "prod" created (ID: cl_123)','$ pkluster add res --type server --provider aws --cluster prod','→ Server "web-01" added','$ pkluster logs prod --tail','→ [2025-04-10 12:34:56] web-01: Health check passed','$ pkluster status prod','✅ Healthy | 6 resources | $42.50 this month'];
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6 bg-gray-900/30" id="cli">
      <div className="max-w-7xl mx-auto text-center"><h2 className="text-3xl font-bold mb-3">Control your clusters from the terminal</h2><p className="text-gray-400 max-w-2xl mx-auto mb-10">The pkluster CLI gives you full power to create, inspect, and update your infrastructure – fast.</p><div className="max-w-2xl mx-auto rounded-xl overflow-hidden border border-gray-800 shadow-2xl"><div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div><div className="text-xs text-gray-400 font-mono">bash</div><div className="text-xs text-gray-500">pkluster</div></div><div className="bg-gray-900/90 p-4 text-left"><AnimatedCode lines={commands} /><div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center"><span className="text-xs text-gray-500">pkluster-cli v1.0.0-beta</span><span className="text-green-400 text-sm flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> connected</span></div></div></div></div>
    </motion.section>
  );
};

export const CodeScreenshotsKlusters = () => {
  const clusterConfigCode = ["# pkluster.yaml","name: production-cluster","region: africa-west-1","resources:","  - type: server","    provider: aws","    instance: t3.micro","  - type: domain","    name: myapp.com","    provider: cloudflare","  - type: malware_scanner","    schedule: '0 2 * * *'","alerts:","  email: team@startup.africa"];
  const cliDemo = ["$ pkluster apply -f pkluster.yaml","🔍 Validating cluster definition...","✓ Cluster 'production-cluster' created","✓ 3 resources provisioned","🌍 Deployed to africa-west-1"];
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6 bg-gray-900/20">
      <div className="max-w-7xl mx-auto"><div className="text-center mb-12"><h2 className="text-3xl font-bold mb-3">Define clusters as code</h2><p className="text-gray-400">Version your infrastructure and deploy with confidence</p></div><div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl"><div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div><div className="text-xs text-gray-400 font-mono">pkluster.yaml</div><div className="text-xs text-gray-500">YAML</div></div><div className="bg-gray-900/90 p-4 overflow-x-auto"><pre className="font-mono text-sm text-gray-300">{clusterConfigCode.map((line,i) => <div key={i}>{line}</div>)}</pre></div></div>
        <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl"><div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div><div className="text-xs text-gray-400 font-mono">terminal</div><div className="text-xs text-gray-500">bash</div></div><div className="bg-gray-900/90 p-4 overflow-x-auto"><pre className="font-mono text-sm">{cliDemo.map((line,i) => { let colorClass = "text-gray-300"; if (line.startsWith("$")) colorClass = "text-blue-400"; else if (line.includes("✓")) colorClass = "text-green-400"; else if (line.includes("🔍")) colorClass = "text-yellow-400"; return <div key={i} className={colorClass}>{line}</div>; })}</pre></div></div>
      </div></div>
    </motion.section>
  );
};

export const StartupBundleKlusters = () => {
  const { requireAuth } = useRequireAuth(); const { addToast } = useToast();
  const handleClaimBundle = () => requireAuth(() => addToast('success', 'Bundle claimed! Check your dashboard for details.'));
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6" id="pricing">
      <div className="max-w-7xl mx-auto"><div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-8"><div className="grid md:grid-cols-2 gap-8 items-center"><div><div className="inline-flex items-center gap-2 bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm mb-4"><FiZap /> Startup Launch</div><h3 className="text-2xl md:text-3xl font-bold mb-3">Cluster Starter Bundle</h3><p className="text-gray-400 mb-4">Everything you need to run your first production cluster: included resources, monitoring, and $50 in credits.</p><ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 1 managed cluster (up to 5 resources)</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 6 months health monitoring & logs</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 1 custom domain via Cloudflare</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> $50 cloud credits (AWS/DO)</li></ul><div className="flex items-center gap-4 flex-wrap"><span className="text-3xl font-bold">$19<span className="text-sm text-gray-400">/month</span></span><button onClick={handleClaimBundle} className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium">Claim bundle →</button></div></div><div className="relative"><div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"><div className="flex items-center gap-2 mb-3"><FiTerminal className="text-gray-400" /><span className="text-sm font-mono">pkluster bundle create startup-2025</span></div><div className="h-px bg-gray-700 my-2"></div><div className="text-green-400 text-sm">✓ Bundle activated. Your cluster is ready.</div></div></div></div></div></div>
    </motion.section>
  );
};

export const PartnersKlusters = () => {
  const partners = ["AWS", "DigitalOcean", "Cloudflare", "Linode", "Hetzner", "Upcloud"];
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6 bg-gradient-to-b from-gray-950 to-black border-y border-gray-800">
      <div className="max-w-7xl mx-auto text-center"><p className="text-xs uppercase tracking-widest text-cyan-400 mb-6">Trusted by infrastructure teams across Africa</p><div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-8 opacity-70">{partners.map((partner,i) => (<motion.div key={partner} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 0.7, y: 0 }} transition={{ delay: i*0.05 }} viewport={{ once: true }} className="text-xl md:text-2xl font-semibold text-gray-400 hover:text-white transition">{partner}</motion.div>))}</div></div>
    </motion.section>
  );
};

export const TestimonialsKlusters = () => {
  const testimonials = [
    { name: "Amara Okonkwo", role: "CTO, Swiftly Logistics", content: "pKlusters cut our infrastructure management overhead in half. Grouping our AWS and DigitalOcean resources into clusters with unified logs is a game changer." },
    { name: "Kwame Asante", role: "Platform Engineer, Freelance", content: "The CLI and YAML definition make it easy to replicate clusters across staging and production. Finally a tool built for African multi‑cloud setups." },
    { name: "Fatima El-Sayed", role: "Founder, EduTech Kenya", content: "We manage 5 clusters for different universities. Per‑cluster billing and health monitoring give us peace of mind without spreadsheets." },
    { name: "Tunde Adebayo", role: "DevOps Lead, Paystack", content: "pKlusters brings order to chaos. The ability to attach any resource (server, domain, scanner) and see live logs in one place is invaluable." }
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  useEffect(() => { if (isAutoPlaying) { intervalRef.current = window.setInterval(nextSlide, 5000); } return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, [isAutoPlaying, currentIndex]);
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6 bg-gray-900/40" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
      <div className="max-w-4xl mx-auto text-center"><h2 className="text-3xl font-bold mb-3">Loved by engineering teams across Africa</h2><p className="text-gray-400 mb-12">Join hundreds of developers who organise their infrastructure with pKlusters</p><div className="relative"><AnimatePresence mode="wait"><motion.div key={currentIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="bg-gray-800/30 border border-gray-700 rounded-xl p-8"><div className="flex flex-col items-center"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-medium mb-4">{getInitials(testimonials[currentIndex].name)}</div><p className="text-gray-300 text-lg leading-relaxed mb-6 italic">"{testimonials[currentIndex].content}"</p><div className="font-semibold text-white">{testimonials[currentIndex].name}</div><div className="text-sm text-gray-400">{testimonials[currentIndex].role}</div></div></motion.div></AnimatePresence><button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-gray-800/50 hover:bg-gray-700 p-2 rounded-full"><FiChevronLeft className="w-5 h-5" /></button><button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-gray-800/50 hover:bg-gray-700 p-2 rounded-full"><FiChevronRight className="w-5 h-5" /></button><div className="flex justify-center gap-2 mt-6">{testimonials.map((_, idx) => (<button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-blue-500 w-4" : "bg-gray-600"}`} />))}</div></div></div>
    </motion.section>
  );
};

export const StatsKlusters = () => {
  const [counts, setCounts] = useState({ clusters: 0, resources: 0, providers: 0, uptime: 99.99 });
  useEffect(() => {
    const targets = { clusters: 1247, resources: 8432, providers: 8 };
    const duration = 2000, stepTime = 20, steps = duration / stepTime;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setCounts({ clusters: Math.min(targets.clusters, Math.floor((currentStep / steps) * targets.clusters)), resources: Math.min(targets.resources, Math.floor((currentStep / steps) * targets.resources)), providers: Math.min(targets.providers, Math.floor((currentStep / steps) * targets.providers)), uptime: 99.99 });
      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);
  }, []);
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="py-16 px-6 bg-transparent">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-center gap-10 md:gap-0">
        <div><div className="text-3xl md:text-4xl font-semibold text-white">{counts.clusters.toLocaleString()}+</div><div className="text-gray-400 text-sm mt-2">Active clusters</div></div>
        <div><div className="text-3xl md:text-4xl font-semibold text-white">{counts.resources.toLocaleString()}+</div><div className="text-gray-400 text-sm mt-2">Managed resources</div></div>
        <div><div className="text-3xl md:text-4xl font-semibold text-white">{counts.providers}+</div><div className="text-gray-400 text-sm mt-2">Supported providers</div></div>
        <div><div className="text-3xl md:text-4xl font-semibold text-white">{counts.uptime}%</div><div className="text-gray-400 text-sm mt-2">Control plane uptime</div></div>
      </div>
    </motion.section>
  );
};