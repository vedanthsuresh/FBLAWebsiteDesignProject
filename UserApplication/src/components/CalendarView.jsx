import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function CalendarView() {
  const { t, i18n } = useTranslation();
  const [eventsData, setEventsData] = useState({});
  const [holidays, setHolidays] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 1));
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Event descriptions mapping
  const eventDescriptions = {
    [t('calendar.general_admission')]: t('calendar.ga_desc'),
  };

  const getEventDescription = (event) => {
    if (typeof event === 'object' && event.description) {
      return event.description;
    }
    const title = typeof event === 'object' ? event.title : event;
    return eventDescriptions[title] || `${t('nav.featuredArts')} - High Museum of Art.`;
  };

  useEffect(() => {
    // Fetch events
    fetch('http://127.0.0.1:8000/api/events')
      .then(res => res.json())
      .then(data => setEventsData(data.monthly_events[0]))
      .catch(err => console.error("Failed to fetch events:", err));

    // Fetch holidays
    fetch('http://127.0.0.1:8000/api/holidays')
      .then(res => res.json())
      .then(data => {
        const transformed = {};
        Object.entries(data).forEach(([name, date]) => {
          transformed[date] = name;
        });
        setHolidays(transformed);
      })
      .catch(err => console.error("Failed to fetch holidays:", err));
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const monthIndex = dateObj.getMonth();
    const day = dateObj.getDate();
    const dayOfWeek = dateObj.getDay();

    const mStr = String(monthIndex + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const key = `${year}-${mStr}-${dStr}`;

    if (holidays[key]) {
      return [];
    }

    const apiEvents = eventsData[key] || [];
    const isFirstWeek = day <= 7;
    const isFirstSunTueWed = isFirstWeek && [0, 2, 3].includes(dayOfWeek);

    const gaLabel = t('calendar.general_admission');

    if (dayOfWeek !== 1 || isFirstSunTueWed) {
      return [gaLabel, ...apiEvents];
    }
    return apiEvents;
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null); // Reset selected event when changing date
    if (window.innerWidth < 1024) {
      document.getElementById('daily-events-panel')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    if (window.innerWidth < 1024) {
      document.getElementById('event-detail-card')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectedDayEvents = getEventsForDate(selectedDate);
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const isHoliday = holidays[selectedDateStr];

  const renderIndicators = (events) => {
    const gaLabel = t('calendar.general_admission');
    const hasGA = events.some(e => (typeof e === 'string' ? e : e.title) === gaLabel);
    const specialEvents = events.filter(e => (typeof e === 'string' ? e : e.title) !== gaLabel);

    return (
      <div className="flex flex-col gap-1 w-full mt-auto">
        {hasGA && (
          <div className="h-1.5 md:h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
            <div className="h-full w-full bg-black/10" />
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-0.5">
          {specialEvents.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${i % 2 === 0 ? 'bg-black' : 'bg-gray-400'
                }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start bg-white p-4 md:p-8">

      {/* LEFT: Calendar Grid */}
      <div className="flex-1 bg-white border border-black overflow-hidden w-full transition-all">
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-black bg-white">
          <div>
            <h2 className="text-2xl md:text-4xl unna-bold text-black">
              {currentDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={prevMonth}
              className="w-10 h-10 flex items-center justify-center bg-white border border-black hover:bg-black hover:text-white transition-all active:scale-95 font-bold text-lg"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="w-10 h-10 flex items-center justify-center bg-white border border-black hover:bg-black hover:text-white transition-all active:scale-95 font-bold text-lg"
            >
              →
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 bg-white border-b border-black">
          {[...Array(7)].map((_, i) => {
            const date = new Date(2026, 0, 4 + i); // Jan 4, 2026 is Sunday
            const dayName = date.toLocaleDateString(i18n.language, { weekday: 'short' });
            return (
              <div key={i} className="py-4 text-center text-xs font-black uppercase tracking-[0.3em] text-black">
                {dayName}
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-black gap-[1px]">
          {/* Previous Month Days */}
          {[...Array(firstDay)].map((_, i) => {
            const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            const prevMonthDays = prevMonthDate.getDate();
            const day = prevMonthDays - firstDay + i + 1;
            const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
            const dayEvents = getEventsForDate(thisDate);
            const isSelected = selectedDate.toDateString() === thisDate.toDateString();

            return (
              <div
                key={`prev-${day}`}
                onClick={() => handleDayClick(thisDate)}
                className={`min-h-[70px] md:min-h-[100px] p-3 md:p-4 transition-all cursor-pointer relative flex flex-col ${isSelected
                  ? 'bg-gray-100 ring-4 ring-inset ring-black z-10'
                  : 'bg-white text-gray-300 hover:bg-gray-50'
                  }`}
              >
                <span className="text-sm font-bold opacity-30">{day}</span>
                {dayEvents.length > 0 && (
                  <div className="mt-auto opacity-20 grayscale">
                    {renderIndicators(dayEvents)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Current Month Days */}
          {[...Array(days)].map((_, i) => {
            const day = i + 1;
            const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = getEventsForDate(thisDate);
            const isToday = new Date().toDateString() === thisDate.toDateString();
            const isSelected = selectedDate.toDateString() === thisDate.toDateString();

            return (
              <div
                key={day}
                onClick={() => handleDayClick(thisDate)}
                className={`min-h-[70px] md:min-h-[100px] p-3 md:p-4 transition-all cursor-pointer group relative flex flex-col ${isSelected
                  ? 'bg-gray-50 ring-4 ring-inset ring-black z-10'
                  : 'bg-white hover:bg-gray-50'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-lg font-black transition-all ${isSelected ? 'text-black' : isToday ? 'underline decoration-4 underline-offset-4' : 'text-black'
                    }`}>
                    {day}
                  </span>
                </div>

                <div className="mt-auto">
                  {renderIndicators(dayEvents)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Daily Events List */}
      <div id="daily-events-panel" className="w-full lg:w-[450px] bg-white border border-black p-8 md:p-12 sticky top-8 h-fit self-start transition-all">
        <div className="mb-12 border-b-4 border-black pb-8">
          <h3 className="text-sm font-black tracking-[0.4em] text-black uppercase mb-4">
            {selectedDate.toLocaleDateString(i18n.language, { weekday: 'long' })}
          </h3>
          <h2 className="text-5xl md:text-6xl unna-bold text-black leading-none uppercase">
            {selectedDate.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric' })}
          </h2>
        </div>

        {/* Event Detail Card */}
        {selectedEvent && (
          <div id="event-detail-card" className="mb-8 p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setSelectedEvent(null)}
              className="mb-4 text-sm font-black uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
            >
              ← {t('calendar.back_to_events')}
            </button>
            <h3 className="text-3xl md:text-4xl unna-bold text-black mb-4 leading-tight">
              {typeof selectedEvent === 'string' ? selectedEvent : selectedEvent.title}
            </h3>
            <p className="unna text-base md:text-lg text-slate-700 leading-relaxed">
              {getEventDescription(selectedEvent)}
            </p>
          </div>
        )}

        <div className="space-y-8">
          {isHoliday ? (
            <div className="py-16 text-center border-2 border-black border-dashed">
              <div className="text-5xl mb-6">●</div>
              <h4 className="text-2xl font-black text-black mb-2">{t('calendar.closed_for')} {isHoliday}</h4>
              <p className="text-gray-600 text-sm font-medium px-8 leading-relaxed">
                {t('calendar.closed_today_desc')}
              </p>
            </div>
          ) : selectedDayEvents.length === 0 ? (
            <div className="py-16 text-center border border-gray-200">
              <p className="text-gray-400 italic font-medium uppercase tracking-widest text-xs">{t('calendar.no_events')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayEvents.map((ev, i) => {
                const title = typeof ev === 'string' ? ev : ev.title;
                const isSelected = (typeof selectedEvent === 'string' ? selectedEvent : selectedEvent?.title) === title;
                return (
                  <button
                    key={i}
                    onClick={() => handleEventClick(ev)}
                    className={`group w-full text-left p-6 border-b border-black transition-all hover:bg-gray-50 active:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xl md:text-2xl unna-bold leading-tight group-hover:underline">
                        {title}
                      </span>
                      <span className="text-black opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                        →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Context Tip */}
        <div className="mt-16 p-8 bg-gray-100 border-l-8 border-black">
          <p className="text-sm text-black leading-relaxed font-bold uppercase tracking-tight">
            <span className="bg-black text-white px-2 py-0.5 mr-2">{t('calendar.status')}</span>
            {isHoliday
              ? `${t('calendar.closed_for')} ${isHoliday}.`
              : !selectedDayEvents.includes(t('calendar.general_admission'))
                ? t('calendar.typically_closed') : t('calendar.open_today')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;