import React, { useState, useEffect, useRef, useCallback } from 'react';
import { loadGoogleMaps } from '../../utils/googleMapsLoader';
import { CurrentLocationButton } from './CurrentLocationButton';
import { LocationCoordinates } from '../../hooks/useCurrentLocation';
import { MapPin, Navigation, Loader2, X, Sparkles, Building2 } from 'lucide-react';

export interface PlaceSelection {
  formattedAddress: string;
  lat?: number;
  lng?: number;
  city?: string;
  placeId?: string;
}

interface PlacesAutocompleteInputProps {
  value: string;
  onChange: (value: string, coords?: LocationCoordinates) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  isPickup?: boolean;
  iconColor?: 'emerald' | 'rose' | 'blue' | 'slate';
  className?: string;
  inputClassName?: string;
  onSelectPlace?: (place: PlaceSelection) => void;
}

interface SuggestionItem {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  isHub?: boolean;
}

// Major Commercial Logistics Hubs & Industrial Freight Corridors in India
const POPULAR_LOGISTICS_HUBS: SuggestionItem[] = [
  { placeId: 'hub_sanand', mainText: 'Sanand GIDC Industrial Park', secondaryText: 'Ahmedabad, Gujarat', fullText: 'Sanand GIDC, Ahmedabad, Gujarat, India', isHub: true },
  { placeId: 'hub_jnpt', mainText: 'JNPT Port (Nhava Sheva)', secondaryText: 'Navi Mumbai, Maharashtra', fullText: 'Jawaharlal Nehru Port Trust (JNPT), Navi Mumbai, Maharashtra, India', isHub: true },
  { placeId: 'hub_bhiwandi', mainText: 'Bhiwandi Warehousing Hub', secondaryText: 'Thane, Maharashtra', fullText: 'Bhiwandi Logistics Hub, Thane, Maharashtra, India', isHub: true },
  { placeId: 'hub_hazira', mainText: 'Hazira Industrial Corridor', secondaryText: 'Surat, Gujarat', fullText: 'Hazira Port & Industrial Estate, Surat, Gujarat, India', isHub: true },
  { placeId: 'hub_morbi', mainText: 'Morbi Ceramic Industrial Zone', secondaryText: 'Morbi, Gujarat', fullText: 'Morbi Ceramic Cluster, Morbi, Gujarat, India', isHub: true },
  { placeId: 'hub_mundra', mainText: 'Mundra Port Logistics SEZ', secondaryText: 'Kutch, Gujarat', fullText: 'APSEZ Mundra Port, Kutch, Gujarat, India', isHub: true },
  { placeId: 'hub_halol', mainText: 'Halol GIDC Automobile Zone', secondaryText: 'Panchmahal, Vadodara, Gujarat', fullText: 'Halol GIDC, Vadodara Region, Gujarat, India', isHub: true },
  { placeId: 'hub_delhi', mainText: 'Okhla & Kundli Logistics Belt', secondaryText: 'Delhi NCR', fullText: 'Kundli Industrial Belt, Delhi NCR, India', isHub: true }
];

