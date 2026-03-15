import { Plus, Trash2, Calendar, LogOut, Palmtree, Image as ImageIcon, Mail, Save, Globe, Clock, ChevronDown, ChevronUp, Users, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [users, setUsers] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", role: "admin" });
  const [showAdminPassword, setShowAdminPassword] = useState(true);

  const role = localStorage.getItem("admin_role");
  const token = localStorage.getItem("admin_token");

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
    const tasks = [fetchEvents(), fetchHolidays(), fetchArtworks(), fetchNewsletters()];
    if (role === "super_admin") {
      tasks.push(fetchUsers());
    }
    await Promise.all(tasks);
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
      const res = await fetch(`${API_URL}/admin/newsletters?t=${Date.now()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setNewsletters(data);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    }
  };

  const fetchUsers = async () => {
    if (role !== "super_admin") return;
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        alert("Event created successfully");
        setNewEvent({ title: "", date: "", description: "", image_url: "", category: "exhibition" });
        fetchEvents();
      } else if (res.status === 401) {
        alert("Session expired. Please log in again.");
        handleLogout();
      } else {
        const errorData = await res.json();
        alert(`Failed to create event: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Network error while creating event");
    }
  };

  const handleSaveNewsletter = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newsletterEditor),
      });

      if (res.ok) {
        alert("Newsletter saved successfully!");
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
        fetchNewsletters();
      }
    } catch (error) {
      console.error("Error saving newsletter:", error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password) return;
    if (role !== "super_admin") return;
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin),
      });
      if (res.ok) {
        alert("Admin created successfully");
        setNewAdmin({ email: "", password: "", role: "admin" });
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(`Failed to create admin: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Network error while creating admin");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`${API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) return;
    try {
      const res = await fetch(`${API_URL}/holidays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newHoliday),
      });
      if (res.ok) {
        alert("Holiday created successfully");
        setNewHoliday({ name: "", date: "" });
        fetchHolidays();
      } else {
        const errorData = await res.json();
        alert(`Failed to create holiday: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating holiday:", error);
      alert("Network error while creating holiday");
    }
  };

  const handleDeleteNewsletter = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this newsletter?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/newsletter/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
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

  const handleCreateArtwork = async (e) => {
    e.preventDefault();
    if (!newArtwork.title || !newArtwork.creator || !newArtwork.image_url) return;
    try {
      const res = await fetch(`${API_URL}/artworks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newArtwork),
      });
      if (res.ok) {
        alert("Artwork added successfully");
        setNewArtwork({ title: "", creator: "", image_url: "", metadata_info: "", department: "African Art", curators_insight: "" });
        fetchArtworks();
      } else if (res.status === 401) {
        alert("Session expired. Please log in again.");
        handleLogout();
      } else {
        const errorData = await res.json();
        alert(`Failed to add artwork: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error adding artwork:", error);
      alert("Network error while adding artwork");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await fetch(`${API_URL}/holidays/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const handleDeleteArtwork = async (id) => {
    if (!confirm("Are you sure you want to delete this artwork?")) return;
    try {
      const res = await fetch(`${API_URL}/artworks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Artwork deleted successfully");
        fetchArtworks();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting artwork:", error);
      alert("Network error while deleting artwork");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-12 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-light tracking-tighter text-black flex items-center gap-4 uppercase">
          <div className="bg-black text-white w-10 h-10 flex items-center justify-center font-bold text-xl">HM</div>
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-black flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 px-4 py-2 hover:border-black"
        >
          <LogOut size={14} /> Logout
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-12 overflow-x-auto no-scrollbar">
          {[
            { id: "events", icon: <Calendar size={16} />, label: "Events" },
            { id: "holidays", icon: <Palmtree size={16} />, label: "Holidays" },
            { id: "artworks", icon: <ImageIcon size={16} />, label: "Artworks" },
            { id: "newsletter", icon: <Mail size={16} />, label: "Newsletter" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all border-b-2 whitespace-nowrap flex items-center gap-3 ${activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          {role === "super_admin" && (
            <button
              onClick={() => setActiveTab("management")}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all border-b-2 whitespace-nowrap flex items-center gap-3 ${activeTab === "management"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}
            >
              <Users size={16} /> Team Management
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === "events" ? (
            <>
              {/* Add New Event */}
              <div className="bg-white p-10 rounded-none shadow-sm h-fit border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Add New Event</h2>
                <form onSubmit={handleCreateEvent} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Event Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="e.g. SOLSTICE GALA"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Category</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none bg-white transition-all text-sm"
                    >
                      <option value="talk">Talk</option>
                      <option value="workshop">Workshop</option>
                      <option value="exhibition">Exhibition</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newEvent.image_url}
                      onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none focus:ring-1 focus:ring-black outline-none min-h-[100px] text-sm italic"
                      placeholder="Event details..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 rounded-none hover:bg-gray-900 transition-all font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg flex items-center justify-center gap-3 mt-4"
                  >
                    <Plus size={14} /> Create Event
                  </button>
                </form>
              </div>

              {/* Event List */}
              <div className="lg:col-span-2 bg-white p-10 rounded-none shadow-sm border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Upcoming Events</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
                      <tr className="border-b border-gray-50">
                        <th className="px-4 py-4">Date</th>
                        <th className="px-4 py-4">Title</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {events.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-400">No events found.</td>
                        </tr>
                      ) : (
                        events.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-50 transition-all border-b border-gray-50 last:border-none">
                            <td className="px-4 py-6 text-gray-400 font-mono text-[10px]">{event.date}</td>
                            <td className="px-4 py-6 font-bold text-black uppercase tracking-tighter text-sm">{event.title}</td>
                            <td className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-gray-300 italic">{event.category}</td>
                            <td className="px-4 py-6 text-right">
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-gray-200 hover:text-black transition-all p-2 border border-transparent hover:border-black"
                              >
                                <Trash2 size={12} />
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
              <div className="bg-white p-10 rounded-none shadow-sm h-fit border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Add New Holiday</h2>
                <form onSubmit={handleCreateHoliday} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Holiday Name</label>
                    <input
                      type="text"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="e.g. MONARCH DAY"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Date</label>
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                    />
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-gray-900 transition-all mt-4">Create Holiday</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-10 rounded-none shadow-sm border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Scheduled Holidays</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-50">
                      {holidays.map((h) => (
                        <tr key={h.id} className="hover:bg-gray-50 transition-all">
                          <td className="px-4 py-4 text-sm font-mono text-gray-400">{h.date}</td>
                          <td className="px-4 py-4 font-bold text-black uppercase tracking-tighter">{h.name}</td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => handleDeleteHoliday(h.id)} className="text-gray-300 hover:text-black transition-all p-2 border border-transparent hover:border-black"><Trash2 size={16} /></button>
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
              <div className="bg-white p-10 rounded-none shadow-sm h-fit border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Add Artwork</h2>
                <form onSubmit={handleCreateArtwork} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Title</label>
                    <input type="text" placeholder="Artwork Title" value={newArtwork.title} onChange={e => setNewArtwork({ ...newArtwork, title: e.target.value })} className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Creator</label>
                    <input type="text" placeholder="Artist / Creator" value={newArtwork.creator} onChange={e => setNewArtwork({ ...newArtwork, creator: e.target.value })} className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Department</label>
                    <select
                      value={newArtwork.department}
                      onChange={e => setNewArtwork({ ...newArtwork, department: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all bg-white text-sm"
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
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Metadata</label>
                    <input type="text" placeholder="e.g. 20th Century • Wood, Pigment" value={newArtwork.metadata_info} onChange={e => setNewArtwork({ ...newArtwork, metadata_info: e.target.value })} className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm italic" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Curator's Insight</label>
                    <textarea placeholder="Insightful details about the piece..." value={newArtwork.curators_insight} onChange={e => setNewArtwork({ ...newArtwork, curators_insight: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-none focus:ring-1 focus:ring-black outline-none min-h-[80px] text-sm italic" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Image URL</label>
                    <input type="text" placeholder="https://..." value={newArtwork.image_url} onChange={e => setNewArtwork({ ...newArtwork, image_url: e.target.value })} className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm" />
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-4 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-gray-900 transition-all shadow-lg mt-4">
                    Add to Collection
                  </button>
                </form>
              </div>
              <div className="lg:col-span-2 bg-white p-10 rounded-none shadow-sm border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Artwork Collection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {artworks.map(art => (
                    <div key={art.id} className="flex gap-6 p-6 border-b border-gray-50 items-center hover:bg-gray-50 transition-all group">
                      <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                        <img src={art.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={art.title} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black uppercase tracking-tighter truncate text-sm">{art.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{art.creator}</p>
                        <span className="inline-block mt-3 px-2 py-0.5 border border-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-widest">
                          {art.department}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteArtwork(art.id)} className="text-gray-200 hover:text-black transition-all p-2">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === "management" ? (
            <>
              {/* Admin Management UI */}
              <div className="bg-white p-10 rounded-none shadow-sm h-fit border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Add New Admin</h2>
                <form onSubmit={handleCreateAdmin} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="admin@high.org"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? "password" : "text"}
                        required
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-0 top-2 text-gray-400 hover:text-black transition-colors"
                      >
                        {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Role</label>
                    <select
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all bg-white text-sm"
                    >
                      <option value="admin">Regular Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-gray-900 shadow-xl transition-all mt-4">
                    Grant Access
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-10 rounded-none shadow-sm border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Admin Management</h2>
                <div className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <div key={u.id} className="flex justify-between items-center py-6 px-2 hover:bg-gray-50 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 flex items-center justify-center border ${u.role === 'super_admin' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 group-hover:border-black group-hover:text-black transition-all'}`}>
                          {u.role === 'super_admin' ? <ShieldCheck size={20} /> : <Users size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-black uppercase tracking-tighter text-sm flex items-center gap-3">
                            {u.email}
                            {u.email === localStorage.getItem("admin_email") && (
                              <span className="text-[8px] font-black border border-black px-1.5 py-0.5 tracking-widest italic">OWNER</span>
                            )}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-1">
                            {u.role === 'super_admin' ? 'Super Admin' : 'Regular Admin'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAdmin(u.id)}
                        disabled={u.email === localStorage.getItem("admin_email")}
                        className={`p-3 transition-all ${u.email === localStorage.getItem("admin_email") ? 'opacity-0 cursor-not-allowed' : 'text-gray-200 hover:text-black hover:border-black border border-transparent'}`}
                        title={u.email === localStorage.getItem("admin_email") ? "You cannot delete yourself" : "Remove Admin"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Newsletter Management UI */}
              <div className="lg:col-span-2 bg-white p-10 rounded-none shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-12 pb-4 border-b border-black">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-black">Newsletter Editor</h2>
                  <div className="flex items-center gap-2 border border-gray-100 p-1">
                    {["en", "es", "fr"].map(l => (
                      <button
                        key={l}
                        onClick={() => setNewsletterEditor({ ...newsletterEditor, lang: l })}
                        className={`px-3 py-1 text-[10px] font-black uppercase transition-all ${newsletterEditor.lang === l ? "bg-black text-white" : "text-gray-300 hover:text-black"}`}
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

                  <div className="pt-10 border-t border-gray-100 flex flex-col gap-6">
                    <button
                      type="submit"
                      className="w-full py-4 bg-black text-white font-bold rounded-none shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[10px]"
                    >
                      <Save size={14} /> Save & Schedule
                    </button>
                  </div>
                </form>
              </div>

              {/* History / Drafts List */}
              <div className="bg-white p-10 rounded-none shadow-sm border border-gray-100 flex flex-col h-fit">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-black mb-8 pb-2 border-b border-black w-fit">Newsletter Archive</h3>
                <div className="space-y-6">
                  {newsletters.map(n => (
                    <div
                      key={n.id}
                      onClick={() => setNewsletterEditor({
                        ...n,
                        sections: n.sections || [],
                        publish_at: n.publish_at || new Date().toISOString().slice(0, 16)
                      })}
                      className="p-6 border border-gray-50 hover:border-black transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 border border-black group-hover:bg-black group-hover:text-white transition-all">
                            {n.lang}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${new Date(n.publish_at) > new Date() ? "text-gray-400" : "text-black"}`}>
                            {new Date(n.publish_at) > new Date() ? "Pending" : "Dispatched"}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNewsletter(n.id, e)}
                          className="text-gray-200 hover:text-black transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="font-bold text-black uppercase tracking-tighter text-sm line-clamp-1">{n.title}</p>
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-2 uppercase tracking-widest">
                        <Clock size={10} /> {new Date(n.publish_at).toLocaleDateString()}
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
