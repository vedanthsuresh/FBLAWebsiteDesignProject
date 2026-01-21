import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  CheckCircle,
  CreditCard,
  MapPin,
  Star,
  Coffee,
  ShoppingBag,
  Calendar,
  ChevronRight,
  AlertCircle,
  Users,
  Award,
  Globe,
  Home,
  Trash2
} from 'lucide-react';
import Footer from '../components/Footer';


function Membership() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  const BENEFITS_ICONS = [<Globe size={24} />, <MapPin size={24} />, <ShoppingBag size={24} />, <Calendar size={24} />, <Users size={24} />, <Award size={24} />];
  const BENEFITS = t('membership.benefits', { returnObjects: true }).map((b, i) => ({ ...b, icon: BENEFITS_ICONS[i] }));

  const LEVELS_PRICES = { student: 70, individual: 90, family: 135, contributing: 195, patron: 390, circle: 1200 };
  const MEMBERSHIP_LEVELS = t('membership.levels', { returnObjects: true }).map(l => ({ ...l, price: LEVELS_PRICES[l.id] }));

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [cancelData, setCancelData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setIsCancelling(false);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Register user in backend first (for hashed/salted password)
      const regResponse = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!regResponse.ok) {
        const regData = await regResponse.json();
        throw new Error(regData.detail || "Registration failed. Email may already be in use.");
      }

      // 2. Send FormSubmit.co confirmation email
      const response = await fetch(`https://formsubmit.co/ajax/${formData.email}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "Subject": "Welcome to the High Museum Membership! 🎨",
          "Message": `Hello, ${formData.name}! Thank you for choosing the ${selectedLevel.name} Membership. Your account has been created successfully. You can now log in to access the Monthly Newsletter.`,
          "Member Name": formData.name,
          "Membership Level": selectedLevel.name,
          "Annual Rate": `$${selectedLevel.price}`,
          "Reference ID": `MEM-${Math.floor(Math.random() * 900000) + 100000}`,
          "_template": "table",
          "_captcha": "false"
        })
      });

      if (response.ok) {
        setIsSubmitting(false);
        setStep(3);
      } else {
        throw new Error("Confirmation email could not be sent, but your account was created.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to complete membership. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setCancelError(null);

    if (cancelData.password !== cancelData.confirmPassword) {
      setCancelError(t('membership.matching_error'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/membership/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cancelData.email,
          password: cancelData.password,
          confirm_password: cancelData.confirmPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCancelSuccess(true);
        setCancelData({ name: '', email: '', password: '', confirmPassword: '' });
        localStorage.removeItem('newsletter_token'); // Log out if they were logged in
      } else {
        setCancelError(data.detail || "Failed to cancel membership.");
      }
    } catch (err) {
      console.error(err);
      setCancelError("Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-black text-white px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <UserPlus size={600} className="rotate-12 translate-x-1/4 -translate-y-1/4" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="unna-bold text-7xl md:text-9xl mb-6"
          >
            {t('membership.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl unna max-w-2xl opacity-80 leading-relaxed"
          >
            {t('membership.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-24"
            >
              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {BENEFITS.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 border-l-4 border-black bg-slate-50 flex flex-col gap-4"
                  >
                    <div className="text-black">{benefit.icon}</div>
                    <h3 className="unna-bold text-2xl uppercase tracking-wider">{benefit.title}</h3>
                    <p className="unna text-lg opacity-70">{benefit.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Levels / Pricing */}
              <div>
                <h2 className="unna-bold text-5xl md:text-6xl mb-12 text-center underline decoration-8 underline-offset-8">{t('membership.select_level')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {MEMBERSHIP_LEVELS.map((level) => (
                    <div
                      key={level.id}
                      className="border-4 border-black p-8 hover:bg-black hover:text-white transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="unna-bold text-3xl uppercase tracking-tighter">{level.name}</h3>
                          <span className="text-3xl unna-bold group-hover:text-white transition-all">${level.price}</span>
                        </div>
                        <p className="unna text-lg mb-8 opacity-70 group-hover:opacity-100">{level.description}</p>
                        <ul className="space-y-3 mb-12">
                          {level.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-3 unna font-bold text-sm uppercase tracking-widest">
                              <CheckCircle size={16} /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => handleLevelSelect(level)}
                        className="w-full py-4 border-2 border-black group-hover:border-white unna-bold text-lg uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                      >
                        {t('membership.join_now')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manage/Cancel Membership Section */}
              <div className="pt-24 border-t border-slate-100">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8 md:mb-12">
                    <h2 className="unna-bold text-3xl md:text-4xl mb-4 tracking-tight">{t('membership.manage_membership')}</h2>
                    <p className="unna text-lg md:text-xl opacity-60 px-4 md:px-0">Already a member but need to make changes or cancel? Use the secure form below.</p>
                  </div>

                  {!isCancelling ? (
                    <div className="text-center">
                      <button
                        onClick={() => setIsCancelling(true)}
                        className="unna-bold text-base md:text-lg uppercase tracking-widest border-2 border-black px-8 md:px-12 py-3 md:py-4 hover:bg-black hover:text-white transition-all w-full md:w-auto"
                      >
                        Open Cancellation Form
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 border-4 md:border-8 border-black p-6 md:p-12 space-y-6 md:space-y-8"
                    >
                      {cancelSuccess ? (
                        <div className="text-center space-y-4 md:space-y-6 py-4 md:py-8">
                          <CheckCircle size={60} className="mx-auto text-black md:w-20 md:h-20" />
                          <h3 className="unna-bold text-2xl md:text-3xl">Membership Cancelled</h3>
                          <p className="unna text-lg md:text-xl opacity-70">Your account has been permanently deleted from our system. We hope to see you again soon.</p>
                          <button
                            onClick={() => { setCancelSuccess(false); setIsCancelling(false); }}
                            className="bg-black text-white px-8 py-3 unna-bold uppercase tracking-widest text-xs md:text-sm"
                          >
                            Return to Membership
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleCancel} className="space-y-4 md:space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('tickets.full_name')}</label>
                              <input
                                required
                                value={cancelData.name}
                                onChange={(e) => setCancelData({ ...cancelData, name: e.target.value })}
                                placeholder="Jane Doe"
                                className="w-full px-4 py-3 md:py-4 bg-white border-2 border-slate-100 focus:border-black outline-none transition-all unna text-lg md:text-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('tickets.email')}</label>
                              <input
                                required
                                type="email"
                                value={cancelData.email}
                                onChange={(e) => setCancelData({ ...cancelData, email: e.target.value })}
                                placeholder="jane@example.com"
                                className="w-full px-4 py-3 md:py-4 bg-white border-2 border-slate-100 focus:border-black outline-none transition-all unna text-lg md:text-xl"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Password</label>
                              <input
                                required
                                type="password"
                                value={cancelData.password}
                                onChange={(e) => setCancelData({ ...cancelData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 md:py-4 bg-white border-2 border-slate-100 focus:border-black outline-none transition-all unna text-lg md:text-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('membership.confirm_password')}</label>
                              <input
                                required
                                type="password"
                                value={cancelData.confirmPassword}
                                onChange={(e) => setCancelData({ ...cancelData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 md:py-4 bg-white border-2 border-slate-100 focus:border-black outline-none transition-all unna text-lg md:text-xl"
                              />
                            </div>
                          </div>

                          {cancelError && (
                            <div className="p-4 bg-red-50 text-red-600 flex items-center gap-3 border-l-4 border-red-500 unna font-bold">
                              <AlertCircle size={20} /> {cancelError}
                            </div>
                          )}

                          <div className="pt-4 flex flex-col md:flex-row gap-4">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-1 bg-black text-white py-4 md:py-6 unna-bold text-sm md:text-xl uppercase tracking-[0.1em] md:tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50"
                            >
                              {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <Trash2 size={18} className="md:w-6 md:h-6" /> {t('membership.confirm_cancel')}
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsCancelling(false)}
                              className="px-6 md:px-8 py-3 md:py-6 border-2 border-black unna-bold text-[10px] md:text-sm uppercase tracking-widest hover:bg-slate-100 transition-all font-black"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Official Citation */}
              <div className="pt-20 border-t border-slate-200">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30 text-center flex items-center justify-center gap-4">
                  <span className="w-12 h-px bg-black opacity-20"></span>
                  {t('membership.official_source')}
                  <span className="w-12 h-px bg-black opacity-20"></span>
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl mx-auto py-12"
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 mb-8 unna-bold uppercase tracking-widest text-sm opacity-50 hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} /> {t('membership.back_to_levels')}
              </button>

              <div className="border-8 border-black p-12 space-y-8">
                <div className="space-y-2">
                  <h2 className="unna-bold text-4xl">{t('membership.sign_up')}: {selectedLevel?.name}</h2>
                  <p className="unna text-xl opacity-60">{t('membership.ready_to_join')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('tickets.full_name')}</label>
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black outline-none transition-all unna text-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('tickets.email')}</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black outline-none transition-all unna text-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('membership.create_password')}</label>
                    <input
                      required
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black outline-none transition-all unna text-xl"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 flex items-center gap-3 border-l-4 border-red-500 unna font-bold">
                      <AlertCircle size={20} /> {error}
                    </div>
                  )}

                  <div className="p-6 bg-slate-50 border-l-8 border-black space-y-2">
                    <div className="flex justify-between items-center unna-bold text-xl uppercase tracking-tighter">
                      <span>Annual Membership</span>
                      <span>${selectedLevel?.price} / Year</span>
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-6 unna-bold text-2xl uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CreditCard size={24} /> {t('membership.confirm')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto py-24 text-center space-y-8"
            >
              <div className="relative inline-block">
                <CheckCircle size={100} className="text-black inline-block" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-black/5 rounded-full -z-10 animate-ping"
                ></motion.div>
              </div>

              <div className="space-y-4">
                <h2 className="unna-bold text-5xl">{t('membership.welcome')}, {formData.name}!</h2>
                <p className="unna text-2xl opacity-70 max-w-md mx-auto leading-relaxed">
                  {t('membership.received').replace('membership', selectedLevel?.name)}
                </p>
                <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 inline-block">
                  <p className="unna text-lg">{t('membership.sent_to')}</p>
                  <p className="font-bold text-xl drop-shadow-sm">{formData.email}</p>
                </div>
              </div>

              <div className="pt-8 flex flex-col items-center gap-4">
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-black text-white px-12 py-4 unna-bold text-xl uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Home size={20} /> {t('tickets.return_home')}
                </button>
                <p className="text-xs uppercase tracking-widest opacity-40">{t('membership.thank_you')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section >

      <Footer />
    </div >
  );
}

function ChevronLeft({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default Membership;
