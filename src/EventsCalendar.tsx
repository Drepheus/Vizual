import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './EventsCalendar.css';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'challenge' | 'workshop' | 'launch' | 'showcase';
  description: string;
  time: string;
  location: string;
}

const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: 'AI Art Challenge: Cyberpunk',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    type: 'challenge',
    description: 'Create the most stunning cyberpunk cityscape using Vizual Media Studio. Top 3 winners get 1000 credits.',
    time: '10:00 AM - 11:59 PM PST',
    location: 'Vizual Community Discord'
  },
  {
    id: '2',
    title: 'Prompt Engineering Workshop',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22),
    type: 'workshop',
    description: 'Master the art of prompting with our lead AI researchers. Learn advanced techniques for consistent character generation.',
    time: '2:00 PM - 4:00 PM PST',
    location: 'Live Stream'
  },
  {
    id: '3',
    title: 'Vizual v2.5 Feature Launch',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
    type: 'launch',
    description: 'Unveiling the new video generation capabilities and enhanced voice models. Don\'t miss the keynote.',
    time: '9:00 AM PST',
    location: 'YouTube Premiere'
  },
  {
    id: '4',
    title: 'Community Showcase',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    type: 'showcase',
    description: 'Highlighting the best community creations from the past month. Get inspired by fellow creators.',
    time: '1:00 PM PST',
    location: 'Gallery Page'
  }
];

const EventsCalendar: React.FC = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, currentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    return SAMPLE_EVENTS.filter(e => 
      e.date.getDate() === day && 
      e.date.getMonth() === currentDate.getMonth() &&
      e.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'challenge': return '#f59e0b';
      case 'workshop': return '#3b82f6';
      case 'launch': return '#8b5cf6';
      case 'showcase': return '#22c55e';
      default: return '#fff';
    }
  };

  return (
    <div className="events-calendar-page">
      <button onClick={() => router.push('/media-studio')} className="calendar-back-btn">
        ← Back
      </button>

      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-title">
            <h1>Events & Schedule</h1>
          </div>
          <div className="calendar-controls">
            <button onClick={handlePrevMonth} className="month-nav-btn">
              <ChevronLeft size={20} />
            </button>
            <div className="current-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button onClick={handleNextMonth} className="month-nav-btn">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          
          {days.map((dayObj, index) => {
            if (!dayObj.currentMonth) {
              return <div key={`prev-${index}`} className="calendar-day other-month" />;
            }

            const isToday = 
              dayObj.day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear();

            const dayEvents = getEventsForDay(dayObj.day);

            return (
              <div 
                key={dayObj.day} 
                className={`calendar-day ${isToday ? 'today' : ''}`}
                onMouseEnter={(e) => {
                  setHoveredDay(dayObj.day);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePos({ x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="day-number">{dayObj.day}</div>
                <div className="day-events">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={`event-pill ${event.type}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Tooltip */}
      <AnimatePresence>
        {hoveredDay && getEventsForDay(hoveredDay).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 100,
              pointerEvents: 'none'
            }}
            className="calendar-tooltip"
          >
            <div className="tooltip-content">
              <div className="tooltip-header">
                <span className="tooltip-date">
                  {monthNames[currentDate.getMonth()]} {hoveredDay}
                </span>
                <span className="tooltip-count">
                  {getEventsForDay(hoveredDay).length} Event{getEventsForDay(hoveredDay).length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="tooltip-events">
                {getEventsForDay(hoveredDay).map(event => (
                  <div key={event.id} className="tooltip-event-item">
                    <div className="tooltip-event-indicator" style={{ background: getTypeColor(event.type) }} />
                    <div className="tooltip-event-info">
                      <span className="tooltip-event-title">{event.title}</span>
                      <span className="tooltip-event-time">{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <button className="event-modal-close" onClick={() => setSelectedEvent(null)}>
              <X size={24} />
            </button>
            
            <span 
              className="event-modal-tag"
              style={{ 
                background: `${getTypeColor(selectedEvent.type)}20`, 
                color: getTypeColor(selectedEvent.type),
                border: `1px solid ${getTypeColor(selectedEvent.type)}40`
              }}
            >
              {selectedEvent.type.toUpperCase()}
            </span>

            <h2>{selectedEvent.title}</h2>
            
            <div className="event-modal-time">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} />
                {selectedEvent.date.toLocaleDateString()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                {selectedEvent.time}
              </div>
            </div>

            <div className="event-modal-desc">
              {selectedEvent.description}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', color: '#888' }}>
              <MapPin size={16} />
              {selectedEvent.location}
            </div>

            <button 
              className="event-modal-btn"
              style={{ 
                background: getTypeColor(selectedEvent.type),
                color: '#fff'
              }}
            >
              Add to Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
