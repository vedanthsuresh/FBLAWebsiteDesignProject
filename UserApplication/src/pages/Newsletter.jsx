import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Lock,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  FileText,
  Bookmark,
  Calendar,
  ExternalLink,
  LogOut,
  Trash2
} from 'lucide-react';
import Footer from '../components/Footer';

function Newsletter() {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('newsletter_token');
    if (token) {
      fetchNewsletter(token);
    }
  }, []);

  const fetchNewsletter = async (token) => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/newsletter', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': i18n.language
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNewsletter(data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('newsletter_token');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    const endpoint = isLogin ? '/api/login' : '/api/register';

    console.log(`Attempting ${isLogin ? 'Login' : 'Registration'} for: ${cleanEmail}`);

    // Login uses form-data, Register uses JSON
    let body;
    let contentType;

    if (isLogin) {
      const params = new URLSearchParams();
      params.append('username', cleanEmail);
      params.append('password', formData.password);
      body = params;
      contentType = 'application/x-www-form-urlencoded';
    } else {
      body = JSON.stringify({ ...formData, email: cleanEmail });
      contentType = 'application/json';
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: body
      });

      console.log(`Auth Response Status: ${response.status}`);
      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          console.log("Login successful, retrieving newsletter...");
          localStorage.setItem('newsletter_token', data.access_token);
          fetchNewsletter(data.access_token);
        } else {
          setIsLogin(true);
          setError("Registration successful! Please log in.");
        }
      } else {
        console.warn("Auth failed:", data.detail);
        setError(data.detail || "Authentication failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setError("Server connection failed. Is the API running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('newsletter_token');
    setIsAuthenticated(false);
    setNewsletter(null);
  };

  const handleUnsubscribe = async () => {
    if (!confirm("Are you sure you want to cancel your membership? This will permanently delete your account and all associated data.")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('newsletter_token');
      const response = await fetch('http://127.0.0.1:8000/api/membership/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Your membership has been cancelled and your account has been deleted.");
        handleLogout();
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to unsubscribe. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-black text-white px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Mail size={600} className="rotate-12 translate-x-1/4 -translate-y-1/4" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="unna-bold text-7xl md:text-9xl mb-6 uppercase"
          >
            {t('newsletter.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl unna max-w-2xl opacity-80 leading-relaxed"
          >
            {t('newsletter.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white border-8 border-black p-12 shadow-2xl">
                <div className="text-center mb-12">
                  <div className="inline-block p-4 bg-black text-white mb-6">
                    <Lock size={32} />
                  </div>
                  <h2 className="unna-bold text-4xl uppercase tracking-widest">{t('newsletter.locked')}</h2>
                  <p className="unna text-lg opacity-60 mt-2">{t('newsletter.unlock')}</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('tickets.email')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="member@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black outline-none transition-all unna text-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('membership.create_password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black outline-none transition-all unna text-xl"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 border-red-500 flex items-center gap-3 border-l-4 unna font-bold">
                      <AlertCircle size={20} /> {error}
                    </div>
                  )}

                  <button
                    disabled={loading}
                    className="w-full bg-black text-white py-6 unna-bold text-2xl uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>{t('newsletter.sign_in')} <ChevronRight size={24} /></>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center pt-8 border-t border-slate-100">
                  <p className="unna text-lg opacity-60 mb-2">Not a member yet?</p>
                  <button
                    onClick={() => window.location.href = '/membership'}
                    className="unna text-lg font-bold underline decoration-2 underline-offset-4 hover:text-slate-500 transition-colors"
                  >
                    Join Membership to create an account
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-24 pb-24"
            >
              {/* Header Section */}
              <div className="border-b-8 border-black pb-12 pt-12">
                <div className="flex items-center gap-3 text-slate-400 mb-6">
                  <Calendar size={18} />
                  <span className="text-xs font-black uppercase tracking-[0.3em]">{newsletter?.month}</span>
                </div>
                <h1 className="unna-bold text-6xl md:text-8xl leading-tight mb-6">
                  {newsletter?.title}
                </h1>
                <p className="unna text-2xl md:text-3xl opacity-60 italic leading-relaxed max-w-2xl">
                  {newsletter?.subtitle}
                </p>

                <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full font-black text-sm">HI</div>
                    <div className="unna">
                      <p className="font-bold">By Curatorial Review</p>
                      <p className="text-sm opacity-50">High Museum of Art • Atlanta</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={handleUnsubscribe}
                      className="flex items-center gap-2 text-slate-400 hover:text-red-600 transition-all text-[10px] font-black uppercase tracking-[0.2em] border-b border-transparent hover:border-red-600 pb-1"
                      title="Permanently Cancel Membership"
                    >
                      <Trash2 size={14} /> Cancel Membership
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-6 py-2 unna-bold uppercase tracking-widest text-xs hover:bg-red-50 hover:text-red-600 transition-all rounded-full"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Introduction */}
              <div className="unna text-3xl leading-relaxed text-slate-800 first-letter:text-8xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]">
                {newsletter?.introduction}
              </div>

              {/* Dynamic Sections */}
              <div className="space-y-32">
                {newsletter?.sections.map((section, idx) => (
                  <motion.section
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-12 items-start ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className={`md:col-span-4 ${idx % 2 !== 0 ? 'md:order-2' : ''}`}>
                      <div className="bg-black text-white p-2 inline-block text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                        {section.type}
                      </div>
                      <h2 className="unna-bold text-4xl mb-6 uppercase tracking-tight">{section.title}</h2>
                    </div>

                    <div className={`md:col-span-8 unna text-xl leading-relaxed text-slate-600 ${idx % 2 !== 0 ? 'md:order-1 md:text-right' : ''}`}>
                      <p className="bg-white p-8 border-l-4 border-black shadow-sm">
                        {section.content}
                      </p>
                    </div>
                  </motion.section>
                ))}
              </div>

              {/* Citation Footer */}
              <div className="bg-black text-white p-12 mt-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-sm">
                  <div className="space-y-4">
                    <h4 className="unna-bold text-xl uppercase flex items-center gap-2">
                      <FileText size={20} /> Resource Citation
                    </h4>
                    <p className="unna text-lg opacity-80 italic">
                      "{newsletter?.citation}"
                    </p>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Verification Hash</p>
                      <p className="text-[10px] break-all opacity-30 font-mono">{newsletter?.verification_hash}</p>
                    </div>
                  </div>

                  <div className="p-8 border-2 border-white/10 unna">
                    <h4 className="unna-bold text-2xl mb-4 italic">Editor's Note</h4>
                    <p className="opacity-70 leading-relaxed mb-6">
                      This institutional review is curated for members only and contains
                      proprietary research and early access schedules for 2026.
                      Unauthorized distribution is prohibited.
                    </p>
                    <button className="flex items-center gap-2 unna-bold uppercase tracking-widest text-xs underline decoration-2 underline-offset-4">
                      View Event Calendar <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
    </div>
  );
}

export default Newsletter;
