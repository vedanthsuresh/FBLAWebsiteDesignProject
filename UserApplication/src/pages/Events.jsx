import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CalendarView from '../components/CalendarView';
import featuredArtsImg from '../assets/images/featured-arts-img.png';
import artEventImg from '../assets/images/art-event.png';
import museumImg from '../assets/images/museum-img.png';

function Events() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/events')
      .then(res => res.json())
      .then(data => {
        const allEvents = [];
        const monthlyEvents = data.monthly_events[0];
        const today = new Date(); // Use actual today instead of mock

        Object.entries(monthlyEvents).forEach(([dateStr, events]) => {
          const eventDate = new Date(dateStr);
          if (eventDate >= today) {
            events.forEach(ev => {
              allEvents.push({ ...ev, date: dateStr });
            });
          }
        });

        // Sort by date and take first 3 unique titles
        const sorted = allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        const unique = [];
        const seen = new Set();
        for (const ev of sorted) {
          if (!seen.has(ev.title)) {
            unique.push(ev);
            seen.add(ev.title);
          }
          if (unique.length >= 3) break;
        }
        setFeaturedEvents(unique);
      })
      .catch(err => console.error("Failed to fetch featured events:", err));
  }, []);

  const getBadgeForEvent = (ev) => {
    if (ev.category) {
      const label = t(`events.categories.${ev.category.toLowerCase()}`);
      return label !== `events.categories.${ev.category.toLowerCase()}` ? label : ev.category;
    }
    return "Event";
  };
  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center events-page-header"
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center px-8 text-center w-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="unna-bold text-5xl md:text-7xl text-white max-w-4xl drop-shadow-lg mb-6"
          >
            {t('nav.events')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-white text-sm md:text-lg uppercase tracking-[0.2em] font-medium drop-shadow-md max-w-2xl"
          >
            {t('events.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Featured Exhibitions Section */}
      <section className="py-20 bg-white border-b-2 border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-4">{t('events.featured_title')}</h2>
            <div className="w-24 h-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((ev, idx) => (
                <div key={idx} className="group relative h-[450px] overflow-hidden border-2 border-black">
                  <img src={ev.image_url || featuredArtsImg} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex flex-col items-center justify-center text-center p-8" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black px-2 py-1 mb-4">{getBadgeForEvent(ev)}</span>
                    <h3 className="unna-bold text-3xl mb-4">{ev.title}</h3>
                    <p className="text-sm opacity-80 max-w-xs mx-auto line-clamp-3">{ev.description}</p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback skeleton or static placeholders if no dynamic events
              [1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-slate-50 border-2 border-slate-100 h-[450px]" />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-3 border-2 border-black text-xs font-black uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'}`}
            >
              {t('events.all_categories')}
            </button>
            {Object.entries(t('events.categories', { returnObjects: true })).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-6 py-3 border-2 border-black text-xs font-black uppercase tracking-widest transition-all ${activeCategory === key ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <CalendarView activeCategory={activeCategory} />
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Events;
