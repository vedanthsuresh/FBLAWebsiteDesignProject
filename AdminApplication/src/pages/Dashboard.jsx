import { Plus, Trash2, Calendar, LogOut, Palmtree, Image as ImageIcon, Mail, Save, Globe, Clock, ChevronDown, ChevronUp, Users, ShieldCheck, Eye, EyeOff, Pencil, X, Ticket, Percent } from "lucide-react";
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
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ email: "", password: "" });
  const [showMemberPassword, setShowMemberPassword] = useState(true);
  const [ticketOptions, setTicketOptions] = useState([]);
  const [newTicketOption, setNewTicketOption] = useState({ name: "", code: "", price: "" });
  const [discountRates, setDiscountRates] = useState([]);
  const [newDiscountRate, setNewDiscountRate] = useState({ code: "", rate: "" });

  const role = localStorage.getItem("admin_role");
  const token = localStorage.getItem("admin_token");

  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "12:00 PM", description: "", image_url: "", category: "exhibition", recurrence: "none" });
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });
  const [newArtwork, setNewArtwork] = useState({ title: "", creator: "", image_url: "", metadata_info: "", department: "African Art", curators_insight: "", alt_text: "" });

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

  const [stats, setStats] = useState({ live_visitors: null, registered_members: null, tickets_booked_today: null });
  const [bookings, setBookings] = useState([]);
  const [bookingsDate, setBookingsDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingsCount, setBookingsCount] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editType, setEditType] = useState(""); // "event", "holiday", "artwork"
  const [editingItem, setEditingItem] = useState(null);
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const navigate = useNavigate();

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchData();
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [bookingsDate, bookingsPage, bookingsSearch]);

  const fetchData = async () => {
    setLoading(true);
    const tasks = [fetchEvents(), fetchHolidays(), fetchArtworks(), fetchNewsletters()];
    if (role === "super_admin") {
      tasks.push(fetchUsers());
      tasks.push(fetchMembers());
      tasks.push(fetchTicketOptions());
      tasks.push(fetchDiscountRates());
    }
    await Promise.all(tasks);
    setLoading(false);
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/events`);
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/holidays`);
      const data = await res.json();
      if (Array.isArray(data)) setHolidays(data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const fetchArtworks = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/artworks`);
      const data = await res.json();
      if (Array.isArray(data)) setArtworks(data);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    }
  };

  const fetchNewsletters = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/newsletters?t=${Date.now()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setNewsletters(data);
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
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMembers = async () => {
    if (role !== "super_admin") return;
    try {
      const res = await fetch(`${API_URL}/admin/members`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchTicketOptions = async () => {
    if (role !== "super_admin") return;
    try {
      const res = await fetch(`${API_URL}/tickets/options`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setTicketOptions(data);
    } catch (error) {
      console.error("Error fetching ticket options:", error);
    }
  };

  const fetchDiscountRates = async () => {
    if (role !== "super_admin") return;
    try {
      const res = await fetch(`${API_URL}/tickets/discounts`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setDiscountRates(data);
    } catch (error) {
      console.error("Error fetching discount rates:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/statistics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        date_str: bookingsDate,
        page: bookingsPage.toString(),
        limit: '20',
        search: bookingsSearch
      });
      const res = await fetch(`${API_URL}/admin/bookings?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setBookingsTotalPages(data.total_pages || 1);
        setBookingsCount(data.total_count || 0);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setBookingsLoading(false);
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
        setNewEvent({ title: "", date: "", time: "12:00 PM", description: "", image_url: "", category: "exhibition", recurrence: "none" });
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

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!newMember.email || !newMember.password) return;
    if (role !== "super_admin") return;
    try {
      const res = await fetch(`${API_URL}/admin/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...newMember, role: "member" }),
      });
      if (res.ok) {
        alert("Member created successfully");
        setNewMember({ email: "", password: "" });
        fetchMembers();
      } else {
        const errorData = await res.json();
        alert(`Failed to create member: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating member:", error);
      alert("Network error while creating member");
    }
  };

  const handleDeleteMember = async (id) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/members/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMembers();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete member: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleCreateTicketOption = async (e) => {
    e.preventDefault();
    if (!newTicketOption.name || !newTicketOption.code) return;
    if (role !== "super_admin") return;
    try {
      const res = await fetch(`${API_URL}/admin/tickets/options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newTicketOption.name,
          code: newTicketOption.code.trim().toLowerCase(),
          price: parseFloat(newTicketOption.price) || 0.0
        }),
      });
      if (res.ok) {
        alert("Ticket option created successfully");
        setNewTicketOption({ name: "", code: "", price: "" });
        fetchTicketOptions();
      } else {
        const errorData = await res.json();
        alert(`Failed to create ticket option: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating ticket option:", error);
      alert("Network error while creating ticket option");
    }
  };

  const handleDeleteTicketOption = async (id) => {
    if (!confirm("Are you sure you want to delete this ticket option?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/tickets/options/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTicketOptions();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete ticket option: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting ticket option:", error);
    }
  };

  const handleCreateDiscountRate = async (e) => {
    e.preventDefault();
    if (!newDiscountRate.code || !newDiscountRate.rate) return;
    if (role !== "super_admin") return;
    try {
      const res = await fetch(`${API_URL}/admin/tickets/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: newDiscountRate.code.trim().toUpperCase(),
          rate: parseFloat(newDiscountRate.rate) || 0.0,
          is_active: true
        }),
      });
      if (res.ok) {
        alert("Discount rate created successfully");
        setNewDiscountRate({ code: "", rate: "" });
        fetchDiscountRates();
      } else {
        const errorData = await res.json();
        alert(`Failed to create discount rate: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating discount rate:", error);
      alert("Network error while creating discount rate");
    }
  };

  const handleDeleteDiscountRate = async (id) => {
    if (!confirm("Are you sure you want to delete this discount rate?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/tickets/discounts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDiscountRates();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete discount rate: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting discount rate:", error);
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
        setNewArtwork({ title: "", creator: "", image_url: "", metadata_info: "", department: "African Art", curators_insight: "", alt_text: "" });
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

  const handleEdit = (item, type) => {
    setEditingItem({ ...item });
    setEditType(type);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    let url = "";
    if (editType === "event") url = `${API_URL}/events/${editingItem.id}`;
    if (editType === "holiday") url = `${API_URL}/holidays/${editingItem.id}`;
    if (editType === "artwork") url = `${API_URL}/artworks/${editingItem.id}`;

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        alert(`${editType.charAt(0).toUpperCase() + editType.slice(1)} updated successfully`);
        setIsEditModalOpen(false);
        setEditingItem(null);
        if (editType === "event") fetchEvents();
        if (editType === "holiday") fetchHolidays();
        if (editType === "artwork") fetchArtworks();
      } else if (res.status === 401) {
        alert("Session expired. Please log in again.");
        handleLogout();
      } else {
        const errorData = await res.json();
        alert(`Failed to update: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating:", error);
      alert("Network error while updating");
    }
  };

  const handleAddException = async (e) => {
    e.preventDefault();
    if (!newExceptionDate) return;
    try {
      const res = await fetch(`${API_URL}/events/${editingItem.id}/exceptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ exception_date: newExceptionDate }),
      });
      if (res.ok) {
        setNewExceptionDate("");
        const updatedEventsRes = await fetch(`${API_URL}/admin/events`);
        const updatedEvents = await updatedEventsRes.json();
        setEvents(updatedEvents);
        const updatedItem = updatedEvents.find(ev => ev.id === editingItem.id);
        if (updatedItem) setEditingItem(updatedItem);
      } else {
        const errorData = await res.json();
        alert(`Failed to add skip date: ${errorData.detail}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveException = async (dateStr) => {
    try {
      const res = await fetch(`${API_URL}/events/${editingItem.id}/exceptions/${dateStr}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedEventsRes = await fetch(`${API_URL}/admin/events`);
        const updatedEvents = await updatedEventsRes.json();
        setEvents(updatedEvents);
        const updatedItem = updatedEvents.find(ev => ev.id === editingItem.id);
        if (updatedItem) setEditingItem(updatedItem);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="text-2xl font-light tracking-tighter text-black flex items-center gap-4 uppercase font-sans">
          <div className="bg-black text-white w-10 h-10 flex items-center justify-center font-bold text-xl">HM</div>
          Admin Dashboard
        </h1>

        {/* Live Statistics Menu */}
        <div className="flex items-center gap-8 bg-slate-50 border border-slate-100 px-6 py-3 rounded-none">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Live Visitors</p>
              <p className="text-sm font-bold text-black font-mono">{stats.live_visitors ?? '...'}</p>
            </div>
          </div>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Members</p>
            <p className="text-sm font-bold text-black font-mono">{stats.registered_members ?? '...'}</p>
          </div>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Bookings Today</p>
            <p className="text-sm font-bold text-black font-mono">{stats.tickets_booked_today ?? '...'}</p>
          </div>
        </div>

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
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all border-b-2 whitespace-nowrap flex items-center gap-3 ${activeTab === "bookings"
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
              }`}
          >
            <Ticket size={16} /> Daily Bookings
          </button>
          {role === "super_admin" && (
            <>
              <button
                onClick={() => setActiveTab("management")}
                className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all border-b-2 whitespace-nowrap flex items-center gap-3 ${activeTab === "management"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                  }`}
              >
                <Users size={16} /> Team Management
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all border-b-2 whitespace-nowrap flex items-center gap-3 ${activeTab === "members"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                  }`}
              >
                <ShieldCheck size={16} /> Members
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all border-b-2 whitespace-nowrap flex items-center gap-3 ${activeTab === "tickets"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                  }`}
              >
                <Ticket size={16} /> Ticket Options
              </button>
              <button
                onClick={() => setActiveTab("discounts")}
                className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all border-b-2 whitespace-nowrap flex items-center gap-3 ${activeTab === "discounts"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                  }`}
              >
                <Percent size={16} /> Discount Rates
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === "bookings" ? (
            <div className="lg:col-span-3 bg-white p-10 rounded-none shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-4 border-b border-black">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-black">Daily Bookings Management</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                    {bookingsCount} {bookingsCount === 1 ? 'ticket' : 'tickets'} booked for this day
                  </p>
                </div>
                
                {/* Search & Date Controls */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date</label>
                    <input
                      type="date"
                      value={bookingsDate}
                      onChange={(e) => {
                        setBookingsDate(e.target.value);
                        setBookingsPage(1);
                      }}
                      className="border border-gray-200 px-3 py-1.5 text-xs focus:border-black outline-none bg-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search</label>
                    <input
                      type="text"
                      placeholder="Email or Event"
                      value={bookingsSearch}
                      onChange={(e) => {
                        setBookingsSearch(e.target.value);
                        setBookingsPage(1);
                      }}
                      className="border border-gray-200 px-3 py-1.5 text-xs focus:border-black outline-none bg-white"
                    />
                  </div>
                  {(bookingsSearch || bookingsDate !== new Date().toISOString().split('T')[0]) && (
                    <button
                      onClick={() => {
                        setBookingsSearch('');
                        setBookingsDate(new Date().toISOString().split('T')[0]);
                        setBookingsPage(1);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black border border-gray-100 hover:border-black px-3 py-1.5 transition-all"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {bookingsLoading ? (
                <div className="py-20 text-center text-gray-400 italic text-sm">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="py-20 text-center text-gray-400 italic text-sm">No bookings found for the selected criteria.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-4">Time</th>
                        <th className="px-4 py-4">Visitor Email</th>
                        <th className="px-4 py-4">Event/Ticket Title</th>
                        <th className="px-4 py-4 font-mono text-[9px] text-right">Booking ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((booking) => {
                        let timeString = 'N/A';
                        if (booking.event_datetime) {
                          try {
                            const dateObj = new Date(booking.event_datetime);
                            // Strip off offset formatting bugs if any
                            timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          } catch (e) {
                            console.error(e);
                          }
                        }
                        return (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-all border-b border-gray-50 last:border-none">
                            <td className="px-4 py-6 font-mono text-xs font-bold text-black uppercase">{timeString}</td>
                            <td className="px-4 py-6 text-sm font-medium text-black">{booking.email}</td>
                            <td className="px-4 py-6 text-sm text-gray-500 uppercase tracking-tight">{booking.event_title}</td>
                            <td className="px-4 py-6 text-right font-mono text-[10px] text-gray-300">#{booking.id}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {bookingsTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Page {bookingsPage} of {bookingsTotalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={bookingsPage <= 1}
                          onClick={() => setBookingsPage(prev => Math.max(1, prev - 1))}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                            bookingsPage <= 1
                              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          disabled={bookingsPage >= bookingsTotalPages}
                          onClick={() => setBookingsPage(prev => Math.min(bookingsTotalPages, prev + 1))}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                            bookingsPage >= bookingsTotalPages
                              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                              : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === "events" ? (
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
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Time</label>
                    <input
                      type="text"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="e.g. 10:00 AM"
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
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Recurrence</label>
                    <select
                      value={newEvent.recurrence || "none"}
                      onChange={(e) => setNewEvent({ ...newEvent, recurrence: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none bg-white transition-all text-sm"
                    >
                      <option value="none">None</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
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
                            <td className="px-4 py-6 text-gray-400 font-mono text-[10px]">{event.date} {event.time}</td>
                            <td className="px-4 py-6 font-bold text-black uppercase tracking-tighter text-sm flex items-center gap-2">
                              {event.title}
                              {event.recurrence && event.recurrence !== 'none' && (
                                <span className="text-[8px] font-black tracking-widest px-1.5 py-0.5 border border-black rounded-none">
                                  {event.recurrence}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-gray-300">{event.category}</td>
                            <td className="px-4 py-6 text-right flex justify-end items-center gap-2">
                              <button
                                onClick={() => handleEdit(event, "event")}
                                className="text-gray-400 hover:text-black transition-all p-2 border border-transparent hover:border-black"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-gray-400 hover:text-black transition-all p-2 border border-transparent hover:border-black"
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
                          <td className="px-4 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => handleEdit(h, "holiday")} className="text-gray-400 hover:text-black transition-all p-2 border border-transparent hover:border-black"><Pencil size={12} /></button>
                            <button onClick={() => handleDeleteHoliday(h.id)} className="text-gray-400 hover:text-black transition-all p-2 border border-transparent hover:border-black"><Trash2 size={12} /></button>
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
                    <input type="text" placeholder="https://..." value={newArtwork.image_url} onChange={e => setNewArtwork({ ...newArtwork, image_url: e.target.value })} className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm mb-6" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Alt Text (Accessibility)</label>
                    <input type="text" placeholder="Descriptive text for screen readers" value={newArtwork.alt_text || ""} onChange={e => setNewArtwork({ ...newArtwork, alt_text: e.target.value })} className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm" />
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
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleEdit(art, "artwork")} className="text-gray-400 hover:text-black transition-all p-2 border border-transparent hover:border-black">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDeleteArtwork(art.id)} className="text-gray-400 hover:text-black transition-all p-2">
                          <Trash2 size={12} />
                        </button>
                      </div>
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
          ) : activeTab === "members" ? (
            <>
              {/* Add New Member */}
              <div className="bg-white p-10 rounded-none shadow-sm h-fit border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Add New Member</h2>
                <form onSubmit={handleCreateMember} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Member Email</label>
                    <input
                      type="email"
                      required
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="member@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showMemberPassword ? "password" : "text"}
                        required
                        value={newMember.password}
                        onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                        className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMemberPassword(!showMemberPassword)}
                        className="absolute right-0 top-2 text-gray-400 hover:text-black transition-colors"
                      >
                        {showMemberPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-gray-900 shadow-xl transition-all mt-4">
                    Add Member
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-10 rounded-none shadow-sm border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Member Directory</h2>
                <div className="divide-y divide-gray-50">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-6">No members registered yet.</p>
                  ) : (
                    members.map((m) => (
                      <div key={m.id} className="flex justify-between items-center py-6 px-2 hover:bg-gray-50 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 flex items-center justify-center border border-gray-200 text-gray-400 group-hover:border-black group-hover:text-black transition-all">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-black uppercase tracking-tighter text-sm">
                              {m.email}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-1">
                              Museum Member
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-3 text-gray-200 hover:text-black hover:border-black border border-transparent transition-all"
                          title="Remove Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : activeTab === "tickets" ? (
            <>
              {/* Add New Ticket Option */}
              <div className="bg-white p-10 rounded-none shadow-sm h-fit border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Add Ticket Option</h2>
                <form onSubmit={handleCreateTicketOption} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Option Name</label>
                    <input
                      type="text"
                      required
                      value={newTicketOption.name}
                      onChange={(e) => setNewTicketOption({ ...newTicketOption, name: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="e.g. Adult"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Option Code</label>
                    <input
                      type="text"
                      required
                      value={newTicketOption.code}
                      onChange={(e) => setNewTicketOption({ ...newTicketOption, code: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="e.g. adult"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newTicketOption.price}
                      onChange={(e) => setNewTicketOption({ ...newTicketOption, price: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="e.g. 16.50"
                    />
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-gray-900 shadow-xl transition-all mt-4">
                    Add Option
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-10 rounded-none shadow-sm border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Ticket Categories</h2>
                <div className="divide-y divide-gray-50">
                  {ticketOptions.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-6">No ticket options configured.</p>
                  ) : (
                    ticketOptions.map((opt) => (
                      <div key={opt.id} className="flex justify-between items-center py-6 px-2 hover:bg-gray-50 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 flex items-center justify-center border border-gray-200 text-gray-400 group-hover:border-black group-hover:text-black transition-all">
                            <Ticket size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-black uppercase tracking-tighter text-sm flex items-center gap-3">
                              {opt.name}
                              <span className="text-[9px] font-bold border border-gray-300 px-1.5 py-0.5 text-gray-400 tracking-wider font-mono uppercase">{opt.code}</span>
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-1">
                              Price: ${opt.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTicketOption(opt.id)}
                          className="p-3 text-gray-200 hover:text-black hover:border-black border border-transparent transition-all"
                          title="Remove Option"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : activeTab === "discounts" ? (
            <>
              {/* Add New Discount Rate */}
              <div className="bg-white p-10 rounded-none shadow-sm h-fit border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Add Discount Rate</h2>
                <form onSubmit={handleCreateDiscountRate} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Promo Code</label>
                    <input
                      type="text"
                      required
                      value={newDiscountRate.code}
                      onChange={(e) => setNewDiscountRate({ ...newDiscountRate, code: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="e.g. SAVE10"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Discount Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newDiscountRate.rate}
                      onChange={(e) => setNewDiscountRate({ ...newDiscountRate, rate: e.target.value })}
                      className="w-full px-0 py-2 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                      placeholder="e.g. 10.0"
                    />
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-4 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-gray-900 shadow-xl transition-all mt-4">
                    Add Discount Rate
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-10 rounded-none shadow-sm border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-black pb-2 border-b border-black w-fit">Active Discount Rates</h2>
                <div className="divide-y divide-gray-50">
                  {discountRates.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-6">No discount rates configured.</p>
                  ) : (
                    discountRates.map((d) => (
                      <div key={d.id} className="flex justify-between items-center py-6 px-2 hover:bg-gray-50 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 flex items-center justify-center border border-gray-200 text-gray-400 group-hover:border-black group-hover:text-black transition-all">
                            <Percent size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-black uppercase tracking-tighter text-sm flex items-center gap-3">
                              {d.code}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-1">
                              Discount: {d.rate}% off
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDiscountRate(d.id)}
                          className="p-3 text-gray-200 hover:text-black hover:border-black border border-transparent transition-all"
                          title="Remove Discount Rate"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
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
                        className="bg-black text-white px-3 py-1 rounded-md text-[10px] hover:bg-white hover:text-black transition-all flex items-center gap-1"
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

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 relative">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingItem(null);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-black uppercase tracking-widest mb-8 pb-4 border-b">
              Edit {editType}
            </h2>

            <form onSubmit={handleUpdate} className="space-y-6">
              {editType === "event" && (
                <>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Date</label>
                    <input
                      type="date"
                      value={editingItem.date}
                      onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Time</label>
                    <input
                      type="text"
                      value={editingItem.time}
                      onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                      placeholder="e.g. 12:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Category</label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="talk">Talk</option>
                      <option value="workshop">Workshop</option>
                      <option value="exhibition">Exhibition</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Recurrence</label>
                    <select
                      value={editingItem.recurrence || "none"}
                      onChange={(e) => setEditingItem({ ...editingItem, recurrence: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="none">None</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {editingItem.recurrence && editingItem.recurrence !== 'none' && (
                    <div className="bg-gray-50 border border-gray-100 p-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-black mb-4">Exceptions (Skip Dates)</h4>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="date"
                          value={newExceptionDate}
                          onChange={(e) => setNewExceptionDate(e.target.value)}
                          className="flex-1 px-4 py-2 bg-white border-none outline-none focus:ring-1 focus:ring-black text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddException}
                          className="px-6 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors"
                        >
                          Add Skip
                        </button>
                      </div>
                      {editingItem.exception_dates && editingItem.exception_dates.length > 0 ? (
                        <ul className="space-y-2">
                          {editingItem.exception_dates.map(dateStr => (
                            <li key={dateStr} className="flex items-center justify-between text-sm py-2 border-b border-gray-200">
                              <span className="font-mono text-gray-600">{dateStr}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveException(dateStr)}
                                className="text-gray-400 hover:text-black transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No exceptions added yet.</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Description</label>
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={editingItem.image_url}
                      onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </>
              )}

              {editType === "holiday" && (
                <>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Holiday Name</label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Date</label>
                    <input
                      type="date"
                      value={editingItem.date}
                      onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                </>
              )}

              {editType === "artwork" && (
                <>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Creator</label>
                    <input
                      type="text"
                      value={editingItem.creator}
                      onChange={(e) => setEditingItem({ ...editingItem, creator: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Department</label>
                    <select
                      value={editingItem.department}
                      onChange={(e) => setEditingItem({ ...editingItem, department: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
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
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Metadata</label>
                    <input
                      type="text"
                      value={editingItem.metadata_info}
                      onChange={(e) => setEditingItem({ ...editingItem, metadata_info: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Curator's Insight</label>
                    <textarea
                      value={editingItem.curators_insight}
                      onChange={(e) => setEditingItem({ ...editingItem, curators_insight: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={editingItem.image_url}
                      onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black mb-4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Alt Text (Accessibility)</label>
                    <input
                      type="text"
                      value={editingItem.alt_text || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, alt_text: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-black"
                      placeholder="Descriptive text for screen readers"
                    />
                  </div>
                </>
              )}

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
