import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Ticket, Coffee, ShoppingBag, Baby, Train } from 'lucide-react';

function VisitorInformation() {
  const { t } = useTranslation();
  const [museumStatus, setMuseumStatus] = useState({ isOpen: false, message: "Checking status..." });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [hoursRes, holidaysRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/hours'),
          fetch('http://127.0.0.1:8000/api/holidays')
        ]);

        const hoursData = await hoursRes.json();
        const holidaysData = await holidaysRes.json();

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const holidayName = Object.entries(holidaysData).find(([d]) => d === dateStr)?.[0];
        if (holidayName) {
          setMuseumStatus({ isOpen: false, message: `Closed for ${holidayName}` });
          return;
        }

        const dayIndex = now.getDay();
        const dayMap = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
        const dayName = dayMap[dayIndex];
        const dayHours = hoursData[dayName];

        if (!dayHours || dayHours === "Closed") {
          setMuseumStatus({ isOpen: false, message: "Closed today" });
          return;
        }

        const [startStr, endStr] = dayHours.split(" - ");
        const parseTime = (timeStr) => {
          const [time, modifier] = timeStr.split(" ");
          let [hours, minutes] = time.split(":");
          if (hours === "12" && modifier === "AM") hours = "00";
          else if (hours !== "12" && modifier === "PM") hours = parseInt(hours, 10) + 12;
          const date = new Date();
          date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          return date;
        };

        const startTime = parseTime(startStr);
        const endTime = parseTime(endStr);

        if (now >= startTime && now <= endTime) {
          setMuseumStatus({ isOpen: true, message: `Open until ${endStr}` });
        } else {
          setMuseumStatus({ isOpen: false, message: now < startTime ? `Opens at ${startStr}` : "Closed now" });
        }
      } catch (err) {
        setMuseumStatus({ isOpen: false, message: "Information unavailable" });
      }
    };
    fetchStatus();
  }, []);

  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", bounce: 0.4, duration: 0.8 }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative h-screen w-full">
        <div
          className="absolute inset-0 bg-cover bg-center visitor-information-page-header"
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center px-8 pt-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="unna-bold text-5xl md:text-7xl text-white max-w-4xl drop-shadow-lg mb-6"
          >
            {t('nav.visitorInfo')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-white text-sm md:text-lg uppercase tracking-[0.2em] font-medium drop-shadow-md max-w-2xl"
          >
            {t('visitor.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Main Content: Asymmetrical Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-24">

          {/* Column 1: Location & Transit (Span 7) */}
          <motion.div
            variants={cardVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.2 }}
            className="md:col-span-7 space-y-8"
          >
            <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-black text-white rounded-none" aria-hidden="true">
                  <MapPin size={32} />
                </div>
                <h2 className="unna-bold text-4xl md:text-6xl text-black">{t('visitor.loc_head')}</h2>
              </div>
              <p className="unna text-xl md:text-2xl text-slate-800 leading-relaxed mb-6">
                1280 Peachtree St. NE<br />
                Atlanta, GA 30309
              </p>
              <div className="flex items-start gap-4 p-6 bg-slate-100 border-l-8 border-black">
                <Train className="text-black shrink-0" size={24} aria-hidden="true" />
                <p className="text-sm font-bold uppercase tracking-tight text-black">
                  {t('visitor.marta_hint')}
                </p>
              </div>
            </div>

            {/* Architectural Significance Card */}
            <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300">
              <h3 className="unna-bold text-3xl mb-4">{t('visitor.arch_head')}</h3>
              <p className="unna text-lg text-slate-700 leading-relaxed mb-4">
                {t('visitor.arch_text1')}
                <strong>{t('visitor.arch_text1_strong')}</strong>
                {t('visitor.arch_text1_end')}
              </p>
              <p className="unna text-lg text-slate-700 leading-relaxed">
                {t('visitor.arch_text2')}
              </p>
            </div>

            <div className="bg-slate-200 p-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-8 border-b border-black pb-4">{t('visitor.amenities_head')}</h3>
              <div className="grid grid-cols-2 gap-8 text-black">
                <div className="space-y-2">
                  <Coffee size={24} />
                  <h4 className="font-bold text-sm tracking-tight">{t('visitor.dining')}</h4>
                  <p className="text-[10px] uppercase opacity-60">{t('visitor.dining_text')}</p>
                </div>
                <div className="space-y-2">
                  <ShoppingBag size={24} />
                  <h4 className="font-bold text-sm tracking-tight">{t('visitor.shop')}</h4>
                  <p className="text-[10px] uppercase opacity-60">{t('visitor.shop_text')}</p>
                </div>
                <div className="space-y-2">
                  <Baby size={24} />
                  <h4 className="font-bold text-sm tracking-tight">{t('visitor.families')}</h4>
                  <p className="text-[10px] uppercase opacity-60">{t('visitor.families_text')}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-2xl font-black">{t('visitor.accessibility')}</span>
                  <p className="text-[10px] uppercase opacity-60">{t('visitor.accessibility_text')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Hours & Live Status (Span 5) */}
          <motion.div
            variants={cardVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.2 }}
            className="md:col-span-5 space-y-8"
          >
            {/* Ticketing Card - NEW for Rubric */}
            <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Ticket className="text-black" size={32} aria-hidden="true" />
                <h2 className="unna-bold text-4xl text-black">{t('visitor.tickets_head')}</h2>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase tracking-widest">{t('tickets.types.adult')}</span>
                  <span className="unna text-xl">$16.50</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase tracking-widest">{t('tickets.types.student')}</span>
                  <span className="unna text-xl">$14.50</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase tracking-widest">{t('tickets.types.senior')}</span>
                  <span className="unna text-xl">$14.50</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 italic">
                  <span className="text-xs font-black uppercase tracking-widest">{t('tickets.types.member')}</span>
                  <span className="unna text-xl">{t('tickets.types.free')}</span>
                </div>
              </div>
              <Link
                to="/tickets"
                className="w-full bg-black text-white py-4 unna-bold text-xl hover:bg-slate-800 transition-colors shadow-lg inline-block text-center"
                aria-label={t('visitor.purchase_tickets')}
              >
                {t('visitor.purchase_tickets')}
              </Link>
              <p className="text-[10px] uppercase mt-4 text-center tracking-widest opacity-60">
                {t('visitor.tickets_desk')}
              </p>
            </div>

            <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Clock size={40} className="text-slate-100 -rotate-12 scale-150 origin-center" aria-hidden="true" />
              </div>

              <h2 className="unna-bold text-4xl md:text-6xl text-black mb-8">{t('visitor.hours_head')}</h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-black uppercase tracking-widest text-xs">{t('visitor.tue_sat')}</span>
                  <span className="unna text-xl">10 AM – 5 PM</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-black uppercase tracking-widest text-xs">{t('visitor.sun')}</span>
                  <span className="unna text-xl">12 PM – 5 PM</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-black uppercase tracking-widest text-xs">{t('visitor.mon')}</span>
                  <span className="unna text-xl italic">{t('visitor.closed')}</span>
                </div>
              </div>

              {/* Status Integration */}
              <div
                className={`p-4 ${museumStatus.isOpen ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'} hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300 flex items-center justify-between`}
                role="status"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full {museumStatus.isOpen ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('visitor.live_status')}</span>
                </div>
                <span className="text-xs font-bold">{museumStatus.message}</span>
              </div>
            </div>

            {/* Admission Promo Card */}
            <div className="bg-black text-white p-8 shadow-[12px_12px_0px_0px_rgba(200,200,200,1)]">
              <div className="flex items-center gap-3 mb-4">
                <Ticket size={24} aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-widest opacity-60">High Sundays</span>
              </div>
              <h3 className="unna-bold text-3xl mb-4">{t('visitor.second_sundays')}</h3>
              <p className="text-sm font-medium leading-relaxed opacity-80">
                {t('visitor.second_sundays_text_beginning')}
                <strong>{t('visitor.second_sundays_text_visitor_number')}</strong>
                {t('visitor.second_sundays_text_end')}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Professional Citations Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="p-8 bg-white border border-slate-200 rounded-sm unna"
        >
          <h4 className="font-bold mb-4 uppercase tracking-[0.2em] text-xs text-black">{t('visitor.verified_resources')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600 italic">
            <ul className="space-y-2 list-disc pl-4">
              <li>{t('visitor.resource1')} {t('visitor.and')} <strong>{t('visitor.resource1_strong_source1')}</strong> {t('visitor.and')} <strong>{t('visitor.resource1_strong_source2')}</strong>{t('visitor.period')}</li>
              <li>{t('visitor.resource2')} <strong>{t('visitor.resource2_strong_source1')}</strong>{t('visitor.period')}</li>
            </ul>
            <ul className="space-y-2 list-disc pl-4">
              <li>{t('visitor.resource3')} <strong>{t('visitor.resource3_strong_source1')}</strong> {t('visitor.resource3_end')}{t('visitor.period')}</li>
              <li>{t('visitor.resource4')} <strong>{t('visitor.resource4_strong_source1')}</strong>{t('visitor.period')}</li>
            </ul>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

export default VisitorInformation;