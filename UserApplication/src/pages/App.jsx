import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import '../index.css'
import Navigation from '../components/Navigation'
import ScrollToTop from '../components/ScrollToTop'
import Home from './Home'
import Events from './Events'
import FeaturedArts from './FeaturedArts'
import VisitorInformation from './VisitorInformation'
import Tickets from './Tickets'
import EventBooking from './EventBooking'
import Membership from './Membership'
import Newsletter from './Newsletter'
import Citations from './Citations'
import ChatBot from '../components/Chatbot'
import { AuthProvider } from '../context/AuthContext'
import Login from './Login'
import { CartProvider } from '../context/CartContext'
import CartSidebar from '../components/CartSidebar'

function App() {
  useEffect(() => {
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('visitor_session_id', sessionId);
    }

    const sendPing = () => {
      fetch('http://127.0.0.1:8000/api/visitor/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      }).catch(err => console.warn("Failed to ping visitor status:", err));
    };

    const sendDisconnect = () => {
      fetch(`http://127.0.0.1:8000/api/visitor/disconnect?session_id=${sessionId}`, {
        method: 'GET',
        keepalive: true
      }).catch(err => console.warn("Failed to send disconnect status:", err));
    };

    sendPing();
    const interval = setInterval(sendPing, 30000);

    window.addEventListener('beforeunload', sendDisconnect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', sendDisconnect);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <div>
          <ScrollToTop />

          <Navigation />

          <div id="scroll-container" className="h-screen overflow-y-scroll bg-white">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/featuredArts" element={<FeaturedArts />} />
              <Route path="/visitorInformation" element={<VisitorInformation />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/event-booking" element={<EventBooking />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/newsletter" element={<Newsletter />} />
              <Route path="/citations" element={<Citations />} />
              <Route path="/login" element={<Login />} />
            </Routes>
            <ChatBot />
          </div>
          <CartSidebar />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}


export default App;