import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../App.css'; // Add your Tailwind styles here

const localizer = momentLocalizer(moment);

const MyBigCalendar = () => {
    const loadEventsFromLocalStorage = () => {
        const savedEvents = localStorage.getItem('calendarEvents');
        return savedEvents ? JSON.parse(savedEvents) : [
            {
                id: 0,
                title: 'Team Meeting',
                start: new Date(2024, 11, 25, 10, 0),
                end: new Date(2024, 11, 25, 11, 0),
            },
            {
                id: 1,
                title: 'Project Deadline',
                start: new Date(2024, 11, 26, 15, 0),
                end: new Date(2024, 11, 26, 16, 0),
            },
        ];
    };

    const [events, setEvents] = useState(loadEventsFromLocalStorage());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', start: null, end: null });

    useEffect(() => {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }, [events]);

    const handleSelectSlot = ({ start, end }) => {
        setNewEvent({ ...newEvent, start, end });
        setIsModalOpen(true);
    };

    const handleSaveEvent = () => {
        if (newEvent.title.trim() === '') {
            alert('Event title cannot be empty.');
            return;
        }
        const eventToAdd = { id: events.length, ...newEvent };
        setEvents((prevEvents) => [...prevEvents, eventToAdd]);
        setIsModalOpen(false);
        setNewEvent({ title: '', start: null, end: null });
    };

    const handleSelectEvent = (event) => {
        const confirmDelete = window.confirm(`Delete event "${event.title}"?`);
        if (confirmDelete) {
            setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));
        }
    };
    const eventStyleGetter = (event) => {
        const backgroundColor = event.title.includes('Meeting') ? '#EF4444' : '#3B82F6'; // Tailwind colors
        const textColor = 'white'; // Text color
        const borderRadius = '4px';
        const padding = '2px 8px';
    
        return {
            style: {
                backgroundColor,
                color: textColor,
                borderRadius,
                padding,
                transition: 'all 0.3s ease',
            },
        };
    };
    
    

    return (
        <div style={{ height: '500px', margin: '20px' }}  >
            <h2 className="text-2xl font-bold w-40 m-auto font-serif " >Calendar</h2>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                messages={{
                    noEventsInRange: 'No events in this range, feel free to add one!',
                }}
                style={{ height: 750,  }}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4 text-gray-400 ">Add New Event</h3>
                        <input
                            type="text"
                            placeholder="Event Title"
                            className="border outline-none dark:bg-gray-600 p-2 w-full rounded-md mb-4 "
                            value={newEvent.title}
                            autoFocus
                            onKeyDown={(e)=> {if(e.key === "Enter") e.preventDefault(), handleSaveEvent()}}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, title: e.target.value })
                            }
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-purple-400 dark:bg-gradient-to-r from-blue-700  to-purple-700 text-white rounded-md"
                                onClick={handleSaveEvent}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBigCalendar;
