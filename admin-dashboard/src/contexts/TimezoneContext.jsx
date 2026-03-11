import React, { createContext, useContext, useState, useEffect } from 'react';

const TimezoneContext = createContext();

export const TimezoneProvider = ({ children }) => {
    const [timezone, setTimezone] = useState(localStorage.getItem('dashboard_timezone') || 'UTC+5:30');

    useEffect(() => {
        localStorage.setItem('dashboard_timezone', timezone);
    }, [timezone]);

    const formatInTimezone = (date, includeDate = true) => {
        const d = new Date(date);
        
        // Extract offset (e.g., "+5:30" or "-8:00")
        const match = timezone.match(/UTC([+-]\d+):(\d+)/);
        let offsetMinutes = 0;
        
        if (match) {
            const h = parseInt(match[1]);
            const m = parseInt(match[2]);
            offsetMinutes = (h * 60) + (h >= 0 ? m : -m);
        }

        // Adjust for target timezone
        // getTimezoneOffset returns minutes from UTC (positive for west of UTC, negative for east)
        // We want to add the target offset and subtract the local one to get the target time.
        const localOffset = d.getTimezoneOffset(); // e.g., -330 for UTC+5:30
        const targetTime = new Date(d.getTime() + (offsetMinutes + localOffset) * 60000);

        const timeStr = targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = targetTime.toLocaleDateString();

        if (includeDate) return `${dateStr} ${timeStr}`;
        return timeStr;
    };

    return (
        <TimezoneContext.Provider value={{ timezone, setTimezone, formatInTimezone }}>
            {children}
        </TimezoneContext.Provider>
    );
};

export const useTimezone = () => {
    const context = useContext(TimezoneContext);
    if (!context) throw new Error('useTimezone must be used within a TimezoneProvider');
    return context;
};