export const PlacesAutocompleteInput: React.FC<PlacesAutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter city, industrial hub, port or area...',
  label,
  required = false,
  isPickup = false,
  iconColor = isPickup ? 'emerald' : 'rose',
  className = '',
  inputClassName = '',
  onSelectPlace
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceReady, setServiceReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const dummyElementRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Initialize Google Maps Places Autocomplete Service
  useEffect(() => {
    let isMounted = true;
    loadGoogleMaps()
      .then((maps) => {
        if (!isMounted || !maps) return;
        try {
          if (maps.places) {
            autocompleteServiceRef.current = new maps.places.AutocompleteService();
            if (dummyElementRef.current) {
              placesServiceRef.current = new maps.places.PlacesService(dummyElementRef.current);
            }
          }
          geocoderRef.current = new maps.Geocoder();
          setServiceReady(true);
        } catch (err) {
          console.warn('Error initializing Google Maps Places services:', err);
        }
      })
      .catch((err) => {
        console.warn('Google Maps script init warning:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Place Predictions from Google Places API
  const fetchPredictions = useCallback((query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      // If query is short, show relevant transport hubs
      setSuggestions(POPULAR_LOGISTICS_HUBS.slice(0, 4));
      return;
    }

    // Filter local popular hubs
    const matchingHubs = POPULAR_LOGISTICS_HUBS.filter(h => 
      h.mainText.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      h.secondaryText.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      h.fullText.toLowerCase().includes(cleanQuery.toLowerCase())
    );

    if (autocompleteServiceRef.current) {
      setIsLoading(true);
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: cleanQuery,
          componentRestrictions: { country: 'in' },
          types: ['geocode', 'establishment']
        },
        (predictions, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            const mappedGoogle: SuggestionItem[] = predictions.map(p => ({
              placeId: p.place_id,
              mainText: p.structured_formatting?.main_text || p.description,
              secondaryText: p.structured_formatting?.secondary_text || '',
              fullText: p.description
            }));

            // Combine Google Places results with matching freight hubs
            const combined = [...matchingHubs, ...mappedGoogle];
            // Deduplicate
            const unique = Array.from(new Map(combined.map(item => [item.placeId, item])).values());
            setSuggestions(unique.slice(0, 7));
          } else {
            // Fallback to matching commercial hubs
            setSuggestions(matchingHubs);
          }
        }
      );
    } else {
      setSuggestions(matchingHubs);
    }
  }, []);

  // Handle Input typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
    fetchPredictions(val);
  };

  // Handle selection of suggestion
  const handleSelectSuggestion = (suggestion: SuggestionItem) => {
    const address = suggestion.fullText || suggestion.mainText;
    setInputValue(address);
    setIsOpen(false);

    // Geocode to get coordinates for route calculation
    if (geocoderRef.current && suggestion.placeId && !suggestion.isHub) {
      geocoderRef.current.geocode({ placeId: suggestion.placeId }, (results, status) => {
        if (status === 'OK' && results && results[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          const coords = { lat: loc.lat(), lng: loc.lng() };
          onChange(address, coords);
          if (onSelectPlace) {
            onSelectPlace({
              formattedAddress: address,
              lat: coords.lat,
              lng: coords.lng,
              placeId: suggestion.placeId
            });
          }
          return;
        }
        onChange(address);
        if (onSelectPlace) onSelectPlace({ formattedAddress: address });
      });
    } else {
      onChange(address);
      if (onSelectPlace) onSelectPlace({ formattedAddress: address });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPinColor = () => {
    if (iconColor === 'emerald') return 'text-emerald-600';
    if (iconColor === 'rose') return 'text-rose-600';
    if (iconColor === 'blue') return 'text-blue-600';
    return 'text-slate-500';
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden dummy div for PlacesService */}
      <div ref={dummyElementRef} className="hidden" />

      {/* Label & Current Location Header */}
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>

          {isPickup && (
            <CurrentLocationButton
              onLocationSelect={(addr, coords) => {
                setInputValue(addr);
                onChange(addr, coords);
                if (onSelectPlace) {
                  onSelectPlace({
                    formattedAddress: addr,
                    lat: coords?.lat,
                    lng: coords?.lng
                  });
                }
              }}
            />
          )}
        </div>
      )}

      {/* Input Field with Pin and Autocomplete state */}
      <div className="relative">
        <MapPin className={`w-4 h-4 ${getPinColor()} absolute left-3 top-3 pointer-events-none`} />

        <input
          type="text"
          required={required}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            if (suggestions.length === 0) fetchPredictions(inputValue);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${inputClassName}`}
        />

        {/* Clear Button or Spinner */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
          ) : inputValue ? (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                onChange('');
                setIsOpen(false);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Autocomplete Suggestions Floating Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" /> Google Places &amp; Freight Hubs
            </span>
            <span className="text-[9px] text-slate-400 font-normal">Select to autofill</span>
          </div>

          {suggestions.map((item) => (
            <button
              key={item.placeId}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full text-left p-3 hover:bg-blue-50/70 transition flex items-start gap-2.5 group"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 transition shrink-0 mt-0.5">
                {item.isHub ? (
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                  {item.mainText}
                </p>
                {item.secondaryText && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.secondaryText}
                  </p>
                )}
              </div>

              {item.isHub && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0 self-center">
                  Freight Hub
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
