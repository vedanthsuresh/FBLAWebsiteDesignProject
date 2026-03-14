import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Info, LayoutGrid, Layers, Maximize2, X, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_URL = "http://127.0.0.1:8000/api";

function FeaturedArts() {
  const { t } = useTranslation();
  const [currentArtwork, setCurrentArtwork] = useState(0);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' or 'grid'
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('hma_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('hma_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch(`${API_URL}/artworks`);
        const data = await res.json();
        const formattedData = data.map(art => ({
          ...art,
          artwork: art.title,
          name: art.creator,
          description: art.curators_insight,
          metadata: art.metadata_info,
          image: art.image_url
        }));
        setArtworks(formattedData);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  const departments = useMemo(() => {
    const deps = new Set(artworks.map(art => art.department));
    return ['all', 'favorites', ...Array.from(deps)];
  }, [artworks]);

  const filteredArtworks = useMemo(() => {
    if (activeDepartment === 'favorites') {
      return artworks.filter(art => favorites.includes(art.id));
    }
    if (activeDepartment === 'all') return artworks;
    return artworks.filter(art => art.department === activeDepartment);
  }, [artworks, activeDepartment, favorites]);

  const nextArtwork = () => {
    setCurrentArtwork((prev) => (prev + 1) % filteredArtworks.length);
  };

  const prevArtwork = () => {
    setCurrentArtwork((prev) => (prev - 1 + filteredArtworks.length) % filteredArtworks.length);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:h-[80vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center featured-arts-page-header"
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative min-h-[60vh] md:min-h-[80vh] flex flex-col items-center justify-center px-6 py-12 md:py-20 text-center w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="unna-bold text-5xl md:text-8xl text-white max-w-5xl drop-shadow-2xl mb-6"
          >
            {t('nav.featuredArts')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/90 text-xs md:text-base uppercase tracking-[0.3em] font-semibold drop-shadow-lg max-w-xl"
          >
            {t('featured.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Gallery Controls Section — collapsible sticky dropdown */}
      <section className="sticky p-3 top-16 z-20 bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm">

        {/* Trigger row — always visible */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 md:px-8 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-400">Filter</span>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-black bg-slate-100 px-3 md:px-5 py-1 md:py-2 rounded-full">
              {activeDepartment === 'all'
                ? t('featured.all_departments')
                : activeDepartment === 'favorites'
                  ? t('featured.your_favorites')
                  : activeDepartment}
              {activeDepartment === 'favorites' && ` (${favorites.length})`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* View mode pills inline */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full shadow-inner">
              <button
                onClick={(e) => { e.stopPropagation(); setViewMode('carousel'); }}
                className={`flex items-center gap-1.5 px-3 md:px-5 py-1.5 md:py-2.5 text-[9px] md:text-xs font-black uppercase tracking-widest transition-all rounded-full
                  ${viewMode === 'carousel' ? 'bg-white shadow-md text-black' : 'text-slate-400'}`}
              >
                <Layers className="w-[11px] h-[11px] md:w-[14px] md:h-[14px]" />
                <span className="hidden sm:inline">{t('featured.view_carousel')}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setViewMode('grid'); }}
                className={`flex items-center gap-1.5 px-3 md:px-5 py-1.5 md:py-2.5 text-[9px] md:text-xs font-black uppercase tracking-widest transition-all rounded-full
                  ${viewMode === 'grid' ? 'bg-white shadow-md text-black' : 'text-slate-400'}`}
              >
                <LayoutGrid className="w-[11px] h-[11px] md:w-[14px] md:h-[14px]" />
                <span className="hidden sm:inline">{t('featured.view_grid')}</span>
              </button>
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Expandable filter grid */}
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 md:px-8 pb-4">
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-black/5">
                  {departments.map(dep => (
                    <button
                      key={dep}
                      onClick={() => {
                        setActiveDepartment(dep);
                        setCurrentArtwork(0);
                        setFiltersOpen(false);
                      }}
                      className={`flex-shrink-0 px-5 md:px-8 py-2 md:py-3 text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-widest transition-all rounded-full whitespace-nowrap flex items-center gap-2
                        ${activeDepartment === dep
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {dep === 'favorites' && <Heart size={14} fill={activeDepartment === 'favorites' ? 'white' : 'none'} className={activeDepartment === 'favorites' ? 'text-white' : 'text-slate-400'} />}
                      {dep === 'all'
                        ? t('featured.all_departments')
                        : dep === 'favorites'
                          ? t('featured.your_favorites')
                          : dep}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Main Content Section */}
      <section className="min-h-[50vh] w-full bg-white px-4 md:px-8 py-10 md:py-20">
        <div className="max-w-7xl mx-auto text-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-40 flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
                <p className="unna text-xl text-slate-400 italic">Curating your experience...</p>
              </motion.div>
            ) : filteredArtworks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-20 flex flex-col items-center justify-center space-y-6"
              >
                <div className="p-8 bg-slate-50 rounded-full">
                  <Heart size={48} className="text-slate-200" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="unna-bold text-3xl text-black mb-4">
                    {activeDepartment === 'favorites' ? t('featured.your_favorites') : t('featured.no_artworks')}
                  </h3>
                  <p className="unna text-xl text-slate-500 italic">
                    {activeDepartment === 'favorites'
                      ? t('featured.no_favorites')
                      : t('featured.no_artworks_desc')}
                  </p>
                </div>
                <button
                  onClick={() => setActiveDepartment('all')}
                  className="px-8 py-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-xl"
                >
                  {t('featured.all_departments')}
                </button>
              </motion.div>
            ) : viewMode === 'carousel' ? (
              /* Carousel View */
              <motion.div
                key="carousel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative"
              >
                {/* Draggable carousel — identical behavior to Home reviews carousel */}
                <motion.div
                  className="grid grid-cols-1 items-start cursor-grab active:cursor-grabbing rounded-[2.5rem] bg-slate-50 shadow-2xl border border-black/5 overflow-hidden"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, { offset }) => {
                    const swipeIsConfident = Math.abs(offset.x) > 50;
                    if (swipeIsConfident) {
                      if (offset.x > 0) {
                        prevArtwork();
                      } else {
                        nextArtwork();
                      }
                    }
                  }}
                >
                  {filteredArtworks.length > 0 ? filteredArtworks.map((artwork, index) => (
                    <div
                      key={artwork.id}
                      className={`col-start-1 row-start-1 transition-opacity duration-700 ease-in-out select-none
                        flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 p-8 md:p-16 lg:p-24
                        ${index === currentArtwork ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                    >
                      {/* Image */}
                      <div
                        className="w-full lg:flex-1 flex items-center justify-center cursor-zoom-in relative group"
                        onClick={() => setSelectedArtwork(artwork)}
                      >
                        <img
                          src={artwork.image}
                          alt={artwork.artwork}
                          className="max-w-full max-h-[260px] md:max-h-[420px] lg:max-h-[520px] object-contain drop-shadow-2xl rounded-2xl pointer-events-none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl">
                            <Maximize2 size={18} className="text-black" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="w-full lg:flex-1 flex flex-col justify-center text-center lg:text-left">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-3 block">
                          Featured Highlight
                        </span>
                        <h3 className="unna-bold text-3xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 text-black leading-tight">
                          {artwork.artwork}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-4 justify-center lg:justify-start">
                          <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] text-black bg-slate-100 px-3 md:px-4 py-1.5 rounded-full">
                            {artwork.name}
                          </p>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{artwork.metadata}</span>
                        </div>
                        <p className="unna text-base md:text-xl lg:text-2xl text-slate-800 leading-relaxed italic mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0">
                          "{artwork.description}"
                        </p>
                        <div className="flex items-center gap-3 justify-center lg:justify-start">
                          <button
                            onClick={() => setSelectedArtwork(artwork)}
                            className="px-6 md:px-8 py-3 md:py-4 bg-black text-white text-[9px] md:text-xs font-black uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-xl"
                          >
                            {t('featured.artwork_details')}
                          </button>
                          <button
                            onClick={() => toggleFavorite(artwork.id)}
                            className={`p-3 md:p-4 rounded-full border border-black/5 hover:bg-black hover:text-white transition-all shadow-md
                              ${favorites.includes(artwork.id) ? 'bg-black text-white' : 'bg-white text-black'}`}
                          >
                            <Heart size={16} fill={favorites.includes(artwork.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>

                      {/* Desktop nav arrows */}
                      {filteredArtworks.length > 1 && (
                        <div className="hidden lg:flex absolute bottom-10 right-10 gap-3 z-20">
                          <button onClick={(e) => { e.stopPropagation(); prevArtwork(); }} className="w-14 h-14 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full hover:bg-black hover:text-white transition-all shadow-xl">
                            <ChevronLeft size={22} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); nextArtwork(); }} className="w-14 h-14 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full hover:bg-black hover:text-white transition-all shadow-xl">
                            <ChevronRight size={22} />
                          </button>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="col-start-1 row-start-1 text-center p-20">
                      <p className="text-slate-400 unna italic text-2xl">{t('calendar.no_events')}</p>
                    </div>
                  )}
                </motion.div>

              </motion.div>
            ) : (
              /* Grid View */
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10"
              >
                {filteredArtworks.map((artwork, idx) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] shadow-lg border border-black/5 mb-4 md:mb-6">
                      <img
                        src={artwork.image}
                        alt={artwork.artwork}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3">
                        <button
                          onClick={() => setSelectedArtwork(artwork)}
                          className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                        >
                          <Maximize2 size={24} className="text-black" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(artwork.id);
                          }}
                          className={`w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl
                            ${favorites.includes(artwork.id) ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-md text-black'}`}
                        >
                          <Heart size={24} fill={favorites.includes(artwork.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                    <div className="px-2">
                      <h4
                        className="unna-bold text-2xl text-black mb-1 hover:text-slate-600 transition-all cursor-pointer truncate"
                        onClick={() => setSelectedArtwork(artwork)}
                      >
                        {artwork.artwork}
                      </h4>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {artwork.name}
                        </p>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <p className="text-[10px] font-bold text-slate-400">{artwork.department}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer CTA */}
          <div className="mt-32 pt-20 border-t border-black/5 text-center">
            <h2 className="unna-bold text-4xl md:text-6xl mb-6">{t('featured.see_more')}</h2>
            <p className="text-slate-400 font-semibold uppercase tracking-[0.3em] text-[10px] md:text-xs">
              Open Daily from 10:00 AM — 5:00 PM
            </p>
          </div>
        </div>
      </section>

      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArtwork(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-7xl max-h-[92vh] bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            >
              {/* Close Button Mobile */}
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/90 backdrop-blur-md text-black flex items-center justify-center rounded-full shadow-xl hover:scale-110 transition-transform lg:hidden"
              >
                <X size={24} />
              </button>

              {/* Image Section */}
              <div className="lg:flex-[1.4] bg-slate-50 p-6 md:p-12 lg:p-20 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-black/5 relative min-h-[300px] md:min-h-[400px]">
                <img
                  src={selectedArtwork.image}
                  alt={selectedArtwork.artwork}
                  className="max-w-full max-h-[250px] md:max-h-full object-contain drop-shadow-3xl"
                />
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 md:p-16 lg:p-24 overflow-y-auto custom-scrollbar relative">
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="absolute top-10 right-10 z-20 w-12 h-12 bg-slate-100 text-black hidden lg:flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-all"
                >
                  <X size={24} />
                </button>

                <div className="max-w-xl">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-4 md:mb-8 block">
                    {selectedArtwork.department}
                  </span>
                  <h3 className="unna-bold text-3xl md:text-5xl xl:text-6xl text-black mb-6 md:mb-10 leading-tight">
                    {selectedArtwork.artwork}
                  </h3>

                  <div className="space-y-8 md:space-y-12">
                    <section>
                      <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-black mb-4 md:mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-black/20"></span> Creator
                      </h5>
                      <p className="text-xl md:text-2xl font-bold text-black bg-slate-100/50 inline-block px-4 py-2 rounded-lg">
                        {selectedArtwork.name}
                      </p>
                    </section>

                    <section>
                      <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-black mb-4 md:mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-black/20"></span> Curator's Insight
                      </h5>
                      <p className="unna text-lg md:text-2xl text-slate-700 leading-relaxed italic border-l-4 border-slate-100 pl-4 md:pl-6 py-1 md:py-2">
                        "{selectedArtwork.description}"
                      </p>
                    </section>

                    <section>
                      <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-black mb-4 md:mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-black/20"></span> Technical Data
                      </h5>
                      <div className="bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Provenance & Medium</p>
                        <p className="text-base md:text-lg font-bold text-black">{selectedArtwork.metadata}</p>
                      </div>
                    </section>

                    <div className="pt-4 md:pt-8 flex flex-col sm:flex-row items-center gap-4">
                      <button
                        onClick={() => toggleFavorite(selectedArtwork.id)}
                        className={`w-full py-4 md:py-5 rounded-full flex items-center justify-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-98
                          ${favorites.includes(selectedArtwork.id)
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-black text-white border-black'}`}
                      >
                        <Heart size={18} fill={favorites.includes(selectedArtwork.id) ? 'currentColor' : 'none'} />
                        {favorites.includes(selectedArtwork.id) ? t('featured.remove_favorite') : t('featured.save_favorite')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )
        }
      </AnimatePresence >
      <Footer />
    </>
  );
}

export default FeaturedArts;