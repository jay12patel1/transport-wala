import { useState, useCallback } from 'react';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface GeocodeResult {
  formattedAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  coords: LocationCoordinates;
}

export interface UseCurrentLocationResult {
  isLoading: boolean;
  error: string | null;
  coords: LocationCoordinates | null;
  formattedAddress: string | null;
  getCurrentLocation: () => Promise<GeocodeResult | null>;
  clearError: () => void;
}

/**
 * Custom React hook that accesses user GPS coordinates via browser Geolocation API
 * and converts them into a readable street/city address using the Google Geocoding API.
 */
export function useCurrentLocation(): UseCurrentLocationResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reverse-geocodes (lat, lng) coordinates using Google Geocoding API.
   * Gracefully handles CORS, network restrictions, and parses formatted address & city.
   */
  const reverseGeocode = async (lat: number, lng: number): Promise<GeocodeResult> => {
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAwEHuTJMZkuebmNbYFk5uXu20WATj5RWY';

    let address = '';
    let city = '';
    let state = '';
    let pincode = '';

    // 1. Primary: Direct Google Geocoding REST API
    try {
      const googleGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const response = await fetch(googleGeocodeUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
          const first = data.results[0];
          address = first.formatted_address;

          // Parse address components for city and state
          if (Array.isArray(first.address_components)) {
            first.address_components.forEach((comp: any) => {
              const types = comp.types || [];
              if (types.includes('locality')) city = comp.long_name;
              else if (!city && types.includes('administrative_area_level_2')) city = comp.long_name;
              else if (!city && types.includes('sublocality')) city = comp.long_name;

              if (types.includes('administrative_area_level_1')) state = comp.long_name;
              if (types.includes('postal_code')) pincode = comp.long_name;
            });
          }

          if (address) {
            return {
              formattedAddress: address,
              city: city || 'Ahmedabad',
              state: state || 'Gujarat',
              pincode,
              coords: { lat, lng }
            };
          }
        }
      }
    } catch (err: any) {
      console.warn('Google Geocoding REST API fetch error, checking alternative:', err?.message || err);
    }

    // 2. Fallback: Google Maps JavaScript SDK Geocoder if loaded in window
    if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
      try {
        const geocoder = new (window as any).google.maps.Geocoder();
        const res: any = await new Promise((resolve, reject) => {
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error(status || 'Geocoder failed'));
            }
          });
        });

        if (res && res.formatted_address) {
          return {
            formattedAddress: res.formatted_address,
            coords: { lat, lng }
          };
        }
      } catch (sdkErr) {
        console.warn('Google Maps JS Geocoder fallback notice:', sdkErr);
      }
    }

    // 3. Fallback: OpenStreetMap Nominatim reverse geocode (CORS-friendly for web sandbox)
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const osmRes = await fetch(osmUrl, {
        headers: { 'Accept': 'application/json' }
      });
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (osmData?.display_name) {
          const osmAddr = osmData.address || {};
          const osmCity = osmAddr.city || osmAddr.town || osmAddr.county || osmAddr.state_district || 'Ahmedabad';
          const osmState = osmAddr.state || 'Gujarat';

          return {
            formattedAddress: osmData.display_name,
            city: osmCity,
            state: osmState,
            coords: { lat, lng }
          };
        }
      }
    } catch (osmErr) {
      console.warn('Fallback geocoding notice:', osmErr);
    }

    // 4. Default clean fallback coordinate representation
    const fallbackText = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (Current Location)`;
    return {
      formattedAddress: fallbackText,
      city: 'Gujarat',
      coords: { lat, lng }
    };
  };

  /**
   * Triggers browser geolocation request and updates state with formatted address
   */
  const getCurrentLocation = useCallback(async (): Promise<GeocodeResult | null> => {
    setError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser.';
      setError(errMsg);
      return null;
    }

    setIsLoading(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setCoords({ lat: latitude, lng: longitude, accuracy });

          try {
            const geocodeResult = await reverseGeocode(latitude, longitude);
            setFormattedAddress(geocodeResult.formattedAddress);
            setIsLoading(false);
            resolve(geocodeResult);
          } catch (geoErr: any) {
            console.error('Reverse geocoding error:', geoErr);
            const fallbackAddr = `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            setFormattedAddress(fallbackAddr);
            setIsLoading(false);
            resolve({
              formattedAddress: fallbackAddr,
              coords: { lat: latitude, lng: longitude, accuracy }
            });
          }
        },
        (geoError) => {
          setIsLoading(false);
          let message = 'Unable to retrieve your current location.';

          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              message = 'Location access was denied. Please allow GPS permissions in your browser.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              message = 'GPS location information is currently unavailable. Please verify network or device sensors.';
              break;
            case geoError.TIMEOUT:
              message = 'Location request timed out. Please try again.';
              break;
            default:
              message = geoError.message || message;
              break;
          }

          console.warn('Geolocation error:', message);
          setError(message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }, []);

  return {
    isLoading,
    error,
    coords,
    formattedAddress,
    getCurrentLocation,
    clearError
  };
}
