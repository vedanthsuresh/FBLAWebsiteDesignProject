
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter, Youtube, ExternalLink } from 'lucide-react';

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-black text-white py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-gray-800 pb-16">

          {/* Logo & Info */}
          <div className="md:col-span-1 space-y-6">
            <h2 className="unna-bold text-3xl md:text-4xl text-white">High Museum<br />of Art</h2>
            <div className="space-y-2 opacity-60 unna text-lg">
              <p>1280 Peachtree St NE</p>
              <p>Atlanta, GA 30309</p>
              <p className="mt-4">+1 404-733-4400</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">{t('footer.nav_head')}</h3>
            <ul className="space-y-4 unna text-lg">
              <li><Link to="/" className="hover:text-gray-400 transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/events" className="hover:text-gray-400 transition-colors">{t('nav.events')}</Link></li>
              <li><Link to="/featuredArts" className="hover:text-gray-400 transition-colors">{t('nav.featuredArts')}</Link></li>
              <li><Link to="/visitorInformation" className="hover:text-gray-400 transition-colors">{t('nav.visitorInfo')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">{t('footer.res_head')}</h3>
            <ul className="space-y-4 unna text-lg">
              <li><Link to="/tickets" className="hover:text-gray-400 transition-colors flex items-center gap-2 font-bold">{t('home.cta_tickets')} <ExternalLink size={14} /></Link></li>
              <li><Link to="/membership" className="hover:text-gray-400 transition-colors flex items-center gap-2 font-bold">{t('home.cta_membership')} <ExternalLink size={14} /></Link></li>
              <li><Link to="/newsletter" className="hover:text-gray-400 transition-colors flex items-center gap-2 font-bold">{t('nav.newsletter')} <ExternalLink size={14} /></Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">{t('footer.follow_head')}</h3>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/HighMuseumofArt/" aria-label="Follow us on Facebook" className="p-3 bg-gray-900 rounded-none hover:bg-white hover:text-black transition-all"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/highmuseumofart/?igsh=MWE2dXkwMTV3d3Vjbg%3D%3D#" aria-label="Follow us on Instagram" className="p-3 bg-gray-900 rounded-none hover:bg-white hover:text-black transition-all"><Instagram size={20} /></a>
              <a href="https://x.com/HighMuseumofArt" aria-label="Follow us on X" className="p-3 bg-gray-900 rounded-none hover:bg-white hover:text-black transition-all"><Twitter size={20} /></a>
              <a href="https://youtu.be/p8t26RglRmo" aria-label="Follow us on Youtube" className="p-3 bg-gray-900 rounded-none hover:bg-white hover:text-black transition-all"><Youtube size={20} /></a>
            </div>
          </div>
        </div>

        {/* Legal & FBLA Disclaimer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 opacity-40 unna text-sm">
          <div className="space-y-2">
            <p>&copy; {new Date().getFullYear()} High Museum of Art. {t('footer.educational')}</p>
            <p className="font-bold">{t('footer.disclaimer')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;