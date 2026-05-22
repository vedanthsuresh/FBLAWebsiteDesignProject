import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Ticket, User, Mail, CheckCircle, ChevronRight, ChevronLeft, CreditCard, AlertCircle, Calendar as CalendarIcon, Clock, X, ShoppingBag } from 'lucide-react';
import Footer from '../components/Footer';
import CalendarView from '../components/CalendarView';
import { useCart } from '../context/CartContext';

function Tickets() {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const TICKET_TYPES = [
    { id: 'adult', label: t('tickets.types.adult'), price: 16.50 },
    { id: 'student', label: t('tickets.types.student'), price: 14.50 },
    { id: 'senior', label: t('tickets.types.senior'), price: 14.50 },
    { id: 'member', label: t('tickets.types.member'), price: 0 }
  ];

  const TIME_SLOTS = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"];

  const [quantities, setQuantities] = useState({ adult: 0, student: 0, senior: 0, member: 0 });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

  const handleAddToCart = () => {
    Object.entries(quantities).forEach(([id, qty]) => {
      if (qty > 0) {
        const type = TICKET_TYPES.find(t => t.id === id);
        for(let i=0; i<qty; i++) {
          addToCart({
            title: `Museum Admission - ${type.label}`,
            description: `Date: ${selectedDate} | Entry: ${selectedTime}`,
            price: type.price
          });
        }
      }
    });

    // Reset Form
    setQuantities({ adult: 0, student: 0, senior: 0, member: 0 });
    setSelectedDate('');
    setSelectedTime('');
  };

  const isStep1Valid = Object.values(quantities).some(qty => qty > 0) && selectedDate !== '' && selectedTime !== '';

  return (
    <div className="bg-slate-50 min-h-screen pt-24 relative">
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
                <CalendarView isModal={true} activeCategory="general" disablePastDates={true} onDateSelect={(date) => {
                  const dStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  setSelectedDate(dStr);
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
              <h2 className="unna-bold text-4xl mb-8 border-b-4 border-black pb-4">{t('tickets.title')}</h2>
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
                      <Clock size={16} /> Select Entry Time
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {TIME_SLOTS.map(time => {
                        let isPastTime = false;
                        if (selectedDate) {
                          // Note: selectedDate from calendar is expected to be 'YYYY-MM-DD'
                          // To avoid timezone issues when parsing 'YYYY-MM-DD', extract components
                          const [y, m, d] = selectedDate.split('-');
                          const selDateObj = new Date(y, m - 1, d);
                          const now = new Date();
                          const isToday = now.toDateString() === selDateObj.toDateString();

                          if (isToday) {
                            const [timeStr, modifier] = time.split(' ');
                            let [hours, minutes] = timeStr.split(':');
                            hours = parseInt(hours, 10);
                            if (modifier === 'PM' && hours !== 12) hours += 12;
                            if (modifier === 'AM' && hours === 12) hours = 0;
                            
                            const slotDate = new Date();
                            slotDate.setHours(hours, parseInt(minutes, 10), 0, 0);
                            isPastTime = slotDate < now;
                          }
                        }

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => !isPastTime && setSelectedTime(time)}
                            disabled={isPastTime}
                            className={`py-3 px-2 border-2 transition-all font-bold tracking-widest text-xs uppercase ${
                              isPastTime
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                : selectedTime === time
                                  ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

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
                  onClick={handleAddToCart}
                  className={`flex items-center gap-2 px-10 py-4 unna-bold text-xl transition-all ${isStep1Valid ? 'bg-black text-white hover:bg-slate-800 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  <ShoppingBag size={20} /> Add to Cart
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

export default Tickets;
