import React from 'react';
import { useCurrentLocation, LocationCoordinates } from '../../hooks/useCurrentLocation';
import { LocateFixed, Loader2, AlertCircle } from 'lucide-react';

interface CurrentLocationButtonProps {
  onLocationSelect: (address: string, coords?: LocationCoordinates) => void;
  className?: string;
  variant?: 'compact' | 'inline' | 'button';
  title?: string;
}

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onLocationSelect,
  className = '',
  variant = 'compact',
  title = 'Use Current Location'
}) => {
  const { isLoading, error, getCurrentLocation, clearError } = useCurrentLocation();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await getCurrentLocation();
    if (result && result.formattedAddress) {
      onLocationSelect(result.formattedAddress, result.coords);
    }
  };

  if (variant === 'button') {
    return (
      <div className="relative inline-flex flex-col">
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          title={title}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            isLoading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm active:scale-95'
          } ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>{isLoading ? 'Detecting GPS...' : 'Use Current Location'}</span>
        </button>

        {error && (
          <div className="absolute top-full left-0 mt-1 z-30 max-w-xs p-2 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] rounded-lg shadow-lg flex items-start gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              <button 
                type="button" 
                onClick={clearError} 
                className="ml-1 font-bold underline text-rose-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact variant: fits perfectly inside input or next to label
  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        title={title}
        aria-label={title}
        className={`p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition flex items-center gap-1 text-[11px] font-bold ${
          isLoading ? 'opacity-70 cursor-wait' : ''
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
        ) : (
          <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
        )}
        <span className="hidden sm:inline">Use GPS</span>
      </button>

      {error && (
        <div className="absolute right-0 top-full mt-1 z-30 w-56 p-2 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] rounded-lg shadow-lg flex items-start gap-1">
          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            <button 
              type="button" 
              onClick={clearError} 
              className="ml-1 font-bold underline text-rose-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
