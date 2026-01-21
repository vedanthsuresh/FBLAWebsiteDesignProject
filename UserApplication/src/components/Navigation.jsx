import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div className={`
        fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center transition-transform duration-500 ease-in-out
        ${isMenuOpen ? "translate-y-0" : "-translate-y-full"} 
      `}>
        {/* Close Button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 right-8 text-5xl unna text-slate-400 hover:text-slate-800"
        >
          &times;
        </button>

        {/* Navigation Links */}
        <div className="flex flex-col items-center space-y-10">
          <Link to="/" className="text-3xl hover:text-slate-500 unna-bold" onClick={() => setIsMenuOpen(false)}>{t('nav.home')}</Link>
          <Link to="/events" className="text-3xl hover:text-slate-500 unna-bold" onClick={() => setIsMenuOpen(false)}>{t('nav.events')}</Link>
          <Link to="/featuredArts" className="text-3xl hover:text-slate-500 unna-bold" onClick={() => setIsMenuOpen(false)}>{t('nav.featuredArts')}</Link>
          <Link to="/visitorInformation" className="text-3xl hover:text-slate-500 unna-bold" onClick={() => setIsMenuOpen(false)}>{t('nav.visitorInfo')}</Link>
          <Link to="/newsletter" className="text-3xl hover:text-slate-500 unna-bold" onClick={() => setIsMenuOpen(false)}>{t('nav.newsletter')}</Link>

          <div className="flex gap-4 pt-8">
            <button onClick={() => changeLanguage('en')} className={`unna text-xl ${i18n.language === 'en' ? 'font-bold underline' : 'opacity-50'}`}>EN</button>
            <button onClick={() => changeLanguage('es')} className={`unna text-xl ${i18n.language === 'es' ? 'font-bold underline' : 'opacity-50'}`}>ES</button>
            <button onClick={() => changeLanguage('fr')} className={`unna text-xl ${i18n.language === 'fr' ? 'font-bold underline' : 'opacity-50'}`}>FR</button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-[100] border-b border-gray-100" aria-label="Main Navigation">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="High Museum of Art Home">
            <img
              src="/src/assets/images/high-logo.svg"
              alt="High Museum of Art - Official Logo"
              className="h-8"
            />
          </Link>

          {/* Hamburger Icon */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden flex flex-col justify-center items-end w-8 h-8 group"
            aria-label="Open Mobile Menu"
            aria-expanded={isMenuOpen}
          >
            <span className="w-8 h-0.5 bg-slate-800 mb-1.5 transition-all"></span>
            <span className="w-5 h-0.5 bg-slate-800 mb-1.5 transition-all group-hover:w-8"></span>
            <span className="w-8 h-0.5 bg-slate-800 transition-all"></span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 unna text-lg" role="menubar">
            <Link to="/" className="hover:text-slate-500" role="menuitem">{t('nav.home')}</Link>
            <Link to="/events" className="hover:text-slate-500" role="menuitem">{t('nav.events')}</Link>
            <Link to="/featuredArts" className="hover:text-slate-500" role="menuitem">{t('nav.featuredArts')}</Link>
            <Link to="/visitorInformation" className="hover:text-slate-500" role="menuitem">{t('nav.visitorInfo')}</Link>
            <Link to="/newsletter" className="hover:text-slate-500" role="menuitem">{t('nav.newsletter')}</Link>

            <div className="relative group ml-4 pl-4 border-l border-slate-200">
              <button className="flex items-center gap-2 hover:text-slate-500 transition-colors uppercase font-bold tracking-widest text-sm">
                <Globe size={16} /> {i18n.language?.split('-')[0]}
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-slate-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-2">
                <button onClick={() => changeLanguage('en')} className="px-4 py-2 hover:bg-slate-50 text-left text-sm unna">English</button>
                <button onClick={() => changeLanguage('es')} className="px-4 py-2 hover:bg-slate-50 text-left text-sm unna">Español</button>
                <button onClick={() => changeLanguage('fr')} className="px-4 py-2 hover:bg-slate-50 text-left text-sm unna">Français</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navigation;
