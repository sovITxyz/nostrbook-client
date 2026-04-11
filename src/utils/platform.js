/**
 * Platform detection utilities for multi-platform deployment.
 * Used to gate features per platform (e.g., Lightning on iOS).
 */

export const isIOS = () => {
  // Check for iPhone/iPad/iPod OR iPad on iOS 13+ (reports as MacIntel with touch)
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

export const isAndroid = () => {
  // Check for Android in user agent
  return /Android/.test(navigator.userAgent);
};

export const isNative = () => {
  // Check if running inside Capacitor native shell
  // window.Capacitor?.isNativePlatform?.() when Capacitor is installed
  // Falls back to false for PWA/browser
  return window.Capacitor?.isNativePlatform?.() ?? false;
};

export const isIOSNative = () => isIOS() && isNative();
export const isAndroidNative = () => isAndroid() && isNative();
export const isDesktop = () => !isIOS() && !isAndroid();
export const isPWA = () => window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator?.standalone === true;

/**
 * Whether Lightning/Bitcoin payment features should be shown.
 * Returns false on iOS native builds (Apple App Store restriction).
 * Returns true everywhere else (Android, desktop, PWA, browser).
 */
export const canShowLightning = () => !isIOSNative();
