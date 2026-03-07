// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Handle "Add to Home Screen" prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Install prompt available');
});

window.addEventListener('appinstalled', () => {
    console.log('App installed');
    deferredPrompt = null;
});
