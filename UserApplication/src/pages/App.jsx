import { Routes, Route } from 'react-router-dom'
import '../index.css'
import Navigation from '../components/Navigation'
import ScrollToTop from '../components/ScrollToTop'
import Home from './Home'
import Events from './Events'
import FeaturedArts from './FeaturedArts'
import VisitorInformation from './VisitorInformation'
import Tickets from './Tickets'
import Membership from './Membership'
import Newsletter from './Newsletter'
import ChatBot from '../components/ChatBot'

function App() {
  return (
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
          <Route path="/membership" element={<Membership />} />
          <Route path="/newsletter" element={<Newsletter />} />
        </Routes>
        <ChatBot />
      </div>
    </div>
  )
}

export default App;