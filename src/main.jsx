import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { isNative } from './utils/platform'

// Error Boundary for debugging white screen
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: '#0A192F', color: 'white', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Please try refreshing the page.</p>
                    <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 2rem', background: '#FF5B00', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                        Refresh
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Global error trap — log only, never show to users
window.onerror = function (message, source, lineno, colno, error) {
    console.error('[Global]', message, `${source}:${lineno}:${colno}`, error);
};

// Initialize Capacitor native plugins when running as a native app
async function initNative() {
    if (!isNative()) return;
    try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        const { StatusBar } = await import('@capacitor/status-bar');
        // Hide splash screen once React renders
        await SplashScreen.hide();
        // Match status bar to app theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
            (window.matchMedia?.('(prefers-color-scheme: dark)').matches &&
             localStorage.getItem('nb_theme') !== 'light');
        await StatusBar.setStyle({ style: isDark ? 'DARK' : 'LIGHT' });
    } catch (e) {
        // Plugins may not be available in all environments
        console.debug('[Native] Plugin init skipped:', e.message);
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)

// Run native init after render
initNative();
