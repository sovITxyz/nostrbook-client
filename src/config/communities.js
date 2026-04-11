/**
 * Community theme definitions.
 *
 * Each community can override:
 *   - colors: primary, primaryDark, secondary, secondaryDark, accent (optional tertiary)
 *   - logo:   horizontalWhite, horizontalDark, icon  (imported SVG paths)
 *   - fonts:  sans, display  (CSS font-stack strings — the font files must be loaded elsewhere)
 *   - relay:  the community's private relay URL (if different from the global default)
 *   - nav:    darkBg colour used for navbar / mobile-bottom-nav in dark mode
 *
 * The "nostrbook" entry is the platform default and is never stored as an
 * "active community" — it's what users see when they are NOT inside a community.
 */

// ── Nostrbook (platform default) ────────────────────────────────────────────
import nbHorizWhite from '../assets/nostrbook-horizontal-white.svg';
import nbHorizDark  from '../assets/nostrbook-horizontal-dark.svg';
import nbIcon       from '../assets/nostrbook-icon.svg';

// ── BIES community ──────────────────────────────────────────────────────────
import biesHorizWhite from '../assets/logo-horizontal-white.svg';
import biesHorizDark  from '../assets/logo-horizontal-dark.svg';
import biesIcon       from '../assets/logo-icon-dark.svg';

export const NOSTRBOOK_DEFAULTS = {
    id: 'nostrbook',
    name: 'Nostrbook',
    tagline: 'Your launchpad for productive communities',
    colors: {
        primary: '#4F46E5',
        primaryDark: '#4338CA',
        secondary: '#F59E0B',
        secondaryDark: '#D97706',
        accent: '#059669',
        navDarkBg: '#1e1b4b',      // dark-mode navbar
    },
    logo: {
        horizontalWhite: nbHorizWhite,
        horizontalDark: nbHorizDark,
        icon: nbIcon,
    },
    fonts: null,  // uses the CSS defaults (Inter + PP Formula Narrow)
};

export const COMMUNITIES = [
    {
        id: 'bies',
        slug: 'bies',
        name: 'Build in El Salvador',
        tagline: 'The builder community for El Salvador\'s tech ecosystem',
        description: 'Connect with builders, investors, and educators in El Salvador\'s growing tech and Bitcoin ecosystem. Share projects, attend events, and collaborate with the community.',
        memberCount: null,   // populated at runtime from API
        logo: {
            horizontalWhite: biesHorizWhite,
            horizontalDark: biesHorizDark,
            icon: biesIcon,
        },
        colors: {
            primary: '#0047AB',
            primaryDark: '#003682',
            secondary: '#FF5B00',
            secondaryDark: '#CC4A00',
            accent: null,
            navDarkBg: '#00004E',
        },
        fonts: null,  // same as platform default
        coverImage: null,    // optional hero image
    },
];

/**
 * Look up a community by its slug (URL-safe id).
 */
export function getCommunityBySlug(slug) {
    return COMMUNITIES.find(c => c.slug === slug) || null;
}
