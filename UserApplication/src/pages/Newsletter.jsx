import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Calendar,
  ExternalLink,
  LogOut,
  Trash2,
  FileText
} from 'lucide-react';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

function Newsletter() {
  const { t, i18n } = useTranslation();
  const { token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (token) {
      fetchNewsletter(token);
    }
  }, [i18n.language, isAuthenticated, token, navigate]);

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
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch newsletter");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm("Are you sure you want to cancel your membership? This will permanently delete your account and all associated data.")) return;

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/membership/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Your membership has been cancelled and your account has been deleted.");
        logout();
        navigate('/');
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
          {isAuthenticated && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-24 pb-24"
            >
              {loading && !newsletter ? (
                <div className="flex justify-center items-center py-40">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
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

                    <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-slate-200 gap-8">
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
                          onClick={() => {
                            logout();
                            navigate('/');
                          }}
                          className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2 unna-bold uppercase tracking-widest text-xs hover:bg-red-50 hover:text-red-600 transition-all rounded-full shadow-sm"
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
                    {newsletter?.sections?.map((section, idx) => (
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

                        <div className={`md:col-span-8 unna text-xl leading-relaxed text-slate-600 ${idx % 2 !== 0 ? 'md:order-1' : ''}`}>
                          <div className="bg-white border-l-4 border-black shadow-sm overflow-hidden">
                            {section.image_url && (
                              <div className="w-full h-80 overflow-hidden mb-6">
                                <img
                                  src={section.image_url}
                                  alt={section.title}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                            )}
                            <p className="p-8 pt-2">
                              {section.content}
                            </p>
                          </div>
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
                        <button
                          onClick={() => window.location.href = '/events'}
                          className="flex items-center gap-2 unna-bold uppercase tracking-widest text-xs underline decoration-2 underline-offset-4"
                        >
                          View Event Calendar <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
    </div>
  );
}

export default Newsletter;
