import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primary_color') || '#2563eb');

    useEffect(() => {
        // Apply theme class
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        // Apply primary color as CSS variable
        document.documentElement.style.setProperty('--color-accent', primaryColor);
        
        // Generate a light version (15% opacity version of the color)
        const lightAccent = `${primaryColor}26`; // 15% opacity
        document.documentElement.style.setProperty('--color-accent-light', lightAccent);

        // Calculate luminance
        const hex = primaryColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // --color-accent-contrast: text ON a solid accent background (e.g. buttons)
        const contrastColor = luminance > 0.6 ? '#000000' : '#ffffff';
        document.documentElement.style.setProperty('--color-accent-contrast', contrastColor);

        // --color-accent-text: accent used AS text/icon on light bg — darken if color is too light
        let accentText = primaryColor;
        if (luminance > 0.7) {
            // Darken by blending with black at 60%
            const dr = Math.round(r * 0.4);
            const dg = Math.round(g * 0.4);
            const db = Math.round(b * 0.4);
            accentText = `#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`;
        }
        document.documentElement.style.setProperty('--color-accent-text', accentText);
        
        localStorage.setItem('primary_color', primaryColor);
    }, [primaryColor]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, primaryColor, setPrimaryColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
