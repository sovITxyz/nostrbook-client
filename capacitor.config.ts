import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'app.nostrbook.client',
    appName: 'Nostrbook',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
    },
    plugins: {
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert'],
        },
        SplashScreen: {
            launchAutoHide: false,
            showSpinner: false,
        },
        StatusBar: {
            style: 'default',
        },
    },
};

export default config;
