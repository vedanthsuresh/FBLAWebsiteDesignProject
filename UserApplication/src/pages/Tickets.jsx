import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Ticket, User, Mail, CheckCircle, ChevronRight, ChevronLeft, CreditCard, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';

function Tickets() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  const TICKET_TYPES = [
    { id: 'adult', label: t('tickets.types.adult'), price: 16.50 },
    { id: 'student', label: t('tickets.types.student'), price: 14.50 },
    { id: 'senior', label: t('tickets.types.senior'), price: 14.50 },
    { id: 'member', label: t('tickets.types.member'), price: 0 }
  ];

  const [quantities, setQuantities] = useState({ adult: 0, student: 0, senior: 0, member: 0 });
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState(null);

  const total = Object.entries(quantities).reduce((acc, [id, qty]) => {
    const price = TICKET_TYPES.find(t => t.id === id).price;
    return acc + (price * qty);
  }, 0);

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEmailError(null);

    // Filter out zero-quantity tickets for the email
    const selectedTickets = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => `${TICKET_TYPES.find(t => t.id === id).label} x${qty}`)
      .join(', ');

    const orderId = `HMA-${Math.floor(Math.random() * 900000) + 100000}`;

    try {
      // Use FormSubmit.co for zero-config real email delivery
      // It will send to the email address provided in the form
      const response = await fetch(`https://formsubmit.co/ajax/${formData.email}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "Subject": `Your High Museum Tickets: ${orderId}`,
          "Message": `Hello, ${formData.name}! Here is your order: ${orderId}`,
          "Name": formData.name,
          "Order ID": orderId,
          "Tickets": selectedTickets,
          "Total Amount": `$${total.toFixed(2)}`,
          "_template": "table",
          "_captcha": "false"
        })
      });

      if (response.ok) {
        setIsSubmitting(false);
        setStep(3);
      } else {
        throw new Error("FormSubmit response not OK");
      }
    } catch (err) {
      console.error("Email Error:", err);
      setEmailError("Failed to send confirmation. Please check your internet connection.");
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = Object.values(quantities).some(qty => qty > 0);
  const isStep2Valid = formData.name && formData.email.includes('@');

  return (
    <div className="bg-slate-50 min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(step - 1) * 50}%` }}
          ></div>

          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`relative z-10 w-10 h-10 flex items-center justify-center border-4 ${step >= s ? 'bg-black border-black text-white' : 'bg-white border-slate-200 text-slate-300'
                } transition-colors duration-500`}
            >
              {step > s ? <CheckCircle size={20} /> : <span className="font-black">{s}</span>}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border-4 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="unna-bold text-4xl mb-8 border-b-4 border-black pb-4">{t('tickets.title')}</h2>
              <div className="space-y-6 mb-12">
                {TICKET_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 group hover:border-black transition-colors">
                    <div>
                      <h3 className="font-black uppercase tracking-widest text-sm">{type.label}</h3>
                      <p className="unna text-xl text-slate-500">{type.price === 0 ? 'Free' : `$${type.price.toFixed(2)}`}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleQuantityChange(type.id, -1)}
                        className="w-10 h-10 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-all font-bold"
                      >
                        -
                      </button>
                      <span className="unna text-2xl font-bold w-4 text-center">{quantities[type.id]}</span>
                      <button
                        onClick={() => handleQuantityChange(type.id, 1)}
                        className="w-10 h-10 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-all font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-black text-white p-6 mb-8">
                <span className="text-xs font-black uppercase tracking-[0.3em]">{t('tickets.order_summary')}</span>
                <span className="unna text-3xl font-bold">${total.toFixed(2)}</span>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!isStep1Valid}
                  onClick={() => setStep(2)}
                  className={`flex items-center gap-2 px-10 py-4 unna-bold text-xl transition-all ${isStep1Valid ? 'bg-black text-white hover:bg-slate-800 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  Next Step <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border-4 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="unna-bold text-4xl mb-8 border-b-4 border-black pb-4">{t('tickets.contact')}</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('tickets.full_name')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                      required
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black outline-none transition-all unna text-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t('tickets.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                      required
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black outline-none transition-all unna text-xl"
                    />
                  </div>
                </div>

                {emailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700 unna"
                  >
                    <AlertCircle size={20} />
                    <p>{emailError}</p>
                  </motion.div>
                )}

                <div className="p-6 bg-slate-50 border-l-8 border-black space-y-2">
                  <p className="text-sm font-black uppercase tracking-tight">{t('tickets.order_summary')}</p>
                  <div className="unna text-lg opacity-60">
                    {Object.entries(quantities).map(([id, qty]) => qty > 0 && (
                      <div key={id} className="flex justify-between">
                        <span>{TICKET_TYPES.find(t => t.id === id).label} x {qty}</span>
                        <span>${(TICKET_TYPES.find(t => t.id === id).price * qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold text-black opacity-100">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-8 py-4 unna-bold text-xl text-black hover:bg-slate-100 transition-all border-2 border-black"
                  >
                    <ChevronLeft size={20} /> {t('tickets.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={!isStep2Valid || isSubmitting}
                    className={`flex items-center gap-2 px-10 py-4 unna-bold text-xl transition-all ${isStep2Valid && !isSubmitting ? 'bg-black text-white hover:bg-slate-800 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                  >
                    {isSubmitting ? '...' : t('tickets.complete')} <CreditCard size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-4 border-black p-12 md:p-20 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center"
            >
              <div className="w-24 h-24 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-8">
                <CheckCircle size={48} />
              </div>
              <h2 className="unna-bold text-5xl mb-6">{t('tickets.thank_you')}, {formData.name.split(' ')[0]}!</h2>
              <p className="unna text-2xl text-slate-600 mb-12 max-w-lg mx-auto leading-relaxed">
                {t('tickets.confirmed')} <strong className="text-black">{formData.email}</strong>.
              </p>

              <div className="bg-slate-50 p-8 border-2 border-dashed border-slate-200 mb-12">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t('tickets.order_summary')}</p>
                <p className="unna text-xl mb-2">{t('tickets.order_id')}: #HMA-{Math.floor(Math.random() * 900000) + 100000}</p>
                <div className="flex justify-center gap-4 text-sm font-bold opacity-60">
                  <span className="flex items-center gap-1"><Ticket size={14} /> {Object.values(quantities).reduce((a, b) => a + b, 0)} Tickets</span>
                  <span>|</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/'}
                className="bg-black text-white px-12 py-5 unna-bold text-2xl hover:bg-slate-800 transition-all shadow-xl"
              >
                {t('tickets.return_home')}
              </button>
            </motion.div>
          )}
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

export default Tickets;
