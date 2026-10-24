/**
 * Safe Google Maps JavaScript API Loader with Places & Geocoding libraries.
 * Ensures the script is only loaded once and returns a Promise when window.google.maps is ready.
 */

let googleMapsPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not defined'));
  }

  // Already loaded and ready
  if ((window as any).google?.maps?.places) {
    return Promise.resolve((window as any).google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    
    if (existingScript) {
      const interval = setInterval(() => {
        if ((window as any).google?.maps?.places) {
          clearInterval(interval);
          resolve((window as any).google.maps);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        if ((window as any).google?.maps?.places) {
          resolve((window as any).google.maps);
        } else {
          // If script tag failed or timed out, resolve gracefully with whatever is available
          resolve((window as any).google?.maps || null);
        }
      }, 8000);
      return;
    }

    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAwEHuTJMZkuebmNbYFk5uXu20WATj5RWY';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((window as any).google?.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps SDK loaded but window.google.maps is unavailable'));
      }
    };

    script.onerror = (err) => {
      console.warn('Failed to load Google Maps JS script from Google CDN:', err);
      // Gracefully resolve so app can fall back to local Indian transport hub predictions
      resolve(null as any);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
