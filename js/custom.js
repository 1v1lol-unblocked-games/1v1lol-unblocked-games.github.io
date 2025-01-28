document.addEventListener('DOMContentLoaded', () => {
  let deferredPrompt; // Store the 'beforeinstallprompt' event
  const isPwaInstalled = localStorage.getItem('pwaInstalled'); // Check if PWA is already installed

  if (!isPwaInstalled) {
    // Dynamically add the PWA popup HTML
    if (!document.getElementById('pwa-popup')) {
      const popupHTML = `
        <div id="pwa-popup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;">
          <div style="padding: 25px; background: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 90%;">
            <h2>Install Our App</h2>
            <p>Get quick access to our app from your home screen.</p>
            <button id="install-button" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Install</button>
            <button id="close-popup" style="padding: 10px 20px; background: #f5f5f5; color: #333; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

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
        deferredPrompt.prompt(); // Show the browser's installation prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the installation');
            localStorage.setItem('pwaInstalled', 'true'); // Mark as installed
          } else {
            console.log('User dismissed the installation');
          }
          deferredPrompt = null; // Clear the deferred prompt
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
      localStorage.setItem('pwaInstalled', 'true'); // Mark as installed
      popup.style.display = 'none'; // Hide the popup
    });
  }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}
