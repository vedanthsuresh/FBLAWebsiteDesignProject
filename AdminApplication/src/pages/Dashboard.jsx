import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, LogOut, Palmtree } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "" });
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchHolidays()]);
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
        setNewEvent({ title: "", date: "", description: "" });
        fetchEvents();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
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
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "events"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } flex items-center gap-2`}
          >
            <Calendar size={18} /> Events
          </button>
          <button
            onClick={() => setActiveTab("holidays")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "holidays"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } flex items-center gap-2`}
          >
            <Palmtree size={18} /> Holidays
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
                      placeholder="Event details..."
                    />
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
                {loading ? (
                  <p className="text-gray-500 italic">Loading events...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-md">Date</th>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3 rounded-tr-md text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {events.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-4 py-8 text-center text-gray-400">No events found.</td>
                          </tr>
                        ) : (
                          events.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-gray-600 font-mono text-sm">{event.date}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{event.title}</td>
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
                )}
              </div>
            </>
          ) : (
            <>
              {/* Add New Holiday */}
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
                      placeholder="e.g. Labor Day"
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
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Create Holiday
                  </button>
                </form>
              </div>

              {/* Holiday List */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Scheduled Holidays</h2>
                {loading ? (
                  <p className="text-gray-500 italic">Loading holidays...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-md">Date</th>
                          <th className="px-4 py-3">Holiday</th>
                          <th className="px-4 py-3 rounded-tr-md text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {holidays.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-4 py-8 text-center text-gray-400">No holidays found.</td>
                          </tr>
                        ) : (
                          holidays.map((holiday) => (
                            <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-gray-600 font-mono text-sm">{holiday.date}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{holiday.name}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteHoliday(holiday.id)}
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
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
