import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

// Importing images for thumbnails
import maskImage from '../assets/images/african-art/mask.png';
import mamiwataImage from '../assets/images/african-art/mamiwata.png';
import quakerImage from '../assets/images/american-art/studyforthequaker.png';
import etaplesFisherFolk from '../assets/images/american-art/etaplesfisherfolk.png';
import blueLovesBlue from '../assets/images/decorative-art-and-design/bluelovesbluefromtechnicolor.png';
import untitledGrey from '../assets/images/decorative-art-and-design/untitledgreyfromtechnicolor.png';
import thatchedCottage from '../assets/images/european-art/thatched-cottage.png';
import thePeasant from '../assets/images/european-art/the-peasant.png';
import aFriendInNeed from '../assets/images/folk-and-self-taught-modern-art/afriendinneed.png';
import untitledTriangles from '../assets/images/folk-and-self-taught-modern-art/untitledtriangles.png';
import fiveStars from '../assets/images/five-stars.png';

function Citations() {
  const { t } = useTranslation();
  const artworks = t('artworks', { returnObjects: true });

  const artworkImages = [
    maskImage, mamiwataImage, quakerImage, etaplesFisherFolk,
    blueLovesBlue, untitledGrey, thatchedCottage, thePeasant,
    aFriendInNeed, untitledTriangles
  ];

  const citations = {
    institutional: [
      {
        title: "High Museum of Art - Official Website",
        citation: "High Museum of Art. High Museum of Art, 2024, www.high.org. Accessed 1 Mar. 2026.",
        desc: "Source for hours, location, ticket pricing, and visitor policies."
      },
      {
        title: "American Institute of Architects (AIA) 1991 Citation",
        citation: "American Institute of Architects. 'The 1991 Honor Awards.' AIA Archives, 1991.",
        desc: "Verification for the architectural significance of the Richard Meier building."
      },
      {
        title: "MARTA Official Guide",
        citation: "Metropolitan Atlanta Rapid Transit Authority. 'Arts Center Station Guide.' MARTA, 2024, www.itsmarta.com.",
        desc: "Confirmation of public transportation access to the museum campus."
      }
    ],
    multimedia: [
      {
        title: "Hero Section Video",
        citation: "High Museum of Art. 'Museum Exterior and Gallery Walkthrough.' High Museum Digital Archives, 2024.",
        thumbnail: "/src/assets/videos/MOV_0659.mp4",
        isVideo: true,
        desc: "Used as the cinematic background for the homepage hero section."
      },
      {
        title: "Visitor Rating Assets",
        citation: "HMA Design System. 'Five Star Rating Icon.' 2024.",
        thumbnail: fiveStars,
        desc: "Graphic asset used in the visitor reviews section."
      }
    ]
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] w-full flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-black to-slate-900" />
        </div>
        <div className="relative z-10 text-center px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="unna-bold text-5xl md:text-7xl text-white mb-4"
          >
            Citations & Sources
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 uppercase tracking-[0.3em] text-xs font-black"
          >
            Verified Professional Evidence
          </motion.p>
        </div>
      </section>

      {/* Fair Use Statement */}
      <section className="py-20 px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border-l-4 border-black p-8 md:p-12 mb-20"
        >
          <h2 className="unna-bold text-3xl mb-4">Fair Use Statement</h2>
          <p className="unna text-lg text-slate-700 leading-relaxed italic">
            "This website is an educational project created for the FBLA Website Design competition. It uses copyrighted materials, including artwork images and institutional data, under the <strong>Fair Use</strong> doctrine of U.S. Copyright Law (Section 107). These materials are used for non-profit, educational purposes only, and are intended to demonstrate website design and technical implementation skills. The project does not seek to profit from or replace the original works of the High Museum of Art or its artists."
          </p>
        </motion.div>

        {/* Institutional Sources */}
        <div className="mb-24">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-10 border-b pb-4">Institutional Sources</h2>
          <div className="grid grid-cols-1 gap-12">
            {citations.institutional.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <h3 className="unna-bold text-2xl mb-2 group-hover:text-amber-600 transition-colors">{item.title}</h3>
                <p className="font-mono text-sm text-slate-600 mb-2 p-4 bg-slate-50 border border-slate-100 rounded">
                  {item.citation}
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Artwork Citations */}
        <div className="mb-24">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-10 border-b pb-4">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {artworks.map((art, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex gap-6 items-start"
              >
                <div className="w-24 h-24 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={artworkImages[i]}
                    alt={art.artwork}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="unna-bold text-xl mb-1">{art.artwork}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{art.name}</p>
                  <p className="text-sm font-mono text-slate-600 italic bg-white p-2 border border-slate-100">
                    {art.name}. {art.artwork}. {art.metadata.split(' • ')[0]}, {art.metadata.split(' • ')[2].replace(' Dept.', '')}, High Museum of Art.
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Multimedia Sources */}
        <div className="mb-24">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-10 border-b pb-4">Multimedia Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {citations.multimedia.map((item, i) => (
              <div key={i} className="flex gap-6 items-center">
                <div className="w-32 h-20 flex-shrink-0 bg-black overflow-hidden relative border border-slate-200">
                  {item.isVideo ? (
                    <video className="w-full h-full object-cover opacity-50" muted autoplay loop>
                      <source src={item.thumbnail} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={item.thumbnail} className="w-full h-full object-contain p-2" />
                  )}
                </div>
                <div>
                  <h3 className="unna-bold text-lg">{item.title}</h3>
                  <p className="text-xs font-mono text-slate-500">{item.citation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Citations;
