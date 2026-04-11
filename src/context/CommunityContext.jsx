import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NOSTRBOOK_DEFAULTS } from '../config/communities';

const CommunityContext = createContext();

/**
 * Apply a community's colour palette to the document root as CSS custom properties.
 * When `community` is null the Nostrbook platform defaults are restored.
 */
function applyThemeVars(community) {
    const root = document.documentElement;
    const colors = community ? community.colors : NOSTRBOOK_DEFAULTS.colors;

    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-secondary-dark', colors.secondaryDark);

    if (colors.navDarkBg) {
        root.style.setProperty('--color-primary-nav', colors.navDarkBg);
    } else {
        root.style.removeProperty('--color-primary-nav');
    }

    // Community-specific accent (tertiary) colour
    if (colors.accent) {
        root.style.setProperty('--color-accent', colors.accent);
    } else {
        root.style.removeProperty('--color-accent');
    }

    // Update tinted backgrounds to match the new primary
    const hex = colors.primary;
    root.style.setProperty('--color-blue-tint', hexToTint(hex, 0.08));
}

/** Convert a hex colour to a very light tint (for backgrounds). */
function hexToTint(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const CommunityProvider = ({ children }) => {
    const [activeCommunity, setActiveCommunityState] = useState(() => {
        // Restore from sessionStorage so a page refresh stays inside the community
        const saved = sessionStorage.getItem('nb_active_community');
        if (saved) {
            try { return JSON.parse(saved); } catch { /* ignore */ }
        }
        return null;
    });

    // Persist to sessionStorage
    useEffect(() => {
        if (activeCommunity) {
            sessionStorage.setItem('nb_active_community', JSON.stringify(activeCommunity));
        } else {
            sessionStorage.removeItem('nb_active_community');
        }
        applyThemeVars(activeCommunity);
    }, [activeCommunity]);

    // Apply Nostrbook defaults on first mount when no community is active
    useEffect(() => {
        if (!activeCommunity) applyThemeVars(null);
    }, []);

    const enterCommunity = useCallback((community) => {
        setActiveCommunityState(community);
    }, []);

    const exitCommunity = useCallback(() => {
        setActiveCommunityState(null);
    }, []);

    // Resolve the current logo set (community override or Nostrbook default)
    const logo = activeCommunity?.logo || NOSTRBOOK_DEFAULTS.logo;
    const communityName = activeCommunity?.name || NOSTRBOOK_DEFAULTS.name;

    return (
        <CommunityContext.Provider value={{
            activeCommunity,
            enterCommunity,
            exitCommunity,
            logo,
            communityName,
            isInCommunity: !!activeCommunity,
        }}>
            {children}
        </CommunityContext.Provider>
    );
};

export const useCommunity = () => useContext(CommunityContext);
