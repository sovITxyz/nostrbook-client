import React, { createContext, useContext, useState, useCallback } from 'react';

const UserModeContext = createContext(null);

export function UserModeProvider({ children }) {
    const [mode, setMode] = useState(null);
    const selectMode = useCallback((m) => setMode(m), []);
    const clearMode = useCallback(() => setMode(null), []);
    return (
        <UserModeContext.Provider value={{ mode, selectMode, clearMode }}>
            {children}
        </UserModeContext.Provider>
    );
}

export function useUserMode() {
    const ctx = useContext(UserModeContext);
    if (!ctx) return { mode: null, selectMode: () => {}, clearMode: () => {} };
    return ctx;
}
