import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CalendarView from '../components/CalendarView';

function Events() {
  const { t } = useTranslation();
  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative h-screen w-full">
        <div
          className="absolute inset-0 bg-cover bg-center events-page-header"
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

      <section className="bg-slate-50 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <CalendarView />
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Events;
