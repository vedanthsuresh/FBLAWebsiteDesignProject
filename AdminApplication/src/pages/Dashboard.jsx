import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, LogOut, Palmtree, Image as ImageIcon, Mail, Save, Globe, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [newsletters, setNewsletters] = useState([]);

  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "", image_url: "", category: "exhibition" });
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });
  const [newArtwork, setNewArtwork] = useState({ title: "", creator: "", image_url: "", metadata_info: "", department: "African Art", curators_insight: "" });

  const [newsletterEditor, setNewsletterEditor] = useState({
    lang: "en",
    month: "",
    title: "",
    subtitle: "",
    introduction: "",
    sections: [],
    citation: "",
    verification_hash: "sha256:" + Math.random().toString(36).substring(2),
    publish_at: new Date().toISOString().slice(0, 16)
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchHolidays(), fetchArtworks(), fetchNewsletters()]);
    setLoading(false);
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/events`);
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/holidays`);
      const data = await res.json();
      setHolidays(data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const fetchArtworks = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/artworks`);
      const data = await res.json();
      setArtworks(data);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    }
  };

  const fetchNewsletters = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/newsletters?t=${Date.now()}`);
      const data = await res.json();
      setNewsletters(data);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        setNewEvent({ title: "", date: "", description: "", image_url: "", category: "exhibition" });
        fetchEvents();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleSaveNewsletter = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsletterEditor),
      });

      if (res.ok) {
        alert("Newsletter saved successfully!");
        fetchNewsletters();
      }
    } catch (error) {
      console.error("Error saving newsletter:", error);
    }
  };

  const handleDeleteNewsletter = async (id, e) => {
    e.stopPropagation(); // Avoid triggering the editor load
    if (!confirm("Are you sure you want to delete this newsletter?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/newsletter/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Clear editor if we just deleted the one being edited
        if (newsletterEditor.id === id) {
          setNewsletterEditor({
            lang: "en",
            month: "",
            title: "",
            subtitle: "",
            introduction: "",
            sections: [],
            citation: "",
            verification_hash: "sha256:" + Math.random().toString(36).substring(2),
            publish_at: new Date().toISOString().slice(0, 16)
          });
        }
        await fetchNewsletters();
      }
    } catch (error) {
      console.error("Error deleting newsletter:", error);
    }
  };

  const addNewsletterSection = () => {
    setNewsletterEditor({
      ...newsletterEditor,
      sections: [...newsletterEditor.sections, { title: "", content: "", type: "exhibition", image_url: "" }]
    });
  };

  const removeNewsletterSection = (index) => {
    const newSections = [...newsletterEditor.sections];
    newSections.splice(index, 1);
    setNewsletterEditor({ ...newsletterEditor, sections: newSections });
  };

  const updateSection = (index, field, value) => {
    const newSections = [...newsletterEditor.sections];
    newSections[index][field] = value;
    setNewsletterEditor({ ...newsletterEditor, sections: newSections });
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) return;
    try {
      const res = await fetch(`${API_URL}/holidays`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHoliday),
      });
      if (res.ok) {
        setNewHoliday({ name: "", date: "" });
        fetchHolidays();
      }
    } catch (error) {
      console.error("Error creating holiday:", error);
    }
  };

  const handleCreateArtwork = async (e) => {
    e.preventDefault();
    if (!newArtwork.title || !newArtwork.creator || !newArtwork.image_url) return;
    try {
      const res = await fetch(`${API_URL}/artworks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArtwork),
      });
      if (res.ok) {
        setNewArtwork({ title: "", creator: "", image_url: "", metadata_info: "", department: "African Art", curators_insight: "" });
        fetchArtworks();
      }
    } catch (error) {
      console.error("Error creating artwork:", error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await fetch(`${API_URL}/events/${id}`, { method: "DELETE" });
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await fetch(`${API_URL}/holidays/${id}`, { method: "DELETE" });
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const handleDeleteArtwork = async (id) => {
    if (!confirm("Are you sure you want to delete this artwork?")) return;
    try {
      await fetch(`${API_URL}/artworks/${id}`, { method: "DELETE" });
      fetchArtworks();
    } catch (error) {
      console.error("Error deleting artwork:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1 rounded">HM</div>
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === "events"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } flex items-center gap-2`}
          >
            <Calendar size={18} /> Events
          </button>
          <button
            onClick={() => setActiveTab("holidays")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === "holidays"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } flex items-center gap-2`}
          >
            <Palmtree size={18} /> Holidays
          </button>
          <button
            onClick={() => setActiveTab("artworks")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === "artworks"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } flex items-center gap-2`}
          >
            <ImageIcon size={18} /> Artworks
          </button>
          <button
            onClick={() => setActiveTab("newsletter")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === "newsletter"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } flex items-center gap-2`}
          >
            <Mail size={18} /> Monthly Newsletter
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === "events" ? (
            <>
              {/* Add New Event */}
              <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Event</h2>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. Jazz Night"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
                      placeholder="Event details..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={newEvent.image_url}
                      onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="/src/assets/images/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="exhibition">Exhibition</option>
                      <option value="workshop">Workshop</option>
                      <option value="talk">Talk</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Create Event
                  </button>
                </form>
              </div>

              {/* Event List */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Events</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-md">Date</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 rounded-tr-md text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {events.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-400">No events found.</td>
                        </tr>
                      ) : (
                        events.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-600 font-mono text-sm">{event.date}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{event.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 capitalize">{event.category}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === "holidays" ? (
            <>
              {/* Holiday UI Same as Before */}
              <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Holiday</h2>
                <form onSubmit={handleCreateHoliday} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                    <input
                      type="text"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md">Create Holiday</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Scheduled Holidays</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100">
                      {holidays.map((h) => (
                        <tr key={h.id}>
                          <td className="px-4 py-3">{h.date}</td>
                          <td className="px-4 py-3 font-medium">{h.name}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDeleteHoliday(h.id)} className="text-red-600"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === "artworks" ? (
            <>
              {/* Artwork UI Same as Before */}
              <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-100">
                <form onSubmit={handleCreateArtwork} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Title</label>
                    <input type="text" placeholder="Artwork Title" value={newArtwork.title} onChange={e => setNewArtwork({ ...newArtwork, title: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Creator</label>
                    <input type="text" placeholder="Artist / Creator" value={newArtwork.creator} onChange={e => setNewArtwork({ ...newArtwork, creator: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Department</label>
                    <select
                      value={newArtwork.department}
                      onChange={e => setNewArtwork({ ...newArtwork, department: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="African Art">African Art</option>
                      <option value="American Art">American Art</option>
                      <option value="Decorative Arts and Design">Decorative Arts and Design</option>
                      <option value="European Art">European Art</option>
                      <option value="Modern and Contemporary Art">Modern and Contemporary Art</option>
                      <option value="Photography">Photography</option>
                      <option value="Folk and Self-Taught Art">Folk and Self-Taught Art</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Image URL</label>
                    <input type="text" placeholder="https://..." value={newArtwork.image_url} onChange={e => setNewArtwork({ ...newArtwork, image_url: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Metadata Description</label>
                    <textarea
                      placeholder="Dimensions, medium, acquisition date, etc."
                      value={newArtwork.metadata_info}
                      onChange={e => setNewArtwork({ ...newArtwork, metadata_info: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Curator's Insight</label>
                    <textarea
                      placeholder="Context, history, and significance..."
                      value={newArtwork.curators_insight}
                      onChange={e => setNewArtwork({ ...newArtwork, curators_insight: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors shadow-md">
                    Add Artwork to Collection
                  </button>
                </form>
              </div>
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artworks.map(art => (
                    <div key={art.id} className="flex gap-4 p-4 border rounded-lg bg-gray-50 items-center">
                      <img src={art.image_url} className="w-16 h-16 object-cover rounded shadow-sm" alt={art.title} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{art.title}</p>
                        <p className="text-sm text-gray-500 truncate">{art.creator}</p>
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded mt-1 uppercase">
                          {art.department}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteArtwork(art.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Newsletter Management UI */}
              <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg border border-gray-100 scroll-mt-8">
                <div className="flex justify-between items-center mb-8 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Mail className="text-indigo-600" /> Newsletter Editor
                  </h2>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    {["en", "es", "fr"].map(l => (
                      <button
                        key={l}
                        onClick={() => setNewsletterEditor({ ...newsletterEditor, lang: l })}
                        className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${newsletterEditor.lang === l ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400"}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSaveNewsletter} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Publish Month</label>
                      <input
                        type="text"
                        placeholder="e.g. February 2026"
                        className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newsletterEditor.month}
                        onChange={e => setNewsletterEditor({ ...newsletterEditor, month: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Publish Date & Time (Scheduling)</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="datetime-local"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={newsletterEditor.publish_at}
                          onChange={e => setNewsletterEditor({ ...newsletterEditor, publish_at: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Main Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-bold"
                      value={newsletterEditor.title}
                      onChange={e => setNewsletterEditor({ ...newsletterEditor, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Subtitle</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none italic"
                      value={newsletterEditor.subtitle}
                      onChange={e => setNewsletterEditor({ ...newsletterEditor, subtitle: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Introduction Paragraph</label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newsletterEditor.introduction}
                      onChange={e => setNewsletterEditor({ ...newsletterEditor, introduction: e.target.value })}
                    />
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex justify-between items-center">
                      Content Sections
                      <button
                        type="button"
                        onClick={addNewsletterSection}
                        className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-[10px] hover:bg-indigo-100 transition-all flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Section
                      </button>
                    </h3>

                    <div className="space-y-8">
                      {newsletterEditor.sections.map((section, idx) => (
                        <div key={idx} className="bg-slate-50 p-6 rounded-xl relative group border border-slate-100">
                          <button
                            type="button"
                            onClick={() => removeNewsletterSection(idx)}
                            className="absolute -top-3 -right-3 bg-white text-gray-400 hover:text-red-500 shadow-sm border rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="md:col-span-3">
                              <label className="text-[10px] font-black uppercase text-gray-400">Section Title</label>
                              <input
                                type="text"
                                className="w-full bg-white border-b px-2 py-1 outline-none"
                                value={section.title}
                                onChange={e => updateSection(idx, "title", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase text-gray-400">Type</label>
                              <select
                                className="w-full bg-white border-b px-2 py-1 outline-none"
                                value={section.type}
                                onChange={e => updateSection(idx, "type", e.target.value)}
                              >
                                <option value="exhibition">Exhibition</option>
                                <option value="architecture">Architecture</option>
                                <option value="event">Event</option>
                                <option value="history">History</option>
                              </select>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="text-[10px] font-black uppercase text-gray-400">Section Content</label>
                            <textarea
                              rows="3"
                              className="w-full bg-white border px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                              value={section.content}
                              onChange={e => updateSection(idx, "content", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400">Image Address (URL)</label>
                            <div className="flex gap-2">
                              <div className="p-2 bg-white border rounded flex items-center justify-center text-gray-400">
                                <ImageIcon size={14} />
                              </div>
                              <input
                                type="text"
                                className="w-full bg-white border px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                                placeholder="https://example.com/image.jpg"
                                value={section.image_url || ""}
                                onChange={e => updateSection(idx, "image_url", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t flex flex-col gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Newsletter Citation</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. © 2026 High Museum of Art. All rights reserved."
                        value={newsletterEditor.citation}
                        onChange={e => setNewsletterEditor({ ...newsletterEditor, citation: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Save & Schedule
                    </button>
                  </div>
                </form>
              </div>

              {/* History / Drafts List */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Newsletter Archive</h3>
                <div className="space-y-4">
                  {newsletters.map(n => (
                    <div
                      key={n.id}
                      onClick={() => setNewsletterEditor({
                        ...n,
                        sections: n.sections || [],
                        publish_at: n.publish_at || new Date().toISOString().slice(0, 16)
                      })}
                      className="p-4 border rounded-lg hover:border-indigo-600 hover:bg-slate-50 cursor-pointer transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {n.lang}
                          </span>
                          <span className={`text-[10px] font-bold ${new Date(n.publish_at) > new Date() ? "text-amber-500" : "text-green-500"}`}>
                            {new Date(n.publish_at) > new Date() ? "Scheduled" : "Published"}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNewsletter(n.id, e)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-800 line-clamp-1">{n.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 uppercase tracking-tighter">
                        <Clock size={10} /> {new Date(n.publish_at).toLocaleDateString()} at {new Date(n.publish_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                  {newsletters.length === 0 && (
                    <p className="text-gray-400 italic text-sm text-center py-8">No newsletters found.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
