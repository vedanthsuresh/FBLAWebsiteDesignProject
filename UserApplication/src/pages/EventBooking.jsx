import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Ticket, User, Mail, CheckCircle, ChevronRight, ChevronLeft, CreditCard, AlertCircle, Calendar as CalendarIcon, Clock, X, ShoppingCart, Lock } from 'lucide-react';
import Footer from '../components/Footer';
import CalendarView from '../components/CalendarView';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate as useRouterNavigate, useLocation } from 'react-router-dom';

function EventBooking() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const routerNavigate = useRouterNavigate();
  const location = useLocation();

  const [ticketTypes, setTicketTypes] = useState([
    { id: 'adult', code: 'adult', label: t('tickets.types.adult'), price: 16.50 },
    { id: 'student', code: 'student', label: t('tickets.types.student'), price: 14.50 },
    { id: 'senior', code: 'senior', label: t('tickets.types.senior'), price: 14.50 },
    { id: 'member', code: 'member', label: t('tickets.types.member'), price: 0 }
  ]);

  const [discounts, setDiscounts] = useState([
    { code: 'WELCOME10', rate: 10.0 }
  ]);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/tickets/discounts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDiscounts(data);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch discounts, using offline fallback", err);
      });
  }, []);

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const found = discounts.find(d => d.code === code);
    if (found) {
      setAppliedPromo(found);
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid promotion code');
    }
  };

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/tickets/options')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.code,
            code: item.code,
            label: t(`tickets.types.${item.code.toLowerCase()}`, item.name),
            price: item.price
          }));
          setTicketTypes(mapped);
          setQuantities(prev => {
            const next = { ...prev };
            mapped.forEach(t => {
              if (next[t.code] === undefined) {
                next[t.code] = 0;
              }
            });
            return next;
          });
        }
      })
      .catch(err => console.error("Failed to fetch ticket options:", err));
  }, []);

  const [quantities, setQuantities] = useState(() => {
    if (location.state?.quantities) {
      const q = { ...location.state.quantities };
      q.member = Math.max(1, q.member);
      return q;
    }
    return { adult: 0, student: 0, senior: 0, member: 0 };
  });
  const [selectedDate, setSelectedDate] = useState(location.state?.selectedDate || '');
  const [selectedTime, setSelectedTime] = useState(location.state?.selectedTime || '');
  const [eventTitle, setEventTitle] = useState(location.state?.eventTitle || '');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [filterMode, setFilterMode] = useState(location.state?.filterMode || 'all'); // 'all' | 'general' | 'member'

  const filteredTicketTypes = ticketTypes.filter(type => {
    if (filterMode === 'general') return type.id !== 'member';
    if (filterMode === 'member') return type.id === 'member';
    return true;
  });

  const subtotal = Object.entries(quantities).reduce((acc, [id, qty]) => {
    const option = ticketTypes.find(t => t.id === id);
    const price = option ? option.price : 0;
    return acc + (price * qty);
  }, 0);

  const discountAmount = appliedPromo ? (subtotal * appliedPromo.rate) / 100 : 0;
  const total = subtotal - discountAmount;

  const handleQuantityChange = (id, delta) => {
    if (id === 'member' && delta > 0 && !isAuthenticated) {
      setShowSignInPrompt(true);
      return;
    }
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  const handleAddToCart = () => {
    Object.entries(quantities).forEach(([id, qty]) => {
      if (qty > 0) {
        const type = ticketTypes.find(t => t.id === id);
        if (type) {
          const finalPrice = appliedPromo ? type.price * (1 - appliedPromo.rate / 100) : type.price;
          const promoSuffix = appliedPromo ? ` (${appliedPromo.code})` : '';
          for(let i=0; i<qty; i++) {
            addToCart({
              title: `${eventTitle || 'Special Event'} - ${type.label}${promoSuffix}`,
              description: `Date: ${selectedDate} | Entry: ${selectedTime}`,
              price: finalPrice
            });
          }
        }
      }
    });

    // Reset Form
    const resetObj = {};
    ticketTypes.forEach(t => { resetObj[t.id] = 0; });
    setQuantities(resetObj);
    setSelectedDate('');
    setSelectedTime('');
    setEventTitle('');
    setPromoInput('');
    setAppliedPromo(null);
  };

  const isStep1Valid = Object.values(quantities).some(qty => qty > 0) && selectedDate !== '';

  return (
    <div className="bg-slate-50 min-h-screen pt-24 relative">
      {/* Sign-In Prompt Modal */}
      <AnimatePresence>
        {showSignInPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-black p-10 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative"
            >
              <button onClick={() => setShowSignInPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors border border-black">
                <X size={16} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <Lock size={28} className="text-black" />
                <h2 className="unna-bold text-3xl">Members Only</h2>
              </div>
              <p className="unna text-lg text-slate-600 mb-8 leading-relaxed">
                The Member rate is exclusively for museum members. Please sign in to verify your membership and access this ticket type.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => { setShowSignInPrompt(false); routerNavigate('/login', { state: { from: location.pathname, quantities, selectedDate, selectedTime, eventTitle, filterMode } }); }}
                  className="w-full py-4 bg-black text-white unna-bold text-lg hover:bg-slate-800 transition-colors"
                >
                  Sign In to Continue
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignInPrompt(false)}
                  className="w-full py-4 border-2 border-black text-black unna-bold text-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-4 border-black my-8"
            >
              <button 
                onClick={() => setIsCalendarOpen(false)}
                className="sticky top-4 right-4 ml-auto z-10 w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <X size={24} />
              </button>
              <div className="-mt-14">
                <CalendarView isModal={true} activeCategory="events" disablePastDates={true} onDateSelect={(dateStr, eventObj) => {
                  const dStr = `${dateStr.getFullYear()}-${String(dateStr.getMonth() + 1).padStart(2, '0')}-${String(dateStr.getDate()).padStart(2, '0')}`;
                  setSelectedDate(dStr);
                  if (eventObj) {
                    const title = typeof eventObj === 'string' ? eventObj : eventObj.title;
                    const time = typeof eventObj === 'string' ? '10:00 AM' : (eventObj.time || '10:00 AM');
                    setEventTitle(title);
                    setSelectedTime(time);
                  }
                  setIsCalendarOpen(false);
                }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border-4 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="unna-bold text-4xl mb-8 border-b-4 border-black pb-4">Book Special Event</h2>
              {discounts.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 text-sm text-amber-900 rounded-none font-medium flex flex-col gap-1">
                  <span className="font-black tracking-widest text-[10px] uppercase text-amber-700">Active Promotions</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {discounts.map(d => (
                      <span key={d.code} className="inline-block bg-white border border-amber-200 px-2 py-1 text-xs font-mono font-bold">
                        {d.code} (Save {d.rate}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-6 mb-12">
                {/* Date & Time Selection */}
                <div className="bg-slate-50 border-2 border-slate-100 p-6 space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                      <CalendarIcon size={16} /> Select Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(true)}
                      className="w-full md:w-1/2 px-4 py-3 border-2 border-slate-200 outline-none hover:border-black transition-colors unna text-xl text-left bg-white text-black flex justify-between items-center"
                    >
                      {selectedDate || "Select a Calendar Date"}
                      <ChevronRight size={20} className="opacity-50" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Clock size={16} /> Entry Time
                    </label>
                    <div className="py-3 px-4 border-2 bg-slate-100 text-black font-bold tracking-widest text-lg uppercase border-slate-200">
                      {selectedTime || "Select an Event"}
                    </div>
                  </div>
                </div>

                {/* Ticket Type Filter Tabs */}
                <div className="flex flex-wrap gap-2 border-b-2 border-black pb-6 mb-6">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-6 py-3 font-bold tracking-widest text-xs uppercase border-2 transition-all ${
                      filterMode === 'all'
                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'
                    }`}
                  >
                    All Admissions
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('general')}
                    className={`px-6 py-3 font-bold tracking-widest text-xs uppercase border-2 transition-all ${
                      filterMode === 'general'
                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'
                    }`}
                  >
                    General Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('member')}
                    className={`px-6 py-3 font-bold tracking-widest text-xs uppercase border-2 transition-all flex items-center gap-2 ${
                      filterMode === 'member'
                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'
                    }`}
                  >
                    {!isAuthenticated && <Lock size={12} />} Member Exclusives ($0)
                  </button>
                </div>

                {filterMode === 'member' && isAuthenticated && (
                  <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm font-semibold mb-4 rounded-none flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600 animate-pulse" />
                    Verified Museum Member: Free admission ticket unlocked!
                  </div>
                )}

                {filterMode === 'member' && !isAuthenticated ? (
                  <div className="bg-slate-50 border-4 border-black p-8 text-center space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mx-auto w-16 h-16 bg-black text-white flex items-center justify-center rounded-none mb-4">
                      <Lock size={32} />
                    </div>
                    <h3 className="unna-bold text-2xl uppercase tracking-wider">Member Exclusives Locked</h3>
                    <p className="unna text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                      Complimentary admission ($0) is reserved exclusively for High Museum members. Sign in to your account or purchase a membership to unlock these rates.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => routerNavigate('/login', { state: { from: location.pathname, quantities, selectedDate, selectedTime, eventTitle, filterMode } })}
                        className="px-8 py-3 bg-black text-white font-bold tracking-widest text-xs uppercase hover:bg-slate-800 transition-colors border-2 border-black"
                      >
                        Sign In to Unlock
                      </button>
                      <button
                        type="button"
                        onClick={() => routerNavigate('/membership')}
                        className="px-8 py-3 border-2 border-black text-black font-bold tracking-widest text-xs uppercase hover:bg-slate-100 transition-colors"
                      >
                        Become a Member
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredTicketTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 group hover:border-black transition-colors">
                      <div>
                        <h3 className="font-black uppercase tracking-widest text-sm">{type.label}</h3>
                        <p className="unna text-xl text-slate-500">{type.price === 0 ? 'Free' : `$${type.price.toFixed(2)}`}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(type.id, -1)}
                          className="w-10 h-10 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-all font-bold"
                        >
                          -
                        </button>
                        <span className="unna text-2xl font-bold w-4 text-center">{quantities[type.id]}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(type.id, 1)}
                          className="w-10 h-10 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-all font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Promo Code Input */}
              <div className="p-6 bg-slate-50 border-2 border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6">
                <div className="flex-1">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Have a promo code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2 border-2 border-slate-200 outline-none focus:border-black text-sm font-mono uppercase bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-6 py-2 bg-black text-white font-bold tracking-widest text-xs uppercase hover:bg-slate-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-600 font-semibold mt-2">{promoError}</p>}
                  {appliedPromo && (
                    <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold mt-2">
                       <CheckCircle size={14} className="text-emerald-600" />
                       Code applied: <span className="font-mono font-bold">{appliedPromo.code}</span> (Save {appliedPromo.rate}%)
                       <button
                         type="button"
                         onClick={() => { setAppliedPromo(null); setPromoInput(''); }}
                         className="text-slate-400 hover:text-black ml-1 underline"
                       >
                         Remove
                       </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-black text-white p-6 my-8 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                  <span className="text-xs uppercase tracking-widest text-gray-400">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 text-amber-400">
                    <span className="text-xs uppercase tracking-widest">Discount ({appliedPromo.code} -{appliedPromo.rate}%)</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-black uppercase tracking-[0.3em]">{t('tickets.order_summary')}</span>
                  <span className="unna text-3xl font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!isStep1Valid}
                  onClick={handleAddToCart}
                  className={`flex items-center gap-2 px-10 py-4 unna-bold text-xl transition-all ${isStep1Valid ? 'bg-black text-white hover:bg-slate-800 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              </div>
            </motion.div>
        </AnimatePresence>

        <p className="text-center mt-12 text-[10px] items-center gap-2 grayscale opacity-40 uppercase tracking-widest font-black flex justify-center">
          <span className="w-12 h-[1px] bg-black"></span>
          {t('tickets.secure_checkout')}
          <span className="w-12 h-[1px] bg-black"></span>
        </p>
      </div>
      <Footer />
    </div>
  );
}

export default EventBooking;
