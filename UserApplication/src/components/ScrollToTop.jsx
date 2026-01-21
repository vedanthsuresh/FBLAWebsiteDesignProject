import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // We use requestAnimationFrame to ensure the scroll happens after the route change has rendered
    const scrollHandler = () => {
      const scrollContainer = document.getElementById('scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }
    };

    requestAnimationFrame(scrollHandler);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
