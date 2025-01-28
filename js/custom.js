// Ensure the script runs only after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  let deferredPrompt; // Variable to store the beforeinstallprompt event
  const isPwaInstalled = localStorage.getItem('pwaInstalled'); // Check if the PWA is already installed

  if (!isPwaInstalled) {
    // Inject the PWA popup HTML dynamically
    if (!document.getElementById('pwa-popup')) {
      const popupHTML = `
        <div id="pwa-popup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); color: #333; text-align: center; z-index: 1000; display: flex; align-items: center; justify-content: center;">
          <div style="padding: 25px; background: #f5f5f5; border-radius: 20px; width: 90%; max-width: 450px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); text-align: center;">
            <h2 style="font-size: 22px; margin-bottom: 15px; color: #2c3e50;">Install Our App! 👋</h2>
            <p style="font-size: 16px; color: #444; margin-bottom: 25px; font-weight: bold; color: #ff7f50;">
              Don't miss out - add our app to your home screen!
            </p>
            <button id="install-button" style="padding: 12px 28px; font-size: 18px; cursor: pointer; background: linear-gradient(135deg, #26616a, #184a52); color: white; border: none; border-radius: 30px; margin-right: 10px; transition: all 0.3s ease;">
              Install App
            </button>
            <button id="close-popup" style="padding: 12px 28px; font-size: 18px; cursor: pointer; background-color: transparent; color: #888; border: none; border-radius: 30px; transition: color 0.3s ease;">
              Maybe Later
            </button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    // Reference the popup and buttons
    const popup = document.getElementById('pwa-popup');
    const installButton = document.getElementById('install-button');
    const closePopupButton = document.getElementById('close-popup');

    // Listen for the 'beforeinstallprompt' event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // Prevent the default browser prompt
      deferredPrompt = e; // Store the event for later use
      popup.style.display = 'flex'; // Show the popup
    });

    // Handle the install button click
    installButton.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt(); // Show the browser install prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
            localStorage.setItem('pwaInstalled', 'true'); // Save the installation status
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null; // Reset the deferred prompt
          popup.style.display = 'none'; // Hide the popup
        });
      }
    });

    // Handle the close popup button click
    closePopupButton.addEventListener('click', () => {
      popup.style.display = 'none'; // Hide the popup
    });

    // Listen for the 'appinstalled' event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      localStorage.setItem('pwaInstalled', 'true'); // Save the installation status
      popup.style.display = 'none'; // Hide the popup
    });
  }
});

// Service Worker Registration (ensure it’s registered for all pages)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}
