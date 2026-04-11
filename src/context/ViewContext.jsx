import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
    const [defaultView, setDefaultView] = useState(() => {
        return localStorage.getItem('nb_default_view') || 'list';
    });

    useEffect(() => {
        localStorage.setItem('nb_default_view', defaultView);
    }, [defaultView]);

    return (
        <ViewContext.Provider value={{ defaultView, setDefaultView }}>
            {children}
        </ViewContext.Provider>
    );
};

export const useViewPreference = () => useContext(ViewContext);
