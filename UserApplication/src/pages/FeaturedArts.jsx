import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import maskImage from '../assets/images/african-art/mask.png';
import mamiwataImage from '../assets/images/african-art/mamiwata.png';
import quakerImage from '../assets/images/american-art/studyforthequaker.png';
import etaplesFisherFolk from '../assets/images/american-art/etaplesfisherfolk.png';
import blueLovesBlueFromTechnicolor from '../assets/images/decorative-art-and-design/bluelovesbluefromtechnicolor.png';
import untitledGreyFromTechnicolor from '../assets/images/decorative-art-and-design/untitledgreyfromtechnicolor.png';
import thatchedCottage from '../assets/images/european-art/thatched-cottage.png';
import thePeasant from '../assets/images/european-art/the-peasant.png';
import aFriendInNeed from '../assets/images/folk-and-self-taught-modern-art/afriendinneed.png';
import untitledTriangles from '../assets/images/folk-and-self-taught-modern-art/untitledtriangles.png';

function FeaturedArts() {
  const { t } = useTranslation();
  const [currentArtwork, setCurrentArtwork] = useState(0);

  const artworksData = t('artworks', { returnObjects: true });
  const artworkImages = [
    maskImage, mamiwataImage, quakerImage, etaplesFisherFolk,
    blueLovesBlueFromTechnicolor, untitledGreyFromTechnicolor,
    thatchedCottage, thePeasant, aFriendInNeed, untitledTriangles
  ];

  const artworks = artworksData.map((art, index) => ({
    ...art,
    id: index + 1,
    image: artworkImages[index]
  }));

  const nextArtwork = () => {
    setCurrentArtwork((prev) => (prev + 1) % artworks.length);
  };

  const prevArtwork = () => {
    setCurrentArtwork((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  return (
    <>
      {/* Hero Section with Background Image */}
      <section className="relative h-screen w-full">
        <div
          className="absolute inset-0 bg-cover bg-center featured-arts-page-header"
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
            {t('nav.featuredArts')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-white text-sm md:text-lg uppercase tracking-[0.2em] font-medium drop-shadow-md max-w-2xl"
          >
            {t('featured.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Artworks Carousel Section */}
      <section className="min-h-screen w-full bg-slate-50 px-8 py-20">
        <div className="max-w-6xl mx-auto">

          {/* Carousel Container */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-lg shadow-2xl bg-white"
            >
              {/* Artwork Items */}
              <div className="relative h-[600px] md:h-[600px] cursor-grab active:cursor-grabbing">
                {artworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, x: index === 0 ? 0 : 100 }}
                    animate={{
                      opacity: index === currentArtwork ? 1 : 0,
                      x: index === currentArtwork ? 0 : index < currentArtwork ? -100 : 100,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={`absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 p-8 md:p-12
                      ${index === currentArtwork ? 'z-10' : 'z-0 pointer-events-none'}`}
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
                    {/* Artwork Image */}
                    <div className="flex-1 flex items-center justify-center">
                      <img
                        src={artwork.image}
                        alt={`Photograph of the artwork ${artwork.artwork} by ${artwork.name}`}
                        className="max-w-full max-h-[300px] md:max-h-[500px] object-contain rounded-lg shadow-lg"
                      />
                    </div>
                    {/* Artwork Info */}
                    <div className="flex-1 flex flex-col justify-center text-center md:text-left h-full">
                      <div className="bg-slate-100/50 p-4 md:p-8 rounded-none border-l-4 border-black inline-block">
                        <h3 className="unna-bold text-2xl md:text-5xl mb-2 text-black leading-tight">
                          {artwork.artwork}
                        </h3>
                        <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-black mb-4 flex items-center gap-2 justify-center md:justify-start">
                          <span className="w-4 h-[1px] bg-black"></span>
                          {artwork.name}
                        </p>

                        <div className="flex items-center gap-2 mb-4 md:mb-6 text-slate-500">
                          <Info size={14} />
                          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{artwork.metadata}</span>
                        </div>

                        <p className="unna text-sm md:text-xl text-slate-800 leading-relaxed max-w-xl italic">
                          "{artwork.description}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

            </motion.div>

            {/* Dots Navigation */}
            <div className="flex justify-center items-center space-x-4 mt-8">
              {artworks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentArtwork(index)}
                  className={`rounded-full transition-all duration-300 shadow-sm
                    ${index === currentArtwork ? 'bg-black w-12 h-4' : 'bg-slate-300 w-4 h-4 hover:bg-slate-400'}`}
                  aria-label={`Go to artwork ${index + 1}`}
                />
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="unna-bold text-5xl md:text-2xl mt-15 mb-12 text-center"
            >
              {t('featured.see_more')}
            </motion.p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default FeaturedArts;